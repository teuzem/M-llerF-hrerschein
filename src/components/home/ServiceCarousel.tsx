import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Clock, ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { supabase, LicenseType } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

// Fallback data matching Services page
const fallbackLicenseTypes: LicenseType[] = [
  {
    id: '1', category: 'AM', name_de: 'Moped-Führerschein', name_en: 'Moped License', name_fr: 'Permis Cyclomoteur',
    description_de: 'Mopeds bis 50 ccm und max. 45 km/h', description_en: 'Mopeds up to 50cc and max 45 km/h', description_fr: 'Cyclomoteurs jusqu\'à 50 cm3 et 45 km/h max',
    price_net_euros: 840, price_gross_euros: 1000, vat_rate: 19.0, processing_days: 7, requires_theory_test: true, minimum_age: 16, is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_am_moped.png'
  },
  {
    id: '2', category: 'A1', name_de: 'Leichtkraftrad-Führerschein', name_en: 'Light Motorcycle License', name_fr: 'Permis Moto Légère',
    description_de: 'Motorräder bis 125 ccm und max. 11 kW', description_en: 'Motorcycles up to 125cc and max 11 kW', description_fr: 'Motos jusqu\'à 125 cm3 et 11 kW max',
    price_net_euros: 840, price_gross_euros: 1000, vat_rate: 19.0, processing_days: 10, requires_theory_test: true, minimum_age: 16, is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_a1_motorcycle.png'
  },
  {
    id: '3', category: 'A2', name_de: 'Kraftrad-Führerschein', name_en: 'Restricted Motorcycle License', name_fr: 'Permis Moto Intermédiaire',
    description_de: 'Motorräder bis 35 kW Leistung', description_en: 'Motorcycles up to 35 kW power', description_fr: 'Motos jusqu\'à 35 kW de puissance',
    price_net_euros: 840, price_gross_euros: 1000, vat_rate: 19.0, processing_days: 14, requires_theory_test: true, minimum_age: 18, is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_a2_motorcycle.png'
  },
  {
    id: '4', category: 'A', name_de: 'Motorrad-Führerschein', name_en: 'Full Motorcycle License', name_fr: 'Permis Moto Toutes Catégories',
    description_de: 'Alle Motorräder ohne Leistungsbeschränkung', description_en: 'All motorcycles without power restriction', description_fr: 'Toutes les motos sans restriction de puissance',
    price_net_euros: 840, price_gross_euros: 1000, vat_rate: 19.0, processing_days: 21, requires_theory_test: true, minimum_age: 20, is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_a_full_motorcycle.png'
  },
  {
    id: '5', category: 'B', name_de: 'PKW-Führerschein', name_en: 'Car License', name_fr: 'Permis Voiture (B)',
    description_de: 'PKW bis 3,5 t und max. 8 Sitze', description_en: 'Cars up to 3.5t and max 8 seats', description_fr: 'Voitures jusqu\'à 3,5 t et 8 places max',
    price_net_euros: 1765, price_gross_euros: 2100, vat_rate: 19.0, processing_days: 14, requires_theory_test: true, minimum_age: 18, is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_b_car.png'
  },
  {
    id: '6', category: 'BE', name_de: 'PKW mit Anhänger', name_en: 'Car with Trailer License', name_fr: 'Permis Voiture + Remorque (BE)',
    description_de: 'PKW mit Anhänger über 750 kg', description_en: 'Cars with trailer over 750 kg', description_fr: 'Voitures avec remorque de plus de 750 kg',
    price_net_euros: 1933, price_gross_euros: 2300, vat_rate: 19.0, processing_days: 7, requires_theory_test: false, minimum_age: 18, is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_be_car_trailer.png'
  },
  {
    id: '7', category: 'C1', name_de: 'Klein-LKW-Führerschein', name_en: 'Light Truck License', name_fr: 'Permis Petit Poids Lourd',
    description_de: 'LKW von 3,5 t bis 7,5 t', description_en: 'Trucks from 3.5t up to 7.5t', description_fr: 'Camions de 3,5 t à 7,5 t',
    price_net_euros: 2101, price_gross_euros: 2500, vat_rate: 19.0, processing_days: 21, requires_theory_test: true, minimum_age: 18, is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_c1_truck.png'
  },
  {
    id: '8', category: 'C', name_de: 'LKW-Führerschein', name_en: 'Heavy Truck License', name_fr: 'Permis Poids Lourd (C)',
    description_de: 'LKW über 3,5 t', description_en: 'Trucks over 3.5t', description_fr: 'Camions de plus de 3,5 t',
    price_net_euros: 2521, price_gross_euros: 3000, vat_rate: 19.0, processing_days: 28, requires_theory_test: true, minimum_age: 21, is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_c_heavy_truck.png'
  },
  {
    id: '9', category: 'CE', name_de: 'LKW mit Anhänger', name_en: 'Truck with Trailer License', name_fr: 'Permis Poids Lourd + Remorque (CE)',
    description_de: 'LKW über 3,5 t mit Anhänger', description_en: 'Trucks over 3.5t with trailer', description_fr: 'Camions de plus de 3,5 t avec remorque',
    price_net_euros: 2941, price_gross_euros: 3500, vat_rate: 19.0, processing_days: 35, requires_theory_test: true, minimum_age: 21, is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_ce_heavy_truck_trailer.png'
  },
  {
    id: '10', category: 'D1', name_de: 'Kleinbus-Führerschein', name_en: 'Minibus License', name_fr: 'Permis Minibus',
    description_de: 'Bus mit 9-16 Sitzen', description_en: 'Bus with 9-16 seats', description_fr: 'Bus de 9 à 16 places',
    price_net_euros: 3151, price_gross_euros: 3750, vat_rate: 19.0, processing_days: 35, requires_theory_test: true, minimum_age: 21, is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_d1_minibus.png'
  },
  {
    id: '11', category: 'D', name_de: 'Bus-Führerschein', name_en: 'Bus License', name_fr: 'Permis Bus (D)',
    description_de: 'Bus über 8 Sitze', description_en: 'Bus with more than 8 seats', description_fr: 'Bus de plus de 8 places',
    price_net_euros: 3571, price_gross_euros: 4250, vat_rate: 19.0, processing_days: 42, requires_theory_test: true, minimum_age: 24, is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_d_bus.png'
  },
];

