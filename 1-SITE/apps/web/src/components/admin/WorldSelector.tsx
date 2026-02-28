"use client";

import React from 'react';
import { useWorld } from '@/contexts/WorldContext';
import { ContainerInstrument } from '@/components/ui/LayoutInstruments';
import { Globe, ChevronDown, Check } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

/**
 * 🌍 WORLD SELECTOR (2026)
 * 
 * De "God View" dropdown voor de AdminHeader.
 * Hiermee switch je de volledige admin-context naar een specifieke World.
 */

export const WorldSelector = () => {
  const { activeWorld, allWorlds, setWorld, isLoading } = useWorld();

  if (isLoading) return <div className="w-32 h-8 bg-va-black/5 animate-pulse rounded-full" />;

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-3 px-4 py-2 bg-va-black/5 hover:bg-va-black/10 rounded-full transition-all group border border-black/[0.03]">
          <Globe size={14} className={cn("text-va-black/40 group-hover:text-primary transition-colors", activeWorld && "text-primary")} />
          <span className="text-[11px] font-bold tracking-widest uppercase text-va-black/60">
            {activeWorld ? activeWorld.label : 'Global View'}
          </span>
          <ChevronDown size={12} className="text-va-black/20 group-hover:text-va-black transition-colors" />
        </button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-va-black/20 backdrop-blur-sm z-[200] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-20 right-8 w-72 bg-white rounded-[24px] shadow-aura border border-black/[0.05] z-[201] p-2 animate-in slide-in-from-top-4 duration-300">
          <div className="p-4 border-b border-black/[0.03] mb-2">
            <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-va-black/30">Select World Context</h3>
          </div>
          
          <div className="space-y-1">
            <button 
              onClick={() => setWorld('all')}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-medium transition-all hover:bg-va-off-white",
                !activeWorld ? "text-primary bg-primary/5" : "text-va-black/60"
              )}
            >
              <span>Global View (All Data)</span>
              {!activeWorld && <Check size={14} />}
            </button>
            
            {allWorlds.map((world) => (
              <button 
                key={world.id}
                onClick={() => setWorld(world.code)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-medium transition-all hover:bg-va-off-white",
                  activeWorld?.id === world.id ? "text-primary bg-primary/5" : "text-va-black/60"
                )}
              >
                <span>{world.label}</span>
                {activeWorld?.id === world.id && <Check size={14} />}
              </button>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-va-off-white rounded-[16px] text-[11px] text-va-black/40 leading-relaxed italic">
            "Switching worlds updates all dashboard data and logs to the selected unit."
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
