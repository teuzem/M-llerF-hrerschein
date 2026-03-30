import React from 'react';
import { Link } from 'react-router-dom';
import { Chrome as Home, RefreshCw, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/seo/SEOHead';

const ServerError = () => {
  const { t } = useTranslation();
  
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      <SEOHead
        title={`500 - ${t('error.500.title')} | MüllerFührerschein`}
        description={t('error.500.description')}
        path="/500"
      />
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-slate-900 mb-4">500</h1>
            <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
            <h2 className="text-3xl font-semibold text-slate-800 mb-4">
              {t('error.500.heading')}
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              {t('error.500.message')}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              {t('error.500.what_can_do')}
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={handleRefresh}
                className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
              >
                <RefreshCw className="w-8 h-8 text-german-red mb-3 group-hover:rotate-180 transition-transform duration-500" />
                <span className="font-medium text-slate-800">{t('error.500.refresh')}</span>
              </button>

              <Link
                to="/"
                className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
              >
                <Home className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-slate-800">{t('error.500.home')}</span>
              </Link>

              <Link
                to="/contact"
                className="flex flex-col items-center justify-center p-6 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group"
              >
                <Mail className="w-8 h-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-slate-800">{t('error.500.contact')}</span>
              </Link>
            </div>
          </div>

          <div className="bg-red-50 rounded-xl p-6 mb-6">
            <h4 className="font-semibold text-slate-800 mb-3">{t('error.500.helpful_tips')}</h4>
            <ul className="text-left space-y-2 text-sm text-slate-700">
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>{t('error.500.tip1')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>{t('error.500.tip2')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>{t('error.500.tip3')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>{t('error.500.tip4')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 rounded-xl p-6">
            <p className="text-sm text-slate-600 mb-3">
              {t('error.500.team_notified')}
            </p>
            <p className="text-xs text-slate-500">
              {t('error.500.error_code')}
            </p>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            {t('error.500.need_help')}{' '}
            <Link to="/contact" className="text-german-red hover:underline">
              {t('error.500.contact_support')}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ServerError;
