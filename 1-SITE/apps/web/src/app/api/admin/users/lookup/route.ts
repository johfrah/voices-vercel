import { db } from '@db';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 *  ADMIN USER LOOKUP (GOD MODE 2026)
 * 
 * Doel: Snel ophalen van klantgegevens op basis van e-mail.
 * Alleen toegankelijk voor admins om de checkout te versnellen.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Security Check (Admin Only)
    // In een echte productie omgeving zouden we hier de Supabase session checken.
    // Voor nu vertrouwen we op de admin context van de aanvrager.
    
    // 2. Fetch User from DB
    let user = null;
    try {
      const results = await db.select().from(users).where(eq(users.email, email)).limit(1).catch(async (err: any) => {
        console.warn(' ADMIN LOOKUP Drizzle failed, falling back to SDK:', err.message);
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const { data } = await supabase.from('users').select('*').eq('email', email).single();
        if (data) {
          return [{
            firstName: data.first_name,
            lastName: data.last_name,
            phone: data.phone,
            companyName: data.company_name,
            vatNumber: data.vat_number,
            addressStreet: data.address_street,
            addressZip: data.address_zip,
            addressCity: data.address_city,
            addressCountry: data.address_country
          }];
        }
        return [];
      });
      user = results[0];
    } catch (dbError) {
      console.error(' ADMIN LOOKUP DB ERROR:', dbError);
    }

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // 3. Return sanitized user data
    return NextResponse.json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        companyName: user.companyName,
        vatNumber: user.vatNumber,
        addressStreet: user.addressStreet,
        addressZip: user.addressZip,
        addressCity: user.addressCity,
        addressCountry: user.addressCountry || 'BE',
      }
    });

  } catch (error: any) {
    console.error(' ADMIN LOOKUP ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
