"use client";

import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ArrowLeft, LayoutDashboard, Construction } from 'lucide-react';
import Link from 'next/link';

export default function ArtistCockpitPage() {
  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-7xl mx-auto">
        <SectionInstrument className="mb-12">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest mb-8">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.back_to_cockpit" defaultText="Terug naar Cockpit" />
          </Link>
          
          <ContainerInstrument className="inline-block bg-primary/10 text-primary text-[13px] font-black px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
            Admin Module
          </ContainerInstrument>
          
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
            Artist Cockpit
          </HeadingInstrument>
          
          <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
            Specifiek beheerpaneel voor onze stemacteurs.
          </TextInstrument>
        </SectionInstrument>

        <ContainerInstrument className="bg-white rounded-[40px] p-20 border border-black/[0.03] shadow-sm flex flex-col items-center justify-center text-center space-y-8">
          <ContainerInstrument className="w-24 h-24 bg-va-off-white rounded-full flex items-center justify-center text-va-black/10">
            <Construction strokeWidth={1.5} size={48} />
          </ContainerInstrument>
          
          <ContainerInstrument className="space-y-2">
            <HeadingInstrument level={2} className="text-3xl font-light tracking-tight">
              Module in Ontwikkeling
            </HeadingInstrument>
            <TextInstrument className="text-[15px] text-black/40 font-medium max-w-md mx-auto">
              Deze module wordt momenteel klaargemaakt voor de Freedom Machine. De database-koppelingen zijn actief, de interface volgt binnenkort.
            </TextInstrument>
          </ContainerInstrument>
          
          <ButtonInstrument as={Link} href="/admin/dashboard" className="va-btn-pro !bg-va-black flex items-center gap-2">
            <LayoutDashboard strokeWidth={1.5} size={16} /> Terug naar Dashboard
          </ButtonInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
