import { NextRequest, NextResponse } from 'next/server';
import { db, media, actors, actorDemos, contentArticles, ademingTracks } from '@/lib/system/db';
import { eq, desc, asc, ilike, or, and, inArray, sql } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

/**
 *  NUCLEAR MEDIA API (2026) - INTELLIGENT VERSION
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const journey = searchParams.get('journey');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'newest';
    const label = searchParams.get('label');
    const filterOrphans = searchParams.get('filter') === 'orphans';
    const actorId = searchParams.get('actorId');

    //  RELATION TRACKING LOGIC
    const [actorsData, demosData, articlesData, ademingData] = await Promise.all([
      db.select({ id: actors.id, name: actors.firstName, photoId: actors.photoId, logoId: actors.logoId, youtubeUrl: actors.youtubeUrl }).from(actors),
      db.select({ id: actorDemos.id, name: actorDemos.name, mediaId: actorDemos.mediaId, actorId: actorDemos.actorId }).from(actorDemos),
      db.select({ id: contentArticles.id, title: contentArticles.title, featuredImageId: contentArticles.featuredImageId }).from(contentArticles),
      db.select({ id: ademingTracks.id, title: ademingTracks.title, mediaId: ademingTracks.mediaId }).from(ademingTracks)
    ]);

    const relationsMap: Record<number, { type: string, name: string }[]> = {};

    actorsData.forEach(a => {
      if (a.photoId) {
        if (!relationsMap[a.photoId]) relationsMap[a.photoId] = [];
        relationsMap[a.photoId].push({ type: 'Actor Photo', name: a.name });
      }
      if (a.logoId) {
        if (!relationsMap[a.logoId]) relationsMap[a.logoId] = [];
        relationsMap[a.logoId].push({ type: 'Actor Logo', name: a.name });
      }
    });

    demosData.forEach(d => {
      if (d.mediaId) {
        if (!relationsMap[d.mediaId]) relationsMap[d.mediaId] = [];
        relationsMap[d.mediaId].push({ type: 'Voice Demo', name: d.name });
      }
    });

    articlesData.forEach(art => {
      if (art.featuredImageId) {
        if (!relationsMap[art.featuredImageId]) relationsMap[art.featuredImageId] = [];
        relationsMap[art.featuredImageId].push({ type: 'Article Image', name: art.title });
      }
    });

    ademingData.forEach(track => {
      if (track.mediaId) {
        if (!relationsMap[track.mediaId]) relationsMap[track.mediaId] = [];
        relationsMap[track.mediaId].push({ type: 'Ademing Track', name: track.title });
      }
    });

    //  ACTOR-SPECIFIC FILTERING
    if (actorId) {
      const id = parseInt(actorId);
      const actor = actorsData.find(a => a.id === id);
      const actorDemosList = demosData.filter(d => d.mediaId && demosData.find(dd => dd.id === d.id && dd.actorId === id));
      
      // We halen alle media IDs op die bij deze acteur horen
      const linkedMediaIds = new Set<number>();
      if (actor?.photoId) linkedMediaIds.add(actor.photoId);
      if (actor?.logoId) linkedMediaIds.add(actor.logoId);
      demosData.filter(d => d.actorId === id && d.mediaId).forEach(d => linkedMediaIds.add(d.mediaId!));

      if (linkedMediaIds.size === 0) return NextResponse.json({ results: [], youtubeUrl: actor?.youtubeUrl });

      const results = await db.select().from(media).where(inArray(media.id, Array.from(linkedMediaIds)));
      return NextResponse.json({
        results: results.map(item => ({
          ...item,
          relations: relationsMap[item.id] || [],
          isOrphan: false
        })),
        youtubeUrl: actor?.youtubeUrl
      });
    }

    let query = db.select().from(media);
    const conditions = [];

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
      const usedIds = Object.keys(relationsMap).map(id => parseInt(id));
      if (usedIds.length > 0) {
        conditions.push(sql`${media.id} NOT IN (${sql.join(usedIds, sql`, `)})`);
      }
    }

    let finalQuery = query.where(and(...(conditions as any[])));

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
    
    const enrichedResults = results.map((item: any) => ({
      ...item,
      relations: relationsMap[item.id] || [],
      isOrphan: !relationsMap[item.id] || relationsMap[item.id].length === 0
    }));
    
    return NextResponse.json({ results: enrichedResults });
  } catch (error) {
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
        await tx.update(media).set({ isPublic, isManuallyEdited: true }).where(inArray(media.id, ids));
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'update-visibility') {
      const id = parseInt(formData.get('id') as string);
      const isPublic = formData.get('isPublic') === 'true';
      await db.transaction(async (tx) => {
        await tx.update(media).set({ isPublic, isManuallyEdited: true }).where(eq(media.id, id));
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
        isManuallyEdited: true,
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
