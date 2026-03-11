"use client";

import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContainerInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';
import { calculateDeliveryDate } from '@/lib/utils/delivery-logic';

/**
 * DELIVERY BADGE INSTRUMENT (VOICES 2026)
 * 
 * Centraal beheerd instrument voor het tonen van de levertijd belofte.
 * Volgt de Bob-methode (UX Theater) en het Chris-Protocol (Data Integrity).
 */
export interface DeliveryBadgeInstrumentProps {
  actor?: any;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'minimal';
  showIcon?: boolean;
}

export const DeliveryBadgeInstrument = ({
  actor,
  className = '',
  size = 'md',
  variant = 'default',
  showIcon = true
}: DeliveryBadgeInstrumentProps) => {
  const deliveryInfo = useMemo(() => {
    if (!actor) return null;

    // Als de levertijd al berekend is (bijv. in een lijst)
    if (actor.delivery_date_min) {
      const date = new Date(actor.delivery_date_min);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const isToday = date.getTime() === today.getTime();
      const isTomorrow = date.getTime() === tomorrow.getTime();
      
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      
      let formattedShort = `${d}/${m}/${y}`;
      if (isToday) formattedShort = "VANDAAG";
      else if (isTomorrow) formattedShort = "MORGEN";

      return { 
        formattedShort, 
        isToday,
        isTomorrow
      };
    }

    // Anders berekenen we het on-the-fly
    return calculateDeliveryDate({ 
      delivery_days_min: actor.delivery_days_min || 1, 
      delivery_days_max: actor.delivery_days_max || 1, 
      cutoff_time: actor.cutoff_time || '18:00', 
      availability: actor.availability, 
      holidayFrom: actor.holiday_from, 
      holidayTill: actor.holiday_till, 
      delivery_config: actor.delivery_config 
    });
  }, [actor]);

  if (!deliveryInfo) return null;

  const isUrgent = deliveryInfo.isToday || deliveryInfo.formattedShort === 'VANDAAG';
  const isTomorrow = deliveryInfo.isTomorrow || deliveryInfo.formattedShort === 'MORGEN';

  return (
    <ContainerInstrument 
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1",
        isUrgent ? "bg-primary/10 text-primary" : "bg-va-black/5 text-va-black/40",
        size === 'sm' && "px-2 py-0.5 text-[10px]",
        size === 'lg' && "px-4 py-2 text-[15px]",
        className
      )}
    >
      {showIcon && <Clock size={size === 'sm' ? 10 : 12} className={cn(isUrgent && "animate-pulse")} />}
      <TextInstrument as="span" className="font-bold tracking-widest uppercase">
        {isUrgent ? (
          <VoiceglotText translationKey="common.delivery.today" defaultText="VANDAAG" />
        ) : isTomorrow ? (
          <VoiceglotText translationKey="common.delivery.tomorrow" defaultText="MORGEN" />
        ) : (
          deliveryInfo.formattedShort
        )}
      </TextInstrument>
    </ContainerInstrument>
  );
};
