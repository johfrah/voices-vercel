import { NextResponse } from 'next/server';
import { db } from '@/lib/sync/bridge';
import { actors } from '@db/schema';
import { eq, or } from 'drizzle-orm';

/**
 *  ADMIN ACTOR UPDATE API (GOD MODE 2026)
 * 
 * Verwerkt real-time updates voor stemacteurs.
 * Alleen toegankelijk voor admins.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  
  try {
    const body = await request.json();
    
    //  CHRIS-PROTOCOL: Forensic validation
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid actor ID' }, { status: 400 });
    }

    console.log(` ADMIN: Updating actor ${id}`, body);

    // Update the actor in the database
    const result = await db.update(actors)
    .set({
      firstName: body.firstName || body.first_name,
      lastName: body.lastName || body.last_name,
      email: body.email,
      gender: body.gender,
      experienceLevel: body.experienceLevel,
      tagline: body.tagline,
      bio: body.bio,
      toneOfVoice: body.tone_of_voice,
      clients: body.clients,
      voiceScore: body.voice_score,
      status: body.status,
      deliveryDaysMin: body.delivery_days === 0 ? 0 : body.delivery_days,
      deliveryDaysMax: body.delivery_days,
      samedayDelivery: body.delivery_days === 0,
      cutoffTime: body.cutoff_time,
      nativeLang: body.native_lang,
      extraLangs: body.extra_langs,
      dropboxUrl: body.photo_url,
      photoId: body.photo_id || undefined,
      priceUnpaid: body.price_unpaid ? String(body.price_unpaid) : undefined,
      priceOnline: body.price_online ? String(body.price_online) : undefined,
      priceIvr: body.price_ivr ? String(body.price_ivr) : undefined,
      priceLiveRegie: body.price_live_regie ? String(body.price_live_regie) : undefined,
      rates: body.rates || undefined,
      updatedAt: new Date()
    })
      .where(or(eq(actors.id, id), eq(actors.wpProductId, id)))
      .returning({
        id: actors.id,
        wpProductId: actors.wpProductId,
        firstName: actors.firstName,
        lastName: actors.lastName,
        email: actors.email,
        status: actors.status,
        photoId: actors.photoId,
        photo_url: actors.dropboxUrl, // Return the latest photo_url/dropboxUrl
        updatedAt: actors.updatedAt
      });

    const effectiveActorId = result[0].id;

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
        if (demoId && !isNaN(demoId) && existingDemos.find(d => d.id === demoId)) {
          // Update
          await db.update(actorDemos)
            .set({ 
              name: demo.title,
              url: demo.audio_url,
              type: demo.category 
            })
            .where(eq(actorDemos.id, demoId));
        } else {
          // Insert new
          await db.insert(actorDemos).values({
            actorId: effectiveActorId,
            name: demo.title,
            url: demo.audio_url,
            type: demo.category,
            isPublic: true
          });
        }
      }
    }

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Actor not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      actor: result[0],
      _forensic: `Actor ${id} updated successfully by admin`
    });

  } catch (error: any) {
    console.error(' ADMIN UPDATE FAILURE:', error);
    return NextResponse.json({ 
      error: 'Failed to update actor', 
      details: error.message 
    }, { status: 500 });
  }
}
