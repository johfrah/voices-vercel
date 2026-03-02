"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { HeadingInstrument, TextInstrument, ContainerInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  const { playClick } = useSonicDNA();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playClick('soft');
              onClose();
            }}
            className="absolute inset-0 bg-va-black/95 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-aura overflow-hidden flex flex-col max-h-[85vh] z-[10001]"
          >
            {/* Header */}
            <div className="p-8 border-b border-black/5 flex justify-between items-center bg-va-off-white/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <X size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <HeadingInstrument level={3} className="text-2xl font-light tracking-tighter text-va-black">
                    <VoiceglotText translationKey="legal.terms.title" defaultText="Algemene Voorwaarden" />
                  </HeadingInstrument>
                  <TextInstrument className="text-[13px] font-light text-va-black/40 tracking-widest uppercase">
                    <VoiceglotText translationKey="legal.terms.last_updated" defaultText="Laatst bijgewerkt: Februari 2026" />
                  </TextInstrument>
                </div>
              </div>
              <button
                onClick={() => {
                  playClick('soft');
                  onClose();
                }}
                className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-va-black/20 hover:text-va-black transition-all hover:scale-105 active:scale-95"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar">
              <section className="space-y-4">
                <h4 className="text-lg font-bold text-va-black tracking-tight">
                  <VoiceglotText translationKey="legal.terms.section1.title" defaultText="1. Toepasselijkheid" />
                </h4>
                <p className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText translationKey="legal.terms.section1.text" defaultText="Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, offertes en overeenkomsten tussen ons en onze opdrachtgevers. Door het plaatsen van een bestelling of het aanvragen van een offerte verklaart de opdrachtgever zich akkoord met deze voorwaarden." />
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="text-lg font-bold text-va-black tracking-tight">
                  <VoiceglotText translationKey="legal.terms.section2.title" defaultText="2. Tarieven en Betaling" />
                </h4>
                <p className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText translationKey="legal.terms.section2.text" defaultText="Alle genoemde tarieven zijn exclusief BTW, tenzij expliciet anders vermeld. Betaling dient te geschieden via de aangeboden betaalmethoden of, indien overeengekomen, per factuur binnen de gestelde termijn van 14 dagen." />
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="text-lg font-bold text-va-black tracking-tight">
                  <VoiceglotText translationKey="legal.terms.section3.title" defaultText="3. Levering en Gebruursrechten" />
                </h4>
                <p className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText translationKey="legal.terms.section3.text" defaultText="De leveringstermijn wordt per project bepaald. De gebruiksrechten (buy-outs) zijn beperkt tot de media, regio en periode zoals gespecificeerd in de bestelling. Elk ander gebruik dient vooraf schriftelijk te worden overeengekomen en kan leiden tot aanvullende kosten." />
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="text-lg font-bold text-va-black tracking-tight">
                  <VoiceglotText translationKey="legal.terms.section4.title" defaultText="4. Annulering en Herroepingsrecht" />
                </h4>
                <p className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText translationKey="legal.terms.section4.text" defaultText="Gezien de aard van de dienstverlening (maatwerk audio-opnames) is het wettelijke herroepingsrecht niet van toepassing op afgeronde opnames. Annulering van een opdracht na aanvang van de werkzaamheden door de stemacteur is niet kosteloos mogelijk." />
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="text-lg font-bold text-va-black tracking-tight">
                  <VoiceglotText translationKey="legal.terms.section5.title" defaultText="5. Aansprakelijkheid" />
                </h4>
                <p className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText translationKey="legal.terms.section5.text" defaultText="Wij spannen ons in voor een optimale kwaliteit van de geleverde diensten, maar zijn niet aansprakelijk voor indirecte schade of gevolgschade voortvloeiend uit het gebruik van de geleverde audio-opnames." />
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="p-8 bg-va-off-white/50 border-t border-black/5 flex justify-center">
              <button
                onClick={() => {
                  playClick('deep');
                  onClose();
                }}
                className="va-btn-pro !px-12"
              >
                <VoiceglotText translationKey="legal.terms.understand" defaultText="Ik begrijp het" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
