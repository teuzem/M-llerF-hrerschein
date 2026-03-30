import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');
const localesPath = {
  fr: path.join(srcDir, 'i18n/fr.json'),
  en: path.join(srcDir, 'i18n/en.json'),
  de: path.join(srcDir, 'i18n/de.json')
};

const translations = {
  fr: {
    "pricing.comparison.feature.price_transparency": "Transparence des prix",
    "pricing.comparison.feature.success_rate": "Taux de réussite",
    "pricing.comparison.feature.online_platform": "Plateforme en ligne",
    "pricing.comparison.feature.customer_support": "Support client",
    "pricing.comparison.feature.multilingual": "Support multilingue",
    "pricing.comparison.feature.live_tracking": "Suivi en direct",
    "pricing.comparison.feature.dedicated_advisor": "Conseiller dédié",
    "pricing.comparison.feature.payment_methods": "Moyens de paiement",
    "pricing.comparison.feature.installments": "Paiement en plusieurs fois",
    "pricing.comparison.feature.money_back": "Garantie de remboursement",
    "pricing.comparison.feature.no_hidden_fees": "Aucun frais caché",
    "pricing.comparison.feature.document_verification": "Vérification des documents",
    "pricing.comparison.feature.digital_delivery": "Livraison numérique",
    "pricing.comparison.feature.secure_storage": "Stockage sécurisé",
    "pricing.comparison.feature.auto_reminders": "Rappels automatiques",
    "pricing.comparison.value.7_15_days": "7-15 jours",
    "pricing.comparison.value.30_45_days": "30-45 jours",
    "pricing.comparison.value.20_30_days": "20-30 jours",
    "pricing.comparison.value.25_40_days": "25-40 jours",
    "pricing.comparison.value.24_7": "24h/24 & 7j/7",
    "pricing.comparison.value.business_hours": "Heures de bureau",
    "pricing.comparison.value.limited": "Limité",
    "pricing.comparison.value.all_methods": "Toutes les méthodes",
    "pricing.comparison.value.card_only": "Carte uniquement",
    "pricing.comparison.value.instant": "Instantané",
    "pricing.comparison.value.manual": "Manuel",
    "pricing.comparison.value.slow": "Lent"
  },
  en: {
    "pricing.comparison.feature.price_transparency": "Price Transparency",
    "pricing.comparison.feature.success_rate": "Success Rate",
    "pricing.comparison.feature.online_platform": "Online Platform",
    "pricing.comparison.feature.customer_support": "Customer Support",
    "pricing.comparison.feature.multilingual": "Multilingual Support",
    "pricing.comparison.feature.live_tracking": "Live Tracking",
    "pricing.comparison.feature.dedicated_advisor": "Dedicated Advisor",
    "pricing.comparison.feature.payment_methods": "Payment Methods",
    "pricing.comparison.feature.installments": "Installment Plan",
    "pricing.comparison.feature.money_back": "Money-back Guarantee",
    "pricing.comparison.feature.no_hidden_fees": "No Hidden Fees",
    "pricing.comparison.feature.document_verification": "Document Verification",
    "pricing.comparison.feature.digital_delivery": "Digital Delivery",
    "pricing.comparison.feature.secure_storage": "Secure Storage",
    "pricing.comparison.feature.auto_reminders": "Auto Reminders",
    "pricing.comparison.value.7_15_days": "7-15 days",
    "pricing.comparison.value.30_45_days": "30-45 days",
    "pricing.comparison.value.20_30_days": "20-30 days",
    "pricing.comparison.value.25_40_days": "25-40 days",
    "pricing.comparison.value.24_7": "24/7",
    "pricing.comparison.value.business_hours": "Business Hours",
    "pricing.comparison.value.limited": "Limited",
    "pricing.comparison.value.all_methods": "All Methods",
    "pricing.comparison.value.card_only": "Card Only",
    "pricing.comparison.value.instant": "Instant",
    "pricing.comparison.value.manual": "Manual",
    "pricing.comparison.value.slow": "Slow"
  },
  de: {
    "pricing.comparison.feature.price_transparency": "Preistransparenz",
    "pricing.comparison.feature.success_rate": "Erfolgsquote",
    "pricing.comparison.feature.online_platform": "Online-Plattform",
    "pricing.comparison.feature.customer_support": "Kundensupport",
    "pricing.comparison.feature.multilingual": "Mehrsprachig",
    "pricing.comparison.feature.live_tracking": "Live-Tracking",
    "pricing.comparison.feature.dedicated_advisor": "Eigener Berater",
    "pricing.comparison.feature.payment_methods": "Zahlungsmethoden",
    "pricing.comparison.feature.installments": "Ratenzahlung",
    "pricing.comparison.feature.money_back": "Geld-zurück-Garantie",
    "pricing.comparison.feature.no_hidden_fees": "Keine versteckten Gebühren",
    "pricing.comparison.feature.document_verification": "Dokumentenprüfung",
    "pricing.comparison.feature.digital_delivery": "Digitale Lieferung",
    "pricing.comparison.feature.secure_storage": "Sichere Speicherung",
    "pricing.comparison.feature.auto_reminders": "Auto-Erinnerungen",
    "pricing.comparison.value.7_15_days": "7-15 Tage",
    "pricing.comparison.value.30_45_days": "30-45 Tage",
    "pricing.comparison.value.20_30_days": "20-30 Tage",
    "pricing.comparison.value.25_40_days": "25-40 Tage",
    "pricing.comparison.value.24_7": "24/7",
    "pricing.comparison.value.business_hours": "Geschäftszeiten",
    "pricing.comparison.value.limited": "Begrenzt",
    "pricing.comparison.value.all_methods": "Alle Methoden",
    "pricing.comparison.value.card_only": "Nur Karte",
    "pricing.comparison.value.instant": "Sofortig",
    "pricing.comparison.value.manual": "Manuell",
    "pricing.comparison.value.slow": "Langsam"
  }
};

['fr', 'en', 'de'].forEach(lang => {
  const fileData = JSON.parse(fs.readFileSync(localesPath[lang], 'utf8'));
  const target = translations[lang];
  
  for (const [key, val] of Object.entries(target)) {
    fileData[key] = val;
  }
  
  fs.writeFileSync(localesPath[lang], JSON.stringify(fileData, null, 2), 'utf8');
});

console.log('Successfully injected pricing tags!');
