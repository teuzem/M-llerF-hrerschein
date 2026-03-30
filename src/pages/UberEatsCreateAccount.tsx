import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import SEOHead from '../components/seo/SEOHead';
import UberEatsServices from '../components/ubereats/UberEatsServices';

const UberEatsCreateAccount = () => {
  const { t } = useTranslation('ubereats');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Création de compte Uber Eats",
    "description": "Créez votre compte professionnel Uber Eats en Allemagne avec notre service d'accompagnement",
    "provider": {
      "@type": "Organization",
      "name": "MüllerFührerschein",
      "description": "Professioneller Service für deutschen Führerschein und Uber Eats Fahrerlaubnis in Deutschland"
    },
    "serviceType": "Création de compte Uber Eats",
    "areaServed": "Allemagne",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "EUR",
      "price": "150€",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      <SEOHead 
        title="Uber Eats Konto Erstellung | Professioneller Service in Deutschland"
        description="Erstellen Sie Ihr professionelles Uber Eats Konto in Deutschland. Schneller, sicherer und legaler Service mit vollständiger Begleitung. Preis: 150€ - Frist: 24h."
        keywords="uber eats konto erstellen, uber eats konto deutschland, uber eats registrierung lieferant, uber eats konto erstellen"
        canonicalUrl="https://mullerfuhrerschein.de/ubereats/create-account"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('create_account.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('create_account.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">150€</div>
                <div className="text-sm text-gray-600">Prix fixe</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">24h</div>
                <div className="text-sm text-gray-600">Délai moyen</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">100%</div>
                <div className="text-sm text-gray-600">Légal</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Component */}
        <UberEatsServices serviceType="creation" />
      </div>
    </>
  );
};

export default UberEatsCreateAccount;