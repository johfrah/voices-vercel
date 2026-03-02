import { VoiceglotText } from './VoiceglotText';

interface ActionPreviewProps {
  type: 'email' | 'payment' | 'quote';
  payload: any;
  reasoning?: string;
}

/**
 *  ATOMIC ACTION PREVIEW
 * Rendert het 'concrete resultaat' van een AI-voorstel.
 */
export const AtomicActionPreview = ({ type, payload, reasoning }: ActionPreviewProps) => {
  return (
    <div className="space-y-6">
      {/*  Reasoning Layer */}
      {reasoning && (
        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
          <p className="text-[15px] font-black tracking-widest text-primary mb-2"><VoiceglotText  translationKey="auto.atomicactionpreview.ai_redenering.23dd78" defaultText="AI Redenering" /></p>
          <p className="text-[15px] text-va-black/70 italic">&quot;{reasoning}&quot;</p>
        </div>
      )}

      {/*  Result Preview Layer */}
      <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 bg-va-background border-b border-black/5 flex items-center justify-between">
          <span className="text-[15px] font-black tracking-widest opacity-40"><VoiceglotText  translationKey="auto.atomicactionpreview.concreet_resultaat.0ecf9f" defaultText="Concreet Resultaat" /></span>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[15px] font-bold tracking-tight"><VoiceglotText  translationKey="auto.atomicactionpreview.klaar_voor_verzendin.4f7f40" defaultText="Klaar voor verzending" /></span>
          </div>
        </div>

        <div className="p-8">
          {type === 'email' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-black/5">
                <p className="text-[15px] font-bold">Aan: <span className="font-medium opacity-60">{payload.to}</span></p>
                <p className="text-[15px] font-bold">Onderwerp: <span className="font-medium opacity-60">{payload.subject}</span></p>
              </div>
              <div 
                className="prose prose-sm max-w-none pt-4"
                dangerouslySetInnerHTML={{ __html: payload.html }}
              />
            </div>
          )}

          {type === 'payment' && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black tracking-tighter">{payload.amount}</p>
                <p className="text-[15px] opacity-40 font-bold tracking-widest">IBAN: {payload.recipient_iban}</p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-bold tracking-tight">{payload.recipient_name}</p>
                <p className="text-[15px] opacity-40">Factuur: {payload.invoice_nr}</p>
              </div>
            </div>
          )}

          {type === 'quote' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-black/5">
                <h3 className="text-xl font-light tracking-tight"><VoiceglotText  translationKey="auto.atomicactionpreview.bento_offerte_previe.50c62c" defaultText="Bento Offerte Preview" /></h3>
                <span className="px-3 py-1 bg-primary text-white text-[15px] font-black rounded-full "><VoiceglotText  translationKey="auto.atomicactionpreview.interactief.8edbb5" defaultText="Interactief" /></span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {payload.voices?.map((voice: any) => (
                  <div key={voice.id} className="p-4 bg-va-background rounded-2xl border border-black/5">
                    <p className="font-bold text-[15px]">{voice.name}</p>
                    <p className="text-[15px] opacity-40 font-black">{voice.language}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-va-dark text-white rounded-2xl flex justify-between items-center">
                <span className="text-[15px] font-bold tracking-widest"><VoiceglotText  translationKey="auto.atomicactionpreview.totaalbedrag.ca9253" defaultText="Totaalbedrag" /></span>
                <span className="text-lg font-black italic">{payload.total_price}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
