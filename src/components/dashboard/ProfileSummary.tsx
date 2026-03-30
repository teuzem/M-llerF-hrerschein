import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const ProfileSummary: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.profile_summary.title', 'Profilübersicht')}</h2>
      {profile ? (
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <User className="w-4 h-4 mr-3" />
            <span className="text-sm">{profile.full_name}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Mail className="w-4 h-4 mr-3" />
            <span className="text-sm">{profile.email}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-3" />
            <span className="text-sm">{profile.phone || t('profile.not_provided', 'Nicht angegeben')}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">{t('dashboard.profile_summary.loading', 'Profil wird geladen...')}</p>
      )}
      <Button as={Link} to="/dashboard/profile" variant="secondary" className="w-full mt-6 text-sm">
        {t('dashboard.profile_summary.edit', 'Profil bearbeiten')}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default ProfileSummary;
