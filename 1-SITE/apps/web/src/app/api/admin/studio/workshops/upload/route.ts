import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 *  ADMIN STUDIO VIDEO UPLOAD API (2026)
 * 
 * Verwerkt video uploads voor workshops naar Supabase Storage.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const journey = formData.get('journey') as string || 'studio';
    const category = formData.get('category') as string || 'workshops';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      throw new Error('Supabase Admin client could not be initialized');
    }
    
    //  CHRIS-PROTOCOL: Forensic naming
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = `active/${journey}/${category}/${fileName}`;

    //  CHRIS-PROTOCOL: Explicitly use 'voices' bucket
    const BUCKET_NAME = 'voices';
    
    console.log(` ADMIN: Uploading video to bucket '${BUCKET_NAME}', path: ${filePath}`);
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error(' Supabase Video Upload Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Genereer publieke URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    //  CHRIS-PROTOCOL: Create a record in the 'media' table
    const { db } = await import('@/lib/sync/bridge');
    const { media } = await import('@db/schema');
    
    const mediaResult = await db.insert(media).values({
      fileName: fileName,
      filePath: filePath,
      fileType: file.type,
      fileSize: file.size,
      journey: journey,
      category: category,
      isPublic: true,
      isManuallyEdited: true,
      updatedAt: new Date()
    }).returning();

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      mediaId: mediaResult[0].id
    });

  } catch (error: any) {
    console.error(' VIDEO UPLOAD FAILURE:', error);
    return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 });
  }
}
