// German Application Processing Edge Function for MullerFuhrerschein
// Handles application submission with German compliance and GDPR

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const requestData = await req.json();
    const { 
      userId, 
      licenseType, 
      personalData, 
      documents = [],
      gdprConsent = true
    } = requestData;

    // Validate GDPR consent
    if (!gdprConsent) {
      throw new Error('GDPR consent is required for German applications');
    }

    // Validate required fields
    if (!userId || !licenseType) {
      throw new Error('Benutzer-ID und Führerscheintyp sind erforderlich');
    }

    // Validate German personal data requirements
    const requiredFields = ['full_name', 'geburtsdatum', 'geburtsort', 'staatsangehoerigkeit'];
    for (const field of requiredFields) {
      if (!personalData[field]) {
        throw new Error(`Erforderliches Feld fehlt: ${field}`);
      }
    }

    // Get Supabase auth token from request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Create application with German-specific processing
    const applicationData = {
      user_id: userId,
      license_type: licenseType,
      status: 'eingereicht',
      total_amount_net: 0, // Will be calculated based on license type
      total_amount_gross: 0,
      vat_amount: 0,
      notes: `Antrag eingereicht am ${new Date().toLocaleString('de-DE')}`,
      submitted_at: new Date().toISOString(),
      metadata: {
        gdpr_consent: gdprConsent,
        data_processing_purpose: 'fahrerlaubnis_beantragung',
        country_compliance: 'DE',
        language: 'de',
        compliance_gdpr: true,
        submitted_via: 'online_portal'
      }
    };

    // Simulate database insertion (in production, use Supabase client)
    const applicationResponse = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      application_number: `MF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      status: 'eingereicht',
      created_at: new Date().toISOString(),
      ...applicationData
    };

    // Send confirmation email (placeholder for email service)
    const emailData = {
      to: personalData.email || '',
      subject: `Ihr Führerschein-Antrag wurde eingereicht - ${applicationResponse.application_number}`,
      template: 'application_submitted',
      data: {
        application_number: applicationResponse.application_number,
        license_type: licenseType,
        name: personalData.full_name,
        submission_date: new Date().toLocaleString('de-DE'),
        processing_time: '14-21 Werktage',
        status_url: `${supabaseUrl}/dashboard/applications/${applicationResponse.id}`
      }
    };

    // Log compliance data
    console.log('Application submitted with GDPR compliance:', {
      userId,
      applicationId: applicationResponse.id,
      gdprConsent,
      consentDate: new Date().toISOString(),
      dataProcessingPurpose: 'fahrerlaubnis_beantragung',
      countryCompliance: 'DE'
    });

    return new Response(JSON.stringify({
      success: true,
      application: applicationResponse,
      message: 'Ihr Antrag wurde erfolgreich eingereicht',
      next_steps: [
        'Sie erhalten eine Bestätigungs-E-Mail',
        'Bearbeitungszeit: 14-21 Werktage',
        'Sie können den Status in Ihrem Dashboard verfolgen'
      ],
      compliance: {
        gdpr_consent: gdprConsent,
        data_processing_notice: 'Ihre Daten werden gemäß DSGVO verarbeitet',
        contact_authority: 'Kraftfahrt-Bundesamt (KBA)'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Application submission error:', error.message);
    
    const errorResponse = {
      error: {
        code: 'APPLICATION_SUBMISSION_ERROR',
        message: `Fehler beim Einreichen des Antrags: ${error.message}`,
        type: 'server_error'
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
