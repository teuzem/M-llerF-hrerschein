import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Clock, Search, FileText, Camera, Edit, Mail, CreditCard, Award, UserPlus, Wifi, WifiOff, ArrowRight } from 'lucide-react'
import { supabase, LicenseType } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import SEOHead from '../components/seo/SEOHead'
import { pageSEO } from '../lib/seoData'
import toast from 'react-hot-toast'
import { useDebounce } from '../hooks/useDebounce'

// Données de fallback en cas de problème Supabase
const fallbackLicenseTypes: LicenseType[] = [
  {
    id: '1',
    category: 'AM',
    name_de: 'Moped-Führerschein',
    name_en: 'Moped License',
    name_fr: 'Permis Cyclomoteur',
    description_de: 'Mopeds bis 50 ccm und max. 45 km/h',
    description_en: 'Mopeds up to 50cc and max 45 km/h',
    description_fr: 'Cyclomoteurs jusqu\'à 50 cm3 et 45 km/h max',
    price_net_euros: 840,
    price_gross_euros: 1000,
    vat_rate: 19.0,
    processing_days: 7,
    requires_theory_test: true,
    minimum_age: 16,
    is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_am_moped.png'
  },
  {
    id: '2',
    category: 'A1',
    name_de: 'Leichtkraftrad-Führerschein',
    name_en: 'Light Motorcycle License',
    name_fr: 'Permis Moto Légère',
    description_de: 'Motorräder bis 125 ccm und max. 11 kW',
    description_en: 'Motorcycles up to 125cc and max 11 kW',
    description_fr: 'Motos jusqu\'à 125 cm3 et 11 kW max',
    price_net_euros: 840,
    price_gross_euros: 1000,
    vat_rate: 19.0,
    processing_days: 10,
    requires_theory_test: true,
    minimum_age: 16,
    is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_a1_motorcycle.png'
  },
  {
    id: '3',
    category: 'A2',
    name_de: 'Kraftrad-Führerschein',
    name_en: 'Restricted Motorcycle License',
    name_fr: 'Permis Moto Intermédiaire',
    description_de: 'Motorräder bis 35 kW Leistung',
    description_en: 'Motorcycles up to 35 kW power',
    description_fr: 'Motos jusqu\'à 35 kW de puissance',
    price_net_euros: 840,
    price_gross_euros: 1000,
    vat_rate: 19.0,
    processing_days: 14,
    requires_theory_test: true,
    minimum_age: 18,
    is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_a2_motorcycle.png'
  },
  {
    id: '4',
    category: 'A',
    name_de: 'Motorrad-Führerschein',
    name_en: 'Full Motorcycle License',
    name_fr: 'Permis Moto Toutes Catégories',
    description_de: 'Alle Motorräder ohne Leistungsbeschränkung',
    description_en: 'All motorcycles without power restriction',
    description_fr: 'Toutes les motos sans restriction de puissance',
    price_net_euros: 840,
    price_gross_euros: 1000,
    vat_rate: 19.0,
    processing_days: 21,
    requires_theory_test: true,
    minimum_age: 20,
    is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_a_full_motorcycle.png'
  },
  {
    id: '5',
    category: 'B',
    name_de: 'PKW-Führerschein',
    name_en: 'Car License',
    name_fr: 'Permis Voiture (B)',
    description_de: 'PKW bis 3,5 t und max. 8 Sitze',
    description_en: 'Cars up to 3.5t and max 8 seats',
    description_fr: 'Voitures jusqu\'à 3,5 t et 8 places max',
    price_net_euros: 1765,
    price_gross_euros: 2100,
    vat_rate: 19.0,
    processing_days: 14,
    requires_theory_test: true,
    minimum_age: 18,
    is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_b_car.png'
  },
  {
    id: '6',
    category: 'BE',
    name_de: 'PKW mit Anhänger',
    name_en: 'Car with Trailer License',
    name_fr: 'Permis Voiture + Remorque (BE)',
    description_de: 'PKW mit Anhänger über 750 kg',
    description_en: 'Cars with trailer over 750 kg',
    description_fr: 'Voitures avec remorque de plus de 750 kg',
    price_net_euros: 1933,
    price_gross_euros: 2300,
    vat_rate: 19.0,
    processing_days: 7,
    requires_theory_test: false,
    minimum_age: 18,
    is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_be_car_trailer.png'
  },
  {
    id: '7',
    category: 'C1',
    name_de: 'Klein-LKW-Führerschein',
    name_en: 'Light Truck License',
    name_fr: 'Permis Petit Poids Lourd',
    description_de: 'LKW von 3,5 t bis 7,5 t',
    description_en: 'Trucks from 3.5t up to 7.5t',
    description_fr: 'Camions de 3,5 t à 7,5 t',
    price_net_euros: 2101,
    price_gross_euros: 2500,
    vat_rate: 19.0,
    processing_days: 21,
    requires_theory_test: true,
    minimum_age: 18,
    is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_c1_truck.png'
  },
  {
    id: '8',
    category: 'C',
    name_de: 'LKW-Führerschein',
    name_en: 'Heavy Truck License',
    name_fr: 'Permis Poids Lourd (C)',
    description_de: 'LKW über 3,5 t',
    description_en: 'Trucks over 3.5t',
    description_fr: 'Camions de plus de 3,5 t',
    price_net_euros: 2521,
    price_gross_euros: 3000,
    vat_rate: 19.0,
    processing_days: 28,
    requires_theory_test: true,
    minimum_age: 21,
    is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_c_heavy_truck.png'
  },
  {
    id: '9',
    category: 'CE',
    name_de: 'LKW mit Anhänger',
    name_en: 'Truck with Trailer License',
    name_fr: 'Permis Poids Lourd + Remorque (CE)',
    description_de: 'LKW über 3,5 t mit Anhänger',
    description_en: 'Trucks over 3.5t with trailer',
    description_fr: 'Camions de plus de 3,5 t avec remorque',
    price_net_euros: 2941,
    price_gross_euros: 3500,
    vat_rate: 19.0,
    processing_days: 35,
    requires_theory_test: true,
    minimum_age: 21,
    is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_ce_heavy_truck_trailer.png'
  },
  {
    id: '10',
    category: 'D1',
    name_de: 'Kleinbus-Führerschein',
    name_en: 'Minibus License',
    name_fr: 'Permis Minibus',
    description_de: 'Bus mit 9-16 Sitzen',
    description_en: 'Bus with 9-16 seats',
    description_fr: 'Bus de 9 à 16 places',
    price_net_euros: 3151,
    price_gross_euros: 3750,
    vat_rate: 19.0,
    processing_days: 35,
    requires_theory_test: true,
    minimum_age: 21,
    is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_d1_minibus.png'
  },
  {
    id: '11',
    category: 'D',
    name_de: 'Bus-Führerschein',
    name_en: 'Bus License',
    name_fr: 'Permis Bus (D)',
    description_de: 'Bus über 8 Sitze',
    description_en: 'Bus with more than 8 seats',
    description_fr: 'Bus de plus de 8 places',
    price_net_euros: 3571,
    price_gross_euros: 4250,
    vat_rate: 19.0,
    processing_days: 42,
    requires_theory_test: true,
    minimum_age: 24,
    is_active: true,
    image_url: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/license_license_d_bus.png'
  }
]

