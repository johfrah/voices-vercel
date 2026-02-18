import { NextResponse } from 'next/server';
import { db } from '@db';
import { utmTouchpoints } from '@db/schema';
import { eq, count } from 'drizzle-orm';

/**
 * PREDICTIVE LEAD SCORING (NUCLEAR LOGIC 2026)
 * 
 * Analyseert user behavior en UTM touchpoints om de 'koopbereidheid' te scoren.
 * Direct gekoppeld aan het Backoffice Dashboard.
 */

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // 1. Fetch user touchpoints from Supabase
    const touchpoints = await db.select()
      .from(utmTouchpoints)
      .where(eq(utmTouchpoints.userId, userId));

    // 2. Scoring Logic (Predictive)
    let score = 0;
    
    touchpoints.forEach(tp => {
      if (tp.source === 'google') score += 10;
      if (tp.source === 'linkedin') score += 20;
      if (tp.campaign?.includes('commercial')) score += 30;
    });

    // 3. Activity Weight
    const activityBonus = Math.min(touchpoints.length * 5, 40);
    score += activityBonus;

    return NextResponse.json({
      userId,
      predictiveScore: Math.min(score, 100),
      vibe: score > 70 ? 'Hot Lead' : score > 30 ? 'Warm Lead' : 'Cold Lead',
      recommendation: score > 70 ? 'Direct contact opnemen' : 'Nurture via email',
      lastSeen: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({ error: 'Lead scoring failed' }, { status: 500 });
  }
}
