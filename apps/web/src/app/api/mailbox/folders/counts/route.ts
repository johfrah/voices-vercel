import { db } from '@/lib/system/voices-config';
import { mailContent } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  MAILBOX FOLDER COUNTS API (2026)
 * 
 * Doel: Snel ophalen van bericht-aantallen per folder.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const account = searchParams.get('account') || 'all';

  try {
    // We tellen alleen de unieke threads per folder
    const counts: Record<string, number> = {};
    
    const folders = ['INBOX', 'INBOX.Archive', 'Sent', 'Trash'];
    
    for (const folder of folders) {
      const result = await db.select({ 
        count: sql<number>`count(distinct coalesce(message_id, uid::text))` 
      })
      .from(mailContent)
      .where(
        sql`(${account} = 'all' OR account_id = ${account})`
      );
      
      counts[folder] = Number(result[0]?.count || 0);
    }

    return NextResponse.json(counts);
  } catch (error) {
    console.error(' Mailbox Counts API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
