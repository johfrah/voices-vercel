import { NextRequest, NextResponse } from 'next/server';
import { UCIService } from '@/lib/intelligence/uci-service';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { db } from '@db';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';

/**
 * ⚡ API: CUSTOMER 360° INSIGHTS
 * 
 * Doel: Ontsluiten van UCI data voor de frontend en Voicy Chat.
 * 🛡️ Admin of eigen email/userId only.
 */

// 🛡️ CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sdkClient = createSupabaseClient(supabaseUrl, supabaseKey);

async function checkIsAdmin(email: string | undefined): Promise<boolean> {
  if (!email) return false;
  if (email === 'johfrah@voices.be') return true;

  try {
    const [dbUser] = await db.select({ role: users.role }).from(users).where(eq(users.email, email)).limit(1);
    return dbUser?.role === 'admin';
  } catch (dbError) {
    console.warn('⚠️ Customer 360 Drizzle failed, falling back to SDK');
    const { data, error } = await sdkClient
      .from('users')
      .select('role')
      .eq('email', email)
      .single();
    
    if (error || !data) return false;
    return data.role === 'admin';
  }
}

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
    const customerData = await UCIService.getCustomer360(identifier);

    if (!customerData) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customerData);
  } catch (error) {
    console.error('[API Customer 360 Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
