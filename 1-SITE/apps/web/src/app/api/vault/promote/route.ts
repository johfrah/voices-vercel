import { db } from '@db';
import { vaultFiles, media, actorDemos, actors } from '@db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 🚀 PROMOTION SLUIS API (2026)
 * 
 * Verplaatst een inbound demo van de privé Kluis naar de publieke Dropbox van een acteur.
 */
export async function POST(request: Request) {
  try {
    const { vaultFileId, actorId, demoName, demoType } = await request.json();

    if (!vaultFileId || !actorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Haal Vault File op
    const vaultFile = await db.query.vaultFiles.findFirst({
      where: eq(vaultFiles.id, vaultFileId)
    });

    if (!vaultFile) {
      return NextResponse.json({ error: 'Vault file not found' }, { status: 404 });
    }

    // 2. Haal Actor op voor Dropbox pad
    const actor = await db.query.actors.findFirst({
      where: eq(actors.id, actorId)
    });

    if (!actor) {
      return NextResponse.json({ error: 'Actor not found' }, { status: 404 });
    }

    // 3. Bepaal Target Pad in Dropbox
    // Voor nu gebruiken we een tijdelijk pad in de assets folder, 
    // in een echte omgeving zou dit naar de Dropbox sync folder gaan.
    const ASSETS_ROOT = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/next-experience/public/assets';
    const actorSlug = actor.slug || `${actor.firstName}-${actor.id}`;
    const targetDir = path.join(ASSETS_ROOT, 'voices', actorSlug);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetFileName = `${Date.now()}_${vaultFile.originalName}`;
    const targetPath = path.join(targetDir, targetFileName);

    // 4. Fysiek kopiëren
    fs.copyFileSync(vaultFile.filePath, targetPath);

    // 5. Database Transactie
    const result = await db.transaction(async (tx) => {
      // A. Maak Media record
      const newMedia = await tx.insert(media).values({
        fileName: targetFileName,
        filePath: `voices/${actorSlug}/${targetFileName}`,
        fileType: vaultFile.mimeType,
        fileSize: vaultFile.fileSize,
        category: 'voices',
        journey: 'agency',
        isPublic: true
      }).returning({ id: media.id });

      const mediaId = newMedia[0].id;

      // B. Maak Actor Demo record
      await tx.insert(actorDemos).values({
        actorId: actorId,
        mediaId: mediaId,
        name: demoName || vaultFile.originalName || 'Nieuwe Demo',
        url: `/assets/voices/${actorSlug}/${targetFileName}`,
        type: demoType || 'demo',
        isPublic: true
      });

      // C. Update Vault File status
      await tx.update(vaultFiles).set({
        status: 'promoted',
        isPromoted: true,
        promotedMediaId: mediaId,
        updatedAt: new Date()
      }).where(eq(vaultFiles.id, vaultFileId));

      return { mediaId };
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Demo succesvol gepromoveerd naar publiek profiel!',
      mediaId: result.mediaId
    });

  } catch (error) {
    console.error('❌ Promotion API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
