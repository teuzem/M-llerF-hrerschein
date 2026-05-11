import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Check, X, Star, Headphones as HeadphonesIcon, CreditCard, FileText, Award, ChevronDown, Sparkles, Building2, Store, Building } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CompetitorComparison: React.FC = () => {
  const { t } = useTranslation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>('main');

  const competitors = [
    { name: t('footer.company'), icon: Trophy, color: 'text-yellow-500', bgColor: 'bg-yellow-50', highlight: true },
    { name: t('pricing.comparison.competitor1', 'Führerschein Express'), icon: Building2, color: 'text-gray-500', bgColor: 'bg-gray-50' },
    { name: t('pricing.comparison.competitor2', 'Deutsche Fahrschule'), icon: Store, color: 'text-gray-500', bgColor: 'bg-gray-50' },
    { name: t('pricing.comparison.competitor3', 'AutoMobil Service'), icon: Building, color: 'text-gray-500', bgColor: 'bg-gray-50' },
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
          initial={{ scale: 0, rotate: -10 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-yellow-100 to-yellow-50 rounded-3xl mb-6 shadow-sm border border-yellow-200"
        >
          <Trophy className="w-10 h-10 text-yellow-600" />
        </motion.div>
        <h3 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4">
          {t('pricing.comparison.title')}
        </h3>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {t('pricing.comparison.subtitle')}
        </p>
      </div>

      <div className="mb-12 bg-white/50 backdrop-blur-sm p-8 rounded-3xl shadow-inner border border-white/50">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {competitors.map((competitor, index) => {
            const Icon = competitor.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative group flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 ${
                  competitor.highlight 
                    ? 'bg-white shadow-xl ring-1 ring-yellow-400/50 scale-105 z-10' 
                    : 'bg-transparent hover:bg-white/30'
                }`}
              >
                {competitor.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {t('pricing.comparison.best_choice')}
                  </div>
                )}
                
                <div className={`flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-transform duration-500 group-hover:scale-110 ${competitor.bgColor}`}>
                  <Icon className={`w-8 h-8 ${competitor.color}`} />
                </div>
                
                <h4 className={`font-bold text-center leading-tight transition-colors duration-300 ${
                  competitor.highlight ? 'text-gray-900 text-base' : 'text-gray-500 text-sm'
                }`}>
                  {competitor.name}
                </h4>
              </motion.div>
            );
          })}
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
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            {t('pricing.comparator.critere')}
                          </th>
                          {competitors.map((comp, idx) => (
                            <th key={idx} className={`px-4 py-4 text-center text-xs font-black uppercase tracking-widest border-b border-gray-100 ${comp.highlight ? 'text-german-red bg-red-50/30' : 'text-gray-400'}`}>
                              {comp.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {category.features.map((feature, featureIndex) => (
                          <motion.tr
                            key={feature.key}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: featureIndex * 0.05 }}
                            className={`${
                              featureIndex % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'
                            } group hover:bg-blue-50/50 transition-colors duration-200`}
                          >
                            <td className="px-6 py-5 text-sm font-bold text-gray-700 border-b border-gray-100/50">
                              <div className="flex items-center">
                                {feature.highlight && (
                                  <Sparkles className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0 animate-pulse" />
                                )}
                                {feature.key}
                              </div>
                            </td>
                            <td className={`px-4 py-5 text-center border-b border-gray-100/50 ${feature.highlight ? 'bg-green-50/20' : 'bg-german-red/5'}`}>
                              <div className="scale-110">{renderValue(feature.permisCode)}</div>
                            </td>
                            <td className="px-4 py-5 text-center border-b border-gray-100/50 opacity-80 group-hover:opacity-100 transition-opacity">
                              {renderValue(feature.competitor1)}
                            </td>
                            <td className="px-4 py-5 text-center border-b border-gray-100/50 opacity-80 group-hover:opacity-100 transition-opacity">
                              {renderValue(feature.competitor2)}
                            </td>
                            <td className="px-4 py-5 text-center border-b border-gray-100/50 opacity-80 group-hover:opacity-100 transition-opacity">
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
        className="mt-12 bg-white p-10 rounded-3xl text-center shadow-xl border border-gray-100 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-german-black via-german-red to-german-gold"></div>
        
        <div className="flex items-center justify-center mb-6 space-x-3">
          <div className="p-3 bg-yellow-50 rounded-xl">
            <Award className="w-10 h-10 text-yellow-600" />
          </div>
          <h4 className="text-3xl font-black text-gray-900 tracking-tight">{t('pricing.comparison.why_us')}</h4>
          <div className="p-3 bg-yellow-50 rounded-xl">
            <Award className="w-10 h-10 text-yellow-600" />
          </div>
        </div>
        <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
          {t('pricing.comparison.p1')}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default CompetitorComparison;
