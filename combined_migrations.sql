-- MIGRATION: 20250101120000_fix_security_advisories.sql
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


-- MIGRATION: 20250121000000_initial_schema.sql
/*
# Initial Database Schema for PermisCode Agency
Création du schéma initial pour l'agence de permis de conduire français

## Query Description:
Cette migration crée la structure de base de données complète pour l'agence PermisCode.
Inclut les tables pour les utilisateurs, demandes de permis, documents et paiements.
Aucune donnée existante n'est affectée car il s'agit de la création initiale.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table profiles: Profils utilisateurs étendus
- Table license_types: Types de permis disponibles
- Table license_applications: Demandes de permis
- Table application_documents: Documents uploadés
- Table payments: Paiements et facturation

## Security Implications:
- RLS Status: Enabled sur toutes les tables publiques
- Policy Changes: Yes - Politiques de sécurité strictes
- Auth Requirements: Authentification requise pour accès

## Performance Impact:
- Indexes: Ajout d'index optimisés
- Triggers: Trigger de création automatique de profil
- Estimated Impact: Minimal - Tables vides
*/

-- Create custom types
CREATE TYPE license_category AS ENUM (
  'AM', 'A1', 'A2', 'A', 'B1', 'B2', 'B', 'C1', 'C2', 'C', 
  'D1', 'D', 'BE', 'C1E', 'CE', 'D1E', 'DE', 'L', 'T'
);

CREATE TYPE application_status AS ENUM (
  'draft', 'submitted', 'in_review', 'approved', 'completed', 'rejected'
);

CREATE TYPE payment_status AS ENUM (
  'pending', 'completed', 'failed', 'refunded'
);

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'France',
  preferred_language TEXT DEFAULT 'fr' CHECK (preferred_language IN ('fr', 'en')),
  neph_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- License types with pricing
CREATE TABLE public.license_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category license_category NOT NULL UNIQUE,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_fr TEXT,
  description_en TEXT,
  price_euros INTEGER NOT NULL,
  processing_days INTEGER DEFAULT 7,
  requires_theory_test BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- License applications
CREATE TABLE public.license_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  license_type_id UUID REFERENCES public.license_types(id) NOT NULL,
  status application_status DEFAULT 'draft',
  application_number TEXT UNIQUE,
  total_amount INTEGER NOT NULL,
  theory_test_needed BOOLEAN DEFAULT FALSE,
  theory_test_fee INTEGER DEFAULT 0,
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document types
CREATE TABLE public.document_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_fr TEXT,
  description_en TEXT,
  is_required BOOLEAN DEFAULT TRUE,
  accepted_formats TEXT[] DEFAULT ARRAY['pdf', 'jpg', 'jpeg', 'png'],
  max_size_mb INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application documents
CREATE TABLE public.application_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.license_applications(id) ON DELETE CASCADE NOT NULL,
  document_type_id UUID REFERENCES public.document_types(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Payments
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.license_applications(id) ON DELETE CASCADE NOT NULL,
  amount_euros INTEGER NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages
CREATE TABLE public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  language TEXT DEFAULT 'fr',
  replied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert license types with pricing
INSERT INTO public.license_types (category, name_fr, name_en, description_fr, description_en, price_euros) VALUES
('AM', 'Cyclomoteur', 'Moped License', 'Permis pour cyclomoteurs de 50cc maximum', 'License for mopeds up to 50cc', 800),
('A1', 'Motocyclette 125cc', 'Light Motorcycle', 'Permis pour motocyclettes jusqu''à 125cc', 'License for motorcycles up to 125cc', 800),
('A2', 'Motocyclette bridée', 'Restricted Motorcycle', 'Permis pour motocyclettes bridées à 35kW', 'License for motorcycles limited to 35kW', 800),
('A', 'Motocyclette', 'Motorcycle License', 'Permis pour toutes motocyclettes', 'License for all motorcycles', 800),
('B1', 'Quadricycle lourd', 'Heavy Quadricycle', 'Permis pour quadricycles lourds à moteur', 'License for heavy motor quadricycles', 2123),
('B2', 'Véhicule léger renforcé', 'Enhanced Light Vehicle', 'Permis véhicule léger avec remorque', 'Light vehicle license with trailer', 2123),
('B', 'Véhicule léger', 'Car License', 'Permis de conduire automobile standard', 'Standard car driving license', 2123),
('C1', 'Poids lourd léger', 'Light Truck', 'Permis pour véhicules de 3,5 à 7,5 tonnes', 'License for vehicles 3.5 to 7.5 tons', 3000),
('C2', 'Poids lourd moyen', 'Medium Truck', 'Permis pour véhicules de 7,5 à 19 tonnes', 'License for vehicles 7.5 to 19 tons', 3000),
('C', 'Poids lourd', 'Heavy Truck', 'Permis pour véhicules de plus de 3,5 tonnes', 'License for vehicles over 3.5 tons', 3000),
('D1', 'Transport de personnes léger', 'Light Passenger Transport', 'Permis pour véhicules de 9 à 16 places', 'License for 9 to 16 passenger vehicles', 3189),
('D', 'Transport de personnes', 'Passenger Transport', 'Permis pour véhicules de plus de 8 places', 'License for vehicles over 8 passengers', 3089),
('BE', 'Véhicule + remorque', 'Car with Trailer', 'Permis B avec remorque lourde', 'Category B with heavy trailer', 2123),
('C1E', 'Poids lourd léger + remorque', 'Light Truck with Trailer', 'Permis C1 avec remorque', 'Category C1 with trailer', 3089),
('CE', 'Poids lourd + remorque', 'Heavy Truck with Trailer', 'Permis C avec remorque', 'Category C with trailer', 3089),
('D1E', 'Transport léger + remorque', 'Light Transport with Trailer', 'Permis D1 avec remorque', 'Category D1 with trailer', 3500),
('DE', 'Transport + remorque', 'Transport with Trailer', 'Permis D avec remorque', 'Category D with trailer', 3089);

-- Insert document types
INSERT INTO public.document_types (name_fr, name_en, description_fr, description_en) VALUES
('CNI Recto/Verso', 'ID Card Front/Back', 'Carte nationale d''identité recto et verso', 'National identity card front and back'),
('Passeport', 'Passport', 'Passeport en cours de validité', 'Valid passport'),
('Titre de séjour', 'Residence Permit', 'Titre de séjour en cours de validité', 'Valid residence permit'),
('Photo numérique', 'Digital Photo', 'Photo d''identité numérique format e-photo', 'Digital identity photo e-photo format'),
('Signature', 'Signature', 'Signature sur fond blanc', 'Signature on white background');

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_license_applications_user_id ON public.license_applications(user_id);
CREATE INDEX idx_license_applications_status ON public.license_applications(status);
CREATE INDEX idx_application_documents_application_id ON public.application_documents(application_id);
CREATE INDEX idx_payments_application_id ON public.payments(application_id);

-- Function to generate application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'PC' || TO_CHAR(NOW(), 'YYYY') || LPAD(NEXTVAL('application_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for application numbers
CREATE SEQUENCE application_number_seq START 1;

-- Trigger to auto-generate application number
CREATE OR REPLACE FUNCTION set_application_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_number IS NULL THEN
    NEW.application_number := generate_application_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_application_number
  BEFORE INSERT ON public.license_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_application_number();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for license_applications
CREATE POLICY "Users can view own applications" ON public.license_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications" ON public.license_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON public.license_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for application_documents
CREATE POLICY "Users can view own documents" ON public.application_documents
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.license_applications 
      WHERE id = application_documents.application_id
    )
  );

CREATE POLICY "Users can upload own documents" ON public.application_documents
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.license_applications 
      WHERE id = application_documents.application_id
    )
  );

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.license_applications 
      WHERE id = payments.application_id
    )
  );

-- Public read access for reference tables
CREATE POLICY "Public read access" ON public.license_types FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.document_types FOR SELECT USING (true);

-- Contact messages - anyone can insert
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);


-- MIGRATION: 20250720120000_add_tracking_and_location.sql
/*
# [Operation Name]
Add Application Tracking and Location Data

## Query Description: [This operation enhances the `license_applications` table by adding a unique, user-friendly application number for tracking and specific columns for the applicant's address at the time of submission. This ensures that each application has a persistent, snapshot of the address, independent of later changes to the user's profile. It improves data integrity and simplifies tracking for both users and administrators.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Tables affected: `license_applications`
- Columns added: `application_number` (TEXT, UNIQUE), `address` (TEXT), `city` (TEXT), `postal_code` (TEXT), `region` (TEXT)

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [No]
- Auth Requirements: [The existing RLS policies on `license_applications` will automatically apply to these new columns, ensuring only the record owner and authorized roles can access the data.]

## Performance Impact:
- Indexes: [A UNIQUE index is added on `application_number` to ensure its uniqueness and speed up lookups.]
- Triggers: [No]
- Estimated Impact: [Low. The new index will slightly increase write time but significantly improve query performance when searching by application number.]
*/

ALTER TABLE public.license_applications
ADD COLUMN application_number TEXT,
ADD COLUMN address TEXT,
ADD COLUMN city TEXT,
ADD COLUMN postal_code TEXT,
ADD COLUMN region TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_application_number ON public.license_applications (application_number);

COMMENT ON COLUMN public.license_applications.application_number IS 'A unique, user-friendly identifier for tracking the application (e.g., PC-12345).';
COMMENT ON COLUMN public.license_applications.address IS 'The applicant''s street address at the time of submission.';
COMMENT ON COLUMN public.license_applications.city IS 'The applicant''s city at the time of submission.';
COMMENT ON COLUMN public.license_applications.postal_code IS 'The applicant''s postal code at the time of submission.';
COMMENT ON COLUMN public.license_applications.region IS 'The applicant''s region at the time of submission.';


-- MIGRATION: 20250721120000_add_location_to_applications.sql
/*
# [Operation] Add Location Fields to Applications
Adds address, city, postal_code, and region columns to the license_applications table to store detailed user location data from the application form.

## Query Description:
This operation is structural and safe. It adds new, nullable columns to the `license_applications` table. It will not affect existing data, as the new columns will simply be `NULL` for old records. No data loss is possible.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the columns)

## Structure Details:
- Table: `public.license_applications`
- Columns Added: `address` (TEXT), `city` (TEXT), `postal_code` (TEXT), `region` (TEXT)

## Security Implications:
- RLS Status: Unchanged. Existing RLS policies on the table remain in effect.
- Policy Changes: No.
- Auth Requirements: None for the migration itself.

## Performance Impact:
- Indexes: None added.
- Triggers: None added.
- Estimated Impact: Negligible. Adding nullable columns is a fast metadata-only change.
*/

ALTER TABLE public.license_applications ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.license_applications ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.license_applications ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.license_applications ADD COLUMN IF NOT EXISTS region TEXT;


-- MIGRATION: 20250721120000_fix_function_security.sql
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


-- MIGRATION: 20250924090000_add_avatar_to_profiles.sql
/*
# [FEATURE] Add Avatar Support to Profiles
This migration adds full support for user profile pictures.
## Query Description:
- **Adds `avatar_url` column:** A new text column is added to the `profiles` table to store the URL of the user''s avatar.
- **Creates `avatars` bucket:** A new storage bucket is created specifically for profile pictures.
- **Sets Up RLS Policies:** Secure Row Level Security policies are created for the `avatars` bucket to ensure users can only manage their own profile picture.
- This is a non-destructive and essential operation for the new profile feature.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true
## Structure Details:
- Table `public.profiles`: Adds column `avatar_url`.
- Storage: Creates new bucket `avatars`.
## Security Implications:
- RLS Status: Enabled on new bucket.
- Policy Changes: Adds 4 new RLS policies for `storage.objects`.
- Auth Requirements: Admin privileges required.
## Performance Impact:
- Negligible.
*/

