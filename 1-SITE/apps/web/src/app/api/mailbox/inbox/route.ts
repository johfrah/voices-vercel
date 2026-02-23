import { db } from '@db';
import { mailContent } from '@db/schema';
import { DirectMailService } from '@/lib/services/DirectMailService';
import { desc, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  MAILBOX INBOX API (VOICES ENGINE 2026)
 * 
 * Doel: Razendsnel ophalen en sorteren van mails.
 * Ondersteunt commercile prioriteit en database-first architectuur.
 *  ENKEL voor admins.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const folder = searchParams.get('folder') || 'INBOX';
    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'voices.be');
    const market = MarketManager.getCurrentMarket(host);
    const account = searchParams.get('account') || market.email;
    const sortByValue = searchParams.get('sortByValue') === 'true';

    // 🛡️ CHRIS-PROTOCOL: Filter internal slop based on market domains
    const domains = MarketManager.getMarketDomains();
    const internalFilter = Object.values(domains)
      .map(d => `sender NOT ILIKE '%${d.replace('https://www.', '').replace('https://', '')}%'`)
      .join(' AND ');

    try {
      console.log(` API Mailbox Inbox: Fetching folder ${folder} for account ${account} (${market.market_code})...`);
      
      // 1. Probeer Direct IMAP (alleen als offset 0 is, voor live data)
      if (offset === 0 && account !== 'all') {
        try {
          const mailService = DirectMailService.getInstance();
        } catch (directError: any) {
          console.error(' API Mailbox Inbox: Direct IMAP fetch failed:', directError.message);
        }
      }
      let query = db.select({
        id: mailContent.id,
        uid: mailContent.uid,
        sender: mailContent.sender,
        subject: mailContent.subject,
        date: mailContent.date,
        threadId: mailContent.messageId,
        preview: sql<string>`substring(text_body from 1 for 100)`,
        iapContext: mailContent.iapContext,
        isSuperPrivate: mailContent.isSuperPrivate,
        accountId: mailContent.accountId
      })
      .from(mailContent)
      .where(
        sql`id IN (
          SELECT MAX(id)
          FROM mail_content
          WHERE ${
            account === 'all' 
              ? sql.raw(internalFilter)
              : sql`account_id = ${account} AND sender NOT ILIKE ${'%' + account + '%'}`
          }
          GROUP BY COALESCE(message_id, uid::text)
        )`
      )
      .$dynamic();

      if (sortByValue) {
        //  Sorteer op commercile waarde (offerte-aanvragen eerst)
        query = query.orderBy(
          sql`CASE WHEN iap_context->>'intent' = 'quote_request' THEN 0 ELSE 1 END`,
          desc(mailContent.date)
        );
      } else {
        query = query.orderBy(desc(mailContent.date));
      }

      const mails = await query.offset(offset).limit(limit);
      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(mailContent)
        .where(
          sql`id IN (
            SELECT MAX(id)
            FROM mail_content
            WHERE ${
              account === 'all' 
                ? sql.raw(internalFilter)
                : sql`account_id = ${account} AND sender NOT ILIKE ${'%' + account + '%'}`
            }
            GROUP BY COALESCE(message_id, uid::text)
          )`
        );
    const totalCount = countResult[0].count;

    const formattedMails = mails.map(mail => {
      const iapContext = mail.iapContext as any;
      let avatarUrl = iapContext?.avatarUrl || null;
      
      //  Check of er bijlagen zijn (iapContext kan dit bevatten van de sync engine)
      const hasAttachments = iapContext?.hasAttachments || false;

      return {
        ...mail,
        id: mail.id.toString(),
        date: mail.date ? mail.date.toISOString() : new Date().toISOString(),
        preview: mail.preview || '',
        avatarUrl,
        hasAttachments
      };
    });

    return NextResponse.json({
      mails: formattedMails,
      totalCount: totalCount
    });
  } catch (error) {
    console.error(' Mailbox API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
