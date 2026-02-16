"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LocationFormClient({ initialData }: { initialData?: any }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    slug: '',
    address: '',
    city: '',
    zip: '',
    vatNumber: '',
    mapUrl: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/studio/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.refresh();
        if (!initialData) setFormData({ name: '', slug: '', address: '', city: '', zip: '', vatNumber: '', mapUrl: '' });
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-black tracking-widest text-white/30 uppercase block mb-2">Naam Locatie</label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 outline-none transition-all"
            placeholder="bijv. Voices Studio Gent"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-black tracking-widest text-white/30 uppercase block mb-2">Adres</label>
            <input 
              type="text" 
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] font-black tracking-widest text-white/30 uppercase block mb-2">Postcode</label>
            <input 
              type="text" 
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-black tracking-widest text-white/30 uppercase block mb-2">Stad</label>
            <input 
              type="text" 
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] font-black tracking-widest text-white/30 uppercase block mb-2 text-primary">BTW Nummer (Privé)</label>
            <input 
              type="text" 
              value={formData.vatNumber}
              onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
              className="w-full bg-white/5 border border-primary/20 rounded-xl p-3 text-white focus:border-primary/50 outline-none transition-all"
              placeholder="BE 0123.456.789"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-black tracking-widest text-white/30 uppercase block mb-2">Google Maps URL</label>
          <input 
            type="text" 
            value={formData.mapUrl}
            onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 outline-none transition-all"
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isSaving}
        className="w-full va-btn-pro !bg-primary !py-4"
      >
        {isSaving ? <Loader2 className="animate-spin mx-auto" /> : (initialData ? "LOCATIE BIJWERKEN" : "LOCATIE OPSLAAN")}
      </button>
    </form>
  );
}
