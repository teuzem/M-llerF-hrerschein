import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Check, X, Star, Headphones as HeadphonesIcon, CreditCard, FileText, Award, ChevronDown, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CompetitorComparison: React.FC = () => {
  const { t } = useTranslation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>('main');

  const competitors = [
    { name: t('footer.company'), logo: '🏆', color: 'from-german-black via-german-red to-german-gold', highlight: true },
    { name: t('pricing.comparison.competitor1', 'Führerschein Express'), logo: '🏢', color: 'from-gray-400 to-gray-500' },
    { name: t('pricing.comparison.competitor2', 'Deutsche Fahrschule'), logo: '🏪', color: 'from-gray-400 to-gray-500' },
    { name: t('pricing.comparison.competitor3', 'AutoMobil Service'), logo: '🏬', color: 'from-gray-400 to-gray-500' },
  ];

  const categories = [
    {
      id: 'main',
      title: t('pricing.comparison.main_features'),
      icon: Star,
      features: [
        {
          key: t('pricing.comparison.feature.price_transparency'),
          permisCode: true,
          competitor1: false,
          competitor2: true,
          competitor3: false,
          highlight: true,
        },
        {
          key: t('pricing.comparison.feature.processing_time'),
          permisCode: t('pricing.comparison.value.7_15_days'),
          competitor1: t('pricing.comparison.value.30_45_days'),
          competitor2: t('pricing.comparison.value.20_30_days'),
          competitor3: t('pricing.comparison.value.25_40_days'),
          highlight: true,
        },
        {
          key: t('pricing.comparison.feature.success_rate'),
          permisCode: '98%',
          competitor1: '85%',
          competitor2: '88%',
          competitor3: '82%',
          highlight: true,
        },
        {
          key: t('pricing.comparison.feature.online_platform'),
          permisCode: true,
          competitor1: false,
          competitor2: true,
          competitor3: false,
        },
      ],
    },
    {
      id: 'service',
      title: t('pricing.comparison.service'),
      icon: HeadphonesIcon,
      features: [
        {
          key: t('pricing.comparison.feature.customer_support'),
          permisCode: t('pricing.comparison.value.24_7'),
          competitor1: t('pricing.comparison.value.business_hours'),
          competitor2: t('pricing.comparison.value.business_hours'),
          competitor3: t('pricing.comparison.value.limited'),
        },
        {
          key: t('pricing.comparison.feature.multilingual'),
          permisCode: true,
          competitor1: false,
          competitor2: true,
          competitor3: false,
        },
        {
          key: t('pricing.comparison.feature.live_tracking'),
          permisCode: true,
          competitor1: false,
          competitor2: false,
          competitor3: false,
          highlight: true,
        },
        {
          key: t('pricing.comparison.feature.dedicated_advisor'),
          permisCode: true,
          competitor1: false,
          competitor2: false,
          competitor3: true,
        },
      ],
    },
    {
      id: 'payment',
      title: t('pricing.comparison.payment'),
      icon: CreditCard,
      features: [
        {
          key: t('pricing.comparison.feature.payment_methods'),
          permisCode: t('pricing.comparison.value.all_methods'),
          competitor1: t('pricing.comparison.value.limited'),
          competitor2: t('pricing.comparison.value.card_only'),
          competitor3: t('pricing.comparison.value.limited'),
        },
        {
          key: t('pricing.comparison.feature.installments'),
          permisCode: true,
          competitor1: false,
          competitor2: true,
          competitor3: false,
        },
        {
          key: t('pricing.comparison.feature.money_back'),
          permisCode: true,
          competitor1: false,
          competitor2: false,
          competitor3: false,
          highlight: true,
        },
        {
          key: t('pricing.comparison.feature.no_hidden_fees'),
          permisCode: true,
          competitor1: false,
          competitor2: true,
          competitor3: false,
        },
      ],
    },
    {
      id: 'documents',
      title: t('pricing.comparison.admin'),
      icon: FileText,
      features: [
        {
          key: t('pricing.comparison.feature.document_verification'),
          permisCode: t('pricing.comparison.value.instant'),
          competitor1: t('pricing.comparison.value.manual'),
          competitor2: t('pricing.comparison.value.slow'),
          competitor3: t('pricing.comparison.value.manual'),
        },
        {
          key: t('pricing.comparison.feature.digital_delivery'),
          permisCode: true,
          competitor1: false,
          competitor2: true,
          competitor3: false,
        },
        {
          key: t('pricing.comparison.feature.secure_storage'),
          permisCode: true,
          competitor1: false,
          competitor2: false,
          competitor3: true,
        },
        {
          key: t('pricing.comparison.feature.auto_reminders'),
          permisCode: true,
          competitor1: false,
          competitor2: false,
          competitor3: false,
        },
      ],
    },
  ];

  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-6 h-6 text-green-500 mx-auto" strokeWidth={3} />
      ) : (
        <X className="w-6 h-6 text-red-400 mx-auto" strokeWidth={2} />
      );
    }
    return <span className="text-sm font-medium text-gray-700">{value}</span>;
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-3xl shadow-2xl border border-blue-100 overflow-hidden"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4 shadow-lg"
        >
          <Trophy className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-german-black via-german-red to-german-gold bg-clip-text text-transparent mb-3">
          {t('pricing.comparison.title')}
        </h3>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {t('pricing.comparison.subtitle')}
        </p>
      </div>

      <div className="mb-8 bg-gradient-to-r from-german-black via-german-red to-german-gold p-4 sm:p-6 rounded-2xl shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {competitors.map((competitor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`text-center ${competitor.highlight ? 'transform scale-110' : ''}`}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${competitor.color} rounded-xl mb-3 shadow-lg ${competitor.highlight ? 'ring-4 ring-yellow-400' : ''}`}>
                <span className="text-3xl">{competitor.logo}</span>
              </div>
              <h4 className={`font-bold leading-tight ${competitor.highlight ? 'text-white text-sm sm:text-lg' : 'text-white/80 text-[10px] sm:text-sm'}`}>
                {competitor.name}
              </h4>
              {competitor.highlight && (
                <div className="flex items-center justify-center mt-2 space-x-1">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs text-yellow-300 font-semibold">
                    {t('pricing.comparison.best_choice')}
                  </span>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((category, catIndex) => {
          const CategoryIcon = category.icon;
          const isExpanded = expandedCategory === category.id;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIndex * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
            >
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-german-red to-german-gold rounded-lg flex items-center justify-center">
                    <CategoryIcon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">{category.title}</h4>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-100"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody>
                        {category.features.map((feature, featureIndex) => (
                          <motion.tr
                            key={feature.key}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: featureIndex * 0.05 }}
                            className={`${
                              featureIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                            } ${feature.highlight ? 'ring-2 ring-yellow-200 ring-inset' : ''}`}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/4">
                              <div className="flex items-center">
                                {feature.highlight && (
                                  <Star className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" fill="currentColor" />
                                )}
                                {feature.key}
                              </div>
                            </td>
                            <td className={`px-4 py-4 text-center ${feature.highlight ? 'bg-gradient-to-r from-green-50 to-emerald-50' : ''}`}>
                              {renderValue(feature.permisCode)}
                            </td>
                            <td className="px-4 py-4 text-center">
                              {renderValue(feature.competitor1)}
                            </td>
                            <td className="px-4 py-4 text-center">
                              {renderValue(feature.competitor2)}
                            </td>
                            <td className="px-4 py-4 text-center">
                              {renderValue(feature.competitor3)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gradient-to-r from-german-black via-german-red to-german-gold p-6 rounded-2xl text-center shadow-xl"
      >
        <div className="flex items-center justify-center mb-4 space-x-2">
          <Award className="w-8 h-8 text-yellow-300" />
          <h4 className="text-2xl font-bold text-white">{t('pricing.comparison.why_us')}</h4>
          <Award className="w-8 h-8 text-yellow-300" />
        </div>
        <p className="text-white/90 text-lg max-w-3xl mx-auto">
          {t('pricing.comparison.p1')}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default CompetitorComparison;
