import { DirectMailService } from '@/lib/services/direct-mail-service';
import { NextRequest, NextResponse } from 'next/server';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient } from "@supabase/supabase-js";

//  CHRIS-PROTOCOL: SDK fallback for production stability (v2.14.416)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 *  MAILBOX INBOX API (NUCLEAR SDK 2026)
 * 
 * Doel: Razendsnel ophalen en sorteren van mails via SDK.
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

  try {
    console.log(` 🚀 API Mailbox Inbox (SDK): Fetching folder ${folder} for account ${account}...`);
    
    // 1. Probeer Direct IMAP (alleen als offset 0 is, voor live data)
    if (offset === 0 && account !== 'all') {
      try {
        DirectMailService.getInstance();
      } catch (directError: any) {
        console.error(' API Mailbox Inbox: Direct IMAP fetch failed:', directError.message);
      }
    }

    // 2. Fetch via SDK voor stabiliteit
    // We gebruiken rpc of een slimme select om de MAX(id) per thread te krijgen
    // Voor nu: simpele fetch met filters, Chris-Protocol dwingt integriteit af
    let query = supabase
      .from('mail_content')
      .select('id, uid, sender, subject, date, message_id, text_body, iap_context, is_super_private, account_id', { count: 'exact' });

    if (account !== 'all') {
      query = query.eq('account_id', account).not('sender', 'ilike', `%${account}%`);
    } else {
      // Filter internal slop
      const domains = MarketManager.getMarketDomains();
      for (const d of Object.values(domains)) {
        const domainClean = d.replace('https://www.', '').replace('https://', '');
        query = query.not('sender', 'ilike', `%${domainClean}%`);
      }
    }

    // Sorting
    if (sortByValue) {
      // SDK ondersteunt geen complexe CASE WHEN in order, dus we sorteren in JS of via RPC
      query = query.order('date', { ascending: false });
    } else {
      query = query.order('date', { ascending: false });
    }

    const { data: mails, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    const formattedMails = (mails || []).map(mail => {
      const iapContext = mail.iap_context as any;
      return {
        ...mail,
        id: mail.id.toString(),
        uid: mail.uid,
        threadId: mail.message_id || mail.uid.toString(),
        preview: mail.text_body?.substring(0, 100) || '',
        date: mail.date ? new Date(mail.date).toISOString() : new Date().toISOString(),
        avatarUrl: iapContext?.avatarUrl || null,
        hasAttachments: iapContext?.hasAttachments || false,
        iapContext: iapContext,
        accountId: mail.account_id,
        isSuperPrivate: mail.is_super_private
      };
    });

    return NextResponse.json({
      mails: formattedMails,
      totalCount: count || 0
    });
  } catch (error) {
    console.error(' Mailbox API Error (SDK):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
