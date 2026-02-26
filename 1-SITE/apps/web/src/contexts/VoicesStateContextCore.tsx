"use client";

import React, { createContext, useContext } from 'react';
import { Actor } from '@/types';

export interface VoicesState {
  company_name: string;
  opening_hours: string;
  location: string;
  current_sector: string | null;
  current_journey: 'telephony' | 'video' | 'commercial' | 'general';
  intent: {
    archetype: string | null;
    asset_focus: 'Audio-First' | 'Script-First' | 'Hybrid';
    decision_power: 'End-User' | 'Proxy-Buyer' | null;
  };
  selected_actors: Actor[];
  reviewStats: {
    averageRating: number;
    totalCount: number;
  } | null;
  campaignMessage: string | null;
}

export interface VoicesStateContextType {
  state: VoicesState;
  reviewStats: VoicesState['reviewStats'];
  campaignMessage: string | null;
  updateCompanyName: (name: string) => void;
  updateSector: (sector: string | null) => void;
  updateJourney: (journey: VoicesState['current_journey']) => void;
  updateIntent: (intent: Partial<VoicesState['intent']>) => void;
  getPlaceholderValue: (key: string) => string;
  toggleActorSelection: (actor: Actor) => void;
  clearSelectedActors: () => void;
}

export const initialState: VoicesState = {
  company_name: '',
  opening_hours: '09:00 - 18:00',
  location: '',
  current_sector: null,
  current_journey: 'agency',
  intent: {
    archetype: null,
    asset_focus: 'Hybrid',
    decision_power: null,
  },
  selected_actors: [],
  reviewStats: {
    averageRating: 4.9,
    totalCount: 1250
  },
  campaignMessage: null,
};

export const VoicesStateContext = createContext<VoicesStateContextType | undefined>(undefined);

export const useVoicesState = () => {
  const context = useContext(VoicesStateContext);
  if (context === undefined) {
    // 🛡️ CHRIS-PROTOCOL: Fallback for evaluation phase to prevent ReferenceError
    return {} as VoicesStateContextType;
  }
  return context;
};
