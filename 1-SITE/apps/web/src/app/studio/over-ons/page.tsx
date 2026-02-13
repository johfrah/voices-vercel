import { ArrowLeft } from 'lucide-react';
import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import Image from "next/image";
import Link from "next/link";

export default function OverOnsPage() {
  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pt-32 pb-40 px-6">
      <ContainerInstrument className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <SectionInstrument className="mb-20 space-y-4">
          <Link  
            href="/studio" 
            className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-va-black/40 hover:text-primary transition-all mb-4"
          >
            <ArrowLeft strokeWidth={1.5} size={14} /> 
            <VoiceglotText  translationKey="studio.back_to_studio" defaultText="Terug naar Studio" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none"><VoiceglotText  translationKey="studio.about.title" defaultText="Vakmanschap achter" /><br /><TextInstrument className="text-primary font-light"><VoiceglotText  translationKey="auto.page.het_geluid_.567d64" defaultText="het geluid." /></TextInstrument></HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium text-xl max-w-2xl"><VoiceglotText  
              translationKey="studio.about.subtitle" 
              defaultText="Bij Voices.be verkopen we geen audiobestanden. We verkopen retentie, autoriteit en emotie." 
            /></TextInstrument>
        </SectionInstrument>

        {/* FOUNDER SECTION */}
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          <ContainerInstrument className="relative aspect-square rounded-[20px] overflow-hidden shadow-aura-lg grayscale hover:grayscale-0 transition-all duration-1000">
            <Image  
              src="/assets/common/founder/johfrah-avatar-be.png" 
              alt="Johfrah Lefebvre"
              fill
              className="object-cover"
            />
          </ContainerInstrument>
          <ContainerInstrument className="space-y-8">
            <ContainerInstrument className="space-y-4">
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter text-va-black"><VoiceglotText  translationKey="studio.about.founder.title" defaultText="Johfrah Lefebvre" /><TextInstrument className="text-va-black/60 font-light leading-relaxed"><VoiceglotText  
                  translationKey="studio.about.founder.text1" 
                  defaultText="Al meer dan 15 jaar breng ik teksten tot leven voor merken die weigeren op te gaan in de grijze massa. Je herkent mijn stem van de tv-spots van Trivago of als de gids bij Tesla en Samsung." 
                /></TextInstrument></HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light leading-relaxed"><VoiceglotText  
                  translationKey="studio.about.founder.text2" 
                  defaultText="Mijn achtergrond ligt in de televisie. Met mijn team won ik een International Emmy Award voor 'Sorry voor Alles'. Die ervaring in regie en storytelling is de motor achter de Studio van Voices.be." 
                /></TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-4">
              <Image  src="/assets/common/branding/icons/INFO.svg" width={32} height={32} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
              <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/40"><VoiceglotText  translationKey="auto.page.international_emmy_a.39163c" defaultText="International Emmy Award winner" /></TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* COACH SECTION (Bernadette) */}
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          <ContainerInstrument className="order-2 md:order-1 space-y-8">
            <ContainerInstrument className="space-y-4">
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter text-va-black"><VoiceglotText  translationKey="studio.about.coach.title" defaultText="Bernadette Timmermans" /><TextInstrument className="text-va-black/60 font-light leading-relaxed"><VoiceglotText  
                  translationKey="studio.about.coach.text1" 
                  defaultText="Als gerenommeerd stemcoach en auteur van 'Klink Klaar' is Bernadette de autoriteit op het gebied van uitspraak en stemgebruik in Vlaanderen." 
                /></TextInstrument></HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light leading-relaxed"><VoiceglotText  
                  translationKey="studio.about.coach.text2" 
                  defaultText="Sinds 1984 adviseert zij mediahuizen zoals VRT en DPG. In onze Studio deelt zij haar expertise om stemmen naar een hoger niveau te tillen." 
                /></TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-4">
              <Image  src="/assets/common/branding/icons/INFO.svg" width={32} height={32} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
              <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/40"><VoiceglotText  translationKey="studio.about.coach.badge" defaultText="VRT stemcoach & expert" /></TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="order-1 md:order-2 relative aspect-square rounded-[20px] overflow-hidden shadow-aura-lg grayscale hover:grayscale-0 transition-all duration-1000">
            <Image  
              src="/assets/common/coaches/bernadette.jpg" 
              alt="Bernadette Timmermans"
              fill
              className="object-cover"
            />
          </ContainerInstrument>
        </ContainerInstrument>

        {/* PHILOSOPHY */}
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          <ContainerInstrument className="p-10 rounded-[20px] bg-white border border-black/5 shadow-aura space-y-6">
            <Image  src="/assets/common/branding/icons/INFO.svg" width={32} height={32} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
            <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-va-black"><VoiceglotText  translationKey="auto.page.top_selectie.e9e6c4" defaultText="Top-selectie" /><TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed"><VoiceglotText  translationKey="auto.page.geen_eindeloze_lijst.b1c678" defaultText="Geen eindeloze lijsten, maar een gecureerde groep stemmen die we persoonlijk kennen en regisseren." /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="p-10 rounded-[20px] bg-white border border-black/5 shadow-aura space-y-6">
            <Image  src="/assets/common/branding/icons/INFO.svg" width={32} height={32} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
            <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-va-black"><VoiceglotText  translationKey="auto.page.technische_perfectie.ea0d36" defaultText="Technische perfectie" /><TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed"><VoiceglotText  translationKey="auto.page.alles_wordt_geleverd.dd6681" defaultText="Alles wordt geleverd in 48kHz studiokwaliteit, genormaliseerd volgens de strengste loudness-normen." /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="p-10 rounded-[20px] bg-va-black text-white space-y-6">
            <Image  src="/assets/common/branding/icons/INFO.svg" width={32} height={32} alt="" className="brightness-0 invert" />
            <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-white"><VoiceglotText  translationKey="auto.page.digitale_kluis.571296" defaultText="Digitale kluis" /><TextInstrument className="text-white/40 text-[15px] font-light leading-relaxed"><VoiceglotText  translationKey="auto.page.we_bewaren_al_je_scr.a10adf" defaultText="We bewaren al je scripts en instellingen. Een pickup over een jaar klinkt daardoor exact zoals vandaag." /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
