import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GHOST MODE API: Impersonate a user
 * Alleen toegankelijk voor admins.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const { targetUserId } = await request.json();

  // 1. Check of de huidige gebruiker een admin is
  const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !adminUser) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  }

  const isAdmin = adminUser.email === 'johfrah@voices.be' || 
                  adminUser.email === 'voices@voices.be' || 
                  (adminUser as any)?.role === 'admin';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Alleen voor admins' }, { status: 403 });
  }

  // 2. Haal de target user op (om te verifiëren dat deze bestaat)
  const { data: targetUser, error: targetError } = await supabase.auth.admin.getUserById(targetUserId);
  if (targetError || !targetUser) {
    return NextResponse.json({ error: 'Doelgebruiker niet gevonden' }, { status: 404 });
  }

  // 3. Maak een impersonation sessie
  // We gebruiken de admin API om een magic link of sign-in te simuleren
  // Voor nu gebruiken we de admin.createSession methode van Supabase
  const { data: session, error: sessionError } = await supabase.auth.admin.createSession({
    userId: targetUserId,
  });

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Kon sessie niet aanmaken' }, { status: 500 });
  }

  // 4. Log de actie (Wim's Audit Log)
  console.log(`[GhostMode] Admin ${adminUser.email} impersonating user ${targetUser.user.email}`);
  
  // We kunnen dit ook in een database tabel 'audit_logs' schrijven als die bestaat
  // await db.insert(auditLogs).values({ action: 'impersonate', adminId: adminUser.id, targetId: targetUserId });

  return NextResponse.json({ success: true });
}
