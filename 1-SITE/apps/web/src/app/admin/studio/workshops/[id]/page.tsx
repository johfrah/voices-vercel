import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { StudioDataBridge } from "@/lib/bridges/studio-bridge";
import { cn } from "@/lib/utils";
import { 
    ArrowLeft, 
    Briefcase, 
    Calendar, 
    CheckCircle2,
    AlertTriangle,
    ExternalLink,
    MapPin,
    User
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";
import MoveParticipantClient from "./MoveParticipantClient";
import CostsManagerClient from "./CostsManagerClient";
import { CertificateService } from "@/lib/system/certificate-service";
import { FileText, Download, Loader2 } from "lucide-react";

// Client-side component for certificate download
function CertificateDownloadButton({ orderItemId, participantName }: { orderItemId: number, participantName: string }) {
  "use client";
  return (
    <button 
      onClick={async () => {
        try {
          const res = await fetch(`/api/admin/studio/certificates/${orderItemId}?download=true`);
          const json = await res.json();
          if (json.data) {
            const params = new URLSearchParams({
              name: json.data.participantName,
              workshop: json.data.workshopTitle,
              instructor: json.data.instructorName,
              date: new Date(json.data.date).toISOString().split('T')[0],
              orderId: json.data.orderId.toString()
            });
            window.open(`/api/certificates/render?${params.toString()}`, '_blank');
          }
        } catch (err) {
          console.error('Cert Error:', err);
        }
      }}
      className="p-2 hover:bg-black/5 rounded-lg transition-colors group/cert"
      title="Download Certificaat"
    >
      <FileText size={16} className="text-black/20 group-hover/cert:text-primary transition-colors" />
    </button>
  );
}

// Client-side component for bulk generation
function BulkCertificateButton({ editionId }: { editionId: number }) {
  "use client";
  return (
    <button 
      onClick={async () => {
        try {
          const res = await fetch(`/api/admin/studio/edities/${editionId}/certificates`, { method: 'POST' });
          const data = await res.json();
          alert(`Certificaten voor ${data.processed} deelnemers worden gegenereerd... (Mock)`);
        } catch (err) {
          console.error('Bulk Cert Error:', err);
        }
      }}
      className="w-full va-btn-pro !bg-primary/10 !text-primary hover:!bg-primary/20 !border-primary/20"
    >
      GENEREER ALLE CERTIFICATEN
    </button>
  );
}

export default async function AdminEditionDetailPage({ params }: { params: { id: string } }) {
  const user = await getServerUser();
  if (!user) redirect('/account');
  if (!isAdminUser(user)) redirect('/studio');

  const editionId = parseInt(params.id);
  const edition = await StudioDataBridge.getEditionById(editionId);
  if (!edition) notFound();

  const participants = await StudioDataBridge.getParticipantsByEdition(editionId);
  const allEditions = await StudioDataBridge.getAllEditions();
  const availableEditions = allEditions.filter(e => e.status === 'upcoming' || e.id === editionId);

  // Haal kosten op uit de nieuwe centrale tabel
  const editionCosts = await StudioDataBridge.getCostsByEditionId(editionId);

  const stats = participants.reduce((acc: any, p: any) => {
    const price = parseFloat(p.price || '0');
    const isRefunded = p.order?.status === 'wc-refunded' || p.metaData?.refunded;
    if (isRefunded) { acc.refundedCount++; acc.refundedAmount += price; }
    else { acc.paidCount++; acc.netRevenue += price; }
    return acc;
  }, { paidCount: 0, refundedCount: 0, netRevenue: 0, refundedAmount: 0 });

  // Bereken winst (Netto omzet - Kosten)
  const totalCosts = editionCosts.reduce((acc: number, c: any) => acc + (parseFloat(c.amount) || 0), 0);
  const profit = stats.netRevenue - totalCosts;

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
      <Link href="/admin/studio/workshops" className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-black/40 hover:text-primary transition-colors mb-12 group">
        <ArrowLeft strokeWidth={1.5} size={14} className="group-hover:-translate-x-1 transition-transform" />
        TERUG NAAR OVERZICHT
      </Link>

      <ContainerInstrument className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <ContainerInstrument>
          <TextInstrument className="text-[15px] font-black tracking-widest text-black/40 mb-2">EDITIE DETAILS #{edition.editionNumber || edition.id}</TextInstrument>
          <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter">{edition.workshop?.title}</HeadingInstrument>
          <TextInstrument className="text-black/40 mt-2 font-medium flex items-center gap-4">
            <span className="flex items-center gap-1"><Calendar size={14} className="text-black/20" /> {new Date(edition.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="flex items-center gap-1"><MapPin size={14} className="text-black/20" /> {edition.location?.name || 'Gent'}</span>
            <span className="flex items-center gap-1"><User size={14} className="text-black/20" /> {edition.instructor?.name || 'Onbekend'}</span>
          </TextInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="flex gap-4">
            <div className="bg-va-off-white px-6 py-4 rounded-2xl border border-black/5">
                <TextInstrument className="text-[11px] font-black tracking-widest text-black/30 uppercase">Netto Omzet</TextInstrument>
                <TextInstrument className="text-2xl font-light">{stats.netRevenue.toFixed(2)}</TextInstrument>
            </div>
            <div className="bg-va-black text-white px-6 py-4 rounded-2xl border border-white/5">
                <TextInstrument className="text-[11px] font-black tracking-widest text-white/30 uppercase">Winst</TextInstrument>
                <TextInstrument className={cn("text-2xl font-light", profit < 0 ? "text-red-400" : "text-green-400")}>{profit.toFixed(2)}</TextInstrument>
            </div>
            <div className="bg-va-off-white px-6 py-4 rounded-2xl border border-black/5">
                <TextInstrument className="text-[11px] font-black tracking-widest text-black/30 uppercase">Bezetting</TextInstrument>
                <TextInstrument className="text-2xl font-light">{stats.paidCount}/{edition.capacity}</TextInstrument>
            </div>
        </ContainerInstrument>
      </ContainerInstrument>

      <BentoGrid columns={3} className="gap-8">
        <BentoCard span="lg" className="bg-white shadow-aura border border-black/5 overflow-hidden">
          <ContainerInstrument className="p-8 border-b border-black/5 bg-va-off-white/50 flex justify-between items-center">
            <TextInstrument className="text-[15px] font-black tracking-tight uppercase">Deelnemers & Betalers</TextInstrument>
            <div className="flex gap-4">
                <span className="flex items-center gap-1 text-[12px] font-bold text-green-600"><CheckCircle2 size={12}/> {stats.paidCount} OK</span>
                {stats.refundedCount > 0 && <span className="flex items-center gap-1 text-[12px] font-bold text-amber-600"><AlertTriangle size={12}/> {stats.refundedCount} REFUND</span>}
            </div>
          </ContainerInstrument>
          <ContainerInstrument className="divide-y divide-black/5">
            {participants.map((p: any) => {
              const order = p.order || {};
              const orderMeta = typeof order.rawMeta === 'string' ? JSON.parse(order.rawMeta) : order.rawMeta;
              const itemMeta = typeof p.metaData === 'string' ? JSON.parse(p.metaData) : p.metaData;
              const pInfo = itemMeta?.participant_info || {};
              const isRefunded = order.status === 'wc-refunded' || itemMeta?.refunded;
              return (
                <ContainerInstrument key={p.id} className={cn("p-8 transition-colors group", isRefunded ? "bg-amber-50/30" : "hover:bg-va-off-white/30")}>
                  <div className="grid grid-cols-12 gap-6 items-center">
                    <div className="col-span-4 flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm", isRefunded ? "bg-amber-200 text-amber-800" : "bg-black text-white")}>
                            {pInfo.first_name?.charAt(0)}{pInfo.last_name?.charAt(0)}
                        </div>
                        <div>
                            <TextInstrument className="font-black tracking-tight block">{pInfo.first_name} {pInfo.last_name}</TextInstrument>
                            <TextInstrument className="text-[13px] text-black/40 font-medium">{pInfo.email}</TextInstrument>
                        </div>
                    </div>
                    <div className="col-span-3">
                        <div className="flex items-center gap-2 text-[13px] text-black/60"><Briefcase size={12} className="text-black/20" /> {pInfo.profession || '-'}</div>
                        <div className="flex items-center gap-2 text-[13px] text-black/60 mt-1"><Calendar size={12} className="text-black/20" /> {pInfo.age || '?'} jaar</div>
                    </div>
                    <div className="col-span-3">
                        <TextInstrument className="text-[11px] font-black tracking-widest text-black/20 uppercase block mb-1">Betaler</TextInstrument>
                        <TextInstrument className="text-[13px] font-bold block">{orderMeta?._billing_first_name} {orderMeta?._billing_last_name}</TextInstrument>
                        <TextInstrument className="text-[12px] text-black/40 truncate block">{orderMeta?._billing_company || '-'}</TextInstrument>
                    </div>
                    <div className="col-span-2 text-right flex items-center justify-end gap-4">
                        <div>
                            <div className="flex items-center justify-end gap-2 mb-1">
                                {isRefunded ? <AlertTriangle className="text-amber-500" size={16} /> : <CheckCircle2 className="text-green-500" size={16} />}
                                <TextInstrument className={cn("text-[13px] font-black", isRefunded ? "text-amber-600" : "text-green-600")}>{parseFloat(p.price || '0').toFixed(2)}</TextInstrument>
                            </div>
                            <Link href={`/admin/orders/${order.id}`} className="text-[11px] font-black tracking-widest text-black/20 hover:text-primary flex items-center justify-end gap-1">WC #{order.wpOrderId} <ExternalLink size={10} /></Link>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <CertificateDownloadButton 
                              orderItemId={p.id} 
                              participantName={`${pInfo.first_name} ${pInfo.last_name}`} 
                            />
                            <MoveParticipantClient 
                              orderItemId={p.id} 
                              currentEditionId={editionId} 
                              availableEditions={availableEditions} 
                            />
                        </div>
                    </div>
                  </div>
                </ContainerInstrument>
              );
            })}
          </ContainerInstrument>
        </BentoCard>

        <div className="space-y-8">
            <BentoCard span="sm" className="bg-white shadow-aura p-10 border border-black/5">
                <CostsManagerClient 
                  editionId={editionId} 
                  initialCosts={editionCosts} 
                  locationId={edition.locationId}
                  instructorId={edition.instructorId}
                />
            </BentoCard>

            <BentoCard span="sm" className="bg-va-black text-white p-10">
                <HeadingInstrument level={3} className="text-[15px] tracking-widest text-white/30 mb-6 font-light uppercase">Editie Beheer</HeadingInstrument>
                <div className="space-y-4">
                    <button className="w-full va-btn-pro !bg-white/10 hover:!bg-white/20 !border-white/10">EDITIE WIJZIGEN</button>
                    <button className="w-full va-btn-pro !bg-white/10 hover:!bg-white/20 !border-white/10">MAIL NAAR GROEP</button>
                    <BulkCertificateButton editionId={editionId} />
                    <button className="w-full va-btn-pro !bg-red-500/10 !text-red-500 hover:!bg-red-500/20 !border-red-500/20">EDITIE ANNULEREN</button>
                </div>
            </BentoCard>
        </div>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}
