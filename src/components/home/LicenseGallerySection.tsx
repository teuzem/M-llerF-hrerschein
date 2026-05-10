import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LicenseItem {
  name: string;
  img: string;
  category: string;
  serviceLink: string;
}

const LicenseGallerySection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');

  const licenses: LicenseItem[] = [
    // Motorcycles
    { name: t('home.gallery.license_AM', 'Mofa/Moped (AM)'), img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&h=600&fit=crop&q=80', category: 'two-wheel', serviceLink: '/services' },
    { name: t('home.gallery.license_A1', 'Leichtkraftrad (A1)'), img: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&h=600&fit=crop&q=80', category: 'two-wheel', serviceLink: '/services' },
    { name: t('home.gallery.license_A2', 'Motorrad 35kW (A2)'), img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop&q=80', category: 'two-wheel', serviceLink: '/services' },
    { name: t('home.gallery.license_A', 'Motorrad (A)'), img: 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&h=600&fit=crop&q=80', category: 'two-wheel', serviceLink: '/services' },
    // Cars
    { name: t('home.gallery.license_B', 'PKW (B)'), img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&q=80', category: 'car', serviceLink: '/services' },
    { name: t('home.gallery.license_B96', 'PKW + Anhänger (B96)'), img: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&h=600&fit=crop&q=80', category: 'car', serviceLink: '/services' },
    { name: t('home.gallery.license_BE', 'PKW + Anhänger (BE)'), img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop&q=80', category: 'car', serviceLink: '/services' },
    // Trucks
    { name: t('home.gallery.license_C1', 'Leichter LKW (C1)'), img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=600&fit=crop&q=80', category: 'truck', serviceLink: '/services' },
    { name: t('home.gallery.license_C', 'LKW (C)'), img: 'https://images.unsplash.com/photo-1586191582066-a50ec9526219?w=800&h=600&fit=crop&q=80', category: 'truck', serviceLink: '/services' },
    { name: t('home.gallery.license_CE', 'LKW + Anhänger (CE)'), img: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&h=600&fit=crop&q=80', category: 'truck', serviceLink: '/services' },
    // Bus
    { name: t('home.gallery.license_D1', 'Kleinbus (D1)'), img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600&fit=crop&q=80', category: 'bus', serviceLink: '/services' },
    { name: t('home.gallery.license_D', 'Bus (D)'), img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop&q=80', category: 'bus', serviceLink: '/services' },
    // Special
    { name: t('home.gallery.license_T', 'Traktor (T)'), img: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=800&h=600&fit=crop&q=80', category: 'special', serviceLink: '/services' },
    { name: t('home.gallery.license_L', 'Land-/Forstwirtschaft (L)'), img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop&q=80', category: 'special', serviceLink: '/services' },
  ];

  const categories = [
    { key: 'all', label: t('home.gallery.filter_all', 'Alle'), count: licenses.length },
    { key: 'car', label: t('home.gallery.filter_car', 'PKW'), count: licenses.filter(l => l.category === 'car').length },
    { key: 'two-wheel', label: t('home.gallery.filter_moto', 'Motorrad'), count: licenses.filter(l => l.category === 'two-wheel').length },
    { key: 'truck', label: t('home.gallery.filter_truck', 'LKW'), count: licenses.filter(l => l.category === 'truck').length },
    { key: 'bus', label: t('home.gallery.filter_bus', 'Bus'), count: licenses.filter(l => l.category === 'bus').length },
    { key: 'special', label: t('home.gallery.filter_special', 'Spezial'), count: licenses.filter(l => l.category === 'special').length },
  ];

  const filtered = filter === 'all' ? licenses : licenses.filter(l => l.category === filter);

  const openLightbox = useCallback((i: number) => {
    setSelectedIndex(i);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    document.body.style.overflow = '';
  }, []);

  const goNext = useCallback(() => {
    if (selectedIndex !== null) setSelectedIndex((selectedIndex + 1) % filtered.length);
  }, [selectedIndex, filtered.length]);

  const goPrev = useCallback(() => {
    if (selectedIndex !== null) setSelectedIndex((selectedIndex - 1 + filtered.length) % filtered.length);
  }, [selectedIndex, filtered.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIndex, closeLightbox, goNext, goPrev]);

  const handleCardClick = (_license: LicenseItem, index: number) => {
    openLightbox(index);
  };

  const handleViewService = (e: React.MouseEvent, serviceLink: string) => {
    e.stopPropagation();
    closeLightbox();
    navigate(serviceLink);
  };

  return (
    <section className="py-14 sm:py-16 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight max-w-2xl mx-auto">{t('home.gallery.title')}</h2>
          <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-lg mx-auto leading-relaxed">{t('home.gallery.subtitle')}</p>
        </motion.div>

        {/* Filter Tabs with count */}
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8">
          {categories.map(cat => (
            <button key={cat.key} onClick={() => setFilter(cat.key)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                filter === cat.key ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900'
              }`}>
              {cat.label}
              <span className={`ml-1 text-[10px] ${filter === cat.key ? 'text-gray-400' : 'text-gray-400'}`}>({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((license, index) => (
              <motion.div
                key={license.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, delay: index * 0.02 }}
                className="relative group cursor-pointer overflow-hidden rounded-lg sm:rounded-xl aspect-[4/3]"
                onClick={() => handleCardClick(license, index)}
              >
                <img src={license.img} alt={license.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
                  <h3 className="text-white font-semibold text-xs sm:text-sm leading-snug">{license.name}</h3>
                </div>
                <div 
                  className="absolute top-2 right-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-german-red transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(license.serviceLink);
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="text-center mt-8">
          <Link to="/services" className="group inline-flex items-center gap-2 text-gray-900 font-semibold hover:text-german-red transition-colors duration-200 text-sm sm:text-base">
            {t('common.view_more', 'Alle Leistungen ansehen')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && filtered[selectedIndex] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={closeLightbox} role="dialog" aria-modal="true">

            <button onClick={closeLightbox} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10" aria-label="Close"><X className="w-5 h-5" /></button>
            <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10" aria-label="Previous"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10" aria-label="Next"><ChevronRight className="w-5 h-5" /></button>

            <motion.div key={selectedIndex} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.2 }}
              className="relative max-w-3xl w-full overflow-hidden rounded-xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <img src={filtered[selectedIndex].img} alt={filtered[selectedIndex].name} className="w-full h-auto max-h-[75vh] object-contain bg-black rounded-t-xl" />
                <div className="bg-black/80 backdrop-blur-sm p-4 sm:p-5 flex items-center justify-between rounded-b-xl">
                  <div>
                    <h3 className="text-white font-bold text-base sm:text-lg">{filtered[selectedIndex].name}</h3>
                    <p className="text-white/50 text-xs sm:text-sm mt-0.5">{selectedIndex + 1} / {filtered.length}</p>
                  </div>
                  <button
                    onClick={(e) => handleViewService(e, filtered[selectedIndex].serviceLink)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-900 font-semibold rounded-lg text-xs sm:text-sm hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    {t('home.gallery.view_service', 'Service ansehen')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LicenseGallerySection;
