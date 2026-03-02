import { db } from '@/lib/system/voices-config';
import { costs } from '@/lib/system/voices-config';
import { NextRequest, NextResponse } from "next/server";

/**
 *  COSTS API
 *  VOICES OS: Beheer van vaste en variabele kosten.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newCost = await db.insert(costs).values({
      amount: body.amount.toString(),
      type: body.type,
      journey: body.journey || 'studio',
      note: body.note,
      date: new Date(body.date),
      isPartnerPayout: body.isPartnerPayout || false,
      status: body.status || 'betaald',
      workshopEditionId: body.workshopEditionId || null,
    }).returning();

    return NextResponse.json({ success: true, cost: newCost[0] });
  } catch (error) {
    console.error(" Error saving cost:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
