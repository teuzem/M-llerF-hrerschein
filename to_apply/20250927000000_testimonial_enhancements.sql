/*
# [Feature] Enhance Testimonial System
This migration adds share tracking capabilities to the testimonials table and a function to handle increments atomically.

## Query Description:
- Adds a `share_counts` JSONB column to the `testimonials` table to store share counts for different networks. This is non-destructive.
- Creates a PostgreSQL function `increment_testimonial_share` to safely increment the share count for a given network. This prevents race conditions and simplifies client-side logic.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (The column and function can be dropped)

## Structure Details:
- Table Modified: `public.testimonials`
  - Column Added: `share_counts` (Type: JSONB, Default: '{}')
- Function Added: `public.increment_testimonial_share(testimonial_id_to_update UUID, network TEXT)`

## Security Implications:
- RLS Status: Unchanged.
- Policy Changes: No.
- Auth Requirements: The created function uses `SECURITY DEFINER`, which is necessary to allow it to update the table. Access to this function should be controlled via RLS on the `testimonials` table for RPC calls if needed.

## Performance Impact:
- Indexes: None added. Consider a GIN index on `share_counts` if you plan to query this column frequently on a large dataset.
- Triggers: None added.
- Estimated Impact: Low.
*/

-- Add share_counts column to testimonials table
ALTER TABLE public.testimonials
ADD COLUMN share_counts JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Create a function to increment share counts atomically
CREATE OR REPLACE FUNCTION increment_testimonial_share(testimonial_id_to_update UUID, network TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_counts JSONB;
  new_count INT;
BEGIN
  -- Select the current share_counts for the specific testimonial
  -- and lock the row for update to prevent race conditions.
  SELECT share_counts INTO current_counts FROM public.testimonials WHERE id = testimonial_id_to_update FOR UPDATE;

  -- Get the current count for the specific network, default to 0 if not present
  new_count := COALESCE((current_counts->>network)::int, 0) + 1;

  -- Update the JSONB field
  UPDATE public.testimonials
  SET share_counts = jsonb_set(
    current_counts,
    ARRAY[network],
    to_jsonb(new_count)
  )
  WHERE id = testimonial_id_to_update;
END;
$$;

-- Grant execute permission to the authenticated role
GRANT EXECUTE ON FUNCTION public.increment_testimonial_share(UUID, TEXT) TO authenticated;
