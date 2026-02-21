"use client";

import { ButtonInstrument, ContainerInstrument, TextInstrument, FixedActionDockInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Phone, Mail, MessageSquare, Zap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSonicDNA } from "@/lib/sonic-dna";

export function JohfrahActionDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { playClick } = useSonicDNA();
  
  const getPortfolioHref = (subPath: string) => {
    if (typeof window === 'undefined') return subPath;
    const host = window.location.host;
    if (host.includes('localhost')) {
      // Op localhost willen we subroutes direct op de root simuleren voor testen
      return subPath;
    }
    return subPath;
  };

  // Alleen tonen op johfrah portfolio pagina's
  if (!pathname.includes('/portfolio/johfrah') || pathname.includes('/bestellen')) return null;

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
        <TextInstrument className="text-[10px] font-light tracking-[0.2em] uppercase">Bestel</TextInstrument>
      </ButtonInstrument>

      <div className="w-px h-8 bg-black/5" />

      <ButtonInstrument 
        as="a" 
        href="tel:+32475123456" 
        variant="ghost" 
        className="flex flex-col items-center gap-1 px-4 py-2 text-va-black hover:text-primary transition-colors"
      >
        <Phone size={18} strokeWidth={1.5} />
        <TextInstrument className="text-[10px] font-light tracking-[0.2em] uppercase">Bel</TextInstrument>
      </ButtonInstrument>
      
      <div className="w-px h-8 bg-black/5" />
      
      <ButtonInstrument 
        as="a" 
        href="mailto:hallo@johfrah.be" 
        variant="ghost" 
        className="flex flex-col items-center gap-1 px-4 py-2 text-va-black hover:text-primary transition-colors"
      >
        <Mail size={18} strokeWidth={1.5} />
        <TextInstrument className="text-[10px] font-light tracking-[0.2em] uppercase">Mail</TextInstrument>
      </ButtonInstrument>
      
      <div className="w-px h-8 bg-black/5" />
      
      <ButtonInstrument 
        as="a" 
        href="https://wa.me/32475123456" 
        target="_blank"
        variant="ghost" 
        className="flex flex-col items-center gap-1 px-4 py-2 text-va-black hover:text-primary transition-colors"
      >
        <MessageSquare size={18} strokeWidth={1.5} />
        <TextInstrument className="text-[10px] font-light tracking-[0.2em] uppercase">WhatsApp</TextInstrument>
      </ButtonInstrument>
    </FixedActionDockInstrument>
  );
}
