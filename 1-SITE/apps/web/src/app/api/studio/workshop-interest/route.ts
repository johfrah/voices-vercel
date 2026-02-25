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

    const [result] = await db
      .insert(workshopInterest)
      .values({
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
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
        optOutToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      })
      .returning();

    await db.insert(systemEvents).values({
      source: 'workshop_interest_api',
      level: 'info',
      message: `Workshop interest: ${email} voor ${productIds || 'geen workshops'}`,
      details: { interestId: result.id }
    });

    return NextResponse.json({
      success: true,
      id: result.id
    });
  } catch (error) {
    console.error('Workshop interest API error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}
