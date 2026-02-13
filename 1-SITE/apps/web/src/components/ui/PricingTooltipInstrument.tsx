import React from 'react';
import { 
  ContainerInstrument, 
  TextInstrument 
} from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';
import { HelpCircle } from 'lucide-react';

/**
 * ⚡ PRICING TOOLTIP INSTRUMENT
 * 
 * Toont context-bewuste uitleg over prijzen en licenties.
 * Volgt de "Vriendelijke Autoriteit" ToV.
 */
export const PricingTooltipInstrument = ({ 
  pricingKey,
  isUnpaid = false
}: { 
  pricingKey: string;
  isUnpaid?: boolean;
}) => {
  const getLicenseTextKey = () => {
    if (isUnpaid) return 'pricing.license.unpaid.desc';
    
    // Specifieke keys voor paid media
    switch (pricingKey) {
      case 'price_online_media': return 'pricing.license.online.desc';
      case 'price_tv_national': return 'pricing.license.tv_national.desc';
      case 'price_radio_national': return 'pricing.license.radio_national.desc';
      case 'price_ivr': return 'pricing.license.ivr.desc';
      default: return 'pricing.license.default.desc';
    }
  };

  const getDefaultText = () => {
    if (isUnpaid) return "Onbeperkt gebruik voor interne projecten, presentaties en niet-commerciële doeleinden. Je betaalt alleen voor de stemopname.";
    
    return "Gebruiksrechten voor commerciële inzet. Dit dekt het gebruik voor de geselecteerde periode en het gekozen medium.";
  };

  return (
    <ContainerInstrument className="group relative inline-block ml-2 align-middle">
      <HelpCircle strokeWidth={1.5} size={14} className="text-va-black/20 group-hover:text-primary transition-colors cursor-help" />
      
      <ContainerInstrument className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-va-black text-white rounded-[16px] shadow-aura opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50">
        <TextInstrument className="text-[15px] font-bold leading-relaxed">
          <VoiceglotText 
            translationKey={getLicenseTextKey()} 
            defaultText={getDefaultText()} 
          />
        </TextInstrument>
        {/* Arrow */}
        <ContainerInstrument className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-va-black" />
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
