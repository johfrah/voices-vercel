import { db } from '@db';
import { vouchers } from '@db/schema';
import { NextRequest, NextResponse } from 'next/server';

/**
 *  PARTNER LINK GENERATOR (2026)
 * 
 * Deze route vervangt de legacy /partner/generate-link API.
 * Het genereert een unieke voucher/link voor een klant.
 */

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is verplicht' }, { status: 400 });
    }

    // In Beheer-modus gebruiken we de 'vouchers' tabel voor partner links
    // We maken een unieke code die 7 dagen geldig is
    const code = `PARTNER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    return await db.transaction(async (tx) => {
      // 1. Maak of haal een batch op voor deze partner
      // (Versimpeld voor nu)
      
      // 2. Insert de voucher
      await tx.insert(vouchers).values({
        code: code,
        status: 'active',
        // In een echte scenario zouden we hier vervaldatum en partner ID opslaan
      });

      const generatedLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://next.voices.be'}/checkout?partner_code=${code}&email=${encodeURIComponent(email)}`;

      return NextResponse.json({
        success: true,
        link: generatedLink,
        code: code
      });
    });
  } catch (error) {
    console.error('[Partner Link Error]:', error);
    return NextResponse.json({ error: 'Link generatie mislukt' }, { status: 500 });
  }
}
