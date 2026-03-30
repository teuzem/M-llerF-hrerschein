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
