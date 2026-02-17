"use client";

import {
    ButtonInstrument,
    HeadingInstrument,
    InputInstrument,
    TextInstrument,
    ContainerInstrument
} from "@/components/ui/LayoutInstruments";
import { Heart, Loader2, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { VoiceglotText } from "../ui/VoiceglotText";

interface DonationModalProps {
  artistId: string;
  artistName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DonationModal({ artistId, artistName, isOpen, onClose }: DonationModalProps) {
  const [amount, setAmount] = useState("10");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDonate = async () => {
    if (!amount || !name || !email) {
      alert("Vul alle velden in.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/artist/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId,
          amount,
          donorName: name,
          donorEmail: email,
          returnUrl: window.location.href
        })
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Er ging iets mis bij het starten van de betaling.");
      }
    } catch (err) {
      console.error(err);
      alert("Netwerkfout. Probeer het later opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContainerInstrument className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-va-black/40 backdrop-blur-sm">
      <ContainerInstrument className="bg-white w-full max-w-md rounded-[20px] shadow-aura-lg overflow-hidden relative animate-in fade-in zoom-in duration-300">
        <ButtonInstrument 
          onClick={onClose}
          className="absolute top-6 right-6 text-va-black/20 hover:text-va-black transition-colors p-0 bg-transparent"
        >
          <X strokeWidth={1.5} size={20} />
        </ButtonInstrument>

        <ContainerInstrument className="p-10">
          <ContainerInstrument className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
            <Heart strokeWidth={1.5} size={24} fill="currentColor" />
          </ContainerInstrument>

          <HeadingInstrument level={2} className="text-3xl font-light tracking-tight mb-2">
            <VoiceglotText  translationKey="artist.donate.title" defaultText="Support de artiest" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light mb-8">
            <VoiceglotText  
              translationKey="artist.donate.desc" 
              defaultText={`Help ${artistName} bij het realiseren van nieuwe producties.`} 
            />
          </TextInstrument>

          <ContainerInstrument className="space-y-6">
            <ContainerInstrument className="space-y-2">
              <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30 ml-4">
                <VoiceglotText  translationKey="artist.donate.amount" defaultText="Bedrag ()" />
              </TextInstrument>
              <InputInstrument 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-6 py-4 rounded-[10px] bg-va-off-white border-none focus:ring-2 focus:ring-primary/20 transition-all font-light text-lg"
                placeholder="25"
              />
            </ContainerInstrument>

            <ContainerInstrument className="space-y-2">
              <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30 ml-4">
                <VoiceglotText  translationKey="common.name" defaultText="Naam" />
              </TextInstrument>
              <InputInstrument 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 rounded-[10px] bg-va-off-white border-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                placeholder="Jouw naam"
              />
            </ContainerInstrument>

            <ContainerInstrument className="space-y-2">
              <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30 ml-4">
                <VoiceglotText  translationKey="common.email" defaultText="E-mailadres" />
              </TextInstrument>
              <InputInstrument 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-[10px] bg-va-off-white border-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                placeholder="jouw@email.com"
              />
            </ContainerInstrument>

            <ButtonInstrument 
              onClick={handleDonate}
              disabled={loading}
              className="w-full py-6 rounded-[10px] bg-primary text-white text-[15px] font-light tracking-widest hover:bg-va-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} strokeWidth={1.5} />
              ) : (
                <>
                  <ShieldCheck strokeWidth={1.5} size={20} />
                  <VoiceglotText  translationKey="artist.donate.cta" defaultText="Veilig doneren" />
                </>
              )}
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
