"use client";

import { ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useSonicDNA } from "@/lib/sonic-dna";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface WorkshopCardProps {
  workshop: any;
}

export const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop }) => {
  const { playClick } = useSonicDNA();
  const router = useRouter();
  
  const handleCardClick = () => {
    playClick('soft');
    router.push(`/studio/${workshop.slug}`);
  };
  
  const handleCTAClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick('pro');
  };
  
  return (
    <ContainerInstrument 
      onClick={handleCardClick}
      className="group relative bg-white rounded-[20px] overflow-hidden shadow-aura hover:scale-[1.01] active:scale-[0.99] transition-all duration-500 border border-black/[0.02] flex flex-col cursor-pointer touch-manipulation"
      style={{ minHeight: '480px' }}
    >
      {/* 🎬 VIDEO PREVIEW / AFTERMOVIE */}
      {workshop.media && (
        <ContainerInstrument className="relative aspect-video w-full bg-va-black overflow-hidden">
          <video 
            src={`/assets/${workshop.media.filePath}`}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
            muted
            loop
            playsInline
            autoPlay
          />
          <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <ContainerInstrument className="absolute bottom-4 left-6 flex items-center gap-2">
            <ContainerInstrument className="w-8 h-8 rounded-[10px] bg-primary/80 backdrop-blur-md flex items-center justify-center text-white">
              <Image src="/assets/common/branding/icons/PLAY.svg" width={14} height={14} alt="" className="brightness-0 invert ml-1" />
            </ContainerInstrument>
            <TextInstrument className="text-[15px] font-light text-white tracking-widest">
              <VoiceglotText translationKey="studio.aftermovie" defaultText="Aftermovie" />
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      )}

      <ContainerInstrument className="p-8 flex flex-col flex-grow">
        <ContainerInstrument className="flex justify-between items-start mb-8">
          <ContainerInstrument className="bg-black text-white text-[15px] font-light px-4 py-1.5 rounded-[10px] tracking-widest">
            <VoiceglotText translationKey="studio.workshop_badge" defaultText="Workshop" />
          </ContainerInstrument>
          <TextInstrument className="text-[15px] font-light text-black/30 tracking-widest flex items-center gap-2">
            <Image src="/assets/common/branding/icons/INFO.svg" width={12} height={12} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} /> {new Date(workshop.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' })}
          </TextInstrument>
        </ContainerInstrument>

        <HeadingInstrument level={3} className="text-2xl font-light tracking-tighter leading-none mb-4 group-hover:text-primary transition-colors">
          <VoiceglotText translationKey={`studio.workshop.${workshop.id}.title`} defaultText={workshop.title} />
        </HeadingInstrument>
        
        <TextInstrument className="text-black/50 text-[15px] mb-8 font-light leading-relaxed max-w-xs flex-grow">
          <VoiceglotText 
            translationKey={`studio.workshop.${workshop.id}.description`} 
            defaultText={workshop.description || 'Ga samen met de workshopgever aan de slag in de studio.'} 
          />
        </TextInstrument>

        <ContainerInstrument className="flex justify-between items-end pt-4 border-t border-black/[0.03]">
          <ContainerInstrument>
            <TextInstrument className="text-[15px] text-black/40 font-light tracking-widest mb-1">
              <VoiceglotText translationKey="studio.investment" defaultText="Investering" />
            </TextInstrument>
            <TextInstrument className="text-2xl font-light tracking-tighter">€ {workshop.price}</TextInstrument>
          </ContainerInstrument>
          
          <Link 
            href={`/studio/${workshop.slug}`}
            onClick={handleCTAClick}
            className="flex items-center gap-3 text-[15px] font-light tracking-widest text-primary group/btn min-h-[44px] px-2 -mx-2 rounded-[10px] active:bg-primary/5 transition-colors"
          >
            <VoiceglotText translationKey="studio.book_cta" defaultText="Bekijk workshop" />
            <Image src="/assets/common/branding/icons/FORWARD.svg" width={16} height={16} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} className="group-hover/btn:translate-x-2 transition-transform" />
          </Link>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
