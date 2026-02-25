import { NextResponse } from "next/server";
import { db, costs } from '@/lib/system/db';
import { eq } from "drizzle-orm";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { editionId, costs: newCosts, locationId, instructorId } = await req.json();

  try {
    // 1. Verwijder bestaande kosten voor deze editie om te syncen
    await db.delete(costs).where(eq(costs.workshopEditionId, editionId));

    // 2. Voeg de nieuwe kosten toe
    if (newCosts.length > 0) {
      const costsToInsert = newCosts.map((c: any) => ({
        amount: c.amount.toString(),
        type: c.type,
        journey: 'studio', //  Altijd studio vanuit deze cockpit
        note: c.note,
        workshopEditionId: editionId,
        locationId: c.type === 'locatie' ? locationId : null,
        instructorId: c.type === 'instructeur' ? instructorId : null,
        status: c.status || 'gepland'
      }));

      await db.insert(costs).values(costsToInsert);
    }
      
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Update costs error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
