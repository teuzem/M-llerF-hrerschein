import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ShoppingCart, CreditCard, Building2, Bitcoin, Wallet,
  CheckCircle2, AlertCircle, Loader2, User, Mail, Phone,
  MapPin, Calendar, Globe, Send, ShieldCheck, Sparkles, ArrowRight
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { regions } from '../../lib/constants';
import DocumentDropzone, { UploadedDoc } from './DocumentDropzone';
import toast from 'react-hot-toast';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  postalCode: string;
  region: string;
  paymentMethod: string;
  notes: string;
  termsAccepted: boolean;
}

interface FieldError {
  [key: string]: string;
}

const PAYMENT_METHODS = [
  { value: 'bank_transfer', icon: Building2, labelKey: 'order.payment.bank_transfer' },
  { value: 'paypal', icon: Wallet, labelKey: 'order.payment.paypal' },
  { value: 'credit_card', icon: CreditCard, labelKey: 'order.payment.credit_card' },
  { value: 'crypto', icon: Bitcoin, labelKey: 'order.payment.crypto' },
];

const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const id = Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
  return `MF-${year}-${id}`;
};

export default function OrderModal() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, getTotal, isOrderModalOpen, closeOrderModal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const currentLang = i18n.language.split('-')[0];

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    address: '',
    city: '',
    postalCode: '',
    region: '',
    paymentMethod: 'bank_transfer',
    notes: '',
    termsAccepted: false,
  });

  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [errors, setErrors] = useState<FieldError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Pre-fill from profile
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.full_name || prev.fullName,
        email: user?.email || prev.email,
        phone: profile.phone || prev.phone,
        address: profile.address || prev.address,
        city: profile.city || prev.city,
        postalCode: profile.postal_code || prev.postalCode,
        region: profile.region || prev.region,
      }));
    }
  }, [profile, user]);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on edit
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = useCallback((): boolean => {
    const newErrors: FieldError = {};

    if (!formData.fullName.trim()) newErrors.fullName = t('order.error.required');
    else if (formData.fullName.trim().length < 2) newErrors.fullName = t('order.error.name_too_short');

    if (!formData.email.trim()) newErrors.email = t('order.error.required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('order.error.invalid_email');

    if (!formData.phone.trim()) newErrors.phone = t('order.error.required');
    else if (formData.phone.replace(/\D/g, '').length < 8) newErrors.phone = t('order.error.invalid_phone');

    if (formData.postalCode && !/^\d{5}$/.test(formData.postalCode)) newErrors.postalCode = t('order.error.invalid_postal');

    if (!formData.paymentMethod) newErrors.paymentMethod = t('order.error.required');

    if (!formData.termsAccepted) newErrors.termsAccepted = t('order.error.terms_required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

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

      // 1. Insert order into Supabase
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
        customer_name: formData.fullName.trim(),
        customer_email: formData.email.trim(),
        customer_phone: formData.phone.trim(),
        date_of_birth: formData.dateOfBirth || null,
        place_of_birth: formData.placeOfBirth.trim() || null,
        nationality: formData.nationality.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        postal_code: formData.postalCode.trim() || null,
        region: formData.region || null,
        payment_method: formData.paymentMethod,
        notes: formData.notes.trim() || null,
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

      // 2. Upload documents to Supabase Storage
      const documentUrls: { name: string; type: string; url: string; size: number }[] = [];

      for (const doc of documents) {
        const filePath = `orders/${orderId}/${Date.now()}_${doc.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('order-documents')
          .upload(filePath, doc.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (!uploadError) {
          // Insert document record
          await supabase.from('order_documents').insert({
            order_id: orderId,
            document_type: doc.type,
            file_name: doc.file.name,
            file_path: filePath,
            file_size: doc.file.size,
            mime_type: doc.file.type,
          });

          const { data: urlData } = supabase.storage
            .from('order-documents')
            .getPublicUrl(filePath);

          documentUrls.push({
            name: doc.file.name,
            type: doc.type,
            url: urlData.publicUrl,
            size: doc.file.size,
          });
        }
      }

      // 3. Call Edge Function to send emails
      try {
        await supabase.functions.invoke('submit-order', {
          body: {
            orderNumber: newOrderNumber,
            orderId,
            customerName: formData.fullName.trim(),
            customerEmail: formData.email.trim(),
            customerPhone: formData.phone.trim(),
            dateOfBirth: formData.dateOfBirth || '',
            placeOfBirth: formData.placeOfBirth.trim(),
            nationality: formData.nationality.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            postalCode: formData.postalCode.trim(),
            region: formData.region,
            paymentMethod: formData.paymentMethod,
            notes: formData.notes.trim(),
            items: items.map(i => ({
              name: i.name,
              category: i.category,
              price: i.price,
            })),
            totalAmount: total,
            documents: documentUrls,
            language: currentLang,
          },
        });
      } catch (emailErr) {
        console.warn('Edge function email call failed, order still saved:', emailErr);
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
      setDocuments([]);
      setFormData({
        fullName: profile?.full_name || '',
        email: user?.email || '',
        phone: profile?.phone || '',
        dateOfBirth: '',
        placeOfBirth: '',
        nationality: '',
        address: profile?.address || '',
        city: profile?.city || '',
        postalCode: profile?.postal_code || '',
        region: profile?.region || '',
        paymentMethod: 'bank_transfer',
        notes: '',
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

  const renderField = (
    field: keyof FormData,
    label: string,
    type: string = 'text',
    icon?: React.ReactNode,
    placeholder?: string,
    required = false,
  ) => (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
        {icon}
        {label}
        {required && <span className="text-german-red">*</span>}
      </label>
      <input
        type={type}
        value={formData[field] as string}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all focus:ring-2 focus:ring-german-red/20 focus:border-german-red ${
          errors[field]
            ? 'border-red-300 bg-red-50/50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      />
      {errors[field] && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
          <AlertCircle className="w-3 h-3" />
          {errors[field]}
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-start justify-center overflow-y-auto py-4 sm:py-8"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-6xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-german-black via-gray-900 to-german-black text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{t('order.title')}</h2>
                <p className="text-xs text-gray-300">{t('order.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State */}
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 sm:p-16 text-center"
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
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* LEFT COLUMN — Personal Info */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-blue-50 rounded-lg">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">{t('order.personal_info')}</h3>
                  </div>

                  {renderField('fullName', t('order.field.full_name'), 'text', <User className="w-3.5 h-3.5 text-gray-400" />, t('order.placeholder.full_name'), true)}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderField('email', t('order.field.email'), 'email', <Mail className="w-3.5 h-3.5 text-gray-400" />, t('order.placeholder.email'), true)}
                    {renderField('phone', t('order.field.phone'), 'tel', <Phone className="w-3.5 h-3.5 text-gray-400" />, '+49 ...', true)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderField('dateOfBirth', t('order.field.date_of_birth'), 'date', <Calendar className="w-3.5 h-3.5 text-gray-400" />)}
                    {renderField('placeOfBirth', t('order.field.place_of_birth'), 'text', <MapPin className="w-3.5 h-3.5 text-gray-400" />)}
                  </div>

                  {renderField('nationality', t('order.field.nationality'), 'text', <Globe className="w-3.5 h-3.5 text-gray-400" />)}

                  {renderField('address', t('order.field.address'), 'text', <MapPin className="w-3.5 h-3.5 text-gray-400" />)}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {renderField('city', t('order.field.city'), 'text')}
                    {renderField('postalCode', t('order.field.postal_code'), 'text', undefined, '10115')}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('order.field.region')}</label>
                      <select
                        value={formData.region}
                        onChange={(e) => updateField('region', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:ring-2 focus:ring-german-red/20 focus:border-german-red transition-all"
                      >
                        <option value="">{t('common.select_placeholder')}</option>
                        {regions.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN — Order & Payment */}
                <div className="space-y-5">
                  {/* Order Summary */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-german-red/10 rounded-lg">
                        <ShoppingCart className="w-4 h-4 text-german-red" />
                      </div>
                      <h3 className="font-bold text-gray-900">{t('order.summary')}</h3>
                    </div>
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 bg-german-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-black text-german-red">{item.category}</span>
                            </div>
                            <span className="text-sm text-gray-700 truncate">{item.name}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900 ml-3">{item.price.toLocaleString()}€</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">{t('order.total')}</span>
                        <span className="text-xl font-black text-german-red">{getTotal().toLocaleString()}€</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-amber-50 rounded-lg">
                        <CreditCard className="w-4 h-4 text-amber-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">{t('order.payment_method')}</h3>
                      <span className="text-german-red">*</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map(pm => {
                        const Icon = pm.icon;
                        const isSelected = formData.paymentMethod === pm.value;
                        return (
                          <button
                            key={pm.value}
                            type="button"
                            onClick={() => updateField('paymentMethod', pm.value)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-german-red bg-german-red/5 shadow-sm'
                                : 'border-gray-100 hover:border-gray-200 bg-white'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-german-red' : 'text-gray-400'}`} />
                            <span className={`text-sm font-medium ${isSelected ? 'text-german-red' : 'text-gray-600'}`}>
                              {t(pm.labelKey)}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-german-red ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                    {errors.paymentMethod && (
                      <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.paymentMethod}
                      </p>
                    )}
                  </div>

                  {/* Document Upload */}
                  <DocumentDropzone documents={documents} setDocuments={setDocuments} />

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('order.field.notes')}</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => updateField('notes', e.target.value)}
                      rows={3}
                      placeholder={t('order.placeholder.notes')}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:ring-2 focus:ring-german-red/20 focus:border-german-red transition-all resize-none"
                    />
                  </div>

                  {/* Terms */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={(e) => updateField('termsAccepted', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-german-red focus:ring-german-red/20"
                      />
                      <span className="text-xs text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors">
                        {t('order.terms_text')}
                      </span>
                    </label>
                    {errors.termsAccepted && (
                      <p className="flex items-center gap-1 text-xs text-red-500 mt-1 ml-7">
                        <AlertCircle className="w-3 h-3" />
                        {errors.termsAccepted}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-german-red via-red-600 to-german-red text-white font-bold text-base rounded-xl hover:from-red-700 hover:via-red-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-german-red/20 hover:shadow-xl hover:shadow-german-red/30"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t('order.submitting')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>{t('order.submit_order')}</span>
                      <Sparkles className="w-4 h-4 opacity-60" />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t('order.secure_notice')}
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
