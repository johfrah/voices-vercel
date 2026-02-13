import { BentoCard, BentoGrid } from '@/components/ui/BentoGrid';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, PageWrapperInstrument, SectionInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { SpatialOrderTrackerInstrument } from '@/components/ui/SpatialOrderTrackerInstrument';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ArrowLeft, ExternalLink, FileText, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function OrdersPage() {
  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      <SectionInstrument className="mb-16">
        <Link 
          href="/account" 
          className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-va-black/40 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft strokeWidth={1.5} size={12} /> 
          <VoiceglotText translationKey="account.back_to_dashboard" defaultText="Terug naar Dashboard" />
        </Link>
        <ContainerInstrument className="space-y-4">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-500 text-[15px] font-black tracking-widest border border-blue-500/10">
            <ShoppingBag size={12} fill="currentColor" /> 
            <VoiceglotText translationKey="account.orders.badge" defaultText="Besteloverzicht" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter">
            <VoiceglotText translationKey="account.orders.title_part1" defaultText="Mijn " />
            <TextInstrument as="span" className="text-primary font-light">
              <VoiceglotText translationKey="account.orders.title_part2" defaultText="Bestellingen" />
            </TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium">
            <VoiceglotText translationKey="account.orders.subtitle" defaultText="Volg de status van je voice-over projecten." />
          </TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <BentoGrid>
        {/* Actieve Order (Spatial Tracking) */}
        <BentoCard 
          span="full" 
          className="bg-white shadow-aura p-12"
          onMouseEnter={() => {}} // Sonic DNA is al in BentoCard ingebouwd via playSwell
        >
          <ContainerInstrument className="flex justify-between items-start mb-12">
            <ContainerInstrument className="space-y-1">
              <TextInstrument className="text-[15px] font-black tracking-widest text-primary animate-pulse">
                <VoiceglotText translationKey="account.orders.live_status" defaultText="Live Status" />
              </TextInstrument>
              <HeadingInstrument level={3} className="text-3xl font-black tracking-tighter">
                <VoiceglotText translationKey="account.orders.example_project" defaultText="Vlaamse Voice-over Commercial" />
              </HeadingInstrument>
              <TextInstrument className="text-[15px] font-bold text-va-black/40 tracking-widest">
                <VoiceglotText translationKey="account.orders.example_id" defaultText="Order #88291 • Stem: Johfrah" />
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex gap-4">
              <ButtonInstrument className="p-4 rounded-2xl bg-va-off-white hover:bg-va-black hover:text-white transition-all group shadow-sm">
                <FileText size={18} className="opacity-40 group-hover:opacity-100" />
              </ButtonInstrument>
              <ButtonInstrument className="p-4 rounded-2xl bg-va-off-white hover:bg-va-black hover:text-white transition-all group shadow-sm">
                <ExternalLink size={18} className="opacity-40 group-hover:opacity-100" />
              </ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          <SpatialOrderTrackerInstrument status="recording" className="my-8" />
          
          <ContainerInstrument className="mt-20 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <ContainerInstrument className="flex items-center gap-3">
              <ContainerInstrument className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/60">
                <VoiceglotText translationKey="account.orders.delivery_estimate" defaultText="Verwachte oplevering: Vandaag voor 18:00" />
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-6">
              <ButtonInstrument className="text-[15px] font-black tracking-widest text-va-black/30 hover:text-primary transition-colors">
                <VoiceglotText translationKey="account.orders.view_script" defaultText="Script bekijken" />
              </ButtonInstrument>
              <ButtonInstrument className="text-[15px] font-black tracking-widest text-primary hover:underline">
                <VoiceglotText translationKey="account.orders.help" defaultText="Hulp nodig?" />
              </ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>

        <BentoCard span="full" className="bg-white shadow-aura p-12 flex flex-col items-center justify-center text-center space-y-6">
          <ContainerInstrument className="w-20 h-20 bg-va-off-white rounded-full flex items-center justify-center text-va-black/10">
            <Package size={40} />
          </ContainerInstrument>
          <ContainerInstrument className="space-y-2">
            <HeadingInstrument level={3} className="text-2xl font-black tracking-tight">
              <VoiceglotText translationKey="account.orders.empty_title" defaultText="Geen actieve bestellingen" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-medium max-w-sm mx-auto">
              <VoiceglotText translationKey="account.orders.empty_text" defaultText="Je hebt op dit moment geen lopende projecten. Start een nieuwe casting om je eerste bestelling te plaatsen." />
            </TextInstrument>
          </ContainerInstrument>
          <Link href="/agency" className="va-btn-pro">
            <VoiceglotText translationKey="account.orders.empty_cta" defaultText="Start Nieuw Project" />
          </Link>
        </BentoCard>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}
