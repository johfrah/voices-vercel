import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse, NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { ServerWatchdog } from '@/lib/services/server-watchdog';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * 🛡️ CHRIS-PROTOCOL: SUPABASE SDK PHOTO UPLOAD (v2.14.520)
 * 
 * We use the Supabase SDK for both Storage and Database operations
 * to ensure 100% stability on Vercel and bypass Drizzle monorepo issues.
 */
export async function POST(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const timestamp = Date.now();
    const originalExtension = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(originalExtension);
    
    const fileName = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = isAudio ? `active/demos/${fileName}` : `active/voicecards/${fileName}`;
    const contentType = file.type || (isAudio ? 'audio/mpeg' : 'image/webp');

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('voices')
      .upload(filePath, file, {
        contentType,
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // 2. Create Media Record via SDK
    const { data: mediaResult, error: mediaError } = await supabase
      .from('media')
      .insert({
        file_name: fileName,
        file_path: filePath,
        file_type: contentType,
        file_size: file.size,
        journey: 'agency',
        category: 'voices',
        is_public: true,
        labels: ['admin-upload']
      })
      .select()
      .single();

    if (mediaError) {
      throw new Error(`Database media link failed: ${mediaError.message}`);
    }

    const proxiedUrl = `/api/proxy/?path=${encodeURIComponent(filePath)}`;

    return NextResponse.json({ 
      success: true, 
      url: proxiedUrl,
      path: filePath,
      mediaId: mediaResult.id,
      _forensic: `Photo uploaded and linked successfully via SDK.`
    });

  } catch (error: any) {
    console.error(' [SDK-UPLOAD] CRASH:', error);
    
    await ServerWatchdog.report({
      level: 'critical',
      component: 'AdminPhotoUploadAPI',
      error: `Upload crash: ${error.message}`,
      stack: error.stack,
      url: request.url
    });

    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error.message 
    }, { status: 500 });
  }
}
