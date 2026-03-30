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
