import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Clock, Users as UsersIcon } from 'lucide-react'
import SEOHead from '../components/seo/SEOHead'
import { pageSEO } from '../lib/seoData'
import HeroCarousel from '../components/home/HeroCarousel'
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
    "telephone": "+49 15 212399096",
    "email": "mulerfuhrerschein@gmail.com"
  }

  const currentLang = i18n.language.split('-')[0] as 'de' | 'en' | 'fr';
  const seoData = (pageSEO as any)[currentLang]?.home || pageSEO.de.home;

  const features = [
    {
      icon: Clock,
      title: t('home.features.fast.title'),
      description: t('home.features.fast.desc'),
      color: 'text-german-red'
    },
    {
      icon: Shield,
      title: t('home.features.secure.title'),
      description: t('home.features.secure.desc'),
      color: 'text-red-600'
    },
    {
      icon: UsersIcon,
      title: t('home.features.support.title'),
      description: t('home.features.support.desc'),
      color: 'text-german-red'
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

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-german-black via-german-red to-german-gold bg-clip-text text-transparent leading-tight max-w-3xl mx-auto">
              {t('home.features.title')}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-german-red to-german-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 leading-snug">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
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
      <section className="py-24 bg-gradient-to-br from-gray-900 via-german-red to-german-gold text-white relative overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight max-w-3xl mx-auto">
              {t('home.cta.title')}
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto text-white/80">
              {t('home.cta.subtitle')}
            </p>
            <Link
              to="/application/new"
              className="inline-flex items-center px-10 py-4 bg-white text-german-red font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl text-lg"
            >
              {t('home.cta.button')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
