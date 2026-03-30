/*
          # [Structural] Ajout des fonctionnalités de présence
          Ajoute une colonne `last_seen` à la table des profils pour suivre la présence des utilisateurs.

          ## Query Description: [Cette opération ajoute une colonne non destructive. Elle est essentielle pour la fonctionnalité de "vu pour la dernière fois" et n'impacte pas les données existantes.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Table: public.profiles
          - Columns Added: last_seen (TIMESTAMPTZ)
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes (Mise à jour de la politique existante)
          - Auth Requirements: L'utilisateur doit être authentifié pour mettre à jour son propre statut.
          
          ## Performance Impact:
          - Indexes: Aucun
          - Triggers: Aucun
          - Estimated Impact: Faible.
          */

ALTER TABLE public.profiles
ADD COLUMN last_seen TIMESTAMPTZ;

-- Mettre à jour la politique RLS pour permettre aux utilisateurs de mettre à jour leur propre `last_seen`
-- Cette commande remplace la politique existante pour s'assurer que la nouvelle colonne est incluse.
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