interface AdditionalService {
  id: string;
  name_de: string;
  name_en: string;
  name_fr: string;
  description_de: string;
  description_en: string;
  description_fr: string;
  price_euros: number;
  processing_days: number;
  category: string;
  icon: any;
  image: string;
  color: string;
}

export default function Services() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([])
  const [filteredLicenses, setFilteredLicenses] = useState<LicenseType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [databaseStatus, setDatabaseStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading')
  const [retryCount, setRetryCount] = useState(0)

  const [additionalServices] = useState<AdditionalService[]>([
    {
      id: 'uber-eats-account-creation',
      name_de: 'Uber Eats Konto erstellen',
      name_en: 'Create Uber Eats Account',
      name_fr: 'Créer un compte Uber Eats',
      description_de: 'Professionelle Erstellung Ihres Uber Eats Fahrerkontos mit allen erforderlichen Dokumenten und Verifizierungen.',
      description_en: 'Professional creation of your Uber Eats driver account with all required documents and verifications.',
      description_fr: 'Création professionnelle de votre compte chauffeur Uber Eats avec tous les documents et vérifications requis.',
      price_euros: 299,
      processing_days: 3,
      category: 'UBER_EATS',
      icon: UserPlus,
      image: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/uber_eats_create',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'uber-eats-account-activation',
      name_de: 'Uber Eats Konto aktivieren',
      name_en: 'Activate Uber Eats Account',
      name_fr: 'Activer un compte Uber Eats',
      description_de: 'Schnelle Aktivierung Ihres bestehenden Uber Eats Kontos durch unsere Experten für sofortigen Einsatz.',
      description_en: 'Fast activation of your existing Uber Eats account by our experts for immediate use.',
      description_fr: 'Activation rapide de votre compte Uber Eats existant par nos experts pour une utilisation immédiate.',
      price_euros: 199,
      processing_days: 1,
      category: 'UBER_EATS',
      icon: CreditCard,
      image: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/uber_eats_activate',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'uber-eats-account-unlock',
      name_de: 'Uber Eats Konto entsperren',
      name_en: 'Unlock Uber Eats Account',
      name_fr: 'Débloquer un compte Uber Eats',
      description_de: 'Professionelle Entsperrung von gesperrten oder deaktivierten Uber Eats Konten mit Garantie.',
      description_en: 'Professional unlocking of blocked or deactivated Uber Eats accounts with guarantee.',
      description_fr: 'Déblocage professionnel de comptes Uber Eats bloqués ou désactivés avec garantie.',
      price_euros: 399,
      processing_days: 5,
      category: 'UBER_EATS',
      icon: Award,
      image: 'https://yrdkmbndccaaptchqiyl.supabase.co/storage/v1/object/public/gallery-media/license-images/uber_eats_unlock',
      color: 'from-orange-500 to-orange-600'
    }
  ])
  const [filteredAdditionalServices, setFilteredAdditionalServices] = useState<AdditionalService[]>([])

  useEffect(() => {
    fetchLicenseTypes()
    setFilteredAdditionalServices(additionalServices)
  }, [])

  useEffect(() => {
    const tokens = debouncedSearchTerm.toLowerCase().split(/\s+/).filter(token => token.length > 0);
    
    if (tokens.length === 0) {
      setFilteredLicenses(licenseTypes);
      setFilteredAdditionalServices(additionalServices);
      return;
    }

    const scoreItem = (item: any) => {
      let score = 0;
      const nameFields = [
        item.category || '',
        item.name_de || '',
        item.name_en || '',
        item.name_fr || ''
      ].filter(Boolean).map(s => s.toLowerCase());

      const descFields = [
        item.description_de || '',
        item.description_en || '',
        item.description_fr || ''
      ].filter(Boolean).map(s => s.toLowerCase());

      // Check if all tokens are present somewhere
      const allFields = [...nameFields, ...descFields];
      const matchesAll = tokens.every(token => 
        allFields.some(field => field.includes(token))
      );

      if (!matchesAll) return 0;

      // Calculate score for prioritization
      tokens.forEach(token => {
        // High score for exact category match
        if (item.category?.toLowerCase() === token) score += 100;
        
        // Good score for matches in name fields
        nameFields.forEach(field => {
          if (field === token) score += 50;
          else if (field.includes(token)) score += 20;
        });

        // Lower score for matches in description
        descFields.forEach(field => {
          if (field.includes(token)) score += 5;
        });
      });

      return score;
    };

    const scoredLicenses = licenseTypes
      .map(item => ({ item, score: scoreItem(item) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.item);

    const scoredAdditional = additionalServices
      .map(item => ({ item, score: scoreItem(item) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.item);

    setFilteredLicenses(scoredLicenses);
    setFilteredAdditionalServices(scoredAdditional);
  }, [debouncedSearchTerm, licenseTypes, additionalServices]);

  const fetchLicenseTypes = async (isRetry = false) => {
    if (isRetry) {
      setRetryCount(prev => prev + 1)
    }

    try {
      const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
      const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        setDatabaseStatus('disconnected')
        setLicenseTypes(fallbackLicenseTypes)
        setFilteredLicenses(fallbackLicenseTypes)
        toast.error(t('services.feedback.database_error'))
        return
      }

      setDatabaseStatus('loading')
      const { data, error } = await supabase
        .from('license_types')
        .select('*')
        .eq('is_active', true)
        .order('category')

      if (error) throw new Error(`Database error: ${error.message}`)

      setDatabaseStatus('connected')
      setLicenseTypes(data || fallbackLicenseTypes)
      setFilteredLicenses(data || fallbackLicenseTypes)
      
      if (!isRetry && retryCount === 0) {
        toast.success(t('services.feedback.connected'))
      }
      
    } catch (error: any) {
      console.error('Error fetching license types:', error)
      setDatabaseStatus('disconnected')
      setLicenseTypes(fallbackLicenseTypes)
      setFilteredLicenses(fallbackLicenseTypes)
      
      if (error.message.includes('Network')) {
        toast.error(t('services.feedback.connection_error'))
      } else if (error.message.includes('Database')) {
        toast.error(t('services.feedback.database_error'))
      } else {
        toast.error(t('services.feedback.general_error'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setLoading(true)
    fetchLicenseTypes(true)
  }

  const getCategoryColor = (category: string) => {
    if (['AM', 'A1', 'A2', 'A'].includes(category)) return 'from-orange-500 to-red-500';
    if (['B1', 'B2', 'B', 'BE'].includes(category)) return 'from-blue-500 to-blue-600';
    if (['C1', 'C2', 'C', 'C1E', 'CE'].includes(category)) return 'from-green-500 to-green-600';
    if (['D1', 'D', 'D1E', 'DE'].includes(category)) return 'from-teal-500 to-teal-600';
    return 'from-gray-500 to-gray-600';
  }

  const getCategoryImage = (category: string) => {
    if (['AM', 'A1', 'A2', 'A'].includes(category)) return '/images/motorcycle-default.jpg';
    if (['B1', 'B2', 'B', 'BE'].includes(category)) return '/images/car-default.jpg';
    if (['C1', 'C2', 'C', 'C1E', 'CE'].includes(category)) return '/images/truck-default.jpg';
    if (['D1', 'D', 'D1E', 'DE'].includes(category)) return '/images/bus-default.jpg';
    return '/images/default-license.jpg';
  }

  const requirements = [
    { icon: FileText, text: t('services.requirement1') },
    { icon: Camera, text: t('services.requirement2') },
    { icon: Edit, text: t('services.requirement3') },
    { icon: Mail, text: t('services.requirement4') },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 max-w-md font-medium">
            {databaseStatus === 'loading' ? t('services.feedback.loading') : t('services.feedback.fallback_loading')}
          </p>
        </div>
      </div>
    )
  }

  const currentSEO = pageSEO[i18n.language as 'de' | 'fr' | 'en']?.services;
  const currentLang = i18n.language.split('-')[0] as 'de' | 'en' | 'fr';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SEOHead 
        title={currentSEO?.title}
        description={currentSEO?.description}
        keywords={currentSEO?.keywords}
        locale={currentLang}
      />
      
      <div className="bg-white border-b border-gray-100 py-3 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {databaseStatus === 'connected' ? (
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Online</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                  <WifiOff className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">{t('services.feedback.offline_warning')}</span>
                </div>
              )}
            </div>
            
            {databaseStatus === 'disconnected' && (
              <button
                onClick={handleRetry}
                className="text-sm font-bold text-german-red hover:text-red-800 transition-colors flex items-center"
              >
                {t('services.feedback.try_again')}
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-br from-gray-900 via-german-black to-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight">
              {t('services.title')}
            </h1>
            <p className="text-base lg:text-lg text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
              {t('services.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-2xl mx-auto">
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-6 w-6 text-gray-400 group-focus-within:text-german-red transition-colors" />
              </div>
              <input
                type="text"
                placeholder={t('services.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-2xl border-gray-200 pl-12 pr-4 py-3 shadow-lg focus:border-german-red focus:ring-german-red sm:text-base transition-all"
              />
            </div>
          </div>

          <div className="mb-10 flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchTerm 
                ? t('services.results_found_query', { count: filteredLicenses.length + filteredAdditionalServices.length, query: searchTerm })
                : t('services.results_found', { count: filteredLicenses.length + filteredAdditionalServices.length })
              }
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredLicenses.map((license, index) => (
              <motion.div
                key={license.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-xl hover:shadow-german-red/10 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden flex flex-col border border-gray-50"
              >
                <div className="relative h-48">
                  <img 
                    src={license.image_url || getCategoryImage(license.category)} 
                    alt={(license as any)[`name_${currentLang}`] || license.name_de} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getCategoryImage(license.category);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute top-6 left-6">
                    <div className={`px-4 py-2 bg-gradient-to-r ${getCategoryColor(license.category)} rounded-xl flex items-center justify-center shadow-2xl border border-white/20`}>
                      <span className="text-white font-black text-xl">{license.category}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-6 right-6">
                    <h3 className="text-white font-bold text-xl drop-shadow-lg">
                      {(license as any)[`name_${currentLang}`] || license.name_de}
                    </h3>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-gray-600 mb-4 line-clamp-3 flex-grow text-sm leading-relaxed font-medium">
                    {(license as any)[`description_${currentLang}`] || license.description_de}
                  </p>

                  <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-2 text-german-red">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-bold uppercase tracking-tight">
                        {license.processing_days} {t('services.days')}
                      </span>
                    </div>
                    <div className="text-gray-900 font-bold text-xl tracking-tighter">
                      {license.price_gross_euros.toLocaleString(currentLang === 'de' ? 'de-DE' : 'fr-FR')}€
                    </div>
                  </div>

                  <Button
                    as={Link}
                    to={user ? `/application/form?license=${license.id}` : "/register"}
                    className="w-full py-3 text-base font-bold shadow-german-red/20"
                  >
                    {t('services.select')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            ))}

            {filteredAdditionalServices.map((service, index) => {
              const ServiceIcon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (filteredLicenses.length + index) * 0.05 }}
                  className="bg-white rounded-2xl shadow-xl hover:shadow-german-red/10 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden flex flex-col border border-gray-50 bg-gradient-to-b from-white to-gray-50"
                >
                  <div className="relative h-48">
                    <img 
                      src={service.image} 
                      alt={(service as any)[`name_${currentLang}`] || service.name_de} 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/service-fallback.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute top-6 left-6">
                      <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-2xl border border-white/20`}>
                        <ServiceIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-6 right-6">
                      <h3 className="text-white font-bold text-xl drop-shadow-lg">
                        {(service as any)[`name_${currentLang}`] || service.name_de}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-grow text-sm leading-relaxed font-medium">
                      {(service as any)[`description_${currentLang}`] || service.description_de}
                    </p>

                    <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center space-x-2 text-german-red">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-tight">
                          {service.processing_days} {t('services.days')}
                        </span>
                      </div>
                      <div className="text-gray-900 font-bold text-xl tracking-tighter">
                        {service.price_euros.toLocaleString(currentLang === 'de' ? 'de-DE' : 'fr-FR')}€
                      </div>
                    </div>

                    <Button as={Link} to="/contact" className="w-full py-3 text-base font-bold">
                      {t('services.select')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {filteredLicenses.length === 0 && filteredAdditionalServices.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl shadow-inner border-2 border-dashed border-gray-100">
              <Search className="mx-auto h-20 w-20 text-gray-200 mb-6" />
              <p className="text-2xl font-bold text-gray-900 mb-2">{t('services.no_results')}</p>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {t('services.no_results_help')}
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center px-10 py-4 bg-german-black text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl"
              >
                {t('services.contact_us')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">{t('services.requirements_title')}</h2>
            <p className="text-lg text-gray-600 mt-2 max-w-3xl mx-auto font-medium">{t('services.requirements_desc')}</p>
          </div>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {requirements.map((req, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-german-red/30 transition-all text-center group"
              >
                <div className="w-16 h-16 bg-german-red/5 text-german-red rounded-2xl flex items-center justify-center mb-4 group-hover:bg-german-red group-hover:text-white transition-all duration-300 transform group-hover:rotate-6 shadow-sm">
                  <req.icon className="w-8 h-8" />
                </div>
                <p className="text-base font-bold text-gray-800 leading-tight">{req.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="absolute inset-0 bg-german-black">
          <div className="absolute inset-0 bg-gradient-to-r from-german-black via-german-red/20 to-german-gold/20 opacity-40"></div>
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]"></div>
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 tracking-tighter">
              {t('services.cta.title')}
            </h2>
            <p className="text-base lg:text-lg mb-8 text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
              {t('services.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-4 bg-white text-german-black font-bold text-lg rounded-xl hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 active:scale-95"
              >
                {t('services.cta.contact')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to={user ? "/dashboard" : "/register"}
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white hover:text-german-black transition-all hover:scale-105 active:scale-95"
              >
                {t('services.cta.start')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}