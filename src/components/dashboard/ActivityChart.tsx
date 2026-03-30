import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';
import { LicenseApplication } from '../../lib/supabase';

interface ActivityChartProps {
  applications: LicenseApplication[];
}

const ActivityChart: React.FC<ActivityChartProps> = ({ applications }) => {
  const { t, i18n } = useTranslation();

  const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return { 
        monthLabel: d.toLocaleString(i18n.language, { month: 'short' }), 
        key: `${d.getFullYear()}-${d.getMonth()}` 
      };
    }).reverse();

    const data = months.map(m => ({
      ...m,
      count: applications.filter(app => {
        const appDate = new Date(app.created_at);
        const appKey = `${appDate.getFullYear()}-${appDate.getMonth()}`;
        return appKey === m.key;
      }).length
    }));

    return {
      labels: data.map(d => d.monthLabel),
      values: data.map(d => d.count),
    };
  }, [applications, i18n.language]);

  const option = {
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.labels,
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    series: [
      {
        name: t('dashboard.activity.series_name', 'Anträge'),
        type: 'line',
        data: chartData.values,
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
                offset: 0, color: 'rgba(0, 85, 164, 0.5)'
            }, {
                offset: 1, color: 'rgba(0, 85, 164, 0)'
            }]
          }
        },
        itemStyle: {
          color: '#0055A4',
        },
        lineStyle: {
          color: '#0055A4',
        },
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.activity.title', 'Aktivitätsverlauf')}</h2>
      <ReactECharts option={option} style={{ height: '300px' }} notMerge={true} lazyUpdate={true} />
    </div>
  );
};

export default ActivityChart;
