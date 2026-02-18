import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { type EmailOtpType } from '@supabase/supabase-js';

/**
 * AUTH CONFIRM ROUTE (BOB-METHOD 2026)
 * 
 * Verifieert de token die via onze eigen voices.be link is binnengekomen.
 * Dit vervangt de lelijke Supabase-redirects.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: { token: string; type: string; redirect: string };
}) {
  const { token, type, redirect: redirectTo } = searchParams;
  const supabase = createClient();

  if (token && type && supabase) {
    const { error } = await supabase.auth.verifyOtp({
      token,
      type: type as EmailOtpType,
    });

    if (!error) {
      redirect(redirectTo || '/account');
    }
  }

  // Bij een fout, stuur terug naar login met een duidelijke melding
  redirect(`/auth/login?error=auth-callback-failed`);
}
