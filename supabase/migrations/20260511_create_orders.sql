-- Migration: Create orders and order_documents tables
-- For the service cart checkout workflow

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  date_of_birth DATE,
  place_of_birth TEXT,
  nationality TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  region TEXT,
  payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'paypal', 'credit_card', 'crypto')),
  notes TEXT,
  language TEXT DEFAULT 'de',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order documents table
CREATE TABLE IF NOT EXISTS public.order_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders: Anyone can insert, owner can read
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "Service role full access orders" ON public.orders
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for order_documents
CREATE POLICY "Anyone can insert order documents" ON public.order_documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view order documents" ON public.order_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.user_id IS NULL)
    )
  );

CREATE POLICY "Service role full access order docs" ON public.order_documents
  FOR ALL USING (auth.role() = 'service_role');

-- Create storage bucket for order documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-documents',
  'order-documents',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can upload order documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'order-documents');

CREATE POLICY "Anyone can read order documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'order-documents');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_documents_order_id ON public.order_documents(order_id);
