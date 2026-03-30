import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, MapPin, User, Type, Clock, Phone } from 'lucide-react';
import { supabase, ContactMessage } from '../lib/supabase';
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_ADDRESS } from '../lib/constants';
import toast from 'react-hot-toast';
import SEOHead from '../components/seo/SEOHead';
import { pageSEO } from '../lib/seoData';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Contact() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactMessage>();

  const onSubmit = async (data: ContactMessage) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        ...data,
        language: i18n.language as 'fr' | 'en',
      });
      if (error) throw error;
      toast.success(t('contact.form.success'));
      reset();
    } catch (error: any) {
      toast.error(t('contact.form.error'));
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    { icon: Mail, title: t('contact.info.support'), value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, color: 'text-german-red' },
    { icon: Phone, title: t('contact.info.phone'), value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/\s/g, '')}`, color: 'text-green-600' },
    { icon: MapPin, title: t('contact.info.address'), value: CONTACT_ADDRESS, href: '#', color: 'text-gray-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead {...pageSEO.contact} />
      <section className="bg-gradient-to-br from-german-black via-german-red to-gray-900 text-white py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl lg:text-6xl font-bold mb-4">{t('contact.title')}</motion.h1>
          <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl lg:text-2xl text-blue-100">{t('contact.subtitle')}</motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">{t('contact.form.title')}</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input label={t('contact.form.name')} registration={register('name', { required: true })} error={errors.name ? t('common.required') : ''} icon={<User className="w-5 h-5 text-gray-400" />} />
                <Input label={t('contact.form.email')} type="email" registration={register('email', { required: true })} error={errors.email ? t('common.required') : ''} icon={<Mail className="w-5 h-5 text-gray-400" />} />
                <Input label={t('contact.form.subject')} registration={register('subject', { required: true })} error={errors.subject ? t('common.required') : ''} icon={<Type className="w-5 h-5 text-gray-400" />} />
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">{t('contact.form.message')}</label>
                  <textarea {...register('message', { required: true })} rows={4} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></textarea>
                  {errors.message && <p className="mt-1 text-sm text-red-600">{t('common.required')}</p>}
                </div>
                <Button type="submit" isLoading={isLoading} className="w-full">
                  {t('contact.form.send')}
                </Button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.info.title')}</h3>
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4 mb-4">
                    <div className={`flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center`}>
                      <info.icon className={`w-6 h-6 ${info.color}`} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{info.title}</h4>
                      <a href={info.href} className="text-gray-600 hover:text-german-red transition-colors">{info.value}</a>
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.hours.title')}</h3>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{t('contact.hours.days')}</h4>
                    <p className="text-gray-600">{t('contact.hours.time')}</p>
                    <p className="text-sm text-gray-500 mt-1">{t('contact.hours.support')}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl shadow-lg w-full overflow-hidden aspect-video">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2694.7082343824213!2d13.392748476062528!3d52.512408936065105!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a54cfbf7d50f5b%3A0x5c9b9c2b8e4b6d7e!2sAlexanderstra%C3%9Fe%2040%2C%2010179%20Berlin%2C%20Deutschland!5e0!3m2!1sde!2sde!4v1759062300000!5m2!1sde!2sde" width="100%" height="100%" style={{ border:0 }} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
