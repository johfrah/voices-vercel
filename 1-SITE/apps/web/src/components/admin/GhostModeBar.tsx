"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Ghost, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

/**
 * GHOST MODE BAR (2026)
 * Een opvallende bar die verschijnt wanneer een admin een gebruiker impersonate.
 * Volgt de Bob-methode (UX) en Chris-Protocol (Veiligheid).
 */
export const GhostModeBar = () => {
  const { isGhostMode, user, stopImpersonation } = useAuth();

  if (!isGhostMode) return null;

  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-[9999] bg-va-black text-white py-3 px-6 shadow-2xl border-b-2 border-primary"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            <Ghost className="text-primary" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary">Ghost Mode Actief</span>
              <ShieldAlert size={12} className="text-primary" />
            </div>
            <p className="text-[14px] font-light text-white/70">
              Je bent nu ingelogd als <span className="text-white font-bold">{user?.email}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => stopImpersonation()}
          className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-[10px] text-[13px] font-bold transition-all shadow-lg hover:scale-105"
        >
          <LogOut size={16} />
          Terug naar Admin
        </button>
      </div>
    </motion.div>
  );
};
