"use client";

import React, { useEffect, useState } from 'react';
import { BentoCard } from './BentoGrid';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, AlertCircle, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
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
  'zakelijk': [
    { id: 'welcome', label: 'Welkomstboodschap', blueprint: 'Welkom bij {{company_name}}.' },
    { id: 'ivr', label: 'Keuzemenu', blueprint: 'Voor verkoop, druk 1...' },
    { id: 'onhold', label: 'Wachtmuziek', blueprint: 'Blijf aan de lijn...' },
  ]
};

export const GapAnalysisCard: React.FC = () => {
  const { state, getPlaceholderValue } = useVoicesState();
  const { user, isAuthenticated } = useAuth();
  const { playClick } = useSonicDNA();
  const [ownedAssets, setOwnedAssets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOwnedAssets = async () => {
      setLoading(true);
      try {
        // Haal echte orders op om te zien welke assets de klant al heeft
        const res = await fetch('/api/mailbox/inbox'); // We gebruiken de inbox/orders API voor context
        const data = await res.json();
        
        if (data && data.orders) {
          const assets: string[] = [];
          data.orders.forEach((order: any) => {
            if (order.status === 'completed') {
              // Simpele mapping op basis van order namen/types
              if (order.journey === 'agency') assets.push('welcome');
              if (order.items?.some((i: any) => i.name.toLowerCase().includes('ivr'))) assets.push('ivr');
              if (order.items?.some((i: any) => i.name.toLowerCase().includes('wacht'))) assets.push('onhold');
            }
          });
          setOwnedAssets(assets);
        }
      } catch (error) {
        console.error('Failed to fetch owned assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnedAssets();
  }, [isAuthenticated]);

  const hasAsset = (id: string) => ownedAssets.includes(id);

  const sector = state.current_sector || 'zakelijk';
  const requirements = SECTOR_REQUIREMENTS[sector] || SECTOR_REQUIREMENTS['zakelijk'] || [];
  const missingAssets = requirements.filter(req => !hasAsset(req.id));

  if (missingAssets.length === 0 && !loading) return null;

  return (
    <BentoCard span="lg" className="bg-va-black text-white p-12 relative overflow-hidden group border-none shadow-2xl">
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles strokeWidth={1.5} size={20} className="text-white" />
              </div>
              <h4 className="text-[15px] font-light tracking-[0.2em] text-primary "><VoiceglotText  translationKey="auto.gapanalysiscard.portfolio_analyse.4f3032" defaultText="Portfolio Analyse" /></h4>
            </div>
            {loading && <Loader2 className="animate-spin text-primary/40" size={16} />}
          </div>

          <div className="space-y-4">
            <h3 className="text-4xl font-light tracking-tighter leading-none">
              <VoiceglotText 
                translationKey="gap_analysis.title" 
                defaultText={`Maak de bereikbaarheid van ${getPlaceholderValue('company_name')} compleet.`}
                noTranslate={true}
              />
            </h3>
            <p className="text-white/40 text-[15px] font-light max-w-md">
              <VoiceglotText 
                translationKey="gap_analysis.subtitle" 
                defaultText={`Op basis van uw sector (${sector}) adviseren wij de volgende ontbrekende berichten:`}
                noTranslate={true}
              />
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
                    <AlertCircle strokeWidth={1.5} size={16} className="text-primary" />
                  )}
                  <span className="text-[15px] font-light tracking-widest">
                    <VoiceglotText translationKey={`gap_analysis.requirement.${req.id}`} defaultText={req.label} />
                  </span>
                </div>
                {!hasAsset(req.id) && (
                  <span className="text-[15px] font-light bg-primary px-2 py-1 rounded-full tracking-tighter ">
                    <VoiceglotText translationKey="common.recommended" defaultText="Aanbevolen" />
                  </span>
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
            <p className="text-[15px] font-light tracking-widest opacity-60 mb-1 "><VoiceglotText  translationKey="auto.gapanalysiscard.direct_bestellen.fd1bd3" defaultText="Direct Bestellen" /></p>
            <h5 className="text-[15px] font-light tracking-tight"><VoiceglotText  translationKey="auto.gapanalysiscard.configureer_ontbreke.8ef085" defaultText="Configureer ontbrekende assets" /></h5>
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
