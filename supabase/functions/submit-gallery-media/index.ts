import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Function to get an admin Supabase client to bypass RLS
async function getSupabaseAdmin(): Promise<SupabaseClient> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL ou clé de service manquante dans les variables d\'environnement.')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}

// Main server function
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = await getSupabaseAdmin()

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('En-tête d\'autorisation manquant.')
    }
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt)
    if (userError || !user) {
      throw new Error(`Échec de l'authentification: ${userError?.message || 'Utilisateur non trouvé.'}`)
    }

    const formData = await req.formData()
    const mediaFile = formData.get('media_file') as File | null
    const mediaUrlInput = formData.get('media_url_input') as string | null
    const media_type = formData.get('media_type') as 'image' | 'video' | null

    if (!media_type) {
      throw new Error("Le type de média ('image' ou 'video') est requis.")
    }
    if (!mediaFile && !mediaUrlInput) {
      throw new Error('Aucun média fourni. Veuillez téléverser un fichier ou fournir une URL.')
    }

    let media_url = ''

    if (mediaFile) {
      const filePath = `public/${user.id}/${Date.now()}-${mediaFile.name}`
      const { error: uploadError } = await supabaseAdmin.storage
        .from('gallery-media')
        .upload(filePath, mediaFile, {
          contentType: mediaFile.type,
          cacheControl: '3600',
          upsert: false,
        })
      
      if (uploadError) {
        console.error('Erreur de téléversement vers le stockage:', uploadError)
        throw new Error(`Échec du téléversement du fichier: ${uploadError.message}`)
      }

      const { data: urlData } = supabaseAdmin.storage.from('gallery-media').getPublicUrl(filePath)
      media_url = urlData.publicUrl
    } else {
      media_url = mediaUrlInput!
    }

    const { data: newMedia, error: dbError } = await supabaseAdmin
      .from('gallery_media')
      .insert({
        user_id: user.id,
        media_type,
        media_url,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Erreur d\'insertion en base de données:', dbError)
      throw new Error(`Échec de l'enregistrement en base de données: ${dbError.message}`)
    }

    return new Response(JSON.stringify({ success: true, data: newMedia }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Erreur d\'exécution de la fonction Edge:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
