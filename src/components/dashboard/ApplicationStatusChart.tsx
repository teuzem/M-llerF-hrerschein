import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';
import { LicenseApplication } from '../../lib/supabase';
import { FileText } from 'lucide-react';

interface ApplicationStatusChartProps {
  applications: LicenseApplication[];
}

const ApplicationStatusChart: React.FC<ApplicationStatusChartProps> = ({ applications }) => {
  const { t } = useTranslation();

  const statusMap = {
    draft: { label: t('dashboard.status.draft', 'Entwurf'), color: '#9ca3af' },
    pending_payment: { label: t('dashboard.status.pending_payment', 'Zahlung ausstehend'), color: '#f59e0b' },
    submitted: { label: t('dashboard.status.submitted', 'Eingereicht'), color: '#3b82f6' },
    in_review: { label: t('dashboard.status.in_review', 'In Prüfung'), color: '#8b5cf6' },
    approved: { label: t('dashboard.status.approved', 'Genehmigt'), color: '#14b8a6' },
    completed: { label: t('dashboard.status.completed', 'Abgeschlossen'), color: '#22c55e' },
    rejected: { label: t('dashboard.status.rejected', 'Abgelehnt'), color: '#ef4444' },
  };

  const chartData = useMemo(() => {
    const statusCounts: { [key: string]: number } = {};
    applications.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: statusMap[status as keyof typeof statusMap]?.label || status,
      value: count,
      itemStyle: { color: statusMap[status as keyof typeof statusMap]?.color || '#6b7280' }
    }));
  }, [applications]);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: chartData.map(d => d.name),
    },
    series: [
      {
        name: t('dashboard.status_chart.series_name', 'Antragsstatus'),
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['70%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold',
            formatter: '{c}',
          }
        },
        data: chartData,
      }
    ]
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.status_chart.title', 'Statusübersicht')}</h2>
      {applications.length > 0 ? (
        <ReactECharts option={option} style={{ height: '300px' }} notMerge={true} lazyUpdate={true} />
      ) : (
        <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-500">
          <FileText className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-sm">{t('dashboard.status_chart.empty', 'Keine Anträge zu analysieren.')}</p>
        </div>
      )}
    </div>
  );
};

export default ApplicationStatusChart;
