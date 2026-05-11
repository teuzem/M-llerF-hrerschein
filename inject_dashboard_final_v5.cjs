const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\Users\\DELL\\Downloads\\mulerfuhrerschein-website\\mulerfuhrerschein-main\\src\\i18n';

const textData = {
  en: {
    dashboard: {
      nav: {
        dashboard: "Dashboard",
        applications: "Applications",
        documents: "Documents",
        profile: "Profile",
        testimonials: "Testimonials",
        media: "Media",
        messages: "Messages",
        help: "Help & Support"
      },
      home: {
        title: "User Dashboard",
        user: "User",
        subtitle: "Welcome back to your driving license workspace.",
        new_application: "New Application",
        in_progress: "In Progress",
        completed: "Completed",
        total_spent: "Total Expenses"
      },
      activity: {
        title: "Activity History",
        series_name: "Applications"
      },
      status_chart: {
        title: "Status Overview",
        series_name: "Application Status",
        empty: "No applications to analyze."
      },
      applications: {
        subtitle: "Manage and track your license applications.",
        new: "Start New Application",
        no_records: "No applications found.",
        recent: "Recent Applications",
        view_all: "View All Applications"
      },
      documents: {
        title: "Documents",
        subtitle: "Manage your uploaded documents and certificates.",
        application: "Application",
        no_docs_app: "No documents for this application.",
        no_docs: "No documents found",
        no_docs_desc: "Your documents will appear here once you start an application.",
        error_loading: "Error loading documents: ",
        error_download: "Error downloading file."
      },
      profile: {
        title: "My Profile",
        subtitle: "Manage your personal information and account settings.",
        update_success: "Profile updated successfully.",
        password_weak: "Password is too weak.",
        password_success: "Password updated successfully.",
        language_updated: "Language updated successfully.",
        privacy_updated: "Privacy settings updated.",
        avatar_updated: "Avatar updated!",
        cover_updated: "Cover image updated!",
        cover_deleted: "Cover image removed.",
        edit_cover: "Edit Cover",
        upload_cover: "Upload Photo",
        remove_cover: "Remove Cover",
        unnamed: "Unnamed User",
        role_admin: "Administrator",
        role_student: "Student",
        member_since: "Member since",
        not_provided: "Not provided",
        about: "About Me",
        no_bio: "No biography yet.",
        settings: "Account Settings",
        public_profile: "Public Profile",
        language: "Preferred Language",
        contact_info: "Contact & Address",
        social_media: "Social Networks",
        no_social_links: "No social links added.",
        privacy_security: "Security & 2FA",
        change_password: "Change Password",
        password_min_length: "Min. 6 characters",
        password_mismatch: "Passwords do not match",
        confirm_password: "Confirm Password",
        update_password: "Update Password",
        two_factor: "Two-Factor Authentication (2FA)",
        danger_zone: "Danger Zone",
        delete_warning: "Deleting your account is permanent and cannot be undone.",
        delete_account: "Delete Account",
        delete_confirm_text: "Type DELETE to confirm account deletion:",
        deleting: "Deleting...",
        delete_permanently: "Permanently Delete",
        validation: {
          phone_format: "Invalid phone format (must match +49... or 0...)",
          postal_code: "Postal code must be 5 digits",
          neph_format: "NEPH must be 12 digits"
        },
        field: {
          bio: "Biography",
          bio_placeholder: "Tell us a bit about yourself...",
          neph: "NEPH Number",
          address: "Address",
          city: "City",
          postal_code: "Postal Code",
          region: "Region"
        }
      },
      profile_summary: {
        title: "Profile Summary",
        loading: "Loading profile...",
        edit: "Edit Profile"
      },
      status: {
        draft: "Draft",
        pending_payment: "Pending Payment",
        submitted: "Submitted",
        in_review: "In Review",
        approved: "Approved",
        completed: "Completed",
        rejected: "Rejected"
      },
      table: {
        id: "ID",
        type: "Category",
        date: "Date",
        amount: "Amount",
        status: "Status",
        actions: "Actions"
      },
      action: {
        view: "View Details",
        pay: "Pay Now"
      },
      testimonials: {
        title: "Testimonials",
        subtitle: "Manage your reviews and feedback.",
        add_new: "Write a Review",
        delete_confirm: "Are you sure you want to delete this review?",
        delete_success: "Review deleted successfully",
        delete_error: "Error deleting review",
        tab_published: "Published",
        tab_pending: "Pending",
        tab_rejected: "Rejected",
        empty: "No testimonials yet."
      },
      media: {
        title: "Media Gallery",
        subtitle: "Manage your videos and photos.",
        add_new: "Upload New Media",
        delete_confirm: "Are you sure you want to delete this media?",
        delete_success: "Media deleted successfully",
        delete_error: "Error deleting media",
        tab_published: "Published",
        tab_pending: "Pending",
        tab_rejected: "Rejected",
        type_images: "Images",
        type_videos: "Videos",
        empty: "No media yet."
      },
      messages: {
        title: "Messages",
        subtitle: "Direct communication with our support team."
      },
      help: {
        title: "Help & Support",
        subtitle: "Find answers to frequently asked questions.",
        search_placeholder: "Search our help articles...",
        no_results: "No results found",
        article: {
          last_update: "Last updated: ",
          back_help: "Back to Help",
          back_kb: "Back to Knowledge Base",
          not_found: "Article not found."
        }
      }
    },
    chat: {
      title: "Messages",
      new_message: "New Message",
      select_conversation: "Select a conversation to start messaging",
      search_placeholder: "Search chats or contacts...",
      conversations: "Chats",
      contacts: "Contacts",
      no_conversations: "No chats yet",
      no_conversations_desc: "Your conversations will appear here.",
      no_contacts: "No contacts found.",
      admin_badge: "Support",
      online: "Online",
      offline: "Offline",
      tipping: "typing...",
      just_seen: "Just seen",
      seen_minutes: "Seen {{count}} min ago",
      seen_hours: "Seen {{count}} hours ago",
      last_seen: "Last seen",
      last_seen_on: "Seen on {{date}}",
      today: "Today",
      yesterday: "Yesterday",
      search_messages: "Search messages",
      results_count: "{{count}} results",
      load_more: "Load older messages",
      encryption_notice: "Messages and calls are end-to-end encrypted.",
      reply_to: "Reply to",
      error_loading: "Error loading messages.",
      error_start_convo: "Error starting conversation.",
      send_error: "Message could not be sent.",
      shared_location: "📍 Shared a location",
      location_error: "Location access denied.",
      voice_upload_error: "Error uploading voice message.",
      voice_message: "Voice message",
      mic_access_denied: "Microphone access denied.",
      recording: "Recording...",
      cancel: "Cancel",
      send: "Send",
      document: "Document",
      photos_videos: "Photos & Videos",
      gif: "GIF",
      location: "Location",
      contact: "Contact",
      replying_placeholder: "Type a reply...",
      type_message: "Type a message...",
      drag_drop_title: "Drop files here",
      drag_drop_subtitle: "Images, Videos, Audios or Documents"
    }
  },
  de: {
    dashboard: {
      nav: {
        dashboard: "Dashboard",
        applications: "Anträge",
        documents: "Dokumente",
        profile: "Profil",
        testimonials: "Bewertungen",
        media: "Medien",
        messages: "Nachrichten",
        help: "Hilfe & Support"
      },
      home: {
        title: "Benutzer-Dashboard",
        user: "Benutzer",
        subtitle: "Willkommen zurück in Ihrem Führerschein-Arbeitsbereich.",
        new_application: "Neuer Antrag",
        in_progress: "In Bearbeitung",
        completed: "Abgeschlossen",
        total_spent: "Gesamtausgaben"
      },
      activity: {
        title: "Aktivitätsverlauf",
        series_name: "Anträge"
      },
      status_chart: {
        title: "Statusübersicht",
        series_name: "Antragsstatus",
        empty: "Keine Anträge zu analysieren."
      },
      applications: {
        subtitle: "Verwalten und verfolgen Sie Ihre Führerscheinanträge.",
        new: "Neuen Antrag starten",
        no_records: "Keine Anträge gefunden.",
        recent: "Aktuelle Anträge",
        view_all: "Alle Anträge anzeigen"
      },
      documents: {
        title: "Dokumente",
        subtitle: "Verwalten Sie Ihre hochgeladenen Dokumente und Zertifikate.",
        application: "Antrag",
        no_docs_app: "Keine Dokumente für diesen Antrag.",
        no_docs: "Keine Dokumente gefunden",
        no_docs_desc: "Ihre Dokumente erscheinen hier, sobald Sie einen Antrag gestartet haben.",
        error_loading: "Fehler beim Laden der Dokumente: ",
        error_download: "Fehler beim Herunterladen der Datei."
      },
      profile: {
        title: "Mein Profil",
        subtitle: "Verwalten Sie Ihre persönlichen Informationen und Kontoeinstellungen.",
        update_success: "Profil erfolgreich aktualisiert.",
        password_weak: "Passwort ist zu schwach.",
        password_success: "Passwort erfolgreich aktualisiert.",
        language_updated: "Sprache erfolgreich aktualisiert.",
        privacy_updated: "Datenschutzeinstellungen aktualisiert.",
        avatar_updated: "Avatar aktualisiert!",
        cover_updated: "Titelbild aktualisiert!",
        cover_deleted: "Titelbild entfernt.",
        edit_cover: "Titelbild bearbeiten",
        upload_cover: "Foto hochladen",
        remove_cover: "Titelbild entfernt",
        unnamed: "Unbenannter Nutzer",
        role_admin: "Administrator",
        role_student: "Fahrschüler",
        member_since: "Mitglied seit",
        not_provided: "Nicht angegeben",
        about: "Steckbrief",
        no_bio: "Noch keine Biografie.",
        settings: "Kontoeinstellungen",
        public_profile: "Öffentliches Profil",
        language: "Bevorzugte Sprache",
        contact_info: "Kontakt & Adresse",
        social_media: "Soziale Netzwerke",
        no_social_links: "Keine sozialen Netzwerke verlinkt.",
        privacy_security: "Sicherheit & 2FA",
        change_password: "Passwort ändern",
        password_min_length: "Min. 6 Zeichen",
        password_mismatch: "Passwörter stimmen nicht überein",
        confirm_password: "Passwort bestätigen",
        update_password: "Passwort aktualisieren",
        two_factor: "Zwei-Faktor-Authentifizierung (2FA)",
        danger_zone: "Gefahrenzone",
        delete_warning: "Das Löschen Ihres Kontos ist endgültig und kann nicht rückgängig gemacht werden.",
        delete_account: "Konto löschen",
        delete_confirm_text: "Geben Sie DELETE ein, um die Löschung zu bestätigen:",
        deleting: "Löschen...",
        delete_permanently: "Unwiderruflich löschen",
        validation: {
          phone_format: "Ungültiges Telefonformat (+49... oder 0...)",
          postal_code: "Postleitzahl muss 5-stellig sein",
          neph_format: "NEPH muss 12-stellig sein"
        },
        field: {
          bio: "Biografie",
          bio_placeholder: "Erzählen Sie uns etwas über sich...",
          neph: "NEPH-Nummer",
          address: "Adresse",
          city: "Stadt",
          postal_code: "Postleitzahl",
          region: "Region"
        }
      },
      profile_summary: {
        title: "Profilübersicht",
        loading: "Profil wird geladen...",
        edit: "Profil bearbeiten"
      },
      status: {
        draft: "Entwurf",
        pending_payment: "Zahlung ausstehend",
        submitted: "Eingereicht",
        in_review: "In Prüfung",
        approved: "Genehmigt",
        completed: "Abgeschlossen",
        rejected: "Abgelehnt"
      },
      table: {
        id: "ID",
        type: "Klasse",
        date: "Datum",
        amount: "Betrag",
        status: "Status",
        actions: "Aktionen"
      },
      action: {
        view: "Details anzeigen",
        pay: "Jetzt bezahlen"
      },
      testimonials: {
        title: "Bewertungen",
        subtitle: "Verwalten Sie Ihre Bewertungen und Ihr Feedback.",
        add_new: "Bewertung schreiben",
        delete_confirm: "Sind Sie sicher, dass Sie diese Bewertung löschen möchten?",
        delete_success: "Bewertung erfolgreich gelöscht",
        delete_error: "Fehler beim Löschen der Bewertung",
        tab_published: "Veröffentlicht",
        tab_pending: "Ausstehend",
        tab_rejected: "Abgelehnt",
        empty: "Keine Bewertungen vorhanden"
      },
      media: {
        title: "Mediathek",
        subtitle: "Verwalten Sie Ihre Videos und Fotos.",
        add_new: "Neue Medien hochladen",
        delete_confirm: "Sind Sie sicher, dass Sie dieses Medium löschen möchten?",
        delete_success: "Medium erfolgreich gelöscht",
        delete_error: "Fehler beim Löschen des Mediums",
        tab_published: "Veröffentlicht",
        tab_pending: "Ausstehend",
        tab_rejected: "Abgelehnt",
        type_images: "Bilder",
        type_videos: "Videos",
        empty: "Keine Medien vorhanden"
      },
      messages: {
        title: "Nachrichten",
        subtitle: "Direkte Kommunikation mit unserem Support-Team."
      },
      help: {
        title: "Hilfe & Support",
        subtitle: "Finden Sie Antworten auf häufig gestellte Fragen.",
        search_placeholder: "Durchsuchen Sie unsere Hilfe-Artikel...",
        no_results: "Keine Ergebnisse gefunden",
        article: {
          last_update: "Zuletzt aktualisiert: ",
          back_help: "Zurück zur Hilfe",
          back_kb: "Zurück zur Wissensdatenbank",
          not_found: "Artikel nicht gefunden."
        }
      }
    },
    chat: {
      title: "Nachrichten",
      new_message: "Neue Nachricht",
      select_conversation: "Wählen Sie eine Konversation aus, um zu beginnen",
      search_placeholder: "Chats oder Kontakte suchen...",
      conversations: "Chats",
      contacts: "Kontakte",
      no_conversations: "Noch keine Chats",
      no_conversations_desc: "Ihre Nachrichten werden hier angezeigt.",
      no_contacts: "Keine Kontakte gefunden.",
      admin_badge: "Support",
      online: "Online",
      offline: "Offline",
      tipping: "tippt...",
      just_seen: "Gerade gesehen",
      seen_minutes: "Vor {{count}} Min. gesehen",
      seen_hours: "Vor {{count}} Std. gesehen",
      last_seen: "Zuletzt gesehen",
      last_seen_on: "Zuletzt {{date}} gesehen",
      today: "Heute",
      yesterday: "Gestern",
      search_messages: "Nachrichten durchsuchen",
      results_count: "{{count}} Ergebnisse",
      load_more: "Ältere Nachrichten laden",
      encryption_notice: "Nachrichten und Anrufe sind Ende-zu-Ende verschlüsselt.",
      reply_to: "Antwort auf",
      error_loading: "Fehler beim Laden der Nachrichten.",
      error_start_convo: "Fehler beim Starten der Konversation.",
      send_error: "Nachricht konnte nicht gesendet werden.",
      shared_location: "📍 Standort geteilt",
      location_error: "Standortzugriff verweigert.",
      voice_upload_error: "Fehler beim Hochladen der Sprachnachricht.",
      voice_message: "Sprachnachricht",
      mic_access_denied: "Mikrofonzugriff verweigert.",
      recording: "Aufnahme...",
      cancel: "Abbrechen",
      send: "Senden",
      document: "Dokument",
      photos_videos: "Fotos & Videos",
      gif: "GIF",
      location: "Standort",
      contact: "Kontakt",
      replying_placeholder: "Antwort schreiben...",
      type_message: "Nachricht schreiben...",
      drag_drop_title: "Dateien hierher ziehen",
      drag_drop_subtitle: "Bilder, Videos, Audios oder Dokumente"
    }
  },
  fr: {
    dashboard: {
      nav: {
        dashboard: "Tableau de bord",
        applications: "Demandes",
        documents: "Documents",
        profile: "Profil",
        testimonials: "Témoignages",
        media: "Médias",
        messages: "Messages",
        help: "Aide & Support"
      },
      home: {
        title: "Tableau de bord utilisateur",
        user: "Utilisateur",
        subtitle: "Bon retour dans votre espace de permis de conduire.",
        new_application: "Nouvelle demande",
        in_progress: "En cours",
        completed: "Terminé",
        total_spent: "Dépenses totales"
      },
      activity: {
        title: "Historique d'activité",
        series_name: "Demandes"
      },
      status_chart: {
        title: "Aperçu du statut",
        series_name: "Statut de la demande",
        empty: "Aucune demande à analyser."
      },
      applications: {
        subtitle: "Gérez et suivez vos demandes de permis.",
        new: "Démarrer une nouvelle demande",
        no_records: "Aucune demande trouvée.",
        recent: "Demandes récentes",
        view_all: "Voir toutes les demandes"
      },
      documents: {
        title: "Documents",
        subtitle: "Gérez vos documents et certificats téléchargés.",
        application: "Demande",
        no_docs_app: "Aucun document pour cette demande.",
        no_docs: "Aucun document trouvé",
        no_docs_desc: "Vos documents apparaîtront ici une fois que vous aurez commencé une demande.",
        error_loading: "Erreur lors du chargement des documents : ",
        error_download: "Erreur lors du téléchargement du fichier."
      },
      profile: {
        title: "Mon Profil",
        subtitle: "Gérez vos informations personnelles et vos paramètres de compte.",
        update_success: "Profil mis à jour avec succès.",
        password_weak: "Le mot de passe est trop faible.",
        password_success: "Mot de passe mis à jour avec succès.",
        language_updated: "Langue mise à jour avec succès.",
        privacy_updated: "Paramètres de confidentialité mis à jour.",
        avatar_updated: "Avatar mis à jour !",
        cover_updated: "Image de couverture mise à jour !",
        cover_deleted: "Image de couverture supprimée.",
        edit_cover: "Modifier la couverture",
        upload_cover: "Télécharger une photo",
        remove_cover: "Supprimer la couverture",
        unnamed: "Utilisateur sans nom",
        role_admin: "Administrateur",
        role_student: "Étudiant",
        member_since: "Membre depuis",
        not_provided: "Non fourni",
        about: "À propos de moi",
        no_bio: "Aucune biographie pour le moment.",
        settings: "Paramètres du compte",
        public_profile: "Profil public",
        language: "Langue préférée",
        contact_info: "Contact & Adresse",
        social_media: "Réseaux sociaux",
        no_social_links: "Aucun lien social ajouté.",
        privacy_security: "Sécurité & 2FA",
        change_password: "Changer le mot de passe",
        password_min_length: "Min. 6 caractères",
        password_mismatch: "Les mots de passe ne correspondent pas",
        confirm_password: "Confirmer le mot de passe",
        update_password: "Mettre à jour le mot de passe",
        two_factor: "Authentification à deux facteurs (2FA)",
        danger_zone: "Zone de danger",
        delete_warning: "La suppression de votre compte est définitive et irréversible.",
        delete_account: "Supprimer le compte",
        delete_confirm_text: "Tapez DELETE pour confirmer la suppression du compte :",
        deleting: "Suppression...",
        delete_permanently: "Supprimer définitivement",
        validation: {
          phone_format: "Format de téléphone invalide (+49... ou 0...)",
          postal_code: "Le code postal doit comporter 5 chiffres",
          neph_format: "Le NEPH doit comporter 12 chiffres"
        },
        field: {
          bio: "Biographie",
          bio_placeholder: "Dites-nous en un peu plus sur vous...",
          neph: "Numéro NEPH",
          address: "Adresse",
          city: "Ville",
          postal_code: "Code Postal",
          region: "Région"
        }
      },
      profile_summary: {
        title: "Résumé du profil",
        loading: "Chargement du profil...",
        edit: "Modifier le profil"
      },
      status: {
        draft: "Brouillon",
        pending_payment: "Paiement en attente",
        submitted: "Soumis",
        in_review: "En cours d'examen",
        approved: "Approuvé",
        completed: "Terminé",
        rejected: "Rejeté"
      },
      table: {
        id: "ID",
        type: "Catégorie",
        date: "Date",
        amount: "Montant",
        status: "Statut",
        actions: "Actions"
      },
      action: {
        view: "Voir les détails",
        pay: "Payer maintenant"
      },
      testimonials: {
        title: "Témoignages",
        subtitle: "Gérez vos avis et vos commentaires.",
        add_new: "Rédiger un avis",
        delete_confirm: "Êtes-vous sûr de vouloir supprimer cet avis ?",
        delete_success: "Avis supprimé avec succès",
        delete_error: "Erreur lors de la suppression de l'avis",
        tab_published: "Publié",
        tab_pending: "En attente",
        tab_rejected: "Rejeté",
        empty: "Aucun témoignage pour le moment"
      },
      media: {
        title: "Médiathèque",
        subtitle: "Gérez vos vidéos et vos photos.",
        add_new: "Télécharger de nouveaux médias",
        delete_confirm: "Êtes-vous sûr de vouloir supprimer ce média ?",
        delete_success: "Média supprimé avec succès",
        delete_error: "Erreur lors de la suppression du média",
        tab_published: "Publié",
        tab_pending: "En attente",
        tab_rejected: "Rejeté",
        type_images: "Images",
        type_videos: "Vidéos",
        empty: "Aucun média pour le moment"
      },
      messages: {
        title: "Messages",
        subtitle: "Communication directe avec notre équipe de support."
      },
      help: {
        title: "Aide & Support",
        subtitle: "Trouvez des réponses aux questions fréquemment posées.",
        search_placeholder: "Rechercher dans nos articles d'aide...",
        no_results: "Aucun résultat trouvé",
        article: {
          last_update: "Dernière mise à jour : ",
          back_help: "Retour à l'aide",
          back_kb: "Retour à la base de connaissances",
          not_found: "Article non trouvé."
        }
      }
    },
    chat: {
      title: "Messages",
      new_message: "Nouveau message",
      select_conversation: "Sélectionnez une conversation pour commencer à envoyer des messages",
      search_placeholder: "Rechercher des chats ou des contacts...",
      conversations: "Chats",
      contacts: "Contacts",
      no_conversations: "Pas encore de chats",
      no_conversations_desc: "Vos conversations apparaîtront ici.",
      no_contacts: "Aucun contact trouvé.",
      admin_badge: "Support",
      online: "En ligne",
      offline: "Hors ligne",
      tipping: "écrit...",
      just_seen: "Vu à l'instant",
      seen_minutes: "Vu il y a {{count}} min",
      seen_hours: "Vu il y a {{count}} heures",
      last_seen: "Vu pour la dernière fois",
      last_seen_on: "Vu le {{date}}",
      today: "Aujourd'hui",
      yesterday: "Hier",
      search_messages: "Rechercher des messages",
      results_count: "{{count}} résultats",
      load_more: "Charger les messages plus anciens",
      encryption_notice: "Les messages et les appels sont chiffrés de bout en bout.",
      reply_to: "Répondre à",
      error_loading: "Erreur lors du chargement des messages.",
      error_start_convo: "Erreur lors du démarrage de la conversation.",
      send_error: "Le message n'a pas pu être envoyé.",
      shared_location: "📍 Position partagée",
      location_error: "Accès à la position refusé.",
      voice_upload_error: "Erreur lors du téléchargement du message vocal.",
      voice_message: "Message vocal",
      mic_access_denied: "Accès au microphone refusé.",
      recording: "Enregistrement...",
      cancel: "Annuler",
      send: "Envoyer",
      document: "Document",
      photos_videos: "Photos & Vidéos",
      gif: "GIF",
      location: "Position",
      contact: "Contact",
      replying_placeholder: "Écrire une réponse...",
      type_message: "Écrire un message...",
      drag_drop_title: "Déposez vos fichiers ici",
      drag_drop_subtitle: "Images, Vidéos, Audios ou Documents"
    }
  }
};

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      if (Array.isArray(source[key])) {
        target[key] = source[key];
      } else {
        target[key] = deepMerge(target[key], source[key]);
      }
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

['en', 'de', 'fr'].forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (textData[lang]) {
        const updatedData = deepMerge(data, textData[lang]);
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
        console.log(`Updated dashboard texts for ${lang}.json`);
      }
    } catch(err) {
      console.error(`Error updating ${lang}.json:`, err);
    }
  }
});
