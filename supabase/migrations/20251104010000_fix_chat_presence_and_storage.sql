/*
          # [Correctif Final Messagerie]
          Ce script corrige deux problèmes critiques :
          1. La fonction `get_user_conversations` est mise à jour pour inclure le statut de présence (`last_seen`).
          2. La politique de sécurité (RLS) sur le stockage des médias du chat est corrigée pour permettre l'affichage et le téléchargement.

          ## Query Description:
          - **DROP/CREATE get_user_conversations:** Remplace la fonction existante par une version qui inclut `last_seen` dans le JSON de l'interlocuteur, corrigeant l'affichage du statut de présence.
          - **DROP/CREATE POLICY:** Remplace la politique de sécurité trop restrictive sur `storage.objects` par une politique qui autorise les utilisateurs authentifiés à lire les fichiers du bucket `chat_media`, ce qui est nécessaire pour afficher les médias envoyés par d'autres utilisateurs.
          
          Cette opération est sûre, ne supprime aucune donnée et est essentielle pour le bon fonctionnement de la messagerie.
          
          ## Metadata:
          - Schema-Category: ["Structural", "Safe"]
          - Impact-Level: ["Medium"]
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Fonctions affectées: `public.get_user_conversations`
          - Tables affectées (RLS): `storage.objects`
          
          ## Security Implications:
          - RLS Status: Modifié
          - Policy Changes: Oui
          - Auth Requirements: `authenticated`
          
          ## Performance Impact:
          - Indexes: Aucun changement
          - Triggers: Aucun changement
          - Estimated Impact: Positif, la nouvelle fonction est plus complète.
          */

-- 1. Mettre à jour la fonction get_user_conversations pour inclure last_seen
DROP FUNCTION IF EXISTS public.get_user_conversations(p_user_id uuid);
CREATE OR REPLACE FUNCTION public.get_user_conversations(p_user_id uuid)
RETURNS TABLE(
    id uuid,
    created_at timestamptz,
    last_message_text text,
    last_message_time timestamptz,
    unread_count bigint,
    other_participant json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH last_messages AS (
        SELECT
            m.conversation_id,
            (array_agg(m.created_at ORDER BY m.created_at DESC))[1] as max_created_at
        FROM messages m
        GROUP BY m.conversation_id
    )
    SELECT
        c.id,
        c.created_at,
        m.content as last_message_text,
        m.created_at as last_message_time,
        (SELECT COUNT(*) FROM messages msg WHERE msg.conversation_id = c.id AND msg.read_at IS NULL AND msg.user_id <> p_user_id) as unread_count,
        json_build_object(
            'id', p.id,
            'full_name', p.full_name,
            'avatar_url', p.avatar_url,
            'last_seen', p.last_seen
        ) as other_participant
    FROM
        conversations c
    JOIN
        conversation_participants cp ON c.id = cp.conversation_id
    JOIN
        conversation_participants cp_other ON c.id = cp_other.conversation_id AND cp_other.user_id <> p_user_id
    JOIN
        profiles p ON cp_other.user_id = p.id
    LEFT JOIN
        last_messages lm ON c.id = lm.conversation_id
    LEFT JOIN
        messages m ON c.id = m.conversation_id AND m.created_at = lm.max_created_at
    WHERE
        cp.user_id = p_user_id
    ORDER BY
        m.created_at DESC NULLS LAST;
END;
$$;

-- 2. Corriger la politique de sécurité du stockage des médias du chat
-- Supprimer l'ancienne politique restrictive si elle existe
DROP POLICY IF EXISTS "Allow users to read their own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read access to chat media" ON storage.objects;

-- Créer une nouvelle politique qui autorise les utilisateurs authentifiés à lire les fichiers du bucket 'chat_media'
CREATE POLICY "Allow authenticated read access to chat media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat_media');
