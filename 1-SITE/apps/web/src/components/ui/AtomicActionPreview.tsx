import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

interface ActionPreviewProps {
  type: 'email' | 'payment' | 'quote';
  payload: any;
  reasoning?: string;
}

/**
 * ⚛️ ATOMIC ACTION PREVIEW
 * Rendert het 'concrete resultaat' van een AI-voorstel.
 */
export const AtomicActionPreview = ({ type, payload, reasoning }: ActionPreviewProps) => {
  return (
    <ContainerInstrument className="space-y-4 md:space-y-6">
      {/* 🧠 Reasoning Layer */}
      {reasoning && (
        <ContainerInstrument className="p-3 md:p-4 bg-primary/5 border border-primary/10 rounded-2xl">
          <TextInstrument className="text-[15px] font-black tracking-widest text-primary mb-2"><VoiceglotText  translationKey="auto.atomicactionpreview.ai_redenering.23dd78" defaultText="AI Redenering" /></TextInstrument>
          <TextInstrument className="text-[15px] text-va-black/70 italic font-light">&quot;{reasoning}&quot;</TextInstrument>
        </ContainerInstrument>
      )}

      {/* 🖼️ Result Preview Layer */}
      <ContainerInstrument className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-sm">
        <ContainerInstrument className="p-3 md:p-4 bg-va-background border-b border-black/5 flex items-center justify-between">
          <TextInstrument as="span" className="text-[15px] font-black tracking-widest opacity-40"><VoiceglotText  translationKey="auto.atomicactionpreview.concreet_resultaat.0ecf9f" defaultText="Concreet Resultaat" /></TextInstrument>
          <ContainerInstrument className="flex gap-2">
            <ContainerInstrument className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <TextInstrument as="span" className="text-[15px] font-bold tracking-tight"><VoiceglotText  translationKey="auto.atomicactionpreview.klaar_voor_verzendin.4f7f40" defaultText="Klaar voor verzending" /></TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="p-6 md:p-8">
          {type === 'email' && (
            <ContainerInstrument className="space-y-3 md:space-y-4">
              <ContainerInstrument className="pb-4 border-b border-black/5">
                <TextInstrument as="p" className="text-[15px] font-bold">
                  <VoiceglotText  translationKey="common.to" defaultText="Aan" />: <TextInstrument as="span" className="font-medium opacity-60">{payload.to}</TextInstrument>
                </TextInstrument>
                <TextInstrument as="p" className="text-[15px] font-bold">
                  <VoiceglotText  translationKey="common.subject" defaultText="Onderwerp" />: <TextInstrument as="span" className="font-medium opacity-60">{payload.subject}</TextInstrument>
                </TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument 
                className="prose prose-sm max-w-none pt-4"
                dangerouslySetInnerHTML={{ __html: payload.html }}
              />
            </ContainerInstrument>
          )}

          {type === 'payment' && (
            <ContainerInstrument className="flex items-center justify-between">
              <ContainerInstrument>
                <TextInstrument className="text-2xl font-black tracking-tighter">€{payload.amount}</TextInstrument>
                <TextInstrument className="text-[15px] opacity-40 font-bold tracking-widest">IBAN: {payload.recipient_iban}</TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="text-right">
                <TextInstrument className="text-[15px] font-bold tracking-tight">{payload.recipient_name}</TextInstrument>
                <TextInstrument className="text-[15px] opacity-40 font-light">
                  <VoiceglotText  translationKey="common.invoice" defaultText="Factuur" />: {payload.invoice_nr}
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          )}

          {type === 'quote' && (
            <ContainerInstrument className="space-y-4 md:space-y-6">
              <ContainerInstrument className="flex items-center justify-between pb-4 md:pb-6 border-b border-black/5">
                <HeadingInstrument level={3} className="text-xl font-light tracking-tight"><VoiceglotText  translationKey="auto.atomicactionpreview.bento_offerte_previe.50c62c" defaultText="Bento Offerte Preview" /></HeadingInstrument>
                <TextInstrument as="span" className="px-3 py-1 bg-primary text-white text-[15px] font-black rounded-full "><VoiceglotText  translationKey="auto.atomicactionpreview.interactief.8edbb5" defaultText="Interactief" /></TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="grid grid-cols-2 gap-3 md:gap-4">
                {payload.voices?.map((voice: any) => (
                  <ContainerInstrument key={voice.id} className="p-3 md:p-4 bg-va-background rounded-2xl border border-black/5">
                    <TextInstrument className="font-bold text-[15px]">{voice.name}</TextInstrument>
                    <TextInstrument className="text-[15px] opacity-40 font-black">{voice.language}</TextInstrument>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
              <ContainerInstrument className="p-4 bg-va-dark text-white rounded-2xl flex justify-between items-center">
                <TextInstrument as="span" className="text-[15px] font-bold tracking-widest"><VoiceglotText  translationKey="auto.atomicactionpreview.totaalbedrag.ca9253" defaultText="Totaalbedrag" /></TextInstrument>
                <TextInstrument as="span" className="text-lg font-black italic">€{payload.total_price}</TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          )}
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