const getCategoryColor = (category: string) => {
  if (['AM', 'A1', 'A2', 'A'].includes(category)) return 'from-orange-500 to-red-500';
  if (['B', 'BE'].includes(category)) return 'from-blue-500 to-blue-600';
  if (['C1', 'C', 'CE'].includes(category)) return 'from-green-500 to-green-600';
  if (['D1', 'D'].includes(category)) return 'from-teal-500 to-teal-600';
  return 'from-gray-500 to-gray-600';
};

export default function ServiceCarousel() {
  const { t, i18n } = useTranslation();
  const { addToCart, isInCart, toggleWishlist, isWishlisted, openOrderModal } = useCart();
  const [services, setServices] = useState<LicenseType[]>(fallbackLicenseTypes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slidesPerView, setSlidesPerView] = useState(3);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language.split('-')[0] as 'de' | 'en' | 'fr';

  // Fetch services from Supabase
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('license_types')
          .select('*')
          .eq('is_active', true)
          .order('category');
        if (!error && data && data.length > 0) {
          setServices(data);
        }
      } catch {
        // Use fallback
      }
    };
    fetchServices();
  }, []);

  // Responsive slides per view
  useEffect(() => {
    const updateSlidesPerView = () => {
      const w = window.innerWidth;
      if (w < 640) setSlidesPerView(1);
      else if (w < 1024) setSlidesPerView(2);
      else if (w < 1280) setSlidesPerView(3);
      else setSlidesPerView(4);
    };
    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);
    return () => window.removeEventListener('resize', updateSlidesPerView);
  }, []);

  const maxIndex = Math.max(0, services.length - slidesPerView);

  // Auto-slide
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPaused, maxIndex]);

  const goTo = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  const handleAddToCart = (license: LicenseType) => {
    const name = (license as any)[`name_${currentLang}`] || license.name_de;
    const desc = (license as any)[`description_${currentLang}`] || license.description_de || '';
    addToCart({
      id: license.id,
      category: license.category,
      name,
      description: desc,
      price: license.price_gross_euros,
      processingDays: license.processing_days,
      imageUrl: license.image_url,
    });
    toast.success(t('cart.added'));
  };

  const slideWidth = 100 / slidesPerView;
  const progressPercentage = maxIndex > 0 ? (currentIndex / maxIndex) * 100 : 0;

  return (
    <section className="py-14 sm:py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            {t('carousel.title')}
          </h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
            {t('carousel.subtitle')}
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-german-red/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex >= maxIndex}
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-german-red/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:border-german-red/30 transition-all shadow-sm"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? t('carousel.play') : t('carousel.pause')}</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-100 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-german-red to-german-gold rounded-full"
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Carousel */}
        <div
          ref={containerRef}
          className="overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            className="flex"
            animate={{ x: `-${currentIndex * slideWidth}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {services.map((license) => {
              const inCart = isInCart(license.id);
              const wishlisted = isWishlisted(license.id);
              const name = (license as any)[`name_${currentLang}`] || license.name_de;
              const desc = (license as any)[`description_${currentLang}`] || license.description_de || '';

              return (
                <div
                  key={license.id}
                  className="flex-shrink-0 px-2 sm:px-3"
                  style={{ width: `${slideWidth}%` }}
                >
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full transition-shadow duration-300"
                  >
                    {/* Image */}
                    <div className="relative h-44 sm:h-48 overflow-hidden group">
                      <img
                        src={license.image_url || '/images/default-license.jpg'}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/default-license.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      {/* Category badge */}
                      <div className="absolute top-4 left-4">
                        <div className={`px-3 py-1.5 bg-gradient-to-r ${getCategoryColor(license.category)} rounded-lg shadow-lg`}>
                          <span className="text-white font-black text-sm">{license.category}</span>
                        </div>
                      </div>

                      {/* Wishlist button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(license.id); }}
                        className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                          wishlisted
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                            : 'bg-white/20 text-white hover:bg-white/40'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                      </button>

                      {/* Name overlay */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-white font-bold text-base sm:text-lg drop-shadow-lg line-clamp-1">
                          {name}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 flex flex-col flex-grow">
                      <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 flex-grow mb-3 leading-relaxed">
                        {desc}
                      </p>

                      {/* Price & Processing */}
                      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-1.5 text-german-red">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{license.processing_days} {t('services.days')}</span>
                        </div>
                        <span className="text-gray-900 font-bold text-lg">
                          {license.price_gross_euros.toLocaleString(currentLang === 'de' ? 'de-DE' : currentLang === 'fr' ? 'fr-FR' : 'en-US')}€
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        {inCart ? (
                          <button
                            onClick={() => openOrderModal()}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all text-sm shadow-lg shadow-green-500/20"
                          >
                            <ArrowRight className="w-4 h-4" />
                            <span>{t('cart.proceed_purchase')}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(license)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-german-red to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all text-sm shadow-lg shadow-german-red/20"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span>{t('cart.add')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'bg-german-red w-6'
                  : 'bg-gray-200 w-2 hover:bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
