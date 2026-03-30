import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Select from 'react-select';
import { supabase, LicenseType, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { User, Hash, MapPin, Home, Building } from 'lucide-react';
import emailjs from '@emailjs/browser';

import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ApplicationFormSteps from '../components/application/ApplicationFormSteps';
import AdvancedDropzone from '../components/application/AdvancedDropzone';
import PDFSummary from '../components/application/PDFSummary';
import { regions, THEORY_TEST_FEE } from '../lib/constants';

type FormValues = {
  neph: string;
  address: string;
  city: string;
  postalCode: string;
  region: { value: string; label: string } | null;
  cni: File[];
  photo: File[];
  signature: File[];
};

export default function ApplicationForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [licenseType, setLicenseType] = useState<LicenseType | null>(null);
  const [includeTheoryTest, setIncludeTheoryTest] = useState(false);
  const pdfSummaryRef = useRef<HTMLDivElement>(null);

  const { control, handleSubmit, watch, formState: { errors, isValid } } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      neph: profile?.neph_number || '',
      address: profile?.address || '',
      city: profile?.city || '',
      postalCode: profile?.postal_code || '',
      region: profile?.region ? regions.find(r => r.value === profile.region) : null,
      cni: [],
      photo: [],
      signature: []
    }
  });

  useEffect(() => {
    const licenseId = searchParams.get('license');
    const theory = searchParams.get('theory') === 'true';
    if (!licenseId) {
      toast.error("Aucun permis sélectionné.");
      navigate('/services');
      return;
    }
    setIncludeTheoryTest(theory);

    const fetchLicenseType = async () => {
      const { data, error } = await supabase.from('license_types').select('*').eq('id', licenseId).single();
      if (error || !data) {
        toast.error("Type de permis non trouvé.");
        navigate('/services');
      } else {
        setLicenseType(data);
      }
      setIsLoading(false);
    };

    fetchLicenseType();
  }, [searchParams, navigate]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    if (!user || !licenseType || !profile) {
      toast.error(t('common.error'));
      setIsSubmitting(false);
      return;
    }

    try {
      const application_number = `PC-${Date.now().toString().slice(-6)}`;
      const totalAmount = licenseType.price_gross_euros + (includeTheoryTest ? THEORY_TEST_FEE : 0);
      
      const { data: appData, error: appError } = await supabase
        .from('license_applications')
        .insert({
          user_id: user.id,
          license_type_id: licenseType.id,
          status: 'pending_payment',
          application_number,
          address: data.address,
          city: data.city,
          postal_code: data.postalCode,
          region: data.region?.value,
          total_amount: totalAmount,
          theory_test_needed: includeTheoryTest,
          theory_test_fee: includeTheoryTest ? THEORY_TEST_FEE : 0,
          form_data: { neph: data.neph },
        })
        .select()
        .single();
      
      if (appError) throw new Error(`La création de la demande a échoué: ${appError.message}`);

      const fileUploads = [
        { file: data.cni[0], type: 'cni' },
        { file: data.photo[0], type: 'photo' },
        { file: data.signature[0], type: 'signature' },
      ];

      const uploadedFilePaths: { [key: string]: string } = {};
      for (const { file, type } of fileUploads) {
        const filePath = `${user.id}/${appData.id}/${type}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('application-documents').upload(filePath, file);
        if (uploadError) throw new Error(`L'upload a échoué pour ${type}: ${uploadError.message}`);
        uploadedFilePaths[type] = filePath;
      }

      const { data: signedUrlsData, error: signedUrlsError } = await supabase.storage
        .from('application-documents')
        .createSignedUrls(Object.values(uploadedFilePaths), 60 * 60 * 24 * 7);
      if (signedUrlsError) console.warn(`La génération d'URL a échoué: ${signedUrlsError.message}`);

      const status_url = `${window.location.origin}/application/status/${appData.id}`;

      const emailParamsAdmin = {
        application_number: application_number,
        user_name: profile.full_name,
        user_email: profile.email,
        license_name: licenseType.name_de,
        total_amount: totalAmount.toFixed(2),
        status_url: status_url,
        cni_url: signedUrlsData?.find(u => u.path?.includes('cni-'))?.signedUrl || '#',
        photo_url: signedUrlsData?.find(u => u.path?.includes('photo-'))?.signedUrl || '#',
        signature_url: signedUrlsData?.find(u => u.path?.includes('signature-'))?.signedUrl || '#',
      };

      const emailParamsClient = {
        user_name: profile.full_name,
        application_number: application_number,
        license_name: licenseType.name_de,
        total_amount: totalAmount.toFixed(2),
        status_url: status_url,
        to_email: profile.email,
      };

      try {
        await emailjs.send(import.meta.env.VITE_EMAILJS_SERVICE_ID, import.meta.env.VITE_EMAILJS_TEMPLATE_ID_ADMIN, emailParamsAdmin, import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
        await emailjs.send(import.meta.env.VITE_EMAILJS_SERVICE_ID, import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CLIENT, emailParamsClient, import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
      } catch (emailError) {
        console.warn("EmailJS error:", emailError);
        toast.error("La demande a été soumise, mais l'envoi de l'email de confirmation a échoué.");
      }
      
      toast.success(t('application.form.success'));
      navigate(`/application/confirmation/${appData.id}`);

    } catch (error: any) {
      toast.error(`${t('application.form.error')}: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 text-center">{t('application.form.title')} pour Permis {licenseType?.category}</h1>
          <p className="text-center text-gray-600 mt-2">{t('application.form.subtitle')}</p>
        </motion.div>

        <div className="mt-8 bg-white p-8 rounded-2xl shadow-xl">
          <ApplicationFormSteps currentStep={step} />

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">{t('application.form.step1')}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label={t('auth.full_name')} registration={{ name: 'fullName' }} value={profile?.full_name || ''} disabled icon={<User className="w-5 h-5 text-gray-400" />} />
                  <Controller name="neph" control={control} render={({ field }) => <Input label={t('application.form.neph')} registration={field} error={errors.neph?.message} icon={<Hash className="w-5 h-5 text-gray-400" />} />} />
                </div>
                <Controller name="address" control={control} rules={{ required: 'Adresse requise' }} render={({ field }) => <Input label={t('application.form.address')} registration={field} error={errors.address?.message} icon={<Home className="w-5 h-5 text-gray-400" />} />} />
                <div className="grid md:grid-cols-2 gap-6">
                  <Controller name="city" control={control} rules={{ required: 'Ville requise' }} render={({ field }) => <Input label={t('application.form.city')} registration={field} error={errors.city?.message} icon={<Building className="w-5 h-5 text-gray-400" />} />} />
                  <Controller name="postalCode" control={control} rules={{ required: 'Code postal requis' }} render={({ field }) => <Input label={t('application.form.postal_code')} registration={field} error={errors.postalCode?.message} icon={<MapPin className="w-5 h-5 text-gray-400" />} />} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('application.form.region')}</label>
                  <Controller name="region" control={control} rules={{ required: 'Région requise' }} render={({ field }) => <Select {...field} options={regions} placeholder={t('common.select_prompt')} styles={{ control: (base) => ({ ...base, borderColor: errors.region ? 'rgb(239 68 68)' : 'rgb(209 213 219)' }) }} />} />
                  {errors.region && <p className="mt-1 text-sm text-red-600">{errors.region.message}</p>}
                </div>
                <div className="flex justify-end">
                  <Button onClick={nextStep} disabled={!isValid}>{t('application.form.next_button')}</Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">{t('application.form.step2')}</h2>
                <Controller name="cni" control={control} rules={{ validate: v => v.length > 0 || 'Document requis' }} render={({ field, fieldState }) => <div><AdvancedDropzone label={t('application.form.doc_cni')} onFilesChange={field.onChange} files={field.value} /><p className="mt-1 text-sm text-red-600">{fieldState.error?.message}</p></div>} />
                <Controller name="photo" control={control} rules={{ validate: v => v.length > 0 || 'Document requis' }} render={({ field, fieldState }) => <div><AdvancedDropzone label={t('application.form.doc_photo')} onFilesChange={field.onChange} files={field.value} /><p className="mt-1 text-sm text-red-600">{fieldState.error?.message}</p></div>} />
                <Controller name="signature" control={control} rules={{ validate: v => v.length > 0 || 'Document requis' }} render={({ field, fieldState }) => <div><AdvancedDropzone label={t('application.form.doc_signature')} onFilesChange={field.onChange} files={field.value} /><p className="mt-1 text-sm text-red-600">{fieldState.error?.message}</p></div>} />
                <div className="flex justify-between">
                  <Button variant="secondary" onClick={prevStep}>{t('application.form.prev_button')}</Button>
                  <Button onClick={nextStep} disabled={!isValid}>{t('application.form.next_button')}</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">{t('application.form.step3')}</h2>
                <div className="p-6 bg-gray-50 rounded-lg border overflow-hidden">
                  <div ref={pdfSummaryRef}>
                    <PDFSummary application={{ ...watch(), license_type: licenseType, total_amount: (licenseType?.price_gross_euros || 0) + (includeTheoryTest ? THEORY_TEST_FEE : 0), theory_test_needed: includeTheoryTest, form_data: { neph: watch('neph') } }} profile={profile} />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="secondary" onClick={prevStep}>{t('application.form.prev_button')}</Button>
                  <Button type="submit" isLoading={isSubmitting}>{t('application.form.submit_button')}</Button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
