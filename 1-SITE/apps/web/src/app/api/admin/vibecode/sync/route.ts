import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: VIBECODE SYNC (NUCLEAR 2026)
 * 
 * Doel: Synchroniseert de "Gouden Bron" (Bijbels, Rules, Blueprints) 
 * naar de Vibecode Engine zodat de Shadow Layer volledig gebriefd is.
 */

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const rootDir = path.join(process.cwd(), '../../');
    const docsDir = path.join(rootDir, 'docs/Bijbel');
    const rulesFile = path.join(rootDir, '.cursorrules');
    const vibesDir = path.join(process.cwd(), 'src/content/vibes');

    // 1. Zorg dat de vibes map bestaat
    await fs.mkdir(vibesDir, { recursive: true });

    let syncedFiles = [];

    // 2. Sync .cursorrules (De Wet)
    if (await fileExists(rulesFile)) {
      const rulesContent = await fs.readFile(rulesFile, 'utf-8');
      await saveToVibe('nuclear-laws', rulesContent, 'De Wetten van de Freedom Machine');
      syncedFiles.push('.cursorrules');
    }

    // 3. Scan en Sync alle Bijbels
    const scanDir = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await scanDir(fullPath);
        } else if (entry.name.endsWith('.md')) {
          const content = await fs.readFile(fullPath, 'utf-8');
          const vibeName = entry.name.replace('.md', '').toLowerCase();
          await saveToVibe(vibeName, content, `Knowledge: ${entry.name}`);
          syncedFiles.push(entry.name);
        }
      }
    };

    if (await fileExists(docsDir)) {
      await scanDir(docsDir);
    }

    return NextResponse.json({ 
      success: true, 
      syncedCount: syncedFiles.length,
      files: syncedFiles,
      message: 'Freedom Machine Knowledge Base volledig gesynchroniseerd naar Vibecode.' 
    });

  } catch (error) {
    console.error('[Vibecode Sync Error]:', error);
    return NextResponse.json({ error: 'Failed to sync knowledge' }, { status: 500 });
  }
}

async function fileExists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function saveToVibe(filename: string, content: string, title: string) {
  const safeFilename = filename.replace(/[^a-z0-9-]/gi, '_') + '.vibe.md';
  const vibesDir = path.join(process.cwd(), 'src/content/vibes');
  
  const fileContent = `---
title: ${title}
type: knowledge
date: ${new Date().toISOString()}
---

${content}
`;

  await fs.writeFile(path.join(vibesDir, safeFilename), fileContent, 'utf-8');
}
