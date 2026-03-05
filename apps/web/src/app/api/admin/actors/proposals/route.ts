import { db } from '@/lib/system/voices-config';
import { actorProfileProposals, actors, users } from '@/lib/system/voices-config';
import { eq, desc } from 'drizzle-orm';
import { NextResponse, NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

/**
 * 🛡️ HITL PROPOSALS API (v2.28.50)
 * 
 * Beheert de actor_profile_proposals voor Johfrah's HITL workflow.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const proposals = await db.select({
      id: actorProfileProposals.id,
      actorId: actorProfileProposals.actorId,
      userId: actorProfileProposals.userId,
      status: actorProfileProposals.status,
      proposalData: actorProfileProposals.proposalData,
      createdAt: actorProfileProposals.createdAt,
      actorName: actors.first_name,
      actorLastName: actors.last_name,
      userEmail: users.email
    })
    .from(actorProfileProposals)
    .leftJoin(actors, eq(actorProfileProposals.actorId, actors.id))
    .leftJoin(users, eq(actorProfileProposals.userId, users.id))
    .orderBy(desc(actorProfileProposals.createdAt));

    return NextResponse.json({ success: true, proposals });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch proposals', details: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { proposalId, action, adminNotes } = body; // action: 'approve' | 'reject'

    if (!proposalId || !action) {
      return NextResponse.json({ error: 'Missing proposalId or action' }, { status: 400 });
    }

    const [proposal] = await db.select()
      .from(actorProfileProposals)
      .where(eq(actorProfileProposals.id, proposalId))
      .limit(1);

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const adminUser = (auth as any).user;

    if (action === 'approve') {
      const data = proposal.proposalData as any;
      
      // 1. Update the main actor record
      await db.update(actors)
        .set({
          first_name: data.first_name,
          last_name: data.last_name,
          gender: data.gender,
          countryId: data.countryId,
          nativeLanguageId: data.nativeLanguageId,
          delivery_days_min: data.delivery_days_min,
          delivery_days_max: data.delivery_days_max,
          cutoff_time: data.cutoff_time,
          allow_free_trial: data.allow_free_trial,
          tagline: data.tagline,
          bio: data.bio,
          why_voices: data.why_voices,
          studio_specs: data.studio_specs,
          is_manually_edited: true,
          updatedAt: new Date()
        })
        .where(eq(actors.id, proposal.actorId));

      // 2. Handle Relations (Languages & Tones)
      const { actorLanguages, actorTones } = await import('@/lib/system/voices-config');
      
      if (data.extra_lang_ids) {
        await db.delete(actorLanguages).where(eq(actorLanguages.actorId, proposal.actorId));
        const langInserts: any[] = [];
        if (data.nativeLanguageId) {
          langInserts.push({ actorId: proposal.actorId, languageId: data.nativeLanguageId, isNative: true });
        }
        for (const langId of data.extra_lang_ids) {
          if (langId !== data.nativeLanguageId) {
            langInserts.push({ actorId: proposal.actorId, languageId: langId, isNative: false });
          }
        }
        if (langInserts.length > 0) await db.insert(actorLanguages).values(langInserts);
      }

      if (data.tone_ids) {
        await db.delete(actorTones).where(eq(actorTones.actorId, proposal.actorId));
        const toneInserts = data.tone_ids.map((id: number) => ({ actorId: proposal.actorId, toneId: id }));
        if (toneInserts.length > 0) await db.insert(actorTones).values(toneInserts);
      }

      // 3. Mark proposal as approved
      await db.update(actorProfileProposals)
        .set({
          status: 'approved',
          adminNotes,
          reviewedBy: adminUser.id,
          reviewedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(actorProfileProposals.id, proposalId));

      return NextResponse.json({ success: true, message: 'Voorstel goedgekeurd en profiel bijgewerkt.' });

    } else if (action === 'reject') {
      await db.update(actorProfileProposals)
        .set({
          status: 'rejected',
          adminNotes,
          reviewedBy: adminUser.id,
          reviewedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(actorProfileProposals.id, proposalId));

      return NextResponse.json({ success: true, message: 'Voorstel afgewezen.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Action failed', details: error.message }, { status: 500 });
  }
}
