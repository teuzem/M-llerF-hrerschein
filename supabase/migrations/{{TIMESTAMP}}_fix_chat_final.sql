/*
          # [Correctif Final Messagerie]
          Ce script corrige la fonction de récupération des conversations pour inclure le statut de présence et répare la politique de sécurité pour l'accès aux médias du chat.

          ## Query Description:
          - **DROP/CREATE get_user_conversations:** Remplace la fonction pour y ajouter le champ `last_seen` dans l'objet `other_participant`. Cela corrigera l'affichage du statut "Chargement..." et du nom de l'interlocuteur.
          - **DROP/CREATE POLICY:** Remplace la politique de sécurité sur le stockage des médias (`chat_media`) par une version plus robuste. Cela corrigera l'erreur "Bucket not found" et permettra l'affichage et le téléchargement des images/vidéos.
          
          Cette opération est sûre et ne supprime aucune donnée.

          ## Metadata:
          - Schema-Category: ["Structural", "Safe"]
          - Impact-Level: ["Low"]
          - Requires-Backup: false
          - Reversible: false
*/

-- 1. Remplacer la fonction get_user_conversations pour inclure last_seen
DROP FUNCTION IF EXISTS public.get_user_conversations(p_user_id uuid);
CREATE OR REPLACE FUNCTION public.get_user_conversations(p_user_id uuid)
RETURNS TABLE(
    id uuid,
    created_at timestamptz,
    last_message_text text,
    last_message_time timestamptz,
    unread_count bigint,
    other_participant jsonb -- Changed to jsonb for better performance
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
        jsonb_build_object(
            'id', p.id,
            'full_name', p.full_name,
            'avatar_url', p.avatar_url,
            'last_seen', p.last_seen -- Ajout du champ manquant
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

-- 2. Remplacer la politique de sécurité pour l'accès au stockage des médias
DROP POLICY IF EXISTS "Allow authenticated users to read their chat media" ON storage.objects;

CREATE POLICY "Allow authenticated users to read their chat media"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'chat_media' AND
    EXISTS (
        SELECT 1
        FROM public.conversation_participants cp
        WHERE cp.user_id = auth.uid()
        AND cp.conversation_id::text = (storage.foldername(name))[2]
    )
);
