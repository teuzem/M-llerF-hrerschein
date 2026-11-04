import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SEOHeadProps {
  title?: string;
  titleEn?: string;
  titleFr?: string;
  description?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  keywords?: string;
  keywordsEn?: string;
  keywordsFr?: string;
  image?: string;
  url?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  structuredData?: any;
  businessType?: 'driverSchool' | 'uberEats' | 'both';
  locale?: 'de' | 'en' | 'fr';
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  titleEn,
  titleFr,
  description,
  descriptionEn,
  descriptionFr,
  keywords,
  keywordsEn,
  keywordsFr,
  image = 'https://mulerfuhrerschein.de/images/og-image.jpg',
  url = 'https://mulerfuhrerschein.de',
  canonicalUrl,
  noindex = false,
  structuredData,
  businessType = 'both',
  locale: propLocale,
  city = 'Berlin',
  address = '',
  phone = '+49 15510 626077',
  email = 'mulerfuhrerschein@gmail.com',
}) => {
  const { t, i18n } = useTranslation();
  const currentLocale = propLocale || (i18n.language.split('-')[0] as 'de' | 'en' | 'fr');

  useEffect(() => {
    // Dynamic titles and descriptions from i18n if not provided
    const defaultTitle = t('seo.default_title');
    const defaultDescription = t('seo.default_description');
    const defaultKeywords = 'deutscher Führerschein, driving license Germany, permis allemand, MüllerFührerschein';

    let fullTitle = currentLocale === 'en' ? (titleEn || title || defaultTitle) : 
                    currentLocale === 'fr' ? (titleFr || title || defaultTitle) : 
                    (title || defaultTitle);
    
    let descriptionToUse = currentLocale === 'en' ? (descriptionEn || description || defaultDescription) : 
                           currentLocale === 'fr' ? (descriptionFr || description || defaultDescription) : 
                           (description || defaultDescription);
    
    let keywordsToUse = currentLocale === 'en' ? (keywordsEn || keywords || defaultKeywords) : 
                        currentLocale === 'fr' ? (keywordsFr || keywords || defaultKeywords) : 
                        (keywords || defaultKeywords);

    const brandName = t('footer.company');
    const finalTitle = fullTitle.includes(brandName) 
      ? fullTitle 
      : `${fullTitle} | ${brandName}`;
      
    document.title = finalTitle;
    document.documentElement.lang = currentLocale;

    const setMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    setMetaTag('description', descriptionToUse);
    setMetaTag('keywords', keywordsToUse);
    
    if (noindex) {
      setMetaTag('robots', 'noindex, nofollow');
    }

    setMetaTag('og:title', finalTitle, true);
    setMetaTag('og:description', descriptionToUse, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:url', canonicalUrl || url, true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:locale', currentLocale === 'de' ? 'de_DE' : currentLocale === 'en' ? 'en_US' : 'fr_FR', true);
    
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', finalTitle);
    setMetaTag('twitter:description', descriptionToUse);
    setMetaTag('twitter:image', image);

    // Canonical and Alternates
    const canonicalUrlToUse = canonicalUrl || url;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrlToUse;

    // Structured Data
    let schemaData: any = structuredData || {
      "@context": "https://schema.org",
      "@type": businessType === 'uberEats' ? "Service" : "DrivingSchool",
      "name": businessType === 'uberEats' ? `${brandName} - Uber Eats Service` : brandName,
      "description": descriptionToUse,
      "url": canonicalUrlToUse,
      "logo": `${url}/logo.png`,
      "image": image,
      "telephone": phone,
      "email": email,
      "areaServed": "Germany",
      "priceRange": "€€",
      "availableLanguage": ["de", "en", "fr"]
    };

    const scriptId = 'seo-structured-data';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaData, null, 2);

  }, [
    title, titleEn, titleFr,
    description, descriptionEn, descriptionFr,
    keywords, keywordsEn, keywordsFr,
    image, url, canonicalUrl, noindex, structuredData,
    businessType, currentLocale, city, address, phone, email, t
  ]);

  return null;
};

export default SEOHead;