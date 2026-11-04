import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, UploadCloud, Search, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    { step: '01', title: t('home.process.step1.title'), description: t('home.process.step1.desc'), icon: FileText, color: '#ef4444', bg: 'bg-red-50' },
    { step: '02', title: t('home.process.step2.title'), description: t('home.process.step2.desc'), icon: UploadCloud, color: '#f97316', bg: 'bg-orange-50' },
    { step: '03', title: t('home.process.step3.title'), description: t('home.process.step3.desc'), icon: Search, color: '#eab308', bg: 'bg-yellow-50' },
    { step: '04', title: t('home.process.step4.title'), description: t('home.process.step4.desc'), icon: CheckCircle, color: '#22c55e', bg: 'bg-green-50' },
  ];

  return (
    <section className="py-14 sm:py-16 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-10 sm:mb-12">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-german-red mb-2">
            {t('home.process.step_label', 'Prozess')}
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight max-w-2xl mx-auto">
            {t('home.process.title')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-lg mx-auto leading-relaxed">
            {t('home.process.subtitle')}
          </p>
        </motion.div>

        {/* Steps: 1 col mobile, 2 cols tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="flex items-start gap-4 bg-white border border-gray-100 rounded-xl p-5 sm:p-6 hover:border-gray-200 hover:shadow-md transition-all duration-300 group"
            >
              {/* Step number: large, bold, styled */}
              <div className="flex flex-col items-center flex-shrink-0">
                <span className="text-2xl sm:text-3xl font-black text-german-red tabular-nums leading-none">
                  {step.step}
                </span>
                <div className={`w-9 h-9 sm:w-10 sm:h-10 ${step.bg} rounded-lg flex items-center justify-center mt-2 group-hover:scale-105 transition-transform duration-300`}>
                  <step.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: step.color }} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-[15px] text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.25 }} className="text-center">
          <Link to="/services" className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300 text-sm sm:text-base">
            {t('home.hero.cta', 'Führerschein erhalten')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
