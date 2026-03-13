"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * 🌳 WORLD CONTEXT (2026)
 * 
 * Doel: Het beheren van de actieve World binnen de Admin omgeving.
 * Dit is de "God View" selector die bepaalt welke data de dashboards laten zien.
 */

interface World {
  id: number;
  code: string;
  label: string;
  description?: string;
}

interface WorldContextType {
  activeWorld: World | null;
  allWorlds: World[];
  setWorld: (worldCode: string) => void;
  isLoading: boolean;
  /** 🛡️ CHRIS-PROTOCOL: World-Aware ID (v3.0.0) */
  currentWorldId: number;
}

const WorldContext = createContext<WorldContextType | undefined>(undefined);

export const useWorld = () => {
  const context = useContext(WorldContext);
  if (context === undefined) {
    throw new Error('useWorld must be used within a WorldProvider');
  }
  return context;
};

export const WorldProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWorld, setActiveWorld] = useState<World | null>(null);
  const [allWorlds, setAllWorlds] = useState<World[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWorldId, setCurrentWorldId] = useState<number>(1); // Default to Agency

  useEffect(() => {
    // 🛡️ CHRIS-PROTOCOL: Sync currentWorldId from handshake or URL
    if (typeof window !== 'undefined') {
      const g = window as any;
      if (g.handshakeContext?.worldId) {
        setCurrentWorldId(g.handshakeContext.worldId);
      } else {
        const { MarketManagerServer } = require('@/lib/system/core/market-manager');
        const context = MarketManagerServer.resolveContext(window.location.host, window.location.pathname);
        setCurrentWorldId(context.worldId);
      }
    }

    const fetchWorlds = async () => {
      try {
        const res = await fetch('/api/admin/config?type=worlds');
        const data = await res.json();
        if (data.results) {
          setAllWorlds(data.results);
          
          // Check localStorage for saved world
          const savedWorldCode = localStorage.getItem('admin_active_world');
          if (savedWorldCode) {
            const saved = data.results.find((w: World) => w.code === savedWorldCode);
            if (saved) setActiveWorld(saved);
          }
        }
      } catch (error) {
        console.error('Failed to fetch worlds for context:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorlds();
  }, []);

  const setWorld = (worldCode: string) => {
    if (worldCode === 'all') {
      setActiveWorld(null);
      localStorage.removeItem('admin_active_world');
      return;
    }
    
    const world = allWorlds.find(w => w.code === worldCode);
    if (world) {
      setActiveWorld(world);
      localStorage.setItem('admin_active_world', worldCode);
    }
  };

  return (
    <WorldContext.Provider value={{ activeWorld, allWorlds, setWorld, isLoading, currentWorldId }}>
      {children}
    </WorldContext.Provider>
  );
};
