/*
# [Structural] Add form_data column to license_applications
This migration adds a new JSONB column named `form_data` to the `license_applications` table. This column is required to store additional, non-structured data from the application form, such as the NEPH number.

## Query Description:
This is a non-destructive operation that adds a new column. It will not affect existing data. Existing rows will have a NULL value for this new column, which is the expected behavior.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (The column can be dropped if needed)

## Structure Details:
- Table: license_applications
- Column Added: form_data (JSONB)

## Security Implications:
- RLS Status: Unchanged. RLS policies on the table will apply to this new column as well.
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None added. Negligible impact on write performance.
- Triggers: None added.
- Estimated Impact: Low.
*/

ALTER TABLE public.license_applications
ADD COLUMN IF NOT EXISTS form_data JSONB;
