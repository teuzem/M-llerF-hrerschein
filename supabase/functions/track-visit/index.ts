// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const visitorData = await req.json();

    // Init Supabase Service Role client to bypass RLS for inserting and checking rate limit
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Insert into visitor_logs
    const { error: insertError } = await supabaseClient
      .from("visitor_logs")
      .insert(visitorData);

    if (insertError) {
      console.error("Error inserting visitor log:", insertError);
      return new Response(JSON.stringify({ error: "Failed to log visit" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // 2. Rate limit email notifications (1 per IP per hour)
    if (visitorData.ip_address) {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const { count, error: countError } = await supabaseClient
        .from("visitor_logs")
        .select("*", { count: "exact", head: true })
        .eq("ip_address", visitorData.ip_address)
        .gte("created_at", oneHourAgo.toISOString());

      if (countError) console.error("Error checking rate limit:", countError);
      
      // If we've seen this IP more than once in the last hour, don't send email
      // (The count will be >= 1 because we just inserted the current visit)
      if (count && count > 1) {
        return new Response(JSON.stringify({ success: true, emailed: false, reason: "Rate limited" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // 3. Send email using Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
       console.error("RESEND_API_KEY not set");
       return new Response(JSON.stringify({ success: true, emailed: false, error: "No RESEND_API_KEY" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
    }

    const resend = new Resend(resendApiKey);
    
    // Format the email using HTML
    const locationStr = [visitorData.city, visitorData.region, visitorData.country]
      .filter(Boolean)
      .join(", ");
      
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0055A4; border-bottom: 2px solid #eee; padding-bottom: 10px;">🚨 Alerte de Visite - MüllerFührerschein</h2>
        
        <p style="font-size: 16px; line-height: 1.5;">
          Bonjour,<br><br>
          Un nouvel utilisateur est actuellement en train de naviguer sur votre plateforme MüllerFührerschein.
          Voici les détails précis et en temps réel concernant ce visiteur afin que vous puissiez analyser votre trafic.
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">📍 Localisation Géographique</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Position:</td><td style="font-weight: bold; color: #0f172a;">${locationStr || 'Inconnue'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Code Postal:</td><td style="color: #334155;">${visitorData.zip || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Coordonnées GPS:</td><td style="color: #334155;">${visitorData.latitude || 'N/A'}, ${visitorData.longitude || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Fuseau horaire:</td><td style="color: #334155;">${visitorData.timezone || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Fournisseur d'accès:</td><td style="color: #334155;">${visitorData.isp || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Adresse IP:</td><td style="color: #334155; font-family: monospace;">${visitorData.ip_address || 'Inconnue'}</td></tr>
          </table>
          
          <h3 style="margin-top: 25px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">💻 Appareil & Navigateur</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Système d'expl.:</td><td style="color: #334155;">${visitorData.os || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Navigateur:</td><td style="color: #334155;">${visitorData.browser || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Type d'appareil:</td><td style="color: #334155;">${visitorData.device_type || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Résolution écran:</td><td style="color: #334155;">${visitorData.screen_resolution || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Langue:</td><td style="color: #334155;">${visitorData.language || 'N/A'}</td></tr>
          </table>
          
          <h3 style="margin-top: 25px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">🌐 Navigation</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Page d'arrivée:</td><td style="color: #334155; word-break: break-all;"><a href="${visitorData.page_url}" style="color: #0055A4; text-decoration: none;">${visitorData.page_url || 'N/A'}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Titre de la page:</td><td style="color: #334155;">${visitorData.page_title || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Provenance (Ref):</td><td style="color: #334155;">${visitorData.referrer || 'Accès direct'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Statut Connexion:</td><td><span style="background-color: ${visitorData.is_authenticated ? '#dcfce7' : '#f1f5f9'}; color: ${visitorData.is_authenticated ? '#166534' : '#475569'}; padding: 4px 10px; border-radius: 12px; font-weight: bold;">${visitorData.is_authenticated ? 'Utilisateur Connecté' : 'Visiteur Anonyme'}</span></td></tr>
          </table>
        </div>
        
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
          Cet email a été généré automatiquement par le système de monitoring MüllerFührerschein.<br>
          <i>Information de sécurité : Limité à 1 notification par IP par heure.</i>
        </p>
      </div>
    `;

    const notificationSubject = `🚨 Nouveau visiteur d'ici: ${locationStr || visitorData.city || visitorData.country || 'Position Inconnue'}`;

    const { data, error } = await resend.emails.send({
      from: "MüllerFührerschein <admin@mulerfuhrerschein.de>",
      to: ["admin@mulerfuhrerschein.de", "mulerfuhrerschein@gmail.com"],
      subject: notificationSubject,
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending email:", error);
      return new Response(JSON.stringify({ success: true, emailed: false, error }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ success: true, emailed: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    const error = err as Error;
    console.error("Unexpected error in edge function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
