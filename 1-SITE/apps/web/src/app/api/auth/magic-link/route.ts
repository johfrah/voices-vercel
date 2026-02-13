import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, redirect } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

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
    const emailServiceUrl = process.env.EMAIL_SERVICE_URL || 'https://voices-vercel.vercel.app';
    
    // We gebruiken de interne mailbox route om de mail te versturen
    // We voegen de SYSTEM_SECRET toe om de auth te bypassen voor deze systeemactie
    const emailRes = await fetch(`${emailServiceUrl}/api/mailbox/send`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-system-secret': process.env.SYSTEM_SECRET || ''
      },
      body: JSON.stringify({
        to: email,
        subject: 'Inloggen op Voices.be',
        body: `Klik op de volgende link om in te loggen: ${magicLink}`
      }),
    });

    const emailData = await emailRes.json();
    if (!emailRes.ok) {
      console.error('📧 EMAIL SERVICE FAILURE:', emailData);
      throw new Error(emailData.error || 'Email service error');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('🚀 NUCLEAR AUTH ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
