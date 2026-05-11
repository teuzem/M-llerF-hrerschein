
import { useTranslation } from 'react-i18next';
import LegalPageLayout from '../components/layout/LegalPageLayout';
import SEOHead from '../components/seo/SEOHead';

export default function Privacy() {
  const { t } = useTranslation();

  // Get the sections array, default to empty array if not found
  const sections = t('privacy.sections', { returnObjects: true }) as { title: string, content: string[] }[];

  return (
    <>
      <SEOHead 
        title={`${t('privacy.title')} | MüllerFührerschein`} 
        description={t('privacy.title')} 
      />
      <LegalPageLayout 
        title={t('privacy.title', 'Datenschutzerklärung')} 
        icon="shield" 
        lastUpdated={t('privacy.last_updated')}
      >
        {Array.isArray(sections) && sections.map((section, index) => (
          <div key={index} className="mb-10">
            <h2>{section.title}</h2>
            {section.content.map((paragraph, pIndex) => (
              <p key={pIndex}>{paragraph}</p>
            ))}
          </div>
        ))}
      </LegalPageLayout>
    </>
  );
}
