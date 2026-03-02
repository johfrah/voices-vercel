"use client";

import { useCheckout } from "@/contexts/CheckoutContext";
import { ButtonInstrument, TextInstrument, ContainerInstrument } from "@/components/ui/LayoutInstruments";
import { FileText, Download, Loader2, Mail, Send, X, Check } from "lucide-react";
import { useState } from "react";
import { useSonicDNA } from "@/lib/engines/sonic-dna";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useTranslation } from "@/contexts/TranslationContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function QuoteDownloadButton() {
  const { state, subtotal, updateCustomer } = useCheckout();
  const { playClick, playSwell } = useSonicDNA();
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState(state.customer?.email || "");
  const [isSending, setIsSending] = useState(false);

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    playClick('pro');

    try {
      const response = await fetch('/api/checkout/quote-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: state.items,
          customer: state.customer,
          subtotal,
          usage: state.usage,
          briefing: state.briefing
        }),
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Voices_Offerte_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      playClick('success');
      toast.success(t('checkout.quote.success_generated', "Offerte succesvol gegenereerd"));
    } catch (error) {
      console.error('PDF Error:', error);
      toast.error(t('checkout.quote.error_pdf', "Fout bij genereren van PDF"));
      playClick('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSending) return;
    
    setIsSending(true);
    playClick('deep');

    try {
      // Update customer email in context for marketing data
      updateCustomer({ email });

      const response = await fetch('/api/checkout/quote-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          items: state.items,
          customer: { ...state.customer, email },
          subtotal,
          usage: state.usage,
          briefing: state.briefing
        }),
      });

      if (!response.ok) throw new Error('Email failed');

      playClick('success');
      toast.success(t('checkout.quote.success_email', "Offerte is onderweg naar je inbox!"));
      setShowEmailInput(false);
    } catch (error) {
      console.error('Email Error:', error);
      toast.error(t('checkout.quote.error_email', "Fout bij verzenden van e-mail"));
      playClick('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ButtonInstrument
          variant="outline"
          onClick={handleDownload}
          disabled={isGenerating || state.items.length === 0}
          className="w-full !py-6 !rounded-[24px] border-va-black/10 hover:border-va-black hover:bg-va-black hover:text-white transition-all group flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <FileText size={18} className="group-hover:scale-110 transition-transform" />
          )}
          <div className="flex flex-col items-start">
            <TextInstrument className="text-[11px] font-bold tracking-widest uppercase leading-none">
              <VoiceglotText translationKey="action.download_quote" defaultText="Download" />
            </TextInstrument>
            <TextInstrument className="text-[9px] font-medium opacity-40 leading-none mt-1">
              <VoiceglotText translationKey="action.download_quote_desc" defaultText="PDF Offerte" />
            </TextInstrument>
          </div>
        </ButtonInstrument>

        <ButtonInstrument
          variant="outline"
          onClick={() => {
            playClick('soft');
            setShowEmailInput(!showEmailInput);
          }}
          disabled={state.items.length === 0}
          className={cn(
            "w-full !py-6 !rounded-[24px] border-va-black/10 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group flex items-center justify-center gap-3",
            showEmailInput && "border-primary bg-primary/5 text-primary"
          )}
        >
          <Mail size={18} className="group-hover:scale-110 transition-transform" />
          <div className="flex flex-col items-start">
            <TextInstrument className="text-[11px] font-bold tracking-widest uppercase leading-none">
              <VoiceglotText translationKey="action.email_quote" defaultText="Per e-mail" />
            </TextInstrument>
            <TextInstrument className="text-[9px] font-medium opacity-40 leading-none mt-1">
              <VoiceglotText translationKey="action.email_quote_desc" defaultText="Ontvang direct" />
            </TextInstrument>
          </div>
        </ButtonInstrument>
      </div>

      <AnimatePresence>
        {showEmailInput && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSendEmail} className="bg-va-off-white/50 border border-black/[0.03] p-4 rounded-[24px] space-y-3">
              <TextInstrument className="text-[11px] font-bold text-va-black/40 uppercase tracking-widest ml-1">
                <VoiceglotText translationKey="checkout.quote.email_label" defaultText="E-mailadres voor offerte" />
              </TextInstrument>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-va-black/20" size={14} />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('checkout.quote.email_placeholder', "jouw@email.be")}
                    required
                    className="w-full py-3 pl-9 pr-4 bg-white rounded-xl border-transparent focus:ring-2 focus:ring-primary/20 outline-none text-[13px] transition-all"
                  />
                </div>
                <ButtonInstrument
                  type="submit"
                  disabled={isSending || !email}
                  className="px-6 bg-va-black text-white rounded-xl hover:bg-primary transition-all disabled:opacity-30 flex items-center justify-center"
                >
                  {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </ButtonInstrument>
              </div>
              <TextInstrument className="text-[10px] text-va-black/30 italic px-1 leading-relaxed">
                <VoiceglotText translationKey="checkout.quote.email_help" defaultText="Door je e-mailadres in te vullen, kunnen we je ook helpen bij eventuele vragen over deze offerte." />
              </TextInstrument>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
