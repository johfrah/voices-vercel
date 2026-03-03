"use client";

import {
  ButtonInstrument,
  ContainerInstrument,
  HeadingInstrument,
  PageWrapperInstrument,
  SectionInstrument,
  TextInstrument,
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useAdminTracking } from "@/hooks/useAdminTracking";
import { useWorld } from "@/contexts/WorldContext";
import {
  ArrowRight,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  FolderCog,
  Loader2,
  Sparkles,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

interface DashboardOverviewActivity {
  id: string;
  message: string;
  source: string;
  level: string;
  created_at: string;
}

interface DashboardOverviewFinanceEntry {
  id: number;
  created_at: string;
  total: number;
  total_cost: number | null;
  status: string;
  journey: string | null;
}

interface DashboardAccessItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  bucket: "priority" | "quick" | "settings";
  order: number;
  count: number | null;
}

interface DashboardVisiblePage {
  id: string;
  title: string;
  href: string;
  bucket: "priority" | "quick" | "settings";
}

interface DashboardOverviewResponse {
  world: {
    id: number | null;
    code: string;
    label: string;
  };
  actions: {
    pending_orders: number;
    processing_orders: number;
    pending_approvals: number;
    pending_interests: number;
    new_mails_24h: number;
    live_actors: number;
    upcoming_studio_editions: number;
  };
  finance: {
    revenue: number;
    costs: number;
    net: number;
    margin_percentage: number;
    recent_entries: DashboardOverviewFinanceEntry[];
  };
  activity: DashboardOverviewActivity[];
  access: {
    priority_items: DashboardAccessItem[];
    quick_items: DashboardAccessItem[];
    settings_items: DashboardAccessItem[];
    visible_pages: DashboardVisiblePage[];
  };
  generated_at: string;
}

interface PriorityCard {
  title: string;
  description: string;
  value: number | null;
  href: string;
}

