// @ts-ignore
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
// @ts-ignore
import Stripe from 'https://esm.sh/stripe@12.12.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore
serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // @ts-ignore
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY ist nicht konfiguriert');
    }

    const stripe = new Stripe(stripeSecretKey, {
      httpClient: Stripe.createFetchHttpClient(),
      apiVersion: '2022-11-15',
    });

    const { applicationId, amount, licenseType = 'B' } = await req.json();
    
    if (!amount || typeof amount !== 'number') {
      throw new Error('Ungültiger Betrag');
    }

    if (!applicationId) {
      throw new Error('applicationId fehlt');
    }

    // Calculate net/gross for metadata (assuming 19% VAT)
    const amountGross = amount / 100; // amount is in cents
    const vatRate = 0.19;
    const amountNet = amountGross / (1 + vatRate);
    const vatAmount = amountGross - amountNet;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        application_id: applicationId,
        license_type: licenseType,
        amount_net_eur: amountNet.toFixed(2),
        amount_gross_eur: amountGross.toFixed(2),
        vat_amount_eur: vatAmount.toFixed(2),
        vat_rate: '19%',
        country: 'DE',
        service_type: 'fahrerlaubnis',
        compliance_gdpr: 'true',
        invoice_required: 'true'
      },
      description: `Führerschein-Antrag ${licenseType} - MüllerFuhrerschein`,
    });

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Stripe function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
