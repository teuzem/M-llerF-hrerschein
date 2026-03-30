/*
# [FINAL FEATURE] Advanced Social Testimonials System
This migration completely overhauls the testimonials system to support social interactions, multiple media, and more detailed author information.
## Query Description:
- **Alters `testimonials` table:** Adds `media_urls` (array), `city`, `region`, `is_pinned`, `status`, `author_email`, and `reactions` (jsonb for counts). Drops old, unused columns.
- **Creates `testimonial_reactions` table:** Stores individual user reactions (like, love, etc.).
- **Creates `testimonial_comments` table:** Stores user comments.
- **Adds RLS Policies:** Secures the new tables.
- **Creates a Trigger:** An advanced trigger (`on_reaction_change`) automatically updates reaction counts for high performance.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: true (as it modifies an existing table)
- Reversible: false (due to complexity)
*/

-- Step 1: Alter the testimonials table to add all necessary columns if they don't exist
-- This is made idempotent to prevent errors on re-runs.
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'testimonials') THEN
    ALTER TABLE public.testimonials DROP COLUMN IF EXISTS image_url;
    ALTER TABLE public.testimonials DROP COLUMN IF EXISTS video_url;
    ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS author_email TEXT;
    ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS media_urls TEXT[];
    ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS region TEXT;
    ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
    ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' NOT NULL;
  END IF;
END $$;


-- Step 2: Create testimonial_reactions table
CREATE TABLE IF NOT EXISTS public.testimonial_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    testimonial_id UUID NOT NULL REFERENCES public.testimonials(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'wow', 'sad', 'angry')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT testimonial_reactions_unique_user_reaction UNIQUE (testimonial_id, user_id)
);

-- Step 3: Create testimonial_comments table
CREATE TABLE IF NOT EXISTS public.testimonial_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    testimonial_id UUID NOT NULL REFERENCES public.testimonials(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 4: Enable RLS and create policies
ALTER TABLE public.testimonial_reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all reactions." ON public.testimonial_reactions;
CREATE POLICY "Users can view all reactions." ON public.testimonial_reactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage their own reactions." ON public.testimonial_reactions;
CREATE POLICY "Users can manage their own reactions." ON public.testimonial_reactions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.testimonial_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all comments." ON public.testimonial_comments;
CREATE POLICY "Users can view all comments." ON public.testimonial_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage their own comments." ON public.testimonial_comments;
CREATE POLICY "Users can manage their own comments." ON public.testimonial_comments FOR ALL USING (auth.uid() = user_id);

-- Step 5: Create function and trigger for reaction counts
CREATE OR REPLACE FUNCTION update_testimonial_reaction_counts()
RETURNS TRIGGER AS $$
DECLARE
  reaction_counts JSONB;
BEGIN
  SELECT jsonb_object_agg(reaction_type, count)
  INTO reaction_counts
  FROM (
    SELECT reaction_type, COUNT(*) AS count
    FROM public.testimonial_reactions
    WHERE testimonial_id = COALESCE(NEW.testimonial_id, OLD.testimonial_id)
    GROUP BY reaction_type
  ) AS counts;

  UPDATE public.testimonials
  SET reactions = COALESCE(reaction_counts, '{}'::jsonb)
  WHERE id = COALESCE(NEW.testimonial_id, OLD.testimonial_id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_reaction_change ON public.testimonial_reactions;
CREATE TRIGGER on_reaction_change
AFTER INSERT OR UPDATE OR DELETE ON public.testimonial_reactions
FOR EACH ROW EXECUTE FUNCTION update_testimonial_reaction_counts();
