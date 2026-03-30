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
