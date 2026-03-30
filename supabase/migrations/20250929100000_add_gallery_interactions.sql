/*
  # [Gallery Interaction System Upgrade]
  Adds features for liking comments and tracking media shares.

  ## Query Description:
  This operation adds new structures to support user interactions within the gallery. It introduces a table for comment likes and a column for tracking share counts on media. These changes are non-destructive and will not affect existing data, but they are essential for the new social features to function correctly.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Adds new table: `public.gallery_comment_likes`
  - Adds new column: `share_counts` to `public.gallery_media`
  - Adds new function: `public.increment_gallery_share`

  ## Security Implications:
  - RLS Status: Enabled on the new table.
  - Policy Changes: Yes, new policies are created for `gallery_comment_likes`.
  - Auth Requirements: Users must be authenticated to like comments.

  ## Performance Impact:
  - Indexes: Primary key and foreign key indexes are added on the new table.
  - Triggers: None.
  - Estimated Impact: Negligible performance impact.
*/

-- 1. Create table for gallery comment likes
CREATE TABLE public.gallery_comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.gallery_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (comment_id, user_id)
);

-- 2. Add comments to the new table and columns
COMMENT ON TABLE public.gallery_comment_likes IS 'Stores likes for comments on gallery media.';
COMMENT ON COLUMN public.gallery_comment_likes.comment_id IS 'The liked comment.';
COMMENT ON COLUMN public.gallery_comment_likes.user_id IS 'The user who liked the comment.';

-- 3. Enable RLS on the new table
ALTER TABLE public.gallery_comment_likes ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for gallery_comment_likes
CREATE POLICY "Allow public read access on comment likes"
ON public.gallery_comment_likes
FOR SELECT
USING (true);

CREATE POLICY "Allow users to insert their own comment likes"
ON public.gallery_comment_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own comment likes"
ON public.gallery_comment_likes
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Add share_counts column to gallery_media
ALTER TABLE public.gallery_media
ADD COLUMN share_counts JSONB DEFAULT '{}'::jsonb NOT NULL;

COMMENT ON COLUMN public.gallery_media.share_counts IS 'Tracks share counts for different social networks.';

-- 6. Create RPC function to increment share counts
CREATE OR REPLACE FUNCTION public.increment_gallery_share(media_id_to_update UUID, network_to_increment TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.gallery_media
  SET share_counts = jsonb_set(
    share_counts,
    ARRAY[network_to_increment],
    (COALESCE(share_counts->>network_to_increment, '0')::INT + 1)::TEXT::JSONB
  )
  WHERE id = media_id_to_update;
END;
$$;
