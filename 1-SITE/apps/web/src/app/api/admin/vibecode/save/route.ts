import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 * ⚡ API: VIBECODE SAVE (NUCLEAR 2026)
 * 
 * Doel: Slaat in-app logica op als fysieke Markdown bestanden in de codebase.
 * Hierdoor zijn alle Vibecode aanpassingen direct zichtbaar in Git.
 */

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { filename, code, metadata } = await request.json();

    if (!filename || !code) {
      return NextResponse.json({ error: 'Filename and code are required' }, { status: 400 });
    }

    // 🛡️ SECURITY: Alleen toegestane mappen en bestandstypes
    let targetDir = path.join(process.cwd(), 'src/content/vibes');
    let safeFilename = filename.replace(/[^a-z0-9-/]/gi, '_').toLowerCase();

    // 📄 PAGINA CREATIE LOGIC: Als de filename begint met 'page/', slaan we het op in content/pages
    if (filename.startsWith('page/')) {
      targetDir = path.join(process.cwd(), 'src/content/pages');
      safeFilename = safeFilename.replace('page_', '') + '.md';
    } else {
      safeFilename = safeFilename + '.vibe.md';
    }

    const filePath = path.join(targetDir, safeFilename);

    // Zorg dat de directory bestaat
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // 📝 Content met Frontmatter voor metadata
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

    await fs.writeFile(filePath, fileContent, 'utf-8');

    return NextResponse.json({ 
      success: true, 
      path: `src/content/vibes/${safeFilename}`,
      message: 'Vibe opgeslagen en geregistreerd in de codebase.' 
    });

  } catch (error) {
    console.error('[Vibecode Save Error]:', error);
    return NextResponse.json({ error: 'Failed to save vibe' }, { status: 500 });
  }
}
