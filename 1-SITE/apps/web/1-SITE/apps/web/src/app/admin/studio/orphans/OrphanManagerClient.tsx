"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    Calendar, 
    ArrowRight, 
    Loader2, 
    Search, 
    User, 
    Mail, 
    Tag,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TextInstrument } from "@/components/ui/LayoutInstruments";

export default function OrphanManagerClient({ initialOrphans, editions }: { initialOrphans: any[], editions: any[] }) {
  const [orphans, setOrphans] = useState(initialOrphans);
  const [search, setSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [selectedEdition, setSelectedEdition] = useState<Record<number, number>>({});
  const router = useRouter();

  const filteredOrphans = orphans.filter(o => 
    (o.user?.first_name?.toLowerCase().includes(search.toLowerCase())) ||
    (o.user?.last_name?.toLowerCase().includes(search.toLowerCase())) ||
    (o.user?.email?.toLowerCase().includes(search.toLowerCase())) ||
    (o.order?.wpOrderId?.toString().includes(search))
  );

  const handleMove = async (orderItemId: number) => {
    const editionId = selectedEdition[orderItemId];
    if (!editionId) return;

    setIsProcessing(orderItemId);
    try {
      const res = await fetch('/api/admin/studio/move-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderItemId, editionId })
      });

      if (!res.ok) throw new Error("Fout bij verplaatsen");
      
      // Verwijder uit de lokale lijst
      setOrphans(orphans.filter(o => o.id !== orderItemId));
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Er ging iets mis bij het verplaatsen.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
        <input 
          type="text" 
          placeholder="Zoek op naam, email of order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-black/5 rounded-[15px] pl-12 pr-4 py-4 text-[15px] focus:ring-2 focus:ring-primary/20 transition-all shadow-aura"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrphans.length > 0 ? (
          filteredOrphans.map((orphan) => (
            <div key={orphan.id} className="bg-white rounded-[20px] p-6 shadow-aura border border-black/5 flex flex-col lg:flex-row items-center gap-8 group hover:border-primary/20 transition-all">
              {/* Deelnemer Info */}
              <div className="flex-1 flex items-center gap-6 w-full">
                <div className="w-12 h-12 rounded-full bg-va-off-white flex items-center justify-center text-black/20 group-hover:text-primary transition-colors">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-light tracking-tight">
                    {orphan.user?.first_name} {orphan.user?.last_name}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-1 text-[13px] font-bold text-black/30 tracking-widest uppercase">
                    <span className="flex items-center gap-1.5"><Mail size={12} /> {orphan.user?.email}</span>
                    <span className="flex items-center gap-1.5"><Tag size={12} /> Order #{orphan.order?.wpOrderId}</span>
                  </div>
                </div>
              </div>

              {/* Workshop Context */}
              <div className="px-6 py-3 bg-va-off-white rounded-xl border border-black/5 w-full lg:w-auto">
                <div className="text-[11px] font-black tracking-widest text-black/20 uppercase mb-1">Gekocht voor</div>
                <div className="text-[15px] font-bold">{orphan.name}</div>
              </div>

              {/* Verplaats Actie */}
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <select 
                  value={selectedEdition[orphan.id] || ""}
                  onChange={(e) => setSelectedEdition({ ...selectedEdition, [orphan.id]: parseInt(e.target.value) })}
                  className="flex-1 lg:w-64 bg-va-off-white border-none rounded-xl px-4 py-3 text-[13px] font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">Kies een nieuwe datum...</option>
                  {editions.map((e) => (
                    <option key={e.id} value={e.id}>
                      {new Date(e.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })} - {e.workshop?.title || e.title}
                    </option>
                  ))}
                </select>
                
                <button 
                  onClick={() => handleMove(orphan.id)}
                  disabled={!selectedEdition[orphan.id] || isProcessing === orphan.id}
                  className={cn(
                    "va-btn-pro !py-3 px-6",
                    (!selectedEdition[orphan.id] || isProcessing === orphan.id) && "opacity-20 grayscale cursor-not-allowed"
                  )}
                >
                  {isProcessing === orphan.id ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                  INPLANNEN
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-va-off-white rounded-[30px] border-2 border-dashed border-black/5">
            <CheckCircle2 size={48} className="mx-auto text-black/10 mb-4" />
            <TextInstrument className="text-xl font-light text-black/30">Geen wees-deelnemers gevonden die voldoen aan de zoekopdracht.</TextInstrument>
          </div>
        )}
      </div>
    </div>
  );
}
