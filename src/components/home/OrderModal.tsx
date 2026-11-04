import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ShoppingCart,
  CheckCircle2, AlertCircle, Loader2, Mail, Phone,
  ShieldCheck, ArrowRight, Upload, Trash2, Image as ImageIcon, FileText
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface UploadedDoc {
  file: File;
  type: string;
  preview: string | null;
  id: string;
}

interface FormData {
  email: string;
  phone: string;
  termsAccepted: boolean;
}

interface FieldError {
  [key: string]: string;
}

const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const id = Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
  return `MF-${year}-${id}`;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function OrderModal() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, getTotal, isOrderModalOpen, closeOrderModal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const currentLang = i18n.language.split('-')[0];

  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    termsAccepted: false,
  });

  const [idDoc, setIdDoc] = useState<UploadedDoc | null>(null);
  const [photoDoc, setPhotoDoc] = useState<UploadedDoc | null>(null);
  const [errors, setErrors] = useState<FieldError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const idInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill from profile
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        email: user?.email || prev.email,
        phone: profile.phone || prev.phone,
      }));
    }
  }, [profile, user]);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'photo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('order.doc_error.too_large'));
      return;
    }

    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    const doc: UploadedDoc = {
      file,
      type: type === 'id' ? 'id_passport' : 'photo_4x4',
      preview,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    };

    if (type === 'id') {
      if (idDoc?.preview) URL.revokeObjectURL(idDoc.preview);
      setIdDoc(doc);
    } else {
      if (photoDoc?.preview) URL.revokeObjectURL(photoDoc.preview);
      setPhotoDoc(doc);
    }

    // Clear error
    if (errors[type === 'id' ? 'idDoc' : 'photoDoc']) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[type === 'id' ? 'idDoc' : 'photoDoc'];
        return newErrors;
      });
    }
  };

  const removeDoc = (type: 'id' | 'photo') => {
    if (type === 'id') {
      if (idDoc?.preview) URL.revokeObjectURL(idDoc.preview);
      setIdDoc(null);
    } else {
      if (photoDoc?.preview) URL.revokeObjectURL(photoDoc.preview);
      setPhotoDoc(null);
    }
  };

  const validate = useCallback((): boolean => {
    const newErrors: FieldError = {};

    if (!formData.email.trim()) newErrors.email = t('order.error.required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('order.error.invalid_email');

    if (!formData.phone.trim()) newErrors.phone = t('order.error.required');
    else if (formData.phone.replace(/\D/g, '').length < 8) newErrors.phone = t('order.error.invalid_phone');

    if (!idDoc) newErrors.idDoc = t('order.error.required');
    if (!photoDoc) newErrors.photoDoc = t('order.error.required');

    if (!formData.termsAccepted) newErrors.termsAccepted = t('order.error.terms_required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, idDoc, photoDoc, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error(t('order.error.fix_errors'));
      return;
    }
    if (items.length === 0) {
      toast.error(t('order.error.cart_empty'));
      return;
    }

    setIsSubmitting(true);

    try {
      const newOrderNumber = generateOrderNumber();
      const total = getTotal();

      const orderPayload = {
        order_number: newOrderNumber,
        user_id: user?.id || null,
        status: 'pending',
        items: items.map(i => ({
          service_id: i.id,
          name: i.name,
          category: i.category,
          price: i.price,
        })),
        total_amount: total,
        customer_name: formData.email.split('@')[0], // Fallback since the field was removed from the UI
        customer_email: formData.email.trim(),
        customer_phone: formData.phone.trim(),
        payment_method: 'bank_transfer',
        language: currentLang,
      };

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select('id')
        .single();

      if (orderError) {
        console.error('Order insert error:', orderError);
        throw new Error(orderError.message);
      }

      const orderId = orderData.id;

      // Upload documents
      const documentUrls: { name: string; type: string; url: string; size: number }[] = [];
      const allDocs = [idDoc, photoDoc].filter(Boolean) as UploadedDoc[];

      for (const doc of allDocs) {
        const filePath = `orders/${orderId}/${Date.now()}_${doc.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('order-documents')
          .upload(filePath, doc.file, { cacheControl: '3600', upsert: false });

        if (!uploadError) {
          await supabase.from('order_documents').insert({
            order_id: orderId,
            document_type: doc.type,
            file_name: doc.file.name,
            file_path: filePath,
            file_size: doc.file.size,
            mime_type: doc.file.type,
          });

          const { data: urlData } = supabase.storage.from('order-documents').getPublicUrl(filePath);
          documentUrls.push({ name: doc.file.name, type: doc.type, url: urlData.publicUrl, size: doc.file.size });
        }
      }

      // Call Edge Function
      try {
        await supabase.functions.invoke('submit-order', {
          body: {
            orderNumber: newOrderNumber,
            orderId,
            customerEmail: formData.email.trim(),
            customerPhone: formData.phone.trim(),
            items: items.map(i => ({ name: i.name, category: i.category, price: i.price })),
            totalAmount: total,
            documents: documentUrls,
            language: currentLang,
          },
        });
      } catch (emailErr) {
        console.warn('Edge function call failed, order still saved:', emailErr);
      }

      setOrderNumber(newOrderNumber);
      setIsSuccess(true);
      clearCart();
      toast.success(t('order.success'));

    } catch (err: any) {
      console.error('Order submission error:', err);
      toast.error(t('order.error.submission_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSuccess) {
      setIsSuccess(false);
      setOrderNumber('');
      setIdDoc(null);
      setPhotoDoc(null);
      setFormData({
        email: user?.email || '',
        phone: profile?.phone || '',
        termsAccepted: false,
      });
    }
    closeOrderModal();
  };

  const handleContinue = () => {
    handleClose();
    navigate('/thank-you', { state: { fromOrder: true, orderNumber } });
  };

  if (!isOrderModalOpen) return null;

  const renderDocSlot = (
    doc: UploadedDoc | null,
    type: 'id' | 'photo',
    label: string,
    inputRef: React.RefObject<HTMLInputElement>,
    errorKey: string,
  ) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label} <span className="text-german-red">*</span></label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => handleFileSelect(e, type)}
      />
      {doc ? (
        <div className="flex items-center gap-2.5 p-2.5 bg-green-50 border border-green-200 rounded-xl">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {doc.preview ? (
              <img src={doc.preview} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{doc.file.name}</p>
            <p className="text-[10px] text-green-600 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              {(doc.file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeDoc(type)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full flex items-center gap-3 p-3 border-2 border-dashed rounded-xl text-left transition-all hover:border-german-red/40 hover:bg-german-red/[0.02] ${
            errors[errorKey] ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-gray-50/50'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-german-red/10 flex items-center justify-center flex-shrink-0">
            {type === 'id' ? <ImageIcon className="w-4 h-4 text-german-red" /> : <Upload className="w-4 h-4 text-german-red" />}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600">{t('order.click_to_upload')}</p>
            <p className="text-[10px] text-gray-400">JPG, PNG, PDF (max. 10 MB)</p>
          </div>
        </button>
      )}
      {errors[errorKey] && (
        <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
          <AlertCircle className="w-3 h-3" />
          {errors[errorKey]}
        </p>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-start justify-center overflow-y-auto py-6 sm:py-10 px-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[52rem] bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-german-black via-gray-900 to-german-black text-white px-5 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">{t('order.title')}</h2>
                <p className="text-[11px] text-gray-300">{t('order.subtitle')}</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State */}
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 sm:p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('order.success_title')}</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">{t('order.success_message')}</p>
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-gray-50 rounded-xl border border-gray-200 mb-8">
                <span className="text-sm text-gray-500">{t('order.order_number')}:</span>
                <span className="font-bold text-german-red text-lg">{orderNumber}</span>
              </div>
              <div className="space-y-2 text-sm text-gray-500 max-w-md mx-auto mb-8">
                <p className="flex items-center gap-2 justify-center">
                  <Mail className="w-4 h-4 text-german-red" />
                  {t('order.success_email_sent')}
                </p>
                <p className="flex items-center gap-2 justify-center">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  {t('order.success_processing')}
                </p>
              </div>
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-german-red text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
              >
                {t('common.continue') || 'Continue'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

                {/* LEFT COLUMN: Order Summary + Contact */}
                <div className="space-y-4">
                  {/* Order Summary */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="p-1.5 bg-german-red/10 rounded-lg">
                        <ShoppingCart className="w-3.5 h-3.5 text-german-red" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm">{t('order.summary')}</h3>
                    </div>
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-3.5 space-y-2">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-6 h-6 bg-german-red/10 rounded-md flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] font-black text-german-red">{item.category}</span>
                            </div>
                            <span className="text-[13px] text-gray-700 truncate">{item.name}</span>
                          </div>
                          <span className="text-[13px] font-bold text-gray-900 ml-3">{item.price.toLocaleString()}€</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">{t('order.total')}</span>
                        <span className="text-lg font-black text-german-red">{getTotal().toLocaleString()}€</span>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                      <Mail className="w-3 h-3 text-gray-400" />
                      {t('order.field.email')}
                      <span className="text-german-red">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder={t('order.placeholder.email')}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition-all focus:ring-2 focus:ring-german-red/20 focus:border-german-red ${
                        errors.email ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
                        <AlertCircle className="w-3 h-3" />{errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {t('order.field.phone')}
                      <span className="text-german-red">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+49 ..."
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition-all focus:ring-2 focus:ring-german-red/20 focus:border-german-red ${
                        errors.phone ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    />
                    {errors.phone && (
                      <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
                        <AlertCircle className="w-3 h-3" />{errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Documents + Terms + Submit */}
                <div className="space-y-4">
                  {/* Documents Section */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-900 text-sm">{t('order.required_documents')}</h3>

                    {/* ID Document */}
                    {renderDocSlot(idDoc, 'id', t('order.doc_id_label'), idInputRef as React.RefObject<HTMLInputElement>, 'idDoc')}

                    {/* 4x4 Photo */}
                    {renderDocSlot(photoDoc, 'photo', t('order.doc_photo_label'), photoInputRef as React.RefObject<HTMLInputElement>, 'photoDoc')}
                  </div>

                  {/* Terms */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={(e) => updateField('termsAccepted', e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-german-red focus:ring-german-red/20"
                      />
                      <span className="text-[11px] text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">
                        {t('order.terms_text')}
                      </span>
                    </label>
                    {errors.termsAccepted && (
                      <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 ml-7">
                        <AlertCircle className="w-3 h-3" />{errors.termsAccepted}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2.5 py-3 bg-gradient-to-r from-german-red via-red-600 to-german-red text-white font-bold text-sm rounded-xl hover:from-red-700 hover:via-red-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-german-red/20 hover:shadow-xl hover:shadow-german-red/30"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('order.submitting')}</span>
                        </>
                      ) : (
                        <span>{t('order.submit_order')}</span>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-gray-400 mt-2 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" />
                      {t('order.secure_notice')}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
