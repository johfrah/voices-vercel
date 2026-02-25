import { NextRequest, NextResponse } from 'next/server';
import { UCIService } from '@/lib/intelligence/uci-service';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { db, users } from '@/lib/system/db';
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

  // 🛡️ CHRIS-PROTOCOL: Pre-flight database check to avoid 500 crashes
  try {
    if (!db) throw new Error('Database connection unavailable');
  } catch (dbErr) {
    console.error('[API Customer 360] Database pre-flight failed:', dbErr);
    return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = await checkIsAdmin(user?.email);

  const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

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
    // We cachen de 360 data voor 1 minuut om 504 timeouts te voorkomen (v2.14.347)
    const cacheKey = `customer_360_${identifier}`;
    
    if (!forceRefresh) {
      const { data: cachedData } = await sdkClient
        .from('app_configs')
        .select('value')
        .eq('key', cacheKey)
        .single();

      if (cachedData && (Date.now() - new Date((cachedData.value as any).timestamp).getTime() < 60000)) {
        return NextResponse.json((cachedData.value as any).data, {
          headers: { 'X-Cache': 'HIT' }
        });
      }
    }

    //  CHRIS-PROTOCOL: Voeg een timeout toe om 504 Gateway Timeouts te voorkomen
    const customerDataPromise = UCIService.getCustomer360(identifier);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Customer 360 Timeout')), 5000) // Verkort naar 5s voor snellere fallback
    );

    let customerData;
    try {
      customerData = await Promise.race([customerDataPromise, timeoutPromise]) as any;
    } catch (raceError: any) {
      console.warn(`[API Customer 360] Race failed or timeout: ${raceError.message}`);
      // Fallback naar basis data als de volledige 360 te lang duurt
      if (raceError.message === 'Customer 360 Timeout') {
        return NextResponse.json({ 
          id: typeof identifier === 'number' ? identifier : 0,
          email: typeof identifier === 'string' ? identifier : '',
          stats: { totalSpent: 0, orderCount: 0, averageOrderValue: 0, lastOrderDate: null },
          _partial: true,
          _message: 'Full profile timeout, showing basic data'
        }, { 
          headers: { 'X-Status': 'Partial-Timeout' } 
        });
      }
      throw raceError;
    }

    if (!customerData) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // 🛡️ CHRIS-PROTOCOL: Await cache update to ensure consistency (v2.14.347)
    await sdkClient.from('app_configs').upsert({
      key: cacheKey,
      value: { data: customerData, timestamp: new Date().toISOString() }
    });

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
