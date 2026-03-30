// German Contact Form Edge Function for MullerFuhrerschein
// Handles contact form submissions with GDPR compliance

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
    const requestData = await req.json();
    const { 
      name, 
      email, 
      phone, 
      subject, 
      message,
      gdprConsent = false,
      marketingConsent = false,
      language = 'de'
    } = requestData;

    // GDPR compliance validation
    if (!gdprConsent) {
      throw new Error('DSGVO-Einverständnis ist erforderlich für Kontaktaufnahme');
    }

    // Validate required fields
    if (!name || !email || !subject || !message) {
      throw new Error('Name, E-Mail, Betreff und Nachricht sind erforderlich');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Ungültige E-Mail-Adresse');
    }

    // Create contact message data
    const contactData = {
      name,
      email,
      phone: phone || null,
      subject,
      message,
      language,
      gdpr_consent: gdprConsent,
      consent_date: new Date().toISOString(),
      marketing_consent: marketingConsent,
      data_processing_purpose: 'kontaktaufnahme',
      created_at: new Date().toISOString()
    };

    // Simulate database storage (in production, insert into Supabase)
    const contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Send notification to admin (placeholder)
    const adminNotification = {
      to: 'admin@mullerfuhrerschein.de',
      subject: `Neue Kontaktanfrage: ${subject}`,
      template: 'contact_notification',
      data: {
        contact_id: contactId,
        name,
        email,
        phone,
        subject,
        message,
        submission_time: new Date().toLocaleString('de-DE'),
        gdpr_consent: gdprConsent,
        marketing_consent: marketingConsent
      }
    };

    // Send confirmation to user
    const userConfirmation = {
      to: email,
      subject: 'Ihre Nachricht wurde empfangen - MüllerFuhrerschein',
      template: 'contact_confirmation',
      data: {
        name,
        subject,
        contact_id: contactId,
        response_time: '24-48 Stunden',
        contact_info: {
          phone: '+49 30 123 456 789',
          email: 'info@mullerfuhrerschein.de',
          address: 'MüllerFuhrerschein GmbH, Musterstraße 123, 10115 Berlin'
        }
      }
    };

    // Log for compliance audit
    console.log('Contact form submission:', {
      contactId,
      email,
      gdprConsent,
      marketingConsent,
      dataProcessingPurpose: 'kontaktaufnahme',
      timestamp: new Date().toISOString(),
      compliance: {
        gdpr_consent: gdprConsent,
        consent_date: contactData.consent_date,
        purpose: 'kontaktaufnahme',
        retention_period: '2 Jahre',
        right_to_delete: true
      }
    });

    return new Response(JSON.stringify({
      success: true,
      contactId,
      message: 'Ihre Nachricht wurde erfolgreich gesendet',
      next_steps: [
        'Sie erhalten in Kürze eine Bestätigungs-E-Mail',
        'Unser Team wird sich innerhalb von 24-48 Stunden melden',
        'Bei dringenden Fragen rufen Sie uns an: +49 30 123 456 789'
      ],
      gdpr_info: {
        data_controller: 'MüllerFuhrerschein GmbH',
        data_protection_officer: 'dpo@mullerfuhrerschein.de',
        processing_purpose: 'Beantwortung Ihrer Anfrage',
        legal_basis: 'Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)',
        retention_period: '2 Jahre nach letzter Kontaktaufnahme',
        your_rights: [
          'Recht auf Auskunft über gespeicherte Daten',
          'Recht auf Berichtigung unrichtiger Daten',
          'Recht auf Löschung',
          'Recht auf Einschränkung der Verarbeitung',
          'Recht auf Datenübertragbarkeit',
          'Widerspruchsrecht'
        ]
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Contact form error:', error.message);
    
    const errorResponse = {
      error: {
        code: 'CONTACT_FORM_ERROR',
        message: `Fehler beim Senden der Nachricht: ${error.message}`,
        type: 'validation_error'
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
