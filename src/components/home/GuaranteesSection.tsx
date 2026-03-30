import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Clock } from 'lucide-react';

const GuaranteesSection = () => {
  const { t } = useTranslation();

  const guarantees = [
    {
      icon: ShieldCheck,
      title: t('home.guarantees.legal.title'),
      description: t('home.guarantees.legal.desc'),
      color: 'blue'
    },
    {
      icon: Clock,
      title: t('home.guarantees.fast.title'),
      description: t('home.guarantees.fast.desc'),
      color: 'red'
    },
    {
      icon: Award,
      title: t('home.guarantees.satisfaction.title'),
      description: t('home.guarantees.satisfaction.desc'),
      color: 'blue'
    },
  ];

  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'text-german-red' },
    red: { bg: 'bg-red-50', icon: 'text-red-600' },
  }

  return (
    <section className="py-20 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-900">
            {t('home.guarantees.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('home.guarantees.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {guarantees.map((guarantee, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className={`w-16 h-16 ${colors[guarantee.color as keyof typeof colors].bg} rounded-2xl flex items-center justify-center mb-6`}>
                <guarantee.icon className={`w-8 h-8 ${colors[guarantee.color as keyof typeof colors].icon}`} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">{guarantee.title}</h3>
              <p className="text-gray-600 leading-relaxed">{guarantee.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GuaranteesSection;
