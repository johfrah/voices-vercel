import React from 'react';
import { PageWrapperInstrument, SectionInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ActorProfileForm } from '@/components/forms/ActorProfileForm';
import { Sparkles } from 'lucide-react';

export default function ActorSignupPage() {
  const handleSignup = async (data: any) => {
    "use server";
    console.log(' CHRIS-PROTOCOL: Processing new actor signup...', data);
    // Hier komt de DbService.createRecord aanroep
  };

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white relative overflow-hidden py-20 px-6">
      {/*  Liquid Background DNA */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <SectionInstrument className="max-w-4xl mx-auto relative z-10 space-y-12">
        <ContainerInstrument className="text-center space-y-4">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-light tracking-widest border border-primary/10 mx-auto">
            <Sparkles strokeWidth={1.5} size={12} fill="currentColor" /> 
            <VoiceglotText translationKey="signup.badge" defaultText="Join the Agency" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-7xl font-light tracking-tighter leading-[0.9]">
            Word een <TextInstrument as="span" className="text-primary font-light italic">Voices</TextInstrument> Stem
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 text-lg max-w-2xl mx-auto">
            Sluit je aan bij het meest exclusieve voice-over netwerk van de Benelux. 
            In drie stappen staat je profiel klaar voor review.
          </TextInstrument>
        </ContainerInstrument>

        <ActorProfileForm mode="signup" onSave={handleSignup} />

        <ContainerInstrument className="text-center pt-8">
          <TextInstrument className="text-va-black/20 text-[13px] font-light italic">
            Door je aan te melden ga je akkoord met onze algemene voorwaarden voor stemacteurs.
          </TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
