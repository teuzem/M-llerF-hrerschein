/*
# [FIX] Add Address Columns to Profiles
This migration adds the necessary address columns to the `profiles` table to fix the "column not found" error during profile updates.
## Query Description:
- **Adds Address Columns:** Uses `ADD COLUMN IF NOT EXISTS` to safely add `address`, `city`, `postal_code`, and `region` to the `public.profiles` table.
- This is a non-destructive operation required for the profile management feature to function correctly.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the new columns)
*/
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS region TEXT;