const EMPTY_OVERVIEW: DashboardOverviewResponse = {
  world: { id: null, code: "all", label: "Global View" },
  actions: {
    pending_orders: 0,
    processing_orders: 0,
    pending_approvals: 0,
    pending_interests: 0,
    new_mails_24h: 0,
    live_actors: 0,
    upcoming_studio_editions: 0,
  },
  finance: {
    revenue: 0,
    costs: 0,
    net: 0,
    margin_percentage: 0,
    recent_entries: [],
  },
  activity: [],
  access: {
    priority_items: [],
    quick_items: [],
    settings_items: [],
    visible_pages: [],
  },
  generated_at: "",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveJourneyLabel(journey: string | null): string {
  if (journey === "studio") return "Studio";
  if (journey === "academy") return "Academy";
  if (journey === "artist") return "Artist";
  if (journey === "ademing") return "Ademing";
  return "Agency";
}

function resolveActivityHref(item: DashboardOverviewActivity): string {
  if (item.source === "mail") return "/admin/mailbox";
  if (item.level === "error") return "/admin/system/logs?level=error";
  return "/admin/approvals";
}

export default function AdminDashboardContent(): JSX.Element {
  const { activeWorld, allWorlds, setWorld, isLoading: worldLoading } = useWorld();
  const { logAction } = useAdminTracking();

  const [overview, setOverview] = useState<DashboardOverviewResponse>(EMPTY_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const worldCode = activeWorld?.code || "all";

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/dashboard/overview?world=${encodeURIComponent(worldCode)}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("overview_fetch_failed");
      }

      const data = (await response.json()) as DashboardOverviewResponse;
      setOverview(data);
    } catch {
      setOverview(EMPTY_OVERVIEW);
      setErrorMessage("Dashboarddata kon niet geladen worden. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }, [worldCode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const primaryCards = useMemo<PriorityCard[]>(() => {
    return overview.access.priority_items.map((item) => ({
      title: item.title,
      description: item.subtitle,
      value: item.count,
      href: item.href,
    }));
  }, [overview.access.priority_items]);

  const quickLinks = useMemo(() => overview.access.quick_items, [overview.access.quick_items]);
  const lowPriorityLinks = useMemo(() => overview.access.settings_items, [overview.access.settings_items]);
  const visiblePages = useMemo(() => overview.access.visible_pages, [overview.access.visible_pages]);

  return (
    <PageWrapperInstrument className="p-8 md:p-12 space-y-10 max-w-[1500px] mx-auto">
      <SectionInstrument className="space-y-4">
        <ContainerInstrument className="flex items-center justify-between gap-4 flex-wrap">
          <ContainerInstrument className="space-y-2">
            <ContainerInstrument className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
              <Sparkles size={14} />
              <TextInstrument as="span" className="text-[11px] font-semibold tracking-[0.15em] uppercase">
                <VoiceglotText translationKey="admin.focus.badge" defaultText="Vandaag eerst" />
              </TextInstrument>
            </ContainerInstrument>
            <HeadingInstrument level={1} className="text-5xl md:text-6xl font-light tracking-tight">
              <VoiceglotText translationKey="admin.focus.title" defaultText="Beheer in één oogopslag" />
            </HeadingInstrument>
            <TextInstrument className="text-[15px] text-va-black/50 font-medium max-w-3xl">
              <VoiceglotText
                translationKey="admin.focus.subtitle"
                defaultText="Eerst opvolging en financiën. Minder prioritaire instellingen staan bewust lager."
              />
            </TextInstrument>
          </ContainerInstrument>
          <ButtonInstrument
            onClick={() => {
              logAction("refresh_overview_dashboard");
              fetchData();
            }}
            className="va-btn-nav !rounded-[10px] flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
            <VoiceglotText translationKey="admin.focus.refresh" defaultText="Vernieuwen" />
          </ButtonInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="rounded-2xl border border-black/[0.05] bg-white p-4 flex flex-wrap gap-2 items-center">
          <TextInstrument className="text-[11px] tracking-[0.15em] uppercase text-va-black/30 font-semibold mr-2">
            Per world
          </TextInstrument>
          <ButtonInstrument
            onClick={() => setWorld("all")}
            className={`px-3 py-2 rounded-xl text-[13px] ${!activeWorld ? "bg-va-black text-white" : "bg-va-off-white text-va-black/60"}`}
          >
            Global
          </ButtonInstrument>
          {!worldLoading &&
            allWorlds.map((world) => (
              <ButtonInstrument
                key={world.id}
                onClick={() => setWorld(world.code)}
                className={`px-3 py-2 rounded-xl text-[13px] ${
                  activeWorld?.id === world.id ? "bg-va-black text-white" : "bg-va-off-white text-va-black/60"
                }`}
              >
                {world.label}
              </ButtonInstrument>
            ))}
          <ContainerInstrument className="ml-auto">
            <TextInstrument className="text-[12px] text-va-black/40">Context: {overview.world.label}</TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="rounded-2xl border border-black/[0.05] bg-white p-4">
          <TextInstrument className="text-[11px] tracking-[0.15em] uppercase text-va-black/30 font-semibold mb-3">
            Toegangspagina&apos;s
          </TextInstrument>
          <ContainerInstrument className="flex flex-wrap gap-2">
            {visiblePages.slice(0, 14).map((page) => (
              <Link key={page.id} href={page.href} className="block">
                <ContainerInstrument className="px-3 py-2 rounded-xl bg-va-off-white hover:bg-primary/10 transition-colors">
                  <TextInstrument className="text-[12px] font-medium text-va-black/70">{page.title}</TextInstrument>
                </ContainerInstrument>
              </Link>
            ))}
            {visiblePages.length === 0 && (
              <ContainerInstrument className="px-3 py-2 rounded-xl bg-va-off-white">
                <TextInstrument className="text-[12px] text-va-black/40">Geen toegangen beschikbaar.</TextInstrument>
              </ContainerInstrument>
            )}
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {errorMessage && (
        <ContainerInstrument className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-amber-200 bg-amber-50">
          <ContainerInstrument className="flex items-center gap-3 text-amber-800">
            <Bell size={16} />
            <TextInstrument className="text-sm font-medium">{errorMessage}</TextInstrument>
          </ContainerInstrument>
          <ButtonInstrument
            onClick={fetchData}
            className="px-4 py-2 rounded-xl bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors"
          >
            Opnieuw laden
          </ButtonInstrument>
        </ContainerInstrument>
      )}

      <SectionInstrument className="space-y-5">
        <ContainerInstrument className="flex items-center justify-between">
          <HeadingInstrument level={2} className="text-2xl font-light tracking-tight">
            Prioriteiten
          </HeadingInstrument>
          <TextInstrument className="text-[13px] text-va-black/40 tracking-widest">
            Eerst opvolging, dan configuratie
          </TextInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {primaryCards.map((card) => (
            <ContainerInstrument
              key={card.title}
              className="relative rounded-2xl border border-black/[0.05] bg-white p-6 hover:border-primary/20 transition-colors"
            >
              <Link href={card.href} className="absolute inset-0 z-10" />
              <ContainerInstrument className="flex items-start justify-between mb-4">
                <ContainerInstrument>
                  <TextInstrument className="text-[12px] tracking-widest uppercase text-va-black/30">{card.title}</TextInstrument>
                  <HeadingInstrument level={3} className="text-4xl font-light mt-2">
                    {loading ? "..." : card.value ?? "-"}
                  </HeadingInstrument>
                </ContainerInstrument>
                <ArrowRight size={16} className="text-va-black/30" />
              </ContainerInstrument>
              <TextInstrument className="text-[14px] text-va-black/50 font-medium">{card.description}</TextInstrument>
            </ContainerInstrument>
          ))}
        </ContainerInstrument>
      </SectionInstrument>

      <SectionInstrument className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ContainerInstrument className="xl:col-span-2 rounded-2xl border border-black/[0.05] bg-white p-6 space-y-5">
          <ContainerInstrument className="flex items-center justify-between">
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight">
              Financieel overzicht
            </HeadingInstrument>
            <ButtonInstrument as={Link} href="/admin/finance" className="text-[13px] font-semibold tracking-widest text-primary">
              Detail
            </ButtonInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ContainerInstrument className="rounded-xl bg-va-off-white p-4">
              <TextInstrument className="text-[11px] tracking-[0.15em] uppercase text-va-black/30">Opbrengst</TextInstrument>
              <HeadingInstrument level={3} className="text-2xl font-light mt-2">
                {formatCurrency(overview.finance.revenue)}
              </HeadingInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="rounded-xl bg-va-off-white p-4">
              <TextInstrument className="text-[11px] tracking-[0.15em] uppercase text-va-black/30">Kosten</TextInstrument>
              <HeadingInstrument level={3} className="text-2xl font-light mt-2">
                {formatCurrency(overview.finance.costs)}
              </HeadingInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="rounded-xl bg-va-black text-white p-4">
              <TextInstrument className="text-[11px] tracking-[0.15em] uppercase text-white/40">Netto</TextInstrument>
              <HeadingInstrument level={3} className="text-2xl font-light mt-2">
                {formatCurrency(overview.finance.net)}
              </HeadingInstrument>
              <TextInstrument className="text-[12px] text-white/40 mt-1">
                Marge {overview.finance.margin_percentage.toFixed(1)}%
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="space-y-2">
            <TextInstrument className="text-[12px] tracking-[0.15em] uppercase text-va-black/30">
              Opbrengst en kosten op datum
            </TextInstrument>
            {overview.finance.recent_entries.slice(0, 8).map((entry) => (
              <ContainerInstrument
                key={entry.id}
                className="grid grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-3 rounded-xl border border-black/[0.04] p-3 items-center"
              >
                <TextInstrument className="text-[13px] text-va-black/70">{formatDateTime(entry.created_at)}</TextInstrument>
                <TextInstrument className="text-[13px] text-va-black/50">{resolveJourneyLabel(entry.journey)}</TextInstrument>
                <TextInstrument className="text-[13px] text-va-black">{formatCurrency(Number(entry.total || 0))}</TextInstrument>
                <TextInstrument className="text-[13px] text-va-black/60">
                  {entry.total_cost === null ? "-" : formatCurrency(Number(entry.total_cost))}
                </TextInstrument>
                <TextInstrument className="text-[11px] uppercase tracking-widest text-va-black/30">{entry.status}</TextInstrument>
              </ContainerInstrument>
            ))}
            {overview.finance.recent_entries.length === 0 && (
              <ContainerInstrument className="rounded-xl border border-dashed border-black/[0.1] p-6 text-center">
                <TextInstrument className="text-[13px] text-va-black/40">Nog geen recente financiële entries.</TextInstrument>
              </ContainerInstrument>
            )}
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="rounded-2xl border border-black/[0.05] bg-white p-6 space-y-4">
          <HeadingInstrument level={2} className="text-xl font-light tracking-tight">
            Recente activiteit
          </HeadingInstrument>
          {loading ? (
            <ContainerInstrument className="p-8 text-center">
              <Loader2 className="animate-spin mx-auto text-primary/30" size={24} />
            </ContainerInstrument>
          ) : (
            <ContainerInstrument className="space-y-2">
              {overview.activity.slice(0, 6).map((item) => (
                <Link key={item.id} href={resolveActivityHref(item)} className="block">
                  <ContainerInstrument className="rounded-xl border border-black/[0.04] p-3 hover:border-primary/20 transition-colors">
                    <ContainerInstrument className="flex items-center justify-between gap-2">
                      <TextInstrument className="text-[13px] font-medium text-va-black">{item.message}</TextInstrument>
                      <TextInstrument className="text-[11px] uppercase tracking-widest text-va-black/30">{item.source}</TextInstrument>
                    </ContainerInstrument>
                    <TextInstrument className="text-[12px] text-va-black/40 mt-1">{formatDateTime(item.created_at)}</TextInstrument>
                  </ContainerInstrument>
                </Link>
              ))}
              {overview.activity.length === 0 && (
                <ContainerInstrument className="rounded-xl border border-dashed border-black/[0.1] p-4 text-center">
                  <TextInstrument className="text-[13px] text-va-black/40">Geen recente activiteit.</TextInstrument>
                </ContainerInstrument>
              )}
            </ContainerInstrument>
          )}
        </ContainerInstrument>
      </SectionInstrument>

      <SectionInstrument className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ContainerInstrument className="rounded-2xl border border-black/[0.05] bg-white p-6 space-y-4">
          <HeadingInstrument level={2} className="text-xl font-light tracking-tight">
            Snel naar kernbeheer
          </HeadingInstrument>
          <ContainerInstrument className="space-y-2">
            {quickLinks.map((item) => (
              <Link key={item.id} href={item.href} className="block">
                <ContainerInstrument className="rounded-xl border border-black/[0.04] p-3 hover:border-primary/20 transition-colors">
                  <ContainerInstrument className="flex items-center justify-between gap-3">
                    <ContainerInstrument>
                      <TextInstrument className="text-[14px] font-medium text-va-black">{item.title}</TextInstrument>
                      <TextInstrument className="text-[12px] text-va-black/40">{item.subtitle}</TextInstrument>
                    </ContainerInstrument>
                    <ContainerInstrument className="flex items-center gap-3">
                      {typeof item.count === "number" && item.count > 0 && (
                        <ContainerInstrument className="min-w-6 px-2 py-1 rounded-lg bg-primary/10">
                          <TextInstrument className="text-[11px] text-primary font-semibold text-center">{item.count}</TextInstrument>
                        </ContainerInstrument>
                      )}
                      <ArrowRight size={14} className="text-va-black/30" />
                    </ContainerInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              </Link>
            ))}
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="rounded-2xl border border-black/[0.05] bg-white p-6 space-y-4">
          <ContainerInstrument className="flex items-center gap-2">
            <FolderCog size={16} className="text-va-black/50" />
            <HeadingInstrument level={2} className="text-xl font-light tracking-tight">
              Minder prioritaire instellingen
            </HeadingInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="space-y-2">
            {lowPriorityLinks.map((item) => (
              <Link key={item.id} href={item.href} className="block">
                <ContainerInstrument className="rounded-xl border border-black/[0.04] p-3 hover:border-primary/20 transition-colors">
                  <ContainerInstrument className="flex items-center justify-between gap-3">
                    <ContainerInstrument>
                      <TextInstrument className="text-[14px] font-medium text-va-black">{item.title}</TextInstrument>
                      <TextInstrument className="text-[12px] text-va-black/40">{item.subtitle}</TextInstrument>
                    </ContainerInstrument>
                    <ArrowRight size={14} className="text-va-black/30" />
                  </ContainerInstrument>
                </ContainerInstrument>
              </Link>
            ))}
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <SectionInstrument className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ContainerInstrument className="rounded-xl border border-black/[0.05] p-4 bg-white flex items-center gap-3">
          <Wallet size={16} className="text-primary" />
          <ContainerInstrument>
            <TextInstrument className="text-[11px] uppercase tracking-widest text-va-black/30">Netto</TextInstrument>
            <TextInstrument className="text-[15px] font-medium">{formatCurrency(overview.finance.net)}</TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="rounded-xl border border-black/[0.05] p-4 bg-white flex items-center gap-3">
          <Calendar size={16} className="text-primary" />
          <ContainerInstrument>
            <TextInstrument className="text-[11px] uppercase tracking-widest text-va-black/30">Laatste update</TextInstrument>
            <TextInstrument className="text-[15px] font-medium">
              {overview.generated_at ? formatDateTime(overview.generated_at) : "--"}
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="rounded-xl border border-black/[0.05] p-4 bg-white flex items-center gap-3">
          <Building2 size={16} className="text-primary" />
          <ContainerInstrument>
            <TextInstrument className="text-[11px] uppercase tracking-widest text-va-black/30">Actieve context</TextInstrument>
            <TextInstrument className="text-[15px] font-medium">{overview.world.label}</TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AdminDashboard",
            name: "Voices Admin One-Glance Dashboard",
            description: "Prioriteitsgestuurd beheer met focus op opvolging, financiën en world-context.",
          }),
        }}
      />
    </PageWrapperInstrument>
  );
}
