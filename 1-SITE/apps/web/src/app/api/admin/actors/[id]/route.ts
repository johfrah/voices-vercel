import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/sync/bridge';
import { actors } from '@db/schema';
import { eq, or } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

/**
 *  ADMIN ACTOR UPDATE API (GOD MODE 2026)
 * 
 * Verwerkt real-time updates voor stemacteurs.
 * Alleen toegankelijk voor admins.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(` ADMIN: PATCH request received for actor ${params.id}`);
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true });
  }

  const id = parseInt(params.id);
  
  try {
    //  CHRIS-PROTOCOL: Forensic validation
    const body = await request.json();
    
    // 🛡️ CHRIS-PROTOCOL: Nuclear Version Guard (v2.14.184)
    // Detect version mismatch from headers or payload to prevent "cache slop"
    const clientVersion = request.headers.get('X-Voices-Version') || body._version;
    const serverVersion = '2.14.184';
    
    if (clientVersion && clientVersion !== serverVersion) {
      console.warn(` [Version Guard] Mismatch detected: Client ${clientVersion} vs Server ${serverVersion}`);
      // We don't block yet, but we log it for forensic analysis
    }

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid actor ID' }, { status: 400 });
    }

    console.log(` ADMIN: Updating actor ${id}`, body);
    console.log(` ADMIN: Full request body for actor ${id}:`, JSON.stringify(body, null, 2));

    //  CHRIS-PROTOCOL: Auth Check (Nuclear 2026)
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) {
      console.warn(` ADMIN: Unauthorized update attempt for actor ${id}`);
      return auth;
    }

    const isSuperAdmin = true; // In development/admin context we assume super-admin for now, but logic is ready

    // 🛡️ CHRIS-PROTOCOL: Forensic sanitization of photo URL (v2.14.162)
    // We must ensure the proxy prefix is stripped before saving to the database
    // to maintain asset-path integrity.
    let cleanPhotoUrl = body.photo_url || body.dropboxUrl;
    if (cleanPhotoUrl && cleanPhotoUrl.includes('/api/proxy/?path=')) {
      cleanPhotoUrl = decodeURIComponent(cleanPhotoUrl.split('/api/proxy/?path=')[1]);
    }

    const updateData: any = {
      firstName: body.firstName || body.first_name,
      lastName: body.lastName || body.last_name,
      email: body.email,
      gender: body.gender,
      experienceLevel: body.experienceLevel,
      toneOfVoice: body.tone_of_voice,
      clients: body.clients,
      voiceScore: body.voice_score,
      menuOrder: body.menu_order,
      status: body.status,
      isPublic: body.is_public !== undefined ? body.is_public : (body.status === 'live'),
      deliveryDaysMin: body.delivery_days === 0 ? 0 : (body.delivery_days || body.delivery_days_min),
      deliveryDaysMax: body.delivery_days || body.delivery_days_max,
      samedayDelivery: body.delivery_days === 0 || body.delivery_days_min === 0,
      cutoffTime: body.cutoff_time,
      nativeLang: body.native_lang,
      extraLangs: body.extra_langs,
      dropboxUrl: cleanPhotoUrl,
      photoId: (body.photo_id && body.photo_id !== 0) ? body.photo_id : (body.photoId !== undefined ? body.photoId : undefined),
      studioSpecs: body.studioSpecs || undefined,
      connectivity: body.connectivity || undefined,
      website: body.website,
      youtubeUrl: body.youtubeUrl || body.youtube_url,
      linkedin: body.linkedin,
      allowFreeTrial: body.allowFreeTrial ?? body.allow_free_trial,
      isManuallyEdited: true, 
      updatedAt: new Date().toISOString()
    };

    //  CHRIS-PROTOCOL: HITL for Bio & Tagline
    if (isSuperAdmin) {
      updateData.bio = body.bio;
      updateData.tagline = body.tagline;
      updateData.pendingBio = null;
      updateData.pendingTagline = null;
    } else {
      // Store in pending for admin review
      updateData.pendingBio = body.bio;
      updateData.pendingTagline = body.tagline;
      console.log(` ADMIN: Text changes (bio/tagline) stored in pending for actor ${id}`);
    }

    //  CHRIS-PROTOCOL: Price Approval Logic (2026)
    const hasPriceChanges = body.rates || body.price_live_regie || body.price_online || body.price_ivr || body.price_unpaid;
    
    if (hasPriceChanges) {
      if (isSuperAdmin) {
        // Direct update for super-admins
        updateData.rates = body.rates || undefined;
        updateData.priceLiveRegie = body.price_live_regie ? String(body.price_live_regie) : undefined;
        updateData.priceOnline = body.price_online ? String(body.price_online) : undefined;
        updateData.priceIvr = body.price_ivr ? String(body.price_ivr) : undefined;
        updateData.priceUnpaid = body.price_unpaid ? String(body.price_unpaid) : undefined;
        
        // Clear pending if any
        updateData.pendingRates = null;
        updateData.pendingPriceLiveRegie = null;
      } else {
        // Store in pending fields for admin approval
        updateData.pendingRates = body.rates || undefined;
        updateData.pendingPriceLiveRegie = body.price_live_regie ? String(body.price_live_regie) : undefined;
        console.log(` ADMIN: Price changes detected for actor ${id}. Stored in pending fields.`);
      }
    }

    // 🛡️ CHRIS-PROTOCOL: Map language IDs to strings if provided (v2.14.130)
    if (body.native_lang_id || body.extra_lang_ids) {
      try {
        const { languages } = await import('@db/schema');
        const { inArray } = await import('drizzle-orm');
        
        const langIds = [body.native_lang_id, ...(body.extra_lang_ids || [])].filter(Boolean);
        if (langIds.length > 0) {
          // Check if db is available
          if (!db) throw new Error('Database connection unavailable');
          
          const dbLangs = await db.select().from(languages).where(inArray(languages.id, langIds as number[]));
          
          if (body.native_lang_id) {
            const native = dbLangs.find((l: any) => l.id === body.native_lang_id);
            if (native) {
              updateData.nativeLang = native.code;
            }
          }
          
          if (body.extra_lang_ids) {
            const extras = dbLangs.filter((l: any) => body.extra_lang_ids.includes(l.id));
            updateData.extraLangs = extras.map((l: any) => l.code).join(', ');
          }
        }
      } catch (langErr: any) {
        console.warn(' ADMIN: Language ID mapping failed:', langErr.message);
      }
    }

    console.log(` ADMIN: Update data for actor ${id}:`, JSON.stringify(updateData, null, 2));
      // Update the actor in the database
      const result = await db.update(actors)
      .set(updateData)
        .where(or(eq(actors.id, id), eq(actors.wpProductId, id)))
        .returning({
          id: actors.id,
          wpProductId: actors.wpProductId,
          slug: actors.slug,
          firstName: actors.firstName,
          lastName: actors.lastName,
          email: actors.email,
          status: actors.status,
          photoId: actors.photoId,
          photo_url: actors.dropboxUrl, // Return the latest photo_url/dropboxUrl
          native_lang: actors.nativeLang,
          updatedAt: actors.updatedAt
        });

    if (!result || result.length === 0) {
      console.error(` ADMIN: Actor ${id} not found in database`);
      
      // 🛡️ CHRIS-PROTOCOL: Report server-side error to Watchdog
      const { ServerWatchdog } = await import('@/lib/services/server-watchdog');
      await ServerWatchdog.report({
        error: `Actor update failed: Actor ${id} not found in database`,
        component: 'AdminActorAPI',
        url: request.url,
        level: 'error'
      });

      return NextResponse.json({ error: 'Actor not found' }, { status: 404 });
    }

    const effectiveActorId = result[0].id;

    // 🛡️ CHRIS-PROTOCOL: Update actor_languages relationships (v2.14.133)
    if (body.native_lang_id || body.extra_lang_ids) {
      try {
        const { actorLanguages } = await import('@db/schema');
        
        // 1. Verwijder bestaande relaties voor deze acteur
        await db.delete(actorLanguages).where(eq(actorLanguages.actorId, effectiveActorId));
        
        // 2. Voeg nieuwe relaties toe
        if (body.native_lang_id) {
          await db.insert(actorLanguages).values({
            actorId: effectiveActorId,
            languageId: body.native_lang_id,
            isNative: true
          });
        }
        
        if (body.extra_lang_ids && Array.isArray(body.extra_lang_ids)) {
          for (const langId of body.extra_lang_ids) {
            if (langId === body.native_lang_id) continue;
            await db.insert(actorLanguages).values({
              actorId: effectiveActorId,
              languageId: langId,
              isNative: false
            }).onConflictDoNothing();
          }
        }
        console.log(` ADMIN: Language relationships updated for actor ${effectiveActorId}`);
      } catch (relErr: any) {
        console.error(' ADMIN: Language relationship update failed:', relErr.message);
      }
    }

    //  CHRIS-PROTOCOL: Update demos if provided
    if (body.demos && Array.isArray(body.demos)) {
      const { actorDemos } = await import('@db/schema');
      
      // 1. Get existing demos to find which ones to delete
      const existingDemos = await db.select().from(actorDemos).where(eq(actorDemos.actorId, effectiveActorId));
      const incomingIds = body.demos
        .filter((d: any) => d.id && (typeof d.id === 'number' || !isNaN(parseInt(d.id))))
        .map((d: any) => parseInt(d.id));
      
      // 2. Delete removed demos
      for (const existing of existingDemos) {
        if (!incomingIds.includes(existing.id)) {
          await db.delete(actorDemos).where(eq(actorDemos.id, existing.id));
        }
      }

      // 3. Upsert demos
      for (const demo of body.demos) {
        const demoId = demo.id ? parseInt(demo.id) : null;
        const isRealId = demoId && demoId < 1000000000;
        
        if (isRealId && existingDemos.find((d: any) => d.id === demoId)) {
          // Update (keep existing status unless super-admin)
          await db.update(actorDemos)
            .set({ 
              name: demo.title,
              url: demo.audio_url,
              type: demo.category 
            })
            .where(eq(actorDemos.id, demoId));
        } else {
          // Insert new (HITL: default to 'pending' for actors, 'approved' for super-admin)
          const isSuperAdmin = true; // Temporary for dev
          await db.insert(actorDemos).values({
            actorId: effectiveActorId,
            name: demo.title,
            url: demo.audio_url,
            type: demo.category,
            isPublic: true,
            status: isSuperAdmin ? 'approved' : 'pending'
          });
        }
      }
    }

    //  CHRIS-PROTOCOL: Update actor_videos if provided
    if (body.actor_videos && Array.isArray(body.actor_videos)) {
      const { actorVideos } = await import('@db/schema');
      
      // 1. Get existing videos to find which ones to delete
      const existingVideos = await db.select().from(actorVideos).where(eq(actorVideos.actorId, effectiveActorId));
      const incomingIds = body.actor_videos
        .filter((v: any) => v.id && (typeof v.id === 'number' || !isNaN(parseInt(v.id))))
        .map((v: any) => parseInt(v.id));
      
      // 2. Delete removed videos
      for (const existing of existingVideos) {
        if (!incomingIds.includes(existing.id)) {
          await db.delete(actorVideos).where(eq(actorVideos.id, existing.id));
        }
      }

      // 3. Upsert videos
      for (const video of body.actor_videos) {
        const videoId = video.id ? parseInt(video.id) : null;
        const isRealId = videoId && videoId < 1000000000; 

        if (isRealId && existingVideos.find((v: any) => v.id === videoId)) {
          // Update
          await db.update(actorVideos)
            .set({ 
              name: video.name,
              url: video.url,
              type: video.type || 'portfolio'
            })
            .where(eq(actorVideos.id, videoId));
        } else {
          // Insert new (HITL: default to 'pending' for actors, 'approved' for super-admin)
          const isSuperAdmin = true; // Temporary for dev
          await db.insert(actorVideos).values({
            actorId: effectiveActorId,
            name: video.name,
            url: video.url,
            type: video.type || 'portfolio',
            status: isSuperAdmin ? 'approved' : 'pending'
          });
        }
      }
    }

    //  CHRIS-PROTOCOL: Update reviews if provided
    if (body.reviews && Array.isArray(body.reviews)) {
      const { reviews } = await import('@db/schema');
      
      // 1. Get existing reviews for this actor/business
      // For actors, we use businessSlug = actor.slug
      const actorSlug = result[0].slug;
      if (actorSlug) {
        const existingReviews = await db.select().from(reviews).where(eq(reviews.businessSlug, actorSlug));
        const incomingIds = body.reviews
          .filter((r: any) => r.id && (typeof r.id === 'number' || !isNaN(parseInt(r.id))))
          .map((r: any) => parseInt(r.id));
        
        // 2. Delete removed reviews (only manual ones, we don't delete google ones unless requested)
        for (const existing of existingReviews) {
          if (!incomingIds.includes(existing.id) && existing.provider === 'manual') {
            await db.delete(reviews).where(eq(reviews.id, existing.id));
          }
        }

        // 3. Upsert reviews
        for (const review of body.reviews) {
          const reviewId = review.id ? parseInt(review.id) : null;
          const isRealId = reviewId && reviewId < 1000000000;

          if (isRealId && existingReviews.find((r: any) => r.id === reviewId)) {
            // Update
            await db.update(reviews)
              .set({ 
                authorName: review.author_name || review.authorName,
                textNl: review.text_nl || review.textNl,
                rating: review.rating,
                updatedAt: new Date().toISOString()
              })
              .where(eq(reviews.id, reviewId));
          } else {
            // Insert new
            await db.insert(reviews).values({
              businessSlug: actorSlug,
              authorName: review.author_name || review.authorName,
              textNl: review.text_nl || review.textNl,
              rating: review.rating,
              provider: review.provider || 'manual',
              language: 'nl'
            });
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      actor: result[0],
      _forensic: `Actor ${id} updated successfully by admin`
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });

    } catch (error: any) {
    console.error(' ADMIN UPDATE FAILURE:', error);

    // 🛡️ CHRIS-PROTOCOL: Report server-side error to Watchdog
    try {
      const { ServerWatchdog } = await import('@/lib/services/server-watchdog');
      await ServerWatchdog.report({
        error: `Actor update crash: ${error.message}`,
        stack: error.stack,
        component: 'AdminActorAPI',
        url: request.url,
        level: 'critical',
        payload: body,
        schema: 'actors'
      });
    } catch (reportErr) {
      console.error(' ADMIN: Failed to report crash to Watchdog:', reportErr);
    }

    return NextResponse.json({ 
      error: 'Failed to update actor', 
      details: error.message 
    }, { status: 500 });
  }
}
