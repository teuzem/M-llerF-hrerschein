import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';
import { Testimonial } from '../../../lib/supabase';
import { Share2 } from 'lucide-react';

interface ShareStatsChartProps {
  testimonials: Testimonial[];
}

const ShareStatsChart: React.FC<ShareStatsChartProps> = ({ testimonials }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const shareCounts: { [key: string]: number } = {};

    testimonials.forEach(testimonial => {
      if (testimonial.share_counts) {
        for (const network in testimonial.share_counts) {
          shareCounts[network] = (shareCounts[network] || 0) + (testimonial.share_counts as any)[network];
        }
      }
    });

    return Object.entries(shareCounts)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }))
      .sort((a, b) => b.value - a.value);

  }, [testimonials]);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      top: 20,
      data: chartData.map(d => d.name),
      textStyle: {
        color: '#333'
      }
    },
    series: [
      {
        name: 'Teilungen',
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '24',
            fontWeight: 'bold',
            formatter: '{c}',
          }
        },
        labelLine: {
          show: false
        },
        data: chartData,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function () {
          return Math.random() * 200;
        }
      }
    ],
    color: ['#3b82f6', '#14b8a6', '#f97316', '#ec4899', '#8b5cf6', '#6b7280', '#ef4444']
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Teilungsstatistiken</h2>
      {chartData.length > 0 ? (
        <ReactECharts option={option} style={{ height: '300px' }} notMerge={true} lazyUpdate={true} />
      ) : (
        <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-500">
          <Share2 className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-sm">Keine Teilungsdaten verfügbar</p>
          <p className="text-xs text-gray-400 mt-2">Bewertungen wurden noch nicht geteilt</p>
        </div>
      )}
    </div>
  );
};

export default ShareStatsChart;
