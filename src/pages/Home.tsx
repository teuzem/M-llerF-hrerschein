import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Clock, Users as UsersIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import SEOHead from '../components/seo/SEOHead'
import { pageSEO } from '../lib/seoData'
import HowItWorksSection from '../components/home/HowItWorksSection'
import HomeTestimonialsSection from '../components/home/HomeTestimonialsSection'
import HomeClientsSection from '../components/home/HomeClientsSection'
import GuaranteesSection from '../components/home/GuaranteesSection'
import LicenseGallerySection from '../components/home/LicenseGallerySection'
import HomeFAQSection from '../components/home/HomeFAQSection'

export default function Home() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()

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

  const stats = [
    { number: '15 000+', label: t('home.stats.delivered') },
    { number: t('home.stats.delay'), label: t('home.stats.delay_label', 'Délai moyen') },
    { number: '99%', label: t('home.stats.rate') },
    { number: '24/7', label: t('home.stats.support') }
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-german-black via-german-red to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="grid grid-cols-3 h-full">
              <div className="bg-german-red"></div>
              <div className="bg-white"></div>
              <div className="bg-red-600"></div>
            </div>
          </div>
        </div>
        
        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                {t('home.hero.title')}
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to={user ? "/dashboard" : "/register"}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-german-black via-german-red to-german-gold text-white font-semibold rounded-lg hover:from-blue-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-xl text-lg"
                >
                  {t('home.hero.cta')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-all duration-300 text-lg"
                >
                  {t('home.hero.learn_more')}
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-3xl lg:text-4xl font-bold text-blue-300 mb-2">
                        {stat.number}
                      </div>
                      <div className="text-sm text-blue-100">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-german-black via-german-red to-german-gold bg-clip-text text-transparent">
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
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 ${feature.color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
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
      <section className="py-20 bg-gradient-to-r from-german-black via-german-red to-german-gold text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              {t('home.cta.title')}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
              {t('home.cta.subtitle')}
            </p>
            <Link
              to={user ? "/dashboard" : "/register"}
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
