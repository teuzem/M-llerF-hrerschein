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
    "dashboard.testimonials.delete_confirm": "Êtes-vous sûr de vouloir supprimer cet avis ?",
    "dashboard.testimonials.delete_success": "Avis supprimé avec succès",
    "dashboard.testimonials.delete_error": "Erreur lors de la suppression de l'avis",
    "dashboard.testimonials.tab_published": "Publié",
    "dashboard.testimonials.tab_pending": "En attente",
    "dashboard.testimonials.tab_rejected": "Rejeté",
    "dashboard.testimonials.title": "Avis Clients",
    "dashboard.testimonials.subtitle": "Gérez vos avis et témoignages",
    "dashboard.testimonials.add_new": "Ajouter un avis",
    "dashboard.testimonials.empty": "Aucun avis disponible",
    "dashboard.media.delete_confirm": "Êtes-vous sûr de vouloir supprimer ce média ?",
    "dashboard.media.delete_success": "Média supprimé avec succès",
    "dashboard.media.delete_error": "Erreur lors de la suppression du média",
    "dashboard.media.tab_published": "Publié",
    "dashboard.media.tab_pending": "En attente",
    "dashboard.media.tab_rejected": "Rejeté",
    "dashboard.media.title": "Mes Médias",
    "dashboard.media.subtitle": "Gérez vos photos et vidéos",
    "dashboard.media.add_new": "Ajouter un média",
    "dashboard.media.type_images": "Images",
    "dashboard.media.type_videos": "Vidéos",
    "dashboard.media.empty": "Aucun média disponible",
    "testimonials.media_uploader.mode_upload": "Téléverser",
    "testimonials.media_uploader.mode_url": "Lien URL",
    "testimonials.media_uploader.dropzone": "Glissez et déposez vos fichiers ici, ou cliquez pour sélectionner",
    "testimonials.media_uploader.file_types": "Images (JPG, PNG) ou Vidéos (MP4)",
    "testimonials.media_uploader.url_placeholder": "Collez une URL externe (YouTube, Image, etc.)...",
    "testimonials.media_uploader.add": "Ajouter",
    "testimonials.media_uploader.video_preview": "Aperçu de la vidéo",
    "testimonials.media_uploader.edit_media": "Modifier le média",
    "testimonials.media_uploader.remove": "Supprimer"
  },
  en: {
    "dashboard.testimonials.delete_confirm": "Are you sure you want to delete this review?",
    "dashboard.testimonials.delete_success": "Review successfully deleted",
    "dashboard.testimonials.delete_error": "Error deleting the review",
    "dashboard.testimonials.tab_published": "Published",
    "dashboard.testimonials.tab_pending": "Pending",
    "dashboard.testimonials.tab_rejected": "Rejected",
    "dashboard.testimonials.title": "Testimonials",
    "dashboard.testimonials.subtitle": "Manage your customer reviews",
    "dashboard.testimonials.add_new": "Add New Review",
    "dashboard.testimonials.empty": "No reviews available",
    "dashboard.media.delete_confirm": "Are you sure you want to delete this media?",
    "dashboard.media.delete_success": "Media successfully deleted",
    "dashboard.media.delete_error": "Error deleting media",
    "dashboard.media.tab_published": "Published",
    "dashboard.media.tab_pending": "Pending",
    "dashboard.media.tab_rejected": "Rejected",
    "dashboard.media.title": "My Media",
    "dashboard.media.subtitle": "Manage your photos and videos",
    "dashboard.media.add_new": "Add New Media",
    "dashboard.media.type_images": "Images",
    "dashboard.media.type_videos": "Videos",
    "dashboard.media.empty": "No media available",
    "testimonials.media_uploader.mode_upload": "Upload",
    "testimonials.media_uploader.mode_url": "URL Link",
    "testimonials.media_uploader.dropzone": "Drag and drop your files here, or click to select",
    "testimonials.media_uploader.file_types": "Images (JPG, PNG) or Videos (MP4)",
    "testimonials.media_uploader.url_placeholder": "Paste an external URL (YouTube, Image, etc.)...",
    "testimonials.media_uploader.add": "Add",
    "testimonials.media_uploader.video_preview": "Video Preview",
    "testimonials.media_uploader.edit_media": "Edit Media",
    "testimonials.media_uploader.remove": "Remove"
  },
  de: {
    "dashboard.testimonials.delete_confirm": "Sind Sie sicher, dass Sie diese Bewertung löschen möchten?",
    "dashboard.testimonials.delete_success": "Bewertung erfolgreich gelöscht",
    "dashboard.testimonials.delete_error": "Fehler beim Löschen der Bewertung",
    "dashboard.testimonials.tab_published": "Veröffentlicht",
    "dashboard.testimonials.tab_pending": "Ausstehend",
    "dashboard.testimonials.tab_rejected": "Abgelehnt",
    "dashboard.testimonials.title": "Bewertungen",
    "dashboard.testimonials.subtitle": "Verwalten Sie Ihre Kundenbewertungen",
    "dashboard.testimonials.add_new": "Neue Bewertung hinzufügen",
    "dashboard.testimonials.empty": "Keine Bewertungen vorhanden",
    "dashboard.media.delete_confirm": "Sind Sie sicher, dass Sie dieses Medium löschen möchten?",
    "dashboard.media.delete_success": "Medium erfolgreich gelöscht",
    "dashboard.media.delete_error": "Fehler beim Löschen des Mediums",
    "dashboard.media.tab_published": "Veröffentlicht",
    "dashboard.media.tab_pending": "Ausstehend",
    "dashboard.media.tab_rejected": "Abgelehnt",
    "dashboard.media.title": "Meine Medien",
    "dashboard.media.subtitle": "Verwalten Sie Ihre Bilder und Videos",
    "dashboard.media.add_new": "Neue Medien hinzufügen",
    "dashboard.media.type_images": "Bilder",
    "dashboard.media.type_videos": "Videos",
    "dashboard.media.empty": "Keine Medien vorhanden",
    "testimonials.media_uploader.mode_upload": "Hochladen",
    "testimonials.media_uploader.mode_url": "URL-Link",
    "testimonials.media_uploader.dropzone": "Ziehen Sie Ihre Dateien hierher oder klicken Sie",
    "testimonials.media_uploader.file_types": "Bilder (JPG, PNG) oder Videos (MP4)",
    "testimonials.media_uploader.url_placeholder": "Externe URL einfügen (YouTube, Bild, etc.)...",
    "testimonials.media_uploader.add": "Hinzufügen",
    "testimonials.media_uploader.video_preview": "Video-Vorschau",
    "testimonials.media_uploader.edit_media": "Medium bearbeiten",
    "testimonials.media_uploader.remove": "Entfernen"
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

console.log('Successfully injected dashboard testamonials and media translations!');
