"use client";

import { useEffect } from 'react';
import { useVoicesState } from '@/contexts/VoicesStateContext';

interface JourneyStateUpdaterInstrumentProps {
  journey: 'telephony' | 'video' | 'commercial' | 'general';
}

export const JourneyStateUpdaterInstrument: React.FC<JourneyStateUpdaterInstrumentProps> = ({ journey }) => {
  const { updateJourney } = useVoicesState();

  useEffect(() => {
    updateJourney(journey);
  }, [journey, updateJourney]);

  return null;
};
