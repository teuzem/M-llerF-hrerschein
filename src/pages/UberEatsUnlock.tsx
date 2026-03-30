import { useTranslation } from 'react-i18next';
import SEOHead from '../components/seo/SEOHead';
import UberEatsServices from '../components/ubereats/UberEatsServices';

const UberEatsUnlock = () => {
  const { t } = useTranslation('ubereats');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Déblocage de compte Uber Eats",
    "description": "Débloquez votre compte Uber Eats professionnel en Allemagne avec notre service d'accompagnement",
    "provider": {
      "@type": "Organization",
      "name": "MüllerFührerschein",
      "description": "Service professionnel d'aide à l'obtention de tous types de permis de conduire deutschen/allemands"
    },
    "serviceType": "Déblocage de compte Uber Eats",
    "areaServed": "Allemagne",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "EUR",
      "price": "200€",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      <SEOHead 
        title="Déblocage Compte Uber Eats | Service Professionnel en Allemagne"
        description="Débloquez votre compte Uber Eats professionnel en Allemagne. Service rapide, sécurisé et légal avec accompagnement complet. Prix : 200€ - Délai : 5-7 jours."
        keywords="débloquer compte uber eats, déblocage uber eats, uber eats unlock account germany, uber eats account unlock"
        canonicalUrl="https://permiscode.fr/ubereats/unlock"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('unlock.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('unlock.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">200€</div>
                <div className="text-sm text-gray-600">Prix fixe</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">5-7j</div>
                <div className="text-sm text-gray-600">Délai moyen</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">99%</div>
                <div className="text-sm text-gray-600">Taux de réussite</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Component */}
        <UberEatsServices serviceType="deblocage" />
      </div>
    </>
  );
};

export default UberEatsUnlock;