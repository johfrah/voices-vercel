"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import { FileText, Mail, Send, Sparkles, X } from 'lucide-react';
import React from 'react';

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
  const [message, setMessage] = React.useState(`Dag ${customerName},\n\nBedankt voor je aanvraag bij Voices.be! Hierbij ontvang je de vrijblijvende offerte voor je project.\n\nDetails:\n${items.map(item => `- ${item.name}`).join('\n')}\n\nTotaalbedrag: €${totalAmount} (excl. BTW)\n\nJe kunt deze offerte direct online bevestigen via de link in de bijlage. Heb je nog vragen? Laat het me gerust weten!\n\nMet vriendelijke groet,\n\nJohfrah\nVoices.be`);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-va-black/60 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-3xl bg-white rounded-[40px] shadow-aura overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-black/5 flex justify-between items-center bg-va-off-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Mail strokeWidth={1.5} size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tighter">Offerte Preview</h3>
              <p className="text-[15px] font-bold text-va-black/40 tracking-widest">Personaliseer je bericht voor verzending</p>
            </div>
          </div>
          <button 
            onClick={() => {
              playClick('soft');
              onClose();
            }}
            className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-va-black/20 hover:text-va-black transition-all"
          >
            <X strokeWidth={1.5} size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          <div className="space-y-4">
            <label className="text-[15px] font-black tracking-widest text-va-black/40 ml-2">E-mail Bericht</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-80 bg-va-off-white border-none rounded-[32px] p-8 text-base font-medium leading-relaxed focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          <div className="bg-primary/5 rounded-[32px] p-8 border border-primary/10 flex items-start gap-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
              <FileText size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-black tracking-tight mb-1">Bijlage: Offerte_Voices.pdf</h4>
              <p className="text-[15px] text-va-black/40 font-medium leading-relaxed">
                Het systeem genereert automatisch een PDF met de tarieven en voorwaarden. 
                De klant kan deze digitaal ondertekenen.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-va-off-white border-t border-black/5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[15px] font-black tracking-widest text-va-black/30">
            <Sparkles strokeWidth={1.5} size={14} className="text-primary" />
            Core Admin Protocol Active
          </div>
          <button 
            onClick={() => {
              playClick('deep');
              onSend(message);
            }}
            className="va-btn-pro !bg-primary flex items-center gap-3 !px-10"
          >
            Offerte Verzenden <Send strokeWidth={1.5} size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
