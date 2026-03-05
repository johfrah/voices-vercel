"use client";

import Link from 'next/link';
import { useTranslation } from '@/contexts/TranslationContext';
import { ContainerInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotImage } from '@/components/ui/VoiceglotImage';
import { WorldSelector } from './WorldSelector';
import { Smartphone } from 'lucide-react';

export const AdminHeader = () => {
  const { market } = useTranslation();
  
  // 🛡️ CHRIS-PROTOCOL: Forensic Logo Tracking
  if (typeof window !== 'undefined' && market?.logo_url) {
    console.log(`[AdminHeader] Attempting to load logo: ${market.logo_url} (Market: ${market.market_code})`);
  }
  return (
    <header className="fixed top-0 left-0 right-0 h-[64px] md:h-[80px] bg-white/90 backdrop-blur-md border-b border-black/[0.03] z-[150] flex items-center px-4 md:px-8">
      <ContainerInstrument className="flex items-center justify-between w-full max-w-[1600px] mx-auto">
        <Link href="/admin" className="flex items-center gap-4 group">
            <div className="relative w-8 h-8 bg-va-black rounded-[8px] flex items-center justify-center overflow-hidden transition-transform">
              {market?.logo_url ? (
                <VoiceglotImage 
                  src={market.logo_url} 
                  alt="Logo" 
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain brightness-0 invert"
                  priority
                />
              ) : (
                <div className="text-white font-bold text-xl">V</div>
              )}
            </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold tracking-[0.2em] text-va-black uppercase Raleway">Admin</span>
            <span className="hidden md:block text-[11px] font-light tracking-widest text-va-black/30 uppercase">Beheer</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <WorldSelector />
          <div className="w-px h-4 bg-black/10 mx-2" />
          <Link href="/admin/ademing" className="text-[13px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors uppercase">Ademing</Link>
          <Link href="/admin/orders" className="text-[13px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors uppercase">Orders</Link>
          <Link href="/admin/users" className="text-[13px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors uppercase">Users</Link>
          <Link href="/admin/settings" className="text-[13px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors uppercase">Settings</Link>
          <div className="w-px h-4 bg-black/10 mx-2" />
          <Link href="/" className="text-[11px] font-bold tracking-[0.2em] text-primary hover:text-va-black transition-colors uppercase">Naar Site</Link>
        </nav>
        <nav className="md:hidden flex items-center gap-2">
          <Link href="/admin/mobile" className="h-9 w-9 rounded-full border border-black/10 flex items-center justify-center text-va-black/60">
            <Smartphone size={16} />
          </Link>
          <Link href="/admin/orders" className="px-3 py-2 rounded-full bg-va-black text-white text-[10px] font-bold tracking-wider uppercase">
            Orders
          </Link>
        </nav>
      </ContainerInstrument>
    </header>
  );
};
