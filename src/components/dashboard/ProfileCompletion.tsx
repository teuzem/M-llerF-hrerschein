import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Profile } from '../../lib/supabase';
import { ChevronRight, AlertCircle } from 'lucide-react';

interface ProfileCompletionProps {
  profile: Profile | null;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ profile }) => {
  const { t } = useTranslation();

  const completionData = useMemo(() => {
    if (!profile) return { percent: 0, missing: [] };
    
    const fields = [
      { key: 'full_name', label: t('auth.full_name') },
      { key: 'phone', label: t('auth.phone') },
      { key: 'neph_number', label: t('application.form.neph') },
      { key: 'avatar_url', label: t('profile.avatar', 'Avatar') },
      { key: 'bio', label: t('profile.field.bio', 'Biografie') },
      { key: 'address', label: t('profile.field.address', 'Adresse') },
      { key: 'city', label: t('profile.field.city', 'Stadt') },
      { key: 'postal_code', label: t('profile.field.postal_code', 'PLZ') },
      { key: 'region', label: t('profile.field.region', 'Region') }
    ];
    
    const filledFields = fields.filter(f => {
      const val = profile[f.key as keyof Profile];
      return val !== null && val !== undefined && val !== '';
    });
    
    const missingFields = fields.filter(f => {
      const val = profile[f.key as keyof Profile];
      return val === null || val === undefined || val === '';
    });

    return {
      percent: Math.round((filledFields.length / fields.length) * 100),
      missing: missingFields
    };
  }, [profile, t]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{t('profile.completion', 'Profil vervollständigen')}</h3>
      <p className="text-sm text-gray-500 mb-4">{t('profile.completion_desc', 'Vervollständigen Sie Ihr Profil für eine bessere Erfahrung')}</p>
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">{completionData.percent}%</span>
        {completionData.percent === 100 && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
            {t('dashboard.profile.complete', 'Vollständig')}
          </span>
        )}
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
        <motion.div
          className={`h-2.5 rounded-full ${completionData.percent === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
          initial={{ width: 0 }}
          animate={{ width: `${completionData.percent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {completionData.missing.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            {t('profile.missing_fields', 'Fehlende Angaben')}
          </h4>
          <ul className="space-y-2">
            {completionData.missing.slice(0, 4).map((field, idx) => (
              <li key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group">
                <span className="text-sm text-gray-700 font-medium">{field.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </li>
            ))}
            {completionData.missing.length > 4 && (
              <li className="text-center pt-2">
                <span className="text-xs text-gray-500 font-medium">
                  + {completionData.missing.length - 4} {t('profile.more', 'Weitere')}
                </span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletion;
