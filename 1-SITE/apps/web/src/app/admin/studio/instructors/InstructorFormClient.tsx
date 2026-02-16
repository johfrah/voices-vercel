"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InstructorFormClient({ initialData }: { initialData?: any }) {
  const [formData, setFormData] = useState(initialData || {
    firstName: '',
    lastName: '',
    name: '', // Legacy field
    slug: '',
    tagline: '',
    bio: '',
    vatNumber: '',
    isPublic: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Automatisch legacy 'name' veld vullen
    const fullData = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      slug: `${formData.firstName}-${formData.lastName}`.toLowerCase().replace(/ /g, '-')
    };

    try {
      const res = await fetch('/api/admin/studio/instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData)
      });
      if (res.ok) {
        router.refresh();
        if (!initialData) setFormData({ firstName: '', lastName: '', name: '', slug: '', tagline: '', bio: '', vatNumber: '', isPublic: true });
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-black tracking-widest text-white/30 uppercase block mb-2">Voornaam</label>
            <input 
              type="text" 
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] font-black tracking-widest text-white/30 uppercase block mb-2">Achternaam</label>
            <input 
              type="text" 
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-black tracking-widest text-white/30 uppercase block mb-2">Tagline (Kort)</label>
          <input 
            type="text" 
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 outline-none transition-all"
            placeholder="bijv. Voice-over expert & Coach"
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

        <div>
          <label className="text-[11px] font-black tracking-widest text-white/30 uppercase block mb-2">Bio (Lange tekst)</label>
          <textarea 
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 outline-none transition-all resize-none"
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isSaving}
        className="w-full va-btn-pro !bg-primary !py-4"
      >
        {isSaving ? <Loader2 className="animate-spin mx-auto" /> : (initialData ? "DOCENT BIJWERKEN" : "DOCENT OPSLAAN")}
      </button>
    </form>
  );
}
