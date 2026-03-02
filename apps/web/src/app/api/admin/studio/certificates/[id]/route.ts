import { db, orderItems, orders, users, workshopEditions } from '@/lib/system/voices-config';
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { CertificateService } from "@/lib/system/certificate-service";
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
    // 1. Haal deelnemer en order details op
    const participant = await db.query.orderItems.findFirst({
      where: eq(orderItems.id, orderItemId),
      with: {
        order: {
          with: {
            user: true
          }
        }
      }
    });

    if (!participant) {
      return NextResponse.json({ error: "Deelnemer niet gevonden" }, { status: 404 });
    }

    const user = participant.order?.user;
    const itemMeta = typeof participant.metaData === 'string' ? JSON.parse(participant.metaData) : participant.metaData;
    const pInfo = itemMeta?.participant_info || {};
    
    const participantName = `${pInfo.firstName || user?.first_name || ''} ${pInfo.lastName || user?.last_name || ''}`.trim() || "Deelnemer";
    
    // 2. Haal workshop details op via editionId
    let workshopTitle = participant.name || "Workshop";
    let date = new Date();
    
    if (participant.editionId) {
        const edition = await db.query.workshopEditions.findFirst({
            where: eq(workshopEditions.id, participant.editionId),
            with: {
                workshop: true
            }
        });
        if (edition) {
            workshopTitle = edition.workshop?.title || workshopTitle;
            date = new Date(edition.date);
        }
    }

    const certData = {
      participantName,
      workshopTitle,
      instructorName: "Bernadette Timmermans & Johfrah Lefebvre",
      date,
      orderId: participant.orderId || 0
    };

    // 3. Genereer de PDF (Vercel OG approach of Redirect naar generator)
    // Voor nu: We genereren een HTML-gebaseerde preview die we later naar PDF kunnen flatten
    // Als 'download' true is, zouden we hier een PDF streamen.
    
    if (download) {
        // Mock download voor nu - in de volgende stap implementeren we de echte PDF bridge
        return NextResponse.json({ 
            message: "PDF Generation starting...",
            data: certData
        });
    }

    return NextResponse.json({ 
      success: true, 
      data: certData
    });

  } catch (error) {
    console.error(" Error generating certificate:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
