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
    <section className="py-20 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
            {t('home.faq.title')}
          </h2>
        </motion.div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Accordion title={faq.q}><p>{faq.a}</p></Accordion>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFAQSection;
