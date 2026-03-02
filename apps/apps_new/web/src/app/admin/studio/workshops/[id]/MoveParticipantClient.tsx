"use client";

import { useState } from "react";
import { MoveHorizontal, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MoveParticipantClient({ 
  orderItemId, 
  currentEditionId, 
  availableEditions 
}: { 
  orderItemId: number; 
  currentEditionId: number;
  availableEditions: any[];
}) {
  const [isMoving, setIsMoving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleMove = async (newEditionId: number) => {
    if (newEditionId === currentEditionId) return;
    
    setIsMoving(true);
    try {
      const res = await fetch('/api/admin/studio/move-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderItemId, editionId: newEditionId })
      });
      
      if (res.ok) {
        setShowDropdown(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Move failed", err);
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 rounded-lg hover:bg-black/5 text-black/20 hover:text-primary transition-all"
        title="Verplaats deelnemer"
      >
        {isMoving ? <Loader2 size={14} className="animate-spin" /> : <MoveHorizontal size={14} />}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white border border-black/10 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in duration-200 origin-top-right">
            <div className="text-[11px] font-black tracking-widest text-black/20 uppercase p-2 mb-1 border-b border-black/5">Verplaats naar...</div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {availableEditions.filter(e => e.id !== currentEditionId).map(e => (
                <button
                  key={e.id}
                  onClick={() => handleMove(e.id)}
                  className="w-full text-left p-3 hover:bg-va-off-white rounded-lg text-[13px] transition-colors flex justify-between items-center group"
                >
                  <div className="flex flex-col">
                    <span className="font-bold">{e.workshop?.title}</span>
                    <span className="text-black/40 text-[11px]">{new Date(e.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <Check size={12} className="opacity-0 group-hover:opacity-100 text-primary" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
