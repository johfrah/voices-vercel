"use client";

import { ContainerInstrument, HeadingInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

interface AgencyHeroInstrumentProps {
  market?: string;
  searchParams?: Record<string, string>;
  filters?: {
    languages: string[];
    genders: string[];
    styles: string[];
  };
  title?: string;
  subtitle?: string;
}

/**
 *  AGENCY HERO INSTRUMENT (GOD MODE 2026)
 * 
 * Voldoet aan de Zero Laws:
 * - HTML ZERO: Geen rauwe tags in de page layer.
 * - CSS ZERO: Styling via gecentraliseerde classes.
 * - TEXT ZERO: Alle content via Voiceglot.
 */
export const AgencyHeroInstrument: React.FC<AgencyHeroInstrumentProps> = ({ 
  market = 'BE', 
  searchParams = {}, 
  filters = { languages: [], genders: [], styles: [] },
  title,
  subtitle
}) => {
  const { state } = useMasterControl();

  // CHRIS-PROTOCOL: Hide hero entirely during checkout phase to focus on conversion
  if (state.currentStep === 'checkout') return null;

  // JOURNEY-AWARE TITLES (SALLY-MANDATE: Sync with Frontpage for consistency)
  const journeyTitles: Record<string, { p1: string, h: string, p2: string }> = {
    telephony: { p1: "Maak jouw", h: "telefooncentrale", p2: "menselijk." },
    video: { 
      p1: "De mooiste", 
      h: "voice-overs", 
      p2: market === 'BE' ? "van België." : market === 'NLNL' ? "van Nederland." : market === 'FR' ? "de France." : "voor jouw video." 
    },
    commercial: { p1: "Scoor met", h: "high-end", p2: "commercials." }
  };

  const journeySubtitles: Record<string, string> = {
    telephony: 'Van welkomstboodschap tot wachtmuziek. Professionele stemmen die jouw klanten direct vertrouwen geven.',
    video: 'Bedrijfsfilms, explanimations of documentaires. Vind de perfecte match voor jouw visuele verhaal.',
    commercial: 'Radio, TV of Online. Stemmen met autoriteit die jouw merkwaarde en conversie direct verhogen.'
  };

  const activeTitle = journeyTitles[state.journey] || { p1: "Vind de", h: "stem", p2: "voor jouw verhaal." };
  const activeSubtitle = subtitle || journeySubtitles[state.journey] || 'Van bedrijfsfilm tot commercial. Wij vinden de beste stem voor jouw boodschap.';

  // CHRIS-PROTOCOL: Use specific agency keys to avoid conflict with homepage and ensure reactivity
  const titleKeyPart1 = `agency.hero.title_part1_${state.journey}`;
  const titleKeyHighlight = `agency.hero.title_highlight_${state.journey}`;
  const titleKeyPart2 = `agency.hero.title_part2_${state.journey}`;
  const subtitleKey = `agency.hero.subtitle_${state.journey}`;

  return (
    <ContainerInstrument as="header" plain className="va-agency-hero pb-0">
      <ContainerInstrument className="va-container">
        <ContainerInstrument plain className="va-hero-content mb-20 text-center max-w-4xl mx-auto space-y-8">
          {/* Title (SALLY-MANDATE: Airbnb Style matching Frontpage) */}
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] text-va-black">
            {title ? (
              <VoiceglotText translationKey="agency.hero.custom_title" defaultText={title} />
            ) : (
              <>
                <VoiceglotText key={`t1-${state.journey}`} translationKey={titleKeyPart1} defaultText={activeTitle.p1} />
                {" "}
                <TextInstrument as="span" className="text-primary italic font-light text-inherit">
                  <VoiceglotText key={`th-${state.journey}`} translationKey={titleKeyHighlight} defaultText={activeTitle.h} />
                </TextInstrument>
                <br />
                <VoiceglotText key={`t2-${state.journey}`} translationKey={titleKeyPart2} defaultText={activeTitle.p2} />
              </>
            )}
          </HeadingInstrument>
          
          {/* Subtitle */}
          <TextInstrument className="text-xl md:text-2xl font-light text-va-black/40 leading-tight tracking-tight mx-auto max-w-2xl">
            <VoiceglotText key={`sub-${state.journey}`} translationKey={subtitleKey} defaultText={activeSubtitle} />
          </TextInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
