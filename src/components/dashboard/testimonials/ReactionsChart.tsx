import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';
import { Testimonial, ReactionType } from '../../../lib/supabase';

interface ReactionsChartProps {
  testimonials: Testimonial[];
}

const reactionEmojis: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  wow: '😮',
  sad: '😢',
  angry: '😠',
};

const ReactionsChart: React.FC<ReactionsChartProps> = ({ testimonials }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const reactionCounts: Record<ReactionType, number> = {
      like: 0,
      love: 0,
      wow: 0,
      sad: 0,
      angry: 0,
    };

    testimonials.forEach(testimonial => {
      for (const key in testimonial.reactions) {
        const reaction = key as ReactionType;
        if (reactionCounts.hasOwnProperty(reaction)) {
          reactionCounts[reaction] += testimonial.reactions[reaction];
        }
      }
    });

    const labels = Object.keys(reactionCounts).map(key => reactionEmojis[key as ReactionType]);
    const values = Object.values(reactionCounts);

    return { labels, values };
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
      data: chartData.labels,
      axisTick: { alignWithLabel: true },
      axisLabel: { fontSize: 16 }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    series: [
      {
        name: 'Reaktionen',
        type: 'bar',
        barWidth: '60%',
        data: chartData.values,
        itemStyle: {
          color: '#0055A4',
          borderRadius: [5, 5, 0, 0],
        },
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Reaktionen Diagramm</h2>
      <ReactECharts option={option} style={{ height: '300px' }} notMerge={true} lazyUpdate={true} />
    </div>
  );
};

export default ReactionsChart;
