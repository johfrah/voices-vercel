import { NextRequest, NextResponse } from 'next/server';
import { db, actors } from '@/lib/system/voices-config';
import { eq, sql } from 'drizzle-orm';
import { createClient as createServerClient } from '@/utils/supabase/server';

/**
 *  ACTOR SELF-SERVICE API (GODMODE)
 * 
 * Doel: Stemacteurs de controle geven over hun eigen data (vakantie, tarieven, demo's).
 */

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { actorId, availability, rates, bio, tagline } = body;

    if (!actorId) return NextResponse.json({ error: 'actorId required' }, { status: 400 });
    const parsedActorId = Number(actorId);
    if (!Number.isFinite(parsedActorId) || parsedActorId <= 0) {
      return NextResponse.json({ error: 'actorId invalid' }, { status: 400 });
    }

    const requester = await resolveRequester();
    if (!requester) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const allowed = await canAccessActor(parsedActorId, requester);
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    //  NUCLEAR LOCK: Alleen updaten als niet handmatig gelockt door admin
    const [actor] = await db.select().from(actors).where(eq(actors.id, parsedActorId)).limit(1);
    if (actor?.is_manually_edited) {
      return NextResponse.json({ error: 'Actor profile is locked by admin' }, { status: 403 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (availability) updateData.availability = availability;
    if (rates) updateData.rates = rates;
    if (bio) updateData.pending_bio = bio; // Gaat naar pending voor review
    if (tagline) updateData.pending_tagline = tagline;

    await db.update(actors).set(updateData).where(eq(actors.id, parsedActorId));

    return NextResponse.json({ success: true, message: 'Profile update submitted' });
  } catch (error) {
    console.error('[Actor Self-Service Error]:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const actorId = searchParams.get('actorId');

  if (!actorId) return NextResponse.json({ error: 'actorId required' }, { status: 400 });
  const parsedActorId = Number(actorId);
  if (!Number.isFinite(parsedActorId) || parsedActorId <= 0) {
    return NextResponse.json({ error: 'actorId invalid' }, { status: 400 });
  }

  const requester = await resolveRequester();
  if (!requester) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const allowed = await canAccessActor(parsedActorId, requester);
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const actorResult: any = await db.execute(sql`
    select
      id,
      user_id,
      first_name,
      last_name,
      email,
      status,
      is_public,
      availability,
      rates,
      pending_bio,
      pending_tagline,
      is_manually_edited,
      updated_at
    from actors
    where id = ${parsedActorId}
    limit 1
  `);
  const actorRows = normalizeRows(actorResult);
  const actorData = actorRows[0] || null;

  if (!actorData) {
    return NextResponse.json({ error: 'Actor not found' }, { status: 404 });
  }

  const demosResult: any = await db.execute(sql`
    select
      id,
      actor_id,
      wp_id,
      media_id,
      name,
      url,
      type,
      is_public,
      menu_order
    from actor_demos
    where actor_id = ${parsedActorId}
    order by menu_order asc nulls last, id asc
  `);
  const dialectsResult: any = await db.execute(sql`
    select
      id,
      actor_id,
      dialect,
      proficiency,
      created_at
    from actor_dialects
    where actor_id = ${parsedActorId}
    order by id asc
  `);

  const payload = {
    ...actorData,
    demos: normalizeRows(demosResult),
    dialects: normalizeRows(dialectsResult),
  };

  return NextResponse.json(payload);
}

type Requester = {
  id: number;
  role: string | null;
};

async function resolveRequester(): Promise<Requester | null> {
  const supabase = createServerClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  const authUser = data?.user;
  if (!authUser?.email) return null;

  const queryResult: any = await db.execute(sql`
    select id, role
    from users
    where lower(email) = lower(${authUser.email})
    limit 1
  `);
  const rows = Array.isArray(queryResult)
    ? queryResult
    : Array.isArray(queryResult?.rows)
      ? queryResult.rows
      : [];

  if (!rows[0]) return null;
  return {
    id: Number(rows[0].id),
    role: rows[0].role ? String(rows[0].role) : null,
  };
}

async function canAccessActor(actorId: number, requester: Requester): Promise<boolean> {
  const role = String(requester.role || '').toLowerCase();
  if (role === 'admin' || role === 'superadmin' || role === 'ademing_admin') {
    return true;
  }

  const queryResult: any = await db.execute(sql`
    select user_id
    from actors
    where id = ${actorId}
    limit 1
  `);
  const rows = Array.isArray(queryResult)
    ? queryResult
    : Array.isArray(queryResult?.rows)
      ? queryResult.rows
      : [];

  const actorUserId = Number(rows[0]?.user_id || 0);
  return actorUserId > 0 && actorUserId === requester.id;
}

function normalizeRows(result: any): any[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.rows)) return result.rows;
  return [];
}
