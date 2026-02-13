"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useCheckout } from '@/contexts/CheckoutContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { 
  ContainerInstrument, 
  TextInstrument,
  HeadingInstrument
} from '@/components/ui/LayoutInstruments';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const hasContextData = state.selectedActor || state.briefing || isSubscription;
  
  if (loading && !hasContextData) {
    return (
      <ContainerInstrument className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={24} strokeWidth={1.5} />
      </ContainerInstrument>
    );
  }

  const subtotal = state.pricing.total;
  const tax = subtotal * 0.21;
  const total = subtotal + tax;

  return (
    <ContainerInstrument className="space-y-6">
      <ContainerInstrument className="space-y-4">
        {isSubscription && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-between items-center p-6 bg-va-black text-white rounded-[20px] shadow-aura-lg border-b-4 border-primary relative overflow-hidden group"
          >
            <ContainerInstrument className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <ContainerInstrument className="flex items-center gap-4 relative z-10">
              <ContainerInstrument className="w-12 h-12 rounded-[10px] bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Image  src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} className="animate-pulse" />
              </ContainerInstrument>
              <ContainerInstrument>
                <HeadingInstrument level={4} className="font-light text-lg tracking-tight text-white">
                  Johfrai {state.plan}
                </HeadingInstrument>
                <TextInstrument className="text-[15px] tracking-widest text-white/40 font-light ">
                  <VoiceglotText  translationKey="checkout.summary.subscription_desc" defaultText="Jaarabonnement • Direct Actief" />
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="text-right relative z-10">
              <motion.span 
                key={state.pricing.total}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="block font-light text-2xl text-primary"
              >
                €{state.pricing.total.toFixed(2)}
              </motion.span>
              <TextInstrument className="text-[15px] tracking-widest text-white/20 font-light ">
                <VoiceglotText  translationKey="common.per_month" defaultText="per maand" />
              </TextInstrument>
            </ContainerInstrument>
          </motion.div>
        )}

        {state.selectedActor && !isSubscription && (
          <ContainerInstrument className="flex justify-between items-center p-4 bg-white rounded-[20px] border border-va-black/5 shadow-aura">
            <ContainerInstrument className="flex items-center gap-3">
              <ContainerInstrument className="w-10 h-10 rounded-[20px] overflow-hidden bg-va-off-white relative border border-va-black/5">
                <Image  
                  src={state.selectedActor.photo_url || '/mic-placeholder.png'} 
                  alt={state.selectedActor.display_name || 'Stemacteur'} 
                  fill 
                  className="object-cover" 
                />
              </ContainerInstrument>
              <ContainerInstrument>
                <HeadingInstrument level={4} className="font-light text-[15px] text-va-black">
                  <VoiceglotText  translationKey={`actor.${state.selectedActor.id}.name`} defaultText={state.selectedActor.display_name} noTranslate={true} />
                </HeadingInstrument>
                <TextInstrument className="text-[15px] tracking-widest text-va-black/40 font-light ">
                  <VoiceglotText  translationKey="common.voice_actor" defaultText="Stemacteur" />
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <TextInstrument className="font-light text-lg text-va-black">€{state.pricing.base.toFixed(2)}</TextInstrument>
          </ContainerInstrument>
        )}

        {state.briefing && !isSubscription && (
          <ContainerInstrument className="flex justify-between items-center p-4 bg-white rounded-[20px] border border-va-black/5 shadow-aura">
            <ContainerInstrument className="flex items-center gap-3">
              <ContainerInstrument className="w-10 h-10 rounded-[10px] bg-primary/5 text-primary flex items-center justify-center">
                <Image  src="/assets/common/branding/icons/INFO.svg" width={20} height={20} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
              </ContainerInstrument>
              <ContainerInstrument>
                <HeadingInstrument level={4} className="font-light text-[15px] text-va-black">
                  <VoiceglotText  translationKey="checkout.summary.script_title" defaultText="Script & Briefing" />
                </HeadingInstrument>
                <TextInstrument className="text-[15px] tracking-widest text-va-black/40 font-light ">
                  {state.usage === 'telefonie' ? (
                    <VoiceglotText  translationKey="checkout.summary.prompts_count" defaultText={`${state.prompts} prompts gedetecteerd`} />
                  ) : (
                    <VoiceglotText  translationKey="checkout.summary.words_count" defaultText={`${state.briefing.trim().split(/\s+/).filter(Boolean).length} woorden`} />
                  )}
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <TextInstrument className="font-light text-lg text-va-black">€{state.pricing.wordSurcharge.toFixed(2)}</TextInstrument>
          </ContainerInstrument>
        )}

        {(state.music.asBackground || state.music.asHoldMusic) && (
          <ContainerInstrument className="flex justify-between items-center p-4 bg-white rounded-[20px] border border-va-black/5 shadow-aura border-l-4 border-primary">
            <ContainerInstrument className="flex items-center gap-3">
              <ContainerInstrument className="w-10 h-10 rounded-[10px] bg-primary/5 text-primary flex items-center justify-center">
                <Image  src="/assets/common/branding/icons/INFO.svg" width={20} height={20} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
              </ContainerInstrument>
              <ContainerInstrument>
                <HeadingInstrument level={4} className="font-light text-[15px] text-va-black">
                  <VoiceglotText  translationKey="checkout.summary.music_title" defaultText="Muzieklicentie" />
                </HeadingInstrument>
                <TextInstrument className="text-[15px] tracking-widest text-va-black/40 font-light ">
                  {state.music.asBackground && state.music.asHoldMusic ? (
                    <VoiceglotText  translationKey="checkout.summary.music_both" defaultText="Achtergrond + Wachtmuziek" />
                  ) : state.music.asBackground ? (
                    <VoiceglotText  translationKey="checkout.summary.music_background" defaultText="Achtergrondmuziek (Mix)" />
                  ) : (
                    <VoiceglotText  translationKey="checkout.summary.music_hold" defaultText="Wachtmuziek (Apart)" />
                  )}
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <TextInstrument className="font-light text-lg text-va-black">€59.00</TextInstrument>
          </ContainerInstrument>
        )}

        {isJohfrai && (
          <ContainerInstrument className="p-6 bg-primary/5 border border-primary/10 rounded-[20px] space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
            <ContainerInstrument className="flex items-center gap-2 text-primary">
              <Image  src="/assets/common/branding/icons/INFO.svg" width={16} height={16} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
              <TextInstrument className="text-[15px] font-light tracking-widest ">
                <VoiceglotText  translationKey="common.human_guarantee" defaultText="De menselijke garantie" />
              </TextInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-[15px] font-light text-va-black/60 leading-relaxed">
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
            </TextInstrument>
          </ContainerInstrument>
        )}

        {!hasContextData && cart?.items.map((item: any) => (
          <ContainerInstrument key={item.key} className="flex justify-between items-center p-4 bg-white rounded-[20px] border border-va-black/5 shadow-aura">
            <ContainerInstrument>
              <HeadingInstrument level={4} className="font-light text-[15px] text-va-black">{item.name}</HeadingInstrument>
              <TextInstrument className="text-[15px] tracking-widest text-va-black/40 font-light ">
                {item.quantity}x • {item.meta?.style || 'Standaard'}
              </TextInstrument>
            </ContainerInstrument>
            <TextInstrument className="font-light text-lg text-va-black">€{item.price.toFixed(2)}</TextInstrument>
          </ContainerInstrument>
        ))}
      </ContainerInstrument>

      <ContainerInstrument className="space-y-3 pt-6 border-t border-va-black/5">
        <ContainerInstrument className="flex justify-between text-[15px]">
          <TextInstrument className="text-va-black/40 font-light tracking-widest text-[15px] ">
            <VoiceglotText  translationKey="common.subtotal" defaultText="Subtotaal" />
          </TextInstrument>
          <TextInstrument className="font-light text-va-black">€{subtotal.toFixed(2)}</TextInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="flex justify-between text-[15px]">
          <TextInstrument className="text-va-black/40 font-light tracking-widest text-[15px] ">
            <VoiceglotText  translationKey="common.vat" defaultText="BTW (21%)" />
          </TextInstrument>
          <TextInstrument className="font-light text-va-black">€{tax.toFixed(2)}</TextInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="pt-4 border-t border-va-black/5 flex justify-between items-center">
          <TextInstrument className="text-[15px] font-light tracking-widest text-va-black ">
            <VoiceglotText  translationKey="common.total" defaultText="Totaal" />
          </TextInstrument>
          <motion.span 
            key={total}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-light text-primary"
          >
            €{total.toFixed(2)}
          </motion.span>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
