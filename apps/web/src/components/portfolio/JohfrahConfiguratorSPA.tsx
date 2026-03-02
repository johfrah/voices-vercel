"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { ContainerInstrument, ButtonInstrument, HeadingInstrument } from "@/components/ui/LayoutInstruments";
import ConfiguratorPageClient from "@/app/checkout/configurator/ConfiguratorPageClient";
import CheckoutPageClient from "@/app/checkout/CheckoutPageClient";
import { MobileCheckoutSheet } from "@/components/checkout/MobileCheckoutSheet";
import { getActor } from "@/lib/services/api";

export function JohfrahConfiguratorSPA() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, setStep, selectActor, resetSelection } = useCheckout();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(async () => {
    // Zorg dat Johfrah geselecteerd is
    if (!state.selectedActor) {
      try {
        const actor = await getActor("johfrah");
        if (actor) selectActor(actor);
      } catch (e) {
        console.error("Failed to auto-select Johfrah", e);
      }
    }
    setIsOpen(true);
    setStep('briefing');
    document.body.style.overflow = 'hidden';
  }, [state.selectedActor, selectActor, setStep]);

  // Luister naar URL veranderingen (voor de 'SPA' feel)
  useEffect(() => {
    if (pathname.endsWith('/bestellen')) {
      handleOpen();
    } else {
      setIsOpen(false);
      document.body.style.overflow = 'unset';
    }
  }, [pathname, handleOpen]);

  // Luister naar custom events om de configurator te openen
  useEffect(() => {
    window.addEventListener('johfrah:open-configurator', handleOpen);
    return () => window.removeEventListener('johfrah:open-configurator', handleOpen);
  }, [handleOpen]);

  const handleClose = () => {
    setIsOpen(false);
    document.body.style.overflow = 'unset';
    // Navigeer terug naar de hoofdpagina zonder de query params
    const baseUrl = pathname.split('/bestellen')[0] || '/';
    router.push(baseUrl, { scroll: false });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-va-off-white overflow-y-auto no-scrollbar"
      >
        {/* Header met sluitknop */}
        <div className="sticky top-0 left-0 right-0 z-[310] bg-white/80 backdrop-blur-xl border-b border-black/5 p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <X size={20} strokeWidth={2.5} className="cursor-pointer" onClick={handleClose} />
            </div>
            <HeadingInstrument level={3} className="text-lg font-light tracking-tighter">
              Start je project met Johfrah
            </HeadingInstrument>
          </div>
          <div className="flex items-center gap-4">
             {/* Hier kunnen we eventueel stappen tonen */}
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-12 px-6">
          {state.step === 'briefing' ? (
            <ConfiguratorPageClient 
              isEmbedded={true} 
              hideVoiceCard={false} 
              hideUsageSelector={false}
              minimalMode={true}
            />
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <CheckoutPageClient />
              <MobileCheckoutSheet />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
