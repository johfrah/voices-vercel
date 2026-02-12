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
    // We gebruiken 'cat' via SSH om de binary data op te halen
    const { stdout } = await execAsync(`ssh voices-prod "cat '${filePath}'"`, {
      encoding: 'buffer',
      maxBuffer: 10 * 1024 * 1024 // 10MB limiet voor foto's
    });

    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

    return new NextResponse(stdout, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Serve error:', error);
    return new NextResponse('File not found or server unreachable', { status: 404 });
  }
}
