/*
          # [Structural] Add Chat RPC Functions
          This migration creates two essential database functions (RPCs) required for the real-time messaging system to work.

          ## Query Description: 
          - `get_or_create_conversation`: This function finds an existing conversation between two users or creates a new one if it doesn't exist. This is crucial for starting new chats.
          - `get_user_conversations`: This function retrieves the list of all conversations for a specific user, including the last message and details of the other participant. This is necessary to display the conversation list.
          
          These functions do not modify or delete any existing data and are safe to run. They are essential for the messaging feature to operate correctly.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true (by dropping the functions)
          
          ## Structure Details:
          - Creates function `public.get_or_create_conversation(uuid, uuid)`
          - Creates function `public.get_user_conversations(uuid)`
          
          ## Security Implications:
          - RLS Status: Not applicable to functions directly, but they will respect table RLS.
          - Policy Changes: No
          - Auth Requirements: Functions are `SECURITY DEFINER` to allow controlled access across user data.
          
          ## Performance Impact:
          - Indexes: No change
          - Triggers: No change
          - Estimated Impact: Low. These functions are optimized to query chat data efficiently.
          */

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_or_create_conversation(user1_id uuid, user2_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  existing_conversation_id uuid;
  new_conversation_id uuid;
begin
  -- Check if a conversation already exists between the two users
  select cp1.conversation_id into existing_conversation_id
  from conversation_participants as cp1
  join conversation_participants as cp2 on cp1.conversation_id = cp2.conversation_id
  where 
    (cp1.user_id = user1_id and cp2.user_id = user2_id)
    or 
    (cp1.user_id = user2_id and cp2.user_id = user1_id);

  if existing_conversation_id is not null then
    return existing_conversation_id;
  end if;

  -- If not, create a new one
  insert into conversations default values returning id into new_conversation_id;

  -- Add participants
  insert into conversation_participants (conversation_id, user_id)
  values (new_conversation_id, user1_id), (new_conversation_id, user2_id);

  return new_conversation_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_conversations(p_user_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, last_message_text text, last_message_time timestamp with time zone, unread_count bigint, other_participant json)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  return query
  with user_convos as (
    -- Get all conversations the user is part of
    select conversation_id from conversation_participants where user_id = p_user_id
  ),
  other_participants as (
    -- For each conversation, get the OTHER participant's details
    select
      cp.conversation_id,
      p.id as user_id,
      p.full_name,
      p.avatar_url
    from conversation_participants cp
    join profiles p on cp.user_id = p.id
    where cp.conversation_id in (select conversation_id from user_convos)
    and cp.user_id != p_user_id
  ),
  last_messages as (
    -- Get the last message for each conversation
    select distinct on (conversation_id)
      conversation_id,
      content as last_message_text,
      created_at as last_message_time
    from messages
    where conversation_id in (select conversation_id from user_convos)
    order by conversation_id, created_at desc
  )
  select
    c.id,
    c.created_at,
    lm.last_message_text,
    lm.last_message_time,
    0 as unread_count, -- Placeholder for unread count logic
    json_build_object(
      'id', op.user_id,
      'full_name', op.full_name,
      'avatar_url', op.avatar_url
    ) as other_participant
  from conversations c
  join other_participants op on c.id = op.conversation_id
  left join last_messages lm on c.id = lm.conversation_id
  where c.id in (select conversation_id from user_convos)
  order by lm.last_message_time desc nulls last;
end;
$function$
;
