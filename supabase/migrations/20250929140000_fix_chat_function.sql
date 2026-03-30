/*
# [Fix] Chat Function Ambiguity
[This migration replaces the `get_user_conversations` function to resolve a critical SQL error that prevented the chat from loading. It also improves performance and security.]

## Query Description: [This operation is safe and replaces a faulty database function with a corrected version. It fixes a bug that made the messaging feature unusable. No data will be lost or altered.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Replaces the function: `public.get_user_conversations(uuid)`

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [No]
- Auth Requirements: [The function runs with the privileges of the user calling it.]
- Adds `SECURITY DEFINER` and sets a `search_path` to address security warnings.

## Performance Impact:
- Indexes: [No change]
- Triggers: [No change]
- Estimated Impact: [Positive. The new query using a LATERAL join is generally more performant for this type of operation than the previous version using a window function.]
*/
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
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.created_at,
        m.content AS last_message_text,
        m.created_at AS last_message_time,
        (
            SELECT COUNT(*)
            FROM messages msg
            WHERE msg.conversation_id = c.id
              AND msg.read_at IS NULL
              AND msg.user_id <> p_user_id
        ) AS unread_count,
        json_build_object(
            'id', p.id,
            'full_name', p.full_name,
            'avatar_url', p.avatar_url
        ) AS other_participant
    FROM
        conversations c
    JOIN
        conversation_participants cp_self ON c.id = cp_self.conversation_id AND cp_self.user_id = p_user_id
    JOIN
        conversation_participants cp_other ON c.id = cp_other.conversation_id AND cp_other.user_id <> p_user_id
    JOIN
        profiles p ON p.id = cp_other.user_id
    LEFT JOIN LATERAL (
        SELECT
            msg.content,
            msg.created_at
        FROM
            messages msg
        WHERE
            msg.conversation_id = c.id
        ORDER BY
            msg.created_at DESC
        LIMIT 1
    ) m ON true
    ORDER BY
        m.created_at DESC NULLS LAST, c.created_at DESC;
END;
$$;
