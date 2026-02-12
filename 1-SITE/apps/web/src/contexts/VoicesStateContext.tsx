"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface VoicesState {
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
}

interface VoicesStateContextType {
  state: VoicesState;
  updateCompanyName: (name: string) => void;
  updateSector: (sector: string | null) => void;
  updateJourney: (journey: VoicesState['current_journey']) => void;
  updateIntent: (intent: Partial<VoicesState['intent']>) => void;
  getPlaceholderValue: (key: string) => string;
}

const initialState: VoicesState = {
  company_name: '',
  opening_hours: '09:00 - 17:00',
  location: '',
  current_sector: null,
  current_journey: 'general',
  intent: {
    archetype: null,
    asset_focus: 'Hybrid',
    decision_power: null,
  },
};

const VoicesStateContext = createContext<VoicesStateContextType | undefined>(undefined);

export const VoicesStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<VoicesState>(initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('voices_state');
    if (saved) {
      try {
        setState(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {
        console.error('Failed to parse saved voices state', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('voices_state', JSON.stringify(state));
  }, [state]);

  const updateCompanyName = (company_name: string) => setState(prev => ({ ...prev, company_name }));
  
  const updateSector = (current_sector: string | null) => setState(prev => ({ ...prev, current_sector }));
  
  const updateJourney = (current_journey: VoicesState['current_journey']) => setState(prev => ({ ...prev, current_journey }));

  const updateIntent = (intent: Partial<VoicesState['intent']>) => 
    setState(prev => ({ ...prev, intent: { ...prev.intent, ...intent } }));

  const getPlaceholderValue = (key: string): string => {
    switch (key) {
      case 'company_name': return state.company_name || 'Uw Bedrijf';
      case 'opening_hours': return state.opening_hours;
      case 'location': return state.location || 'Uw Stad';
      default: return `{{${key}}}`;
    }
  };

  return (
    <VoicesStateContext.Provider value={{ 
      state, 
      updateCompanyName, 
      updateSector, 
      updateJourney,
      updateIntent,
      getPlaceholderValue
    }}>
      {children}
    </VoicesStateContext.Provider>
  );
};

export const useVoicesState = () => {
  const context = useContext(VoicesStateContext);
  if (context === undefined) {
    throw new Error('useVoicesState must be used within a VoicesStateProvider');
  }
  return context;
};
