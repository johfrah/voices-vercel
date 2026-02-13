"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { clsx } from 'clsx';
import React from 'react';

interface OrderHeaderProps {
  id: string;
  date: string;
  journey: string;
  status: string;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({ id, date, journey, status }) => {
  const isStudio = journey === 'studio';

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 ">
          <VoiceglotText translationKey="order.header.title" defaultText="Order #" />{id}
        </h1>
        <p className="text-slate-50 mt-1">
          {date}
        </p>
      </div>
      <div className="flex gap-3">
        <span className={clsx(
          "px-4 py-1.5 rounded-full text-[15px] font-semibold uppercase tracking-wider",
          isStudio ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
        )}>
          <VoiceglotText translationKey={`journey.${journey}`} defaultText={journey} />
        </span>
        <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-[15px] font-semibold tracking-wider">
          <VoiceglotText translationKey={`order.status.${status}`} defaultText={status} />
        </span>
      </div>
    </div>
  );
};
