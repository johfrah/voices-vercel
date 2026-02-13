"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import { AlertCircle, Filter, TrendingUp, UserCheck, UserPlus } from 'lucide-react';
import React from 'react';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument
} from '@/components/ui/LayoutInstruments';

interface FunnelStepProps {
  label: string;
  value: number;
  subLabel: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

const FunnelStep: React.FC<FunnelStepProps> = ({ label, value, subLabel, icon, color, onClick }) => (
  <ContainerInstrument 
    onClick={onClick}
    className="flex flex-col gap-2 p-4 md:p-6 rounded-[32px] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group active:scale-95"
  >
    <ContainerInstrument className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center text-white mb-2 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
      {icon}
    </ContainerInstrument>
    <TextInstrument className="text-2xl md:text-3xl font-black tracking-tighter text-white">{value}</TextInstrument>
    <TextInstrument className="text-[15px] font-black tracking-widest text-white/40">{label}</TextInstrument>
    <TextInstrument className="text-[15px] font-medium text-white/20">{subLabel}</TextInstrument>
  </ContainerInstrument>
);

export const WorkshopFunnel: React.FC<{ data: any }> = ({ data }) => {
  const { playClick } = useSonicDNA();
  const { t } = useTranslation();
  const stats = data.statistics || {};
  
  const handleStepClick = (label: string) => {
    playClick('light');
    console.log(`Atomic Mapping: Funnel step ${label} clicked, intent: management`);
  };

  return (
    <ContainerInstrument className="space-y-6 md:space-y-8">
      {/* Funnel Visualizer */}
      <ContainerInstrument className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <FunnelStep 
          label={t('studio.funnel.total', 'Totaal')} 
          value={stats.total_workshops || 0} 
          subLabel={t('studio.funnel.total_sub', "Alle workshops")}
          icon={<Filter strokeWidth={1.5} size={18} />}
          color="bg-va-black border border-white/10"
          onClick={() => handleStepClick('Totaal')}
        />
        <FunnelStep 
          label={t('studio.funnel.upcoming', 'Aankomend')} 
          value={stats.upcoming_workshops || 0} 
          subLabel={t('studio.funnel.upcoming_sub', "In de pijplijn")}
          icon={<UserPlus strokeWidth={1.5} size={18} />}
          color="bg-primary"
          onClick={() => handleStepClick('Aankomend')}
        />
        <FunnelStep 
          label={t('studio.funnel.completed', 'Voltooid')} 
          value={stats.completed_workshops || 0} 
          subLabel={t('studio.funnel.completed_sub', "Succesvol afgerond")}
          icon={<UserCheck strokeWidth={1.5} size={18} />}
          color="bg-green-500"
          onClick={() => handleStepClick('Voltooid')}
        />
        <FunnelStep 
          label={t('studio.funnel.cancelled', 'Geannuleerd')} 
          value={stats.cancelled_workshops || 0} 
          subLabel={t('studio.funnel.cancelled_sub', "Niet doorgegaan")}
          icon={<AlertCircle strokeWidth={1.5} size={18} />}
          color="bg-red-500"
          onClick={() => handleStepClick('Geannuleerd')}
        />
      </ContainerInstrument>

      {/* Conversion Rate Card - Atomic Mapping: Retention/Growth */}
      <ContainerInstrument 
        onClick={() => playClick('deep')}
        className="p-6 md:p-10 rounded-[40px] bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/10 hover:border-primary/30 transition-all cursor-pointer group shadow-aura active:scale-[0.99]"
      >
        <ContainerInstrument className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-0">
          <ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-2 mb-4">
              <TrendingUp strokeWidth={1.5} size={16} className="text-primary" />
              <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest text-primary">
                <VoiceglotText  translationKey="studio.funnel.insights.title" defaultText="Performance Insights" />
              </HeadingInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-5xl md:text-6xl font-black tracking-tighter text-va-black group-hover:text-primary transition-colors duration-500">68.4%</TextInstrument>
            <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/30 mt-2">
              <VoiceglotText  translationKey="studio.funnel.insights.avg_conversion" defaultText="Gemiddelde Conversie" />
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="text-left md:text-right">
            <TextInstrument className="text-[15px] font-medium text-va-black/50 max-w-[220px] leading-relaxed">
              <VoiceglotText  
                translationKey="studio.funnel.insights.text" 
                defaultText="Uw workshops presteren 12% beter dan het marktgemiddelde. De persona 'Ambitieuze Spreker' converteert het hoogst." 
              />
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="mt-8 md:mt-10 h-3 w-full bg-va-black/5 rounded-full overflow-hidden p-[2px]">
          <ContainerInstrument 
            className="h-full bg-primary rounded-full shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all duration-1000 ease-out" 
            style={{ width: '68.4%' }} 
          />
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
