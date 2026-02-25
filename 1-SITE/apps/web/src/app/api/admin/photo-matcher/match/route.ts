import { NextRequest, NextResponse } from 'next/server';
import { db, actors, media, users, instructors } from '@/lib/system/voices-config';
import { eq, sql } from 'drizzle-orm';
import * as path from 'path';
import { execSync } from 'child_process';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { photoPath, actorId, analysis } = await request.json();

    if (!photoPath) {
      return NextResponse.json({ error: 'Missing photo path' }, { status: 400 });
    }

    // 1. Bepaal doelpad en categorie
    let targetSubDir = './wp-core/wp-content/uploads/assets/content/general';
    let category = 'general';
    let actor = null;

    if (actorId) {
      // Haal actor data op voor specifieke plaatsing
      actor = await db.query.actors.findFirst({
        where: eq(actors.id, actorId)
      });
      
      if (actor) {
        const serverAssetsRoot = './wp-core/wp-content/uploads/assets/agency/voices';
        const execSSH = (cmd: string) => execSync(`ssh voices-prod "${cmd}"`).toString();
        const actorDirs = execSSH(`find ${serverAssetsRoot} -maxdepth 2 -type d`).split('\n');
        
        const wpId = actor.wpProductId ? String(actor.wpProductId) : null;
        targetSubDir = (wpId ? actorDirs.find((d: string) => d.includes(wpId)) : null) 
          || actorDirs.find((d: string) => d.includes(actor.slug || ''))
          || targetSubDir;
        
        category = 'voices';
      }
    }

    const execSSH = (cmd: string) => execSync(`ssh voices-prod "${cmd}"`).toString();
    const ext = path.extname(photoPath).toLowerCase();
    const randomHash = Math.random().toString(36).substring(2, 8);
    const fileName = path.basename(photoPath, ext);
    const targetFileName = actor ? `${actor.slug}-photo-${randomHash}${ext}` : `${fileName}-${randomHash}${ext}`;
    const targetPath = path.join(targetSubDir, targetFileName);

    // 2. Verplaatsen en opschonen op de server
    execSSH(`mkdir -p "${targetSubDir}" && cp "${photoPath}" "${targetPath}"`);
    
    //  CHRIS-PROTOCOL: Alleen strippen als het geen transparante PNG is om corruptie te voorkomen
    if (ext !== '.png') {
      try {
        execSSH(`mogrify -strip "${targetPath}"`);
      } catch (e) {
        console.warn('Metadata strip failed');
      }
    }

    // 3. Metadata uitlezen
    const dimensions = execSSH(`identify -format "%wx%h" "${targetPath}"`).trim().split('x');
    const width = parseInt(dimensions[0]);
    const height = parseInt(dimensions[1]);

    // 4. Database update (Media tabel met Vision labels)
    const [newMedia] = await db.insert(media).values({
      fileName: targetFileName,
      filePath: targetPath.replace('./wp-core/wp-content/uploads/', ''),
      fileType: ext === '.png' ? 'image/png' : (ext === '.webp' ? 'image/webp' : 'image/jpeg'),
      fileSize: parseInt(execSSH(`stat -c%s "${targetPath}"`)),
      labels: analysis?.labels || [],
      altText: analysis?.suggested_alt || '',
      metadata: { 
        width, 
        height, 
        ratio: width / height > 1.1 ? 'landscape' : (width / height < 0.9 ? 'portrait' : 'square'),
        vision_description: analysis?.description,
        vision_vibe: analysis?.vibe,
        vision_authenticity: analysis?.authenticity,
        vision_confidence: analysis?.confidence,
        original_source: photoPath
      },
      journey: actor ? 'agency' : 'general',
      category: category,
    }).returning();

    // 5. Koppelen aan Actor indien van toepassing
    if (actor) {
      await db.update(actors).set({ photoId: newMedia.id }).where(eq(actors.id, actor.id));
      if (actor.userId) {
        await db.update(users)
          .set({ preferences: sql`jsonb_set(COALESCE(preferences, '{}'::jsonb), '{photoId}', ${newMedia.id})` })
          .where(eq(users.id, actor.userId));
      }
    }

    return NextResponse.json({ success: true, targetPath, mediaId: newMedia.id });
  } catch (error: any) {
    console.error('Match error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
