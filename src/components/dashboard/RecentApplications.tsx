import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LicenseApplication } from '../../lib/supabase';
import { ArrowRight } from 'lucide-react';

interface RecentApplicationsProps {
  applications: LicenseApplication[];
}

const ApplicationStatusBadge: React.FC<{ status: LicenseApplication['status'] }> = ({ status }) => {
  const { t } = useTranslation();
  const statusMap = {
    draft: { label: t('dashboard.status.draft'), color: 'gray' },
    pending_payment: { label: t('dashboard.status.pending_payment'), color: 'yellow' },
    submitted: { label: t('dashboard.status.submitted'), color: 'blue' },
    in_review: { label: t('dashboard.status.in_review'), color: 'purple' },
    approved: { label: t('dashboard.status.approved'), color: 'teal' },
    completed: { label: t('dashboard.status.completed'), color: 'green' },
    rejected: { label: t('dashboard.status.rejected'), color: 'red' },
  };

  const colorMap = {
    gray: 'bg-gray-100 text-gray-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-german-gold',
    purple: 'bg-purple-100 text-purple-800',
    teal: 'bg-teal-100 text-teal-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
  };

  const { label, color } = statusMap[status] || statusMap.draft;
  const colorClasses = colorMap[color as keyof typeof colorMap];

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses}`}>
      {label}
    </span>
  );
};

const RecentApplications: React.FC<RecentApplicationsProps> = ({ applications }) => {
  const { t, i18n } = useTranslation();
  const recentApps = applications.slice(0, 3);
  const currentLang = i18n.language.split('-')[0] as 'de' | 'en' | 'fr';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-4">{t('dashboard.applications.recent')}</h2>
      {recentApps.length > 0 ? (
        <ul className="space-y-4">
          {recentApps.map(app => (
            <li key={app.id} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0">
              <div>
                <p className="font-bold text-gray-700">
                  {(app.license_type as any)[`name_${currentLang}`] || app.license_type?.name_de || t('common.application')}
                </p>
                <p className="text-xs text-gray-500 font-mono">{app.application_number || 'N/A'}</p>
              </div>
              <ApplicationStatusBadge status={app.status} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 italic text-center py-4">{t('dashboard.applications.no_records')}</p>
      )}
      <Link to="/dashboard/applications" className="mt-6 text-sm font-bold text-german-red hover:text-red-800 flex items-center justify-center bg-gray-50 py-2 rounded-lg transition-colors">
        {t('dashboard.applications.view_all')}
        <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  );
};

export default RecentApplications;
