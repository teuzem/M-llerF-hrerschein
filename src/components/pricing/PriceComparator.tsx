import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GitCompare, Clock, Euro, BookOpen, Briefcase, Check, X } from 'lucide-react';
import { LicenseType } from '../../lib/supabase';

interface PriceComparatorProps {
  licenseTypes: LicenseType[];
}

const PriceComparator: React.FC<PriceComparatorProps> = ({ licenseTypes }) => {
  const { t } = useTranslation();
  const [slots, setSlots] = useState<(LicenseType | null)[]>([null, null, null]);

  const handleSelectChange = (index: number, licenseId: string) => {
    const newSlots = [...slots];
    newSlots[index] = licenseTypes.find(lt => lt.id === licenseId) || null;
    setSlots(newSlots);
  };

  const getUseCase = (category: string) => {
    if (['AM'].includes(category)) return t('pricing.comparator.use_case.moped');
    if (['A1', 'A2', 'A'].includes(category)) return t('pricing.comparator.use_case.moto');
    if (['B1', 'B'].includes(category)) return t('pricing.comparator.use_case.car');
    if (['BE'].includes(category)) return t('pricing.comparator.use_case.car_trailer');
    if (['C1', 'C', 'C1E', 'CE'].includes(category)) return t('pricing.comparator.use_case.goods');
    if (['D1', 'D', 'D1E', 'DE'].includes(category)) return t('pricing.comparator.use_case.people');
    return t('pricing.comparator.use_case.specific');
  }

  const comparisonCriteria = [
    { key: 'price', label: t('pricing.calculator.base_price'), icon: Euro, format: (val: LicenseType) => `${val.price_gross_euros}€` },
    { key: 'time', label: t('services.processing_time'), icon: Clock, format: (val: LicenseType) => `${val.processing_days} ${t('services.days')}` },
    { key: 'theory', label: t('pricing.comparator.theory_test'), icon: BookOpen, format: (val: LicenseType) => val.requires_theory_test ? <Check className="w-5 h-5 text-green-500 mx-auto"/> : <X className="w-5 h-5 text-red-500 mx-auto"/> },
    { key: 'use_case', label: t('pricing.comparator.use_case'), icon: Briefcase, format: (val: LicenseType) => getUseCase(val.category) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
    >
      <div className="flex items-center mb-6">
        <GitCompare className="w-8 h-8 text-red-600 mr-4" />
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{t('pricing.comparator.title')}</h3>
          <p className="text-gray-600">{t('pricing.comparator.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {slots.map((_, index) => (
          <div key={index}>
            <label htmlFor={`compare-select-${index}`} className="block text-sm font-bold text-gray-700 mb-2">{t('pricing.comparator.select_slot', { num: index + 1 })}</label>
            <select
              id={`compare-select-${index}`}
              onChange={(e) => handleSelectChange(index, e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={slots[index]?.id || ''}
            >
              <option value="">-- {t('common.select_prompt')} --</option>
              {licenseTypes.map(lt => (
                <option key={lt.id} value={lt.id}>
                  {`${t('common.application')} ${lt.category}`}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 w-1/4">{t('pricing.comparator.critere')}</th>
              {slots.map((slot, index) => (
                <th key={index} scope="col" className="px-6 py-3 text-center">
                  {slot ? `${t('common.application')} ${slot.category}` : `${t('pricing.comparator.select_slot', { num: index + 1 })}`}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {comparisonCriteria.map((criterion) => (
              <tr key={criterion.key} className="bg-white border-b">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center">
                  <criterion.icon className="w-4 h-4 mr-2 text-gray-500" />
                  {criterion.label}
                </th>
                {slots.map((slot, index) => (
                  <td key={index} className="px-6 py-4 text-center">
                    {slot ? criterion.format(slot) : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default PriceComparator;
