"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Euro, MapPin, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CostsManagerClient({ 
  editionId, 
  initialCosts = [],
  locationId,
  instructorId
}: { 
  editionId: number; 
  initialCosts: any[];
  locationId?: number | null;
  instructorId?: number | null;
}) {
  const [costs, setCosts] = useState(initialCosts);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const addCost = (type: string = 'overig') => {
    setCosts([...costs, { type, amount: 0, note: '', status: 'gepland' }]);
  };

  const removeCost = (index: number) => {
    setCosts(costs.filter((_, i) => i !== index));
  };

  const updateCost = (index: number, field: string, value: any) => {
    const newCosts = [...costs];
    newCosts[index] = { ...newCosts[index], [field]: value };
    setCosts(newCosts);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/studio/update-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          editionId, 
          costs,
          locationId,
          instructorId
        })
      });
      
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const totalCosts = costs.reduce((acc, c) => acc + (parseFloat(c.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-[15px] font-black tracking-widest text-black/30 uppercase">Kostenbeheer (Privé)</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => addCost('locatie')}
            className="text-black/40 hover:text-primary p-2 rounded-lg transition-all flex items-center gap-1 text-[11px] font-black"
            title="Locatiekost toevoegen"
          >
            <MapPin size={12} /> LOCATIE
          </button>
          <button 
            onClick={() => addCost('instructeur')}
            className="text-black/40 hover:text-primary p-2 rounded-lg transition-all flex items-center gap-1 text-[11px] font-black"
            title="Instructeurkost toevoegen"
          >
            <User size={12} /> DOCENT
          </button>
          <button 
            onClick={() => addCost('overig')}
            className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-all flex items-center gap-2 text-[11px] font-black"
          >
            <Plus size={12} /> OVERIG
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {costs.map((cost, index) => (
          <div key={index} className="grid grid-cols-12 gap-3 items-center bg-va-off-white/50 p-3 rounded-xl border border-black/5">
            <div className="col-span-3">
              <select 
                value={cost.type}
                onChange={(e) => updateCost(index, 'type', e.target.value)}
                className="w-full bg-white border-none rounded-lg p-2 text-[12px] font-bold uppercase tracking-wider"
              >
                <option value="locatie">Locatie</option>
                <option value="instructeur">Docent</option>
                <option value="materiaal">Materiaal</option>
                <option value="catering">Catering</option>
                <option value="overig">Overig</option>
              </select>
            </div>
            <div className="col-span-3 relative">
              <Euro size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20" />
              <input 
                type="number" 
                placeholder="Bedrag" 
                value={cost.amount}
                onChange={(e) => updateCost(index, 'amount', e.target.value)}
                className="w-full bg-white border-none rounded-lg p-2 pl-8 text-[13px] font-bold"
              />
            </div>
            <div className="col-span-5">
              <input 
                type="text" 
                placeholder="Notitie (bijv. Bernadette)" 
                value={cost.note}
                onChange={(e) => updateCost(index, 'note', e.target.value)}
                className="w-full bg-white border-none rounded-lg p-2 text-[12px]"
              />
            </div>
            <div className="col-span-1 text-right">
              <button onClick={() => removeCost(index)} className="text-black/10 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {costs.length > 0 && (
        <div className="pt-6 border-t border-black/5 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-black tracking-widest text-black/20 uppercase block">Totaal Kosten</span>
            <span className="text-xl font-light">€{totalCosts.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="va-btn-pro !py-3 !px-8"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : "KOSTEN OPSLAAN"}
          </button>
        </div>
      )}
    </div>
  );
}
