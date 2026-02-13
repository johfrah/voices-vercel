"use client";

import { useState } from "react";
import { 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  InputInstrument
} from "@/components/ui/LayoutInstruments";
import { Heart, X, ShieldCheck, Loader2 } from "lucide-react";
import { VoiceglotText } from "@/components/ui/VoiceglotText";

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

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-va-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[20px] shadow-aura-lg overflow-hidden relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-va-black/20 hover:text-va-black transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-10">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
            <Heart size={24} fill="currentColor" />
          </div>

          <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter mb-2">
            Support {artistName}
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light mb-8">
            Jouw bijdrage gaat 100% naar de artiest voor nieuwe releases.
          </TextInstrument>

          <form onSubmit={handleDonate} className="space-y-6">
            <div>
              <label className="text-[10px] font-light tracking-widest text-va-black/40 uppercase mb-2 block">
                Bedrag (EUR)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {["5", "10", "25", "50"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-3 rounded-[10px] text-sm font-light transition-all border ${
                      amount === val 
                        ? "bg-va-black text-white border-va-black" 
                        : "bg-va-off-white text-va-black/40 border-transparent hover:border-va-black/10"
                    }`}
                  >
                    €{val}
                  </button>
                ))}
              </div>
              <InputInstrument 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ander bedrag..."
                className="!bg-va-off-white !border-transparent focus:!border-primary/20"
                min="1"
                required
              />
            </div>

            <div className="space-y-4">
              <InputInstrument 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Je naam"
                required
              />
              <InputInstrument 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Je e-mailadres"
                required
              />
            </div>

            <ButtonInstrument 
              type="submit"
              disabled={loading}
              className="w-full va-btn-pro !py-6 !rounded-[10px] !bg-va-black !text-white flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>Doneer €{amount} nu</span>
                  <ShieldCheck size={18} className="opacity-40" />
                </>
              )}
            </ButtonInstrument>

            <p className="text-[10px] font-light text-va-black/20 text-center">
              Veilig betalen via Mollie · Geen extra kosten
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
