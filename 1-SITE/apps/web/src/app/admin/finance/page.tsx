import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { StudioDataBridge } from "@/lib/studio-bridge";
import { cn } from "@/lib/utils";
import { 
    TrendingUp, 
    Users, 
    Mic2, 
    GraduationCap,
    ArrowUpRight,
    ArrowDownRight,
    Euro,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";
import { redirect } from "next/navigation";

export default async function FinancialCockpitPage() {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) redirect('/studio');

  const studioStats = await StudioDataBridge.getFinancialStatsByJourney('studio');
  const agencyStats = await StudioDataBridge.getFinancialStatsByJourney('agency');
  const academyStats = await StudioDataBridge.getFinancialStatsByJourney('academy');

  const totalRevenue = studioStats.totalRevenue + agencyStats.totalRevenue + academyStats.totalRevenue;
  const totalCosts = studioStats.totalCosts + agencyStats.totalCosts + academyStats.totalCosts;
  const totalNet = totalRevenue - totalCosts;

  const JourneyCard = ({ title, stats, icon: Icon, color, href }: any) => (
    <BentoCard className="bg-white shadow-aura border border-black/5 p-8 group hover:border-primary/20 transition-all">
      <div className="flex justify-between items-start mb-8">
        <div className={cn("p-3 rounded-2xl", color)}>
          <Icon size={24} className="text-white" />
        </div>
        <Link href={href} className="p-2 rounded-full bg-va-off-white opacity-0 group-hover:opacity-100 transition-all">
          <ArrowUpRight size={16} />
        </Link>
      </div>
      
      <TextInstrument className="text-[13px] font-black tracking-widest text-black/30 uppercase mb-1">{title}</TextInstrument>
      <HeadingInstrument level={3} className="text-3xl font-light mb-6">€{stats.netRevenue.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</HeadingInstrument>
      
      <div className="space-y-3 pt-6 border-t border-black/5">
        <div className="flex justify-between text-[13px]">
          <span className="text-black/40">Omzet</span>
          <span className="font-bold">€{stats.totalRevenue.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-black/40">Kosten</span>
          <span className="font-bold text-red-500">- €{stats.totalCosts.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-black/40">Marge</span>
          <span className={cn("font-black", stats.marginPercentage > 30 ? "text-green-500" : "text-amber-500")}>
            {stats.marginPercentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </BentoCard>
  );

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-black/40 hover:text-primary transition-colors mb-12 group">
        <ArrowLeft strokeWidth={1.5} size={14} className="group-hover:-translate-x-1 transition-transform" />
        TERUG NAAR DASHBOARD
      </Link>

      <ContainerInstrument className="mb-16">
        <TextInstrument className="text-[15px] font-black tracking-widest text-black/40 mb-2 uppercase">Financial Cockpit</TextInstrument>
        <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">De Boekhouding</HeadingInstrument>
        <TextInstrument className="text-xl text-black/40 max-w-2xl font-medium">
          Eén centraal overzicht van alle inkomsten en kosten, strikt gescheiden per journey volgens de Bob-methode.
        </TextInstrument>
      </ContainerInstrument>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-va-black text-white p-10 rounded-[40px] shadow-aura-lg relative overflow-hidden">
          <div className="relative z-10">
            <TextInstrument className="text-[13px] font-black tracking-widest text-white/30 uppercase mb-2">Totaal Netto Resultaat</TextInstrument>
            <HeadingInstrument level={2} className="text-5xl font-light">€{totalNet.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</HeadingInstrument>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-1 text-green-400 text-sm font-bold bg-white/5 px-3 py-1 rounded-full">
                <TrendingUp size={14} /> +12.4%
              </div>
              <TextInstrument className="text-white/40 text-[13px]">t.o.v. vorige maand</TextInstrument>
            </div>
          </div>
          <Euro className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64 rotate-12" />
        </div>

        <div className="bg-va-off-white p-10 rounded-[40px] border border-black/5 flex flex-col justify-center">
          <TextInstrument className="text-[13px] font-black tracking-widest text-black/30 uppercase mb-2">Totale Omzet</TextInstrument>
          <HeadingInstrument level={2} className="text-4xl font-light">€{totalRevenue.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</HeadingInstrument>
        </div>

        <div className="bg-va-off-white p-10 rounded-[40px] border border-black/5 flex flex-col justify-center">
          <TextInstrument className="text-[13px] font-black tracking-widest text-black/30 uppercase mb-2">Totale Kosten</TextInstrument>
          <HeadingInstrument level={2} className="text-4xl font-light text-red-500">€{totalCosts.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</HeadingInstrument>
        </div>
      </div>

      <HeadingInstrument level={2} className="text-[15px] font-black tracking-widest text-black/30 uppercase mb-8 ml-2">Journeys</HeadingInstrument>
      
      <BentoGrid columns={3} className="gap-8">
        <JourneyCard 
          title="Studio (Workshops)" 
          stats={studioStats} 
          icon={Users} 
          color="bg-indigo-500"
          href="/admin/studio/workshops"
        />
        <JourneyCard 
          title="Agency (Voice-overs)" 
          stats={agencyStats} 
          icon={Mic2} 
          color="bg-primary"
          href="/admin/agency/orders"
        />
        <JourneyCard 
          title="Academy (LMS)" 
          stats={academyStats} 
          icon={GraduationCap} 
          color="bg-amber-500"
          href="/admin/academy/stats"
        />
      </BentoGrid>
    </PageWrapperInstrument>
  );
}
