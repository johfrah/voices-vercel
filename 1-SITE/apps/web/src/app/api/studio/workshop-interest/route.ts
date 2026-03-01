import { db, workshopInterest, systemEvents } from '@/lib/system/voices-config';
import { NextResponse } from 'next/server';

/**
 * Workshop Interest API (Chatty's mandate)
 * Accepts form submissions from WorkshopInterestForm and persists to workshop_interest.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      selectedWorkshops,
      profession,
      age,
      experience,
      goal
    } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Voornaam, familienaam en e-mail zijn verplicht.' },
        { status: 400 }
      );
    }

    const productIds = Array.isArray(selectedWorkshops)
      ? selectedWorkshops.join(',')
      : '';

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let resultId = null;

    try {
      const [result] = await db
        .insert(workshopInterest)
        .values({
          first_name: String(firstName).trim(),
          last_name: String(lastName).trim(),
          email: String(email).trim(),
          profession: profession?.trim() || null,
          age: age ? parseInt(String(age), 10) : null,
          experience: experience?.trim() || null,
          goal: goal?.trim() || null,
          productIds: productIds || null,
          sourceUrl:
            typeof request.headers.get('referer') === 'string'
              ? request.headers.get('referer')
              : null,
          status: 'pending',
          optOutToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          createdAt: new Date()
        })
        .returning();
      resultId = result.id;
    } catch (dbError) {
      console.warn('[Workshop Interest] Drizzle failed, falling back to Supabase SDK:', dbError);
      const { data: sdkResult, error: sdkError } = await supabase
        .from('workshop_interest')
        .insert({
          first_name: String(firstName).trim(),
          last_name: String(lastName).trim(),
          email: String(email).trim(),
          profession: profession?.trim() || null,
          age: age ? parseInt(String(age), 10) : null,
          experience: experience?.trim() || null,
          goal: goal?.trim() || null,
          product_ids: productIds || null,
          source_url: request.headers.get('referer'),
          status: 'pending',
          opt_out_token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          created_at: new Date()
        })
        .select()
        .single();
      
      if (sdkError) throw sdkError;
      resultId = sdkResult.id;
    }

    try {
      await supabase.from('system_events').insert({
        source: 'workshop_interest_api',
        level: 'info',
        message: `Workshop interest: ${email} voor ${productIds || 'geen workshops'}`,
        details: { interestId: resultId },
        created_at: new Date()
      });
    } catch (e) {
      console.warn('[Workshop Interest] Failed to log event:', e);
    }

    return NextResponse.json({
      success: true,
      id: resultId
    });
  } catch (error) {
    console.error('Workshop interest API error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}
