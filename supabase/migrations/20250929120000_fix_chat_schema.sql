/*
  # [Fix] Finalize Chat Schema

  [This migration provides a definitive fix for the chat system's database schema. It corrects column names, adds read-receipt functionality, and ensures all necessary functions and policies are correctly defined.]

  ## Query Description: 
  This operation performs several structural changes to finalize the chat schema.
  1.  **Renames `sender_id` to `user_id`** in the `messages` table for consistency across the application.
  2.  **Adds the `read_at` column** to the `messages` table to track when a message is read.
  3.  **Recreates database functions** (`get_user_conversations`, `get_or_create_conversation`) with the correct logic and column names.
  4.  **Creates the necessary security policies** for marking messages as read.
  This script is designed to be safe to run even if previous partial migrations have been applied. It will not cause data loss.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: false (complex to reverse)

  ## Structure Details:
  - Table `messages`:
    - RENAME COLUMN `sender_id` TO `user_id`
    - ADD COLUMN `read_at` TIMESTAMPTZ
  - Functions `get_user_conversations`, `get_or_create_conversation`: DROPPED and RECREATED.
  - New Policy on `messages` table.

  ## Security Implications:
  - RLS Status: Policies are added/recreated for the `messages` table.
  - Policy Changes: Yes.
  - Auth Requirements: All operations are based on the authenticated user's ID (`auth.uid()`).

  ## Performance Impact:
  - Indexes: None.
  - Triggers: None.
  - Estimated Impact: Low.
*/

-- Step 1: Rename the column for consistency. This will fail if already renamed, which is fine.
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='messages' AND column_name='sender_id') THEN
      ALTER TABLE public.messages RENAME COLUMN sender_id TO user_id;
   END IF;
END $$;

-- Step 2: Add the read_at column for read receipts if it doesn't exist.
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Step 3: Drop existing functions and policies to ensure a clean slate.
DROP FUNCTION IF EXISTS get_user_conversations(uuid);
DROP FUNCTION IF EXISTS get_or_create_conversation(uuid, uuid);
DROP POLICY IF EXISTS "Allow users to mark messages as read" ON public.messages;

-- Step 4: Recreate the function to get a user's conversations with correct logic.
CREATE OR REPLACE FUNCTION get_user_conversations(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMPTZ,
    last_message_text TEXT,
    last_message_time TIMESTAMPTZ,
    unread_count BIGINT,
    other_participant JSON
) AS $$
BEGIN
    RETURN QUERY
    WITH user_convos AS (
        SELECT cp.conversation_id
        FROM conversation_participants cp
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
        lm.content AS last_message_text,
        lm.created_at AS last_message_time,
        (
            SELECT COUNT(*)
            FROM messages msg
            WHERE msg.conversation_id = c.id
            AND msg.user_id != p_user_id
            AND msg.read_at IS NULL
        ) AS unread_count,
        json_build_object(
            'id', p.user_id,
            'full_name', prof.full_name,
            'avatar_url', prof.avatar_url
        ) AS other_participant
    FROM conversations c
    JOIN user_convos uc ON c.id = uc.conversation_id
    JOIN conversation_participants p ON p.conversation_id = c.id AND p.user_id != p_user_id
    JOIN profiles prof ON prof.id = p.user_id
    LEFT JOIN last_messages lm ON lm.conversation_id = c.id AND lm.rn = 1
    ORDER BY lm.created_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Recreate the function to get or create a conversation.
CREATE OR REPLACE FUNCTION get_or_create_conversation(user1_id uuid, user2_id uuid)
RETURNS uuid AS $$
DECLARE
    conversation_id uuid;
BEGIN
    -- Find existing conversation
    SELECT c.id INTO conversation_id
    FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
    WHERE cp1.user_id = user1_id AND cp2.user_id = user2_id;

    -- If not found, create a new one
    IF conversation_id IS NULL THEN
        INSERT INTO conversations DEFAULT VALUES RETURNING id INTO conversation_id;
        INSERT INTO conversation_participants (conversation_id, user_id) VALUES (conversation_id, user1_id);
        INSERT INTO conversation_participants (conversation_id, user_id) VALUES (conversation_id, user2_id);
    END IF;

    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Step 6: Create the security policy for updating read status.
CREATE POLICY "Allow users to mark messages as read"
ON public.messages
FOR UPDATE
USING (
  conversation_id IN (
    SELECT cp.conversation_id
    FROM conversation_participants cp
    WHERE cp.user_id = auth.uid()
  )
)
WITH CHECK (
  user_id <> auth.uid()
);