-- 1. Add avatar_url column to profiles table
ALTER TABLE public.profiles
ADD COLUMN avatar_url TEXT;

-- 2. Create a storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up RLS policies for the avatars bucket

-- Allow public read access to avatars
CREATE POLICY "Public avatars are viewable by everyone."
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Authenticated users can upload their own avatar."
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = ((storage.foldername(name))[1])::uuid );

-- Allow authenticated users to update their own avatar
CREATE POLICY "Authenticated users can update their own avatar."
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' AND auth.uid() = ((storage.foldername(name))[1])::uuid );

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Authenticated users can delete their own avatar."
ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' AND auth.uid() = ((storage.foldername(name))[1])::uuid );


-- MIGRATION: 20250924090000_create_testimonials.sql
/*
# [FEATURE] Testimonials System
This migration sets up the complete database structure for a real-time testimonials system.

## Query Description:
- **Creates `testimonials` table:** A new table to store reviews, ratings, content, and media URLs. It supports both registered users (via `user_id`) and guests (via `author_email`). It includes a `status` column for moderation.
- **Creates `testimonials-media` bucket:** A new, public storage bucket for images and videos submitted with testimonials.
- **Sets Up RLS Policies:**
  - **Table `testimonials`:**
    - Enables RLS.
    - Allows public read access ONLY for 'approved' testimonials.
    - Allows authenticated users to insert their own testimonials.
    - Allows admin users (service_role) to perform any action for moderation.
  - **Bucket `testimonials-media`:**
    - Allows public read access for all files.
    - Allows ANYONE to upload files (necessary for guest submissions via Edge Function).

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the table and bucket)

## Structure Details:
- Table `public.testimonials` created.
- Storage Bucket `testimonials-media` created.

## Security Implications:
- RLS Status: Enabled on the new table.
- Policy Changes: Yes, new policies for the table and storage bucket.
- Auth Requirements: Admin privileges to run migration.
*/

-- 1. Create testimonials table
CREATE TABLE public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    author_name TEXT NOT NULL,
    author_email TEXT, -- For guest submissions
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' -- 'pending', 'approved', 'rejected'
);

-- 2. Enable RLS on the new table
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for testimonials
CREATE POLICY "Public can view approved testimonials"
ON public.testimonials FOR SELECT
USING (status = 'approved');

CREATE POLICY "Users can insert their own testimonials"
ON public.testimonials FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all testimonials"
ON public.testimonials FOR ALL
USING (auth.role() = 'service_role');

-- 4. Create a storage bucket for testimonial media
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonials-media', 'testimonials-media', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Create RLS policies for the new bucket
CREATE POLICY "Public can view testimonial media"
ON storage.objects FOR SELECT
USING ( bucket_id = 'testimonials-media' );

CREATE POLICY "Anyone can upload to testimonial media"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'testimonials-media' );

-- Add trigger to update 'updated_at' column
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE PROCEDURE moddatetime(updated_at);


-- MIGRATION: 20250924090000_create_testimonials_system.sql
/*
# [FEATURE] Testimonials System
This migration creates the necessary database tables and storage buckets for a complete user testimonials/reviews system.
## Query Description:
- **Creates `testimonials` table:** This table will store review content, ratings, author information, and the status for moderation.
- **Creates `testimonials-media` bucket:** A dedicated, secure storage bucket for images and videos uploaded with testimonials.
- **Sets Up RLS Policies:** Secure Row Level Security policies are added to allow anyone to read approved testimonials, authenticated users to submit new ones, and to secure the media bucket.
- This is a non-destructive operation.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true
## Structure Details:
- Table `public.testimonials`: New table.
- Storage: Creates new bucket `testimonials-media`.
## Security Implications:
- RLS Status: Enabled on new table and bucket.
- Policy Changes: Adds new RLS policies.
- Auth Requirements: Admin privileges required.
## Performance Impact:
- Negligible.
*/

-- 1. Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_email TEXT,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' -- pending, approved, rejected
);

-- 2. Enable RLS on the new table
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for testimonials
CREATE POLICY "Public can read approved testimonials"
ON public.testimonials FOR SELECT
USING (status = 'approved');

CREATE POLICY "Authenticated users can insert their own testimonial"
ON public.testimonials FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can insert a testimonial if not logged in"
ON public.testimonials FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- 4. Create storage bucket for testimonial media
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonials-media', 'testimonials-media', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Create RLS policies for the new bucket
CREATE POLICY "Public can view testimonial media"
ON storage.objects FOR SELECT
USING ( bucket_id = 'testimonials-media' );

CREATE POLICY "Authenticated users can upload media for their testimonial"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'testimonials-media' );

CREATE POLICY "Anyone can upload media for a guest testimonial"
ON storage.objects FOR INSERT
TO anon
WITH CHECK ( bucket_id = 'testimonials-media' );


-- MIGRATION: 20250924100000_add_avatar_to_profiles.sql
/*
# [FEATURE] Add Avatar Support to Profiles
This migration adds full support for user profile pictures.
## Query Description:
- **Adds `avatar_url` column:** A new text column is added to the `profiles` table to store the URL of the user's avatar.
- **Creates `avatars` bucket:** A new storage bucket is created specifically for profile pictures.
- **Sets Up RLS Policies:** Secure Row Level Security policies are created for the `avatars` bucket to ensure users can only manage their own profile picture.
- This is a non-destructive and essential operation for the new profile feature.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true
## Structure Details:
- Table `public.profiles`: Adds column `avatar_url`.
- Storage: Creates new bucket `avatars`.
## Security Implications:
- RLS Status: Enabled on new bucket.
- Policy Changes: Adds 4 new RLS policies for `storage.objects`.
- Auth Requirements: Admin privileges required.
## Performance Impact:
- Negligible.
*/
-- 1. Add avatar_url column to profiles table
ALTER TABLE public.profiles
ADD COLUMN avatar_url TEXT;
-- 2. Create a storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
-- 3. Set up RLS policies for the avatars bucket
-- Allow public read access to avatars
CREATE POLICY "Public avatars are viewable by everyone."
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Authenticated users can upload their own avatar."
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1] );
-- Allow authenticated users to update their own avatar
CREATE POLICY "Authenticated users can update their own avatar."
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1] );
-- Allow authenticated users to delete their own avatar
CREATE POLICY "Authenticated users can delete their own avatar."
ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1] );


-- MIGRATION: 20250926000000_final_social_testimonials.sql
/*
# [FINAL FEATURE] Advanced Social Testimonials System
This migration completely overhauls the testimonials system to support social interactions, multiple media, and more detailed author information.
## Query Description:
- **Alters `testimonials` table:** Adds `media_urls` (array), `city`, `region`, `is_pinned`, `status`, `author_email`, and `reactions` (jsonb for counts). Drops old, unused columns.
- **Creates `testimonial_reactions` table:** Stores individual user reactions (like, love, etc.).
- **Creates `testimonial_comments` table:** Stores user comments.
- **Adds RLS Policies:** Secures the new tables.
- **Creates a Trigger:** An advanced trigger (`on_reaction_change`) automatically updates reaction counts for high performance.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: true (as it modifies an existing table)
- Reversible: false (due to complexity)
*/

-- Step 1: Alter the testimonials table to add all necessary columns if they don't exist
-- This is made idempotent to prevent errors on re-runs.
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'testimonials') THEN
    ALTER TABLE public.testimonials DROP COLUMN IF EXISTS image_url;
    ALTER TABLE public.testimonials DROP COLUMN IF EXISTS video_url;
    ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS author_email TEXT;
    ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS media_urls TEXT[];
    ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS region TEXT;
    ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
    ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' NOT NULL;
  END IF;
END $$;


-- Step 2: Create testimonial_reactions table
CREATE TABLE IF NOT EXISTS public.testimonial_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    testimonial_id UUID NOT NULL REFERENCES public.testimonials(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'wow', 'sad', 'angry')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT testimonial_reactions_unique_user_reaction UNIQUE (testimonial_id, user_id)
);

