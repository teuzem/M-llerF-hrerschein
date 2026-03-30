import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';
import { Testimonial } from '../../../lib/supabase';
import { Star } from 'lucide-react';

interface UserRatingDistributionChartProps {
  testimonials: Testimonial[];
}

const UserRatingDistributionChart: React.FC<UserRatingDistributionChartProps> = ({ testimonials }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const distribution = [0, 0, 0, 0, 0]; // Index 0 is 1 star, etc.
    testimonials.forEach(t => {
      if (t.rating >= 1 && t.rating <= 5) {
        distribution[t.rating - 1]++;
      }
    });
    return distribution;
  }, [testimonials]);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'],
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    series: [
      {
        name: 'Bewertungen',
        type: 'bar',
        data: chartData,
        itemStyle: {
          color: '#f59e0b',
          borderRadius: [5, 5, 0, 0],
        },
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Bewertungsverteilung</h2>
      {testimonials.length > 0 ? (
        <ReactECharts option={option} style={{ height: '300px' }} notMerge={true} lazyUpdate={true} />
      ) : (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <Star className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-sm text-gray-500">Keine Bewertungen zum Analysieren vorhanden.</p>
        </div>
      )}
    </div>
  );
};

export default UserRatingDistributionChart;
