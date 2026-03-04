import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/api-auth";

/**
 *  CERTIFICATE GENERATION API (2026)
 *  VOICES OS: Genereert een PDF certificaat voor een specifieke deelnemer.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const orderItemId = parseInt(params.id);
  const { searchParams } = new URL(request.url);
  const download = searchParams.get('download') === 'true';

  try {
    const participantResult: any = await db.execute(sql`
      select
        oi.id as order_item_id,
        oi.order_id,
        oi.name as item_name,
        oi.meta_data,
        oi.edition_id,
        o.raw_meta,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        we.date as edition_date,
        w.title as workshop_title
      from order_items oi
      left join orders o on o.id = oi.order_id
      left join users u on u.id = o.user_id
      left join workshop_editions we on we.id = oi.edition_id
      left join workshops w on w.id = we.workshop_id
      where oi.id = ${orderItemId}
      limit 1
    `);
    const participantRows = Array.isArray(participantResult)
      ? participantResult
      : Array.isArray(participantResult?.rows)
        ? participantResult.rows
        : [];
    const participant = participantRows[0];

    if (!participant) {
      return NextResponse.json({ error: "Deelnemer niet gevonden" }, { status: 404 });
    }

    const parseJson = (value: unknown): Record<string, any> => {
      if (!value) return {};
      if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, any>;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
          return {};
        }
      }
      return {};
    };

    const itemMeta = parseJson(participant.meta_data);
    const orderMeta = parseJson(participant.raw_meta);
    const pInfo = itemMeta?.participant_info || {};
    
    const participantName =
      `${pInfo.firstName || participant.user_first_name || ''} ${pInfo.lastName || participant.user_last_name || ''}`.trim() ||
      orderMeta?._billing_first_name ||
      orderMeta?.billing?.first_name ||
      "Deelnemer";
    
    const workshopTitle = participant.workshop_title || participant.item_name || "Workshop";
    const date = participant.edition_date ? new Date(participant.edition_date) : new Date();

    const certData = {
      participantName,
      workshopTitle,
      instructorName: "Bernadette Timmermans & Johfrah Lefebvre",
      date,
      orderId: Number(participant.order_id || 0)
    };

    if (download) {
      const pdfBuffer = buildCertificatePdf(certData);
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=\"certificate-${orderItemId}.pdf\"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: certData,
      downloadUrl: `/api/admin/studio/certificates/${orderItemId}?download=true`,
    });

  } catch (error) {
    console.error(" Error generating certificate:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function escapePdfText(value: string): string {
  return String(value || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildCertificatePdf(cert: {
  participantName: string;
  workshopTitle: string;
  instructorName: string;
  date: Date;
  orderId: number;
}): Buffer {
  const dateLabel = cert.date.toISOString().slice(0, 10);
  const textLines = [
    'Voices Workshop Certificaat',
    `Deelnemer: ${cert.participantName}`,
    `Workshop: ${cert.workshopTitle}`,
    `Instructeur: ${cert.instructorName}`,
    `Datum: ${dateLabel}`,
    `Order ID: ${cert.orderId}`,
  ];

  const stream = [
    'BT',
    '/F1 22 Tf',
    '72 780 Td',
    `(${escapePdfText(textLines[0])}) Tj`,
    '0 -34 Td',
    '/F1 13 Tf',
    `(${escapePdfText(textLines[1])}) Tj`,
    '0 -22 Td',
    `(${escapePdfText(textLines[2])}) Tj`,
    '0 -22 Td',
    `(${escapePdfText(textLines[3])}) Tj`,
    '0 -22 Td',
    `(${escapePdfText(textLines[4])}) Tj`,
    '0 -22 Td',
    `(${escapePdfText(textLines[5])}) Tj`,
    'ET',
  ].join('\n');

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const objectBody of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += objectBody;
  }

  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}
