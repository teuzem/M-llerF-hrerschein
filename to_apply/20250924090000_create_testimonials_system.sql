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
