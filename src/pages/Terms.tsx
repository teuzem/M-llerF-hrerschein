import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const LegalPageLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-german-black via-german-red to-gray-900 text-white py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl lg:text-5xl font-bold">
            {title}
          </motion.h1>
        </div>
      </section>
      <section className="py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="bg-white p-8 md:p-12 rounded-lg shadow-lg prose lg:prose-xl max-w-none"
          >
            {children}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default function Terms() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout title={t('terms.title')}>
      <p className="text-sm text-gray-500">{t('legal.last_updated')}</p>
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
        <p className="font-bold">{t('legal.disclaimer_title')}</p>
        <p>{t('legal.disclaimer_text')}</p>
      </div>

      <h2>{t('terms.content.object_title')}</h2>
      <p>{t('terms.content.object_desc')}</p>
      
      <h2>{t('terms.content.services_title')}</h2>
      <p>{t('terms.content.services_desc')}</p>
      
      <h2>{t('terms.content.user_resp_title')}</h2>
      <p>{t('terms.content.user_resp_desc')}</p>
      
      <h2>{t('terms.content.payment_title')}</h2>
      <p>{t('terms.content.payment_desc')}</p>

      <h2>{t('terms.content.retraction_title')}</h2>
      <p>{t('terms.content.retraction_desc')}</p>
      
      <h2>{t('terms.content.liability_title')}</h2>
      <p>{t('terms.content.liability_desc')}</p>

      <h2>{t('terms.content.law_title')}</h2>
      <p>{t('terms.content.law_desc')}</p>
    </LegalPageLayout>
  );
}
