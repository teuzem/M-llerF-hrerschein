import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase, Testimonial, LicenseType } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SEOHead from '../components/seo/SEOHead';
import { pageSEO } from '../lib/seoData';
import TestimonialForm from '../components/testimonials/TestimonialForm';
import TestimonialList from '../components/testimonials/TestimonialList';
import RatingSummary from '../components/testimonials/RatingSummary';
import MediaCarousels from '../components/testimonials/MediaCarousels';
import TestimonialFilters from '../components/testimonials/TestimonialFilters';
import Accordion from '../components/ui/Accordion';
import { LayoutGrid, List, MessageCircle, ChevronsRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useLocation } from 'react-router-dom';

const Testimonials: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ rating: 0, license: '', city: '', region: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [testimonialsRes, licensesRes] = await Promise.all([
        supabase
          .from('testimonials')
          .select('*, profiles(avatar_url, full_name)')
          .eq('status', 'approved')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase.from('license_types').select('*').eq('is_active', true)
      ]);

      if (testimonialsRes.error) throw testimonialsRes.error;
      if (licensesRes.error) throw licensesRes.error;

      setTestimonials(testimonialsRes.data as Testimonial[]);
      setLicenseTypes(licensesRes.data as LicenseType[]);
    } catch (error: any) {
      toast.error(t('common.error_loading'));
      console.error("Supabase error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase.channel('public:testimonials')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'transition-all', 'duration-500');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
          }, 3000);
        }, 500);
      }
    }
  }, [location.hash, testimonials]);

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter(t => {
      if (filters.rating > 0 && Math.floor(t.rating) !== filters.rating) return false;
      if (filters.license && !t.license_type_ids?.includes(filters.license)) return false;
      if (filters.city && !t.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.region && !t.region?.toLowerCase().includes(filters.region.toLowerCase())) return false;
      return true;
    });
  }, [testimonials, filters]);

  const currentLang = i18n.language.split('-')[0] as 'de' | 'en' | 'fr';
  const seoData = (pageSEO as any)[currentLang]?.testimonials || pageSEO.de.testimonials;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        locale={currentLang}
      />
      <section className="bg-gradient-to-br from-german-black via-german-red to-gray-900 text-white py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl lg:text-6xl font-bold mb-4">{t('testimonials.title')}</motion.h1>
          <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">{t('testimonials.subtitle')}</motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>
          ) : (
            <RatingSummary testimonials={testimonials} />
          )}

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <TestimonialFilters
              licenseTypes={licenseTypes}
              onFilterChange={setFilters}
              activeFilters={filters}
            />
            <div className="flex items-center space-x-2">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-german-red' : 'text-gray-500 hover:bg-gray-100'}`}><LayoutGrid /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-german-red' : 'text-gray-500 hover:bg-gray-100'}`}><List /></button>
              <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-german-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                {t('testimonials.leave_review')}
              </button>
            </div>
          </div>

          {showForm && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <TestimonialForm onFormSubmit={() => { setShowForm(false); fetchData(); }} licenseTypes={licenseTypes} />
            </motion.div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>
          ) : filteredTestimonials.length > 0 ? (
            <TestimonialList testimonials={filteredTestimonials} viewMode={viewMode} />
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <p className="text-gray-600">{t('testimonials.no_results')}</p>
            </div>
          )}

          {!loading && <MediaCarousels testimonials={testimonials} />}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{t('testimonials.faq.title')}</h2>
          </div>
          <div className="space-y-4">
            <Accordion title={t('testimonials.faq.q1')}><p>{t('testimonials.faq.a1')}</p></Accordion>
            <Accordion title={t('testimonials.faq.q2')}><p>{t('testimonials.faq.a2')}</p></Accordion>
            <Accordion title={t('testimonials.faq.q3')}><p>{t('testimonials.faq.a3')}</p></Accordion>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-gradient-to-r from-german-black via-german-red to-german-gold text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('testimonials.cta.title')}</h2>
          <p className="text-xl mb-8 text-blue-100">{t('testimonials.cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services" className="inline-flex items-center justify-center px-6 py-3 bg-white text-german-red font-semibold rounded-lg hover:bg-gray-100 transition-all">
              {t('testimonials.cta.services')} <ChevronsRight className="w-4 h-4 ml-2" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-german-red transition-all">
              {t('testimonials.cta.pricing')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;
