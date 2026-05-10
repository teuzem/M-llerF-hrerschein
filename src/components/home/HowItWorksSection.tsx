import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, UploadCloud, Search, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      step: '01',
      title: t('home.process.step1.title'),
      description: t('home.process.step1.desc'),
      icon: FileText,
      accent: 'from-german-red to-red-700',
      glow: 'shadow-red-500/20',
    },
    {
      step: '02',
      title: t('home.process.step2.title'),
      description: t('home.process.step2.desc'),
      icon: UploadCloud,
      accent: 'from-german-red to-german-gold',
      glow: 'shadow-orange-500/20',
    },
    {
      step: '03',
      title: t('home.process.step3.title'),
      description: t('home.process.step3.desc'),
      icon: Search,
      accent: 'from-german-gold to-yellow-500',
      glow: 'shadow-yellow-500/20',
    },
    {
      step: '04',
      title: t('home.process.step4.title'),
      description: t('home.process.step4.desc'),
      icon: CheckCircle,
      accent: 'from-green-500 to-emerald-600',
      glow: 'shadow-green-500/20',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-german-red/[0.03] to-transparent rounded-full pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-german-red/10 text-german-red text-sm font-semibold tracking-wide uppercase mb-6">
            {t('home.process.step_label', 'Prozess')}
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-german-black via-german-red to-german-gold bg-clip-text text-transparent leading-tight max-w-3xl mx-auto">
            {t('home.process.title')}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {t('home.process.subtitle')}
          </p>
        </motion.div>

        {/* Desktop Steps */}
        <div className="hidden md:grid md:grid-cols-4 gap-8 relative">
          {/* Connector line */}
          <div className="absolute top-16 left-[12.5%] right-[12.5%] h-[2px] z-0">
            <div className="w-full h-full bg-gradient-to-r from-german-red via-german-gold to-green-500 opacity-20 rounded-full" />
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 h-full bg-gradient-to-r from-german-red via-german-gold to-green-500 rounded-full origin-left"
              style={{ opacity: 0.5 }}
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              {/* Icon circle */}
              <div className={`relative w-32 h-32 rounded-3xl bg-white shadow-xl ${step.glow} border border-gray-100 flex items-center justify-center mb-8 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500`}>
                <div className={`w-20 h-20 bg-gradient-to-br ${step.accent} rounded-2xl flex items-center justify-center`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                {/* Step number badge */}
                <div className={`absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br ${step.accent} text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white`}>
                  {step.step}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mobile Steps */}
        <div className="md:hidden relative">
          <div className="absolute top-0 left-8 w-[2px] h-full bg-gradient-to-b from-german-red via-german-gold to-green-500 opacity-20" />
          <div className="relative flex flex-col space-y-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="flex items-start gap-6"
              >
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-16 h-16 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center`}>
                    <div className={`w-12 h-12 bg-gradient-to-br ${step.accent} rounded-xl flex items-center justify-center`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className={`absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br ${step.accent} text-white rounded-lg flex items-center justify-center font-bold text-xs shadow border-2 border-white`}>
                    {step.step}
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Link
            to="/application/new"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-german-red to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-german-red transition-all duration-300 shadow-xl shadow-red-900/20 hover:shadow-red-900/40 hover:scale-[1.03] text-base"
          >
            {t('home.hero.cta', 'Führerschein erhalten')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
