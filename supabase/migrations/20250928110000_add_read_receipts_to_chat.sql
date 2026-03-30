/*
  # [Schema] Add read receipts to chat system

  [Description of what this operation does]
  This migration adds a `read_at` timestamp to the `messages` table to track when a message has been read. It also adds a new RLS policy to allow users to update this timestamp on messages they have received. This fixes a critical bug where the function to fetch conversations was failing.

  ## Query Description: [This operation adds a new nullable column and a new security policy. It is non-destructive and fully reversible.]
  
  ## Metadata:
  - Schema-Category: ["Structural"]
  - Impact-Level: ["Low"]
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Adds column `read_at` to `public.messages`
  - Adds policy `Users can mark messages as read` to `public.messages`
  
  ## Security Implications:
  - RLS Status: [Enabled]
  - Policy Changes: [Yes]
  - Auth Requirements: [User must be authenticated and a participant in the conversation]
  
  ## Performance Impact:
  - Indexes: [None]
  - Triggers: [None]
  - Estimated Impact: [Low. The new column is nullable and will not immediately impact performance.]
*/

-- Add the read_at column to the messages table
ALTER TABLE public.messages
ADD COLUMN read_at TIMESTAMPTZ;

-- Add a policy to allow users to update messages they've received (to mark them as read)
CREATE POLICY "Users can mark messages as read"
ON public.messages
FOR UPDATE
USING (
  conversation_id IN (
    SELECT cp.conversation_id
    FROM public.conversation_participants cp
    WHERE cp.user_id = auth.uid()
  ) AND user_id != auth.uid()
);
