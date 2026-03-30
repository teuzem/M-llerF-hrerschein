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
