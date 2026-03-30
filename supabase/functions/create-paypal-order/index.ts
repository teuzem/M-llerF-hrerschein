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
    console.log('--- Invocation de create-paypal-order ---');
    const body = await req.json();
    const { amount } = body;
    console.log(`Montant reçu: ${amount}`);

    if (amount === undefined || amount === null) {
      throw new Error('Le montant est manquant dans la requête.');
    }
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error(`Montant invalide: "${amount}". Il doit être un nombre positif.`);
    }
    
    const formattedAmount = numericAmount.toFixed(2);
    console.log(`Montant formaté: ${formattedAmount}`);

    const accessToken = await getAccessToken();
    console.log('Access Token obtenu.');

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'EUR',
          value: formattedAmount
        }
      }],
    };

    console.log('Création de la commande PayPal avec le payload:', JSON.stringify(orderPayload));
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify(orderPayload),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Erreur de création de commande PayPal:', data);
      throw new Error(data.message || 'Échec de la création de la commande PayPal.');
    }

    console.log(`Commande PayPal créée avec succès: ${data.id}`);
    return new Response(JSON.stringify({ orderID: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erreur dans la fonction create-paypal-order:', error.message);
    return new Response(JSON.stringify({ error: `Erreur interne: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
