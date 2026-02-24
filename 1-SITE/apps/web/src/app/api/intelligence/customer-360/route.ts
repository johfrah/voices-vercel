import { NextRequest, NextResponse } from 'next/server';
import { UCIService } from '@/lib/intelligence/uci-service';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { db } from '@db';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';

/**
 *  API: CUSTOMER 360 INSIGHTS
 * 
 * Doel: Ontsluiten van UCI data voor de frontend en Voicy Chat.
 *  Admin of eigen email/userId only.
 */

//  CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sdkClient = createSupabaseClient(supabaseUrl, supabaseKey);

async function checkIsAdmin(email: string | undefined): Promise<boolean> {
  if (!email) return false;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && email === adminEmail) return true;

  try {
    const [dbUser] = await db.select({ role: users.role }).from(users).where(eq(users.email, email)).limit(1).catch(() => []);
    return dbUser?.role === 'admin';
  } catch (dbError) {
    console.warn(' Customer 360 Drizzle failed, falling back to SDK');
    const { data, error } = await sdkClient
      .from('users')
      .select('role')
      .eq('email', email)
      .single();
    
    if (error || !data) return false;
    return data.role === 'admin';
  }
}

// export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
  }
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = await checkIsAdmin(user?.email);

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const userId = searchParams.get('userId');

  if (!email && !userId) {
    return NextResponse.json({ error: 'Email or userId required' }, { status: 400 });
  }

  // Admin mag alles; anders alleen eigen data
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isAdmin && email && email !== user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isAdmin && userId && String(user.id) !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

    try {
    const identifier = userId ? parseInt(userId) : email!;
    
    // 🛡️ CHRIS-PROTOCOL: Nuclear Caching Layer (SWR)
    // We cachen de 360 data voor 5 minuten om 504 timeouts te voorkomen.
    const cacheKey = `customer_360_${identifier}`;
    const { data: cachedData } = await sdkClient
      .from('app_configs')
      .select('value')
      .eq('key', cacheKey)
      .single();

    if (cachedData && (Date.now() - new Date((cachedData.value as any).timestamp).getTime() < 300000)) {
      return NextResponse.json((cachedData.value as any).data, {
        headers: { 'X-Cache': 'HIT' }
      });
    }

    //  CHRIS-PROTOCOL: Voeg een timeout toe om 504 Gateway Timeouts te voorkomen
    const customerDataPromise = UCIService.getCustomer360(identifier);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Customer 360 Timeout')), 8000)
    );

    const customerData = await Promise.race([customerDataPromise, timeoutPromise]) as any;

    if (!customerData) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Background update cache (don't await)
    sdkClient.from('app_configs').upsert({
      key: cacheKey,
      value: { data: customerData, timestamp: new Date().toISOString() }
    }).then(() => {});

    return NextResponse.json(customerData, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Cache': 'MISS'
      }
    });
  } catch (error: any) {
    console.error('[API Customer 360 Error]:', error);
    if (error.message === 'Customer 360 Timeout') {
      return NextResponse.json({ error: 'Request Timeout' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
