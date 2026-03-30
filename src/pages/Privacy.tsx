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

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout title={t('privacy.title')}>
      <p className="text-sm text-gray-500">{t('legal.last_updated')}</p>
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
        <p className="font-bold">{t('legal.disclaimer_title')}</p>
        <p>{t('legal.disclaimer_text')}</p>
      </div>
      <p>{t('privacy.content.intro')}</p>
      
      <h2>{t('privacy.content.collection_title')}</h2>
      <p>{t('privacy.content.collection_desc')}</p>
      <ul>
        <li>{t('privacy.content.collection_list.item1')}</li>
        <li>{t('privacy.content.collection_list.item2')}</li>
        <li>{t('privacy.content.collection_list.item3')}</li>
      </ul>
      
      <h2>{t('privacy.content.usage_title')}</h2>
      <p>{t('privacy.content.usage_desc')}</p>
      
      <h2>{t('privacy.content.sharing_title')}</h2>
      <p>{t('privacy.content.sharing_desc')}</p>
      
      <h2>{t('privacy.content.security_title')}</h2>
      <p>{t('privacy.content.security_desc')}</p>

      <h2>{t('privacy.content.cookies_title')}</h2>
      <p>{t('privacy.content.cookies_desc')}</p>
      
      <h2>{t('privacy.content.rights_title')}</h2>
      <p>{t('privacy.content.rights_desc', { email: 'permiscode2025@gmail.com' })}</p>
    </LegalPageLayout>
  );
}
