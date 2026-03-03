import { NextRequest, NextResponse } from 'next/server';
import { db, media, actors, actorDemos, contentArticles, ademingTracks } from '@/lib/system/voices-config';
import { eq, desc, asc, ilike, or, and, inArray, sql } from 'drizzle-orm';
import fs from 'fs/promises';
import { appendFileSync } from 'fs';
import path from 'path';

/**
 *  NUCLEAR MEDIA API (2026) - INTELLIGENT VERSION
 */

const DEBUG_LOG_PATH = '/opt/cursor/logs/debug.log';

const writeDebugLog = (
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>
) => {
  try {
    appendFileSync(
      DEBUG_LOG_PATH,
      JSON.stringify({
        hypothesisId,
        location,
        message,
        data,
        timestamp: Date.now(),
      }) + '\n'
    );
  } catch {
    // Debug logging should never block API behavior.
  }
};

export async function GET(request: NextRequest) {
  const requestStartTs = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const journey = searchParams.get('journey');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'newest';
    const label = searchParams.get('label');
    const filterOrphans = searchParams.get('filter') === 'orphans';
    const actorId = searchParams.get('actorId');

    // #region agent log
    writeDebugLog('H5', 'api/backoffice/media/route.ts:GET:entry', 'Media GET request started', {
      search,
      journey,
      category,
      sort,
      label,
      filterOrphans,
      actorId,
    });
    // #endregion

    //  ACTOR-SPECIFIC FILTERING
    if (actorId) {
      const actorBranchStartTs = Date.now();
      const id = parseInt(actorId);
      const [actor] = await db
        .select({
          id: actors.id,
          name: actors.first_name,
          photo_id: actors.photo_id,
          logo_id: actors.logo_id,
          youtubeUrl: actors.youtubeUrl,
        })
        .from(actors)
        .where(eq(actors.id, id))
        .limit(1);

      const actorDemosList = await db
        .select({ name: actorDemos.name, mediaId: actorDemos.mediaId })
        .from(actorDemos)
        .where(and(eq(actorDemos.actorId, id), sql`${actorDemos.mediaId} IS NOT NULL`));
      
      // We halen alle media IDs op die bij deze acteur horen
      const linkedMediaIds = new Set<number>();
      if (actor?.photo_id) linkedMediaIds.add(actor.photo_id);
      if (actor?.logo_id) linkedMediaIds.add(actor.logo_id);
      actorDemosList.forEach(d => {
        if (d.mediaId) linkedMediaIds.add(d.mediaId);
      });

      if (linkedMediaIds.size === 0) return NextResponse.json({ results: [], youtubeUrl: actor?.youtubeUrl });

      const results = await db
        .select()
        .from(media)
        .where(inArray(media.id, Array.from(linkedMediaIds)))
        .orderBy(desc(media.createdAt))
        .limit(100);

      const relationsMap: Record<number, { type: string, name: string }[]> = {};
      if (actor?.photo_id) {
        if (!relationsMap[actor.photo_id]) relationsMap[actor.photo_id] = [];
        relationsMap[actor.photo_id].push({ type: 'Actor Photo', name: actor.name });
      }
      if (actor?.logo_id) {
        if (!relationsMap[actor.logo_id]) relationsMap[actor.logo_id] = [];
        relationsMap[actor.logo_id].push({ type: 'Actor Logo', name: actor.name });
      }
      actorDemosList.forEach((d) => {
        if (d.mediaId) {
          if (!relationsMap[d.mediaId]) relationsMap[d.mediaId] = [];
          relationsMap[d.mediaId].push({ type: 'Voice Demo', name: d.name });
        }
      });

      // #region agent log
      writeDebugLog('H3', 'api/backoffice/media/route.ts:GET:actor-branch', 'Actor branch completed', {
        actorId: id,
        actorDemosListCount: actorDemosList.length,
        linkedMediaIdsCount: linkedMediaIds.size,
        resultCount: results.length,
        durationMs: Date.now() - actorBranchStartTs,
        totalDurationMs: Date.now() - requestStartTs,
      });
      // #endregion

      return NextResponse.json({
        results: results.map(item => ({
          ...item,
          relations: relationsMap[item.id] || [],
          isOrphan: false
        })),
        youtubeUrl: actor?.youtubeUrl
      });
    }

    const conditions = [] as any[];

    if (search) {
      conditions.push(or(
        ilike(media.fileName, `%${search}%`),
        ilike(media.altText, `%${search}%`)
      ));
    }

    if (journey) conditions.push(eq(media.journey, journey));
    if (category) conditions.push(eq(media.category, category));
    if (label) {
      conditions.push(sql`${media.labels} @> ARRAY[${label}]`);
    }

    if (filterOrphans) {
      conditions.push(
        sql`NOT EXISTS (SELECT 1 FROM actors a WHERE a.photo_id = ${media.id} OR a.logo_id = ${media.id})`
      );
      conditions.push(
        sql`NOT EXISTS (SELECT 1 FROM actor_demos d WHERE d.media_id = ${media.id})`
      );
      conditions.push(
        sql`NOT EXISTS (SELECT 1 FROM content_articles ca WHERE ca.featured_image_id = ${media.id})`
      );
      conditions.push(
        sql`NOT EXISTS (SELECT 1 FROM ademing_tracks at WHERE at.media_id = ${media.id})`
      );
    }

    const mediaQueryStartTs = Date.now();
    let finalQuery = db.select().from(media) as any;
    if (conditions.length > 0) {
      finalQuery = finalQuery.where(and(...conditions));
    }

    if (sort === 'oldest') {
      finalQuery = finalQuery.orderBy(asc(media.createdAt)) as any;
    } else if (sort === 'name') {
      finalQuery = finalQuery.orderBy(asc(media.fileName)) as any;
    } else if (sort === 'size') {
      finalQuery = finalQuery.orderBy(desc(media.fileSize)) as any;
    } else {
      finalQuery = finalQuery.orderBy(desc(media.createdAt)) as any;
    }

    const results = await (finalQuery as any).limit(100);

    // #region agent log
    writeDebugLog('H2', 'api/backoffice/media/route.ts:GET:media-query', 'Media query completed', {
      durationMs: Date.now() - mediaQueryStartTs,
      conditionsCount: conditions.length,
      resultCount: results.length,
      sort,
    });
    // #endregion

    if (results.length === 0) {
      // #region agent log
      writeDebugLog('H4', 'api/backoffice/media/route.ts:GET:enrich-exit', 'Media response is empty', {
        totalDurationMs: Date.now() - requestStartTs,
      });
      // #endregion
      return NextResponse.json({ results: [] });
    }

    const mediaIds = results.map((item: any) => item.id);
    const relationLookupStartTs = Date.now();
    const [actorsData, demosData, articlesData, ademingData] = await Promise.all([
      db
        .select({ name: actors.first_name, photo_id: actors.photo_id, logo_id: actors.logo_id })
        .from(actors)
        .where(or(inArray(actors.photo_id, mediaIds), inArray(actors.logo_id, mediaIds))),
      db
        .select({ name: actorDemos.name, mediaId: actorDemos.mediaId })
        .from(actorDemos)
        .where(inArray(actorDemos.mediaId, mediaIds)),
      db
        .select({ title: contentArticles.title, featuredImageId: contentArticles.featuredImageId })
        .from(contentArticles)
        .where(inArray(contentArticles.featuredImageId, mediaIds)),
      db
        .select({ title: ademingTracks.title, mediaId: ademingTracks.mediaId })
        .from(ademingTracks)
        .where(inArray(ademingTracks.mediaId, mediaIds)),
    ]);

    // #region agent log
    writeDebugLog('H1', 'api/backoffice/media/route.ts:GET:relation-lookup', 'Targeted relation lookup completed', {
      durationMs: Date.now() - relationLookupStartTs,
      mediaIdsCount: mediaIds.length,
      actorsCount: actorsData.length,
      demosCount: demosData.length,
      articlesCount: articlesData.length,
      ademingCount: ademingData.length,
    });
    // #endregion

    const relationsMap: Record<number, { type: string, name: string }[]> = {};
    actorsData.forEach((a) => {
      if (a.photo_id) {
        if (!relationsMap[a.photo_id]) relationsMap[a.photo_id] = [];
        relationsMap[a.photo_id].push({ type: 'Actor Photo', name: a.name });
      }
      if (a.logo_id) {
        if (!relationsMap[a.logo_id]) relationsMap[a.logo_id] = [];
        relationsMap[a.logo_id].push({ type: 'Actor Logo', name: a.name });
      }
    });
    demosData.forEach((d) => {
      if (d.mediaId) {
        if (!relationsMap[d.mediaId]) relationsMap[d.mediaId] = [];
        relationsMap[d.mediaId].push({ type: 'Voice Demo', name: d.name });
      }
    });
    articlesData.forEach((article) => {
      if (article.featuredImageId) {
        if (!relationsMap[article.featuredImageId]) relationsMap[article.featuredImageId] = [];
        relationsMap[article.featuredImageId].push({ type: 'Article Image', name: article.title });
      }
    });
    ademingData.forEach((track) => {
      if (track.mediaId) {
        if (!relationsMap[track.mediaId]) relationsMap[track.mediaId] = [];
        relationsMap[track.mediaId].push({ type: 'Ademing Track', name: track.title });
      }
    });

    const enrichStartTs = Date.now();
    const enrichedResults = results.map((item: any) => ({
      ...item,
      relations: relationsMap[item.id] || [],
      isOrphan: !relationsMap[item.id] || relationsMap[item.id].length === 0
    }));

    // #region agent log
    writeDebugLog('H4', 'api/backoffice/media/route.ts:GET:enrich-exit', 'Media enrichment and response completed', {
      enrichDurationMs: Date.now() - enrichStartTs,
      totalDurationMs: Date.now() - requestStartTs,
      responseCount: enrichedResults.length,
    });
    // #endregion
    
    return NextResponse.json({ results: enrichedResults });
  } catch (error) {
    // #region agent log
    writeDebugLog('H5', 'api/backoffice/media/route.ts:GET:error', 'Media GET failed', {
      totalDurationMs: Date.now() - requestStartTs,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStackTop: error instanceof Error ? error.stack?.split('\n').slice(0, 2).join(' | ') : null,
    });
    // #endregion
    console.error('Media Fetch Error:', error);
    return NextResponse.json({ error: 'Kon media niet ophalen' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;

    if (action === 'bulk-delete') {
      const ids = JSON.parse(formData.get('ids') as string) as number[];
      return await db.transaction(async (tx) => {
        const items = await tx.select().from(media).where(inArray(media.id, ids));
        for (const item of items) {
          const absolutePath = path.join(process.cwd(), '../assets', item.filePath);
          try { await fs.unlink(absolutePath); } catch (e) {}
        }
        await tx.delete(media).where(inArray(media.id, ids));
        return NextResponse.json({ success: true });
      });
    }

    if (action === 'bulk-visibility') {
      const ids = JSON.parse(formData.get('ids') as string) as number[];
      const isPublic = formData.get('isPublic') === 'true';
      await db.transaction(async (tx) => {
        await tx.update(media).set({ isPublic, is_manually_edited: true }).where(inArray(media.id, ids));
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'update-visibility') {
      const id = parseInt(formData.get('id') as string);
      const isPublic = formData.get('isPublic') === 'true';
      await db.transaction(async (tx) => {
        await tx.update(media).set({ isPublic, is_manually_edited: true }).where(eq(media.id, id));
      });
      return NextResponse.json({ success: true });
    }

    const file = formData.get('file') as File;
    const journey = formData.get('journey') as string || 'common';
    const category = formData.get('category') as string || 'misc';
    const labels = JSON.parse(formData.get('labels') as string || '[]') as string[];
    const isPublic = formData.get('isPublic') !== 'false';
    
    if (!file) return NextResponse.json({ error: 'Geen bestand' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-');
    
    let relativePath = `uploads/${journey}/${category}/${fileName}`;
    if (journey === 'common' && category === 'branding') relativePath = `common/branding/${fileName}`;
    else if (journey === 'agency' && category === 'voices') relativePath = `agency/voices/misc/${fileName}`;

    const absolutePath = path.join(process.cwd(), '../assets', relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);
    
    const [newMedia] = await db.transaction(async (tx) => {
      return await tx.insert(media).values({
        fileName,
        filePath: relativePath,
        fileType: file.type,
        fileSize: file.size,
        journey,
        category,
        labels,
        isPublic,
        is_manually_edited: true,
        metadata: {}
      }).returning();
    });

    return NextResponse.json({ success: true, media: newMedia });

  } catch (error) {
    console.error('Media API Error:', error);
    return NextResponse.json({ error: 'Actie mislukt' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID mist' }, { status: 400 });

  try {
    return await db.transaction(async (tx) => {
      const [item] = await tx.select().from(media).where(eq(media.id, parseInt(id)));
      if (item) {
        const absolutePath = path.join(process.cwd(), '../assets', item.filePath);
        try { await fs.unlink(absolutePath); } catch (e) {}
        await tx.delete(media).where(eq(media.id, parseInt(id)));
      }
      return NextResponse.json({ success: true });
    });
  } catch (error) {
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
