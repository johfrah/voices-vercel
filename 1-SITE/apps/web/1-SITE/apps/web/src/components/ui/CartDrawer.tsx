"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useCheckout } from '@/contexts/CheckoutContext';
import { SlimmeKassa } from '@/lib/pricing-engine';
import { Loader2, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { VoicesLink as Link } from '@/components/ui/VoicesLink';
import React, { useEffect, useState } from 'react';

export const CartDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { state, subtotal, removeItem, isVatExempt } = useCheckout();
  const [loading, setLoading] = useState(false);

  // CHRIS-PROTOCOL: 100ms Feedback - we don't need mock loading if we have local state
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const vatRate = isVatExempt ? 0 : 0.21;
  const vat = subtotal * vatRate;
  const total = subtotal + vat;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] overflow-hidden">
      <div className="absolute inset-0 bg-va-black/95 backdrop-blur-sm transition-opacity z-[10001]" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex z-[10002]">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="px-8 py-8 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-va-black rounded-xl flex items-center justify-center text-white">
                <Image  
                  src="/assets/common/branding/icons/CART.svg" 
                  alt={t('common.cart', "Cart")} 
                  width={20} 
                  height={20} 
                  className="brightness-0 invert"
                />
              </div>
      <h2 className="text-xl font-light tracking-tighter">
                <VoiceglotText translationKey="nav.cart.your" defaultText="Jouw" /> <span className="text-primary"><VoiceglotText  translationKey="auto.cartdrawer.mandje.65a3a2" defaultText="Mandje" /></span>
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-va-off-white rounded-full transition-all">
              <X strokeWidth={1.5} size={24} className="text-va-black/20" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-va-black/20 gap-4">
                <Loader2 strokeWidth={1.5} className="animate-spin" size={32} />
                <span className="text-[15px] font-black tracking-widest"><VoiceglotText  translationKey="auto.cartdrawer.laden___.cb4395" defaultText="Laden..." /></span>
              </div>
            ) : state.items.length > 0 ? (
              <div className="space-y-6">
                {state.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-va-off-white rounded-[24px] group border border-transparent hover:border-black/5 transition-all">
                    <div className="flex-1">
                      <h4 className="text-[15px] font-light tracking-tight mb-1">
                        {item.type === 'voice_over' ? `${item.actor?.name} (${item.usage})` : item.title}
                      </h4>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-va-black/30 tracking-widest uppercase">
                          {item.type === 'voice_over' ? `${item.pricing?.words || 0} ${t('common.words', 'woorden')}` : `1 ${t('common.item', 'item')}`}
                        </span>
                        <span className="font-black text-va-black">{SlimmeKassa.format(item.pricing?.total ?? item.pricing?.subtotal ?? 0)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="self-start p-2 opacity-0 group-hover:opacity-100 text-va-black/20 hover:text-red-500 transition-all"
                    >
                      <Trash2 strokeWidth={1.5} size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-va-black/20 gap-4">
                <Image  
                  src="/assets/common/branding/icons/CART.svg" 
                  alt={t('nav.cart_empty_alt', "Empty Cart")} 
                  width={48} 
                  height={48} 
                  className="opacity-10"
                  style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
                />
                <span className="text-[15px] font-black tracking-widest"><VoiceglotText  translationKey="auto.cartdrawer.je_mandje_is_leeg.559931" defaultText="Je mandje is leeg" /></span>
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="px-8 py-8 bg-va-off-white border-t border-black/5 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[15px] font-bold tracking-widest text-va-black/40">
                  <span><VoiceglotText  translationKey="auto.cartdrawer.subtotaal.e48026" defaultText="Subtotaal" /></span>
                  <span className="text-va-black">{SlimmeKassa.format(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[15px] font-bold tracking-widest text-va-black/40">
                  <span><VoiceglotText translationKey="common.vat" defaultText="BTW" /> {isVatExempt ? `(${t('common.exempt', 'vrijgesteld')})` : '(21%)'}</span>
                  <span className="text-va-black">{SlimmeKassa.format(vat)}</span>
                </div>
                <div className="pt-4 border-t border-black/5 flex justify-between items-center">
                  <span className="text-[15px] font-black tracking-widest"><VoiceglotText  translationKey="auto.cartdrawer.totaal.e28895" defaultText="Totaal" /></span>
                  <span className="text-3xl font-black text-primary tracking-tighter">{SlimmeKassa.format(total)}</span>
                </div>
              </div>

              <Link  
                href="/checkout" 
                onClick={onClose}
                className="va-btn-pro w-full flex items-center justify-center gap-3 group !bg-va-black"
              >
                <VoiceglotText translationKey="nav.cart.checkout" defaultText="Doorgaan naar Kassa" /> 
                <Image  
                  src="/assets/common/branding/icons/FORWARD.svg" 
                  alt={t('common.forward', "Forward")} 
                  width={18} 
                  height={18} 
                  className="brightness-0 invert group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};