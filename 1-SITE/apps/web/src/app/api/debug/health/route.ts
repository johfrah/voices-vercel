import { NextResponse } from 'next/server';

/**
 * Health check  veilige diagnoseroute voor 500-debugging.
 * Geen secrets, alleen status.
 */
export async function GET() {
  const env = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV || 'unknown',
  };

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    env,
  });
}
