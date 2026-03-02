"use client";

import { useEffect } from 'react';
import { useVoicesState } from '@/contexts/VoicesStateContext';

interface JourneyStateUpdaterProps {
  journey: 'telephony' | 'video' | 'commercial' | 'general';
}

export const JourneyStateUpdater: React.FC<JourneyStateUpdaterProps> = ({ journey }) => {
  const { updateJourney } = useVoicesState();

  useEffect(() => {
    updateJourney(journey);
  }, [journey, updateJourney]);

  return null;
};
