"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { clsx } from 'clsx';
import { Clock, Mic } from 'lucide-react';
import React from 'react';
import { BentoCard } from '../BentoGrid';

interface OrderItem {
  id: number;
  name: string;
  delivery_status: string;
  meta_data: any;
}

interface ProductionStatusInstrumentProps {
  items: OrderItem[];
}

export const ProductionStatusInstrument: React.FC<ProductionStatusInstrumentProps> = ({ items }) => {
  return (
    <BentoCard 
      title={<VoiceglotText translationKey="order.production.title" defaultText="Productie Status" />}
      icon={<Mic className="w-5 h-5" />}
      className="col-span-3"
    >
      <div className="space-y-4 mt-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Mic className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-bold">{item.name}</div>
                <div className="text-[15px] text-slate-500 tracking-wider font-bold">
                  {item.meta_data?.usage || <VoiceglotText translationKey="order.item.no_usage" defaultText="No usage defined" />}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[15px] text-slate-400 font-bold tracking-tighter">
                  <VoiceglotText translationKey="order.item.deadline" defaultText="Deadline" />
                </div>
                <div className="font-medium text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 24h
                </div>
              </div>
              <div className={clsx(
                "px-3 py-1 rounded-lg text-[15px] font-bold uppercase",
                item.delivery_status === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              )}>
                <VoiceglotText translationKey={`order.delivery_status.${item.delivery_status}`} defaultText={item.delivery_status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
};