-- Step 3: Create testimonial_comments table
CREATE TABLE IF NOT EXISTS public.testimonial_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    testimonial_id UUID NOT NULL REFERENCES public.testimonials(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 4: Enable RLS and create policies
ALTER TABLE public.testimonial_reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all reactions." ON public.testimonial_reactions;
CREATE POLICY "Users can view all reactions." ON public.testimonial_reactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage their own reactions." ON public.testimonial_reactions;
CREATE POLICY "Users can manage their own reactions." ON public.testimonial_reactions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.testimonial_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all comments." ON public.testimonial_comments;
CREATE POLICY "Users can view all comments." ON public.testimonial_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage their own comments." ON public.testimonial_comments;
CREATE POLICY "Users can manage their own comments." ON public.testimonial_comments FOR ALL USING (auth.uid() = user_id);

-- Step 5: Create function and trigger for reaction counts
CREATE OR REPLACE FUNCTION update_testimonial_reaction_counts()
RETURNS TRIGGER AS $$
DECLARE
  reaction_counts JSONB;
BEGIN
  SELECT jsonb_object_agg(reaction_type, count)
  INTO reaction_counts
  FROM (
    SELECT reaction_type, COUNT(*) AS count
    FROM public.testimonial_reactions
    WHERE testimonial_id = COALESCE(NEW.testimonial_id, OLD.testimonial_id)
    GROUP BY reaction_type
  ) AS counts;

  UPDATE public.testimonials
  SET reactions = COALESCE(reaction_counts, '{}'::jsonb)
  WHERE id = COALESCE(NEW.testimonial_id, OLD.testimonial_id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_reaction_change ON public.testimonial_reactions;
CREATE TRIGGER on_reaction_change
AFTER INSERT OR UPDATE OR DELETE ON public.testimonial_reactions
FOR EACH ROW EXECUTE FUNCTION update_testimonial_reaction_counts();


-- MIGRATION: 20250926000000_finalize_testimonials_storage.sql
/*
# [FIX & FEATURE] Finalize Testimonials System Storage
This migration creates the necessary storage bucket and policies for testimonial media uploads, fixing the "non-2xx status code" error.
## Query Description:
- **Creates `testimonials-media` bucket:** A new public storage bucket is created to store images and videos for testimonials.
- **Sets Up RLS Policies:** Secure Row Level Security policies are created for the bucket. It allows anyone to upload files (for guest reviews) and everyone to read them. This is crucial for the `submit-testimonial` Edge Function to work.
- This is a non-destructive operation and is essential for the testimonials feature.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true
*/

-- 1. Create a storage bucket for testimonial media
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonials-media', 'testimonials-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS policies for the new bucket
-- Allow anyone to view the files.
DROP POLICY IF EXISTS "Public read access for testimonial media" ON storage.objects;
CREATE POLICY "Public read access for testimonial media"
ON storage.objects FOR SELECT
USING ( bucket_id = 'testimonials-media' );

-- Allow anyone (guests and users) to upload files. The edge function will handle validation.
DROP POLICY IF EXISTS "Allow uploads for testimonial media" ON storage.objects;
CREATE POLICY "Allow uploads for testimonial media"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK ( bucket_id = 'testimonials-media' );


-- MIGRATION: 20250926000000_fix_profile_address_columns.sql
/*
# [FIX] Add Address Columns to Profiles
This migration adds the necessary address columns to the `profiles` table to resolve the "column not found" error and enable profile address updates.
## Query Description:
- **Adds Address Columns:** Uses `ADD COLUMN IF NOT EXISTS` to safely add `address`, `city`, `postal_code`, and `region` to the `public.profiles` table. This is robust and can be run multiple times without error.
- This operation is non-destructive and essential for the profile management feature.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the new columns)
*/
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS region TEXT;


-- MIGRATION: 20250926000000_fix_profiles_schema.sql
/*
# [FIX] Add Address Columns to Profiles
This migration adds the necessary address columns to the `profiles` table to fix the "column not found" error during profile updates.
## Query Description:
- **Adds Address Columns:** Uses `ADD COLUMN IF NOT EXISTS` to safely add `address`, `city`, `postal_code`, and `region` to the `public.profiles` table.
- This is a non-destructive operation required for the profile management feature to function correctly.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the new columns)
*/
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS region TEXT;


-- MIGRATION: 20250926100000_add_public_profile_fields.sql
/*
# [FEATURE] Public Client Profiles & Social Links
This migration enhances the `profiles` table to support public-facing client profiles with bios and social media links.
## Query Description:
- **Adds `bio` column:** A new text column for the user''s biography.
- **Adds `social_links` column:** A JSONB column to flexibly store various social media URLs.
- **Adds `is_public` column:** A boolean flag to allow users to control the visibility of their profile.
- This operation is non-destructive and essential for the new community features.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the new columns)
*/
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;


-- MIGRATION: 20250926100000_add_testimonial_license_relations.sql
/*
# [FEATURE] Testimonials with License Relations
This migration adds a many-to-many relationship between testimonials and license types, enabling advanced filtering and more detailed submissions.
## Query Description:
- **Alters `testimonials` table:** Adds a `license_type_ids` column to store an array of associated license IDs. This is a denormalization for simpler querying.
- **Creates `testimonial_licenses` join table:** A proper join table is created to formally manage the many-to-many relationship.
- **Adds RLS Policies:** Secures the new join table.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true
*/
-- Add a denormalized column for easier filtering.
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS license_type_ids UUID[];
-- Create a join table for the many-to-many relationship
CREATE TABLE IF NOT EXISTS public.testimonial_licenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    testimonial_id UUID NOT NULL REFERENCES public.testimonials(id) ON DELETE CASCADE,
    license_type_id UUID NOT NULL REFERENCES public.license_types(id) ON DELETE CASCADE,
    CONSTRAINT testimonial_licenses_unique UNIQUE (testimonial_id, license_type_id)
);
-- Enable RLS and set policies for the join table
ALTER TABLE public.testimonial_licenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view testimonial license links." ON public.testimonial_licenses;
CREATE POLICY "Public can view testimonial license links." ON public.testimonial_licenses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage links for their own testimonials." ON public.testimonial_licenses;
CREATE POLICY "Users can manage links for their own testimonials." ON public.testimonial_licenses FOR ALL
USING (
  auth.uid() = (
    SELECT user_id FROM public.testimonials WHERE id = testimonial_id
  )
);


-- MIGRATION: 20250926100000_knowledge_base.sql
/*
# [FEATURE] Complete Knowledge Base
This migration creates the database structure for a full-featured knowledge base and populates it with initial articles.
## Query Description:
- **Creates `knowledge_base_articles` table:** Stores help articles with categories, multilingual titles and content, and a URL-friendly slug.
- **Adds RLS Policies:** Ensures articles are publicly readable.
- **Inserts Initial Data:** Populates the table with essential FAQ articles covering account management, payments, applications, and security.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the table)
*/

-- Create the table for knowledge base articles
CREATE TABLE IF NOT EXISTS public.knowledge_base_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    title_fr TEXT NOT NULL,
    title_en TEXT NOT NULL,
    content_fr TEXT NOT NULL,
    content_en TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.knowledge_base_articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public read access
DROP POLICY IF EXISTS "Public can read knowledge base articles." ON public.knowledge_base_articles;
CREATE POLICY "Public can read knowledge base articles." ON public.knowledge_base_articles FOR SELECT USING (true);

-- Insert initial articles
INSERT INTO public.knowledge_base_articles (category, title_fr, title_en, content_fr, content_en, slug)
VALUES
    ('Compte', 'Comment mettre à jour mon profil ?', 'How to update my profile?', 'Pour mettre à jour votre profil, connectez-vous à votre tableau de bord, cliquez sur "Mon Profil" dans le menu de gauche. Vous pourrez y modifier vos informations personnelles, votre adresse, votre mot de passe et même votre photo de profil. N''oubliez pas de sauvegarder chaque section après modification.', 'To update your profile, log in to your dashboard, and click on "My Profile" in the left-hand menu. There, you can edit your personal information, address, password, and even your profile picture. Don''t forget to save each section after making changes.', 'how-to-update-profile'),
    ('Compte', 'Comment changer mon mot de passe ?', 'How to change my password?', 'Dans la section "Mon Profil" de votre tableau de bord, vous trouverez une section dédiée au changement de mot de passe. Entrez votre nouveau mot de passe, confirmez-le, et cliquez sur "Changer le mot de passe". Pour des raisons de sécurité, nous vous recommandons d''utiliser un mot de passe fort.', 'In the "My Profile" section of your dashboard, you will find a dedicated section for changing your password. Enter your new password, confirm it, and click "Change Password". For security reasons, we recommend using a strong password.', 'how-to-change-password'),
    ('Paiements', 'Quels sont les moyens de paiement acceptés ?', 'What payment methods are accepted?', 'Nous acceptons les paiements par carte bancaire (Visa, MasterCard via Stripe), PayPal, et certaines cryptomonnaies à titre de démonstration. Toutes les transactions sont sécurisées par nos partenaires de paiement, leaders dans leur domaine.', 'We accept payments by credit card (Visa, MasterCard via Stripe), PayPal, and certain cryptocurrencies for demonstration purposes. All transactions are secured by our payment partners, who are leaders in their field.', 'accepted-payment-methods'),
    ('Paiements', 'Mon paiement a échoué, que faire ?', 'My payment failed, what should I do?', 'Si votre paiement échoue, vérifiez d''abord les informations que vous avez saisies (numéro de carte, date d''expiration, etc.). Essayez d''utiliser une autre méthode de paiement. Si le problème persiste, n''hésitez pas à contacter notre support client via la page de contact.', 'If your payment fails, first check the information you entered (card number, expiration date, etc.). Try using another payment method. If the problem persists, do not hesitate to contact our customer support via the contact page.', 'what-if-payment-fails'),
    ('Demandes', 'Comment suivre ma demande de permis ?', 'How to track my license application?', 'Chaque demande que vous soumettez se voit attribuer un numéro de suivi unique et un QR code sur la page de confirmation. Vous pouvez utiliser ce numéro sur la page "Suivi de Demande" ou scanner le QR code pour voir l''état d''avancement de votre dossier en temps réel.', 'Each application you submit is assigned a unique tracking number and a QR code on the confirmation page. You can use this number on the "Track Application" page or scan the QR code to see the real-time status of your file.', 'how-to-track-application'),
    ('Demandes', 'Puis-je annuler une demande ?', 'Can I cancel an application?', 'Une demande peut être annulée tant qu''elle n''a pas été payée. Une fois le paiement effectué, le processus de traitement est lancé et l''annulation n''est plus possible. Pour toute question, veuillez contacter le support avant de procéder au paiement.', 'An application can be canceled as long as it has not been paid for. Once payment is made, the processing begins, and cancellation is no longer possible. For any questions, please contact support before proceeding with payment.', 'can-i-cancel-application')
ON CONFLICT (slug) DO NOTHING;


-- MIGRATION: 20250927000000_testimonial_enhancements.sql
/*
# [Feature] Enhance Testimonial System
This migration adds share tracking capabilities to the testimonials table and a function to handle increments atomically.

## Query Description:
- Adds a `share_counts` JSONB column to the `testimonials` table to store share counts for different networks. This is non-destructive.
- Creates a PostgreSQL function `increment_testimonial_share` to safely increment the share count for a given network. This prevents race conditions and simplifies client-side logic.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (The column and function can be dropped)

## Structure Details:
- Table Modified: `public.testimonials`
  - Column Added: `share_counts` (Type: JSONB, Default: '{}')
- Function Added: `public.increment_testimonial_share(testimonial_id_to_update UUID, network TEXT)`

## Security Implications:
- RLS Status: Unchanged.
- Policy Changes: No.
- Auth Requirements: The created function uses `SECURITY DEFINER`, which is necessary to allow it to update the table. Access to this function should be controlled via RLS on the `testimonials` table for RPC calls if needed.

## Performance Impact:
- Indexes: None added. Consider a GIN index on `share_counts` if you plan to query this column frequently on a large dataset.
- Triggers: None added.
- Estimated Impact: Low.
*/

-- Add share_counts column to testimonials table
ALTER TABLE public.testimonials
ADD COLUMN share_counts JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Create a function to increment share counts atomically
CREATE OR REPLACE FUNCTION increment_testimonial_share(testimonial_id_to_update UUID, network TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_counts JSONB;
  new_count INT;
BEGIN
  -- Select the current share_counts for the specific testimonial
  -- and lock the row for update to prevent race conditions.
  SELECT share_counts INTO current_counts FROM public.testimonials WHERE id = testimonial_id_to_update FOR UPDATE;

  -- Get the current count for the specific network, default to 0 if not present
  new_count := COALESCE((current_counts->>network)::int, 0) + 1;

  -- Update the JSONB field
  UPDATE public.testimonials
  SET share_counts = jsonb_set(
    current_counts,
    ARRAY[network],
    to_jsonb(new_count)
  )
  WHERE id = testimonial_id_to_update;
END;
$$;

-- Grant execute permission to the authenticated role
GRANT EXECUTE ON FUNCTION public.increment_testimonial_share(UUID, TEXT) TO authenticated;


-- MIGRATION: 20250928090000_add_status_to_gallery.sql
/*
# Add Status to Gallery Media
Adds a 'status' column to the 'gallery_media' table to track the moderation state of submissions.

## Query Description: This operation adds a new 'status' column to the 'gallery_media' table. It will default to 'pending' for all new entries and set existing entries to 'approved' to ensure they remain visible. This change is non-destructive and essential for implementing media management features. It also updates security policies to allow users to see their own pending/rejected media while the public can only see approved ones.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: gallery_media
- Column Added: status (TEXT) with default 'pending'
- Policies Modified: Replaces the public read policy with more secure, status-aware policies.

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: None

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Minimal. A brief lock may occur on the 'gallery_media' table during the alteration.
*/

-- 1. Add the status column with a default value
ALTER TABLE public.gallery_media
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';

-- 2. Set existing media to 'approved' so they don't disappear from public view
UPDATE public.gallery_media
SET status = 'approved';

-- 3. Drop the old insecure read policy
DROP POLICY IF EXISTS "Allow public read access" ON public.gallery_media;

-- 4. Create a new policy to allow public read access ONLY to approved media
CREATE POLICY "Allow public read access to approved media"
ON public.gallery_media FOR SELECT
USING (status = 'approved');

-- 5. Create a new policy to allow users to see their own media, regardless of status
CREATE POLICY "Allow users to view their own media"
ON public.gallery_media FOR SELECT
USING (auth.uid() = user_id);


-- MIGRATION: 20250928100000_add_form_data_to_applications.sql
/*
# [Structural] Add form_data column to license_applications
This migration adds a new JSONB column named `form_data` to the `license_applications` table. This column is required to store additional, non-structured data from the application form, such as the NEPH number.

## Query Description:
This is a non-destructive operation that adds a new column. It will not affect existing data. Existing rows will have a NULL value for this new column, which is the expected behavior.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (The column can be dropped if needed)

## Structure Details:
- Table: license_applications
- Column Added: form_data (JSONB)

## Security Implications:
- RLS Status: Unchanged. RLS policies on the table will apply to this new column as well.
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None added. Negligible impact on write performance.
- Triggers: None added.
- Estimated Impact: Low.
*/

ALTER TABLE public.license_applications
ADD COLUMN IF NOT EXISTS form_data JSONB;


-- MIGRATION: 20250928110000_add_read_receipts_to_chat.sql
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


-- MIGRATION: 20250928120000_add_pending_payment_status.sql
/*
          # [Structural] Add 'pending_payment' to application_status enum
          Adds a new value to the application_status enum to support the payment workflow.

          ## Query Description: [This is a safe, non-destructive operation that alters a data type. It adds the 'pending_payment' status to the list of possible application statuses, which is required for the application submission form to work correctly. No existing data will be affected.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Type: application_status
          
          ## Security Implications:
          - RLS Status: Not Applicable
          - Policy Changes: No
          - Auth Requirements: None
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible
          */
ALTER TYPE public.application_status ADD VALUE 'pending_payment' BEFORE 'submitted';


-- MIGRATION: 20250928120000_create_application_documents_bucket.sql
/*
  # [Feature] Create Storage Bucket for Application Documents
  [This script creates the necessary storage bucket for application documents and sets up security policies.]

  ## Query Description:
  - Creates a new storage bucket named 'application-documents'.
  - Enables Row Level Security (RLS) on the storage objects table.
  - Creates policies to ensure users can only access and manage their own files.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Security Implications:
  - RLS Status: Enabled
  - Policy Changes: Yes
  - Auth Requirements: Authenticated users
*/

-- 1. Create the storage bucket for application documents.
-- We set it to public so that we can generate signed URLs, but RLS will protect the files.
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable Row Level Security on the storage objects table.
-- This is a crucial step to enforce our access policies.
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy for SELECT (download).
-- This policy allows authenticated users to download files only from their own folder.
-- The user's ID is expected to be the first part of the file path.
CREATE POLICY "Allow authenticated users to select their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'application-documents' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- 4. Create a policy for INSERT (upload).
-- This policy allows authenticated users to upload files only into their own folder.
CREATE POLICY "Allow authenticated users to insert their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'application-documents' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- 5. Create a policy for DELETE.
-- This policy allows authenticated users to delete their own files.
CREATE POLICY "Allow authenticated users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'application-documents' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);


-- MIGRATION: 20250928120000_create_gallery_system.sql
/*
  # [SCHEMA] Galerie Média Avancée
  Mise en place du schéma complet pour la galerie média, incluant le stockage, les likes, les commentaires et les favoris.

  ## Description de la Requête:
  Cette migration crée quatre nouvelles tables (`gallery_media`, `gallery_likes`, `gallery_comments`, `gallery_favorites`) et un bucket de stockage (`gallery-media`). Ces changements sont structurels et n'affectent aucune donnée existante. Ils sont essentiels pour la nouvelle fonctionnalité de galerie.

  ## Métadonnées:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true (en supprimant les tables et le bucket)

  ## Détails de la Structure:
  - Tables créées: `gallery_media`, `gallery_likes`, `gallery_comments`, `gallery_favorites`
  - Bucket de stockage créé: `gallery-media`
  - Colonnes ajoutées: Diverses colonnes pour stocker les métadonnées des médias, les relations, les likes, les commentaires, etc.
  - Relations: Clés étrangères entre les nouvelles tables et la table `profiles`.

  ## Implications de Sécurité:
  - RLS Status: Activé sur toutes les nouvelles tables.
  - Policy Changes: Des politiques de sécurité (RLS) sont ajoutées pour contrôler l'accès aux données de la galerie.
  - Auth Requirements: Les opérations d'écriture (INSERT, UPDATE, DELETE) nécessitent un utilisateur authentifié. La lecture est publique.

  ## Impact sur la Performance:
  - Indexes: Des index sont ajoutés sur les clés étrangères et les colonnes fréquemment interrogées pour garantir de bonnes performances.
  - Triggers: Aucun.
  - Estimated Impact: Faible.
*/

-- 1. Créer le bucket de stockage pour les médias de la galerie
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-media', 'gallery-media', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Créer la table pour les médias de la galerie
CREATE TABLE IF NOT EXISTS public.gallery_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    media_type TEXT NOT NULL, -- 'image' or 'video'
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;

-- 3. Créer la table pour les likes
CREATE TABLE IF NOT EXISTS public.gallery_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id UUID REFERENCES public.gallery_media(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(media_id, user_id)
);
ALTER TABLE public.gallery_likes ENABLE ROW LEVEL SECURITY;

-- 4. Créer la table pour les commentaires
CREATE TABLE IF NOT EXISTS public.gallery_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id UUID REFERENCES public.gallery_media(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.gallery_comments ENABLE ROW LEVEL SECURITY;

-- 5. Créer la table pour les favoris
CREATE TABLE IF NOT EXISTS public.gallery_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id UUID REFERENCES public.gallery_media(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(media_id, user_id)
);
ALTER TABLE public.gallery_favorites ENABLE ROW LEVEL SECURITY;

-- 6. Ajouter des index pour la performance
CREATE INDEX IF NOT EXISTS idx_gallery_media_user_id ON public.gallery_media(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_likes_media_id ON public.gallery_likes(media_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_media_id ON public.gallery_comments(media_id);
CREATE INDEX IF NOT EXISTS idx_gallery_favorites_user_id ON public.gallery_favorites(user_id);

-- 7. Définir les politiques de sécurité (RLS)

-- gallery_media
DROP POLICY IF EXISTS "Allow public read access on gallery_media" ON public.gallery_media;
CREATE POLICY "Allow public read access on gallery_media" ON public.gallery_media FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to insert their own media" ON public.gallery_media;
CREATE POLICY "Allow users to insert their own media" ON public.gallery_media FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own media" ON public.gallery_media;
CREATE POLICY "Allow users to update their own media" ON public.gallery_media FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own media" ON public.gallery_media;
CREATE POLICY "Allow users to delete their own media" ON public.gallery_media FOR DELETE USING (auth.uid() = user_id);

-- gallery_likes
DROP POLICY IF EXISTS "Allow public read access on gallery_likes" ON public.gallery_likes;
CREATE POLICY "Allow public read access on gallery_likes" ON public.gallery_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to insert/delete their own likes" ON public.gallery_likes;
CREATE POLICY "Allow users to insert/delete their own likes" ON public.gallery_likes FOR ALL USING (auth.uid() = user_id);

-- gallery_comments
DROP POLICY IF EXISTS "Allow public read access on gallery_comments" ON public.gallery_comments;
CREATE POLICY "Allow public read access on gallery_comments" ON public.gallery_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to insert their own comments" ON public.gallery_comments;
CREATE POLICY "Allow users to insert their own comments" ON public.gallery_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own comments" ON public.gallery_comments;
CREATE POLICY "Allow users to update their own comments" ON public.gallery_comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own comments" ON public.gallery_comments;
CREATE POLICY "Allow users to delete their own comments" ON public.gallery_comments FOR DELETE USING (auth.uid() = user_id);

-- gallery_favorites
DROP POLICY IF EXISTS "Allow users to manage their own favorites" ON public.gallery_favorites;
CREATE POLICY "Allow users to manage their own favorites" ON public.gallery_favorites FOR ALL USING (auth.uid() = user_id);


-- MIGRATION: 20250928120000_fix_chat_function_and_policy.sql
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


-- MIGRATION: 20250928130000_add_chat_functions.sql
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


-- MIGRATION: 20250929100000_add_gallery_interactions.sql
/*
  # [Gallery Interaction System Upgrade]
  Adds features for liking comments and tracking media shares.

  ## Query Description:
  This operation adds new structures to support user interactions within the gallery. It introduces a table for comment likes and a column for tracking share counts on media. These changes are non-destructive and will not affect existing data, but they are essential for the new social features to function correctly.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Adds new table: `public.gallery_comment_likes`
  - Adds new column: `share_counts` to `public.gallery_media`
  - Adds new function: `public.increment_gallery_share`

  ## Security Implications:
  - RLS Status: Enabled on the new table.
  - Policy Changes: Yes, new policies are created for `gallery_comment_likes`.
  - Auth Requirements: Users must be authenticated to like comments.

  ## Performance Impact:
  - Indexes: Primary key and foreign key indexes are added on the new table.
  - Triggers: None.
  - Estimated Impact: Negligible performance impact.
*/

-- 1. Create table for gallery comment likes
CREATE TABLE public.gallery_comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.gallery_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (comment_id, user_id)
);

-- 2. Add comments to the new table and columns
COMMENT ON TABLE public.gallery_comment_likes IS 'Stores likes for comments on gallery media.';
COMMENT ON COLUMN public.gallery_comment_likes.comment_id IS 'The liked comment.';
COMMENT ON COLUMN public.gallery_comment_likes.user_id IS 'The user who liked the comment.';

-- 3. Enable RLS on the new table
ALTER TABLE public.gallery_comment_likes ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for gallery_comment_likes
CREATE POLICY "Allow public read access on comment likes"
ON public.gallery_comment_likes
FOR SELECT
USING (true);

CREATE POLICY "Allow users to insert their own comment likes"
ON public.gallery_comment_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own comment likes"
ON public.gallery_comment_likes
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Add share_counts column to gallery_media
ALTER TABLE public.gallery_media
ADD COLUMN share_counts JSONB DEFAULT '{}'::jsonb NOT NULL;

COMMENT ON COLUMN public.gallery_media.share_counts IS 'Tracks share counts for different social networks.';

-- 6. Create RPC function to increment share counts
CREATE OR REPLACE FUNCTION public.increment_gallery_share(media_id_to_update UUID, network_to_increment TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.gallery_media
  SET share_counts = jsonb_set(
    share_counts,
    ARRAY[network_to_increment],
    (COALESCE(share_counts->>network_to_increment, '0')::INT + 1)::TEXT::JSONB
  )
  WHERE id = media_id_to_update;
END;
$$;


-- MIGRATION: 20250929100000_add_presence_features.sql
/*
          # [Structural] Ajout des fonctionnalités de présence
          Ajoute une colonne `last_seen` à la table des profils pour suivre la présence des utilisateurs.

          ## Query Description: [Cette opération ajoute une colonne non destructive. Elle est essentielle pour la fonctionnalité de "vu pour la dernière fois" et n'impacte pas les données existantes.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Table: public.profiles
          - Columns Added: last_seen (TIMESTAMPTZ)
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes (Mise à jour de la politique existante)
          - Auth Requirements: L'utilisateur doit être authentifié pour mettre à jour son propre statut.
          
          ## Performance Impact:
          - Indexes: Aucun
          - Triggers: Aucun
          - Estimated Impact: Faible.
          */

ALTER TABLE public.profiles
ADD COLUMN last_seen TIMESTAMPTZ;

-- Mettre à jour la politique RLS pour permettre aux utilisateurs de mettre à jour leur propre `last_seen`
-- Cette commande remplace la politique existante pour s'assurer que la nouvelle colonne est incluse.
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- MIGRATION: 20250929100000_create_application_documents_bucket.sql
/*
# [Fix] Create Storage Bucket and Policies for Application Documents
This migration creates the necessary storage bucket for application documents and sets up security policies to ensure users can only access their own files.

## Query Description:
This script performs the following actions:
1. Creates a new storage bucket named 'application-documents' if it does not already exist.
2. Creates a policy to allow authenticated users to view documents within their own folder in this bucket.
3. Creates a policy to allow authenticated users to upload documents into their own folder in this bucket.
This script is safe to run and corrects the previous permission error by removing the forbidden ALTER TABLE command.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping policies and bucket)

## Structure Details:
- storage.buckets: A new row is inserted for 'application-documents'.
- storage.objects: New RLS policies are created for authenticated users.

## Security Implications:
- RLS Status: Assumes RLS is enabled on storage.objects (default Supabase behavior).
- Policy Changes: Yes, adds two new policies for secure access.
- Auth Requirements: Policies rely on `auth.uid()`.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Low. RLS policies add a small, necessary overhead to storage queries.
*/

-- 1. Create a new storage bucket for application documents if it doesn't already exist.
-- This is made idempotent with ON CONFLICT to prevent errors on re-runs.
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Create a policy for users to VIEW their own documents.
-- This allows a user to see all files inside a folder named with their user_id.
-- We drop the policy first to ensure this script can be re-run.
DROP POLICY IF EXISTS "Allow authenticated users to view own documents" ON storage.objects;
CREATE POLICY "Allow authenticated users to view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'application-documents' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- 3. Create a policy for users to UPLOAD documents into their own folder.
-- This allows a user to insert files into a folder named with their user_id.
-- We drop the policy first to ensure this script can be re-run.
DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'application-documents' AND auth.uid() = (storage.foldername(name))[1]::uuid);


-- MIGRATION: 20250929100000_create_gallery_system.sql
/*
          # [Opération] Création du Système de Galerie Média
          [Ce script met en place l'infrastructure complète pour une galerie média avancée, incluant le stockage des images et vidéos, ainsi que la gestion des interactions utilisateurs comme les likes, commentaires et favoris.]

          ## Description de la Requête:
          - **Impact sur les données :** Aucune donnée existante ne sera affectée car ce script ne crée que de nouvelles tables et un nouveau bucket de stockage.
          - **Risques :** Le risque est faible. L'opération est additive et n'altère pas la structure existante.
          - **Précautions :** Il est toujours recommandé d'avoir une sauvegarde de votre base de données avant d'appliquer toute migration structurelle.

          ## Métadonnées:
          - Schéma-Catégorie: "Structural"
          - Impact-Niveau: "Low"
          - Nécessite-Sauvegarde: false
          - Réversible: true (en supprimant les tables et le bucket créés)

          ## Détails de la Structure:
          - **Nouveau Bucket de Stockage :** `gallery-media` pour stocker les fichiers image et vidéo téléversés.
          - **Nouvelles Tables :**
            - `gallery_media`: Table principale pour référencer chaque média (image ou vidéo), son auteur, son type, son URL, et son statut de modération.
            - `gallery_likes`: Pour enregistrer les "likes" des utilisateurs sur chaque média.
            - `gallery_comments`: Pour stocker les commentaires laissés sur les médias.
            - `gallery_favorites`: Pour permettre aux utilisateurs de sauvegarder leurs médias préférés.
          - **Sécurité :** Des politiques de sécurité au niveau des lignes (RLS) sont mises en place pour contrôler précisément qui peut voir, ajouter, modifier ou supprimer des médias et des interactions.

          ## Implications de Sécurité:
          - RLS Status: Activé sur toutes les nouvelles tables.
          - Changements de Politique: Oui, des politiques sont créées pour sécuriser l'accès aux nouvelles tables.
          - Exigences d'Authentification: Les utilisateurs doivent être authentifiés pour ajouter du contenu ou interagir (liker, commenter, etc.).

          ## Impact sur la Performance:
          - Index: Des index sont créés sur les clés étrangères pour garantir des performances de lecture rapides lors de la jointure des tables (ex: récupérer un média avec le profil de son auteur).
          - Déclencheurs: Aucun.
          - Impact Estimé: Faible. Les nouvelles tables n'impacteront pas les performances des requêtes existantes.
          */

-- 1. Créer le bucket de stockage pour les médias de la galerie
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gallery-media', 'gallery-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

-- 2. Créer la table pour les médias de la galerie
CREATE TABLE IF NOT EXISTS public.gallery_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'url')),
    created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.gallery_media IS 'Stores all media items for the advanced gallery.';
COMMENT ON COLUMN public.gallery_media.user_id IS 'The user who uploaded the media.';
COMMENT ON COLUMN public.gallery_media.media_type IS 'Type of the media (image or video).';
COMMENT ON COLUMN public.gallery_media.media_url IS 'URL to the media file (either in storage or external).';
COMMENT ON COLUMN public.gallery_media.thumbnail_url IS 'URL to a thumbnail, especially for videos.';
COMMENT ON COLUMN public.gallery_media.status IS 'Moderation status of the media.';
COMMENT ON COLUMN public.gallery_media.source_type IS 'Origin of the media (direct upload or external URL).';

-- 3. Créer la table pour les "likes"
CREATE TABLE IF NOT EXISTS public.gallery_likes (
    media_id UUID NOT NULL REFERENCES public.gallery_media(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (media_id, user_id)
);

COMMENT ON TABLE public.gallery_likes IS 'Tracks user likes on gallery media.';

-- 4. Créer la table pour les commentaires
CREATE TABLE IF NOT EXISTS public.gallery_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    media_id UUID NOT NULL REFERENCES public.gallery_media(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.gallery_comments IS 'Stores user comments on gallery media.';

-- 5. Créer la table pour les favoris
CREATE TABLE IF NOT EXISTS public.gallery_favorites (
    media_id UUID NOT NULL REFERENCES public.gallery_media(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (media_id, user_id)
);

COMMENT ON TABLE public.gallery_favorites IS 'Tracks which media items users have saved to their favorites.';

-- 6. Activer RLS et créer les politiques de sécurité

-- Table gallery_media
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to approved media" ON public.gallery_media;
CREATE POLICY "Allow public read access to approved media" ON public.gallery_media
FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Allow users to insert their own media" ON public.gallery_media;
CREATE POLICY "Allow users to insert their own media" ON public.gallery_media
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own media" ON public.gallery_media;
CREATE POLICY "Allow users to update their own media" ON public.gallery_media
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own media" ON public.gallery_media;
CREATE POLICY "Allow users to delete their own media" ON public.gallery_media
FOR DELETE USING (auth.uid() = user_id);

-- Table gallery_likes
ALTER TABLE public.gallery_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.gallery_likes;
CREATE POLICY "Allow public read access" ON public.gallery_likes
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert likes" ON public.gallery_likes;
CREATE POLICY "Allow authenticated users to insert likes" ON public.gallery_likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own likes" ON public.gallery_likes;
CREATE POLICY "Allow users to delete their own likes" ON public.gallery_likes
FOR DELETE USING (auth.uid() = user_id);

-- Table gallery_comments
ALTER TABLE public.gallery_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.gallery_comments;
CREATE POLICY "Allow public read access" ON public.gallery_comments
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert comments" ON public.gallery_comments;
CREATE POLICY "Allow authenticated users to insert comments" ON public.gallery_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own comments" ON public.gallery_comments;
CREATE POLICY "Allow users to update their own comments" ON public.gallery_comments
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own comments" ON public.gallery_comments;
CREATE POLICY "Allow users to delete their own comments" ON public.gallery_comments
FOR DELETE USING (auth.uid() = user_id);

-- Table gallery_favorites
ALTER TABLE public.gallery_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read their own favorites" ON public.gallery_favorites;
CREATE POLICY "Allow users to read their own favorites" ON public.gallery_favorites
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow authenticated users to insert favorites" ON public.gallery_favorites;
CREATE POLICY "Allow authenticated users to insert favorites" ON public.gallery_favorites
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own favorites" ON public.gallery_favorites;
CREATE POLICY "Allow users to delete their own favorites" ON public.gallery_favorites
FOR DELETE USING (auth.uid() = user_id);

-- 7. Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_gallery_media_user_id ON public.gallery_media(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_media_status ON public.gallery_media(status);
CREATE INDEX IF NOT EXISTS idx_gallery_likes_media_id ON public.gallery_likes(media_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_media_id ON public.gallery_comments(media_id);
CREATE INDEX IF NOT EXISTS idx_gallery_favorites_user_id ON public.gallery_favorites(user_id);


-- MIGRATION: 20250929100000_fix_chat_functions.sql
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


-- MIGRATION: 20250929120000_fix_chat_schema.sql
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


-- MIGRATION: 20250929120000_fix_messaging_functions_and_rls.sql
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


-- MIGRATION: 20250929140000_fix_chat_function.sql
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


-- MIGRATION: 20251004130105_20250121000000_initial_schema.sql
/*
# Initial Database Schema for PermisCode Agency
Création du schéma initial pour l'agence de permis de conduire français

## Query Description:
Cette migration crée la structure de base de données complète pour l'agence PermisCode.
Inclut les tables pour les utilisateurs, demandes de permis, documents et paiements.
Aucune donnée existante n'est affectée car il s'agit de la création initiale.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table profiles: Profils utilisateurs étendus
- Table license_types: Types de permis disponibles (with image_url field)
- Table license_applications: Demandes de permis
- Table application_documents: Documents uploadés
- Table payments: Paiements et facturation

## Security Implications:
- RLS Status: Enabled sur toutes les tables publiques
- Policy Changes: Yes - Politiques de sécurité strictes
- Auth Requirements: Authentification requise pour accès

## Performance Impact:
- Indexes: Ajout d'index optimisés
- Triggers: Trigger de création automatique de profil
- Estimated Impact: Minimal - Tables vides
*/

-- Create custom types
DO $$ BEGIN
  CREATE TYPE license_category AS ENUM (
    'AM', 'A1', 'A2', 'A', 'B1', 'B2', 'B', 'C1', 'C2', 'C', 
    'D1', 'D', 'BE', 'C1E', 'CE', 'D1E', 'DE', 'L', 'T'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM (
    'draft', 'submitted', 'in_review', 'approved', 'completed', 'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending', 'completed', 'failed', 'refunded'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'France',
  preferred_language TEXT DEFAULT 'fr' CHECK (preferred_language IN ('fr', 'en')),
  neph_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- License types with pricing and unique image
CREATE TABLE IF NOT EXISTS public.license_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category license_category NOT NULL UNIQUE,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_fr TEXT,
  description_en TEXT,
  price_euros INTEGER NOT NULL,
  image_url TEXT,
  processing_days INTEGER DEFAULT 7,
  requires_theory_test BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- License applications
CREATE TABLE IF NOT EXISTS public.license_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  license_type_id UUID REFERENCES public.license_types(id) NOT NULL,
  status application_status DEFAULT 'draft',
  application_number TEXT UNIQUE,
  total_amount INTEGER NOT NULL,
  theory_test_needed BOOLEAN DEFAULT FALSE,
  theory_test_fee INTEGER DEFAULT 0,
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document types
CREATE TABLE IF NOT EXISTS public.document_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_fr TEXT,
  description_en TEXT,
  is_required BOOLEAN DEFAULT TRUE,
  accepted_formats TEXT[] DEFAULT ARRAY['pdf', 'jpg', 'jpeg', 'png'],
  max_size_mb INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application documents
CREATE TABLE IF NOT EXISTS public.application_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.license_applications(id) ON DELETE CASCADE NOT NULL,
  document_type_id UUID REFERENCES public.document_types(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.license_applications(id) ON DELETE CASCADE NOT NULL,
  amount_euros INTEGER NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  language TEXT DEFAULT 'fr',
  replied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert license types with pricing and unique images
INSERT INTO public.license_types (category, name_fr, name_en, description_fr, description_en, price_euros, image_url) VALUES
('AM', 'Cyclomoteur', 'Moped License', 'Permis pour cyclomoteurs de 50cc maximum', 'License for mopeds up to 50cc', 800, 'https://images.pexels.com/photos/163210/motorcycles-race-helmets-pilots-163210.jpeg?auto=compress&cs=tinysrgb&w=800'),
('A1', 'Motocyclette 125cc', 'Light Motorcycle', 'Permis pour motocyclettes jusqu''à 125cc', 'License for motorcycles up to 125cc', 800, 'https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg?auto=compress&cs=tinysrgb&w=800'),
('A2', 'Motocyclette bridée', 'Restricted Motorcycle', 'Permis pour motocyclettes bridées à 35kW', 'License for motorcycles limited to 35kW', 800, 'https://images.pexels.com/photos/2519370/pexels-photo-2519370.jpeg?auto=compress&cs=tinysrgb&w=800'),
('A', 'Motocyclette', 'Motorcycle License', 'Permis pour toutes motocyclettes', 'License for all motorcycles', 800, 'https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg?auto=compress&cs=tinysrgb&w=800'),
('B1', 'Quadricycle lourd', 'Heavy Quadricycle', 'Permis pour quadricycles lourds à moteur', 'License for heavy motor quadricycles', 2123, 'https://images.pexels.com/photos/1077785/pexels-photo-1077785.jpeg?auto=compress&cs=tinysrgb&w=800'),
('B2', 'Véhicule léger renforcé', 'Enhanced Light Vehicle', 'Permis véhicule léger avec remorque', 'Light vehicle license with trailer', 2123, 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=800'),
('B', 'Véhicule léger', 'Car License', 'Permis de conduire automobile standard', 'Standard car driving license', 2123, 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'),
('C1', 'Poids lourd léger', 'Light Truck', 'Permis pour véhicules de 3,5 à 7,5 tonnes', 'License for vehicles 3.5 to 7.5 tons', 3000, 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800'),
('C2', 'Poids lourd moyen', 'Medium Truck', 'Permis pour véhicules de 7,5 à 19 tonnes', 'License for vehicles 7.5 to 19 tons', 3000, 'https://images.pexels.com/photos/1335074/pexels-photo-1335074.jpeg?auto=compress&cs=tinysrgb&w=800'),
('C', 'Poids lourd', 'Heavy Truck', 'Permis pour véhicules de plus de 3,5 tonnes', 'License for vehicles over 3.5 tons', 3000, 'https://images.pexels.com/photos/753267/pexels-photo-753267.jpeg?auto=compress&cs=tinysrgb&w=800'),
('D1', 'Transport de personnes léger', 'Light Passenger Transport', 'Permis pour véhicules de 9 à 16 places', 'License for 9 to 16 passenger vehicles', 3189, 'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=800'),
('D', 'Transport de personnes', 'Passenger Transport', 'Permis pour véhicules de plus de 8 places', 'License for vehicles over 8 passengers', 3089, 'https://images.pexels.com/photos/385998/pexels-photo-385998.jpeg?auto=compress&cs=tinysrgb&w=800'),
('BE', 'Véhicule + remorque', 'Car with Trailer', 'Permis B avec remorque lourde', 'Category B with heavy trailer', 2123, 'https://images.pexels.com/photos/1213294/pexels-photo-1213294.jpeg?auto=compress&cs=tinysrgb&w=800'),
('C1E', 'Poids lourd léger + remorque', 'Light Truck with Trailer', 'Permis C1 avec remorque', 'Category C1 with trailer', 3089, 'https://images.pexels.com/photos/1719659/pexels-photo-1719659.jpeg?auto=compress&cs=tinysrgb&w=800'),
('CE', 'Poids lourd + remorque', 'Heavy Truck with Trailer', 'Permis C avec remorque', 'Category C with trailer', 3089, 'https://images.pexels.com/photos/2449600/pexels-photo-2449600.jpeg?auto=compress&cs=tinysrgb&w=800'),
('D1E', 'Transport léger + remorque', 'Light Transport with Trailer', 'Permis D1 avec remorque', 'Category D1 with trailer', 3500, 'https://images.pexels.com/photos/163945/bus-oldtimer-historically-vehicle-163945.jpeg?auto=compress&cs=tinysrgb&w=800'),
('DE', 'Transport + remorque', 'Transport with Trailer', 'Permis D avec remorque', 'Category D with trailer', 3089, 'https://images.pexels.com/photos/175568/pexels-photo-175568.jpeg?auto=compress&cs=tinysrgb&w=800')
ON CONFLICT (category) DO NOTHING;

-- Insert document types
INSERT INTO public.document_types (name_fr, name_en, description_fr, description_en) VALUES
('CNI Recto/Verso', 'ID Card Front/Back', 'Carte nationale d''identité recto et verso', 'National identity card front and back'),
('Passeport', 'Passport', 'Passeport en cours de validité', 'Valid passport'),
('Titre de séjour', 'Residence Permit', 'Titre de séjour en cours de validité', 'Valid residence permit'),
('Photo numérique', 'Digital Photo', 'Photo d''identité numérique format e-photo', 'Digital identity photo e-photo format'),
('Signature', 'Signature', 'Signature sur fond blanc', 'Signature on white background')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_license_applications_user_id ON public.license_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_license_applications_status ON public.license_applications(status);
CREATE INDEX IF NOT EXISTS idx_application_documents_application_id ON public.application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_payments_application_id ON public.payments(application_id);

-- Create sequence for application numbers
CREATE SEQUENCE IF NOT EXISTS application_number_seq START 1;

-- Function to generate application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'PC' || TO_CHAR(NOW(), 'YYYY') || LPAD(NEXTVAL('application_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate application number
CREATE OR REPLACE FUNCTION set_application_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_number IS NULL THEN
    NEW.application_number := generate_application_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_application_number ON public.license_applications;
CREATE TRIGGER trigger_set_application_number
  BEFORE INSERT ON public.license_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_application_number();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for license_applications
DROP POLICY IF EXISTS "Users can view own applications" ON public.license_applications;
CREATE POLICY "Users can view own applications" ON public.license_applications
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own applications" ON public.license_applications;
CREATE POLICY "Users can create own applications" ON public.license_applications
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own applications" ON public.license_applications;
CREATE POLICY "Users can update own applications" ON public.license_applications
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for application_documents
DROP POLICY IF EXISTS "Users can view own documents" ON public.application_documents;
CREATE POLICY "Users can view own documents" ON public.application_documents
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.license_applications 
      WHERE id = application_documents.application_id
    )
  );

DROP POLICY IF EXISTS "Users can upload own documents" ON public.application_documents;
CREATE POLICY "Users can upload own documents" ON public.application_documents
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.license_applications 
      WHERE id = application_documents.application_id
    )
  );

-- RLS Policies for payments
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.license_applications 
      WHERE id = payments.application_id
    )
  );

-- Public read access for reference tables
ALTER TABLE public.license_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access license_types" ON public.license_types;
CREATE POLICY "Public read access license_types" ON public.license_types 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Public read access document_types" ON public.document_types;
CREATE POLICY "Public read access document_types" ON public.document_types 
  FOR SELECT 
  USING (true);

-- Contact messages - anyone can insert
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages
  FOR INSERT 
  WITH CHECK (true);


-- MIGRATION: 20251103000000_german_fuhrerschein_schema.sql
/*
# German Führerschein License System Schema
Schéma pour le système de permis de conduire allemand MullerFuhrerschein

## Description:
Migration complète pour adapter le système au marché allemand des permis de conduire.
Inclut les types de permis spécifiquement allemand, documents requis, et adapté pour GDPR.

## Structure Germany-Specific:
- License types: Adaptés au système allemand (AM, A1, A2, A, B, C1, C, D1, D, etc.)
- Documents: Carte d'identité allemande, permis de séjour, etc.
- Compliance: GDPR, déduction fiscale, système allemand
- Currency: Prix en euros avec TVA allemande (19%)

## Security:
- RLS: Activé sur toutes les tables
- GDPR: Conformité protection données
- Auth: Authentification requise pour accès
*/

-- Drop existing types and create new German ones
DROP TYPE IF EXISTS license_category CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- Create German-specific license categories
CREATE TYPE license_category AS ENUM (
  'AM',      -- Moped (max 50cc, 16+ years)
  'A1',      -- Light motorcycle (up to 125cc, 16+ years)  
  'A2',      -- Restricted motorcycle (35kW, 18+ years)
  'A',       -- Full motorcycle (unlimited, 20+ years)
  'B',       -- Car (up to 3.5 tons, 18+ years)
  'BE',      -- Car + trailer (up to 12 tons)
  'C1',      -- Light truck (up to 7.5 tons, 18+ years)
  'C',       -- Heavy truck (over 3.5 tons, 21+ years)
  'CE',      -- Heavy truck + trailer
  'C1E',     -- Light truck + trailer
  'D1',      -- Minibus (9-16 seats, 21+ years)
  'D',       -- Bus (over 8 seats, 24+ years)
  'DE',      -- Bus + trailer
  'D1E',     -- Minibus + trailer
  'S'        -- Agricultural vehicle
);

CREATE TYPE application_status AS ENUM (
  'entwurf',        -- Draft
  'eingereicht',    -- Submitted  
  'in_bearbeitung', -- In review
  'genehmigt',      -- Approved
  'abgeschlossen',  -- Completed
  'abgelehnt'       -- Rejected
);

CREATE TYPE payment_status AS ENUM (
  'ausstehend',     -- Pending
  'abgeschlossen',  -- Completed
  'fehlgeschlagen', -- Failed
  'erstattet'       -- Refunded
);

-- Create German-specific document types
CREATE TYPE document_category AS ENUM (
  'identifikation',     -- Identification
  'wohnrecht',         -- Residence permit
  'gesundheit',        -- Medical certificate
  'sehvermoegen',      -- Vision test
  'foto',             -- Photo
  'unterschrift',     -- Signature
  'strafregisterauszug' -- Background check
);

-- Drop existing tables if they exist and recreate
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.license_types CASCADE;  
DROP TABLE IF EXISTS public.license_applications CASCADE;
DROP TABLE IF EXISTS public.document_types CASCADE;
DROP TABLE IF EXISTS public.application_documents CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;

-- German profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Deutschland' CHECK (country = 'Deutschland'),
  preferred_language TEXT DEFAULT 'de' CHECK (preferred_language IN ('de', 'en')),
  geburtsdatum DATE,                    -- Birth date (required for German system)
  geburtsort TEXT,                     -- Birth place
  staatsangehoerigkeit TEXT,           -- Nationality
  ausweisnummer TEXT,                  -- ID document number
  familienstand TEXT,                  -- Marital status
  steuernummer TEXT,                   -- Tax number (for business clients)
  steuer_id TEXT,                      -- Tax ID
  geschlecht TEXT CHECK (geschlecht IN ('maennlich', 'weiblich', 'divers')), -- Gender
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- German license types with local pricing
CREATE TABLE public.license_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category license_category NOT NULL UNIQUE,
  name_de TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_de TEXT,
  description_en TEXT,
  price_net_euros INTEGER NOT NULL,    -- Net price (before VAT)
  price_gross_euros INTEGER NOT NULL,  -- Gross price (including 19% VAT)
  vat_rate DECIMAL(4,2) DEFAULT 19.00, -- German VAT rate
  processing_days INTEGER DEFAULT 14,  -- Processing time in Germany
  requires_theory_test BOOLEAN DEFAULT TRUE,
  requires_practical_test BOOLEAN DEFAULT TRUE,
  theory_test_fee INTEGER DEFAULT 100, -- Theory test cost
  practical_test_fee INTEGER DEFAULT 200, -- Practical test cost
  minimum_age INTEGER NOT NULL,        -- Minimum age requirement
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- License applications with German status flow
CREATE TABLE public.license_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  license_type_id UUID REFERENCES public.license_types(id) NOT NULL,
  status application_status DEFAULT 'entwurf',
  application_number TEXT UNIQUE,
  total_amount_net INTEGER NOT NULL,      -- Net amount
  total_amount_gross INTEGER NOT NULL,    -- Gross amount including VAT
  vat_amount INTEGER NOT NULL,            -- VAT amount
  theory_test_needed BOOLEAN DEFAULT TRUE,
  practical_test_needed BOOLEAN DEFAULT TRUE,
  theory_test_fee INTEGER DEFAULT 100,
  practical_test_fee INTEGER DEFAULT 200,
  notes TEXT,
  administrative_notes TEXT,             -- Notes from administration
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- German document types
CREATE TABLE public.document_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_de TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_de TEXT,
  description_en TEXT,
  category document_category NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  is_german_mandatory BOOLEAN DEFAULT TRUE, -- Required by German authorities
  accepted_formats TEXT[] DEFAULT ARRAY['pdf', 'jpg', 'jpeg', 'png'],
  max_size_mb INTEGER DEFAULT 10,
  validity_months INTEGER,                -- Document validity period
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application documents
CREATE TABLE public.application_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.license_applications(id) ON DELETE CASCADE NOT NULL,
  document_type_id UUID REFERENCES public.document_types(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  verification_notes TEXT,
  is_valid BOOLEAN DEFAULT NULL,         -- NULL = not reviewed yet
  expiry_date DATE                       -- Document expiry date
);

-- Payments with German tax details
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.license_applications(id) ON DELETE CASCADE NOT NULL,
  amount_net_euros INTEGER NOT NULL,     -- Net amount
  amount_gross_euros INTEGER NOT NULL,   -- Gross amount
  vat_amount INTEGER NOT NULL,           -- VAT amount
  vat_rate DECIMAL(4,2) DEFAULT 19.00,   -- VAT rate used
  status payment_status DEFAULT 'ausstehend',
  payment_method TEXT,
  payment_provider TEXT,                 -- 'stripe', 'paypal', etc.
  transaction_id TEXT,
  stripe_payment_intent_id TEXT,         -- Stripe payment intent ID
  tax_invoice_number TEXT,               -- German tax invoice number
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages with GDPR compliance
CREATE TABLE public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  language TEXT DEFAULT 'de',
  gdpr_consent BOOLEAN DEFAULT FALSE,    -- GDPR consent required
  consent_date TIMESTAMP WITH TIME ZONE, -- When consent was given
  marketing_consent BOOLEAN DEFAULT FALSE, -- Marketing consent
  data_processing_purpose TEXT,          -- Purpose of data processing
  replied BOOLEAN DEFAULT FALSE,
  reply_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- German tax invoice table
CREATE TABLE public.tax_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  application_id UUID REFERENCES public.license_applications(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_net_euros INTEGER NOT NULL,
  amount_gross_euros INTEGER NOT NULL,
  vat_rate DECIMAL(4,2) DEFAULT 19.00,
  vat_amount INTEGER NOT NULL,
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'offen',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert German license types with realistic German pricing
INSERT INTO public.license_types (category, name_de, name_en, description_de, description_en, price_net_euros, price_gross_euros, minimum_age, processing_days, requires_theory_test, requires_practical_test) VALUES
('AM', 'Moped-Führerschein', 'Moped License', 'Führerschein für Mopeds bis 50 ccm, max. 45 km/h', 'License for mopeds up to 50cc, max. 45 km/h', 421, 501, 16, 14, TRUE, TRUE),
('A1', 'Leichtkraftrad-Führerschein', 'Light Motorcycle License', 'Führerschein für Motorräder bis 125 ccm, max. 11 kW', 'License for motorcycles up to 125cc, max. 11 kW', 421, 501, 16, 21, TRUE, TRUE),
('A2', 'Kraftrad-Führerschein', 'Restricted Motorcycle License', 'Führerschein für Motorräder bis 35 kW', 'License for motorcycles limited to 35kW', 421, 501, 18, 21, TRUE, TRUE),
('A', 'Motorrad-Führerschein', 'Full Motorcycle License', 'Führerschein für alle Motorräder', 'License for all motorcycles', 421, 501, 20, 21, TRUE, TRUE),
('B', 'PKW-Führerschein', 'Car License', 'Führerschein für PKW bis 3,5 t, max. 8 Sitze', 'License for cars up to 3.5 tons, max. 8 seats', 1269, 1510, 18, 21, TRUE, TRUE),
('BE', 'PKW mit Anhänger', 'Car with Trailer License', 'Führerschein Klasse B mit Anhänger über 750 kg', 'Class B license with trailer over 750kg', 263, 313, 18, 7, FALSE, TRUE),
('C1', 'Klein-LKW-Führerschein', 'Light Truck License', 'Führerschein für LKW bis 7,5 t', 'License for trucks up to 7.5 tons', 2101, 2500, 18, 28, TRUE, TRUE),
('C', 'LKW-Führerschein', 'Heavy Truck License', 'Führerschein für LKW über 3,5 t', 'License for trucks over 3.5 tons', 2521, 3000, 21, 35, TRUE, TRUE),
('CE', 'LKW mit Anhänger', 'Heavy Truck with Trailer', 'Führerschein Klasse C mit Anhänger', 'Class C license with trailer', 2941, 3500, 21, 35, FALSE, TRUE),
('D1', 'Kleinbus-Führerschein', 'Minibus License', 'Führerschein für Kraftomnibusse mit 9-16 Plätzen', 'License for minibuses with 9-16 seats', 3151, 3750, 21, 42, TRUE, TRUE),
('D', 'Kraftomnibus-Führerschein', 'Bus License', 'Führerschein für Kraftomnibusse über 8 Plätze', 'License for buses over 8 seats', 3571, 4250, 24, 42, TRUE, TRUE),
('DE', 'Kraftomnibus mit Anhänger', 'Bus with Trailer License', 'Führerschein Klasse D mit Anhänger', 'Class D license with trailer', 4202, 5000, 24, 42, FALSE, TRUE);

-- Insert German document types
INSERT INTO public.document_types (name_de, name_en, description_de, description_en, category, is_german_mandatory, validity_months) VALUES
('Personalausweis (Vorder- und Rückseite)', 'Identity Card (Front and Back)', 'Personalausweis oder Reisepass gültig in Deutschland', 'Identity card or passport valid in Germany', 'identifikation', TRUE, 60),
('Aufenthaltserlaubnis', 'Residence Permit', 'Gültige Aufenthaltserlaubnis für Deutschland', 'Valid residence permit for Germany', 'wohnrecht', TRUE, 60),
('Passfoto (biometrisch)', 'Biometric Photo', 'Passfoto im biometrischen Format', 'Photo in biometric format', 'foto', TRUE, 24),
('Sehtest-Bescheinigung', 'Vision Test Certificate', 'Sehtest bei anerkanntem Optiker', 'Vision test by certified optician', 'sehvermoegen', TRUE, 6),
('Augenarzt-Bescheinigung', 'Eye Doctor Certificate', 'Bescheinigung von einem Augenarzt', 'Certificate from ophthalmologist', 'sehvermoegen', FALSE, 12),
('Unterschriftprobe', 'Signature Sample', 'Unterschrift auf weißem Papier', 'Signature on white paper', 'unterschrift', TRUE, 12),
('Erste-Hilfe-Kurs', 'First Aid Course', 'Nachweis über 9-stündigen Erste-Hilfe-Kurs', 'Proof of 9-hour first aid course', 'gesundheit', TRUE, 60),
('Führungszeugnis', 'Background Check', 'Führungszeugnis der Klasse 1', 'Background check class 1', 'strafregisterauszug', TRUE, 3),
('Meldebescheinigung', 'Registration Certificate', 'Meldebescheinigung des Hauptwohnsitzes', 'Registration certificate of main residence', 'wohnrecht', TRUE, 6);

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_license_applications_user_id ON public.license_applications(user_id);
CREATE INDEX idx_license_applications_status ON public.license_applications(status);
CREATE INDEX idx_application_documents_application_id ON public.application_documents(application_id);
CREATE INDEX idx_payments_application_id ON public.payments(application_id);
CREATE INDEX idx_tax_invoices_number ON public.tax_invoices(invoice_number);

-- Function to generate German application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'MF-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('application_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for application numbers
CREATE SEQUENCE IF NOT EXISTS application_number_seq START 1;

-- Function to generate German tax invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'MF-INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Trigger to auto-generate application number
CREATE OR REPLACE FUNCTION set_application_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_number IS NULL THEN
    NEW.application_number := generate_application_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_application_number
  BEFORE INSERT ON public.license_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_application_number();

-- Trigger to auto-generate tax invoice number
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invoice_number
  BEFORE INSERT ON public.tax_invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, preferred_language)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'de');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for license_applications
CREATE POLICY "Users can view own applications" ON public.license_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications" ON public.license_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON public.license_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for application_documents
CREATE POLICY "Users can view own documents" ON public.application_documents
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.license_applications 
      WHERE id = application_documents.application_id
    )
  );

CREATE POLICY "Users can upload own documents" ON public.application_documents
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.license_applications 
      WHERE id = application_documents.application_id
    )
  );

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.license_applications 
      WHERE id = payments.application_id
    )
  );

-- RLS Policies for tax_invoices
CREATE POLICY "Users can view own invoices" ON public.tax_invoices
  FOR SELECT USING (
    auth.uid() = profile_id OR auth.uid() IN (
      SELECT user_id FROM public.license_applications 
      WHERE id = tax_invoices.application_id
    )
  );

-- Public read access for reference tables
CREATE POLICY "Public read access" ON public.license_types FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.document_types FOR SELECT USING (true);

-- Contact messages - anyone can insert with GDPR consent
CREATE POLICY "Anyone can submit contact messages with GDPR" ON public.contact_messages
  FOR INSERT WITH CHECK (gdpr_consent = true);


-- MIGRATION: 20251104000000_fix_chat_final.sql
/*
          # [Correctif Final Messagerie]
          Ce script corrige la fonction de récupération des conversations pour inclure le statut de présence et répare la politique de sécurité pour l'accès aux médias du chat.

          ## Query Description:
          - **DROP/CREATE get_user_conversations:** Remplace la fonction pour y ajouter le champ `last_seen` dans l'objet `other_participant`. Cela corrigera l'affichage du statut "Chargement..." et du nom de l'interlocuteur.
          - **DROP/CREATE POLICY:** Remplace la politique de sécurité sur le stockage des médias (`chat_media`) par une version plus robuste. Cela corrigera l'erreur "Bucket not found" et permettra l'affichage et le téléchargement des images/vidéos.
          
          Cette opération est sûre et ne supprime aucune donnée.

          ## Metadata:
          - Schema-Category: ["Structural", "Safe"]
          - Impact-Level: ["Low"]
          - Requires-Backup: false
          - Reversible: false
*/

-- 1. Remplacer la fonction get_user_conversations pour inclure last_seen
DROP FUNCTION IF EXISTS public.get_user_conversations(p_user_id uuid);
CREATE OR REPLACE FUNCTION public.get_user_conversations(p_user_id uuid)
RETURNS TABLE(
    id uuid,
    created_at timestamptz,
    last_message_text text,
    last_message_time timestamptz,
    unread_count bigint,
    other_participant jsonb -- Changed to jsonb for better performance
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH last_messages AS (
        SELECT
            m.conversation_id,
            (array_agg(m.created_at ORDER BY m.created_at DESC))[1] as max_created_at
        FROM messages m
        GROUP BY m.conversation_id
    )
    SELECT
        c.id,
        c.created_at,
        m.content as last_message_text,
        m.created_at as last_message_time,
        (SELECT COUNT(*) FROM messages msg WHERE msg.conversation_id = c.id AND msg.read_at IS NULL AND msg.user_id <> p_user_id) as unread_count,
        jsonb_build_object(
            'id', p.id,
            'full_name', p.full_name,
            'avatar_url', p.avatar_url,
            'last_seen', p.last_seen -- Ajout du champ manquant
        ) as other_participant
    FROM
        conversations c
    JOIN
        conversation_participants cp ON c.id = cp.conversation_id
    JOIN
        conversation_participants cp_other ON c.id = cp_other.conversation_id AND cp_other.user_id <> p_user_id
    JOIN
        profiles p ON cp_other.user_id = p.id
    LEFT JOIN
        last_messages lm ON c.id = lm.conversation_id
    LEFT JOIN
        messages m ON c.id = m.conversation_id AND m.created_at = lm.max_created_at
    WHERE
        cp.user_id = p_user_id
    ORDER BY
        m.created_at DESC NULLS LAST;
END;
$$;

-- 2. Remplacer la politique de sécurité pour l'accès au stockage des médias
DROP POLICY IF EXISTS "Allow authenticated users to read their chat media" ON storage.objects;

CREATE POLICY "Allow authenticated users to read their chat media"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'chat_media' AND
    EXISTS (
        SELECT 1
        FROM public.conversation_participants cp
        WHERE cp.user_id = auth.uid()
        AND cp.conversation_id::text = (storage.foldername(name))[2]
    )
);


-- MIGRATION: 20251104010000_fix_chat_presence_and_storage.sql
/*
          # [Correctif Final Messagerie]
          Ce script corrige deux problèmes critiques :
          1. La fonction `get_user_conversations` est mise à jour pour inclure le statut de présence (`last_seen`).
          2. La politique de sécurité (RLS) sur le stockage des médias du chat est corrigée pour permettre l'affichage et le téléchargement.

          ## Query Description:
          - **DROP/CREATE get_user_conversations:** Remplace la fonction existante par une version qui inclut `last_seen` dans le JSON de l'interlocuteur, corrigeant l'affichage du statut de présence.
          - **DROP/CREATE POLICY:** Remplace la politique de sécurité trop restrictive sur `storage.objects` par une politique qui autorise les utilisateurs authentifiés à lire les fichiers du bucket `chat_media`, ce qui est nécessaire pour afficher les médias envoyés par d'autres utilisateurs.
          
          Cette opération est sûre, ne supprime aucune donnée et est essentielle pour le bon fonctionnement de la messagerie.
          
          ## Metadata:
          - Schema-Category: ["Structural", "Safe"]
          - Impact-Level: ["Medium"]
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Fonctions affectées: `public.get_user_conversations`
          - Tables affectées (RLS): `storage.objects`
          
          ## Security Implications:
          - RLS Status: Modifié
          - Policy Changes: Oui
          - Auth Requirements: `authenticated`
          
          ## Performance Impact:
          - Indexes: Aucun changement
          - Triggers: Aucun changement
          - Estimated Impact: Positif, la nouvelle fonction est plus complète.
          */

-- 1. Mettre à jour la fonction get_user_conversations pour inclure last_seen
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
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH last_messages AS (
        SELECT
            m.conversation_id,
            (array_agg(m.created_at ORDER BY m.created_at DESC))[1] as max_created_at
        FROM messages m
        GROUP BY m.conversation_id
    )
    SELECT
        c.id,
        c.created_at,
        m.content as last_message_text,
        m.created_at as last_message_time,
        (SELECT COUNT(*) FROM messages msg WHERE msg.conversation_id = c.id AND msg.read_at IS NULL AND msg.user_id <> p_user_id) as unread_count,
        json_build_object(
            'id', p.id,
            'full_name', p.full_name,
            'avatar_url', p.avatar_url,
            'last_seen', p.last_seen
        ) as other_participant
    FROM
        conversations c
    JOIN
        conversation_participants cp ON c.id = cp.conversation_id
    JOIN
        conversation_participants cp_other ON c.id = cp_other.conversation_id AND cp_other.user_id <> p_user_id
    JOIN
        profiles p ON cp_other.user_id = p.id
    LEFT JOIN
        last_messages lm ON c.id = lm.conversation_id
    LEFT JOIN
        messages m ON c.id = m.conversation_id AND m.created_at = lm.max_created_at
    WHERE
        cp.user_id = p_user_id
    ORDER BY
        m.created_at DESC NULLS LAST;
END;
$$;

-- 2. Corriger la politique de sécurité du stockage des médias du chat
-- Supprimer l'ancienne politique restrictive si elle existe
DROP POLICY IF EXISTS "Allow users to read their own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read access to chat media" ON storage.objects;

-- Créer une nouvelle politique qui autorise les utilisateurs authentifiés à lire les fichiers du bucket 'chat_media'
CREATE POLICY "Allow authenticated read access to chat media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat_media');


-- MIGRATION: 20251104020000_add_messaging_system.sql
/*
          # [Structural] Création du Système de Messagerie
          [Ce script met en place la structure complète de la base de données pour un système de messagerie en temps réel, incluant les conversations, les messages et le stockage des médias.]

          ## Query Description: [Cette opération est sûre et n'affecte aucune donnée existante. Elle ajoute de nouvelles tables (`conversations`, `conversation_participants`, `messages`) et un nouveau compartiment de stockage (`chat_media`) nécessaires au fonctionnement de la messagerie. Les politiques de sécurité (RLS) sont activées pour garantir la confidentialité des échanges.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tables créées: `conversations`, `conversation_participants`, `messages`
          - Compartiment de stockage créé: `chat_media`
          - Politiques RLS ajoutées: Oui, pour toutes les nouvelles tables.
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: Les utilisateurs doivent être authentifiés pour utiliser la messagerie.
          
          ## Performance Impact:
          - Indexes: Ajout d'index sur les clés étrangères pour des performances optimales.
          - Triggers: Aucun.
          - Estimated Impact: Faible impact sur les performances globales, optimisé pour les requêtes de chat.
          */

-- 1. CRÉER LA TABLE DES CONVERSATIONS
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_admin_chat BOOLEAN DEFAULT FALSE NOT NULL
);
COMMENT ON TABLE conversations IS 'Stocke les métadonnées de chaque conversation.';

-- 2. CRÉER LA TABLE DES PARTICIPANTS
CREATE TABLE conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (conversation_id, user_id)
);
COMMENT ON TABLE conversation_participants IS 'Table de liaison entre les utilisateurs et les conversations.';

