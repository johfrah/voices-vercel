import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GHOST MODE API: Stop impersonation
 * Cleart de huidige sessie en keert terug naar de admin status.
 */
export async function POST() {
  const supabase = createClient();
  
  // We signen de huidige (geïmpersoneerde) gebruiker uit
  await supabase.auth.signOut();

  // De frontend handelt het herstellen van de admin sessie af via de AuthContext
  // door de pagina te herladen en de adminUser uit sessionStorage te halen (indien we dat zo implementeren)
  // OF we kunnen hier een token teruggeven om opnieuw in te loggen als admin.
  
  return NextResponse.json({ success: true });
}
