"use client";

import dynamic from 'next/dynamic';
import { ContainerInstrument } from "@/components/ui/LayoutInstruments";
import { Loader2 } from "lucide-react";

//  NUCLEAR LOADING LAW: Load heavy manager content only on client to prevent hydration mismatch
const VoiceManagerContent = dynamic(
  () => import('@/components/admin/VoiceManagerContent'),
  { 
    ssr: false,
    loading: () => (
      <ContainerInstrument className="p-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-va-black/40 font-light tracking-widest uppercase text-sm">Initializing Voice Manager...</p>
      </ContainerInstrument>
    )
  }
);

export default function VoiceManagerPage() {
  return <VoiceManagerContent />;
}