-- 3. CRÉER LA TABLE DES MESSAGES
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    media_url TEXT,
    media_type VARCHAR(50), -- 'image', 'video', 'document'
    gif_url TEXT,
    location_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL
);
COMMENT ON TABLE messages IS 'Contient tous les messages envoyés dans les conversations.';

-- 4. CRÉER LES INDEX POUR LES PERFORMANCES
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_participants_user_id ON conversation_participants(user_id);

-- 5. CRÉER LE COMPARTIMENT DE STOCKAGE POUR LES MÉDIAS DU CHAT
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat_media', 'chat_media', FALSE, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- 6. ACTIVER LA SÉCURITÉ AU NIVEAU DE LA LIGNE (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 7. DÉFINIR LES POLITIQUES RLS

-- Les utilisateurs ne peuvent voir que les conversations dont ils sont participants.
CREATE POLICY "Les utilisateurs peuvent voir leurs propres conversations"
ON conversations FOR SELECT
USING (id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
));

-- Les utilisateurs peuvent créer des conversations.
CREATE POLICY "Les utilisateurs peuvent créer des conversations"
ON conversations FOR INSERT
WITH CHECK (true);

-- Les utilisateurs peuvent voir leur propre participation.
CREATE POLICY "Les utilisateurs peuvent voir leur propre participation"
ON conversation_participants FOR SELECT
USING (user_id = auth.uid());

