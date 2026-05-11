
import { Link, useNavigate } from 'react-router-dom';
import { Chrome as Home, ArrowLeft, Search, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/seo/SEOHead';

const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <>
      <SEOHead
        title={`404 - ${t('error.404.title', 'Page Not Found')} | MüllerFührerschein`}
        description={t('error.404.description', 'The page you are looking for could not be found.')}
      />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square bg-german-red/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-2xl w-full text-center relative z-10">
          <div className="mb-10">
            <h1 className="text-[120px] sm:text-[150px] font-black text-gray-900 leading-none tracking-tighter mb-2 drop-shadow-sm">
              4<span className="text-german-red">0</span>4
            </h1>
            <div className="w-20 h-1.5 bg-german-red mx-auto mb-8 rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {t('error.404.heading', 'This Page Does Not Exist')}
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-lg mx-auto">
              {t('error.404.message', 'Sorry, the page you are looking for could not be found. It might have been moved, deleted, or never existed.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('error.404.back', 'Go Back')}
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-german-red to-red-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-900/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              {t('error.404.home', 'Back to Home')}
            </Link>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 text-left max-w-xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
              {t('error.404.popular_pages', 'Popular Links')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/services" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 group transition-colors border border-transparent hover:border-gray-100">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Search className="w-5 h-5 text-german-red" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-german-red transition-colors">{t('error.404.our_services', 'Our Services')}</span>
              </Link>
              <Link to="/application/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 group transition-colors border border-transparent hover:border-gray-100">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-german-red" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-german-red transition-colors">{t('error.404.new_application', 'New Application')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
