import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const DashboardFooter: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-3 text-sm text-gray-500">
      <div className="flex justify-between items-center">
        <span>{t('footer.copyright')}</span>
        <div className="flex space-x-4">
          <Link to="/legal" className="hover:text-german-red">{t('footer.links.legal')}</Link>
          <Link to="/privacy" className="hover:text-german-red">{t('footer.links.privacy')}</Link>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
