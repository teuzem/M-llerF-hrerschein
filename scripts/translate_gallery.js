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
    "testimonials.media_uploader.video_editor.title": "Aperçu et édition vidéo",
    "testimonials.media_uploader.video_editor.controls": "Contrôles d'édition",
    "testimonials.media_uploader.video_editor.brightness": "Luminosité",
    "testimonials.media_uploader.video_editor.contrast": "Contraste",
    "testimonials.media_uploader.video_editor.saturation": "Saturation",
    "testimonials.media_uploader.video_editor.rotation": "Rotation",
    "testimonials.media_uploader.video_editor.reset": "Réinitialiser les filtres",
    "gallery.uploader.login_required": "Veuillez vous connecter pour envoyer des médias.",
    "gallery.uploader.select_file": "Veuillez sélectionner un fichier ou entrer une URL.",
    "gallery.uploader.success": "Médias ajoutés avec succès ! Ils sont en attente de modération.",
    "gallery.uploader.error": "Erreur lors de l'ajout des médias :",
    "gallery.uploader.dropzone": "Déposez le fichier ici ou cliquez pour sélectionner.",
    "gallery.uploader.url_placeholder": "Ou collez une URL (Image, YouTube, TikTok...)",
    "gallery.uploader.preview": "Aperçu",
    "gallery.uploader.submit": "Soumettre le média",
    "gallery.uploader.zoom": "Zoom",
    "gallery.uploader.rotation": "Rotation",
    "gallery.uploader.tools": "Outils",
    "gallery.uploader.flip_horiz": "Miroir horizontal",
    "gallery.uploader.free": "Libre",
    "gallery.uploader.video_desc": "Description de la vidéo",
    "gallery.uploader.video_desc_placeholder": "Description de votre vidéo...",
    "gallery.uploader.video_preview_title": "Aperçu vidéo",
    "gallery.uploader.image_editor_title": "Éditeur d'image",
    "gallery.uploader.video_editing_unavailable": "L'édition vidéo n'est pas disponible pour le moment."
  },
  en: {
    "testimonials.media_uploader.video_editor.title": "Video Preview & Editor",
    "testimonials.media_uploader.video_editor.controls": "Editing Controls",
    "testimonials.media_uploader.video_editor.brightness": "Brightness",
    "testimonials.media_uploader.video_editor.contrast": "Contrast",
    "testimonials.media_uploader.video_editor.saturation": "Saturation",
    "testimonials.media_uploader.video_editor.rotation": "Rotation",
    "testimonials.media_uploader.video_editor.reset": "Reset Filters",
    "gallery.uploader.login_required": "Please log in to upload media.",
    "gallery.uploader.select_file": "Please select a file or enter a URL.",
    "gallery.uploader.success": "Media added successfully! Awaiting moderation.",
    "gallery.uploader.error": "Error adding media:",
    "gallery.uploader.dropzone": "Drop file here or click to select.",
    "gallery.uploader.url_placeholder": "Or paste URL (Image, YouTube, TikTok...)",
    "gallery.uploader.preview": "Preview",
    "gallery.uploader.submit": "Submit Media",
    "gallery.uploader.zoom": "Zoom",
    "gallery.uploader.rotation": "Rotation",
    "gallery.uploader.tools": "Tools",
    "gallery.uploader.flip_horiz": "Flip Horizontal",
    "gallery.uploader.free": "Free",
    "gallery.uploader.video_desc": "Video Description",
    "gallery.uploader.video_desc_placeholder": "Description for your video...",
    "gallery.uploader.video_preview_title": "Video Preview",
    "gallery.uploader.image_editor_title": "Image Editor",
    "gallery.uploader.video_editing_unavailable": "Video editing is currently unavailable."
  },
  de: {
    "testimonials.media_uploader.video_editor.title": "Video-Vorschau & Editor",
    "testimonials.media_uploader.video_editor.controls": "Bearbeitungssteuerungen",
    "testimonials.media_uploader.video_editor.brightness": "Helligkeit",
    "testimonials.media_uploader.video_editor.contrast": "Kontrast",
    "testimonials.media_uploader.video_editor.saturation": "Sättigung",
    "testimonials.media_uploader.video_editor.rotation": "Rotation",
    "testimonials.media_uploader.video_editor.reset": "Filter zurücksetzen",
    "gallery.uploader.login_required": "Bitte melden Sie sich an, um Medien hochzuladen.",
    "gallery.uploader.select_file": "Bitte wählen Sie eine Datei aus oder geben Sie eine URL ein.",
    "gallery.uploader.success": "Medien erfolgreich hinzugefügt! Sie warten auf Moderation.",
    "gallery.uploader.error": "Fehler beim Hinzufügen der Medien:",
    "gallery.uploader.dropzone": "Datei hierher ziehen oder klicken zum Auswählen.",
    "gallery.uploader.url_placeholder": "Oder URL einfügen (Bild, YouTube, TikTok...)",
    "gallery.uploader.preview": "Vorschau",
    "gallery.uploader.submit": "Medien übermitteln",
    "gallery.uploader.zoom": "Zoom",
    "gallery.uploader.rotation": "Rotation",
    "gallery.uploader.tools": "Werkzeuge",
    "gallery.uploader.flip_horiz": "Horizontal spiegeln",
    "gallery.uploader.free": "Frei",
    "gallery.uploader.video_desc": "Video-Beschreibung",
    "gallery.uploader.video_desc_placeholder": "Beschreibung für Ihr Video...",
    "gallery.uploader.video_preview_title": "Video-Vorschau",
    "gallery.uploader.image_editor_title": "Bild-Editor",
    "gallery.uploader.video_editing_unavailable": "Video-Bearbeitung ist derzeit nicht verfügbar."
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

console.log('Successfully injected gallery/testimonials media translations!');
