import { db, courseSubmissions, users } from '@/lib/system/voices-config';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { DropboxService } from '@/lib/services/dropbox-service';
import { eq } from 'drizzle-orm';

/**
 * ACADEMY SUBMISSION HANDLER
 * 
 * Verwerkt audio-inzendingen van studenten via Drizzle ORM.
 *  ATOMIC CRUD: Gewikkeld in db.transaction()
 */

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as Blob;
    const lessonId = formData.get('lesson_id') as string;
    const userId = formData.get('user_id') as string;

    if (!audio || !lessonId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error('[Academy] Supabase URL or SERVICE_ROLE_KEY missing');
      return NextResponse.json({ error: 'Storage service unavailable' }, { status: 503 });
    }

    const supabase = createClient(url, key);

    // 1. Upload to Supabase Storage
    const fileName = `academy/${userId}/lesson-${lessonId}-${Date.now()}.webm`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-submissions')
      .upload(fileName, audio);

    if (uploadError) throw uploadError;

    // 2. Register in Database via Atomic Transaction
    const result = await db.transaction(async (tx: any) => {
      const [submission] = await tx.insert(courseSubmissions).values({
        user_id: parseInt(userId),
        lessonId: parseInt(lessonId),
        filePath: uploadData.path,
        status: 'pending',
        submittedAt: new Date()
      }).returning();

      return submission;
    });

    // 3. Sync to Dropbox for Coach Review (God Mode Activation)
    let user: any = null;
    try {
      const [dbUser] = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
      user = dbUser;
    } catch (dbError) {
      console.warn(' Academy Submit Drizzle user fetch failed, falling back to SDK');
      const { data } = await supabase.from('users').select('*').eq('id', parseInt(userId)).single();
      user = data;
    }

    if (user) {
      const dropbox = DropboxService.getInstance();
      await dropbox.syncToControlFolder(
        `ACADEMY-${result.id}`,
        `${user.first_name || user.first_name || 'Student'} ${user.last_name || user.last_name || ''}`.trim(),
        `Les ${lessonId} Inzending`
      );
    }

    console.log(` Academy Submission: ${result.filePath} by user ${userId} (Synced to Dropbox)`);

    return NextResponse.json({
      success: true,
      submissionId: result.id,
      path: result.filePath,
      message: 'Submission received and stored in Supabase.'
    });

  } catch (error) {
    console.error(' Core Academy Submission Error:', error);
    return NextResponse.json({ 
      error: 'Submission failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
