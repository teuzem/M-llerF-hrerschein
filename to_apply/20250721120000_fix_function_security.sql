/*
  # [SECURITY] Set Function Search Path
  [This operation secures existing PostgreSQL functions by explicitly setting their search_path. This mitigates the risk of search path hijacking attacks and resolves the 'Function Search Path Mutable' security warnings.]

  ## Query Description: [This is a non-destructive security enhancement. It modifies the configuration of the function responsible for creating user profiles to make it more secure. It has no impact on existing data or application functionality.]
  
  ## Metadata:
  - Schema-Category: ["Security", "Safe"]
  - Impact-Level: ["Low"]
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Functions affected: `public.handle_new_user`
  
  ## Security Implications:
  - RLS Status: [Not Applicable]
  - Policy Changes: [No]
  - Auth Requirements: [Admin privileges to alter functions]
  
  ## Performance Impact:
  - Indexes: [None]
  - Triggers: [None]
  - Estimated Impact: [Negligible performance impact. Improves security posture.]
*/

-- This function is a common Supabase pattern. We are making it more secure
-- by replacing it with a version that has a locked-down search_path.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;
