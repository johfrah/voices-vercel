import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from "next/server";
import { CertificateService } from "@/lib/system/certificate-service";
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  CERTIFICATE TRIGGER API
 *  VOICES OS: Genereert en verzendt certificaten voor een hele editie.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const editionId = parseInt(params.id);
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const participantsResult: any = await db.execute(sql`
      select
        oi.id,
        oi.order_id,
        oi.name,
        oi.dropbox_url,
        o.raw_meta,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email
      from order_items oi
      left join orders o on o.id = oi.order_id
      left join users u on u.id = o.user_id
      where oi.edition_id = ${editionId}
      order by oi.id asc
    `);
    const participants = Array.isArray(participantsResult)
      ? participantsResult
      : Array.isArray(participantsResult?.rows)
        ? participantsResult.rows
        : [];

    if (!participants || participants.length === 0) {
      return NextResponse.json({ error: "Geen deelnemers gevonden" }, { status: 404 });
    }

    console.log(` Starting certificate generation for edition ${editionId} (${participants.length} participants)`);

    // 2. Loop door deelnemers en trigger certificaat (Mock flow voor nu)
    // In een echte productie-omgeving zouden we dit naar een queue sturen
    const parseMeta = (rawMeta: unknown): Record<string, any> => {
      if (!rawMeta) return {};
      if (typeof rawMeta === 'object' && !Array.isArray(rawMeta)) return rawMeta as Record<string, any>;
      if (typeof rawMeta === 'string') {
        try {
          const parsed = JSON.parse(rawMeta);
          return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
          return {};
        }
      }
      return {};
    };

    const results = await Promise.all(participants.map(async (p: any) => {
      const rawMeta = parseMeta(p.raw_meta);
      const participantName =
        `${p.user_first_name || ''} ${p.user_last_name || ''}`.trim() ||
        rawMeta?._billing_first_name ||
        rawMeta?.billing?.first_name ||
        'Deelnemer';
      
      const certData = {
        participantName,
        workshopTitle: p.name || "Workshop",
        instructorName: "Voices Studio",
        date: new Date(),
        orderId: Number(p.order_id || 0)
      };

      //  1. Genereer PDF (Mock)
      const pdfUrl = await CertificateService.generatePdf(certData);
      
      //  2. Hier zou de mail-trigger komen
      console.log(` Mail with certificate ${pdfUrl} would be sent to ${p.user_email || 'unknown'}`);

      //  3. Review Request Trigger (Mock)
      console.log(` Review request scheduled for ${p.user_email || 'unknown'}`);

      //  4. Audio Link Trigger (Mock)
      if (p.dropbox_url) {
        console.log(` Audio link ${p.dropbox_url} sent to ${p.user_email || 'unknown'}`);
      }
      
      return { email: p.user_email, success: true };
    }));

    return NextResponse.json({ 
      success: true, 
      processed: results.length 
    });

  } catch (error) {
    console.error(" Error triggering certificates:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
