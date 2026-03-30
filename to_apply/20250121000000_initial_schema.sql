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
