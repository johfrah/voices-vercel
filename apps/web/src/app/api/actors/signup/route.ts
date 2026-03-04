import { generateSlug } from '@/lib/system/slug';
import { actorDemos, actorLanguages, actors, actorStatuses, actorTones, actorVideos, centralLeads, db } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

/**
 * HITL ACTOR SIGNUP API (CHRIS-PROTOCOL)
 *
 * Nieuwe stemacteurs worden als status='pending' en is_public=false opgeslagen.
 * Admin moet expliciet goedkeuren (live zetten) na verificatie.
 * Stap 1 = alle gegevens, Stap 2 = rates; beide in één POST.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      first_name,
      last_name,
      email,
      gender,
      country_id,
      native_lang_id,
      extra_lang_ids,
      tone_ids,
      delivery_days_min,
      delivery_days_max,
      cutoff_time,
      allow_free_trial,
      price_online,
      price_unpaid,
      price_ivr,
      price_live_regie,
      tone_of_voice,
      extra_langs,
      photo_id,
      demo_media_id,
      demo_url,
      tagline,
      bio,
      why_voices,
      video_url,
      video_name,
      studio_specs,
      is_enrichment,
      userId
    } = body;

    if (!first_name?.trim() || !last_name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Voornaam, familienaam en e-mail zijn verplicht.' },
        { status: 400 }
      );
    }

    // 🛡️ CHRIS-PROTOCOL: Enrichment Logic (v2.28.49)
    // Now using a Staging Area (actor_profile_proposals) for HITL approval.
    if (is_enrichment && userId) {
      const actorIdResult = await db.select({ id: actors.id }).from(actors).where(eq(actors.userId, userId)).limit(1);
      const actorId = actorIdResult[0]?.id;

      if (actorId) {
        const proposalData = {
          first_name: first_name.trim(),
          last_name: last_name?.trim() || null,
          gender: gender || null,
          countryId: country_id ? parseInt(String(country_id), 10) : null,
          nativeLanguageId: native_lang_id ? parseInt(String(native_lang_id), 10) : null,
          delivery_days_min: delivery_days_min != null ? parseInt(String(delivery_days_min), 10) : 1,
          delivery_days_max: delivery_days_max != null ? parseInt(String(delivery_days_max), 10) : 3,
          cutoff_time: cutoff_time || '18:00',
          allow_free_trial: allow_free_trial !== false,
          tagline: tagline?.trim() || null,
          bio: bio?.trim() || null,
          why_voices: why_voices?.trim() || null,
          studio_specs: studio_specs || null,
          extra_lang_ids: extra_lang_ids || [],
          tone_ids: tone_ids || []
        };

        // Insert into Staging Area instead of direct update
        const { actorProfileProposals } = await import('@/lib/system/voices-config');
        await db.insert(actorProfileProposals).values({
          actorId: actorId,
          userId: userId,
          status: 'pending',
          proposalData: proposalData
        });

        return NextResponse.json({
          success: true,
          message: 'Bedankt! Je wijzigingen zijn ontvangen en worden door Johfrah gecontroleerd voordat ze live gaan.',
        });
      }
    }

    const baseSlug = generateSlug(`${first_name.trim()} ${(last_name || '').trim()}`.trim()) || `actor-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 0;
    while (true) {
      const existing = await db.select({ id: actors.id }).from(actors).where(eq(actors.slug, slug)).limit(1);
      if (existing.length === 0) break;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    let statusId: number | null = null;
    if (actorStatuses) {
      const [pendingRow] = await db.select().from(actorStatuses).where(eq(actorStatuses.code, 'pending')).limit(1);
      statusId = pendingRow?.id ?? null;
    }

    const globalRates: Record<string, string | number> = {};
    globalRates.online = '249';
    globalRates.ivr = '89';
    if (price_unpaid != null && price_unpaid !== '') globalRates.unpaid = String(price_unpaid);
    if (price_live_regie != null && price_live_regie !== '') globalRates.live_regie = String(price_live_regie);

    const insertPayload: Record<string, unknown> = {
      first_name: first_name.trim(),
      last_name: last_name?.trim() || null,
      email: email.trim().toLowerCase(),
      gender: gender || null,
      countryId: country_id ? parseInt(String(country_id), 10) : null,
      nativeLanguageId: native_lang_id ? parseInt(String(native_lang_id), 10) : null,
      delivery_days_min: delivery_days_min != null ? parseInt(String(delivery_days_min), 10) : 1,
      delivery_days_max: delivery_days_max != null ? parseInt(String(delivery_days_max), 10) : 3,
      cutoff_time: cutoff_time || '18:00',
      allow_free_trial: allow_free_trial !== false,
      extra_langs: extra_langs ?? (Array.isArray(extra_lang_ids) ? JSON.stringify(extra_lang_ids) : null),
      tone_of_voice: tone_of_voice ?? (Array.isArray(tone_ids) ? tone_ids.join(',') : null),
      slug,
      status: 'pending',
      ...(statusId != null && { statusId }),
      is_public: false,
      is_manually_edited: false,
      voice_score: 10,
      menu_order: 0,
      ...(Object.keys(globalRates).length > 0 && { rates: { GLOBAL: globalRates } }),
    };

    if (tagline != null && String(tagline).trim()) {
      insertPayload.tagline = String(tagline).trim();
    }
    if (bio != null && String(bio).trim()) {
      insertPayload.bio = String(bio).trim();
    }
    if (why_voices != null && String(why_voices).trim()) {
      insertPayload.why_voices = String(why_voices).trim();
    }
    if (studio_specs != null && typeof studio_specs === 'object') {
      const cleaned: Record<string, string> = {};
      const keys = ['microphone', 'preamp', 'interface', 'booth'];
      for (const k of keys) {
        const v = (studio_specs as Record<string, unknown>)[k];
        if (v != null && String(v).trim()) cleaned[k] = String(v).trim();
      }
      if (Object.keys(cleaned).length > 0) {
        insertPayload.studio_specs = cleaned;
      }
    }

    if (photo_id != null && photo_id !== '' && Number(photo_id) > 0) {
      insertPayload.photo_id = Number(photo_id);
    }
    insertPayload.price_online = '249';
    insertPayload.price_ivr = '89';
    if (price_unpaid != null && price_unpaid !== '') insertPayload.price_unpaid = String(price_unpaid);
    if (price_live_regie != null && price_live_regie !== '') insertPayload.price_live_regie = String(price_live_regie);

    const [actor] = await db.insert(actors).values(insertPayload as any).returning();

    if (!actor?.id) {
      return NextResponse.json({ error: 'Aanmaken profiel mislukt.' }, { status: 500 });
    }

    if (centralLeads) {
      try {
        await db.insert(centralLeads).values({
          email: email.trim().toLowerCase(),
          first_name: first_name.trim(),
          last_name: last_name?.trim() || null,
          sourceType: 'actor_signup',
          leadVibe: 'warm',
        });
      } catch (leadErr) {
        console.warn('[ActorSignup] central_leads insert skipped:', leadErr);
      }
    }

    if (actorDemos && demo_media_id != null && Number(demo_media_id) > 0 && demo_url) {
      try {
        await db.insert(actorDemos).values({
          actorId: actor.id,
          mediaId: Number(demo_media_id),
          name: 'Demo',
          url: String(demo_url),
          is_public: false,
        });
      } catch (demoErr) {
        console.warn('[ActorSignup] actor_demos insert skipped:', demoErr);
      }
    }

    if (actorLanguages) {
      try {
        const nativeId = native_lang_id ? parseInt(String(native_lang_id), 10) : null;
        if (nativeId) {
          await db.insert(actorLanguages).values({
            actorId: actor.id,
            languageId: nativeId,
            isNative: true,
          });
        }
        const extraIds = Array.isArray(extra_lang_ids) ? extra_lang_ids.map((id: unknown) => parseInt(String(id), 10)).filter((n: number) => !isNaN(n)) : [];
        for (const langId of extraIds) {
          if (langId && langId !== nativeId) {
            await db.insert(actorLanguages).values({
              actorId: actor.id,
              languageId: langId,
              isNative: false,
            }).catch(() => {});
          }
        }
      } catch (langErr) {
        console.warn('[ActorSignup] actor_languages insert skipped:', langErr);
      }
    }

    if (actorTones && Array.isArray(tone_ids) && tone_ids.length > 0) {
      try {
        for (const toneId of tone_ids) {
          const id = parseInt(String(toneId), 10);
          if (!isNaN(id)) {
            await db.insert(actorTones).values({
              actorId: actor.id,
              toneId: id,
            }).catch(() => {});
          }
        }
      } catch (toneErr) {
        console.warn('[ActorSignup] actor_tones insert skipped:', toneErr);
      }
    }

    if (actorVideos && video_url != null && String(video_url).trim()) {
      try {
        const url = String(video_url).trim();
        const name = (video_name != null && String(video_name).trim()) ? String(video_name).trim() : 'Video';
        const type = url.includes('youtube.com') || url.includes('youtu.be') ? 'youtube' : url.includes('vimeo.com') ? 'vimeo' : 'url';
        await db.insert(actorVideos).values({
          actorId: actor.id,
          name,
          url,
          type,
          is_public: false,
        });
      } catch (videoErr) {
        console.warn('[ActorSignup] actor_videos insert skipped:', videoErr);
      }
    }

    return NextResponse.json({
      success: true,
      actor_id: actor.id,
      message: 'Je profiel is ontvangen. We nemen na verificatie contact met je op.',
    });
  } catch (error) {
    console.error('[ActorSignup] Error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}
