/*
# [SECURITY FIX] Enable RLS and Secure Functions
This migration addresses critical security advisories by enabling Row Level Security (RLS) on all necessary tables and securing a database function.

## Query Description: This operation is critical for securing your application's data. It enables RLS on tables containing user profiles, applications, and documents, ensuring that users can only access their own data. It also hardens a database function against potential hijacking attacks. There is no risk of data loss with this operation.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Enables RLS for: profiles, license_applications, application_documents, payments, contact_messages, license_types, document_types.
- Modifies function: handle_new_user.
- Adds policies for: license_types, document_types.

## Security Implications:
- RLS Status: Enabled on all user-data tables.
- Policy Changes: Yes, new read policies for public-ish data.
- Auth Requirements: This fixes major authentication-related data access vulnerabilities.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible performance impact. RLS checks are highly optimized in PostgreSQL.
*/

-- Enable RLS on all tables that store user or sensitive data
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;

-- Add policies for tables that can be publicly read
-- This ensures that even if we add write policies later, read access is still open.
-- We will drop any existing policies to avoid conflicts.
DROP POLICY IF EXISTS "Allow public read access to license types" ON public.license_types;
CREATE POLICY "Allow public read access to license types"
  ON public.license_types FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public read access to document types" ON public.document_types;
CREATE POLICY "Allow public read access to document types"
  ON public.document_types FOR SELECT
  USING (true);

-- Secure the handle_new_user function by setting a search_path
-- This prevents potential function hijacking vulnerabilities.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$;
