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
