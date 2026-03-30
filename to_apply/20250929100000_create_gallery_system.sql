/*
          # [Opération] Création du Système de Galerie Média
          [Ce script met en place l'infrastructure complète pour une galerie média avancée, incluant le stockage des images et vidéos, ainsi que la gestion des interactions utilisateurs comme les likes, commentaires et favoris.]

          ## Description de la Requête:
          - **Impact sur les données :** Aucune donnée existante ne sera affectée car ce script ne crée que de nouvelles tables et un nouveau bucket de stockage.
          - **Risques :** Le risque est faible. L'opération est additive et n'altère pas la structure existante.
          - **Précautions :** Il est toujours recommandé d'avoir une sauvegarde de votre base de données avant d'appliquer toute migration structurelle.

          ## Métadonnées:
          - Schéma-Catégorie: "Structural"
          - Impact-Niveau: "Low"
          - Nécessite-Sauvegarde: false
          - Réversible: true (en supprimant les tables et le bucket créés)

          ## Détails de la Structure:
          - **Nouveau Bucket de Stockage :** `gallery-media` pour stocker les fichiers image et vidéo téléversés.
          - **Nouvelles Tables :**
            - `gallery_media`: Table principale pour référencer chaque média (image ou vidéo), son auteur, son type, son URL, et son statut de modération.
            - `gallery_likes`: Pour enregistrer les "likes" des utilisateurs sur chaque média.
            - `gallery_comments`: Pour stocker les commentaires laissés sur les médias.
            - `gallery_favorites`: Pour permettre aux utilisateurs de sauvegarder leurs médias préférés.
          - **Sécurité :** Des politiques de sécurité au niveau des lignes (RLS) sont mises en place pour contrôler précisément qui peut voir, ajouter, modifier ou supprimer des médias et des interactions.

          ## Implications de Sécurité:
          - RLS Status: Activé sur toutes les nouvelles tables.
          - Changements de Politique: Oui, des politiques sont créées pour sécuriser l'accès aux nouvelles tables.
          - Exigences d'Authentification: Les utilisateurs doivent être authentifiés pour ajouter du contenu ou interagir (liker, commenter, etc.).

          ## Impact sur la Performance:
          - Index: Des index sont créés sur les clés étrangères pour garantir des performances de lecture rapides lors de la jointure des tables (ex: récupérer un média avec le profil de son auteur).
          - Déclencheurs: Aucun.
          - Impact Estimé: Faible. Les nouvelles tables n'impacteront pas les performances des requêtes existantes.
          */

-- 1. Créer le bucket de stockage pour les médias de la galerie
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gallery-media', 'gallery-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

-- 2. Créer la table pour les médias de la galerie
CREATE TABLE IF NOT EXISTS public.gallery_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'url')),
    created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.gallery_media IS 'Stores all media items for the advanced gallery.';
COMMENT ON COLUMN public.gallery_media.user_id IS 'The user who uploaded the media.';
COMMENT ON COLUMN public.gallery_media.media_type IS 'Type of the media (image or video).';
COMMENT ON COLUMN public.gallery_media.media_url IS 'URL to the media file (either in storage or external).';
COMMENT ON COLUMN public.gallery_media.thumbnail_url IS 'URL to a thumbnail, especially for videos.';
COMMENT ON COLUMN public.gallery_media.status IS 'Moderation status of the media.';
COMMENT ON COLUMN public.gallery_media.source_type IS 'Origin of the media (direct upload or external URL).';

-- 3. Créer la table pour les "likes"
CREATE TABLE IF NOT EXISTS public.gallery_likes (
    media_id UUID NOT NULL REFERENCES public.gallery_media(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (media_id, user_id)
);

COMMENT ON TABLE public.gallery_likes IS 'Tracks user likes on gallery media.';

-- 4. Créer la table pour les commentaires
CREATE TABLE IF NOT EXISTS public.gallery_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    media_id UUID NOT NULL REFERENCES public.gallery_media(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.gallery_comments IS 'Stores user comments on gallery media.';

-- 5. Créer la table pour les favoris
CREATE TABLE IF NOT EXISTS public.gallery_favorites (
    media_id UUID NOT NULL REFERENCES public.gallery_media(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (media_id, user_id)
);

COMMENT ON TABLE public.gallery_favorites IS 'Tracks which media items users have saved to their favorites.';

-- 6. Activer RLS et créer les politiques de sécurité

-- Table gallery_media
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to approved media" ON public.gallery_media;
CREATE POLICY "Allow public read access to approved media" ON public.gallery_media
FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Allow users to insert their own media" ON public.gallery_media;
CREATE POLICY "Allow users to insert their own media" ON public.gallery_media
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own media" ON public.gallery_media;
CREATE POLICY "Allow users to update their own media" ON public.gallery_media
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own media" ON public.gallery_media;
CREATE POLICY "Allow users to delete their own media" ON public.gallery_media
FOR DELETE USING (auth.uid() = user_id);

-- Table gallery_likes
ALTER TABLE public.gallery_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.gallery_likes;
CREATE POLICY "Allow public read access" ON public.gallery_likes
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert likes" ON public.gallery_likes;
CREATE POLICY "Allow authenticated users to insert likes" ON public.gallery_likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own likes" ON public.gallery_likes;
CREATE POLICY "Allow users to delete their own likes" ON public.gallery_likes
FOR DELETE USING (auth.uid() = user_id);

-- Table gallery_comments
ALTER TABLE public.gallery_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.gallery_comments;
CREATE POLICY "Allow public read access" ON public.gallery_comments
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert comments" ON public.gallery_comments;
CREATE POLICY "Allow authenticated users to insert comments" ON public.gallery_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own comments" ON public.gallery_comments;
CREATE POLICY "Allow users to update their own comments" ON public.gallery_comments
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own comments" ON public.gallery_comments;
CREATE POLICY "Allow users to delete their own comments" ON public.gallery_comments
FOR DELETE USING (auth.uid() = user_id);

-- Table gallery_favorites
ALTER TABLE public.gallery_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read their own favorites" ON public.gallery_favorites;
CREATE POLICY "Allow users to read their own favorites" ON public.gallery_favorites
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow authenticated users to insert favorites" ON public.gallery_favorites;
CREATE POLICY "Allow authenticated users to insert favorites" ON public.gallery_favorites
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own favorites" ON public.gallery_favorites;
CREATE POLICY "Allow users to delete their own favorites" ON public.gallery_favorites
FOR DELETE USING (auth.uid() = user_id);

-- 7. Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_gallery_media_user_id ON public.gallery_media(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_media_status ON public.gallery_media(status);
CREATE INDEX IF NOT EXISTS idx_gallery_likes_media_id ON public.gallery_likes(media_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_media_id ON public.gallery_comments(media_id);
CREATE INDEX IF NOT EXISTS idx_gallery_favorites_user_id ON public.gallery_favorites(user_id);
