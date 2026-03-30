-- Step 1: Drop the old, problematic function to ensure a clean slate.
DROP FUNCTION IF EXISTS public.get_user_conversations(p_user_id uuid);

-- Step 2: Create a new, robust function to fetch user conversations.
-- This version is more explicit and performant.
CREATE OR REPLACE FUNCTION public.get_user_conversations(p_user_id uuid)
RETURNS TABLE(
    id uuid,
    created_at timestamptz,
    last_message_text text,
    last_message_time timestamptz,
    unread_count bigint,
    other_participant jsonb
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        c.id,
        c.created_at,
        lm.content as last_message_text,
        lm.created_at as last_message_time,
        (
            SELECT count(*)
            FROM public.messages msg
            WHERE msg.conversation_id = c.id AND msg.user_id <> p_user_id AND msg.read_at IS NULL
        ) as unread_count,
        jsonb_build_object(
            'id', p.id,
            'full_name', p.full_name,
            'avatar_url', p.avatar_url
        ) as other_participant
    FROM
        public.conversations c
    JOIN
        public.conversation_participants cp ON c.id = cp.conversation_id
    JOIN
        public.conversation_participants cp2 ON c.id = cp2.conversation_id AND cp.user_id <> cp2.user_id
    JOIN
        public.profiles p ON cp2.user_id = p.id
    LEFT JOIN LATERAL (
        SELECT content, created_at
        FROM public.messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
    ) lm ON true
    WHERE
        cp.user_id = p_user_id
    ORDER BY
        lm.created_at DESC NULLS LAST;
$$;

-- Step 3: Ensure authenticated users can search for other users to start conversations.
-- Drop any previous, potentially incorrect policy.
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.profiles;

-- Create a new, correct policy.
CREATE POLICY "Allow authenticated users to read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
