import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { requireAdmin } from '@/lib/auth/api-auth';
import { gemini-service } from '@/lib/services/gemini-service';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({});
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');
  const contextStr = searchParams.get('context');
  const context = contextStr ? JSON.parse(contextStr) : null;

    if (!filePath) {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

  try {
    // 1. Haal de afbeelding op van de server via SSH (zelfde als serve route)
    const { stdout } = await execAsync(`ssh voices-prod "cat '${filePath}'"`, {
      encoding: 'buffer',
      maxBuffer: 10 * 1024 * 1024 // 10MB limiet
    });

    const ext = path.extname(filePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

    // 2. Analyseer met Gemini Vision + Context
    const gemini = gemini-service.getInstance();
    const analysis = await gemini.analyzeImage(stdout, mimeType, context);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Vision analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
