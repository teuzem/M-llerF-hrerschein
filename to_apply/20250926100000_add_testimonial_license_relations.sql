/*
# [FEATURE] Testimonials with License Relations
This migration adds a many-to-many relationship between testimonials and license types, enabling advanced filtering and more detailed submissions.
## Query Description:
- **Alters `testimonials` table:** Adds a `license_type_ids` column to store an array of associated license IDs. This is a denormalization for simpler querying.
- **Creates `testimonial_licenses` join table:** A proper join table is created to formally manage the many-to-many relationship.
- **Adds RLS Policies:** Secures the new join table.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true
*/
-- Add a denormalized column for easier filtering.
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS license_type_ids UUID[];
-- Create a join table for the many-to-many relationship
CREATE TABLE IF NOT EXISTS public.testimonial_licenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    testimonial_id UUID NOT NULL REFERENCES public.testimonials(id) ON DELETE CASCADE,
    license_type_id UUID NOT NULL REFERENCES public.license_types(id) ON DELETE CASCADE,
    CONSTRAINT testimonial_licenses_unique UNIQUE (testimonial_id, license_type_id)
);
-- Enable RLS and set policies for the join table
ALTER TABLE public.testimonial_licenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view testimonial license links." ON public.testimonial_licenses;
CREATE POLICY "Public can view testimonial license links." ON public.testimonial_licenses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage links for their own testimonials." ON public.testimonial_licenses;
CREATE POLICY "Users can manage links for their own testimonials." ON public.testimonial_licenses FOR ALL
USING (
  auth.uid() = (
    SELECT user_id FROM public.testimonials WHERE id = testimonial_id
  )
);
