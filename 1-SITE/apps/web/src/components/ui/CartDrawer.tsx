"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

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
    <div className="fixed inset-0 z-[200] overflow-hidden">
      <div className="absolute inset-0 bg-va-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="px-8 py-8 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-va-black rounded-xl flex items-center justify-center text-white">
                <ShoppingBag size={20} />
              </div>
              <h2 className="text-xl font-black tracking-tighter">Jouw <span className="text-primary">Mandje</span></h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-va-off-white rounded-full transition-all">
              <X size={24} className="text-va-black/20" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-va-black/20 gap-4">
                <Loader2 className="animate-spin" size={32} />
                <span className="text-[15px] font-black tracking-widest">Laden...</span>
              </div>
            ) : cart.length > 0 ? (
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.key} className="flex gap-4 p-4 bg-va-off-white rounded-[24px] group border border-transparent hover:border-black/5 transition-all">
                    <div className="flex-1">
                      <h4 className="text-sm font-black tracking-tight mb-1">{item.title}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-[15px] font-bold text-va-black/30 tracking-widest">Aantal: {item.quantity}</span>
                        <span className="font-black text-va-black">€{item.price}</span>
                      </div>
                    </div>
                    <button className="self-start p-2 opacity-0 group-hover:opacity-100 text-va-black/20 hover:text-red-500 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-va-black/20 gap-4">
                <ShoppingBag size={48} />
                <span className="text-[15px] font-black tracking-widest">Je mandje is leeg</span>
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="px-8 py-8 bg-va-off-white border-t border-black/5 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[15px] font-bold tracking-widest text-va-black/40">
                  <span>Subtotaal</span>
                  <span className="text-va-black">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[15px] font-bold tracking-widest text-va-black/40">
                  <span>BTW (21%)</span>
                  <span className="text-va-black">€{vat.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-black/5 flex justify-between items-center">
                  <span className="text-sm font-black tracking-widest">Totaal</span>
                  <span className="text-3xl font-black text-primary tracking-tighter">€{total.toFixed(2)}</span>
                </div>
              </div>

              <Link 
                href="/checkout" 
                onClick={onClose}
                className="va-btn-pro w-full flex items-center justify-center gap-3 group !bg-va-black"
              >
                Doorgaan naar Kassa <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
