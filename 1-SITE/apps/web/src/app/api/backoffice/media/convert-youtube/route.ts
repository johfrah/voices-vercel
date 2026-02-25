import { NextRequest, NextResponse } from 'next/server';
import { db, media, actors } from '@/lib/system/voices-config';
import { eq, sql } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import ytdl from 'ytdl-core';

/**
 *  NUCLEAR YOUTUBE CONVERTER (2026)
 * 
 * Downloadt een YouTube video en zet deze om naar een lokale asset.
 * Koppelt de nieuwe asset direct aan de stemacteur.
 */

export async function POST(request: NextRequest) {
  try {
    const { actorId, youtubeUrl } = await request.json();

    if (!actorId || !youtubeUrl) {
      return NextResponse.json({ error: 'Actor ID en YouTube URL zijn verplicht' }, { status: 400 });
    }

    if (!ytdl.validateURL(youtubeUrl)) {
      return NextResponse.json({ error: 'Ongeldige YouTube URL' }, { status: 400 });
    }

    console.log(` Start conversie voor acteur ${actorId}: ${youtubeUrl}`);

    // 1. Haal video info op
    const info = await ytdl.getInfo(youtubeUrl);
    const title = info.videoDetails.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileName = `${title}.mp4`;
    const relativePath = `agency/voices/videos/${fileName}`;
    const absolutePath = path.join(process.cwd(), '../assets', relativePath);

    // 2. Zorg dat de map bestaat
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });

    // 3. Download video
    // Opmerking: In een echte productieomgeving zou dit via een background worker gaan
    // Voor nu doen we het direct in de route (met risico op timeout bij hele grote videos)
    const downloadPromise = new Promise((resolve, reject) => {
      const stream = ytdl(youtubeUrl, { quality: 'highestvideo', filter: 'audioandvideo' });
      const fileStream = require('fs').createWriteStream(absolutePath);
      stream.pipe(fileStream);
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });

    await downloadPromise;

    // 4. Registreer in Media Engine via Atomic Transaction
    const stats = await fs.stat(absolutePath);
    const result = await db.transaction(async (tx) => {
      const [newMedia] = await tx.insert(media).values({
        fileName: fileName,
        filePath: relativePath,
        fileType: 'video/mp4',
        fileSize: stats.size,
        journey: 'agency',
        category: 'voices',
        labels: ['youtube-converted'],
        isPublic: true,
        isManuallyEdited: true,
        metadata: {
          originalYoutubeUrl: youtubeUrl,
          title: info.videoDetails.title,
          duration: info.videoDetails.lengthSeconds
        }
      }).returning();

      // 5. Koppel aan acteur
      await tx.update(actors)
        .set({ 
          youtubeUrl: `local:${newMedia.id}`, // Markeer als lokaal
          isManuallyEdited: true,
          internalNotes: sql`${actors.internalNotes} || '\nYouTube video geconverteerd naar media ID: ' || ${newMedia.id}`
        })
        .where(eq(actors.id, actorId));

      return newMedia;
    });

    return NextResponse.json({ 
      success: true, 
      media: result,
      message: 'YouTube video succesvol geconverteerd naar lokale asset'
    });

  } catch (error) {
    console.error('YouTube Conversion Error:', error);
    return NextResponse.json({ error: 'Conversie mislukt: ' + (error as Error).message }, { status: 500 });
  }
}
