/*
  # [SCHEMA] Galerie Média Avancée
  Mise en place du schéma complet pour la galerie média, incluant le stockage, les likes, les commentaires et les favoris.

  ## Description de la Requête:
  Cette migration crée quatre nouvelles tables (`gallery_media`, `gallery_likes`, `gallery_comments`, `gallery_favorites`) et un bucket de stockage (`gallery-media`). Ces changements sont structurels et n'affectent aucune donnée existante. Ils sont essentiels pour la nouvelle fonctionnalité de galerie.

  ## Métadonnées:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true (en supprimant les tables et le bucket)

  ## Détails de la Structure:
  - Tables créées: `gallery_media`, `gallery_likes`, `gallery_comments`, `gallery_favorites`
  - Bucket de stockage créé: `gallery-media`
  - Colonnes ajoutées: Diverses colonnes pour stocker les métadonnées des médias, les relations, les likes, les commentaires, etc.
  - Relations: Clés étrangères entre les nouvelles tables et la table `profiles`.

  ## Implications de Sécurité:
  - RLS Status: Activé sur toutes les nouvelles tables.
  - Policy Changes: Des politiques de sécurité (RLS) sont ajoutées pour contrôler l'accès aux données de la galerie.
  - Auth Requirements: Les opérations d'écriture (INSERT, UPDATE, DELETE) nécessitent un utilisateur authentifié. La lecture est publique.

  ## Impact sur la Performance:
  - Indexes: Des index sont ajoutés sur les clés étrangères et les colonnes fréquemment interrogées pour garantir de bonnes performances.
  - Triggers: Aucun.
  - Estimated Impact: Faible.
*/

-- 1. Créer le bucket de stockage pour les médias de la galerie
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-media', 'gallery-media', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Créer la table pour les médias de la galerie
CREATE TABLE IF NOT EXISTS public.gallery_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    media_type TEXT NOT NULL, -- 'image' or 'video'
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;

-- 3. Créer la table pour les likes
CREATE TABLE IF NOT EXISTS public.gallery_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id UUID REFERENCES public.gallery_media(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(media_id, user_id)
);
ALTER TABLE public.gallery_likes ENABLE ROW LEVEL SECURITY;

-- 4. Créer la table pour les commentaires
CREATE TABLE IF NOT EXISTS public.gallery_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id UUID REFERENCES public.gallery_media(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.gallery_comments ENABLE ROW LEVEL SECURITY;

-- 5. Créer la table pour les favoris
CREATE TABLE IF NOT EXISTS public.gallery_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id UUID REFERENCES public.gallery_media(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(media_id, user_id)
);
ALTER TABLE public.gallery_favorites ENABLE ROW LEVEL SECURITY;

-- 6. Ajouter des index pour la performance
CREATE INDEX IF NOT EXISTS idx_gallery_media_user_id ON public.gallery_media(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_likes_media_id ON public.gallery_likes(media_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_media_id ON public.gallery_comments(media_id);
CREATE INDEX IF NOT EXISTS idx_gallery_favorites_user_id ON public.gallery_favorites(user_id);

-- 7. Définir les politiques de sécurité (RLS)

-- gallery_media
DROP POLICY IF EXISTS "Allow public read access on gallery_media" ON public.gallery_media;
CREATE POLICY "Allow public read access on gallery_media" ON public.gallery_media FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to insert their own media" ON public.gallery_media;
CREATE POLICY "Allow users to insert their own media" ON public.gallery_media FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own media" ON public.gallery_media;
CREATE POLICY "Allow users to update their own media" ON public.gallery_media FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own media" ON public.gallery_media;
CREATE POLICY "Allow users to delete their own media" ON public.gallery_media FOR DELETE USING (auth.uid() = user_id);

-- gallery_likes
DROP POLICY IF EXISTS "Allow public read access on gallery_likes" ON public.gallery_likes;
CREATE POLICY "Allow public read access on gallery_likes" ON public.gallery_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to insert/delete their own likes" ON public.gallery_likes;
CREATE POLICY "Allow users to insert/delete their own likes" ON public.gallery_likes FOR ALL USING (auth.uid() = user_id);

-- gallery_comments
DROP POLICY IF EXISTS "Allow public read access on gallery_comments" ON public.gallery_comments;
CREATE POLICY "Allow public read access on gallery_comments" ON public.gallery_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to insert their own comments" ON public.gallery_comments;
CREATE POLICY "Allow users to insert their own comments" ON public.gallery_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own comments" ON public.gallery_comments;
CREATE POLICY "Allow users to update their own comments" ON public.gallery_comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own comments" ON public.gallery_comments;
CREATE POLICY "Allow users to delete their own comments" ON public.gallery_comments FOR DELETE USING (auth.uid() = user_id);

-- gallery_favorites
DROP POLICY IF EXISTS "Allow users to manage their own favorites" ON public.gallery_favorites;
CREATE POLICY "Allow users to manage their own favorites" ON public.gallery_favorites FOR ALL USING (auth.uid() = user_id);
