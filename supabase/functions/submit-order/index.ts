// @ts-nocheck
// submit-order Edge Function — Sends order notification emails via Resend API
// Fetches geolocation from free API, sends WhatsApp notification via CallMeBot (no API key needed)
// Sends to admin (allemandpermis913@gmail.com) and client confirmation

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const body = await req.json();
    const {
      orderNumber,
      orderId,
      customerEmail,
      customerPhone,
      items,
      totalAmount,
      documents,
      language = 'de',
    } = body;

    // ═══════════════════════════════════════════
    // FETCH GEOLOCATION DATA (free, no API key)
    // ═══════════════════════════════════════════
    let geoData: any = {};
    try {
      // Try ip-api.com first (free, no key, 45 req/min)
      const geoRes = await fetch('http://ip-api.com/json/?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,query');
      if (geoRes.ok) {
        const geo = await geoRes.json();
        if (geo.status === 'success') {
          geoData = {
            ip: geo.query,
            country: geo.country,
            countryCode: geo.countryCode,
            region: geo.regionName,
            city: geo.city,
            postalCode: geo.zip,
            latitude: geo.lat,
            longitude: geo.lon,
            timezone: geo.timezone,
            isp: geo.isp,
          };
        }
      }
    } catch (geoErr) {
      console.warn('Geolocation fetch failed (non-blocking):', geoErr);
    }

    // Format geolocation for email display
    const geoLocationText = geoData.city
      ? `${geoData.city}, ${geoData.region || ''} ${geoData.postalCode || ''} — ${geoData.country || ''}`
      : 'Nicht verfügbar';

    const geoHtml = geoData.city
      ? `
        <tr><td style="padding:6px 0;font-size:13px;color:#666;width:140px;">🌍 Land:</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#111;">${geoData.country} (${geoData.countryCode})</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#666;">🏙️ Stadt:</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#111;">${geoData.city}</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#666;">📍 Region:</td><td style="padding:6px 0;font-size:13px;color:#111;">${geoData.region || '-'}</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#666;">📮 PLZ:</td><td style="padding:6px 0;font-size:13px;color:#111;">${geoData.postalCode || '-'}</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#666;">🕐 Zeitzone:</td><td style="padding:6px 0;font-size:13px;color:#111;">${geoData.timezone || '-'}</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#666;">🌐 IP:</td><td style="padding:6px 0;font-size:13px;color:#111;">${geoData.ip || '-'}</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#666;">📡 ISP:</td><td style="padding:6px 0;font-size:13px;color:#111;">${geoData.isp || '-'}</td></tr>
      `
      : '<tr><td colspan="2" style="padding:6px 0;font-size:13px;color:#999;">Geolocation nicht verfügbar</td></tr>';

    // Format items for email
    const itemsHtml = items.map((item: any) =>
      `<tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f1f1f1;font-size:14px;color:#333;">${item.category}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f1f1f1;font-size:14px;color:#333;">${item.name}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f1f1f1;font-size:14px;color:#333;text-align:right;font-weight:700;">${item.price.toLocaleString()}€</td>
      </tr>`
    ).join('');

    // Format documents for email
    const docTypeLabels: Record<string, string> = {
      'id_passport': '🪪 Ausweis (Vorder- & Rückseite)',
      'photo_4x4': '📷 Passfoto (4×4 cm)',
    };

    const docsHtml = documents && documents.length > 0
      ? documents.map((doc: any) =>
        `<tr>
          <td style="padding:8px 16px;border-bottom:1px solid #f1f1f1;font-size:13px;color:#333;">📎 ${doc.name}</td>
          <td style="padding:8px 16px;border-bottom:1px solid #f1f1f1;font-size:13px;color:#666;">${docTypeLabels[doc.type] || doc.type}</td>
          <td style="padding:8px 16px;border-bottom:1px solid #f1f1f1;font-size:13px;"><a href="${doc.url}" style="color:#DD0000;text-decoration:underline;">Anzeigen</a></td>
        </tr>`
      ).join('')
      : '<tr><td colspan="3" style="padding:12px 16px;color:#999;font-size:13px;">Keine Dokumente hochgeladen</td></tr>';

    const submissionDate = new Date().toLocaleString(language === 'de' ? 'de-DE' : language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    // ═══════════════════════════════════════════
    // ADMIN EMAIL — Full order details with geolocation
    // ═══════════════════════════════════════════
    const adminHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;background:#f4f4f5;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#000000 0%,#DD0000 50%,#FFCE00 100%);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">🚗 MüllerFührerschein</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:13px;">Neue Bestellung eingegangen</p>
    </div>

    <div style="padding:24px;">
      <!-- Order Number -->
      <div style="background:#fef2f2;border-left:4px solid #DD0000;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#666;">Bestellnummer</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#DD0000;">${orderNumber}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#999;">${submissionDate}</p>
      </div>

      <!-- Customer Contact -->
      <h2 style="font-size:16px;font-weight:700;color:#111;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #f1f1f1;">📧 Kontaktdaten</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:6px 0;font-size:13px;color:#666;width:140px;">E-Mail:</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#111;">${customerEmail}</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#666;">Telefon:</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#111;">${customerPhone}</td></tr>
      </table>

      <!-- Geolocation Data -->
      <h2 style="font-size:16px;font-weight:700;color:#111;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #f1f1f1;">📍 Standort (automatisch erkannt)</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        ${geoHtml}
      </table>

      <!-- Ordered Services -->
      <h2 style="font-size:16px;font-weight:700;color:#111;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #f1f1f1;">📋 Bestellte Leistungen</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;background:#fafafa;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f1f1f1;">
            <th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:700;color:#666;text-transform:uppercase;">Klasse</th>
            <th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:700;color:#666;text-transform:uppercase;">Leistung</th>
            <th style="padding:10px 16px;text-align:right;font-size:12px;font-weight:700;color:#666;text-transform:uppercase;">Preis</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr style="background:#DD0000;">
            <td colspan="2" style="padding:12px 16px;font-size:14px;font-weight:700;color:#fff;">Gesamtbetrag</td>
            <td style="padding:12px 16px;font-size:18px;font-weight:800;color:#fff;text-align:right;">${totalAmount.toLocaleString()}€</td>
          </tr>
        </tfoot>
      </table>

      <!-- Documents -->
      <h2 style="font-size:16px;font-weight:700;color:#111;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #f1f1f1;">📁 Hochgeladene Dokumente</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#fafafa;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f1f1f1;">
            <th style="padding:8px 16px;text-align:left;font-size:12px;font-weight:700;color:#666;">Datei</th>
            <th style="padding:8px 16px;text-align:left;font-size:12px;font-weight:700;color:#666;">Typ</th>
            <th style="padding:8px 16px;text-align:left;font-size:12px;font-weight:700;color:#666;">Link</th>
          </tr>
        </thead>
        <tbody>${docsHtml}</tbody>
      </table>
    </div>

    <!-- Footer -->
    <div style="background:#f8f8f8;padding:20px 24px;text-align:center;border-top:1px solid #e5e5e5;">
      <p style="margin:0;font-size:12px;color:#999;">MüllerFührerschein • Berlin, Deutschland</p>
      <p style="margin:4px 0 0;font-size:11px;color:#bbb;">Diese E-Mail wurde automatisch generiert.</p>
    </div>
  </div>
</body>
</html>`;

    // ═══════════════════════════════════════════
    // CLIENT EMAIL — Order confirmation
    // ═══════════════════════════════════════════
    const lang = language as string;

    const clientSubjects: Record<string, string> = {
      de: `Bestellbestätigung – ${orderNumber}`,
      en: `Order Confirmation – ${orderNumber}`,
      fr: `Confirmation de commande – ${orderNumber}`,
    };

    const clientMessages: Record<string, string> = {
      de: 'Vielen Dank für Ihre Bestellung! Wir haben Ihre Anfrage erhalten und unser Team wird sich in Kürze mit Ihnen in Verbindung setzen.',
      en: 'Thank you for your order! We have received your request and our team will contact you shortly.',
      fr: 'Merci pour votre commande ! Nous avons bien reçu votre demande et notre équipe vous contactera dans les plus brefs délais.',
    };

    const clientNextSteps: Record<string, string[]> = {
      de: ['Ihre Bestellung wird von unserem Team bearbeitet', 'Sie erhalten eine Bestätigung per E-Mail', 'Bei Fragen kontaktieren Sie uns: +49 15 212399096'],
      en: ['Your order is being processed by our team', 'You will receive a confirmation by email', 'For questions contact us: +49 15 212399096'],
      fr: ['Votre commande est en cours de traitement', 'Vous recevrez une confirmation par email', 'Pour toute question : +49 15 212399096'],
    };

    const clientItemsHtml = items.map((item: any) =>
      `<tr>
        <td style="padding:8px 16px;border-bottom:1px solid #f1f1f1;font-size:14px;color:#333;">${item.category} — ${item.name}</td>
        <td style="padding:8px 16px;border-bottom:1px solid #f1f1f1;font-size:14px;color:#333;text-align:right;font-weight:700;">${item.price.toLocaleString()}€</td>
      </tr>`
    ).join('');

    const stepsHtml = (clientNextSteps[lang] || clientNextSteps.de).map((step: string) =>
      `<li style="padding:4px 0;font-size:13px;color:#555;">${step}</li>`
    ).join('');

    const clientGreeting = lang === 'fr' ? 'Bonjour' : lang === 'en' ? 'Hello' : 'Guten Tag';

    const clientHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;background:#f4f4f5;">
  <div style="max-width:580px;margin:0 auto;background:#ffffff;">
    <div style="background:linear-gradient(135deg,#000000 0%,#DD0000 50%,#FFCE00 100%);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">🚗 MüllerFührerschein</h1>
    </div>
    <div style="padding:32px 24px;">
      <p style="font-size:16px;font-weight:600;color:#111;margin:0 0 8px;">${clientGreeting},</p>
      <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 24px;">${clientMessages[lang] || clientMessages.de}</p>

      <div style="background:#fef2f2;border-left:4px solid #DD0000;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;color:#666;">${lang === 'fr' ? 'Numéro de commande' : lang === 'en' ? 'Order Number' : 'Bestellnummer'}</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#DD0000;">${orderNumber}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;background:#fafafa;border-radius:8px;overflow:hidden;">
        <tbody>${clientItemsHtml}</tbody>
        <tfoot>
          <tr style="background:#DD0000;">
            <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#fff;">Total</td>
            <td style="padding:12px 16px;font-size:18px;font-weight:800;color:#fff;text-align:right;">${totalAmount.toLocaleString()}€</td>
          </tr>
        </tfoot>
      </table>

      <h3 style="font-size:14px;font-weight:700;color:#111;margin:24px 0 8px;">${lang === 'fr' ? 'Prochaines étapes' : lang === 'en' ? 'Next Steps' : 'Nächste Schritte'}:</h3>
      <ol style="margin:0;padding-left:20px;">${stepsHtml}</ol>
    </div>
    <div style="background:#f8f8f8;padding:20px 24px;text-align:center;border-top:1px solid #e5e5e5;">
      <p style="margin:0;font-size:12px;color:#999;">MüllerFührerschein • Berlin, Deutschland</p>
      <p style="margin:4px 0 0;font-size:11px;color:#bbb;">+49 15 212399096 • mulerfuhrerschein@gmail.com</p>
    </div>
  </div>
</body>
</html>`;

    // ═══════════════════════════════════════════
    // SEND EMAILS VIA RESEND
    // ═══════════════════════════════════════════
    const senderEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'admin@mulerfuhrerschein.de';
    const senderName = 'MüllerFührerschein';

    // Send admin email
    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${senderName} <${senderEmail}>`,
        to: ['allemandpermis913@gmail.com'],
        subject: `🚗 Neue Bestellung: ${orderNumber} — ${customerEmail} (${geoLocationText})`,
        html: adminHtml,
      }),
    });

    if (!adminRes.ok) {
      const errText = await adminRes.text();
      console.error('Resend admin email error:', errText);
    }

    // Send client confirmation
    const clientRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${senderName} <${senderEmail}>`,
        to: [customerEmail],
        subject: clientSubjects[lang] || clientSubjects.de,
        html: clientHtml,
      }),
    });

    if (!clientRes.ok) {
      const errText = await clientRes.text();
      console.error('Resend client email error:', errText);
    }

    // ═══════════════════════════════════════════
    // SEND WHATSAPP NOTIFICATION (simple, no API key, no env vars)
    // Uses CallMeBot free WhatsApp API — just an HTTP GET call
    // Setup once: send "I allow callmebot to send me messages" to +34 644 31 89 93 on WhatsApp
    // ═══════════════════════════════════════════
    let whatsappSent = false;
    try {
      const waPhone = '237620582232'; // Your WhatsApp number (without +)
      const itemsList = items.map((i: any) => `${i.category} - ${i.name} (${i.price}€)`).join('\n');
      const geoInfo = geoData.city ? `${geoData.city}, ${geoData.country}` : 'N/A';

      const waMessage = [
        '🚗 NEUE BESTELLUNG',
        '',
        `Nr: ${orderNumber}`,
        `Email: ${customerEmail}`,
        `Tel: ${customerPhone}`,
        `Standort: ${geoInfo}`,
        '',
        'Artikel:',
        itemsList,
        '',
        `TOTAL: ${totalAmount}€`,
        '',
        `Docs: ${documents?.length || 0}`,
      ].join('\n');

      // CallMeBot free WhatsApp API
      const encodedMsg = encodeURIComponent(waMessage);
      const callmebotUrl = `https://api.callmebot.com/whatsapp.php?phone=${waPhone}&text=${encodedMsg}&apikey=4453386`;

      const waRes = await fetch(callmebotUrl);
      whatsappSent = waRes.ok;

      if (!waRes.ok) {
        console.warn('CallMeBot WhatsApp response not OK:', waRes.status);
      }
    } catch (waErr) {
      console.warn('WhatsApp notification failed (non-blocking):', waErr);
    }

    return new Response(JSON.stringify({
      success: true,
      adminEmailSent: adminRes.ok,
      clientEmailSent: clientRes.ok,
      whatsappSent,
      orderNumber,
      geolocation: geoData.city ? geoLocationText : null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('submit-order error:', (error as Error).message);
    return new Response(JSON.stringify({
      error: { code: 'ORDER_EMAIL_ERROR', message: (error as Error).message },
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
