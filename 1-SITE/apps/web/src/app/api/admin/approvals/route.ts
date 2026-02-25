import { db } from '@/lib/system/db';
import { approvalQueue } from '@/lib/system/db';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: ADMIN APPROVALS (2026)
 */

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const pending = await db.select().from(approvalQueue).where(eq(approvalQueue.status, 'pending'));
    return NextResponse.json(pending);
  } catch (error) {
    console.error('[Admin Approvals GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { id, action, reasoning } = body;

    if (!id || !action) return NextResponse.json({ error: 'ID and action are required' }, { status: 400 });

    const status = action === 'approve' ? 'approved' : 'rejected';

    await db.update(approvalQueue)
      .set({ 
        status, 
        userCorrections: reasoning,
        approvedAt: new Date() 
      })
      .where(eq(approvalQueue.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Approvals POST Error]:', error);
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 });
  }
}
