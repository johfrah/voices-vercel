import { NextRequest, NextResponse } from 'next/server';
import { SelfHealingService } from '@/lib/system/self-healing-service';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 * 📊 API: GOD MODE HEALING DASHBOARD
 * 
 * Doel: Overzicht van alle automatische herstelacties voor de founder.
 * 🛡️ Admin only.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const heals = await SelfHealingService.getRecentHeals();
    return NextResponse.json({ success: true, heals });
  } catch (error) {
    console.error('❌ God Mode Dashboard Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
