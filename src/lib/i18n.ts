import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import de from '../i18n/de.json'
import en from '../i18n/en.json'
import fr from '../i18n/fr.json'

// Les composants Uber Eats utilisent useTranslation('ubereats') et appellent
// t('uber_eats.…') ainsi que t('activation.…'). Les fichiers de langue sont
// plats (cles avec points), sans objet 'ubereats' imbrique : le namespace
// doit donc pointer vers l'integralite des traductions, sans quoi i18next
// ne trouve aucune cle et affiche le nom brut de la cle.
const resources = {
  de: { 
    translation: de,
    ubereats: de
  },
  en: { 
    translation: en,
    ubereats: en
  },
  fr: { 
    translation: fr,
    ubereats: fr
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    supportedLngs: ['de', 'en', 'fr'],
    interpolation: {
      escapeValue: false,
      format: (value, format, lng) => {
        if (format === 'number') {
          return new Intl.NumberFormat(lng).format(value);
        }
        if (value instanceof Date && format) {
          // Use string indexing or casting to avoid TS errors with dynamic date styles
          const options: any = { dateStyle: format };
          return new Intl.DateTimeFormat(lng, options).format(value);
        }
        return value;
      }
    }
  })

export default i18n
