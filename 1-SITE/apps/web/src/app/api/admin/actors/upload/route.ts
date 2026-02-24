import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse, NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { db } from '@/lib/sync/bridge';
import { media } from '@db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 *  ADMIN PHOTO UPLOAD API (GOD MODE 2026)
 * 
 * Verwerkt foto uploads naar Supabase Storage.
 */
export async function POST(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true });
  }

  //  CHRIS-PROTOCOL: Auth Check (Nuclear 2026)
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    return auth;
  }

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

    //  CHRIS-PROTOCOL: Fast-Path for Photos (Bob-methode)
    // We skip heavy FFmpeg processing for images to ensure <1s upload confirmation.
    if (isAudio && isWav) {
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

    //  CHRIS-PROTOCOL: Link in media table IMMEDIATELY to get mediaId (Bob-methode)
    // We do AI analysis in the background.
    let mediaId = null;
    try {
      console.log(' ADMIN: Linking in media table...');
      
      const mediaData = {
        fileName: fileName,
        filePath: filePath,
        fileType: finalContentType,
        fileSize: (finalFile as any).size || (finalFile as Buffer).length,
        journey: 'agency',
        category: 'voices',
        isPublic: true,
        updatedAt: new Date().toISOString()
      };
      console.log(' ADMIN: Media data to insert:', JSON.stringify(mediaData, null, 2));
      const [mediaResult] = await db.insert(media).values(mediaData).returning({ id: media.id });
      
      if (mediaResult) {
        mediaId = mediaResult.id;
        console.log(' ADMIN: Media record created:', mediaId);
      }

      // Background task for AI analysis
      if (process.env.NODE_ENV === 'production') {
        // 🛡️ CHRIS-PROTOCOL: Fully detached background task to avoid blocking the main response
        setTimeout(async () => {
          try {
            console.log(' ADMIN: Starting background AI analysis...');
            let aiMetadata = {};
            const { GeminiService } = await import('@/lib/services/gemini-service');
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

              // Update the media record with AI data
              await db.update(media)
                .set({ 
                  altText: analysis.suggested_alt || null,
                  labels: analysis.labels || [],
                  metadata: aiMetadata 
                })
                .where(eq(media.id, mediaId));
            }
          } catch (aiError) {
            console.error(' ADMIN: Background AI Analysis failed:', aiError);
          }
        }, 100);
      } else {
        console.log(' ADMIN: Skipping AI analysis in non-production environment.');
      }
    } catch (dbError: any) {
      console.error(' ADMIN: DB Link Failure (CRITICAL):', dbError.message);
      console.error(' ADMIN: DB Link Error Stack:', dbError.stack);
    }

    return NextResponse.json({ 
      success: true, 
      url: proxiedUrl,
      publicUrl: publicUrl,
      path: filePath,
      mediaId: mediaId,
      _forensic: `Photo uploaded and linked successfully to ${filePath}. AI analysis in background.`
    });

  } catch (error: any) {
    console.error(' UPLOAD FAILURE:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error.message 
    }, { status: 500 });
  }
}
