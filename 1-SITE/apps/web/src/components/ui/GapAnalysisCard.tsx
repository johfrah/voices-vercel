"use client";

import React from 'react';
import { BentoCard } from './BentoGrid';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useSonicDNA } from '@/lib/sonic-dna';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

interface AssetGap {
  id: string;
  label: string;
  blueprint: string;
}

const SECTOR_REQUIREMENTS: Record<string, AssetGap[]> = {
  'gezondheidszorg': [
    { id: 'welcome', label: 'Welkomstboodschap', blueprint: 'Welkom bij {{company_name}}. Voor dringende medische hulp...' },
    { id: 'holiday', label: 'Vakantiemelding', blueprint: '{{company_name}} is momenteel met verlof...' },
    { id: 'closed', label: 'Gesloten melding', blueprint: 'U belt buiten onze openingsuren...' },
  ],
  'bouw': [
    { id: 'welcome', label: 'Welkomstboodschap', blueprint: 'Welkom bij {{company_name}}. Wij realiseren uw droomproject...' },
    { id: 'ivr', label: 'Keuzemenu', blueprint: 'Voor projectplanning, druk 1...' },
    { id: 'onhold', label: 'Wachtmuziek', blueprint: 'Een ogenblik geduld, we verbinden u door...' },
  ],
  'it': [
    { id: 'welcome', label: 'Welkomstboodschap', blueprint: 'U bent verbonden met {{company_name}} support...' },
    { id: 'ivr', label: 'Support Menu', blueprint: 'Voor technische storingen, druk 1...' },
    { id: 'closed', label: 'After-hours Support', blueprint: 'Onze support desk is momenteel gesloten...' },
  ],
};

export const GapAnalysisCard: React.FC = () => {
  const { state, getPlaceholderValue } = useVoicesState();
  const { user } = useAuth();
  const { playClick } = useSonicDNA();

  // Mock order history check (In production this comes from the API)
  const hasAsset = (id: string) => {
    // For demo purposes, we assume they only have a 'welcome' message
    return id === 'welcome';
  };

  const sector = state.current_sector || 'zakelijk';
  const requirements = SECTOR_REQUIREMENTS[sector] || SECTOR_REQUIREMENTS['zakelijk'] || [];
  const missingAssets = requirements.filter(req => !hasAsset(sector === 'zakelijk' ? 'none' : req.id));

  if (missingAssets.length === 0) return null;

  return (
    <BentoCard span="lg" className="bg-va-black text-white p-12 relative overflow-hidden group border-none shadow-2xl">
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles strokeWidth={1.5} size={20} className="text-white" />
            </div>
            <h4 className="text-[15px] font-light tracking-[0.2em] text-primary "><VoiceglotText translationKey="auto.gapanalysiscard.portfolio_analyse.4f3032" defaultText="Portfolio Analyse" /></h4>
          </div>

          <div className="space-y-4">
            <h3 className="text-4xl font-light tracking-tighter leading-none">
              Maak de bereikbaarheid van <br />
              <span className="text-primary">{getPlaceholderValue('company_name')}</span><VoiceglotText translationKey="auto.gapanalysiscard.compleet_.3a9cd5" defaultText="compleet." /></h3>
            <p className="text-white/40 text-[15px] font-light max-w-md">
              Op basis van uw sector ({sector}) adviseren wij de volgende ontbrekende berichten:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requirements.map((req) => (
                <div 
                  key={req.id}
                  className={`p-4 rounded-[20px] border flex items-center justify-between transition-all ${
                  hasAsset(req.id) 
                    ? 'bg-white/5 border-white/10 opacity-40' 
                    : 'bg-primary/10 border-primary/20 scale-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {hasAsset(req.id) ? (
                    <CheckCircle2 strokeWidth={1.5} size={16} className="text-green-500" />
                  ) : (
                    <AlertCircle size={16} className="text-primary" />
                  )}
                  <span className="text-[15px] font-light tracking-widest">{req.label}</span>
                </div>
                {!hasAsset(req.id) && (
                  <span className="text-[15px] font-light bg-primary px-2 py-1 rounded-full tracking-tighter "><VoiceglotText translationKey="auto.gapanalysiscard.aanbevolen.991a0b" defaultText="Aanbevolen" /></span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => playClick('deep')}
          className="mt-12 flex items-center justify-between w-full p-6 bg-primary rounded-[10px] hover:bg-white hover:text-va-black transition-all duration-500 group/btn"
        >
          <div className="text-left">
            <p className="text-[15px] font-light tracking-widest opacity-60 mb-1 "><VoiceglotText translationKey="auto.gapanalysiscard.direct_bestellen.fd1bd3" defaultText="Direct Bestellen" /></p>
            <h5 className="text-[15px] font-light tracking-tight"><VoiceglotText translationKey="auto.gapanalysiscard.configureer_ontbreke.8ef085" defaultText="Configureer ontbrekende assets" /></h5>
          </div>
          <ArrowRight strokeWidth={1.5} className="group-hover/btn:translate-x-2 transition-transform" />
        </button>
      </div>

      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />
    </BentoCard>
  );
};
