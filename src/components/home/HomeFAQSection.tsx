import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Accordion from '../ui/Accordion';

const HomeFAQSection = () => {
  const { t } = useTranslation();

  const faqs = [
    { q: t('home.faq.q1.title'), a: t('home.faq.q1.desc') },
    { q: t('home.faq.q2.title'), a: t('home.faq.q2.desc') },
    { q: t('home.faq.q3.title'), a: t('home.faq.q3.desc') },
    { q: t('home.faq.q4.title'), a: t('home.faq.q4.desc') },
  ];

  return (
    <section className="py-14 sm:py-16 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{t('home.faq.title')}</h2>
        </motion.div>
        <div className="space-y-2 sm:space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <Accordion title={faq.q}><p className="text-sm sm:text-base">{faq.a}</p></Accordion>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFAQSection;
