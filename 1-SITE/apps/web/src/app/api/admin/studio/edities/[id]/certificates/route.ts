import { db } from "@/lib/db";
import { orderItems, orders, users } from "@voices/database/src/schema";
import { eq, and, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { CertificateService } from "@/lib/system/certificate-service";

/**
 * 🎓 CERTIFICATE TRIGGER API
 * 🛡️ VOICES OS: Genereert en verzendt certificaten voor een hele editie.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const editionId = parseInt(params.id);

  try {
    // 1. Haal alle deelnemers op voor deze editie
    const participants = await db.query.orderItems.findMany({
      where: eq(orderItems.editionId, editionId),
      with: {
        order: {
          with: {
            user: true
          }
        }
      }
    });

    if (!participants || participants.length === 0) {
      return NextResponse.json({ error: "Geen deelnemers gevonden" }, { status: 404 });
    }

    console.log(`🎓 Starting certificate generation for edition ${editionId} (${participants.length} participants)`);

    // 2. Loop door deelnemers en trigger certificaat (Mock flow voor nu)
    // In een echte productie-omgeving zouden we dit naar een queue sturen
    const results = await Promise.all(participants.map(async (p) => {
      const user = p.order?.user;
      const participantName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || (p.order?.rawMeta as any)?.billing_first_name || 'Deelnemer';
      
      const certData = {
        participantName,
        workshopTitle: p.name || "Workshop",
        instructorName: "Voices Studio",
        date: new Date(),
        orderId: p.orderId || 0
      };

      // 🎓 1. Genereer PDF (Mock)
      const pdfUrl = await CertificateService.generatePdf(certData);
      
      // 📧 2. Hier zou de mail-trigger komen
      console.log(`📧 Mail with certificate ${pdfUrl} would be sent to ${user?.email || 'unknown'}`);

      // 📝 3. Review Request Trigger (Mock)
      console.log(`📝 Review request scheduled for ${user?.email || 'unknown'}`);

      // 🔗 4. Audio Link Trigger (Mock)
      if (p.dropboxUrl) {
        console.log(`🔗 Audio link ${p.dropboxUrl} sent to ${user?.email || 'unknown'}`);
      }
      
      return { email: user?.email, success: true };
    }));

    return NextResponse.json({ 
      success: true, 
      processed: results.length 
    });

  } catch (error) {
    console.error("❌ Error triggering certificates:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
