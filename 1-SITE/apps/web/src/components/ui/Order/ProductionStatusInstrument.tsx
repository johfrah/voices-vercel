"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { cn } from '@/lib/utils';
import { Clock, Mic } from 'lucide-react';
import React from 'react';
import { BentoCard } from '../BentoGrid';
import { 
  ContainerInstrument, 
  TextInstrument 
} from '@/components/ui/LayoutInstruments';

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
      icon={<Mic className="w-5 h-5" strokeWidth={1.5} />}
      className="col-span-3"
    >
      <ContainerInstrument className="space-y-4 mt-4">
        {items.map((item) => (
          <ContainerInstrument key={item.id} className="flex items-center justify-between p-4 bg-va-off-white rounded-[20px] border border-va-black/5">
            <ContainerInstrument className="flex items-center gap-4">
              <ContainerInstrument className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mic className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </ContainerInstrument>
              <ContainerInstrument>
                <TextInstrument className="font-medium text-va-black">{item.name}</TextInstrument>
                <TextInstrument className="text-[13px] text-va-black/40 tracking-widest font-light">
                  {item.meta_data?.usage || <VoiceglotText translationKey="order.item.no_usage" defaultText="No usage defined" />}
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-6">
              <ContainerInstrument className="text-right">
                <TextInstrument className="text-[12px] text-va-black/20 font-bold tracking-widest ">
                  <VoiceglotText translationKey="order.item.deadline" defaultText="Deadline" />
                </TextInstrument>
                <TextInstrument className="font-light text-[15px] flex items-center gap-1">
                  <Clock className="w-3 h-3" strokeWidth={1.5} /> 24h
                </TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className={cn(
                "px-3 py-1 rounded-full text-[12px] font-light uppercase tracking-widest",
                item.delivery_status === 'approved' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
              )}>
                <VoiceglotText translationKey={`order.delivery_status.${item.delivery_status}`} defaultText={item.delivery_status} />
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        ))}
      </ContainerInstrument>
    </BentoCard>
  );
};
