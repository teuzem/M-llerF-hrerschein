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
