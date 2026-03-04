import { db, workshopInterest, workshopInterestProducts } from '@/lib/system/voices-config';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Workshop Interest API (Chatty's mandate)
 * Council: no world_id until DB migration, safe getSupabase(), duplicate email → 400,
 * workshop_interest_products + phone/preferred_dates/how_heard/expectations.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      selectedWorkshops,
      skills_to_sharpen,
      profession,
      age,
      experience,
      goal,
      expectations,
      preferred_dates,
      how_heard,
      worldId
    } = body;

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'Voornaam, familienaam en e-mail zijn verplicht.' },
        { status: 400 }
      );
    }

    const productIds = Array.isArray(selectedWorkshops)
      ? selectedWorkshops.join(',')
      : '';

    const iapContext: Record<string, unknown> = {};
    if (Array.isArray(skills_to_sharpen) && skills_to_sharpen.length > 0) {
      iapContext.skills_to_sharpen = skills_to_sharpen.filter((s: unknown) => typeof s === 'string');
    }
    if (typeof expectations === 'string' && expectations.trim()) {
      iapContext.expectations = expectations.trim();
    }
    const iapContextOrNull = Object.keys(iapContext).length > 0 ? iapContext : null;

    const activeWorldId = worldId ?? 2;

    function getSupabase() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) return null;
      return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    }

    let resultId: number | null = null;

    try {
      if (!db || !workshopInterest) throw new Error('Database not available');
      const [result] = await db
        .insert(workshopInterest)
        .values({
          first_name: String(first_name).trim(),
          last_name: String(last_name).trim(),
          email: String(email).trim(),
          phone: phone?.trim() || null,
          profession: profession?.trim() || null,
          age: age ? parseInt(String(age), 10) : null,
          experience: experience?.trim() || null,
          goal: goal?.trim() || null,
          productIds: productIds || null,
          iapContext: iapContextOrNull ?? undefined,
          preferredDates: preferred_dates?.trim() || null,
          howHeard: how_heard?.trim() || null,
          sourceUrl:
            typeof request.headers.get('referer') === 'string'
              ? request.headers.get('referer')
              : null,
          status: 'pending',
          optOutToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          createdAt: new Date()
        })
        .returning();
      resultId = result.id;

      if (resultId && workshopInterestProducts && Array.isArray(selectedWorkshops) && selectedWorkshops.length > 0) {
        const workshopIds = selectedWorkshops
          .map((id: string | number) => (typeof id === 'string' ? parseInt(id, 10) : id))
          .filter((n: number) => !Number.isNaN(n) && n > 0);
        for (const wid of workshopIds) {
          try {
            await db.insert(workshopInterestProducts).values({
              interestId: resultId,
              workshopId: wid,
              createdAt: new Date()
            });
          } catch (e) {
            console.warn('[Workshop Interest] workshop_interest_products insert failed for workshop', wid, e);
          }
        }
      }
    } catch (dbError: unknown) {
      const errMsg = (dbError as Error)?.message ?? String(dbError);
      if (/duplicate key|unique constraint|already exists/i.test(errMsg)) {
        return NextResponse.json(
          { error: 'Dit e-mailadres is al geregistreerd voor workshop-interesse.' },
          { status: 400 }
        );
      }
      console.warn('[Workshop Interest] Drizzle failed, falling back to Supabase SDK:', dbError);
      const supabase = getSupabase();
      if (!supabase) {
        return NextResponse.json(
          { error: 'Er is iets misgegaan. Probeer het later opnieuw.' },
          { status: 503 }
        );
      }
      const { data: sdkResult, error: sdkError } = await supabase
        .from('workshop_interest')
        .insert({
          first_name: String(first_name).trim(),
          last_name: String(last_name).trim(),
          email: String(email).trim(),
          phone: phone?.trim() || null,
          profession: profession?.trim() || null,
          age: age ? parseInt(String(age), 10) : null,
          experience: experience?.trim() || null,
          goal: goal?.trim() || null,
          product_ids: productIds || null,
          iap_context: iapContextOrNull,
          preferred_dates: preferred_dates?.trim() || null,
          how_heard: how_heard?.trim() || null,
          source_url: request.headers.get('referer'),
          status: 'pending',
          opt_out_token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          created_at: new Date()
        })
        .select()
        .single();

      if (sdkError) {
        if (sdkError.code === '23505' || /duplicate|unique/i.test(sdkError.message)) {
          return NextResponse.json(
            { error: 'Dit e-mailadres is al geregistreerd voor workshop-interesse.' },
            { status: 400 }
          );
        }
        throw sdkError;
      }
      resultId = sdkResult?.id ?? null;

      if (resultId && Array.isArray(selectedWorkshops) && selectedWorkshops.length > 0) {
        const workshopIds = selectedWorkshops
          .map((id: string | number) => (typeof id === 'string' ? parseInt(id, 10) : id))
          .filter((n: number) => !Number.isNaN(n) && n > 0);
        for (const wid of workshopIds) {
          try {
            await supabase.from('workshop_interest_products').insert({
              interest_id: resultId,
              workshop_id: wid,
              created_at: new Date()
            });
          } catch (e) {
            console.warn('[Workshop Interest] workshop_interest_products insert failed for workshop', wid, e);
          }
        }
      }
    }

    const supabaseForEvent = getSupabase();
    if (supabaseForEvent) {
      try {
        await supabaseForEvent.from('system_events').insert({
          source: 'workshop_interest_api',
          level: 'info',
          world_id: activeWorldId,
          message: `Workshop interest: ${email} voor ${productIds || 'geen workshops'}`,
          details: { interestId: resultId },
          created_at: new Date()
        });
      } catch (e) {
        console.warn('[Workshop Interest] Failed to log event:', e);
      }
    }

    return NextResponse.json({
      success: true,
      id: resultId
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Workshop Interest] API error:', msg, error);
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: 'Er is iets misgegaan. Probeer het later opnieuw.',
        ...(isDev && { debug: msg })
      },
      { status: 500 }
    );
  }
}
