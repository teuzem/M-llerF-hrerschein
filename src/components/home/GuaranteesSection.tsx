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
      accent: 'from-german-red to-red-700',
      bgAccent: 'bg-red-50',
      iconColor: 'text-german-red',
    },
    {
      icon: Clock,
      title: t('home.guarantees.fast.title'),
      description: t('home.guarantees.fast.desc'),
      accent: 'from-german-red to-german-gold',
      bgAccent: 'bg-orange-50',
      iconColor: 'text-german-gold',
    },
    {
      icon: Award,
      title: t('home.guarantees.satisfaction.title'),
      description: t('home.guarantees.satisfaction.desc'),
      accent: 'from-german-gold to-yellow-500',
      bgAccent: 'bg-yellow-50',
      iconColor: 'text-german-red',
    },
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-german-black via-german-red to-german-gold bg-clip-text text-transparent leading-tight max-w-3xl mx-auto">
            {t('home.guarantees.title')}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {t('home.guarantees.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {guarantees.map((guarantee, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden"
            >
              {/* Top accent bar */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${guarantee.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className={`w-16 h-16 ${guarantee.bgAccent} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <guarantee.icon className={`w-8 h-8 ${guarantee.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 leading-snug">{guarantee.title}</h3>
              <p className="text-gray-500 leading-relaxed">{guarantee.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GuaranteesSection;
