-- =================================================================
-- Fix Messaging System Functions and RLS
-- =================================================================

-- 1. Drop old function to avoid conflicts
DROP FUNCTION IF EXISTS public.get_user_conversations(p_user_id uuid);

-- 2. Create a new, robust function to get user conversations
/*
  # [Function: get_user_conversations]
  This function retrieves all conversations for a specific user, along with the last message, unread count, and the other participant's profile details.
  It is designed to be more robust and performant than the previous version.

  ## Query Description:
  - This is a safe, read-only operation. It does not modify any data.
  - It uses Common Table Expressions (CTEs) to break down the logic for clarity and performance.
  - It correctly handles cases where conversations have no messages.

  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true (by dropping the function)
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
language plpgsql
as $$
begin
    return query
    WITH user_convos AS (
        SELECT c.id as conversation_id
        FROM conversations c
        JOIN conversation_participants cp ON c.id = cp.conversation_id
        WHERE cp.user_id = p_user_id
    ),
    other_participants AS (
        SELECT
            uc.conversation_id,
            p.id,
            p.full_name,
            p.avatar_url
        FROM user_convos uc
        JOIN conversation_participants cp ON uc.conversation_id = cp.conversation_id
        JOIN profiles p ON cp.user_id = p.id
        WHERE cp.user_id <> p_user_id
    ),
    last_messages AS (
        SELECT
            m.conversation_id,
            m.content,
            m.created_at,
            ROW_NUMBER() OVER(PARTITION BY m.conversation_id ORDER BY m.created_at DESC) as rn
        FROM messages m
        WHERE m.conversation_id IN (SELECT conversation_id FROM user_convos)
    ),
    unread_counts AS (
        SELECT
            m.conversation_id,
            count(*) as total
        FROM messages m
        WHERE m.conversation_id IN (SELECT conversation_id FROM user_convos)
          AND m.user_id <> p_user_id
          AND m.read_at IS NULL
        GROUP BY m.conversation_id
    )
    SELECT
        c.id,
        c.created_at,
        lm.content as last_message_text,
        lm.created_at as last_message_time,
        COALESCE(uc.total, 0) as unread_count,
        json_build_object(
            'id', op.id,
            'full_name', op.full_name,
            'avatar_url', op.avatar_url
        ) as other_participant
    FROM conversations c
    JOIN other_participants op ON c.id = op.conversation_id
    LEFT JOIN (SELECT * FROM last_messages WHERE rn = 1) lm ON c.id = lm.conversation_id
    LEFT JOIN unread_counts uc ON c.id = uc.conversation_id
    WHERE c.id IN (SELECT conversation_id FROM user_convos)
    ORDER BY lm.created_at DESC NULLS LAST, c.created_at DESC;
end;
$$;


-- 3. Set up Row Level Security for the entire messaging system
/*
  # [RLS Policies for Messaging]
  These policies secure the messaging system, ensuring users can only access their own data.

  ## Security Implications:
  - RLS Status: Enabled
  - Policy Changes: Yes
  - These policies are CRITICAL for data privacy. They prevent users from reading other users' private messages and conversations.
*/

-- Enable RLS on all relevant tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies to ensure a clean setup
DROP POLICY IF EXISTS "Authenticated users can view other users' info" ON public.profiles;
DROP POLICY IF EXISTS "Users can access their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can access their own participant records" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can insert themselves into conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can access messages in their conversations" ON public.messages;

-- Create new, correct policies

-- Profiles: Allows any logged-in user to view basic info of other users (needed for search).
CREATE POLICY "Authenticated users can view other users' info" ON public.profiles
FOR SELECT TO authenticated USING (true);

-- Conversations: A user can only see conversations they are a part of.
CREATE POLICY "Users can access their own conversations" ON public.conversations
FOR SELECT TO authenticated USING (id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

-- Conversation Participants: A user can see their own participation record.
CREATE POLICY "Users can access their own participant records" ON public.conversation_participants
FOR SELECT TO authenticated USING (user_id = auth.uid());

-- A user can add themselves as a participant to a conversation.
CREATE POLICY "Users can insert themselves into conversations" ON public.conversation_participants
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Messages: A user can read/write/delete messages only in conversations they are a part of.
CREATE POLICY "Users can access messages in their conversations" ON public.messages
FOR ALL TO authenticated USING (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()))
WITH CHECK (user_id = auth.uid());
