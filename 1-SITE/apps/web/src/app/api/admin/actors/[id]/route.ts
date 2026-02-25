import { NextResponse, NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient } from '@supabase/supabase-js';
import { ServerWatchdog } from '@/lib/services/server-watchdog';

export const dynamic = 'force-dynamic';

/**
 * 🛡️ CHRIS-PROTOCOL: SUPABASE SDK ACTOR UPDATE (v2.14.517)
 * 
 * We use the Supabase SDK directly for maximum stability on Vercel.
 * This bypasses Drizzle schema resolution issues (Symbol(drizzle:Columns)).
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
    
    // 🛡️ CHRIS-PROTOCOL: Auth Check (Nuclear 2026)
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) {
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
    const sdkData: any = {};
    
    // Basic Info
    if (body.first_name) sdkData.first_name = body.first_name;
    if (body.last_name) sdkData.last_name = body.last_name;
    if (body.email) sdkData.email = body.email;
    if (body.gender) sdkData.gender = body.gender;
    if (body.tone_of_voice) sdkData.tone_of_voice = body.tone_of_voice;
    if (body.clients) sdkData.clients = body.clients;
    if (body.voice_score !== undefined) sdkData.voice_score = parseInt(body.voice_score);
    if (body.menu_order !== undefined) sdkData.menu_order = parseInt(body.menu_order);
    if (body.is_public !== undefined) sdkData.is_public = body.is_public;
    if (body.status) sdkData.status = body.status.toLowerCase();

    // Delivery
    if (body.delivery_days_min !== undefined) sdkData.delivery_days_min = body.delivery_days_min;
    if (body.delivery_days_max !== undefined) sdkData.delivery_days_max = body.delivery_days_max;
    if (body.cutoff_time) sdkData.cutoff_time = body.cutoff_time;

    // Bio & Tagline (HITL)
    if (isSuperAdmin) {
      if (body.bio !== undefined) sdkData.bio = body.bio;
      if (body.tagline !== undefined) sdkData.tagline = body.tagline;
      sdkData.pending_bio = null;
      sdkData.pending_tagline = null;
    } else {
      if (body.bio !== undefined) sdkData.pending_bio = body.bio;
      if (body.tagline !== undefined) sdkData.pending_tagline = body.tagline;
    }

    // Rates
    if (body.rates) sdkData.rates = body.rates;
    if (body.price_live_regie) sdkData.price_live_regie = String(body.price_live_regie);
    if (body.price_online) sdkData.price_online = String(body.price_online);
    if (body.price_ivr) sdkData.price_ivr = String(body.price_ivr);
    if (body.price_unpaid) sdkData.price_unpaid = String(body.price_unpaid);

    // Assets
    if (body.dropbox_url) sdkData.dropbox_url = body.dropbox_url;
    if (body.photo_id) sdkData.photo_id = parseInt(body.photo_id);

    sdkData.is_manually_edited = true;
    sdkData.updated_at = new Date().toISOString();

    // 1. Update Actor Profile
    const { data: actorResult, error: actorError } = await supabase
      .from('actors')
      .update(sdkData)
      .or(`id.eq.${id},wp_product_id.eq.${id}`)
      .select()
      .single();

    if (actorError) {
      throw new Error(`Database update failed: ${actorError.message}`);
    }

    const effectiveActorId = actorResult.id;

    // 2. Update Languages (Relational)
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

    // 3. Update Demos
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
          name: demo.title || demo.name,
          url: demo.audio_url || demo.url,
          type: demo.category || demo.type,
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

    return NextResponse.json({ 
      success: true, 
      actor: actorResult,
      _forensic: `Actor ${id} updated successfully via Supabase SDK`
    });

  } catch (error: any) {
    console.error(' [SDK-PATCH] CRASH:', error);
    
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
