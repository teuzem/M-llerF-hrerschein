import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';
import { GalleryMedia } from '../../../lib/supabase';
import { Heart, MessageCircle } from 'lucide-react';

interface MediaInteractionChartProps {
  media: GalleryMedia[];
}

const MediaInteractionChart: React.FC<MediaInteractionChartProps> = ({ media }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const totalLikes = 0; // Temporairement désactivé pour éviter les erreurs de relation
    const totalComments = 0; // Temporairement désactivé pour éviter les erreurs de relation
    return { totalLikes, totalComments };
  }, [media]);

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['Likes', 'Kommentare'] },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: 'Interaktionen',
        type: 'bar',
        barWidth: '40%',
        data: [
          { value: chartData.totalLikes, itemStyle: { color: '#ef4444' } },
          { value: chartData.totalComments, itemStyle: { color: '#3b82f6' } }
        ],
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Interaktionen Diagramm</h2>
      {media.length > 0 ? (
        <ReactECharts option={option} style={{ height: '300px' }} notMerge={true} lazyUpdate={true} />
      ) : (
        <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-500">
          <Heart className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-sm">Keine Interaktionen anzuzeigen.</p>
        </div>
      )}
    </div>
  );
};

export default MediaInteractionChart;
