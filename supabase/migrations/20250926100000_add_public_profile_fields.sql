/*
# [FEATURE] Public Client Profiles & Social Links
This migration enhances the `profiles` table to support public-facing client profiles with bios and social media links.
## Query Description:
- **Adds `bio` column:** A new text column for the user''s biography.
- **Adds `social_links` column:** A JSONB column to flexibly store various social media URLs.
- **Adds `is_public` column:** A boolean flag to allow users to control the visibility of their profile.
- This operation is non-destructive and essential for the new community features.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the new columns)
*/
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
