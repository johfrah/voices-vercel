"use client";

import {
    ButtonInstrument,
    HeadingInstrument,
    InputInstrument,
    TextInstrument,
    ContainerInstrument
} from "@/components/ui/LayoutInstruments";
import { Heart, Loader2, ShieldCheck, X } from "lucide-react";
import { useState, useEffect } from "react";
import { VoiceglotText } from "../ui/VoiceglotText";
import { useTranslation } from "@/contexts/TranslationContext";

interface DonationModalProps {
  artistId: string;
  artistName: string;
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
}

export function DonationModal({ artistId, artistName, isOpen, onClose, initialAmount = 25 }: DonationModalProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(initialAmount);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(initialAmount);
    }
  }, [isOpen, initialAmount]);

  // Suggested amounts from legacy blueprint
  const suggestions = [3, 5, 10, 25, 50];

  if (!isOpen) return null;

  const handleDonate = async () => {
    if (!amount || (!isAnonymous && !name) || !email) {
      alert(t('donation.error.fill_fields', "Vul alle velden in."));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/artist/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId,
          amount: amount.toString(),
          donorName: isAnonymous ? "Anoniem" : name,
          donorEmail: email,
          message: message,
          isAnonymous,
          returnUrl: window.location.href
        })
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(t('donation.error.payment_start', "Er ging iets mis bij het starten van de betaling."));
      }
    } catch (err) {
      console.error(err);
      alert(t('common.error.network', "Netwerkfout. Probeer het later opnieuw."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContainerInstrument className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-va-black/40 backdrop-blur-md">
      <ContainerInstrument className="bg-white w-full max-w-md rounded-[20px] shadow-aura-lg overflow-hidden relative animate-in fade-in zoom-in duration-300">
        <ButtonInstrument 
          onClick={onClose}
          className="absolute top-6 right-6 text-va-black/20 hover:text-va-black transition-colors p-0 bg-transparent"
        >
          <X strokeWidth={1.5} size={20} />
        </ButtonInstrument>

        <ContainerInstrument className="p-10">
          <ContainerInstrument className="w-12 h-12 rounded-full bg-[#FFC421]/10 flex items-center justify-center text-[#FFC421] mb-6">
            <Heart strokeWidth={1.5} size={24} fill="currentColor" />
          </ContainerInstrument>

          <HeadingInstrument level={2} className="text-3xl font-black uppercase tracking-tight mb-2">
            Support the artist
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium mb-8">
            Help {artistName} realize his first EP.
          </TextInstrument>

          <ContainerInstrument className="space-y-8">
            {/* 💰 AMOUNT SUMMARY (Simplified) */}
            <ContainerInstrument className="bg-va-off-white p-6 rounded-[15px] border border-black/[0.03] flex justify-between items-center">
              <div>
                <TextInstrument className="text-[10px] font-black uppercase tracking-[0.2em] text-va-black/30 mb-1">
                  Selected amount
                </TextInstrument>
                <HeadingInstrument level={3} className="text-2xl font-black text-va-black">
                  €{amount}
                </HeadingInstrument>
              </div>
              <ButtonInstrument 
                variant="plain" 
                size="none" 
                onClick={onClose}
                className="text-[10px] font-black uppercase tracking-widest text-[#FFC421] hover:opacity-70 transition-all border-b border-[#FFC421]/20 pb-0.5"
              >
                Change
              </ButtonInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="space-y-4 pt-4 border-t border-black/[0.03]">
              <div className="flex items-center gap-3 px-4 py-2 bg-va-off-white rounded-[10px] border border-black/[0.02]">
                <input 
                  type="checkbox" 
                  id="anonymous" 
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#FFC421] focus:ring-[#FFC421]"
                />
                <label htmlFor="anonymous" className="text-[11px] font-black uppercase tracking-widest text-va-black/40 cursor-pointer">
                  Donate anonymously
                </label>
              </div>

              {!isAnonymous && (
                <ContainerInstrument className="space-y-2">
                  <InputInstrument 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 rounded-[10px] bg-va-off-white border-none focus:ring-2 focus:ring-[#FFC421]/20 transition-all font-light"
                    placeholder={t('common.placeholder.name', "Your name")}
                  />
                </ContainerInstrument>
              )}

              <ContainerInstrument className="space-y-2">
                <InputInstrument 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-[10px] bg-va-off-white border-none focus:ring-2 focus:ring-[#FFC421]/20 transition-all font-light"
                  placeholder={t('common.placeholder.email', "your@email.com")}
                />
              </ContainerInstrument>

              <ContainerInstrument className="space-y-2">
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-6 py-4 rounded-[10px] bg-va-off-white border-none focus:ring-2 focus:ring-[#FFC421]/20 transition-all font-light text-sm min-h-[80px] resize-none"
                  placeholder={t('donation.placeholder.message', "Personal message for Youssef (optional)")}
                />
              </ContainerInstrument>
            </ContainerInstrument>

            <div className="space-y-4">
              <ButtonInstrument 
                onClick={handleDonate}
                disabled={loading}
                className="w-full py-6 rounded-[10px] bg-[#FFC421] text-va-black text-[15px] font-black uppercase tracking-widest hover:bg-va-black hover:text-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-aura"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} strokeWidth={1.5} />
                ) : (
                  <>
                    <ShieldCheck strokeWidth={1.5} size={20} />
                    Donate €{amount} now
                  </>
                )}
              </ButtonInstrument>
              <p className="text-[9px] text-va-black/20 font-medium text-center uppercase tracking-widest leading-relaxed">
                Secure via Bancontact, Card, Apple Pay<br/>
                Pure donation • No goods or services in return
              </p>
            </div>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
