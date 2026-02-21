import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/auth/api-auth';
import { commitFileToGitHub } from '@/lib/github-api';

/**
 *  API: VIBECODE SAVE (NUCLEAR 2026)
 * 
 * Doel: Slaat in-app logica op als fysieke Markdown bestanden in de codebase.
 * 
 * HYBRIDE MODUS:
 * - Lokaal: Schrijft naar harde schijf (fs).
 * - Productie (Vercel): Schrijft direct naar GitHub (commit), wat een deploy triggert.
 */

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, mode: 'build', message: 'Skipping save during build' });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { filename, code, metadata } = await request.json();

    if (!filename || !code) {
      return NextResponse.json({ error: 'Filename and code are required' }, { status: 400 });
    }

    //  SECURITY: Alleen toegestane mappen en bestandstypes
    let relativePath = 'src/content/vibes';
    let safeFilename = filename.replace(/[^a-z0-9-/]/gi, '_').toLowerCase();

    //  PAGINA CREATIE LOGIC
    if (filename.startsWith('page/')) {
      relativePath = 'src/content/pages';
      safeFilename = safeFilename.replace('page_', '') + '.md';
    } else {
      safeFilename = safeFilename + '.vibe.md';
    }

    //  Content met Frontmatter
    const fileContent = filename.startsWith('page/') 
      ? `---
title: ${metadata?.title || 'Nieuwe Pagina'}
description: ${metadata?.description || ''}
date: ${new Date().toISOString()}
layout: default
---

${code}`
      : `---
title: ${metadata?.title || 'Untitled Vibe'}
author: Admin
date: ${new Date().toISOString()}
vibe_strength: ${metadata?.strength || 1.0}
---

\`\`\`javascript
${code}
\`\`\`
`;

    //  HYBRID SAVE LOGIC
    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

    if (isProduction) {
      //  CLOUD MODE: Commit to GitHub
      const fullRepoPath = `1-SITE/apps/web/${relativePath}/${safeFilename}`;
      console.log(` Cloud Save: Committing to ${fullRepoPath}`);
      
      await commitFileToGitHub(
        fullRepoPath, 
        fileContent, 
        ` Cody Update: ${safeFilename} (via Dashboard)`
      );

      return NextResponse.json({ 
        success: true, 
        mode: 'cloud',
        message: 'Vibe direct opgeslagen in GitHub. Deploy start binnen 30s.' 
      });

    } else {
      //  LOCAL MODE: Write to Disk
      const targetDir = path.join(process.cwd(), relativePath);
      const filePath = path.join(targetDir, safeFilename);

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, fileContent, 'utf-8');

      return NextResponse.json({ 
        success: true, 
        mode: 'local',
        path: `${relativePath}/${safeFilename}`,
        message: 'Vibe lokaal opgeslagen.' 
      });
    }

  } catch (error: any) {
    console.error('[Vibecode Save Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to save vibe' }, { status: 500 });
  }
}
