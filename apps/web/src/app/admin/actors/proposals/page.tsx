"use client";

import React, { useState, useEffect } from 'react';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  PageWrapperInstrument,
  SectionInstrument
} from '@/components/ui/LayoutInstruments';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Calendar, 
  ArrowRight, 
  ShieldCheck,
  AlertCircle,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ActorProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [isProcessing, setIsSaving] = useState(false);

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/actors/proposals');
      const data = await res.json();
      if (data.success) {
        setProposals(data.proposals);
      }
    } catch (err) {
      toast.error('Fout bij ophalen voorstellen');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleAction = async (proposalId: number, action: 'approve' | 'reject') => {
    if (!confirm(`Weet je zeker dat je dit voorstel wilt ${action === 'approve' ? 'goedkeuren' : 'afwijzen'}?`)) return;
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/actors/proposals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, action })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setSelectedProposal(null);
        fetchProposals();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Er ging iets mis bij het verwerken');
    } finally {
      setIsSaving(false);
    }
  };

  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const historyProposals = proposals.filter(p => p.status !== 'pending');

  return (
    <PageWrapperInstrument className="bg-va-off-white min-h-screen pb-20">
      <SectionInstrument className="pt-12 pb-8">
        <ContainerInstrument className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em]">
              <ShieldCheck size={14} />
              Human-in-the-Loop
            </div>
            <HeadingInstrument level={1} className="text-4xl font-light tracking-tighter">
              Actor <span className="text-primary italic">Proposals</span>
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-light">
              Beoordeel wijzigingen die stemacteurs hebben voorgesteld via hun profiel-verrijking.
            </TextInstrument>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl border border-black/5 shadow-sm flex flex-col items-center">
              <span className="text-[10px] font-black text-va-black/20 uppercase tracking-widest">Openstaand</span>
              <span className="text-2xl font-light text-primary">{pendingProposals.length}</span>
            </div>
          </div>
        </ContainerInstrument>
      </SectionInstrument>

      <SectionInstrument>
        <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-4">
              <HeadingInstrument level={3} className="text-lg font-bold px-2 flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                Wachtend op Review
              </HeadingInstrument>
              
              {isLoading ? (
                <div className="p-12 flex justify-center"><Clock className="animate-spin text-primary/20" /></div>
              ) : pendingProposals.length === 0 ? (
                <div className="p-12 bg-white rounded-[30px] border border-dashed border-black/10 text-center space-y-2">
                  <CheckCircle2 size={32} className="mx-auto text-green-500/20" />
                  <p className="text-va-black/30 font-light">Alles is bijgewerkt!</p>
                </div>
              ) : (
                pendingProposals.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setSelectedProposal(p)}
                    className={cn(
                      "w-full text-left p-6 rounded-[30px] border transition-all duration-500 group relative overflow-hidden",
                      selectedProposal?.id === p.id 
                        ? "bg-va-black border-va-black shadow-aura-lg scale-[1.02]" 
                        : "bg-white border-black/5 hover:border-primary/20 hover:shadow-aura-sm"
                    )}
                  >
                    <div className="relative z-10 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
                            selectedProposal?.id === p.id ? "bg-white/10 border-white/10" : "bg-va-off-white border-black/5"
                          )}>
                            <User size={20} className={selectedProposal?.id === p.id ? "text-primary" : "text-va-black/20"} />
                          </div>
                          <div>
                            <h4 className={cn("font-bold text-sm", selectedProposal?.id === p.id ? "text-white" : "text-va-black")}>
                              {p.actorName} {p.actorLastName}
                            </h4>
                            <p className={cn("text-[10px] font-medium uppercase tracking-widest", selectedProposal?.id === p.id ? "text-white/40" : "text-va-black/30")}>
                              ID: {p.actorId}
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          "px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest",
                          selectedProposal?.id === p.id ? "bg-primary text-white" : "bg-primary/10 text-primary"
                        )}>
                          Nieuw
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <Calendar size={12} className={selectedProposal?.id === p.id ? "text-white/20" : "text-va-black/20"} />
                        <span className={selectedProposal?.id === p.id ? "text-white/40" : "text-va-black/40"}>
                          {format(new Date(p.createdAt), 'd MMM HH:mm', { locale: nl })}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* History Section */}
            {historyProposals.length > 0 && (
              <div className="space-y-4 pt-8 border-t border-black/5">
                <HeadingInstrument level={3} className="text-sm font-bold text-va-black/30 px-2 uppercase tracking-widest">
                  Geschiedenis
                </HeadingInstrument>
                <div className="space-y-2 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                  {historyProposals.slice(0, 5).map(p => (
                    <div key={p.id} className="p-4 bg-white/50 rounded-2xl border border-black/5 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{p.actorName}</span>
                        <span className="text-va-black/30">|</span>
                        <span className="text-va-black/40">{format(new Date(p.createdAt), 'd MMM', { locale: nl })}</span>
                      </div>
                      {p.status === 'approved' ? (
                        <CheckCircle2 size={14} className="text-green-500" />
                      ) : (
                        <XCircle size={14} className="text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detail Column */}
          <div className="lg:col-span-2">
            {selectedProposal ? (
              <div className="bg-white rounded-[40px] border border-black/5 shadow-aura-lg overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="p-8 border-b border-black/5 bg-va-off-white/50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-va-black rounded-2xl flex items-center justify-center shadow-lg">
                      <User size={28} className="text-primary" />
                    </div>
                    <div>
                      <HeadingInstrument level={2} className="text-2xl font-light tracking-tighter">
                        Voorstel van <span className="text-primary italic">{selectedProposal.actorName}</span>
                      </HeadingInstrument>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-va-black/30 uppercase tracking-widest">
                          <Mail size={12} /> {selectedProposal.userEmail}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <ButtonInstrument 
                      onClick={() => handleAction(selectedProposal.id, 'reject')}
                      disabled={isProcessing}
                      className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      Afwijzen
                    </ButtonInstrument>
                    <ButtonInstrument 
                      onClick={() => handleAction(selectedProposal.id, 'approve')}
                      disabled={isProcessing}
                      className="bg-va-black text-white hover:bg-primary rounded-xl px-8 py-2 text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
                    >
                      {isProcessing ? <Clock className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                      Goedkeuren
                    </ButtonInstrument>
                  </div>
                </div>

                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {/* Comparison Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/10 pb-2">
                        Basis Gegevens
                      </h5>
                      <div className="space-y-4">
                        <DataRow label="Voornaam" value={selectedProposal.proposalData.first_name} />
                        <DataRow label="Achternaam" value={selectedProposal.proposalData.last_name} />
                        <DataRow label="Geslacht" value={selectedProposal.proposalData.gender} />
                        <DataRow label="Tagline" value={selectedProposal.proposalData.tagline} isLong />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/10 pb-2">
                        Levering & Studio
                      </h5>
                      <div className="space-y-4">
                        <DataRow label="Levertijd" value={`${selectedProposal.proposalData.delivery_days_min}-${selectedProposal.proposalData.delivery_days_max} dagen`} />
                        <DataRow label="Cutoff" value={selectedProposal.proposalData.cutoff_time} />
                        <DataRow label="Free Trial" value={selectedProposal.proposalData.allow_free_trial ? 'JA' : 'NEE'} />
                        <DataRow label="Studio" value={selectedProposal.proposalData.studio_specs?.microphone} isLong />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/10 pb-2">
                      Biografie
                    </h5>
                    <div className="p-6 bg-va-off-white rounded-3xl border border-black/5 text-sm font-light leading-relaxed text-va-black/70 italic">
                      "{selectedProposal.proposalData.bio || 'Geen biografie opgegeven'}"
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/10 pb-2">
                      Waarom Voices?
                    </h5>
                    <div className="p-6 bg-va-off-white rounded-3xl border border-black/5 text-sm font-light leading-relaxed text-va-black/70">
                      {selectedProposal.proposalData.why_voices || 'Geen reden opgegeven'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] bg-va-off-white/50 rounded-[40px] border-2 border-dashed border-black/5 flex flex-col items-center justify-center text-center p-12 space-y-4">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-black/5">
                  <Eye size={32} className="text-va-black/10" />
                </div>
                <div className="space-y-1">
                  <HeadingInstrument level={4} className="text-va-black/40 font-bold">Selecteer een voorstel</HeadingInstrument>
                  <TextInstrument className="text-va-black/20 text-sm max-w-[250px]">
                    Klik op een voorstel in de lijst om de details te bekijken en te beoordelen.
                  </TextInstrument>
                </div>
              </div>
            )}
          </div>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}

function DataRow({ label, value, isLong = false }: { label: string, value: any, isLong?: boolean }) {
  if (!value) return null;
  return (
    <div className={cn("flex flex-col gap-1", isLong ? "col-span-2" : "")}>
      <span className="text-[9px] font-black text-va-black/20 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-medium text-va-black/70">{String(value)}</span>
    </div>
  );
}
