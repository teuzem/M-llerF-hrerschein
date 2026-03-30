/*
# [FEATURE] Complete Knowledge Base
This migration creates the database structure for a full-featured knowledge base and populates it with initial articles.
## Query Description:
- **Creates `knowledge_base_articles` table:** Stores help articles with categories, multilingual titles and content, and a URL-friendly slug.
- **Adds RLS Policies:** Ensures articles are publicly readable.
- **Inserts Initial Data:** Populates the table with essential FAQ articles covering account management, payments, applications, and security.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the table)
*/

-- Create the table for knowledge base articles
CREATE TABLE IF NOT EXISTS public.knowledge_base_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    title_fr TEXT NOT NULL,
    title_en TEXT NOT NULL,
    content_fr TEXT NOT NULL,
    content_en TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.knowledge_base_articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public read access
DROP POLICY IF EXISTS "Public can read knowledge base articles." ON public.knowledge_base_articles;
CREATE POLICY "Public can read knowledge base articles." ON public.knowledge_base_articles FOR SELECT USING (true);

-- Insert initial articles
INSERT INTO public.knowledge_base_articles (category, title_fr, title_en, content_fr, content_en, slug)
VALUES
    ('Compte', 'Comment mettre à jour mon profil ?', 'How to update my profile?', 'Pour mettre à jour votre profil, connectez-vous à votre tableau de bord, cliquez sur "Mon Profil" dans le menu de gauche. Vous pourrez y modifier vos informations personnelles, votre adresse, votre mot de passe et même votre photo de profil. N''oubliez pas de sauvegarder chaque section après modification.', 'To update your profile, log in to your dashboard, and click on "My Profile" in the left-hand menu. There, you can edit your personal information, address, password, and even your profile picture. Don''t forget to save each section after making changes.', 'how-to-update-profile'),
    ('Compte', 'Comment changer mon mot de passe ?', 'How to change my password?', 'Dans la section "Mon Profil" de votre tableau de bord, vous trouverez une section dédiée au changement de mot de passe. Entrez votre nouveau mot de passe, confirmez-le, et cliquez sur "Changer le mot de passe". Pour des raisons de sécurité, nous vous recommandons d''utiliser un mot de passe fort.', 'In the "My Profile" section of your dashboard, you will find a dedicated section for changing your password. Enter your new password, confirm it, and click "Change Password". For security reasons, we recommend using a strong password.', 'how-to-change-password'),
    ('Paiements', 'Quels sont les moyens de paiement acceptés ?', 'What payment methods are accepted?', 'Nous acceptons les paiements par carte bancaire (Visa, MasterCard via Stripe), PayPal, et certaines cryptomonnaies à titre de démonstration. Toutes les transactions sont sécurisées par nos partenaires de paiement, leaders dans leur domaine.', 'We accept payments by credit card (Visa, MasterCard via Stripe), PayPal, and certain cryptocurrencies for demonstration purposes. All transactions are secured by our payment partners, who are leaders in their field.', 'accepted-payment-methods'),
    ('Paiements', 'Mon paiement a échoué, que faire ?', 'My payment failed, what should I do?', 'Si votre paiement échoue, vérifiez d''abord les informations que vous avez saisies (numéro de carte, date d''expiration, etc.). Essayez d''utiliser une autre méthode de paiement. Si le problème persiste, n''hésitez pas à contacter notre support client via la page de contact.', 'If your payment fails, first check the information you entered (card number, expiration date, etc.). Try using another payment method. If the problem persists, do not hesitate to contact our customer support via the contact page.', 'what-if-payment-fails'),
    ('Demandes', 'Comment suivre ma demande de permis ?', 'How to track my license application?', 'Chaque demande que vous soumettez se voit attribuer un numéro de suivi unique et un QR code sur la page de confirmation. Vous pouvez utiliser ce numéro sur la page "Suivi de Demande" ou scanner le QR code pour voir l''état d''avancement de votre dossier en temps réel.', 'Each application you submit is assigned a unique tracking number and a QR code on the confirmation page. You can use this number on the "Track Application" page or scan the QR code to see the real-time status of your file.', 'how-to-track-application'),
    ('Demandes', 'Puis-je annuler une demande ?', 'Can I cancel an application?', 'Une demande peut être annulée tant qu''elle n''a pas été payée. Une fois le paiement effectué, le processus de traitement est lancé et l''annulation n''est plus possible. Pour toute question, veuillez contacter le support avant de procéder au paiement.', 'An application can be canceled as long as it has not been paid for. Once payment is made, the processing begins, and cancellation is no longer possible. For any questions, please contact support before proceeding with payment.', 'can-i-cancel-application')
ON CONFLICT (slug) DO NOTHING;
