import { NextResponse } from 'next/server';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { requireAdmin } from '@/lib/auth/api-auth';

const execAsync = promisify(exec);

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return new NextResponse('Missing path', { status: 400 });
  }

  try {
    // 🚀 Gebruik async exec om de event loop niet te blokkeren
    // We proberen verschillende paden (legacy, transfer, kelder)
    const possiblePaths = [
      filePath,
      path.join('./TRANSFER', filePath),
      path.join('./4-KELDER', filePath),
      filePath.replace('./_STORAGE_LEGACY_/', './TRANSFER/_STORAGE_LEGACY_/')
    ].filter(Boolean);

    // 🚀 CHRIS-PROTOCOL: Cache-First strategy for SSH connections
    // We gebruiken een simpele cache om te onthouden welk pad werkte voor deze sessie
    // (Optioneel: implementeer een global cache als dit vaker voorkomt)

    let stdout: Buffer | null = null;
    let lastError = null;

    // Parallelle check voor snelheid? Nee, SSH is te zwaar. 
    // We proberen de meest waarschijnlijke eerst.
    for (const p of possiblePaths) {
      try {
        const { stdout: buffer } = await execAsync(`ssh voices-prod "cat '${p}'"`, {
          encoding: 'buffer',
          maxBuffer: 10 * 1024 * 1024 // 10MB limiet voor foto's
        });
        stdout = buffer;
        break; // Gevonden!
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    if (!stdout) {
      throw lastError || new Error('File not found in any known location');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : (ext === '.webp' ? 'image/webp' : 'image/jpeg');

    return new NextResponse(stdout, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 jaar cache voor assets
        'X-Content-Type-Options': 'nosniff'
      },
    });
  } catch (error) {
    console.error('Serve error:', error);
    return new NextResponse('File not found or server unreachable', { status: 404 });
  }
}
