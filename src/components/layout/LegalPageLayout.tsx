import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Scale, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LegalPageLayoutProps {
  title: string;
  icon: 'shield' | 'scale' | 'file';
  lastUpdated: string;
  children: React.ReactNode;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, icon, lastUpdated, children }) => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const IconComponent = 
    icon === 'shield' ? ShieldCheck : 
    icon === 'scale' ? Scale : 
    FileText;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-german-red"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <IconComponent className="w-8 h-8 text-german-red" />
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4"
            >
              {title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-500 font-medium"
            >
              {lastUpdated}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex flex-col md:flex-row gap-8 items-start">
        
        {/* Sticky Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 md:sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hidden md:block">
          <nav className="space-y-1">
            <Link 
              to="/legal" 
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === '/legal' ? 'bg-red-50 text-german-red' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Scale className="w-4 h-4 mr-3" />
              {t('legal.title', 'Impressum')}
            </Link>
            <Link 
              to="/privacy" 
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === '/privacy' ? 'bg-red-50 text-german-red' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <ShieldCheck className="w-4 h-4 mr-3" />
              {t('privacy.title', 'Datenschutzerklärung')}
            </Link>
            <Link 
              to="/terms" 
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === '/terms' ? 'bg-red-50 text-german-red' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FileText className="w-4 h-4 mr-3" />
              {t('terms.title', 'AGB')}
            </Link>
          </nav>
        </aside>

        {/* Document Content */}
        <motion.main 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 lg:p-12"
        >
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-german-red hover:prose-a:text-red-700 prose-li:text-gray-600 prose-p:text-gray-600 prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-2xl prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default LegalPageLayout;
