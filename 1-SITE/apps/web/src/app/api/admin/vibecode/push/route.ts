import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { requireAdmin } from '@/lib/auth/api-auth';

const execAsync = promisify(exec);

/**
 * 🚀 NUCLEAR PUSH API (2026)
 * 
 * Stelt de site in staat om Cody wijzigingen direct naar Git te pushen.
 * Alleen toegankelijk voor admins.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const isSuperPush = body.mode === 'super-push';
    
    console.log(`🚀 [NUCLEAR PUSH] Start ${isSuperPush ? 'Super-Push' : 'Git sync'}...`);

    // 1. Linting (Alleen bij Super-Push)
    if (isSuperPush) {
      console.log('🔍 [NUCLEAR PUSH] Running Lint...');
      await execAsync('npm run lint --prefix apps/web');
    }

    // 2. Database Sync (Alleen bij Super-Push)
    if (isSuperPush) {
      console.log('🗄️ [NUCLEAR PUSH] Syncing Database...');
      await execAsync('npm run db:push');
    }

    // 3. Git Add & Commit
    const commitMsg = isSuperPush 
      ? `🚀 SUPER-PUSH: Vibe & System update via Cody - ${new Date().toISOString()}`
      : `⚡ Cody: Vibe update via in-app engine - ${new Date().toISOString()}`;
    
    await execAsync(`git add .`); // Bij super-push voegen we alles toe
    
    try {
      await execAsync(`git commit -m "${commitMsg}"`);
    } catch (e: any) {
      if (!e.message.includes('nothing to commit')) throw e;
    }

    // 4. Git Push
    await execAsync('git push origin main');

    return NextResponse.json({ 
      success: true, 
      message: isSuperPush ? 'Super-Push voltooid! Site is onderweg naar Combell.' : 'Wijzigingen succesvol gepusht.' 
    });
  } catch (error: any) {
    console.error('❌ [NUCLEAR PUSH] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Push mislukt.' 
    }, { status: 500 });
  }
}
