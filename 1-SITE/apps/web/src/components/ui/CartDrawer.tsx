"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Loader2, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from '@/components/ui/LayoutInstruments';

interface CartItem {
  key: string;
  id: number;
  title: string;
  price: number;
  quantity: number;
  metadata?: any;
}

export const CartDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now, would fetch from WC API in production
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setTimeout(() => {
        setCart([
          { key: '1', id: 101, title: 'Vlaamse Voice-over (Commercial)', price: 450, quantity: 1 },
          { key: '2', id: 202, title: 'Achtergrondmuziek (Corporate)', price: 59, quantity: 1 }
        ]);
        setLoading(false);
      }, 500);
    }
  }, [isOpen]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const vat = subtotal * 0.21;
  const total = subtotal + vat;

  if (!isOpen) return null;

  return (
    <ContainerInstrument className="fixed inset-0 z-[200] overflow-hidden">
      <ContainerInstrument className="absolute inset-0 bg-va-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <ContainerInstrument className="absolute inset-y-0 right-0 max-w-full flex">
        <ContainerInstrument className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
          {/* Header */}
          <ContainerInstrument className="px-6 py-6 md:px-8 md:py-8 border-b border-black/5 flex items-center justify-between">
            <ContainerInstrument className="flex items-center gap-3 md:gap-4">
              <ContainerInstrument className="w-10 h-10 bg-va-black rounded-xl flex items-center justify-center text-white">
                <Image  
                  src="/assets/common/branding/icons/CART.svg" 
                  alt="Cart" 
                  width={20} 
                  height={20} 
                  className="brightness-0 invert"
                />
              </ContainerInstrument>
              <HeadingInstrument level={2} className="text-xl font-light tracking-tighter">
                <VoiceglotText  translationKey="common.your" defaultText="Jouw" /> <TextInstrument as="span" className="text-primary font-light"><VoiceglotText  translationKey="auto.cartdrawer.mandje.65a3a2" defaultText="Mandje" /></TextInstrument>
              </HeadingInstrument>
            </ContainerInstrument>
            <ButtonInstrument onClick={onClose} className="p-2 hover:bg-va-off-white rounded-full transition-all bg-transparent">
              <X strokeWidth={1.5} size={24} className="text-va-black/20" />
            </ButtonInstrument>
          </ContainerInstrument>

          {/* Body */}
          <ContainerInstrument className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
            {loading ? (
              <ContainerInstrument className="h-full flex flex-col items-center justify-center text-va-black/20 gap-4">
                <Loader2 strokeWidth={1.5} className="animate-spin" size={32} />
                <TextInstrument className="text-[15px] font-black tracking-widest"><VoiceglotText  translationKey="auto.cartdrawer.laden___.cb4395" defaultText="Laden..." /></TextInstrument>
              </ContainerInstrument>
            ) : cart.length > 0 ? (
              <ContainerInstrument className="space-y-4 md:space-y-6">
                {cart.map((item) => (
                  <ContainerInstrument key={item.key} className="flex gap-3 md:gap-4 p-3 md:p-4 bg-va-off-white rounded-[24px] group border border-transparent hover:border-black/5 transition-all">
                    <ContainerInstrument className="flex-1">
                      <HeadingInstrument level={4} className="text-[15px] font-light tracking-tight mb-1">{item.title}</HeadingInstrument>
                      <ContainerInstrument className="flex justify-between items-center">
                        <TextInstrument className="text-[15px] font-bold text-va-black/30 tracking-widest">
                          <VoiceglotText  translationKey="common.quantity" defaultText="Aantal" />: {item.quantity}
                        </TextInstrument>
                        <TextInstrument className="font-black text-va-black">€{item.price}</TextInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                    <ButtonInstrument className="self-start p-2 opacity-0 group-hover:opacity-100 text-va-black/20 hover:text-red-500 transition-all bg-transparent">
                      <Trash2 strokeWidth={1.5} size={16} />
                    </ButtonInstrument>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
            ) : (
              <ContainerInstrument className="h-full flex flex-col items-center justify-center text-va-black/20 gap-4">
                <Image  
                  src="/assets/common/branding/icons/CART.svg" 
                  alt="Empty Cart" 
                  width={48} 
                  height={48} 
                  className="opacity-10"
                  style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
                />
                <TextInstrument className="text-[15px] font-black tracking-widest"><VoiceglotText  translationKey="auto.cartdrawer.je_mandje_is_leeg.559931" defaultText="Je mandje is leeg" /></TextInstrument>
              </ContainerInstrument>
            )}
          </ContainerInstrument>

          {/* Footer */}
          {cart.length > 0 && (
            <ContainerInstrument className="px-6 py-6 md:px-8 md:py-8 bg-va-off-white border-t border-black/5 space-y-4 md:space-y-6">
              <ContainerInstrument className="space-y-2 md:space-y-3">
                <ContainerInstrument className="flex justify-between text-[15px] font-bold tracking-widest text-va-black/40">
                  <TextInstrument as="span"><VoiceglotText  translationKey="auto.cartdrawer.subtotaal.e48026" defaultText="Subtotaal" /></TextInstrument>
                  <TextInstrument as="span" className="text-va-black font-light">€{subtotal.toFixed(2)}</TextInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="flex justify-between text-[15px] font-bold tracking-widest text-va-black/40">
                  <TextInstrument as="span"><VoiceglotText  translationKey="common.vat_21" defaultText="BTW (21%)" /></TextInstrument>
                  <TextInstrument as="span" className="text-va-black font-light">€{vat.toFixed(2)}</TextInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="pt-3 md:pt-4 border-t border-black/5 flex justify-between items-center">
                  <TextInstrument className="text-[15px] font-black tracking-widest"><VoiceglotText  translationKey="auto.cartdrawer.totaal.e28895" defaultText="Totaal" /></TextInstrument>
                  <TextInstrument as="span" className="text-2xl md:text-3xl font-black text-primary tracking-tighter">€{total.toFixed(2)}</TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>

              <Link  
                href="/checkout" 
                onClick={onClose}
                className="va-btn-pro w-full flex items-center justify-center gap-3 group !bg-va-black py-4 md:py-5"
              >
                <VoiceglotText  translationKey="common.continue_to_checkout" defaultText="Doorgaan naar Kassa" /> 
                <Image  
                  src="/assets/common/branding/icons/FORWARD.svg" 
                  alt="Forward" 
                  width={18} 
                  height={18} 
                  className="brightness-0 invert group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </ContainerInstrument>
          )}
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
