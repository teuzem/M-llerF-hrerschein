import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, ShieldCheck, Headphones } from 'lucide-react'
import SEOHead from '../components/seo/SEOHead'
import { pageSEO } from '../lib/seoData'
import HeroCarousel from '../components/home/HeroCarousel'
import ServiceCarousel from '../components/home/ServiceCarousel'
import HowItWorksSection from '../components/home/HowItWorksSection'
import HomeTestimonialsSection from '../components/home/HomeTestimonialsSection'
import HomeClientsSection from '../components/home/HomeClientsSection'
import GuaranteesSection from '../components/home/GuaranteesSection'
import LicenseGallerySection from '../components/home/LicenseGallerySection'
import HomeFAQSection from '../components/home/HomeFAQSection'

export default function Home() {
  const { t, i18n } = useTranslation()

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "MüllerFührerschein",
    "url": "https://mulerfuhrerschein.de",
    "description": "Ihr vertrauenswürdiger Partner für die Erlangung aller Arten von deutschen Führerscheinen in Berlin und Deutschland. Schnell, sicher und 100% legal.",
    "telephone": "+49 15510 626077",
    "email": "mulerfuhrerschein@gmail.com"
  }

  const currentLang = i18n.language.split('-')[0] as 'de' | 'en' | 'fr';
  const seoData = (pageSEO as any)[currentLang]?.home || pageSEO.de.home;

  const features = [
    {
      icon: Zap,
      title: t('home.features.fast.title'),
      description: t('home.features.fast.desc'),
      color: '#ef4444',
      bg: 'bg-red-50',
    },
    {
      icon: ShieldCheck,
      title: t('home.features.secure.title'),
      description: t('home.features.secure.desc'),
      color: '#10b981',
      bg: 'bg-emerald-50',
    },
    {
      icon: Headphones,
      title: t('home.features.support.title'),
      description: t('home.features.support.desc'),
      color: '#f59e0b',
      bg: 'bg-amber-50',
    }
  ]

  return (
    <div className="min-h-screen">
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        structuredData={structuredData}
        locale={currentLang}
      />
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Service Carousel */}
      <ServiceCarousel />

      {/* Features Section: "Why MüllerFührerschein?" */}
      <section className="py-14 sm:py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight max-w-2xl mx-auto">
              {t('home.features.title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="bg-white border border-gray-100 rounded-xl p-5 sm:p-7 hover:border-gray-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 leading-snug">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm sm:text-[15px]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <GuaranteesSection />
      <LicenseGallerySection />
      <HomeTestimonialsSection />
      <HomeClientsSection />
      <HomeFAQSection />

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gray-900 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight max-w-2xl mx-auto">
              {t('home.cta.title')}
            </h2>
            <p className="text-base sm:text-lg mb-8 text-gray-400 max-w-xl mx-auto leading-relaxed">
              {t('home.cta.subtitle')}
            </p>
            <Link
              to="/services"
              className="inline-flex items-center px-7 py-3.5 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 text-sm sm:text-base"
            >
              {t('home.cta.button')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
