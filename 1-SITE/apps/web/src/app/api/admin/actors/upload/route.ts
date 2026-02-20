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
    const originalExtension = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(originalExtension);
    const isWav = originalExtension === 'wav';
    
    let fileName = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
    let filePath = isAudio ? `active/demos/${fileName}` : `active/voicecards/${fileName}`;
    let finalFile: File | Buffer = file;
    let finalContentType = file.type || (isAudio ? `audio/${originalExtension === 'mp3' ? 'mpeg' : originalExtension}` : `image/${originalExtension === 'png' ? 'png' : (originalExtension === 'webp' ? 'webp' : 'jpeg')}`);

    //  CHRIS-PROTOCOL: Auto-convert WAV to MP3 for better web performance (Bob-methode)
    if (isWav) {
      console.log(' ADMIN: WAV detected, initiating MP3 conversion...');
      try {
        const ffmpeg = (await import('fluent-ffmpeg')).default;
        const { Readable, Writable } = await import('stream');
        
        const inputBuffer = Buffer.from(await file.arrayBuffer());
        const inputStream = new Readable();
        inputStream.push(inputBuffer);
        inputStream.push(null);

        const chunks: any[] = [];
        const outputStream = new Writable({
          write(chunk, encoding, callback) {
            chunks.push(chunk);
            callback();
          }
        });

        await new Promise((resolve, reject) => {
          ffmpeg(inputStream)
            .toFormat('mp3')
            .audioBitrate('192k')
            .on('error', (err) => {
              console.error(' FFmpeg Error:', err);
              reject(err);
            })
            .on('end', () => {
              console.log(' ADMIN: MP3 conversion complete');
              resolve(true);
            })
            .pipe(outputStream);
        });

        finalFile = Buffer.concat(chunks);
        fileName = fileName.replace(/\.wav$/i, '.mp3');
        filePath = filePath.replace(/\.wav$/i, '.mp3');
        finalContentType = 'audio/mpeg';
      } catch (convError) {
        console.error(' ADMIN: Conversion failed, falling back to original WAV:', convError);
        // Fallback is automatic as finalFile remains the original file
      }
    }

    //  CHRIS-PROTOCOL: Explicitly use 'voices' bucket
    const BUCKET_NAME = 'voices';
    
    console.log(` ADMIN: Uploading to bucket '${BUCKET_NAME}', path: ${filePath}`);
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, finalFile, {
        contentType: finalContentType,
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

    //  CHRIS-PROTOCOL: Return immediately for maximum speed (Bob-methode)
    // We link in the media table in the background to not block the UI
    const responseData = { 
      success: true, 
      url: proxiedUrl,
      publicUrl: publicUrl,
      path: filePath,
      _forensic: `Photo uploaded successfully to ${filePath}. Linking in background.`
    };

    // Background task for DB linking and AI analysis
    const mediaPromise = (async () => {
      try {
        console.log(' ADMIN: Linking in media table (background)...');
        const { db } = await import('@/lib/sync/bridge');
        const { media } = await import('@db/schema');
        
        //  CHRIS-PROTOCOL: AI Intelligence (2026)
        // We analyze the image in the background to generate labels and alt-text
        let aiMetadata = {};
        try {
          const { GeminiService } = await import('@/services/GeminiService');
          const gemini = GeminiService.getInstance();
          const buffer = Buffer.from(await file.arrayBuffer());
          const analysis = await gemini.analyzeImage(buffer, file.type || 'image/webp', {
            fileName,
            path: filePath,
            source: 'admin-upload'
          });
          
          if (analysis) {
            console.log(' ADMIN: AI Image Analysis complete:', analysis.vibe);
            aiMetadata = {
              ai_description: analysis.description,
              ai_vibe: analysis.vibe,
              ai_labels: analysis.labels,
              ai_confidence: analysis.confidence,
              suggested_alt: analysis.suggested_alt
            };
          }
        } catch (aiError) {
          console.error(' ADMIN: AI Analysis failed (silent fallback):', aiError);
        }

        const [mediaResult] = await db.insert(media).values({
          fileName: fileName,
          filePath: filePath,
          fileType: file.type || 'image/webp',
          fileSize: file.size,
          journey: 'agency',
          category: 'voices',
          isPublic: true,
          isManuallyEdited: true,
          altText: (aiMetadata as any).suggested_alt || null,
          labels: (aiMetadata as any).ai_labels || [],
          metadata: aiMetadata,
          updatedAt: new Date()
        }).returning({ id: media.id });
        console.log(' ADMIN: Media record created in background:', mediaResult.id);
        return mediaResult.id;
      } catch (dbError: any) {
        console.error(' ADMIN: Background DB Link Failure:', dbError);
        return 0;
      }
    })();

    // Wait for media record creation if it's fast enough
    const mediaId = await Promise.race([
      mediaPromise,
      new Promise<number>(resolve => setTimeout(() => resolve(0), 2000))
    ]);

    return NextResponse.json({
      ...responseData,
      mediaId: mediaId
    });

  } catch (error: any) {
    console.error(' UPLOAD FAILURE:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error.message 
    }, { status: 500 });
  }
}
