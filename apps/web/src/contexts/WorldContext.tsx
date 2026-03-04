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
}

function isAbortLikeError(error: unknown): boolean {
  const e = error as { name?: string; message?: string } | null;
  const message = String(e?.message || '').toLowerCase();
  return e?.name === 'AbortError' || message.includes('aborted');
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

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    const fetchWorlds = async () => {
      try {
        const res = await fetch('/api/admin/config?type=worlds', { signal: controller.signal });
        const data = await res.json();
        if (!isActive || controller.signal.aborted) return;
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
        if (!isActive || controller.signal.aborted || isAbortLikeError(error)) return;
        console.error('Failed to fetch worlds for context:', error);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchWorlds();
    return () => {
      isActive = false;
      controller.abort();
    };
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
    <WorldContext.Provider value={{ activeWorld, allWorlds, setWorld, isLoading }}>
      {children}
    </WorldContext.Provider>
  );
};
