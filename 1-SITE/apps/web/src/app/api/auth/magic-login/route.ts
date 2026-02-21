import { db } from '@db';
import { users } from '@db/schema';
import { createClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';
import { verify } from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const redirectPath = searchParams.get('redirect') || '/account';

    if (!token || token === 'undefined') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // 1. Verify JWT
    const secret = process.env.JWT_SECRET || 'voices-secret-2026';
    let payload: any;
    try {
      payload = verify(token, secret);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { userId } = payload;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 });
    }

    // 2. Fetch User Email
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Initialize Supabase Admin
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: 'Auth service not configured' }, { status: 503 });
    }
    const supabaseAdmin = createClient(url, key);

    const host = request.headers.get('host') || 'www.voices.be';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const currentBaseUrl = `${protocol}://${host}`;

    // 4. Generate Magic Link (Action Link)
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
      options: {
        redirectTo: `${currentBaseUrl}${redirectPath}`,
      }
    });

    if (error) {
      console.error('Supabase GenerateLink Error:', error);
      throw error;
    }

    const actionLink = data.properties.action_link;

    // 5. Redirect to the Action Link (which will set the session and redirect to final destination)
    return NextResponse.redirect(actionLink);

  } catch (error: any) {
    console.error(' MAGIC LOGIN ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
