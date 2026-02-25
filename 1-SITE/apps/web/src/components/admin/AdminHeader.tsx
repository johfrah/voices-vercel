"use client";

import Link from 'next/link';
import { useTranslation } from '@/contexts/TranslationContext';
import { ContainerInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotImage } from '@/components/ui/VoiceglotImage';

export const AdminHeader = () => {
  const { market } = useTranslation();
  
  return (
    <header className="fixed top-0 left-0 right-0 h-[80px] bg-white/80 backdrop-blur-md border-b border-black/[0.03] z-[150] flex items-center px-8">
      <ContainerInstrument className="flex items-center justify-between w-full max-w-[1600px] mx-auto">
        <Link href="/admin" className="flex items-center gap-4 group">
          <div className="relative w-10 h-10 bg-va-black rounded-[10px] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
            {market?.logo_url ? (
              <VoiceglotImage 
                src={market.logo_url} 
                alt="Logo" 
                width={40} 
                height={40} 
                className="object-contain p-1 invert brightness-0"
                priority
              />
            ) : (
              <div className="text-white font-bold text-xl">V</div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold tracking-[0.2em] text-va-black uppercase Raleway">Admin</span>
            <span className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">Control Center</span>
          </div>
        </Link>
        
        <nav className="flex items-center gap-8">
          <Link href="/admin/orders" className="text-[13px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors uppercase">Orders</Link>
          <Link href="/admin/users" className="text-[13px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors uppercase">Users</Link>
          <Link href="/admin/settings" className="text-[13px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors uppercase">Settings</Link>
          <div className="w-px h-4 bg-black/10 mx-2" />
          <Link href="/" className="text-[11px] font-bold tracking-[0.2em] text-primary hover:text-va-black transition-colors uppercase">Naar Site</Link>
        </nav>
      </ContainerInstrument>
    </header>
  );
};
