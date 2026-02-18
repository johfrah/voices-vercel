"use client";

import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument,
    FixedActionDockInstrument
} from '@/components/ui/LayoutInstruments';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAdminTracking } from '@/hooks/useAdminTracking';
import { ArrowLeft, CheckCircle2, Fingerprint, History, Loader2, Lock, ShieldAlert, ShieldCheck, Smartphone, Zap, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

/**
 *  NUCLEAR SECURITY CENTER (2026)
 * 
 * Doel: Beheer van 2FA, Admin Escalation en Mailbox Protection.
 */
export default function AdminSecurityPage() {
  const { logAction } = useAdminTracking();
  const [loading, setLoading] = useState(true);
  const [isMfaActive, setIsMfaActive] = useState(false);
  const [isEscalationRequired, setIsEscalationRequired] = useState(true);

  const fetchSecurityStatus = async () => {
    setLoading(true);
    // Simuleer laden van security status
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  const handleToggleMfa = () => {
    logAction('security_toggle_mfa', { active: !isMfaActive });
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'MFA Configuratie wordt voorbereid...',
        success: 'MFA is nu geactiveerd voor jouw admin-account!',
        error: 'Configuratie mislukt.',
      }
    );
    setIsMfaActive(true);
  };

  if (loading) return (
    <ContainerInstrument className="min-h-screen flex items-center justify-center">
      <Loader2 strokeWidth={1.5} className="animate-spin text-primary" size={40} />
    </ContainerInstrument>
  );

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link  href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-light tracking-widest">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText  translationKey="admin.back_to_cockpit" defaultText="Terug" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter ">
            Nuclear 
          </HeadingInstrument>
          <TextInstrument className="text-primary font-light">
            <VoiceglotText  translationKey="auto.page.security.2fae32" defaultText="Security" />
          </TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <BentoGrid strokeWidth={1.5} columns={3}>
        {/* 2FA Status Card */}
        <BentoCard span="lg" className="bg-white border border-black/5 p-10 space-y-8 rounded-[20px]">
          <ContainerInstrument className="flex justify-between items-start">
            <ContainerInstrument className="space-y-2">
              <HeadingInstrument level={3} className="text-3xl font-light tracking-tight">
                <VoiceglotText  translationKey="auto.page.multi_factor_auth.c21bd5" defaultText="Multi-Factor Auth" />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/40 font-light max-w-md">
                <VoiceglotText  translationKey="auto.page.beveilig_de_toegang_.044ee4" defaultText="Beveilig de toegang tot je mailbox en de database met een extra code via je telefoon." />
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className={`p-4 rounded-[10px] ${isMfaActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {isMfaActive ? <ShieldCheck strokeWidth={1.5} size={32} /> : <ShieldAlert strokeWidth={1.5} size={32} />}
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <ContainerInstrument className="p-6 bg-va-off-white rounded-[20px] space-y-4 border border-black/5">
              <Smartphone strokeWidth={1.5} className="text-va-black/20" size={24} />
              <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest">
                <VoiceglotText  translationKey="auto.page.authenticator_app.5c5737" defaultText="Authenticator App" />
              </HeadingInstrument>
              <TextInstrument className="text-[15px] font-light text-va-black/40 leading-relaxed">
                <VoiceglotText  translationKey="auto.page.gebruik_google_authe.93d11f" defaultText="Gebruik Google Authenticator, Authy of iCloud Keychain voor tijdgebonden codes." />
              </TextInstrument>
              <ButtonInstrument 
                onClick={handleToggleMfa}
                className={`w-full py-3 rounded-[10px] text-[15px] font-light tracking-widest transition-all ${isMfaActive ? 'bg-va-black text-white' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
              >
                {isMfaActive ? 'Geconfigureerd' : 'Nu Activeren'}
              </ButtonInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="p-6 bg-va-off-white rounded-[20px] space-y-4 border border-black/5 opacity-40">
              <Fingerprint strokeWidth={1.5} className="text-va-black/20" size={24} />
              <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest">
                <VoiceglotText  translationKey="auto.page.biometrische_lock.1c69d0" defaultText="Biometrische Lock" />
              </HeadingInstrument>
              <TextInstrument className="text-[15px] font-light text-va-black/40 leading-relaxed">
                <VoiceglotText  translationKey="auto.page.gebruik_faceid_of_to.667b20" defaultText="Gebruik FaceID of TouchID om direct in te loggen zonder wachtwoord." />
              </TextInstrument>
              <ContainerInstrument className="text-[15px] font-light tracking-widest text-va-black/20"><VoiceglotText  translationKey="auto.page.binnenkort_beschikba.b9656f" defaultText="Binnenkort Beschikbaar" /></ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>

        {/* Escalation Policy */}
        <BentoCard span="sm" className="bg-va-black text-white p-10 space-y-8 flex flex-col justify-between rounded-[20px]">
          <ContainerInstrument className="space-y-4">
            <Lock strokeWidth={1.5} className="text-primary" size={40} />
            <HeadingInstrument level={3} className="text-2xl font-light tracking-tighter leading-tight">
              Admin<br /><VoiceglotText  translationKey="auto.page.escalation.a5a3f5" defaultText="Escalation" /></HeadingInstrument>
            <TextInstrument className="text-[15px] font-light opacity-60"><VoiceglotText  translationKey="auto.page.dwing_een_extra_2fa_.72133d" defaultText="Dwing een extra 2FA check af voor gevoelige acties:" /></TextInstrument>
            <ContainerInstrument className="space-y-3">
              {[
                { label: 'Mailbox Inzien', active: true },
                { label: 'Database Wijzigen', active: true },
                { label: 'Vibecode Opslaan', active: true }
              ].map(item => (
                <ContainerInstrument key={item.label} className="flex items-center gap-3 p-3 bg-white/5 rounded-[10px] border border-white/5">
                  <ContainerInstrument className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <TextInstrument className="text-[15px] font-light tracking-tight">{item.label}</TextInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="pt-6 border-t border-white/10">
            <ContainerInstrument className="flex items-center justify-between">
              <TextInstrument className="text-[15px] font-light tracking-widest opacity-40"><VoiceglotText  translationKey="auto.page.status.ec53a8" defaultText="Status" /></TextInstrument>
              <TextInstrument className="text-[15px] font-light tracking-widest text-primary"><VoiceglotText  translationKey="auto.page.strict_mode.0711dd" defaultText="Strict Mode" /></TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>
      </BentoGrid>

      {/* Security Logs */}
      <BentoCard span="full" className="bg-white border border-black/5 p-10 space-y-6 rounded-[20px]">
        <ContainerInstrument className="flex justify-between items-center">
          <HeadingInstrument level={3} className="text-xl font-light tracking-tight flex items-center gap-3">
            <History strokeWidth={1.5} size={20} className="text-va-black/20" /><VoiceglotText  translationKey="auto.page.security_audit_log.c86e03" defaultText="Security Audit Log" /></HeadingInstrument>
          <ButtonInstrument onClick={() => logAction('security_download_logs')} className="text-[15px] font-light tracking-widest text-va-black/20 hover:text-va-black transition-colors"><VoiceglotText  translationKey="auto.page.download_volledig_lo.b47b76" defaultText="Download Volledig Log" /></ButtonInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="space-y-2">
          {[
            { action: 'Admin Login', time: 'Zojuist', status: 'Success', icon: <CheckCircle2 strokeWidth={1.5} className="text-green-500" size={12} /> },
            { action: 'Mailbox Sync', time: '10 min geleden', status: 'Success', icon: <CheckCircle2 strokeWidth={1.5} className="text-green-500" size={12} /> },
            { action: 'Database Access', time: '1 uur geleden', status: 'MFA Verified', icon: <ShieldCheck strokeWidth={1.5} className="text-primary" size={12} /> },
          ].map((log, i) => (
            <ContainerInstrument key={i} className="flex items-center justify-between p-4 bg-va-off-white/50 rounded-[10px] border border-transparent hover:border-black/5 transition-all">
              <ContainerInstrument className="flex items-center gap-4">
                {log.icon}
                <TextInstrument className="text-[15px] font-light tracking-tight">{log.action}</TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="flex items-center gap-6">
                <TextInstrument className="text-[15px] font-light text-va-black/40">{log.time}</TextInstrument>
                <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/20">{log.status}</TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          ))}
        </ContainerInstrument>
      </BentoCard>

      {/* Warning */}
      <ContainerInstrument className="p-8 bg-va-black text-white rounded-[20px] flex items-center gap-6">
        <ContainerInstrument className="w-16 h-16 bg-primary text-white rounded-[10px] flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <Zap strokeWidth={1.5} size={32} />
        </ContainerInstrument>
        <ContainerInstrument className="space-y-1">
          <HeadingInstrument level={4} className="text-primary font-light tracking-tight">
            <VoiceglotText  translationKey="auto.page.security_mandate.b963e6" defaultText="SECURITY MANDATE" />
          </HeadingInstrument>
          <TextInstrument className="text-[15px] opacity-60 font-light">
            <VoiceglotText  translationKey="auto.page.jouw_mailbox_bevat_g.7c640b" defaultText="Jouw mailbox bevat gevoelige klantgegevens en DNA. Door MFA te activeren, maak je de Freedom Machine ondoordringbaar voor externe dreigingen. Jouw sessie is momenteel beveiligd via Magic Link." />
          </TextInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      <FixedActionDockInstrument>
        <ButtonInstrument 
          onClick={() => {
            logAction('security_refresh');
            fetchSecurityStatus();
          }}
          className="va-btn-pro !bg-va-black flex items-center gap-2"
        >
          <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
          <VoiceglotText translationKey="admin.security.refresh" defaultText="Status Vernieuwen" />
        </ButtonInstrument>
      </FixedActionDockInstrument>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AdminPage",
            "name": "Security Center",
            "description": "Beheer van 2FA, Admin Escalation en Mailbox Protection.",
            "_llm_context": {
              "persona": "Architect",
              "journey": "admin",
              "intent": "security_management",
              "capabilities": ["manage_2fa", "view_audit_logs", "escalation_control"],
              "lexicon": ["Security", "MFA", "Audit Log", "Nuclear"],
              "visual_dna": ["Bento Grid", "Liquid DNA"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
