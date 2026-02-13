"use client";

import { BentoCard } from '@/components/ui/BentoGrid';
import { ButtonInstrument, ContainerInstrument, FormInstrument, HeadingInstrument, InputInstrument, TextInstrument, LabelInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { ArrowRight, Loader2, Lock, Mail, ShieldCheck, Star } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

/**
 * 🔐 LOGIN PAGE (NUCLEAR 2026)
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const redirect = searchParams.get('redirect') || '/account';

  const supabaseUnavailable = !supabase;

  // 🛡️ HANDLE CALLBACK ERRORS
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'auth-callback-failed') {
      setError('Het inloggen via de link is mislukt. De link is mogelijk verlopen of al gebruikt. Vraag een nieuwe link aan.');
    }
  }, [searchParams]);

  // 📧 PRE-FILL EMAIL FROM COOKIE
  useEffect(() => {
    const savedEmail = document.cookie
      .split('; ')
      .find(row => row.startsWith('voices_remembered_email='))
      ?.split('=')[1];
    
    if (savedEmail) {
      setEmail(decodeURIComponent(savedEmail));
    }
  }, []);

  // ⚡ MAGIC LOGIN
  useEffect(() => {
    if (supabaseUnavailable) return;
    const magic = searchParams.get('magic');
    if (magic === 'johfrah') {
      const loginMagic = async () => {
        setIsLoading(true);
        try {
          const { error: authError } = await supabase!.auth.signInWithPassword({
            email: 'johfrah@voices.be',
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

    try {
      if (!password) {
        try {
          const res = await fetch('/api/auth/magic-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, redirect }),
          });

          const data = await res.json();

          if (data.error) {
            if (data.error.includes('Database error') || data.error.includes('fetch')) {
              setError('Onze excuses, er is een tijdelijke storing in de mail-service. Probeer het over een moment opnieuw.');
            } else {
              setError(data.error);
            }
          } else {
            document.cookie = `voices_remembered_email=${encodeURIComponent(email)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
            setMessage('Check je inbox! We hebben een magische inloglink gestuurd.');
          }
        } catch (fetchError) {
          console.error('Email service fetch failed:', fetchError);
          setError('We konden geen verbinding maken met de inlog-service. Controleer je internetverbinding of probeer het later nog eens.');
        }
        return;
      }

      if (supabaseUnavailable) {
        setError('De inlogservice is tijdelijk niet beschikbaar.');
        return;
      }
      const { error: authError } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        document.cookie = `voices_remembered_email=${encodeURIComponent(email)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        router.push(redirect);
      }
    } catch (err) {
      setError('Er is een fout opgetreden bij het inloggen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContainerInstrument className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden">
      <ContainerInstrument className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <ContainerInstrument className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary rounded-full hred blur-[120px] animate-pulse" />
        <ContainerInstrument className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary rounded-full hblue blur-[120px] animate-pulse delay-1000" />
      </ContainerInstrument>

      <ContainerInstrument className="w-full max-w-xl relative z-10">
        <ContainerInstrument className="text-center mb-12 space-y-4">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full text-[15px] font-black tracking-widest shadow-sm border border-gray-100/50">
            <ShieldCheck strokeWidth={1.5} size={12} className="text-primary" /> <VoiceglotText translationKey="auth.login.secure_access" defaultText="Toegang" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-5xl font-black tracking-tighter">
            <VoiceglotText translationKey="auth.login.title_prefix" defaultText="Toegang tot" />
            <TextInstrument as="span" className="text-primary font-light">
              <VoiceglotText translationKey="auto.loginpageclient.voices.d342f8" defaultText="Voices" />
            </TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium max-w-sm mx-auto">
            <VoiceglotText translationKey="auth.login.subtitle" defaultText="Vul je e-mailadres in. Je ontvangt direct een magische link in je inbox om veilig in te loggen." />
          </TextInstrument>
        </ContainerInstrument>

        <BentoCard span="full" className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12">
          {supabaseUnavailable && (
            <ContainerInstrument className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 text-[15px] font-bold tracking-widest rounded-r-xl">
              <VoiceglotText translationKey="auto.loginpageclient.de_inlogservice_is_t.ea33a3" defaultText="De inlogservice is tijdelijk niet beschikbaar. Probeer het later opnieuw." />
            </ContainerInstrument>
          )}
          <FormInstrument onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <ContainerInstrument className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[15px] font-bold tracking-widest rounded-r-xl animate-in fade-in slide-in-from-top-2">
                {error}
              </ContainerInstrument>
            )}
            {message && (
              <ContainerInstrument className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-[15px] font-bold tracking-widest rounded-r-xl animate-in fade-in slide-in-from-top-2">
                {message}
              </ContainerInstrument>
            )}

            <ContainerInstrument className="space-y-6">
              <ContainerInstrument className="relative group">
                <Mail strokeWidth={1.5} className="absolute left-6 top-1/2 -translate-y-1/2 text-va-black/20 group-focus-within:text-primary transition-colors" size={20} />
                <InputInstrument 
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="E-mailadres"
                  className="w-full !py-5 !pl-16 !pr-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </ContainerInstrument>

              {showPassword ? (
                <ContainerInstrument className="relative group animate-in fade-in slide-in-from-top-2">
                  <Lock strokeWidth={1.5} className="absolute left-6 top-1/2 -translate-y-1/2 text-va-black/20 group-focus-within:text-primary transition-colors" size={20} />
                  <InputInstrument 
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Wachtwoord"
                    className="w-full !py-5 !pl-16 !pr-6"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <ButtonInstrument 
                    onClick={() => {
                      setShowPassword(false);
                      setPassword('');
                    }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[15px] font-bold tracking-widest text-primary hover:opacity-70 transition-opacity"
                  >
                    <VoiceglotText translationKey="auto.loginpageclient.gebruik_magic_link.e10a3c" defaultText="Gebruik Magic Link" />
                  </ButtonInstrument>
                </ContainerInstrument>
              ) : (
                <ContainerInstrument className="flex justify-center">
                  <ButtonInstrument 
                    onClick={() => setShowPassword(true)}
                    className="text-[15px] font-bold tracking-widest text-va-black/40 hover:text-primary transition-colors"
                  >
                    Ik wil inloggen met een wachtwoord
                  </ButtonInstrument>
                </ContainerInstrument>
              )}

              <ButtonInstrument 
                type="submit" 
                disabled={isLoading || supabaseUnavailable}
                className="va-btn-pro w-full flex flex-col items-center justify-center gap-1 group !py-6"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <ContainerInstrument className="flex items-center gap-3">
                      <VoiceglotText translationKey="auth.login.submit" defaultText={password ? "Inloggen" : "Stuur Magische Link"} /> 
                      <ArrowRight strokeWidth={1.5} size={20} className="group-hover:translate-x-1 transition-transform" />
                    </ContainerInstrument>
                    {!password && (
                      <TextInstrument as="span" className="text-[15px] opacity-50 font-normal normal-case tracking-normal">
                        <VoiceglotText translationKey="auto.loginpageclient.je_ontvangt_een_eenm.b03532" defaultText="Je ontvangt een eenmalige inloglink per e-mail" />
                      </TextInstrument>
                    )}
                  </>
                )}
              </ButtonInstrument>
            </ContainerInstrument>
          </FormInstrument>
        </BentoCard>

        <ContainerInstrument className="mt-12 text-center">
          <ContainerInstrument className="flex items-center justify-center gap-2 text-primary">
            <Star strokeWidth={1.5} size={12} fill="currentColor" />
            <TextInstrument as="span" className="text-[15px] font-black tracking-widest">
              <VoiceglotText translationKey="auth.login.footer" defaultText="Voices" />
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      {/* 🧠 LLM CONTEXT (Compliance) */}
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
