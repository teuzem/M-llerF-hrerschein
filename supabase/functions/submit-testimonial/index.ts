import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  )
}

async function getUserFromJWT(req: Request, supabaseAdmin: SupabaseClient) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null
  const jwt = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
  return user
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = await getSupabaseAdmin()
    const user = await getUserFromJWT(req, supabaseAdmin)

    const formData = await req.formData()
    const testimonial_id = formData.get('testimonial_id') as string | null
    const author_name = formData.get('author_name') as string
    const rating = parseInt(formData.get('rating') as string, 10)
    const content = formData.get('content') as string
    const city = formData.get('city') as string | null
    const region = formData.get('region') as string | null
    const license_type_ids = formData.getAll('license_type_ids[]') as string[]
    
    const mediaFiles = formData.getAll('media_files[]') as File[]
    const mediaUrlInputs = formData.getAll('media_urls_input[]') as string[]
    const existingMediaUrls = formData.getAll('existing_media_urls[]') as string[]

    if (!author_name || !rating || !content) {
      throw new Error('Champs obligatoires manquants (nom, note, contenu).')
    }

    // Handle media uploads
    const media_urls: string[] = [...mediaUrlInputs, ...existingMediaUrls];
    const ownerId = user?.id || 'guests';
    for (const file of mediaFiles) {
      const filePath = `public/${ownerId}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabaseAdmin.storage
        .from('testimonials-media')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })
      if (uploadError) throw new Error(`Échec du téléversement du fichier: ${file.name}`)
      
      const { data: urlData } = supabaseAdmin.storage.from('testimonials-media').getPublicUrl(filePath)
      media_urls.push(urlData.publicUrl)
    }

    if (testimonial_id) { // UPDATE
      if (!user) throw new Error('Authentification requise pour modifier un avis.')
      
      // Verify ownership
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('testimonials')
        .select('user_id, media_urls')
        .eq('id', testimonial_id)
        .single()
      
      if (fetchError || !existing) throw new Error('Avis non trouvé.')
      if (existing.user_id !== user.id) throw new Error('Permission refusée.')

      // Delete old media that are not in existingMediaUrls
      const oldMedia = existing.media_urls || [];
      const mediaToDelete = oldMedia.filter(url => !existingMediaUrls.includes(url));
      if (mediaToDelete.length > 0) {
        const filePathsToDelete = mediaToDelete.map(url => 'public/' + url.split('/public/')[1]);
        await supabaseAdmin.storage.from('testimonials-media').remove(filePathsToDelete);
      }
      
      const { data: updatedTestimonial, error: updateError } = await supabaseAdmin
        .from('testimonials')
        .update({
          rating,
          content,
          media_urls,
          license_type_ids: license_type_ids.length > 0 ? license_type_ids : null,
          status: 'pending', // Reset status to pending on update
        })
        .eq('id', testimonial_id)
        .select()
        .single()

      if (updateError) throw updateError
      return new Response(JSON.stringify({ success: true, data: updatedTestimonial }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      })

    } else { // INSERT
      const testimonialData: any = {
        author_name, rating, content, media_urls,
        city: city && city !== 'null' ? city : null,
        region: region && region !== 'null' ? region : null,
        status: 'pending',
        license_type_ids: license_type_ids.length > 0 ? license_type_ids : null,
      }

      if (user) {
        testimonialData.user_id = user.id
      } else {
        const author_email = formData.get('author_email') as string | null
        if (!author_email) throw new Error('Email requis pour les avis des invités.')
        testimonialData.author_email = author_email
      }

      const { data: newTestimonial, error } = await supabaseAdmin
        .from('testimonials')
        .insert(testimonialData)
        .select()
        .single()

      if (error) throw new Error(`Échec de l'enregistrement de l'avis: ${error.message}`)

      return new Response(JSON.stringify({ success: true, data: newTestimonial }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      })
    }
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    })
  }
})
