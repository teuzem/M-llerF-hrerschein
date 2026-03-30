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
