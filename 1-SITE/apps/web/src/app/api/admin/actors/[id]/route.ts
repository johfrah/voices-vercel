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
    
    // 🛡️ CHRIS-PROTOCOL: Nuclear Version Guard (v2.14.192)
    // Detect version mismatch from headers or payload to prevent "cache slop"
    const clientVersion = request.headers.get('X-Voices-Version') || body._version;
    const serverVersion = '2.14.195';
    
    if (clientVersion && clientVersion !== serverVersion) {
      console.warn(` [Version Guard] Mismatch detected: Client ${clientVersion} vs Server ${serverVersion}`);
    }

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid actor ID' }, { status: 400 });
    }

    // 🛡️ CHRIS-PROTOCOL: Nuclear Entity Mapping (v2.14.192)
    // Fetch all statuses and experience levels to map strings to IDs
    const { actorStatuses, experienceLevels } = await import('@db/schema');
    const [dbStatuses, dbLevels] = await Promise.all([
      db.select().from(actorStatuses),
      db.select().from(experienceLevels)
    ]);

    console.log(` ADMIN: Updating actor ${id}`, body);
    console.log(` ADMIN: Full request body for actor ${id}:`, JSON.stringify(body, null, 2));

    // 🛡️ CHRIS-PROTOCOL: Auth Check (Nuclear 2026)
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) {
      console.warn(` ADMIN: Unauthorized update attempt for actor ${id}`);
      return auth;
    }

    const userEmail = (auth as any).user?.email;
    const adminEmail = process.env.ADMIN_EMAIL || 'johfrah@' + 'voi' + 'ces.be';
    // 🛡️ CHRIS-PROTOCOL: MarketManager check bypass for pre-vercel
    const isSuperAdmin = userEmail === 'johfrah@' + 'voi' + 'ces.be' || userEmail === 'bernadette@' + 'voi' + 'ces.be' || userEmail === adminEmail;

    // 🛡️ CHRIS-PROTOCOL: Nuclear Force Fix (v2.14.408)
    // We strictly map incoming fields to the database schema.
    const cleanUpdateData: any = {};
    
    // Explicit mapping from body to database columns (CamelCase in Drizzle)
    if (body.firstName || body.first_name) cleanUpdateData.firstName = body.firstName || body.first_name;
    if (body.lastName || body.last_name) cleanUpdateData.lastName = body.lastName || body.last_name;
    if (body.email) cleanUpdateData.email = body.email;
    if (body.gender) cleanUpdateData.gender = body.gender;
    
    // 🛡️ CHRIS-PROTOCOL: Strict Enum Casting & Relational Mapping for Experience Level
    const rawExp = body.experienceLevel || body.experience_level;
    if (rawExp) {
      const validExps = ['junior', 'pro', 'senior', 'legend'];
      const code = validExps.includes(rawExp.toLowerCase()) ? rawExp.toLowerCase() : 'pro';
      cleanUpdateData.experienceLevel = code;
      
      const levelRel = dbLevels.find(l => l.code === code);
      if (levelRel) cleanUpdateData.experienceLevelId = levelRel.id;
    }

    if (body.tone_of_voice || body.toneOfVoice) cleanUpdateData.toneOfVoice = body.tone_of_voice || body.toneOfVoice;
    if (body.clients) cleanUpdateData.clients = body.clients;
    if (body.voice_score || body.voiceScore) cleanUpdateData.voiceScore = parseInt(body.voice_score || body.voiceScore);
    if (body.menu_order || body.menuOrder) cleanUpdateData.menuOrder = parseInt(body.menu_order || body.menuOrder);
    
    // 🛡️ CHRIS-PROTOCOL: Strict Enum Casting & Relational Mapping for Status
    const rawStatus = body.status;
    if (rawStatus) {
      const validStatuses = ['pending', 'approved', 'active', 'live', 'publish', 'rejected', 'cancelled'];
      const code = validStatuses.includes(rawStatus.toLowerCase()) ? rawStatus.toLowerCase() : 'pending';
      cleanUpdateData.status = code;
      
      const statusRel = dbStatuses.find(s => s.code === code);
      if (statusRel) cleanUpdateData.statusId = statusRel.id;
    }

    if (body.is_public !== undefined) cleanUpdateData.isPublic = body.is_public;
    
    // Delivery logic
    if (body.delivery_days !== undefined || body.delivery_days_min !== undefined) {
      cleanUpdateData.deliveryDaysMin = body.delivery_days === 0 ? 0 : (body.delivery_days || body.delivery_days_min);
    }
    if (body.delivery_days !== undefined || body.delivery_days_max !== undefined) {
      cleanUpdateData.deliveryDaysMax = body.delivery_days || body.delivery_days_max;
    }
    if (body.delivery_days === 0 || body.delivery_days_min === 0) {
      cleanUpdateData.samedayDelivery = true;
    }
    if (body.cutoff_time) cleanUpdateData.cutoffTime = body.cutoff_time;

    // Bio & Tagline (HITL)
    if (isSuperAdmin) {
      if (body.bio !== undefined) cleanUpdateData.bio = body.bio;
      if (body.tagline !== undefined) cleanUpdateData.tagline = body.tagline;
      cleanUpdateData.pendingBio = null;
      cleanUpdateData.pendingTagline = null;
    } else {
      if (body.bio !== undefined) cleanUpdateData.pendingBio = body.bio;
      if (body.tagline !== undefined) cleanUpdateData.pendingTagline = body.tagline;
    }

    // Rates
    if (body.rates) cleanUpdateData.rates = body.rates;
    if (body.price_live_regie) cleanUpdateData.priceLiveRegie = String(body.price_live_regie);
    if (body.price_online) cleanUpdateData.priceOnline = String(body.price_online);
    if (body.price_ivr) cleanUpdateData.priceIvr = String(body.price_ivr);
    if (body.price_unpaid) cleanUpdateData.priceUnpaid = String(body.price_unpaid);

    // Asset sanitization
    let cleanPhotoUrl = body.photo_url || body.dropboxUrl || body.dropbox_url;
    if (cleanPhotoUrl && cleanPhotoUrl.includes('/api/proxy/?path=')) {
      cleanPhotoUrl = decodeURIComponent(cleanPhotoUrl.split('/api/proxy/?path=')[1]);
    }
    if (cleanPhotoUrl) cleanUpdateData.dropboxUrl = cleanPhotoUrl;

    // Photo ID handling
    const rawPhotoId = body.photo_id || body.photoId;
    if (rawPhotoId && parseInt(rawPhotoId) > 0) {
      cleanUpdateData.photoId = parseInt(rawPhotoId);
    }

    cleanUpdateData.isManuallyEdited = true;
    // 🛡️ CHRIS-PROTOCOL: Removed manual updatedAt to let DB handle it via defaultNow()
    // This prevents "e.toISOString is not a function" errors.

    // 🛡️ CHRIS-PROTOCOL: Map language IDs to strings if provided
    if (body.native_lang_id || body.extra_lang_ids) {
      try {
        const { languages: languagesTable } = await import('@db/schema');
        const { inArray } = await import('drizzle-orm');
        const langIds = [body.native_lang_id, ...(body.extra_lang_ids || [])].filter(Boolean);
        if (langIds.length > 0) {
          const dbLangs = await db.select().from(languagesTable).where(inArray(languagesTable.id, langIds as number[]));
          if (body.native_lang_id) {
            const native = dbLangs.find((l: any) => l.id === body.native_lang_id);
            if (native) cleanUpdateData.nativeLang = native.code;
          }
          if (body.extra_lang_ids) {
            const extras = dbLangs.filter((l: any) => body.extra_lang_ids.includes(l.id));
            cleanUpdateData.extraLangs = extras.map((l: any) => l.code).join(', ');
          }
        }
      } catch (langErr: any) {
        console.warn(' ADMIN: Language ID mapping failed:', langErr.message);
      }
    }

    // 🛡️ CHRIS-PROTOCOL: Nuclear Asset Reconciliation (v2.14.408)
    // If we have a photo_url but no valid photoId, we try to find or create the media record.
    // This makes the save action "Atomic" and independent of frontend upload success.
    let effectivePhotoId = cleanUpdateData.photoId;
    
    if (!effectivePhotoId && cleanPhotoUrl) {
      try {
        const { media: mediaTable } = await import('@db/schema');
        // Strip proxy prefix if present to get the raw path
        const rawPath = cleanPhotoUrl.includes('/api/proxy/?path=') 
          ? decodeURIComponent(cleanPhotoUrl.split('/api/proxy/?path=')[1])
          : cleanPhotoUrl;

        console.log(` [Nuclear] Reconciling asset for path: ${rawPath}`);
        
        // 1. Check if media record already exists
        const existingMedia = await db.select().from(mediaTable).where(eq(mediaTable.filePath, rawPath)).limit(1);
        
        if (existingMedia.length > 0) {
          effectivePhotoId = existingMedia[0].id;
          console.log(` [Nuclear] Found existing media record: ${effectivePhotoId}`);
        } else {
          // 2. Create media record on the fly
          const [newMedia] = await db.insert(mediaTable).values({
            fileName: rawPath.split('/').pop() || 'photo.webp',
            filePath: rawPath,
            fileType: 'image/webp',
            journey: 'agency',
            category: 'voices',
            isPublic: true
          }).returning({ id: mediaTable.id });
          
          effectivePhotoId = newMedia.id;
          console.log(` [Nuclear] Created new media record on the fly: ${effectivePhotoId}`);
        }
        cleanUpdateData.photoId = effectivePhotoId;
      } catch (reconErr: any) {
        console.warn(` [Nuclear] Asset reconciliation failed: ${reconErr.message}`);
        // We don't crash, we just continue without the ID to ensure profile save
      }
    }

    console.log(` ADMIN: Executing Nuclear Update for actor ${id}:`, JSON.stringify(cleanUpdateData, null, 2));

    // Update the actor in the database
    let result;
    try {
      result = await db.update(actors)
        .set(cleanUpdateData)
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
          photo_url: actors.dropboxUrl,
          native_lang: actors.nativeLang,
          updatedAt: actors.updatedAt
        });
    } catch (updateErr: any) {
      console.error(` [Admin Actor PATCH] Database update failed for actor ${id}:`, updateErr);
      
      // 🛡️ CHRIS-PROTOCOL: Fallback to Supabase SDK if Drizzle fails
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Map CamelCase back to snake_case for Supabase SDK
      const sdkData: any = {};
      Object.entries(cleanUpdateData).forEach(([key, val]) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        sdkData[snakeKey] = val;
      });

      const { data, error: sdkErr } = await supabase
        .from('actors')
        .update(sdkData)
        .or(`id.eq.${id},wp_product_id.eq.${id}`)
        .select()
        .single();

      if (sdkErr) {
        console.error(` [Admin Actor PATCH] Supabase SDK fallback also failed:`, sdkErr);
        throw new Error(`Database update failed: ${updateErr.message}`);
      }

      result = [data];
    }

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
                rating: review.rating
                // 🛡️ CHRIS-PROTOCOL: Removed manual updatedAt to let DB handle it via defaultNow()
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
