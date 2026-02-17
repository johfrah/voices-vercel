"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Plus, Trash2, Video, FileText, Info } from "lucide-react";

export default function WorkshopCatalogFormClient({ workshop, instructors }: { workshop: any, instructors: any[] }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: workshop.title || "",
    slug: workshop.slug || "",
    description: workshop.description || "",
    price: workshop.price || "0",
    duration: workshop.duration || "",
    instructorId: workshop.instructorId || "",
    program: workshop.program || [],
    meta: workshop.meta || {
      aftermovie_url: "",
      aftermovie_beschrijving: "",
      intro_video_url: "",
      benefits: []
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const url = workshop.id === 0 
        ? "/api/admin/studio/workshops/catalog" 
        : `/api/admin/studio/workshops/catalog/${workshop.id}`;
        
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Fout bij opslaan");
      
      router.refresh();
      router.push("/admin/studio/workshops/catalog");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const addProgramItem = () => {
    const newProgram = [...(formData.program || []), { time: "", activity: "" }];
    setFormData({ ...formData, program: newProgram });
  };

  const updateProgramItem = (index: number, field: string, value: string) => {
    const newProgram = [...(formData.program || [])];
    newProgram[index] = { ...newProgram[index], [field]: value };
    setFormData({ ...formData, program: newProgram });
  };

  const removeProgramItem = (index: number) => {
    const newProgram = formData.program.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, program: newProgram });
  };

  return (
    <div className="space-y-12">
      {/* Basis Informatie */}
      <section className="bg-white rounded-[20px] p-10 shadow-aura border border-black/5 space-y-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-va-off-white flex items-center justify-center text-primary">
            <FileText size={20} />
          </div>
          <h2 className="text-2xl font-light">Basis Informatie</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-black/30 uppercase">Workshop Titel</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-va-off-white border-none rounded-[10px] px-4 py-3 text-[15px] focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-black/30 uppercase">Slug (URL)</label>
            <input 
              type="text" 
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-va-off-white border-none rounded-[10px] px-4 py-3 text-[15px] focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black tracking-widest text-black/30 uppercase">Beschrijving</label>
          <textarea 
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-va-off-white border-none rounded-[10px] px-4 py-3 text-[15px] focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-black/30 uppercase">Standaard Prijs ()</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-va-off-white border-none rounded-[10px] px-4 py-3 text-[15px] focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-black/30 uppercase">Duur (bijv. 1 dag)</label>
            <input 
              type="text" 
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full bg-va-off-white border-none rounded-[10px] px-4 py-3 text-[15px] focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-black/30 uppercase">Vaste Docent</label>
            <select 
              value={formData.instructorId || ""}
              onChange={(e) => setFormData({ ...formData, instructorId: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full bg-va-off-white border-none rounded-[10px] px-4 py-3 text-[15px] focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">Geen vaste docent</option>
              {instructors.map((ins) => (
                <option key={ins.id} value={ins.id}>{ins.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Media & Video */}
      <section className="bg-white rounded-[20px] p-10 shadow-aura border border-black/5 space-y-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-va-off-white flex items-center justify-center text-primary">
            <Video size={20} />
          </div>
          <h2 className="text-2xl font-light">Media & Video</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-black/30 uppercase">Intro Video URL (YouTube/Vimeo)</label>
            <input 
              type="text" 
              value={formData.meta?.intro_video_url || ""}
              onChange={(e) => setFormData({ 
                ...formData, 
                meta: { ...formData.meta, intro_video_url: e.target.value } 
              })}
              className="w-full bg-va-off-white border-none rounded-[10px] px-4 py-3 text-[15px] focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-black/30 uppercase">Aftermovie Video URL</label>
            <input 
              type="text" 
              value={formData.meta?.aftermovie_url || ""}
              onChange={(e) => setFormData({ 
                ...formData, 
                meta: { ...formData.meta, aftermovie_url: e.target.value } 
              })}
              className="w-full bg-va-off-white border-none rounded-[10px] px-4 py-3 text-[15px] focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-black tracking-widest text-black/30 uppercase">Aftermovie Beschrijving</label>
          <textarea 
            rows={3}
            value={formData.meta?.aftermovie_beschrijving || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              meta: { ...formData.meta, aftermovie_beschrijving: e.target.value } 
            })}
            className="w-full bg-va-off-white border-none rounded-[10px] px-4 py-3 text-[15px] focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
        </div>
      </section>

      {/* Programma */}
      <section className="bg-white rounded-[20px] p-10 shadow-aura border border-black/5 space-y-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-va-off-white flex items-center justify-center text-primary">
              <Info size={20} />
            </div>
            <h2 className="text-2xl font-light">Programma</h2>
          </div>
          <button 
            onClick={addProgramItem}
            className="text-[11px] font-black tracking-widest text-primary hover:bg-primary/5 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          >
            <Plus size={14} /> ITEM TOEVOEGEN
          </button>
        </div>

        <div className="space-y-4">
          {formData.program && formData.program.length > 0 ? (
            formData.program.map((item: any, index: number) => (
              <div key={index} className="flex gap-4 items-start bg-va-off-white p-4 rounded-[15px]">
                <div className="w-32">
                  <input 
                    type="text" 
                    placeholder="Tijd (bijv. 09:00)"
                    value={item.time}
                    onChange={(e) => updateProgramItem(index, 'time', e.target.value)}
                    className="w-full bg-white border-none rounded-[8px] px-3 py-2 text-[13px] focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Activiteit"
                    value={item.activity}
                    onChange={(e) => updateProgramItem(index, 'activity', e.target.value)}
                    className="w-full bg-white border-none rounded-[8px] px-3 py-2 text-[13px] focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <button 
                  onClick={() => removeProgramItem(index)}
                  className="p-2 text-black/20 hover:text-red-500 transition-colors mt-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-black/5 rounded-[20px] text-black/30">
              Nog geen programma items toegevoegd.
            </div>
          )}
        </div>
      </section>

      {/* Save Bar */}
      <div className="flex items-center justify-between pt-8 border-t border-black/5">
        <div>
          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="va-btn-pro"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {isSaving ? "OPSLAAN..." : "WIJZIGINGEN OPSLAAN"}
        </button>
      </div>
    </div>
  );
}
