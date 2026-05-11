
import { useTranslation } from 'react-i18next';
import LegalPageLayout from '../components/layout/LegalPageLayout';
import SEOHead from '../components/seo/SEOHead';

export default function Legal() {
  const { t } = useTranslation();

  // Get the sections array, default to empty array if not found
  const sections = t('legal.sections', { returnObjects: true }) as { title: string, content: string[] }[];

  return (
    <>
      <SEOHead 
        title={`${t('legal.title')} | MüllerFührerschein`} 
        description={t('legal.disclaimer_text')} 
      />
      <LegalPageLayout 
        title={t('legal.title', 'Impressum')} 
        icon="scale" 
        lastUpdated={t('legal.last_updated')}
      >
        <div className="p-5 bg-gray-50 border-l-4 border-german-red rounded-r-xl mb-10">
          <p className="font-bold text-gray-900 m-0 text-lg">{t('legal.disclaimer_title')}</p>
          <p className="text-gray-600 m-0 mt-2">{t('legal.disclaimer_text')}</p>
        </div>

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
