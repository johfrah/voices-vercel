import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  PageWrapperInstrument, 
  TextInstrument 
} from "@/components/ui/LayoutInstruments";
import { StudioDataBridge } from "@/lib/studio-bridge";
import { ArrowLeft, CheckCircle2, DollarSign, FileAudio, Mail, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

/**
 * STUDIO ADMIN EDITION DETAIL
 * 🛡️ VOICES OS: Beheer van uploads, deelnemers en financiën per editie.
 */
export default async function AdminEditionDetailPage({ params }: { params: { id: string } }) {
  const editionId = parseInt(params.id);
  const edition = await StudioDataBridge.getEditionById(editionId);

  if (!edition) {
    notFound();
  }

  const participants = await StudioDataBridge.getParticipantsByEdition(editionId);

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
      <Link 
        href="/admin/studio" 
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-primary transition-colors mb-12 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        TERUG NAAR STUDIO BEHEER
      </Link>

      <ContainerInstrument className="mb-12">
        <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">
          Editie Beheer
        </TextInstrument>
        <HeadingInstrument level={1} className="text-5xl font-black uppercase tracking-tighter">
          {edition.workshop?.title} <span className="text-primary">— {new Date(edition.date).toLocaleDateString('nl-BE')}</span>
        </HeadingInstrument>
      </ContainerInstrument>

      <BentoGrid columns={3} className="gap-8">
        {/* PARTICIPANTS & UPLOADS (Step 2) */}
        <BentoCard span="lg" className="bg-white shadow-aura border border-black/5 overflow-hidden">
          <div className="p-8 border-b border-black/5 bg-va-off-white/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-primary" />
              <span className="text-sm font-black uppercase tracking-tight">
                {participants.length} Deelnemers
              </span>
            </div>
            <ButtonInstrument className="px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary transition-all">
              BULK AUDIO UPLOAD
            </ButtonInstrument>
          </div>

          <div className="divide-y divide-black/5">
            {participants.map((p: any) => {
              const user = p.order?.user;
              return (
                <div key={p.id} className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 group">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xl font-black uppercase tracking-tight">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-[10px] font-bold text-black/30 uppercase tracking-widest mt-1">
                        {user?.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {p.dropboxUrl ? (
                      <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 size={14} /> AUDIO LIVE
                      </div>
                    ) : (
                      <ButtonInstrument className="flex items-center gap-2 px-4 py-3 bg-va-off-white border border-black/5 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-primary transition-all">
                        <FileAudio size={14} /> UPLOAD AUDIO
                      </ButtonInstrument>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </BentoCard>

        {/* FINANCE & INSTRUCTOR PAYOUT (Step 4) */}
        <div className="space-y-8">
          <BentoCard span="sm" className="bg-va-black text-white p-10">
            <DollarSign className="text-primary mb-6" size={24} />
            <HeadingInstrument level={3} className="text-xl font-black uppercase tracking-tighter mb-6">
              Financiële Afwikkeling
            </HeadingInstrument>
            
            <div className="space-y-4 border-b border-white/5 pb-6 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Bruto Omzet</span>
                <span className="text-sm font-black">€{(participants.length * parseFloat(edition.price || '0')).toLocaleString('nl-BE')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Platform Fee (30%)</span>
                <span className="text-sm font-black text-primary">- €{(participants.length * parseFloat(edition.price || '0') * 0.3).toLocaleString('nl-BE')}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Uitbetaling Instructeur</span>
              <span className="text-xl font-black text-white">€{(participants.length * parseFloat(edition.price || '0') * 0.7).toLocaleString('nl-BE')}</span>
            </div>

            <ButtonInstrument className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-10">
              BEVESTIG UITBETALING
            </ButtonInstrument>
          </BentoCard>

          {/* SMART MAIL (Step 3) */}
          <BentoCard span="sm" className="bg-va-off-white p-10 border border-black/5">
            <Mail className="text-primary mb-6" size={24} />
            <HeadingInstrument level={3} className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-6">
              Communicatie
            </HeadingInstrument>
            <div className="space-y-3">
              <ButtonInstrument className="w-full py-4 bg-white border border-black/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all">
                STUUR AUDIO-LINK MAIL
              </ButtonInstrument>
              <ButtonInstrument className="w-full py-4 bg-white border border-black/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all">
                VRAAG OM REVIEW
              </ButtonInstrument>
            </div>
          </BentoCard>
        </div>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}
