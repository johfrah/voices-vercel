import { db, mailContent, vaultFiles } from '@/lib/system/voices-config';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 *  MAILBOX MESSAGE API (DATABASE-FIRST 2026)
 * 
 * Haalt de volledige inhoud van een mail op uit de database.
 * Inclusief bijlagen uit de Vault.
 */
export async function GET(
  request: Request,
  { params }: { params: { uid: string } }
) {
  const mailId = parseInt(params.uid);

  if (isNaN(mailId)) {
    return NextResponse.json({ error: 'Invalid Mail ID' }, { status: 400 });
  }

  try {
    // 1. Haal alle mails uit dezelfde thread op
    const mail = await db.query.mailContent.findFirst({
      where: eq(mailContent.id, mailId)
    });

    if (!mail) {
      return NextResponse.json({ error: 'Mail not found' }, { status: 404 });
    }

    const threadMails = await db.query.mailContent.findMany({
      where: eq(mailContent.messageId, mail.messageId || mail.uid.toString()),
      orderBy: (mailContent, { asc }) => [asc(mailContent.date)]
    });

    // 2. Haal bijlagen op voor alle mails in de thread
    const allAttachments = await Promise.all(threadMails.map(async (m) => {
      // Zoek naar files die:
      // 1. Gelinkt zijn aan dit customerId
      // 2. OF gelinkt zijn aan dit accountId en rond dezelfde tijd zijn aangemaakt
      const atts = await db.query.vaultFiles.findMany({
        where: sql`${vaultFiles.customerId} = ${(m.iapContext as any)?.user_id || 0} 
                   OR (${vaultFiles.accountId} = ${m.accountId} 
                       AND ABS(EXTRACT(EPOCH FROM ${vaultFiles.createdAt}) - EXTRACT(EPOCH FROM ${m.date})) < 600)`,
        orderBy: (vaultFiles, { desc }) => [desc(vaultFiles.createdAt)],
        limit: 20
      });
      
      return atts.map(att => ({
        id: att.id,
        filename: att.originalName,
        category: att.category,
        size: att.fileSize,
        path: att.filePath,
        mailId: m.id
      }));
    }));

    const flatAttachments = allAttachments.flat();

    return NextResponse.json({
      id: mail.messageId || mail.uid.toString(),
      subject: mail.subject,
      messages: threadMails.map(m => ({
        id: m.id,
        sender: m.sender,
        senderEmail: m.sender?.replace(/.*<(.+)>$/, '$1').toLowerCase().trim() || '',
        date: m.date?.toISOString(),
        htmlBody: m.htmlBody,
        textBody: m.textBody,
        isSuperPrivate: m.isSuperPrivate,
        attachments: flatAttachments.filter(a => a.mailId === m.id)
      }))
    });
  } catch (error) {
    console.error(' Mailbox Message API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