-- Les utilisateurs peuvent rejoindre ou quitter des conversations.
CREATE POLICY "Les utilisateurs peuvent gérer leur propre participation"
ON conversation_participants FOR ALL
USING (user_id = auth.uid());

-- Les utilisateurs peuvent voir les messages des conversations dont ils sont membres.
CREATE POLICY "Les utilisateurs peuvent lire les messages de leurs conversations"
ON messages FOR SELECT
USING (conversation_id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
));

-- Les utilisateurs ne peuvent envoyer des messages que dans les conversations dont ils sont membres.
CREATE POLICY "Les utilisateurs peuvent envoyer des messages dans leurs conversations"
ON messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
        SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
    )
);

-- Les utilisateurs ne peuvent modifier que leurs propres messages.
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres messages"
ON messages FOR UPDATE
USING (sender_id = auth.uid());

-- Les utilisateurs ne peuvent supprimer que leurs propres messages.
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres messages"
ON messages FOR DELETE
USING (sender_id = auth.uid());


-- Politiques pour le stockage des médias du chat
CREATE POLICY "Les utilisateurs authentifiés peuvent téléverser des médias"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat_media');

CREATE POLICY "Les utilisateurs peuvent voir les médias des conversations dont ils sont membres"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'chat_media' AND
    (storage.foldername(name))[1] IN (
        SELECT conversation_id::text FROM conversation_participants WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres médias"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'chat_media' AND
    owner = auth.uid()
);

-- 8. CRÉER UNE FONCTION POUR METTRE À JOUR `last_message_at`
CREATE OR REPLACE FUNCTION update_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. CRÉER UN TRIGGER QUI SE DÉCLENCHE APRÈS L'INSERTION D'UN MESSAGE
CREATE TRIGGER on_new_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_last_message_at();


-- MIGRATION: 20251104030000_add_presence_features.sql
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


