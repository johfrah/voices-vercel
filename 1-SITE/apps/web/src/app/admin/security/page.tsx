"use client";

import React, { useState, useEffect } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ShieldAlert, Lock, Fingerprint, Key, Smartphone, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, Zap, History } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

/**
 * 🔒 NUCLEAR SECURITY CENTER (2026)
 * 
 * Doel: Beheer van 2FA, Admin Escalation en Mailbox Protection.
 */
export default function AdminSecurityPage() {
  const [loading, setLoading] = useState(true);
  const [isMfaActive, setIsMfaActive] = useState(false);
  const [isEscalationRequired, setIsEscalationRequired] = useState(true);

  useEffect(() => {
    // Simuleer laden van security status
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const handleToggleMfa = () => {
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
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest">
            <ArrowLeft size={12} /> 
            <VoiceglotText translationKey="admin.back_to_cockpit" defaultText="Terug" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter ">
            Nuclear <span className="text-primary">Security</span>
          </HeadingInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <BentoGrid columns={3}>
        {/* 2FA Status Card */}
        <BentoCard span="lg" className="bg-white border border-black/5 p-10 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <HeadingInstrument level={3} className="text-3xl font-black tracking-tight">Multi-Factor Auth</HeadingInstrument>
              <TextInstrument className="text-va-black/40 font-medium max-w-md">
                Beveilig de toegang tot je mailbox en de database met een extra code via je telefoon.
              </TextInstrument>
            </div>
            <div className={`p-4 rounded-2xl ${isMfaActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {isMfaActive ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="p-6 bg-va-off-white rounded-[32px] space-y-4 border border-black/5">
              <Smartphone className="text-va-black/20" size={24} />
              <HeadingInstrument level={4} className="text-sm font-black tracking-widest">Authenticator App</HeadingInstrument>
              <TextInstrument className="text-[15px] font-medium text-va-black/40 leading-relaxed">
                Gebruik Google Authenticator, Authy of iCloud Keychain voor tijdgebonden codes.
              </TextInstrument>
              <ButtonInstrument 
                onClick={handleToggleMfa}
                className={`w-full py-3 rounded-xl text-[15px] font-black uppercase tracking-widest transition-all ${isMfaActive ? 'bg-va-black text-white' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
              >
                {isMfaActive ? 'Geconfigureerd' : 'Nu Activeren'}
              </ButtonInstrument>
            </div>
            <div className="p-6 bg-va-off-white rounded-[32px] space-y-4 border border-black/5 opacity-40">
              <Fingerprint className="text-va-black/20" size={24} />
              <HeadingInstrument level={4} className="text-sm font-black tracking-widest">Biometrische Lock</HeadingInstrument>
              <TextInstrument className="text-[15px] font-medium text-va-black/40 leading-relaxed">
                Gebruik FaceID of TouchID om direct in te loggen zonder wachtwoord.
              </TextInstrument>
              <div className="text-[15px] font-black tracking-widest text-va-black/20">Binnenkort Beschikbaar</div>
            </div>
          </div>
        </BentoCard>

        {/* Escalation Policy */}
        <BentoCard span="sm" className="bg-va-black text-white p-10 space-y-8 flex flex-col justify-between">
          <div className="space-y-4">
            <Lock className="text-primary" size={40} />
            <HeadingInstrument level={3} className="text-2xl font-black tracking-tighter leading-tight">
              Admin<br />Escalation
            </HeadingInstrument>
            <TextInstrument className="text-sm font-medium opacity-60">
              Dwing een extra 2FA check af voor gevoelige acties:
            </TextInstrument>
            <div className="space-y-3">
              {[
                { label: 'Mailbox Inzien', active: true },
                { label: 'Database Wijzigen', active: true },
                { label: 'Vibecode Opslaan', active: true }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <TextInstrument className="text-[15px] font-bold tracking-tight">{item.label}</TextInstrument>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <TextInstrument className="text-[15px] font-black tracking-widest opacity-40">Status</TextInstrument>
              <TextInstrument className="text-[15px] font-black tracking-widest text-primary">Strict Mode</TextInstrument>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>

      {/* Security Logs */}
      <BentoCard span="full" className="bg-white border border-black/5 p-10 space-y-6">
        <div className="flex justify-between items-center">
          <HeadingInstrument level={3} className="text-xl font-black tracking-tight flex items-center gap-3">
            <History size={20} className="text-va-black/20" /> Security Audit Log
          </HeadingInstrument>
          <ButtonInstrument className="text-[15px] font-black tracking-widest text-va-black/20 hover:text-va-black transition-colors">Download Volledig Log</ButtonInstrument>
        </div>
        <div className="space-y-2">
          {[
            { action: 'Admin Login', time: 'Zojuist', status: 'Success', icon: <CheckCircle2 className="text-green-500" size={12} /> },
            { action: 'Mailbox Sync', time: '10 min geleden', status: 'Success', icon: <CheckCircle2 className="text-green-500" size={12} /> },
            { action: 'Database Access', time: '1 uur geleden', status: 'MFA Verified', icon: <ShieldCheck className="text-primary" size={12} /> },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-va-off-white/50 rounded-2xl border border-transparent hover:border-black/5 transition-all">
              <div className="flex items-center gap-4">
                {log.icon}
                <TextInstrument className="text-[15px] font-bold tracking-tight">{log.action}</TextInstrument>
              </div>
              <div className="flex items-center gap-6">
                <TextInstrument className="text-[15px] font-medium text-va-black/40">{log.time}</TextInstrument>
                <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/20">{log.status}</TextInstrument>
              </div>
            </div>
          ))}
        </div>
      </BentoCard>

      {/* Warning */}
      <ContainerInstrument className="p-8 bg-va-black text-white rounded-[32px] flex items-center gap-6">
        <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <Zap size={32} />
        </div>
        <div className="space-y-1">
          <HeadingInstrument level={4} className="text-primary font-black tracking-tight">SECURITY MANDATE</HeadingInstrument>
          <TextInstrument className="text-[15px] opacity-60 font-medium">
            Jouw mailbox bevat gevoelige klantgegevens en DNA. Door MFA te activeren, maak je de Freedom Machine ondoordringbaar voor externe dreigingen. Jouw sessie is momenteel beveiligd via Magic Link.
          </TextInstrument>
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
