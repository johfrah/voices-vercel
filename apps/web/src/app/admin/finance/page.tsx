import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    TextInstrument,
    ButtonInstrument,
    FixedActionDockInstrument
} from "@/components/ui/LayoutInstruments";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { StudioDataBridge } from "@/lib/bridges/studio-bridge";
import { cn } from "@/lib/utils";
import { useAdminTracking } from '@/hooks/useAdminTracking';
import { 
    TrendingUp, 
    Users, 
    Mic2, 
    GraduationCap,
    ArrowUpRight,
    ArrowDownRight,
    Euro,
    ArrowLeft,
    Download,
    Calendar
} from "lucide-react";
import Link from "next/link";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Financial Dashboard | Voices Admin',
  description: 'Een centraal overzicht van alle inkomsten en kosten.',
};

export default async function FinancialDashboardPage() {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return <ContainerInstrument className="p-20 text-center">Skipping finance render during build...</ContainerInstrument>;
  }

  const user = await getServerUser();

  if (!user || !isAdminUser(user)) redirect('/studio');

  const studioStats = await StudioDataBridge.getFinancialStatsByJourney('studio');
  const agencyStats = await StudioDataBridge.getFinancialStatsByJourney('agency');
  const academyStats = await StudioDataBridge.getFinancialStatsByJourney('academy');

  const totalRevenue = studioStats.totalRevenue + agencyStats.totalRevenue + academyStats.totalRevenue;
  const totalCosts = studioStats.totalCosts + agencyStats.totalCosts + academyStats.totalCosts;
  const totalNet = totalRevenue - totalCosts;

  // 🌳 ANCESTRY TRACING: Fetch World-specific stats if needed
  // This dashboard is currently global, but we could add a World-Aware mode here too.

  const JourneyCard = ({ title, stats, icon: Icon, color, href }: any) => (
    <BentoCard className="bg-white shadow-aura border border-black/5 p-8 group hover:border-primary/20 transition-all rounded-[20px]">
      <div className="flex justify-between items-start mb-8">
        <div className={cn("p-3 rounded-[10px]", color)}>
          <Icon size={24} className="text-white" />
        </div>
        <Link href={href} className="p-2 rounded-full bg-va-off-white opacity-0 group-hover:opacity-100 transition-all">
          <ArrowUpRight size={16} />
        </Link>
      </div>
      
      <TextInstrument className="text-[13px] font-light tracking-widest text-black/30 mb-1">{title}</TextInstrument>
      <HeadingInstrument level={3} className="text-3xl font-light mb-6">{stats.netRevenue.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</HeadingInstrument>
      
      <div className="space-y-3 pt-6 border-t border-black/5">
        <div className="flex justify-between text-[13px]">
          <span className="text-black/40 font-light">Omzet</span>
          <span className="font-light">{stats.totalRevenue.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-black/40 font-light">Kosten</span>
          <span className="font-light text-red-500">- {stats.totalCosts.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-black/40 font-light">Marge</span>
          <span className={cn("font-light", stats.marginPercentage > 30 ? "text-green-500" : "text-amber-500")}>
            {stats.marginPercentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </BentoCard>
  );

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-black/40 hover:text-primary transition-colors mb-12 group">
        <ArrowLeft strokeWidth={1.5} size={14} className="group-hover:-translate-x-1 transition-transform" />
        <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug naar dashboard" />
      </Link>

      <ContainerInstrument className="mb-16">
        <TextInstrument className="text-[15px] font-light tracking-widest text-black/40 mb-2">
          <VoiceglotText translationKey="admin.finance.label" defaultText="Financial Dashboard" />
        </TextInstrument>
        <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
          <VoiceglotText translationKey="admin.finance.title" defaultText="De Boekhouding" />
        </HeadingInstrument>
        <TextInstrument className="text-xl text-black/40 max-w-2xl font-light">
          <VoiceglotText translationKey="admin.finance.text" defaultText="Een centraal overzicht van alle inkomsten en kosten, strikt gescheiden per journey volgens de Bob-methode." />
        </TextInstrument>
      </ContainerInstrument>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-va-black text-white p-10 rounded-[20px] shadow-aura-lg relative overflow-hidden">
          <div className="relative z-10">
            <TextInstrument className="text-[13px] font-light tracking-widest text-white/30 mb-2"><VoiceglotText translationKey="admin.finance.total_net" defaultText="Totaal Netto Resultaat" /></TextInstrument>
            <HeadingInstrument level={2} className="text-5xl font-light">{totalNet.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</HeadingInstrument>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-1 text-green-400 text-sm font-light bg-white/5 px-3 py-1 rounded-full">
                <TrendingUp size={14} /> +12.4%
              </div>
              <TextInstrument className="text-white/40 text-[13px] font-light">t.o.v. vorige maand</TextInstrument>
            </div>
          </div>
          <Euro className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64 rotate-12" />
        </div>

        <div className="bg-va-off-white p-10 rounded-[20px] border border-black/5 flex flex-col justify-center">
          <TextInstrument className="text-[13px] font-light tracking-widest text-black/30 mb-2"><VoiceglotText translationKey="admin.finance.total_revenue" defaultText="Totale Omzet" /></TextInstrument>
          <HeadingInstrument level={2} className="text-4xl font-light">{totalRevenue.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</HeadingInstrument>
        </div>

        <div className="bg-va-off-white p-10 rounded-[20px] border border-black/5 flex flex-col justify-center">
          <TextInstrument className="text-[13px] font-light tracking-widest text-black/30 mb-2"><VoiceglotText translationKey="admin.finance.total_costs" defaultText="Totale Kosten" /></TextInstrument>
          <HeadingInstrument level={2} className="text-4xl font-light text-red-500">{totalCosts.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</HeadingInstrument>
        </div>
      </div>

      <HeadingInstrument level={2} className="text-[15px] font-light tracking-widest text-black/30 mb-8 ml-2"><VoiceglotText translationKey="admin.finance.journeys" defaultText="Journeys" /></HeadingInstrument>
      
      <BentoGrid columns={3} className="gap-8">
        <JourneyCard 
          title={<VoiceglotText translationKey="admin.finance.journey.studio" defaultText="Studio (Workshops)" />} 
          stats={studioStats} 
          icon={Users} 
          color="bg-indigo-500"
          href="/admin/studio/workshops"
        />
        <JourneyCard 
          title={<VoiceglotText translationKey="admin.finance.journey.agency" defaultText="Agency (Voice-overs)" />} 
          stats={agencyStats} 
          icon={Mic2} 
          color="bg-primary"
          href="/admin/orders"
        />
        <JourneyCard 
          title={<VoiceglotText translationKey="admin.finance.journey.academy" defaultText="Academy (LMS)" />} 
          stats={academyStats} 
          icon={GraduationCap} 
          color="bg-amber-500"
          href="/admin/academy"
        />
      </BentoGrid>

      <FixedActionDockInstrument>
        <ContainerInstrument plain className="flex items-center gap-4">
          <ButtonInstrument className="va-btn-pro !bg-va-black flex items-center gap-2">
            <Download strokeWidth={1.5} size={16} />
            <VoiceglotText translationKey="admin.finance.export" defaultText="Rapport exporteren" />
          </ButtonInstrument>
          <ButtonInstrument variant="outline" className="border-black/10 text-va-black hover:bg-va-black/5 flex items-center gap-2">
            <Calendar strokeWidth={1.5} size={16} />
            <VoiceglotText translationKey="admin.finance.period" defaultText="Periode selecteren" />
          </ButtonInstrument>
        </ContainerInstrument>
      </FixedActionDockInstrument>
    </PageWrapperInstrument>
  );
}
