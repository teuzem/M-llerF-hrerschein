import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const GuaranteesSection = () => {
  const { t } = useTranslation();

  const guarantees = [
    { icon: ShieldCheck, title: t('home.guarantees.legal.title'), description: t('home.guarantees.legal.desc'), color: '#ef4444', bg: 'bg-red-50', border: 'hover:border-red-200' },
    { icon: Clock, title: t('home.guarantees.fast.title'), description: t('home.guarantees.fast.desc'), color: '#f59e0b', bg: 'bg-amber-50', border: 'hover:border-amber-200' },
    { icon: Award, title: t('home.guarantees.satisfaction.title'), description: t('home.guarantees.satisfaction.desc'), color: '#10b981', bg: 'bg-emerald-50', border: 'hover:border-emerald-200' },
  ];

  return (
    <section className="py-14 sm:py-16 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight max-w-2xl mx-auto">{t('home.guarantees.title')}</h2>
          <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-lg mx-auto leading-relaxed">{t('home.guarantees.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {guarantees.map((g, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.06 }}
              className={`bg-white border border-gray-100 rounded-xl p-6 sm:p-7 ${g.border} hover:shadow-lg transition-all duration-300 group text-center`}
            >
              <div className={`w-12 h-12 ${g.bg} rounded-xl flex items-center justify-center mb-5 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                <g.icon className="w-6 h-6" style={{ color: g.color }} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{g.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm sm:text-[15px]">{g.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-center mt-8">
          <Link to="/services" className="group inline-flex items-center gap-2 text-gray-900 font-semibold hover:text-german-red transition-colors duration-200 text-sm sm:text-base">
            {t('home.cta.button', 'Jetzt starten')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default GuaranteesSection;
