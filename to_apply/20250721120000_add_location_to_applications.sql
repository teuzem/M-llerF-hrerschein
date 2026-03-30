/*
# [Operation] Add Location Fields to Applications
Adds address, city, postal_code, and region columns to the license_applications table to store detailed user location data from the application form.

## Query Description:
This operation is structural and safe. It adds new, nullable columns to the `license_applications` table. It will not affect existing data, as the new columns will simply be `NULL` for old records. No data loss is possible.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the columns)

## Structure Details:
- Table: `public.license_applications`
- Columns Added: `address` (TEXT), `city` (TEXT), `postal_code` (TEXT), `region` (TEXT)

## Security Implications:
- RLS Status: Unchanged. Existing RLS policies on the table remain in effect.
- Policy Changes: No.
- Auth Requirements: None for the migration itself.

## Performance Impact:
- Indexes: None added.
- Triggers: None added.
- Estimated Impact: Negligible. Adding nullable columns is a fast metadata-only change.
*/

ALTER TABLE public.license_applications ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.license_applications ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.license_applications ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.license_applications ADD COLUMN IF NOT EXISTS region TEXT;
