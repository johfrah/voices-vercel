"use client";

import { ButtonInstrument, TextInstrument, FixedActionDockInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Phone, Mail, Zap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSonicDNA } from "@/lib/engines/sonic-dna";
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";

export function JohfrahActionDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { playClick } = useSonicDNA();
  const market = MarketManager.getCurrentMarket();
  
  const getPortfolioHref = (subPath: string) => {
    return subPath;
  };

  // Alleen tonen op johfrah portfolio pagina's
  if (market.market_code !== 'PORTFOLIO' || pathname.includes('/bestellen')) return null;

  const handleOrderClick = () => {
    playClick('pro');
    router.push(getPortfolioHref('/bestellen'));
  };

  return (
    <FixedActionDockInstrument className="md:hidden">
      <ButtonInstrument 
        onClick={handleOrderClick}
        variant="plain" 
        className="flex flex-col items-center gap-1 px-4 py-2 text-primary hover:text-primary transition-colors"
      >
        <Zap size={18} strokeWidth={2} fill="currentColor" className="animate-pulse" />
        <TextInstrument className="text-[10px] font-light tracking-[0.2em] uppercase">
          <VoiceglotText translationKey="common.order" defaultText="Bestel" />
        </TextInstrument>
      </ButtonInstrument>

      <div className="w-px h-8 bg-black/5" />

      <ButtonInstrument 
        as="a" 
        href={`tel:${market.phone?.replace(/\s+/g, '') || ''}`} 
        variant="ghost" 
        className="flex flex-col items-center gap-1 px-4 py-2 text-va-black hover:text-primary transition-colors"
      >
        <Phone size={18} strokeWidth={1.5} />
        <TextInstrument className="text-[10px] font-light tracking-[0.2em] uppercase">
          <VoiceglotText translationKey="common.call" defaultText="Bel" />
        </TextInstrument>
      </ButtonInstrument>
      
      <div className="w-px h-8 bg-black/5" />
      
      <ButtonInstrument 
        as="a" 
        href={`mailto:${market.email}`} 
        variant="ghost" 
        className="flex flex-col items-center gap-1 px-4 py-2 text-va-black hover:text-primary transition-colors"
      >
        <Mail size={18} strokeWidth={1.5} />
        <TextInstrument className="text-[10px] font-light tracking-[0.2em] uppercase">
          <VoiceglotText translationKey="common.mail" defaultText="Mail" />
        </TextInstrument>
      </ButtonInstrument>
    </FixedActionDockInstrument>
  );
}
