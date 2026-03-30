import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, UploadCloud, Search, CheckCircle } from 'lucide-react';

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const process = [
    {
      step: '01',
      title: t('home.process.step1.title'),
      description: t('home.process.step1.desc'),
      icon: FileText,
    },
    {
      step: '02',
      title: t('home.process.step2.title'),
      description: t('home.process.step2.desc'),
      icon: UploadCloud,
    },
    {
      step: '03',
      title: t('home.process.step3.title'),
      description: t('home.process.step3.desc'),
      icon: Search,
    },
    {
      step: '04',
      title: t('home.process.step4.title'),
      description: t('home.process.step4.desc'),
      icon: CheckCircle,
    },
  ];

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-german-black via-german-red to-german-gold bg-clip-text text-transparent">
            {t('home.process.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('home.process.subtitle')}
          </p>
        </motion.div>

        {/* Horizontal Timeline for Desktop */}
        <div className="hidden md:block relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200" style={{ transform: 'translateY(-50%)' }}></div>
          <div className="relative flex justify-between">
            {process.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col items-center text-center w-1/4 px-2"
              >
                <div className="relative z-10 w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-german-black via-german-red to-german-gold rounded-full flex items-center justify-center text-white shadow-lg">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-german-red text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Vertical Timeline for Mobile */}
        <div className="md:hidden relative">
          <div className="absolute top-0 left-8 w-0.5 h-full bg-gray-200"></div>
          <div className="relative flex flex-col space-y-12">
            {process.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex items-start"
              >
                <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-german-black via-german-red to-german-gold rounded-full flex items-center justify-center text-white shadow-lg">
                    <step.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="ml-6">
                  <p className="text-german-red font-bold mb-1">Étape {step.step}</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
