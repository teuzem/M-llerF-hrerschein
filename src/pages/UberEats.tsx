import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, CreditCard, Shield, Clock, Euro, CheckCircle, ArrowRight, Star, Phone, Mail } from 'lucide-react'
import SEOHead from '../components/seo/SEOHead'
import { useTranslation } from 'react-i18next'

const UberEats = () => {
  const { t } = useTranslation()

  const services = [
    {
      id: 'create',
      title: t('uber_eats.account_creation.title'),
      description: t('uber_eats.account_creation.desc'),
      price: 299,
      duration: '1-2 Tage',
      icon: UserPlus,
      color: 'from-blue-500 to-blue-600',
      features: [
        'Vollständige Kontoerstellung',
        'Dokumentenverifizierung',
        'Führerscheinprüfung',
        'Versicherungseinrichtung',
        'App-Training',
        '24/7 Support'
      ],
      link: '/register'
    },
    {
      id: 'activation',
      title: t('uber_eats.account_activation.title'),
      description: t('uber_eats.account_activation.desc'),
      price: 199,
      duration: '24-48 Stunden',
      icon: CreditCard,
      color: 'from-green-500 to-green-600',
      features: [
        'Status-Überprüfung',
        'Fehlerbehebung',
        'Bankdaten-Verknüpfung',
        'Versicherungs-Updates',
        'Aktivierungstest',
        'Betriebsfreigabe'
      ],
      link: '/register'
    },
    {
      id: 'unlock',
      title: t('uber_eats.account_unblock.title'),
      description: t('uber_eats.account_unblock.desc'),
      price: 399,
      duration: '3-5 Tage',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      features: [
        'Grundlagenerkennung',
        'Dokumenten-Update',
        'Beschwerdeverfahren',
        'Verhandlungen mit Uber',
        'Wiederaktivierung',
        'Zukunftsschutz'
      ],
      link: '/register'
    }
  ]

  const benefits = [
    {
      title: t('uber_eats.benefit.experience'),
      description: t('uber_eats.benefit.experience_desc'),
      icon: Star
    },
    {
      title: t('uber_eats.benefit.speed'),
      description: t('uber_eats.benefit.speed_desc'),
      icon: Clock
    },
    {
      title: t('uber_eats.benefit.guarantee'),
      description: t('uber_eats.benefit.guarantee_desc'),
      icon: CheckCircle
    },
    {
      title: t('uber_eats.benefit.support'),
      description: t('uber_eats.benefit.support_desc'),
      icon: Phone
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Uber Eats Fahrerdienste | MüllerFührerschein Berlin"
        description="Professionelle Uber Eats Fahrerdienste in Berlin: Konto erstellen, aktivieren und entsperren. Schnell, legal und zuverlässig."
        keywords="Uber Eats Fahrer, Uber Eats Konto, Uber Eats Berlin, Fahrerdienst"
        url="https://mulerfuhrerschein.de/uber-eats"
        businessType="foodEstablishment"
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-german-black via-german-red to-gray-900 text-white py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              {t('uber_eats.hero.title')}
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8">
              {t('uber_eats.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="#services"
                className="inline-flex items-center px-8 py-3 bg-german-gold text-german-black font-semibold rounded-lg hover:bg-yellow-400 transition-all duration-300"
              >
                {t('uber_eats.hero.cta_services')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-german-black transition-all duration-300"
              >
                <Phone className="mr-2 w-4 h-4" />
                {t('uber_eats.hero.cta_consultation')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t('uber_eats.services_title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('uber_eats.services_subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                >
                  <div className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-lg flex items-center justify-center mx-auto mt-6`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-center">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2 text-german-red">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{service.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-600 font-bold text-xl">
                        <Euro className="w-5 h-5" />
                        <span>{service.price}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      to={service.link}
                      className={`w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r ${service.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300`}
                    >
                      {t('uber_eats.service.book')}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t('uber_eats.benefits_title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('uber_eats.benefits_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-german-red text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t('uber_eats.faq_title')}
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: t('uber_eats.faq.q1.question'),
                answer: t('uber_eats.faq.q1.answer')
              },
              {
                question: t('uber_eats.faq.q2.question'),
                answer: t('uber_eats.faq.q2.answer')
              },
              {
                question: t('uber_eats.faq.q3.question'),
                answer: t('uber_eats.faq.q3.answer')
              },
              {
                question: t('uber_eats.faq.q4.question'),
                answer: t('uber_eats.faq.q4.answer')
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-german-black via-german-red to-german-gold">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              {t('uber_eats.cta.title')}
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              {t('uber_eats.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-3 bg-white text-german-red font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                <Mail className="mr-2 w-4 h-4" />
                {t('uber_eats.cta.contact')}
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-german-red transition-all duration-300"
              >
                {t('uber_eats.cta.all_services')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default UberEats