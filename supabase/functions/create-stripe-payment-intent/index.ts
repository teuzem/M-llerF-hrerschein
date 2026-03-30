import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.12.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey || stripeSecretKey.startsWith('sk_test_') === false) {
      throw new Error('La variable d\'environnement STRIPE_SECRET_KEY est manquante ou invalide. Veuillez la configurer dans les secrets de votre projet Supabase.');
    }

    const stripe = new Stripe(stripeSecretKey, {
      httpClient: Stripe.createFetchHttpClient(),
      apiVersion: '2022-11-15',
    });

    const { amount } = await req.json();
    if (!amount || typeof amount !== 'number' || amount < 50) {
      throw new Error('Montant invalide. Il doit être un nombre supérieur ou égal à 50 centimes.');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
    });

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Stripe function error:', error.message);
    return new Response(JSON.stringify({ error: `Erreur interne du serveur: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
