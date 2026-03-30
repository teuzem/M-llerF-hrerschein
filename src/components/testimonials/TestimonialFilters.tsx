import React from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { Star } from 'lucide-react';
import { LicenseType } from '../../lib/supabase';
import { regions } from '../../lib/constants';

interface TestimonialFiltersProps {
  licenseTypes: LicenseType[];
  onFilterChange: (filters: any) => void;
  activeFilters: any;
}

const TestimonialFilters: React.FC<TestimonialFiltersProps> = ({ licenseTypes, onFilterChange, activeFilters }) => {
  const { t } = useTranslation();

  const licenseOptions = licenseTypes.map(lt => ({
    value: lt.id,
    label: `${t('common.application')} ${lt.category} - ${lt.name_de}`
  }));

  const regionOptions = regions.map(r => ({ value: r.value, label: r.label }));

  const handleFilter = (key: string, value: any) => {
    onFilterChange((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleRating = (rate: number) => {
    const newRating = activeFilters.rating === rate ? 0 : rate;
    handleFilter('rating', newRating);
  };

  const clearFilters = () => {
    onFilterChange({ rating: 0, license: '', city: '', region: '' });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-8 w-full">
      <h3 className="font-bold text-lg mb-4">{t('testimonials.filters.title')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div>
          <label className="text-sm font-medium">{t('testimonials.filters.rating')}</label>
          <div className="flex items-center mt-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} onClick={() => handleRating(star)} className="w-6 h-6 cursor-pointer" fill={activeFilters.rating >= star ? '#FFC107' : '#E0E0E0'} strokeWidth={0} />
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">{t('testimonials.filters.license')}</label>
          <Select
            options={licenseOptions}
            isClearable
            placeholder={t('filter.all')}
            onChange={(option) => handleFilter('license', option ? option.value : '')}
            value={licenseOptions.find(o => o.value === activeFilters.license) || null}
          />
        </div>
        <div>
          <label className="text-sm font-medium">{t('testimonials.filters.city')}</label>
          <input type="text" placeholder={t('form.city_placeholder')} className="w-full p-2 border border-gray-300 rounded-lg mt-1" onChange={(e) => handleFilter('city', e.target.value)} value={activeFilters.city} />
        </div>
        <div>
          <label className="text-sm font-medium">{t('testimonials.filters.region')}</label>
          <Select
            options={regionOptions}
            isClearable
            placeholder={t('filter.all_regions')}
            onChange={(option) => handleFilter('region', option ? option.value : '')}
            value={regionOptions.find(o => o.value === activeFilters.region) || null}
          />
        </div>
        <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">
          {t('testimonials.filters.clear')}
        </button>
      </div>
    </div>
  );
};

export default TestimonialFilters;
