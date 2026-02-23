import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 *  API: ACCOUNT NOTIFICATIONS
 * 
 * Doel: Ophalen van notificaties voor de ingelogde gebruiker.
 */

export async function GET(request: NextRequest) {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Voorlopig geven we een lege lijst terug of wat basisnotificaties
  // In de toekomst kan dit uit de database komen
  const notifications = [
    {
      id: 'welcome',
      title: 'Welkom bij Voices',
      message: 'Fijn dat je er bent! Ontdek onze stemmen in het portfolio.',
      type: 'info',
      createdAt: new Date().toISOString(),
      read: false
    }
  ];

  return NextResponse.json({ notifications });
}
