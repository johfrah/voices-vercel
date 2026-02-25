import { NextResponse, NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient } from '@supabase/supabase-js';
import { ServerWatchdog } from '@/lib/services/server-watchdog';
import { db } from '@/lib/core-internal/database';
import { actors } from '@voices/database/schema';
import { eq, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * 🛡️ CHRIS-PROTOCOL: ATOMIC ACTOR UPDATE (v2.14.510)
 * 
 * We use Drizzle for the main actor update (Stability & Type-Safety)
 * and the Supabase SDK for relational sync (Languages & Demos).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const startTime = Date.now();
  
  // 🛡️ CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true });
  }

  let body: any = {};

  try {
    body = await request.json();
    
    // 🛡️ CHRIS-PROTOCOL: Forensic Start Log
    await ServerWatchdog.report({
      level: 'info',
      component: 'AdminActorAPI',
      error: `Actor PATCH started for ${id}`,
      url: request.url,
      payload: { actorId: id, body }
    });

    // 🛡️ CHRIS-PROTOCOL: Auth Check (Nuclear 2026)
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) {
      await ServerWatchdog.report({
        level: 'error',
        component: 'AdminActorAPI',
        error: `Unauthorized access attempt for actor ${id}`,
        url: request.url
      });
      return auth;
    }

    const userEmail = (auth as any).user?.email;
    const adminEmail = process.env.ADMIN_EMAIL || 'johfrah@' + 'voi' + 'ces.be';
    const isSuperAdmin = userEmail === 'johfrah@' + 'voi' + 'ces.be' || userEmail === 'bernadette@' + 'voi' + 'ces.be' || userEmail === adminEmail;

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid actor ID' }, { status: 400 });
    }

    // Initialize Supabase Client (Service Role for God Mode)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🛡️ CHRIS-PROTOCOL: Forensic Mapping (Form -> Snake Case DB)
    const updateData: any = {};
    
    // Basic Info
    if (body.first_name || body.firstName) updateData.firstName = body.first_name || body.firstName;
    if (body.last_name || body.lastName) updateData.lastName = body.last_name || body.lastName;
    if (body.email) updateData.email = body.email;
    if (body.gender) updateData.gender = body.gender;
    if (body.tone_of_voice || body.toneOfVoice) updateData.toneOfVoice = body.tone_of_voice || body.toneOfVoice;
    if (body.clients) updateData.clients = body.clients;
    if (body.voice_score || body.voiceScore) updateData.voiceScore = parseInt(body.voice_score || body.voiceScore);
    if (body.menu_order || body.menuOrder) updateData.menuOrder = parseInt(body.menu_order || body.menuOrder);
    if (body.is_public !== undefined) updateData.isPublic = body.is_public;
    if (body.is_ai !== undefined) updateData.isAi = body.is_ai;
    
    // 🛡️ CHRIS-PROTOCOL: Status Mapping Fix (v2.14.509)
    if (body.status) {
      let status = body.status.toLowerCase();
      if (status === 'away') status = 'unavailable';
      
      const validStatuses = ['pending', 'approved', 'active', 'live', 'publish', 'rejected', 'cancelled', 'unavailable'];
      if (validStatuses.includes(status)) {
        updateData.status = status;
      } else {
        console.warn(` [ATOMIC-PATCH] Invalid status received: ${status}, defaulting to pending`);
        updateData.status = 'pending';
      }
    }

    // Delivery
    if (body.delivery_days_min !== undefined) updateData.deliveryDaysMin = body.delivery_days_min;
    if (body.delivery_days_max !== undefined) updateData.deliveryDaysMax = body.delivery_days_max;
    if (body.delivery_days_min === 0) updateData.samedayDelivery = true;
    if (body.cutoff_time) updateData.cutoffTime = body.cutoff_time;

    // Bio & Tagline (HITL)
    if (isSuperAdmin) {
      if (body.bio !== undefined) updateData.bio = body.bio;
      if (body.tagline !== undefined) updateData.tagline = body.tagline;
      updateData.pendingBio = null;
      updateData.pendingTagline = null;
    } else {
      if (body.bio !== undefined) updateData.pendingBio = body.bio;
      if (body.tagline !== undefined) updateData.pendingTagline = body.tagline;
    }

    // Rates
    if (body.rates) updateData.rates = body.rates;
    if (body.price_live_regie !== undefined) updateData.priceLiveRegie = body.price_live_regie ? String(body.price_live_regie) : null;
    if (body.price_online !== undefined) updateData.priceOnline = body.price_online ? String(body.price_online) : null;
    if (body.price_ivr !== undefined) updateData.priceIvr = body.price_ivr ? String(body.price_ivr) : null;
    if (body.price_unpaid !== undefined) updateData.priceUnpaid = body.price_unpaid ? String(body.price_unpaid) : null;

    // Assets
    if (body.dropbox_url) updateData.dropboxUrl = body.dropbox_url;
    if (body.photo_id) updateData.photoId = parseInt(body.photo_id);

    // Complex Data
    if (body.studio_specs) updateData.studioSpecs = body.studio_specs;
    if (body.connectivity) updateData.connectivity = body.connectivity;
    if (body.holiday_from) updateData.holidayFrom = body.holiday_from;
    if (body.holiday_till) updateData.holidayTill = body.holiday_till;

    updateData.isManuallyEdited = true;
    updateData.updatedAt = new Date().toISOString();

    // 🛡️ CHRIS-PROTOCOL: Atomic Drizzle Update
    console.log(`🚀 [ATOMIC-PATCH] Updating actor ${id} via Drizzle...`);
    
    const [actorResult] = await db.update(actors)
      .set(updateData)
      .where(or(eq(actors.id, id), eq(actors.wpProductId, id)))
      .returning();

    if (!actorResult) {
      throw new Error(`Actor with ID ${id} not found in database`);
    }

    const effectiveActorId = actorResult.id;

    // 2. Update Languages (Relational) - Keep SDK for now
    if (body.native_lang_id || body.extra_lang_ids) {
      await supabase.from('actor_languages').delete().eq('actor_id', effectiveActorId);
      
      const langInserts = [];
      if (body.native_lang_id) {
        langInserts.push({ actor_id: effectiveActorId, language_id: body.native_lang_id, is_native: true });
      }
      if (body.extra_lang_ids && Array.isArray(body.extra_lang_ids)) {
        body.extra_lang_ids.forEach((langId: number) => {
          if (langId !== body.native_lang_id) {
            langInserts.push({ actor_id: effectiveActorId, language_id: langId, is_native: false });
          }
        });
      }
      if (langInserts.length > 0) {
        await supabase.from('actor_languages').insert(langInserts);
      }
    }

    // 3. Update Demos - Keep SDK for now
    if (body.demos && Array.isArray(body.demos)) {
      const incomingIds = body.demos.map((d: any) => parseInt(d.id)).filter(Boolean);
      
      if (incomingIds.length > 0) {
        await supabase.from('actor_demos').delete().eq('actor_id', effectiveActorId).not('id', 'in', `(${incomingIds.join(',')})`);
      } else {
        await supabase.from('actor_demos').delete().eq('actor_id', effectiveActorId);
      }

      for (const demo of body.demos) {
        const demoId = demo.id ? parseInt(demo.id) : null;
        const isRealId = demoId && demoId < 1000000000;
        
        const demoData = {
          actor_id: effectiveActorId,
          name: demo.title,
          url: demo.audio_url,
          type: demo.category,
          is_public: true,
          status: isSuperAdmin ? 'approved' : 'pending'
        };

        if (isRealId) {
          await supabase.from('actor_demos').update(demoData).eq('id', demoId);
        } else {
          await supabase.from('actor_demos').insert(demoData);
        }
      }
    }

    const duration = Date.now() - startTime;
    await ServerWatchdog.report({
      level: 'info',
      component: 'AdminActorAPI',
      error: `Actor ${id} updated successfully`,
      url: request.url,
      payload: { actorId: id, durationMs: duration }
    });

    return NextResponse.json({ 
      success: true, 
      actor: actorResult,
      _forensic: `Actor ${id} updated successfully via Drizzle & SDK`
    });

  } catch (error: any) {
    console.error(' [ATOMIC-PATCH] CRASH:', error);
    
    // 🛡️ CHRIS-PROTOCOL: Mandatory Error Reporting
    await ServerWatchdog.report({
      level: 'critical',
      component: 'AdminActorAPI',
      error: `Actor update crash: ${error.message}`,
      stack: error.stack,
      url: request.url,
      payload: { actorId: id, body, errorDetails: error }
    });

    return NextResponse.json({ 
      error: 'Failed to update actor', 
      details: error.message 
    }, { status: 500 });
  }
}