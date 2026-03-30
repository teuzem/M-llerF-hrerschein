import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { Testimonial } from '../../pages/Testimonials';

interface RatingSummaryProps {
  testimonials: Testimonial[];
}

const RatingSummary: React.FC<RatingSummaryProps> = ({ testimonials }) => {
  const { t } = useTranslation();

  const summary = useMemo(() => {
    if (testimonials.length === 0) {
      return { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] };
    }

    const total = testimonials.length;
    const sum = testimonials.reduce((acc, t) => acc + t.rating, 0);
    const average = sum / total;

    const distribution = [5, 4, 3, 2, 1].map(star => {
      const count = testimonials.filter(t => t.rating === star).length;
      return (count / total) * 100;
    });

    return { average, total, distribution };
  }, [testimonials]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="grid md:grid-cols-3 gap-6 items-center">
        <div className="text-center md:text-left border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-6">
          <p className="text-gray-600 text-sm">{t('testimonials.rating_summary.average')}</p>
          <p className="text-4xl font-bold text-gray-800">{summary.average.toFixed(1)}</p>
          <div className="flex justify-center md:justify-start text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5" fill={i < Math.round(summary.average) ? 'currentColor' : 'none'} stroke="currentColor" />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">{t('testimonials.rating_summary.based_on', { count: summary.total })}</p>
        </div>
        <div className="md:col-span-2">
          {summary.distribution.map((percentage, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-gray-700 w-20">{t('testimonials.rating_summary.stars', { count: 5 - index })}</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
              </div>
              <span className="text-gray-500 w-12 text-right">{percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingSummary;
