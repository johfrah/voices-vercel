"use client";

import { usePathname } from 'next/navigation';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { Mail, Phone, UserCircle, Zap, Volume2, VolumeX } from 'lucide-react';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";
import { ContainerInstrument, TextInstrument, ButtonInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * TOP BAR COMPONENT
 * Subtiele bar boven de GlobalNav voor contactinfo en snelle acties.
 * Volgt de Bob-methode (UX) en Chris-Protocol (Discipline).
 */
export const TopBar = () => {
  const pathname = usePathname();
  const { playClick } = useSonicDNA();
  const { state: masterState, toggleMute } = useMasterControl();
  const market = MarketManager.getCurrentMarket();
  const { t } = useTranslation();
  const { campaignMessage } = useVoicesState();

  const handleSpeakToStaff = () => {
    playClick('pro');
    localStorage.setItem('voices_persona_preference', 'staff');
    window.dispatchEvent(new CustomEvent('voices:persona_change', { detail: 'staff' }));
    window.dispatchEvent(new CustomEvent('voicy:open', { detail: { persona: 'staff', tab: 'chat' } }));
  };

  const handleOpenMail = (e: React.MouseEvent) => {
    e.preventDefault();
    playClick('pro');
    window.dispatchEvent(new CustomEvent('voicy:open', { detail: { tab: 'mail' } }));
  };

  const handleOpenPhone = (e: React.MouseEvent) => {
    e.preventDefault();
    playClick('pro');
    window.dispatchEvent(new CustomEvent('voicy:open', { detail: { tab: 'phone' } }));
  };

  const activeEmail = market.email;
  const activePhone = market.phone;

  return (
    <ContainerInstrument 
      as="div" 
      plain 
      className="hidden md:flex w-full bg-va-off-white/80 backdrop-blur-md border-b border-black/[0.03] py-2 px-4 md:px-6 justify-between items-center gap-6 relative z-[201]"
    >
      {/* Linkerkant: Campagne Bericht (Mark's Instrument) */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {campaignMessage && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2"
            >
              <Zap size={12} className="text-primary animate-pulse" />
              <TextInstrument className="text-[11px] font-bold tracking-tight text-primary uppercase">
                {campaignMessage}
              </TextInstrument>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rechterkant: Contact & Acties */}
      <div className="flex items-center gap-6">
        {/* Mute Toggle (Bob-methode: UX-controle) */}
        <ButtonInstrument
          variant="plain"
          size="none"
          onClick={toggleMute}
          className="flex items-center gap-2 group"
          title={masterState.isMuted ? "Geluid aanzetten" : "Geluid dempen"}
        >
          {masterState.isMuted ? (
            <VolumeX size={12} strokeWidth={2.5} className="text-red-500/60 group-hover:text-red-500 transition-colors" />
          ) : (
            <Volume2 size={12} strokeWidth={2.5} className="text-va-black/20 group-hover:text-primary transition-colors" />
          )}
          <TextInstrument className="text-[11px] font-light tracking-[0.1em] text-va-black/40 group-hover:text-va-black transition-colors">
            {masterState.isMuted ? "Muted" : "Audio"}
          </TextInstrument>
        </ButtonInstrument>

        {/* Medewerker spreken (Nu in TopBar) */}
        <ButtonInstrument
          variant="plain"
          size="none"
          onClick={handleSpeakToStaff}
          className="flex items-center gap-2 group"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <TextInstrument className="text-[11px] font-light tracking-[0.1em] text-va-black/40 group-hover:text-va-black transition-colors">
            <VoiceglotText translationKey="nav.speak_to_staff" defaultText="Medewerker spreken" />
          </TextInstrument>
        </ButtonInstrument>

        {/* Telefoonnummer */}
        {activePhone && (
          <ButtonInstrument
            variant="plain"
            size="none"
            className="flex items-center gap-2 group"
            onClick={handleOpenPhone}
          >
            <Phone size={12} strokeWidth={2.5} className="text-va-black/20 group-hover:text-primary transition-colors" />
            <TextInstrument className="text-[11px] font-light tracking-[0.1em] text-va-black/40 group-hover:text-va-black transition-colors">
              {activePhone}
            </TextInstrument>
          </ButtonInstrument>
        )}

        {/* Emailadres */}
        {activeEmail && (
          <ButtonInstrument
            variant="plain"
            size="none"
            className="flex items-center gap-2 group"
            onClick={handleOpenMail}
          >
            <Mail size={12} strokeWidth={2.5} className="text-va-black/20 group-hover:text-primary transition-colors" />
            <TextInstrument className="text-[11px] font-light tracking-[0.1em] text-va-black/40 group-hover:text-va-black transition-colors">
              {activeEmail}
            </TextInstrument>
          </ButtonInstrument>
        )}
      </div>
    </ContainerInstrument>
  );
};
