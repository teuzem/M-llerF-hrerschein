/*
# [Operation Name]
Add Application Tracking and Location Data

## Query Description: [This operation enhances the `license_applications` table by adding a unique, user-friendly application number for tracking and specific columns for the applicant's address at the time of submission. This ensures that each application has a persistent, snapshot of the address, independent of later changes to the user's profile. It improves data integrity and simplifies tracking for both users and administrators.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Tables affected: `license_applications`
- Columns added: `application_number` (TEXT, UNIQUE), `address` (TEXT), `city` (TEXT), `postal_code` (TEXT), `region` (TEXT)

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [No]
- Auth Requirements: [The existing RLS policies on `license_applications` will automatically apply to these new columns, ensuring only the record owner and authorized roles can access the data.]

## Performance Impact:
- Indexes: [A UNIQUE index is added on `application_number` to ensure its uniqueness and speed up lookups.]
- Triggers: [No]
- Estimated Impact: [Low. The new index will slightly increase write time but significantly improve query performance when searching by application number.]
*/

ALTER TABLE public.license_applications
ADD COLUMN application_number TEXT,
ADD COLUMN address TEXT,
ADD COLUMN city TEXT,
ADD COLUMN postal_code TEXT,
ADD COLUMN region TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_application_number ON public.license_applications (application_number);

COMMENT ON COLUMN public.license_applications.application_number IS 'A unique, user-friendly identifier for tracking the application (e.g., PC-12345).';
COMMENT ON COLUMN public.license_applications.address IS 'The applicant''s street address at the time of submission.';
COMMENT ON COLUMN public.license_applications.city IS 'The applicant''s city at the time of submission.';
COMMENT ON COLUMN public.license_applications.postal_code IS 'The applicant''s postal code at the time of submission.';
COMMENT ON COLUMN public.license_applications.region IS 'The applicant''s region at the time of submission.';
