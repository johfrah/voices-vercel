"use client";

import { useVoicesState } from '@/contexts/VoicesStateContext';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  PageWrapperInstrument, 
  SectionInstrument, 
  TextInstrument,
  ButtonInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { VoiceCard } from '@/components/ui/VoiceCard';
import { ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const { state } = useVoicesState();
  const favoriteActors = state.selected_actors || [];

  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      <SectionInstrument className="mb-16">
        <Link  
          href="/account" 
          className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft strokeWidth={1.5} size={12} /> 
          <VoiceglotText  translationKey="account.back_to_dashboard" defaultText="Terug naar Dashboard" />
        </Link>
        <ContainerInstrument className="space-y-4">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-light tracking-widest border border-primary/10">
            <Heart strokeWidth={1.5} size={12} fill="currentColor" /> 
            <VoiceglotText  translationKey="account.favorites.badge" defaultText="Mijn Favorieten" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">
            <VoiceglotText  translationKey="account.favorites.title_part1" defaultText="Jouw " />
            <TextInstrument as="span" className="text-primary font-light">
              <VoiceglotText  translationKey="account.favorites.title_part2" defaultText="Selectie" />
            </TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light">
            <VoiceglotText  translationKey="account.favorites.subtitle" defaultText="Een overzicht van alle stemmen die je hebt bewaard." />
          </TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {favoriteActors.length > 0 ? (
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoriteActors.map((actor: any) => (
            <VoiceCard key={actor.id} voice={actor} />
          ))}
        </ContainerInstrument>
      ) : (
        <ContainerInstrument className="text-center py-32 bg-white/50 rounded-[40px] border border-black/5">
          <Heart strokeWidth={1.5} size={48} className="text-va-black/10 mx-auto mb-6" />
          <HeadingInstrument level={3} className="text-2xl font-light mb-4">
            <VoiceglotText translationKey="account.favorites.empty_title" defaultText="Nog geen favorieten" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light mb-8 max-w-md mx-auto">
            <VoiceglotText translationKey="account.favorites.empty_text" defaultText="Je hebt nog geen stemmen aan je selectie toegevoegd. Ontdek onze stemmen en klik op het hartje." />
          </TextInstrument>
          <ButtonInstrument as={Link} href="/agency" className="va-btn-pro">
            <VoiceglotText translationKey="account.favorites.discover_cta" defaultText="Ontdek stemmen" />
          </ButtonInstrument>
        </ContainerInstrument>
      )}
    </PageWrapperInstrument>
  );
}
