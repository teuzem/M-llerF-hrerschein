/*
          # [Function Update] Mettre à jour la fonction de récupération des conversations

          ## Query Description: [Cette opération met à jour la fonction `get_user_conversations` pour inclure le champ `last_seen` (dernière connexion) de l'autre participant. Cela permettra d'afficher un indicateur de présence plus précis dans l'interface de messagerie. L'opération est sûre et n'affecte pas les données existantes.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Function: `public.get_user_conversations(uuid)`
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [No]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [No]
          - Triggers: [No]
          - Estimated Impact: [Négligeable. La fonction est légèrement modifiée pour retourner un champ supplémentaire qui est déjà indexé sur la table des profils.]
          */
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
AS $$
BEGIN
  RETURN QUERY
  WITH user_convos AS (
    SELECT c.id as conversation_id
    FROM conversations c
    JOIN conversation_participants cp ON c.id = cp.conversation_id
    WHERE cp.user_id = p_user_id
  ),
  last_messages AS (
    SELECT
      m.conversation_id,
      m.content,
      m.created_at,
      ROW_NUMBER() OVER(PARTITION BY m.conversation_id ORDER BY m.created_at DESC) as rn
    FROM messages m
    WHERE m.conversation_id IN (SELECT conversation_id FROM user_convos)
  )
  SELECT
    c.id,
    c.created_at,
    lm.content as last_message_text,
    lm.created_at as last_message_time,
    (
      SELECT count(*)
      FROM messages m
      WHERE m.conversation_id = c.id
      AND m.read_at IS NULL
      AND m.user_id != p_user_id
    ) as unread_count,
    json_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url,
      'last_seen', p.last_seen
    ) as other_participant
  FROM conversations c
  JOIN user_convos uc ON c.id = uc.conversation_id
  JOIN conversation_participants cp ON c.id = cp.conversation_id AND cp.user_id != p_user_id
  JOIN profiles p ON p.id = cp.user_id
  LEFT JOIN last_messages lm ON c.id = lm.conversation_id AND lm.rn = 1
  ORDER BY lm.created_at DESC NULLS LAST, c.created_at DESC;
END;
$$;
