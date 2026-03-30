import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { supabase, LicenseType } from '../lib/supabase';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Accordion from '../components/ui/Accordion';
import SEOHead from '../components/seo/SEOHead';
import { pageSEO } from '../lib/seoData';
import AdvancedPriceCalculator from '../components/pricing/AdvancedPriceCalculator';
import PriceComparator from '../components/pricing/PriceComparator';
import PackageBuilder from '../components/pricing/PackageBuilder';
import LicenseDetailModal from '../components/pricing/LicenseDetailModal';
import CompetitorComparison from '../components/pricing/CompetitorComparison';

export default function Pricing() {
  const { t, i18n } = useTranslation();
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<LicenseType | null>(null);

  useEffect(() => {
    const fetchLicenseTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('license_types')
          .select('*')
          .eq('is_active', true)
          .order('price_gross_euros');
        if (error) throw error;
        setLicenseTypes(data || []);
      } catch (error) {
        toast.error(t('common.error_loading_prices'));
      } finally {
        setLoading(false);
      }
    };
    fetchLicenseTypes();
  }, [t]);

  const handleOpenModal = (license: LicenseType) => {
    setSelectedLicense(license);
    setIsModalOpen(true);
  };

  const getLocalizedName = (item: any) => {
    const lang = i18n.language.split('-')[0];
    return item[`name_${lang}`] || item.name_de || item.name;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentLang = i18n.language.split('-')[0] as 'de' | 'en' | 'fr';
  const seoData = (pageSEO as any)[currentLang]?.pricing || pageSEO.de.pricing;

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        locale={currentLang}
      />
      <LicenseDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} license={selectedLicense} />

      <section className="bg-gradient-to-br from-german-black via-german-red to-gray-900 text-white py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-4xl lg:text-6xl font-bold mb-4"
          >
            {t('pricing.hero.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto"
          >
            {t('pricing.hero.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-20 space-y-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <AdvancedPriceCalculator licenseTypes={licenseTypes} />
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <CompetitorComparison />
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <PriceComparator licenseTypes={licenseTypes} />
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <PackageBuilder licenseTypes={licenseTypes} />
        </div>
      </section>
      
      <section className="py-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{t('pricing.all_classes')}</h2>
            <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">{t('pricing.select_class')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {licenseTypes.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => handleOpenModal(item)}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md border hover:border-blue-500 hover:shadow-lg transition-all overflow-hidden group"
              >
                {item.image_url && (
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={getLocalizedName(item)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-2 left-2 bg-german-red text-white px-2 py-1 rounded text-xs font-bold">
                      {item.category}
                    </div>
                  </div>
                )}
                <div className="p-4 text-center">
                  {!item.image_url && (
                    <p className="font-bold text-lg text-german-red mb-1">{`${t('common.application')} ${item.category}`}</p>
                  )}
                  <p className="text-sm text-gray-500 mb-2 truncate">{getLocalizedName(item)}</p>
                  <p className="text-2xl font-bold text-gray-800">{item.price_gross_euros}€</p>
                  <div className="flex items-center justify-center text-xs text-gray-400 mt-2 group-hover:text-blue-500 transition-colors">
                    <Info className="w-3 h-3 mr-1"/> {t('pricing.details')}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{t('pricing.faq.title')}</h2>
          </div>
          <div className="space-y-4">
            <Accordion title={t('pricing.faq.q1.title')}>
              <p>{t('pricing.faq.q1.desc')}</p>
            </Accordion>
            <Accordion title={t('pricing.faq.q2.title')}>
              <p>{t('pricing.faq.q2.desc')}</p>
            </Accordion>
            <Accordion title={t('pricing.faq.q3.title')}>
              <p>{t('pricing.faq.q3.desc')}</p>
            </Accordion>
            <Accordion title={t('pricing.faq.q4.title')}>
              <p>{t('pricing.faq.q4.desc')}</p>
            </Accordion>
            <Accordion title={t('pricing.faq.q5.title')}>
              <p>{t('pricing.faq.q5.desc')}</p>
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
}
