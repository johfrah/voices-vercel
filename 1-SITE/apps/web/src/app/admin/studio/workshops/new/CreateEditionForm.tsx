"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonInstrument } from "@/components/ui/LayoutInstruments";
import { Loader2 } from "lucide-react";

export default function CreateEditionForm({ workshops, instructors }: { workshops: any[], instructors: any[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      workshopId: parseInt(formData.get('workshopId') as string),
      instructorId: parseInt(formData.get('instructorId') as string),
      date: new Date(formData.get('date') as string).toISOString(),
      capacity: parseInt(formData.get('capacity') as string),
      status: 'upcoming',
      title: formData.get('title') as string,
    };

    try {
      const res = await fetch('/api/admin/studio/create-edition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        router.push('/admin/studio/workshops');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border border-black/5 shadow-aura">
      <div className="space-y-2">
        <label className="text-[11px] font-black tracking-widest text-black/30 uppercase">Workshop Type</label>
        <select name="workshopId" required className="w-full p-4 bg-va-off-white rounded-xl border-none text-[15px]">
          {workshops.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-black tracking-widest text-black/30 uppercase">Titel (optioneel)</label>
        <input type="text" name="title" placeholder="Bijv. Voorjaarseditie" className="w-full p-4 bg-va-off-white rounded-xl border-none text-[15px]" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[11px] font-black tracking-widest text-black/30 uppercase">Datum & Tijd</label>
          <input type="datetime-local" name="date" required className="w-full p-4 bg-va-off-white rounded-xl border-none text-[15px]" />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-black tracking-widest text-black/30 uppercase">Capaciteit</label>
          <input type="number" name="capacity" defaultValue={8} required className="w-full p-4 bg-va-off-white rounded-xl border-none text-[15px]" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-black tracking-widest text-black/30 uppercase">Instructeur</label>
        <select name="instructorId" required className="w-full p-4 bg-va-off-white rounded-xl border-none text-[15px]">
          {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </div>

      <ButtonInstrument type="submit" disabled={loading} className="w-full va-btn-pro !py-6">
        {loading ? <Loader2 className="animate-spin" /> : "EDITIE OPSLAAN"}
      </ButtonInstrument>
    </form>
  );
}
