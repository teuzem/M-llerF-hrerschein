import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
const PAYPAL_API_URL = Deno.env.get('PAYPAL_MODE') === 'sandbox' 
  ? 'https://api-m.sandbox.paypal.com' 
  : 'https://api-m.paypal.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getAccessToken() {
  console.log(`Utilisation de l'URL PayPal: ${PAYPAL_API_URL}`);
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('Les secrets PayPal (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) sont manquants. Veuillez les configurer dans les paramètres "Edge Functions" de votre projet Supabase.');
  }

  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Basic ${auth}` },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Erreur d\'authentification PayPal:', errorBody);
    throw new Error(`Échec de l'authentification PayPal. Vérifiez vos identifiants.`);
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('--- Invocation de capture-paypal-order ---');
    const { orderID } = await req.json();
    console.log(`OrderID reçu: ${orderID}`);

    if (!orderID) {
      throw new Error('orderID manquant dans la requête.');
    }
    
    const accessToken = await getAccessToken();
    console.log('Access Token obtenu.');

    console.log(`Capture de la commande PayPal: ${orderID}`);
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Erreur de capture de commande PayPal:', data);
      throw new Error(data.message || 'Échec de la capture de la commande PayPal.');
    }

    console.log('Commande capturée avec succès:', data);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erreur dans la fonction capture-paypal-order:', error.message);
    return new Response(JSON.stringify({ error: `Erreur interne: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
