"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useCheckout } from '@/contexts/CheckoutContext';
import { motion } from 'framer-motion';
import { FileText, Loader2, Music, ShieldCheck, Zap } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

export const PricingSummary: React.FC = () => {
  const { state } = useCheckout();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isJohfrai = (state.selectedActor?.display_name?.toLowerCase().includes('johfrah') && state.selectedActor?.ai_enabled) || state.usage === 'subscription';
  const isSubscription = state.usage === 'subscription';

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/checkout/config');
        const data = await res.json();
        if (data && data.cart) {
          setCart(data.cart);
        }
      } catch (e) {
        console.error('Failed to fetch checkout config', e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Use state from context if available, otherwise fallback to cart
  const hasContextData = state.selectedActor || state.briefing || isSubscription;
  
  if (loading && !hasContextData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  const subtotal = state.pricing.total;
  const tax = subtotal * 0.21;
  const total = subtotal + tax;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {isSubscription && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-between items-center p-6 bg-va-black text-white rounded-[20px] shadow-aura-lg border-b-4 border-primary relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-[10px] bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Zap size={24} fill="currentColor" className="animate-pulse" />
              </div>
              <div>
                <h4 className="font-light text-lg tracking-tight">Johfrai {state.plan}</h4>
                <p className="text-[15px] tracking-widest text-white/40 font-light ">
                  <VoiceglotText translationKey="checkout.summary.subscription_desc" defaultText="Jaarabonnement • Direct Actief" />
                </p>
              </div>
            </div>
            <div className="text-right relative z-10">
              <motion.span 
                key={state.pricing.total}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="block font-light text-2xl text-primary"
              >
                €{state.pricing.total.toFixed(2)}
              </motion.span>
              <span className="text-[15px] tracking-widest text-white/20 font-light ">
                <VoiceglotText translationKey="common.per_month" defaultText="per maand" />
              </span>
            </div>
          </motion.div>
        )}

        {state.selectedActor && !isSubscription && (
          <div className="flex justify-between items-center p-4 bg-white rounded-[20px] border border-black/[0.03] shadow-aura">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-va-off-white relative border border-black/5">
                <Image 
                  src={state.selectedActor.photo_url || '/mic-placeholder.png'} 
                  alt={state.selectedActor.display_name || 'Stemacteur'} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div>
                <h4 className="font-light text-sm text-va-black">
                  <VoiceglotText translationKey={`actor.${state.selectedActor.id}.name`} defaultText={state.selectedActor.display_name} noTranslate={true} />
                </h4>
                <p className="text-[15px] tracking-widest text-va-black/40 font-light ">
                  <VoiceglotText translationKey="common.voice_actor" defaultText="Stemacteur" />
                </p>
              </div>
            </div>
            <span className="font-light text-lg text-va-black">€{state.pricing.base.toFixed(2)}</span>
          </div>
        )}

        {state.briefing && !isSubscription && (
          <div className="flex justify-between items-center p-4 bg-white rounded-[20px] border border-black/[0.03] shadow-aura">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-primary/5 text-primary flex items-center justify-center">
                <FileText size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-light text-sm text-va-black">
                  <VoiceglotText translationKey="checkout.summary.script_title" defaultText="Script & Briefing" />
                </h4>
                <p className="text-[15px] tracking-widest text-va-black/40 font-light ">
                  {state.usage === 'telefonie' ? (
                    <VoiceglotText translationKey="checkout.summary.prompts_count" defaultText={`${state.prompts} prompts gedetecteerd`} />
                  ) : (
                    <VoiceglotText translationKey="checkout.summary.words_count" defaultText={`${state.briefing.trim().split(/\s+/).filter(Boolean).length} woorden`} />
                  )}
                </p>
              </div>
            </div>
            <span className="font-light text-lg text-va-black">€{state.pricing.wordSurcharge.toFixed(2)}</span>
          </div>
        )}

        {(state.music.asBackground || state.music.asHoldMusic) && (
          <div className="flex justify-between items-center p-4 bg-white rounded-[20px] border border-black/[0.03] shadow-aura border-l-4 border-primary">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-primary/5 text-primary flex items-center justify-center">
                <Music size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-light text-sm text-va-black">
                  <VoiceglotText translationKey="checkout.summary.music_title" defaultText="Muzieklicentie" />
                </h4>
                <p className="text-[15px] tracking-widest text-va-black/40 font-light ">
                  {state.music.asBackground && state.music.asHoldMusic ? (
                    <VoiceglotText translationKey="checkout.summary.music_both" defaultText="Achtergrond + Wachtmuziek" />
                  ) : state.music.asBackground ? (
                    <VoiceglotText translationKey="checkout.summary.music_background" defaultText="Achtergrondmuziek (Mix)" />
                  ) : (
                    <VoiceglotText translationKey="checkout.summary.music_hold" defaultText="Wachtmuziek (Apart)" />
                  )}
                </p>
              </div>
            </div>
            <span className="font-light text-lg text-va-black">€59.00</span>
          </div>
        )}

        {isJohfrai && (
          <div className="p-6 bg-primary/5 border border-primary/10 rounded-[20px] space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck size={16} strokeWidth={1.5} />
              <span className="text-[15px] font-light tracking-widest ">
                <VoiceglotText translationKey="common.human_guarantee" defaultText="De Menselijke Garantie" />
              </span>
            </div>
            <p className="text-[15px] font-light text-va-black/60 leading-relaxed">
              {isSubscription ? 
                <VoiceglotText 
                  translationKey={`checkout.summary.guarantee.${state.plan}`} 
                  defaultText={`Inbegrepen in je ${state.plan} plan: ${state.plan === 'pro' ? '1× per kwartaal' : state.plan === 'studio' ? '1× per maand' : 'Upgrade mogelijk naar'} een menselijke fix door Johfrah zelf.`} 
                /> :
                <VoiceglotText 
                  translationKey="checkout.summary.guarantee.ai" 
                  defaultText="Start vandaag met Johfrai. Niet 100% tevreden? Upgrade later naar een menselijke opname door Johfrah zelf. We verrekenen je huidige betaling volledig." 
                />
              }
            </p>
          </div>
        )}

        {!hasContextData && cart?.items.map((item: any) => (
          <div key={item.key} className="flex justify-between items-center p-4 bg-white rounded-[20px] border border-black/[0.03] shadow-aura">
            <div>
              <h4 className="font-light text-sm text-va-black">{item.name}</h4>
              <p className="text-[15px] tracking-widest text-va-black/40 font-light ">
                {item.quantity}x • {item.meta?.style || 'Standaard'}
              </p>
            </div>
            <span className="font-light text-lg text-va-black">€{item.price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-6 border-t border-black/5">
        <div className="flex justify-between text-sm">
          <span className="text-va-black/40 font-light tracking-widest text-[15px]">
            <VoiceglotText translationKey="common.subtotal" defaultText="Subtotaal" />
          </span>
          <span className="font-light text-va-black">€{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-va-black/40 font-light tracking-widest text-[15px]">
            <VoiceglotText translationKey="common.vat" defaultText="BTW (21%)" />
          </span>
          <span className="font-light text-va-black">€{tax.toFixed(2)}</span>
        </div>
        <div className="pt-4 border-t border-black/5 flex justify-between items-center">
          <span className="text-sm font-light tracking-widest text-va-black ">
            <VoiceglotText translationKey="common.total" defaultText="Totaal" />
          </span>
          <motion.span 
            key={total}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-light text-primary"
          >
            €{total.toFixed(2)}
          </motion.span>
        </div>
      </div>
    </div>
  );
};
