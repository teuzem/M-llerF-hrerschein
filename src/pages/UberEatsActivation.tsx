import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import SEOHead from '../components/seo/SEOHead';
import UberEatsServices from '../components/ubereats/UberEatsServices';

const UberEatsActivation = () => {
  const { t } = useTranslation('ubereats');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Activation de compte Uber Eats",
    "description": "Activez votre compte Uber Eats professionnel en Allemagne avec notre service d'accompagnement",
    "provider": {
      "@type": "Organization",
      "name": "MüllerFührerschein",
      "description": "Professioneller Service für deutschen Führerschein und Uber Eats Fahrerlaubnis in Deutschland"
    },
    "serviceType": "Activation de compte Uber Eats",
    "areaServed": "Allemagne",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "EUR",
      "price": "100€",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      <SEOHead 
        title="Uber Eats Konto Aktivierung | Professioneller Service in Deutschland"
        description="Aktivieren Sie Ihr professionelles Uber Eats Konto in Deutschland. Schneller, sicherer und legaler Service mit vollständiger Begleitung. Preis: 100€ - Frist: 48-72h."
        keywords="uber eats konto aktivieren, uber eats aktivierung, uber eats aktivierung deutschland, uber eats konto aktivierung"
        canonicalUrl="https://mullerfuhrerschein.de/ubereats/activation"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('activation.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('activation.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">100€</div>
                <div className="text-sm text-gray-600">Prix fixe</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">48-72h</div>
                <div className="text-sm text-gray-600">Délai moyen</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Component */}
        <UberEatsServices serviceType="activation" />
      </div>
    </>
  );
};

export default UberEatsActivation;