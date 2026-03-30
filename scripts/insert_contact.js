import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');
const localesPath = {
  fr: path.join(srcDir, 'i18n/fr.json'),
  en: path.join(srcDir, 'i18n/en.json'),
  de: path.join(srcDir, 'i18n/de.json')
};

const translations = {
  de: {
    "contact.title": "Kontaktieren Sie uns",
    "contact.subtitle": "Wir sind für Sie da. Schreiben Sie uns eine Nachricht.",
    "contact.form.title": "Senden Sie uns eine Nachricht",
    "contact.form.name": "Ihr Name",
    "contact.form.email": "Ihre E-Mail-Adresse",
    "contact.form.subject": "Betreff",
    "contact.form.message": "Ihre Nachricht",
    "contact.form.send": "Nachricht senden",
    "contact.form.success": "Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns in Kürze bei Ihnen.",
    "contact.form.error": "Es gab ein Problem beim Senden Ihrer Nachricht.",
    "contact.info.title": "Kontaktinformationen",
    "contact.info.support": "Support-E-Mail",
    "contact.info.phone": "Telefon",
    "contact.info.address": "Adresse",
    "contact.hours.title": "Öffnungszeiten",
    "contact.hours.days": "Montag - Freitag",
    "contact.hours.time": "08:00 - 18:00 Uhr",
    "contact.hours.support": "Wochenend-Support nur für Notfälle."
  },
  en: {
    "contact.title": "Contact Us",
    "contact.subtitle": "We are here for you. Send us a message.",
    "contact.form.title": "Send us a message",
    "contact.form.name": "Your Name",
    "contact.form.email": "Your Email Address",
    "contact.form.subject": "Subject",
    "contact.form.message": "Your Message",
    "contact.form.send": "Send Message",
    "contact.form.success": "Your message has been sent successfully. We will get back to you shortly.",
    "contact.form.error": "There was a problem sending your message.",
    "contact.info.title": "Contact Information",
    "contact.info.support": "Support Email",
    "contact.info.phone": "Phone",
    "contact.info.address": "Address",
    "contact.hours.title": "Opening Hours",
    "contact.hours.days": "Monday - Friday",
    "contact.hours.time": "08:00 AM - 06:00 PM",
    "contact.hours.support": "Weekend support for emergencies only."
  },
  fr: {
    "contact.title": "Contactez-nous",
    "contact.subtitle": "Nous sommes là pour vous. Envoyez-nous un message.",
    "contact.form.title": "Envoyez-nous un message",
    "contact.form.name": "Votre nom",
    "contact.form.email": "Votre adresse e-mail",
    "contact.form.subject": "Sujet",
    "contact.form.message": "Votre message",
    "contact.form.send": "Envoyer le message",
    "contact.form.success": "Votre message a été envoyé avec succès. Nous vous contacterons sous peu.",
    "contact.form.error": "Un problème est survenu lors de l'envoi de votre message.",
    "contact.info.title": "Informations de contact",
    "contact.info.support": "E-mail d'assistance",
    "contact.info.phone": "Téléphone",
    "contact.info.address": "Adresse",
    "contact.hours.title": "Heures d'ouverture",
    "contact.hours.days": "Lundi - Vendredi",
    "contact.hours.time": "08:00 - 18:00",
    "contact.hours.support": "Assistance le week-end uniquement pour les urgences."
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

console.log('Successfully injected contact translations!');
