
import { Link } from 'react-router-dom';
import { Chrome as Home, RefreshCw, Mail, AlertTriangle } from 'lucide-react';
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
        title={`500 - ${t('error.500.title', 'Server Error')} | MüllerFührerschein`}
        description={t('error.500.description', 'An unexpected error occurred.')}
      />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square bg-german-red/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-2xl w-full text-center relative z-10">
          <div className="mb-10">
            <h1 className="text-[120px] sm:text-[150px] font-black text-gray-900 leading-none tracking-tighter mb-2 drop-shadow-sm flex items-center justify-center gap-4">
              5<AlertTriangle className="w-24 h-24 sm:w-32 sm:h-32 text-german-red" strokeWidth={2.5} />0
            </h1>
            <div className="w-20 h-1.5 bg-german-red mx-auto mb-8 rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {t('error.500.heading', 'Internal Server Error')}
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-lg mx-auto">
              {t('error.500.message', 'Something went wrong on our end. We apologize for the inconvenience and are working to fix it.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={handleRefresh}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <RefreshCw className="w-5 h-5" />
              {t('error.500.refresh', 'Refresh Page')}
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-german-red to-red-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-900/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              {t('error.500.home', 'Back to Home')}
            </Link>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 text-left max-w-xl mx-auto">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-german-red" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{t('error.500.need_help', 'Need urgent assistance?')}</h3>
                <p className="text-sm text-gray-500">{t('error.500.team_notified', 'Our technical team has been notified.')}</p>
              </div>
            </div>
            <Link
              to="/contact"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-200 hover:text-german-red transition-all duration-300"
            >
              {t('error.500.contact_support', 'Contact Support')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServerError;
