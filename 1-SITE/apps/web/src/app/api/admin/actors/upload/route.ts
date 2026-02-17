import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 *  ADMIN PHOTO UPLOAD API (GOD MODE 2026)
 * 
 * Verwerkt foto uploads naar Supabase Storage.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      throw new Error('Supabase Admin client could not be initialized');
    }
    
    //  CHRIS-PROTOCOL: Forensic naming
    const timestamp = Date.now();
    const originalExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = `active/voicecards/${fileName}`;

    //  CHRIS-PROTOCOL: Explicitly use 'voices' bucket
    const BUCKET_NAME = 'voices';
    
    console.log(` ADMIN: Uploading to bucket '${BUCKET_NAME}', path: ${filePath}`);
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType: file.type || `image/${originalExtension === 'png' ? 'png' : 'jpeg'}`,
        upsert: true
      });

    if (error) {
      console.error(' Supabase Upload Error Details:', {
        message: error.message,
        name: (error as any).name,
        status: (error as any).status,
        stack: (error as any).stack
      });
      return NextResponse.json({ error: error.message, _forensic: 'Supabase storage upload failed' }, { status: 500 });
    }

    // Genereer publieke URL
    const { data: { publicUrl } } = supabase.storage
      .from('voices')
      .getPublicUrl(filePath);
    
    //  CHRIS-PROTOCOL: Use the proxied URL for immediate frontend display
    const proxiedUrl = `/api/proxy/?path=${encodeURIComponent(filePath)}`;

    //  CHRIS-PROTOCOL: Create a record in the 'media' table to ensure relational integrity
    console.log(' ADMIN: Linking in media table...');
    const { db } = await import('@/lib/sync/bridge');
    const { media } = await import('@db/schema');
    
    try {
      const mediaResult = await db.insert(media).values({
        fileName: fileName,
        filePath: filePath,
        fileType: file.type || 'image/jpeg',
        fileSize: file.size,
        journey: 'agency',
        category: 'voices',
        isPublic: true,
        isManuallyEdited: true,
        updatedAt: new Date()
      }).returning();

      console.log(' ADMIN: Media record created:', mediaResult[0].id);

      return NextResponse.json({ 
        success: true, 
        url: proxiedUrl,
        publicUrl: publicUrl,
        path: filePath,
        mediaId: mediaResult[0].id,
        _forensic: `Photo uploaded successfully to ${filePath} and linked in media table (ID: ${mediaResult[0].id})`
      });
    } catch (dbError: any) {
      console.error(' ADMIN: DB Link Failure:', dbError);
      // We hebben de file al geupload, dus we geven de URL terug maar loggen de error
      return NextResponse.json({ 
        success: true, 
        url: proxiedUrl,
        publicUrl: publicUrl,
        path: filePath,
        _warning: 'File uploaded but failed to link in database',
        _error: dbError.message
      });
    }

  } catch (error: any) {
    console.error(' UPLOAD FAILURE:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error.message 
    }, { status: 500 });
  }
}
