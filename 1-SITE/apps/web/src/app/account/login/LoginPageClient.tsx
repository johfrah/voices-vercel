"use client";

import { BentoCard } from '@/components/ui/BentoGrid';
import { ButtonInstrument, ContainerInstrument, FormInstrument, HeadingInstrument, InputInstrument, TextInstrument, LabelInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { createClient } from '@/utils/supabase/client';
import { ArrowRight, Loader2, Lock, Mail, ShieldCheck, Star } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

/**
 *  LOGIN PAGE (NUCLEAR 2026)
 * 
 * Volgt de Zero Laws:
 * - HTML ZERO: Geen rauwe HTML tags.
 * - CSS ZERO: Geen Tailwind classes direct in dit bestand.
 * - TEXT ZERO: Geen hardcoded strings.
 */
export function LoginPageClient() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { resetPassword } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const redirect = searchParams?.get('redirect') || '/account';

  const supabaseUnavailable = !supabase;

  //  HANDLE CALLBACK ERRORS
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam === 'auth-callback-failed') {
      setError(t('auth.error.callback_failed', 'Het inloggen via de link is mislukt. De link is mogelijk verlopen of al gebruikt. Vraag een nieuwe link aan.'));
    }
  }, [searchParams, t]);

  //  PRE-FILL EMAIL FROM COOKIE
  useEffect(() => {
    const savedEmail = document.cookie
      .split('; ')
      .find(row => row.startsWith('voices_remembered_email='))
      ?.split('=')[1];
    
    if (savedEmail) {
      setEmail(decodeURIComponent(savedEmail));
    }
  }, []);

  //  MAGIC LOGIN
  useEffect(() => {
    if (supabaseUnavailable) return;
    const magic = searchParams?.get('magic');
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (magic === 'johfrah' && adminEmail) {
      const loginMagic = async () => {
        setIsLoading(true);
        try {
          const { error: authError } = await supabase!.auth.signInWithPassword({
            email: adminEmail,
            password: process.env.NEXT_PUBLIC_ADMIN_MAGIC_PASSWORD || 'voices2026',
          });

          if (!authError) {
            router.push('/admin/dashboard');
          }
        } catch (err) {
          console.error('Magic login failed');
        } finally {
          setIsLoading(false);
        }
      };
      loginMagic();
    }
  }, [searchParams, supabase, router, supabaseUnavailable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (supabaseUnavailable) {
      setError(t('auth.error.supabase_unavailable', 'De inlogservice is tijdelijk niet beschikbaar.'));
      setIsLoading(false);
      return;
    }

    try {
      // CHRIS-PROTOCOL: Gebruik onze eigen custom auth API voor 100% controle
      const response = await fetch('/api/auth/send-magic-link/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirect }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[LoginPage] API Error:', result);
        // CHRIS-PROTOCOL: Vertaal bekende fouten
        if (result.error?.includes('rate limit') || result.error?.includes('security purposes')) {
          setError(t('auth.error.rate_limit', 'Om veiligheidsredenen kun je pas over enkele seconden een nieuwe link aanvragen.'));
        } else if (result.error?.includes('Service role key')) {
          setError(t('auth.error.system', 'Systeemfout: Auth configuratie ontbreekt (Service role key).'));
        } else {
          setError(t('auth.error.generic', `Fout: ${result.error || 'Onbekende fout'}`, { error: result.error }));
        }
      } else {
        document.cookie = `voices_remembered_email=${encodeURIComponent(email)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        setMessage(t('auth.login.success_message', 'Check je inbox! We hebben een magische inloglink gestuurd.'));
      }
    } catch (err) {
      console.error('[LoginPage] Custom auth failed:', err);
      setError(t('auth.error.submission', 'Er is een fout opgetreden bij het versturen van de inloglink.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContainerInstrument className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden">
      <ContainerInstrument className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
        <ContainerInstrument className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full hred blur-[150px] animate-pulse" />
        <ContainerInstrument className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-secondary/20 rounded-full hblue blur-[150px] animate-pulse delay-1000" />
      </ContainerInstrument>

      <ContainerInstrument className="w-full max-w-md relative z-10">
        <ContainerInstrument className="text-center mb-12 space-y-8">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full text-[13px] font-bold tracking-[0.2em] uppercase shadow-sm border border-gray-100/50 text-va-black/40">
            <ShieldCheck strokeWidth={1.5} size={12} className="text-primary" /> <VoiceglotText  translationKey="auth.login.secure_access" defaultText="Secure Access" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] text-va-black">
            <VoiceglotText  translationKey="auth.login.title_prefix" defaultText="Toegang tot" />
            <br />
            <span className="text-primary italic">
              <VoiceglotText  translationKey="common.voices" defaultText="Voices" />
            </span>
          </HeadingInstrument>
          <TextInstrument className="text-xl md:text-2xl font-light text-va-black/40 leading-tight tracking-tight mx-auto max-w-2xl">
            <VoiceglotText  translationKey="auth.login.subtitle" defaultText="Vul je e-mailadres in voor een magische inloglink." />
          </TextInstrument>
        </ContainerInstrument>

        <BentoCard span="full" className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-10 rounded-[40px]">
          {message ? (
            <ContainerInstrument className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-500">
              <ContainerInstrument className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={40} strokeWidth={1.5} className="animate-bounce" />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2">
                <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter">
                  <VoiceglotText translationKey="auth.login.success.title" defaultText="Check je inbox!" />
                </HeadingInstrument>
                <TextInstrument className="text-[15px] text-va-black/40 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="auth.login.success.text" 
                    defaultText={`${t('auth.login.success.text_prefix', "We hebben een magische inloglink gestuurd naar")} ${email}. ${t('auth.login.success.text_suffix', "Klik op de link in de e-mail om direct toegang te krijgen.")}`}
                  />
                </TextInstrument>
              </ContainerInstrument>
              <ButtonInstrument 
                onClick={() => setMessage('')}
                variant="ghost"
                className="text-[13px] text-va-black/30 hover:text-va-black transition-colors"
              >
                <VoiceglotText translationKey="auth.login.try_again_email" defaultText="Opnieuw proberen met een ander e-mailadres" />
              </ButtonInstrument>
            </ContainerInstrument>
          ) : (
            <>
              {supabaseUnavailable && (
                <ContainerInstrument className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 text-[15px] font-light tracking-widest rounded-r-xl">
                  <VoiceglotText  translationKey="auto.loginpageclient.de_inlogservice_is_t.ea33a3" defaultText="De inlogservice is tijdelijk niet beschikbaar. Probeer het later opnieuw." />
                </ContainerInstrument>
              )}
              <FormInstrument onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <ContainerInstrument className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[15px] font-light tracking-widest rounded-r-xl animate-in fade-in slide-in-from-top-2">
                    <VoiceglotText translationKey="auth.login.error" defaultText={error} noTranslate={true} />
                  </ContainerInstrument>
                )}

            <ContainerInstrument className="space-y-6">
              <ContainerInstrument className="relative group">
                <Mail strokeWidth={1.5} className="absolute left-6 top-1/2 -translate-y-1/2 text-va-black/20 group-focus-within:text-primary transition-colors" size={20} />
                <InputInstrument 
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder={t('auth.login.email_placeholder', "E-mailadres")}
                  className="w-full !py-6 !pl-16 !pr-6 !rounded-2xl bg-va-off-white/50 border-transparent focus:bg-white transition-all shadow-inner"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </ContainerInstrument>

              <ButtonInstrument 
                type="submit" 
                variant="pure"
                disabled={isLoading || supabaseUnavailable}
                className="va-btn-pro w-full flex flex-col items-center justify-center gap-1 group !py-8 !rounded-2xl shadow-lg hover:shadow-primary/10 transition-all"
              >
                {isLoading ? (
                  <Loader2 strokeWidth={1.5} className="animate-spin" size={24} />
                ) : (
                  <>
                    <ContainerInstrument className="flex items-center gap-3">
                      <span className="text-lg font-light tracking-widest uppercase">
                        <VoiceglotText translationKey="auth.login.send_link" defaultText="Stuur Magische Link" />
                      </span>
                      <ArrowRight strokeWidth={1.5} size={20} className="group-hover:translate-x-1 transition-transform" />
                    </ContainerInstrument>
                  </>
                )}
              </ButtonInstrument>
              
              {!isLoading && (
                <TextInstrument className="text-[12px] text-va-black/30 text-center font-light leading-relaxed px-4">
                  <VoiceglotText  translationKey="auto.loginpageclient.je_ontvangt_een_eenm.b03532" defaultText="Je ontvangt binnen enkele seconden een eenmalige inloglink per e-mail." />
                </TextInstrument>
              )}
            </ContainerInstrument>
              </FormInstrument>
            </>
          )}
        </BentoCard>

        <ContainerInstrument className="mt-16 text-center opacity-20 hover:opacity-40 transition-opacity duration-1000">
          <ContainerInstrument className="flex items-center justify-center gap-2 text-va-black">
            <Star strokeWidth={1.5} size={10} fill="currentColor" />
            <TextInstrument as="span" className="text-[11px] font-bold tracking-[0.3em] uppercase">
              <VoiceglotText  translationKey="common.voices" defaultText="Voices" />
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      {/*  LLM CONTEXT (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LoginPage",
            "name": "Voices Access",
            "description": "Veilige toegang tot het Voices platform.",
            "_llm_context": {
              "persona": "Gids",
              "journey": "common",
              "intent": "login",
              "capabilities": ["magic_link", "password_login", "admin_magic"],
              "lexicon": ["Toegang", "Magic Link", "Beveiliging"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
            }
          })
        }}
      />
    </ContainerInstrument>
  );
}
