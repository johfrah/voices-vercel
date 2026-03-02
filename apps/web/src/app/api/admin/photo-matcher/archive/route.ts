import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import * as path from 'path';
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
    const { photoPath } = await request.json();

    if (!photoPath) {
      return NextResponse.json({ error: 'Missing photo path' }, { status: 400 });
    }

    //  ARCHIVE PROTOCOL: Verplaats naar /ARCHIVE/ op de server
    // We gebruiken de timestamp 1770880690000 (of de huidige) voor uniekheid
    const archiveRoot = './ARCHIVE/photo-matcher-cleanup';
    const timestamp = Date.now();
    
    const execSSH = (cmd: string) => execSync(`ssh voices-prod "${cmd}"`).toString();
    
    // Zorg dat de archive map bestaat
    execSSH(`mkdir -p "${archiveRoot}"`);
    
    // Verplaats het bestand (mv ipv cp om ruimte te besparen op de bronlocatie)
    execSSH(`mv "${photoPath}" "${archiveRoot}/${timestamp}-${path.basename(photoPath)}"`);

    return NextResponse.json({ success: true, archivedPath: `${archiveRoot}/${timestamp}-${path.basename(photoPath)}` });
  } catch (error: any) {
    console.error('Archive error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
