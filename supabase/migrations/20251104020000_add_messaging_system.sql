/*
          # [Structural] Création du Système de Messagerie
          [Ce script met en place la structure complète de la base de données pour un système de messagerie en temps réel, incluant les conversations, les messages et le stockage des médias.]

          ## Query Description: [Cette opération est sûre et n'affecte aucune donnée existante. Elle ajoute de nouvelles tables (`conversations`, `conversation_participants`, `messages`) et un nouveau compartiment de stockage (`chat_media`) nécessaires au fonctionnement de la messagerie. Les politiques de sécurité (RLS) sont activées pour garantir la confidentialité des échanges.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tables créées: `conversations`, `conversation_participants`, `messages`
          - Compartiment de stockage créé: `chat_media`
          - Politiques RLS ajoutées: Oui, pour toutes les nouvelles tables.
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: Les utilisateurs doivent être authentifiés pour utiliser la messagerie.
          
          ## Performance Impact:
          - Indexes: Ajout d'index sur les clés étrangères pour des performances optimales.
          - Triggers: Aucun.
          - Estimated Impact: Faible impact sur les performances globales, optimisé pour les requêtes de chat.
          */

-- 1. CRÉER LA TABLE DES CONVERSATIONS
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_admin_chat BOOLEAN DEFAULT FALSE NOT NULL
);
COMMENT ON TABLE conversations IS 'Stocke les métadonnées de chaque conversation.';

-- 2. CRÉER LA TABLE DES PARTICIPANTS
CREATE TABLE conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (conversation_id, user_id)
);
COMMENT ON TABLE conversation_participants IS 'Table de liaison entre les utilisateurs et les conversations.';

-- 3. CRÉER LA TABLE DES MESSAGES
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    media_url TEXT,
    media_type VARCHAR(50), -- 'image', 'video', 'document'
    gif_url TEXT,
    location_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL
);
COMMENT ON TABLE messages IS 'Contient tous les messages envoyés dans les conversations.';

-- 4. CRÉER LES INDEX POUR LES PERFORMANCES
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_participants_user_id ON conversation_participants(user_id);

-- 5. CRÉER LE COMPARTIMENT DE STOCKAGE POUR LES MÉDIAS DU CHAT
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat_media', 'chat_media', FALSE, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- 6. ACTIVER LA SÉCURITÉ AU NIVEAU DE LA LIGNE (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 7. DÉFINIR LES POLITIQUES RLS

-- Les utilisateurs ne peuvent voir que les conversations dont ils sont participants.
CREATE POLICY "Les utilisateurs peuvent voir leurs propres conversations"
ON conversations FOR SELECT
USING (id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
));

-- Les utilisateurs peuvent créer des conversations.
CREATE POLICY "Les utilisateurs peuvent créer des conversations"
ON conversations FOR INSERT
WITH CHECK (true);

-- Les utilisateurs peuvent voir leur propre participation.
CREATE POLICY "Les utilisateurs peuvent voir leur propre participation"
ON conversation_participants FOR SELECT
USING (user_id = auth.uid());

-- Les utilisateurs peuvent rejoindre ou quitter des conversations.
CREATE POLICY "Les utilisateurs peuvent gérer leur propre participation"
ON conversation_participants FOR ALL
USING (user_id = auth.uid());

-- Les utilisateurs peuvent voir les messages des conversations dont ils sont membres.
CREATE POLICY "Les utilisateurs peuvent lire les messages de leurs conversations"
ON messages FOR SELECT
USING (conversation_id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
));

-- Les utilisateurs ne peuvent envoyer des messages que dans les conversations dont ils sont membres.
CREATE POLICY "Les utilisateurs peuvent envoyer des messages dans leurs conversations"
ON messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
        SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
    )
);

-- Les utilisateurs ne peuvent modifier que leurs propres messages.
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres messages"
ON messages FOR UPDATE
USING (sender_id = auth.uid());

-- Les utilisateurs ne peuvent supprimer que leurs propres messages.
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres messages"
ON messages FOR DELETE
USING (sender_id = auth.uid());


-- Politiques pour le stockage des médias du chat
CREATE POLICY "Les utilisateurs authentifiés peuvent téléverser des médias"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat_media');

CREATE POLICY "Les utilisateurs peuvent voir les médias des conversations dont ils sont membres"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'chat_media' AND
    (storage.foldername(name))[1] IN (
        SELECT conversation_id::text FROM conversation_participants WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres médias"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'chat_media' AND
    owner = auth.uid()
);

-- 8. CRÉER UNE FONCTION POUR METTRE À JOUR `last_message_at`
CREATE OR REPLACE FUNCTION update_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. CRÉER UN TRIGGER QUI SE DÉCLENCHE APRÈS L'INSERTION D'UN MESSAGE
CREATE TRIGGER on_new_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_last_message_at();
