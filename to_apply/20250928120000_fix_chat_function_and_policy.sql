-- Step 1: Add the missing 'read_at' column to the messages table if it doesn't exist.
-- This will fix the runtime error 'column msg.read_at does not exist'.
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Step 2: Re-create the function to ensure it's correct and uses the new column.
-- This also fixes any previous ambiguity errors and makes the migration idempotent.
CREATE OR REPLACE FUNCTION public.get_user_conversations (p_user_id uuid)
RETURNS TABLE (
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
  SELECT
    c.id,
    c.created_at,
    lm.content AS last_message_text,
    lm.created_at AS last_message_time,
    (
      SELECT
        count(*)
      FROM
        public.messages m
      WHERE
        m.conversation_id = c.id AND m.user_id <> p_user_id AND m.read_at IS NULL) AS unread_count,
    json_build_object('id', p.id, 'full_name', p.full_name, 'avatar_url', p.avatar_url) AS other_participant
  FROM
    public.conversations c
  JOIN public.conversation_participants cp ON
    c.id = cp.conversation_id
  JOIN public.conversation_participants op ON
    c.id = op.conversation_id
  JOIN public.profiles p ON
    op.user_id = p.id
  LEFT JOIN LATERAL (
    SELECT
      *
    FROM
      public.messages m
    WHERE
      m.conversation_id = c.id
    ORDER BY
      m.created_at DESC
    LIMIT 1) lm ON
    TRUE
  WHERE
    cp.user_id = p_user_id AND op.user_id <> p_user_id
  ORDER BY
    lm.created_at DESC;
END;
$$;

-- Step 3: Create a policy to allow users to mark messages as read.
-- This replaces the previous faulty policy.
DROP POLICY IF EXISTS "Allow users to update read_at for messages in their conversations" ON public.messages;

CREATE POLICY "Allow users to update read_at for messages in their conversations"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
  )
);
