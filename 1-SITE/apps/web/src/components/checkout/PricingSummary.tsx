"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { FileText, Loader2, Music, ShieldCheck, Zap } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
            className="flex justify-between items-center p-6 bg-va-black text-white rounded-[32px] shadow-xl border-b-4 border-primary relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Zap size={24} fill="currentColor" className="animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-lg uppercase tracking-tight">Johfrai {state.plan.toUpperCase()}</h4>
                <p className="text-[10px] uppercase tracking-widest text-white/40">
                  <VoiceglotText translationKey="checkout.summary.subscription_desc" defaultText="Jaarabonnement • Direct Actief" />
                </p>
              </div>
            </div>
            <div className="text-right relative z-10">
              <motion.span 
                key={state.pricing.total}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="block font-black text-2xl text-primary"
              >
                €{state.pricing.total.toFixed(2)}
              </motion.span>
              <span className="text-[8px] uppercase tracking-widest text-white/20">
                <VoiceglotText translationKey="common.per_month" defaultText="per maand" />
              </span>
            </div>
          </motion.div>
        )}

        {state.selectedActor && !isSubscription && (
          <div className="flex justify-between items-center p-4 bg-va-off-white rounded-[20px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 relative">
                <Image src={state.selectedActor.photo_url || '/mic-placeholder.png'} alt="" fill className="object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  <VoiceglotText translationKey={`actor.${state.selectedActor.id}.name`} defaultText={state.selectedActor.display_name} noTranslate={true} />
                </h4>
                <p className="text-[10px] uppercase tracking-wider text-va-black/40">
                  <VoiceglotText translationKey="common.voice_actor" defaultText="Stemacteur" />
                </p>
              </div>
            </div>
            <span className="font-black text-lg">€{state.pricing.base.toFixed(2)}</span>
          </div>
        )}

        {state.briefing && !isSubscription && (
          <div className="flex justify-between items-center p-4 bg-va-off-white rounded-[20px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  <VoiceglotText translationKey="checkout.summary.script_title" defaultText="Script & Briefing" />
                </h4>
                <p className="text-[10px] uppercase tracking-wider text-va-black/40">
                  {state.usage === 'telefonie' ? (
                    <VoiceglotText translationKey="checkout.summary.prompts_count" defaultText={`${state.prompts} prompts gedetecteerd`} />
                  ) : (
                    <VoiceglotText translationKey="checkout.summary.words_count" defaultText={`${state.briefing.trim().split(/\s+/).filter(Boolean).length} woorden`} />
                  )}
                </p>
              </div>
            </div>
            <span className="font-black text-lg">€{state.pricing.wordSurcharge.toFixed(2)}</span>
          </div>
        )}

        {(state.music.asBackground || state.music.asHoldMusic) && (
          <div className="flex justify-between items-center p-4 bg-va-off-white rounded-[20px] border-l-4 border-primary">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Music size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  <VoiceglotText translationKey="checkout.summary.music_title" defaultText="Muzieklicentie" />
                </h4>
                <p className="text-[10px] uppercase tracking-wider text-va-black/40">
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
            <span className="font-black text-lg">€59.00</span>
          </div>
        )}

        {isJohfrai && (
          <div className="p-6 bg-primary/5 border border-primary/10 rounded-[24px] space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                <VoiceglotText translationKey="common.human_guarantee" defaultText="De Menselijke Garantie" />
              </span>
            </div>
            <p className="text-[11px] font-medium text-va-black/60 leading-relaxed">
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
          <div key={item.key} className="flex justify-between items-center p-4 bg-va-off-white rounded-[20px]">
            <div>
              <h4 className="font-bold text-sm text-va-black">{item.name}</h4>
              <p className="text-[10px] uppercase tracking-wider text-va-black/60 font-bold">
                {item.quantity}x • {item.meta?.style || 'Standaard'}
              </p>
            </div>
            <span className="font-black text-lg text-va-black">€{item.price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-6 border-t border-black/5">
        <div className="flex justify-between text-sm">
          <span className="text-va-black/80 font-bold">
            <VoiceglotText translationKey="common.subtotal" defaultText="Subtotaal" />
          </span>
          <span className="font-black text-va-black">€{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-va-black/80 font-bold">
            <VoiceglotText translationKey="common.vat" defaultText="BTW (21%)" />
          </span>
          <span className="font-black text-va-black">€{tax.toFixed(2)}</span>
        </div>
        <div className="pt-4 border-t-2 border-primary/40 flex justify-between items-center">
          <span className="text-sm font-black uppercase tracking-widest text-va-black">
            <VoiceglotText translationKey="common.total" defaultText="Totaal" />
          </span>
          <motion.span 
            key={total}
            initial={{ scale: 1.1, color: '#e31c5f' }}
            animate={{ scale: 1, color: '#e31c5f' }}
            className="text-2xl font-black"
          >
            €{total.toFixed(2)}
          </motion.span>
        </div>
      </div>
    </div>
  );
};

