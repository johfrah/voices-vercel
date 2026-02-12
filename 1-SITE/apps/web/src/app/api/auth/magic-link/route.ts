import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, redirect } = await request.json();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: 'Auth service not configured' }, { status: 503 });
    }

    // 1. Initialiseer Supabase Admin (nodig voor het genereren van links zonder auto-mail)
    const supabaseAdmin = createClient(url, key);

    // 2. Genereer de Magic Link (zonder hem te versturen!)
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: redirect || `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      }
    });

    if (error) throw error;

    const magicLink = data.properties.action_link;

    // 3. Verstuur de mail via onze EIGEN Email Service (Server-to-Server)
    // We gebruiken de universele /send route van de email service
    const emailServiceUrl = process.env.EMAIL_SERVICE_URL || 'http://localhost:3001';
    
    const emailRes = await fetch(`${emailServiceUrl}/api/emails/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'Inloggen op Voices.be',
        template: 'magic-link',
        context: {
          content: magicLink,
          skip_approval: true // Inloglinks moeten direct verstuurd worden
        }
      }),
    });

    const emailData = await emailRes.json();
    if (!emailRes.ok) throw new Error(emailData.error || 'Email service error');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('🚀 NUCLEAR AUTH ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
