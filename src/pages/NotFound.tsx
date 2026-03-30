import React from 'react';
import { Link } from 'react-router-dom';
import { Chrome as Home, ArrowLeft, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/seo/SEOHead';

const NotFound = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <SEOHead
        title={`404 - ${t('error.404.title')} | MüllerFührerschein`}
        description={t('error.404.description')}
        path="/404"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-slate-900 mb-4">404</h1>
            <div className="w-24 h-1 bg-german-red mx-auto mb-6"></div>
            <h2 className="text-3xl font-semibold text-slate-800 mb-4">
              {t('error.404.heading')}
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              {t('error.404.message')}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              {t('error.404.what_to_do')}
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                to="/"
                className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
              >
                <Home className="w-8 h-8 text-german-red mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-slate-800">{t('error.404.home')}</span>
              </Link>

              <button
                onClick={() => window.history.back()}
                className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
              >
                <ArrowLeft className="w-8 h-8 text-slate-600 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-slate-800">{t('error.404.back')}</span>
              </button>

              <Link
                to="/services"
                className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
              >
                <Search className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-slate-800">{t('error.404.services')}</span>
              </Link>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6">
            <h4 className="font-semibold text-slate-800 mb-3">{t('error.404.popular_pages')}</h4>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/services"
                className="px-4 py-2 bg-white hover:bg-german-red hover:text-white rounded-lg text-sm font-medium text-slate-700 transition-colors"
              >
                {t('error.404.our_services')}
              </Link>
              <Link
                to="/pricing"
                className="px-4 py-2 bg-white hover:bg-german-red hover:text-white rounded-lg text-sm font-medium text-slate-700 transition-colors"
              >
                {t('error.404.pricing')}
              </Link>
              <Link
                to="/application/new"
                className="px-4 py-2 bg-white hover:bg-german-red hover:text-white rounded-lg text-sm font-medium text-slate-700 transition-colors"
              >
                {t('error.404.new_application')}
              </Link>
              <Link
                to="/contact"
                className="px-4 py-2 bg-white hover:bg-german-red hover:text-white rounded-lg text-sm font-medium text-slate-700 transition-colors"
              >
                {t('error.404.contact')}
              </Link>
            </div>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            {t('error.404.footer_message')}{' '}
            <Link to="/contact" className="text-german-red hover:underline">
              {t('error.404.contact_us')}
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
};

export default NotFound;
