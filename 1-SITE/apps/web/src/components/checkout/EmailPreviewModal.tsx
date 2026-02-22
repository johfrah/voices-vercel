"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import { useTranslation } from '@/contexts/TranslationContext';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import React from 'react';
import Image from 'next/image';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  customerName: string;
  totalAmount: string;
  items: any[];
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  onSend, 
  customerName,
  totalAmount,
  items
}) => {
  const { playClick } = useSonicDNA();
  const { t } = useTranslation();
  const market = MarketManager.getCurrentMarket();
  const [message, setMessage] = React.useState(t('quote.preview.default_message', `Dag ${customerName},\n\nBedankt voor je aanvraag bij ${market.name}! Hierbij ontvang je de vrijblijvende offerte voor je project.\n\nDetails:\n${items.map(item => `- ${item.name}`).join('\n')}\n\nTotaalbedrag: ${totalAmount} (excl. BTW)\n\nJe kunt deze offerte direct online bevestigen via de link in de bijlage. Heb je nog vragen? Laat het me gerust weten!\n\nMet vriendelijke groet,\n\nJohfrah\n${market.name}`));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-va-black/95 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-3xl bg-white rounded-[20px] shadow-aura overflow-hidden flex flex-col max-h-[90vh] z-[10001]">
        {/* Header */}
        <div className="p-8 border-b border-black/5 flex justify-between items-center bg-va-off-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-[10px] flex items-center justify-center text-primary">
              <Image  src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
            </div>
            <div>
              <h3 className="text-xl font-light tracking-tighter text-va-black">
                <VoiceglotText translationKey="quote.preview.title" defaultText="Offerte preview" />
              </h3>
              <p className="text-[15px] font-light text-va-black/40 tracking-widest">
                <VoiceglotText translationKey="quote.preview.subtitle" defaultText="Personaliseer je bericht voor verzending" />
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              playClick('soft');
              onClose();
            }}
            className="w-12 h-12 rounded-[10px] bg-white flex items-center justify-center text-va-black/20 hover:text-va-black transition-all"
          >
            <Image  src="/assets/common/branding/icons/BACK.svg" width={24} height={24} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.2 }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          <div className="space-y-4">
            <label className="text-[15px] font-light tracking-widest text-va-black/40 ml-2">
              <VoiceglotText translationKey="quote.preview.label" defaultText="E-mail bericht" />
            </label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-80 bg-va-off-white border-none rounded-[20px] p-8 text-base font-light leading-relaxed focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          <div className="bg-primary/5 rounded-[20px] p-8 border border-primary/10 flex items-start gap-6">
            <div className="w-12 h-12 bg-white rounded-[10px] flex items-center justify-center text-primary shadow-sm">
              <Image  src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-light tracking-tight mb-1 text-va-black">
                <VoiceglotText translationKey="quote.preview.attachment" defaultText="Bijlage: Offerte_Voices.pdf" />
              </h4>
              <p className="text-[15px] text-va-black/40 font-light leading-relaxed">
                <VoiceglotText translationKey="quote.preview.attachment_desc" defaultText="Het systeem genereert automatisch een PDF met de tarieven en voorwaarden. De klant kan deze digitaal ondertekenen." />
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-va-off-white border-t border-black/5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/30">
            <Image  src="/assets/common/branding/icons/INFO.svg" width={14} height={14} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} />
            <VoiceglotText translationKey="quote.preview.admin_status" defaultText="Core Admin Protocol Active" />
          </div>
          <button 
            onClick={() => {
              playClick('deep');
              onSend(message);
            }}
            className="va-btn-pro !bg-primary flex items-center gap-3 !px-10"
          >
            <VoiceglotText translationKey="quote.preview.send" defaultText="Offerte verzenden" /> <Image  src="/assets/common/branding/icons/FORWARD.svg" width={18} height={18} alt="" className="brightness-0 invert" />
          </button>
        </div>
      </div>
    </div>
  );
};
