"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Loader2,
  Mail,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import {
  ContainerInstrument,
  HeadingInstrument,
  PageWrapperInstrument,
  SectionInstrument,
  TextInstrument,
} from "@/components/ui/LayoutInstruments";

interface OverviewResponse {
  actions: {
    pending_orders: number;
    processing_orders: number;
    pending_approvals: number;
    pending_interests: number;
    new_mails_24h: number;
    live_actors: number;
    upcoming_studio_editions: number;
  };
  access: {
    quick_items: Array<{
      id: string;
      title: string;
      subtitle: string;
      href: string;
      count: number | null;
    }>;
  };
  generated_at: string;
}

const EMPTY_OVERVIEW: OverviewResponse = {
  actions: {
    pending_orders: 0,
    processing_orders: 0,
    pending_approvals: 0,
    pending_interests: 0,
    new_mails_24h: 0,
    live_actors: 0,
    upcoming_studio_editions: 0,
  },
  access: { quick_items: [] },
  generated_at: "",
};

export default function AdminMobilePage() {
  const [overview, setOverview] = useState<OverviewResponse>(EMPTY_OVERVIEW);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let alive = true;
    const fetchOverview = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("/api/admin/dashboard/overview?world=all", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("overview_fetch_failed");
        const data = (await response.json()) as OverviewResponse;
        if (alive) setOverview(data);
      } catch {
        if (alive) {
          setOverview(EMPTY_OVERVIEW);
          setError("Live overzicht tijdelijk niet beschikbaar.");
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    fetchOverview();
    const interval = window.setInterval(fetchOverview, 30000);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  const primaryCards = useMemo(
    () => [
      {
        label: "Orders actief",
        value: overview.actions.pending_orders + overview.actions.processing_orders,
        href: "/admin/orders",
        icon: ShoppingBag,
      },
      {
        label: "Nieuwe mails 24u",
        value: overview.actions.new_mails_24h,
        href: "/admin/mailbox",
        icon: Mail,
      },
      {
        label: "Wachtende acties",
        value: overview.actions.pending_approvals,
        href: "/admin/approvals",
        icon: CheckCircle2,
      },
      {
        label: "Studio leads",
        value: overview.actions.pending_interests,
        href: "/admin/funnel",
        icon: Bell,
      },
      {
        label: "Live stemmen",
        value: overview.actions.live_actors,
        href: "/admin/voices",
        icon: Users,
      },
      {
        label: "Instellingen",
        value: null,
        href: "/admin/settings",
        icon: Settings,
      },
    ],
    [overview]
  );

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white dark:bg-va-black pb-28">
      <SectionInstrument className="px-4 pt-20 space-y-5">
        <ContainerInstrument className="rounded-3xl bg-white border border-black/5 dark:bg-white/10 dark:border-white/10 p-5">
          <ContainerInstrument className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
            <Sparkles size={14} />
            <TextInstrument className="text-[11px] font-semibold tracking-widest uppercase">
              Admin mobile
            </TextInstrument>
          </ContainerInstrument>
          <HeadingInstrument level={1} className="mt-4 text-3xl font-light tracking-tight text-va-black dark:text-white">
            Alles volgen vanaf je smartphone
          </HeadingInstrument>
          <TextInstrument className="mt-2 text-[14px] text-va-black/60 dark:text-white/70">
            Intuïtief overzicht met directe acties voor orders, login en opvolging.
          </TextInstrument>
          <TextInstrument className="mt-3 text-[11px] uppercase tracking-widest text-va-black/30 dark:text-white/40">
            Laatste update {overview.generated_at ? new Date(overview.generated_at).toLocaleTimeString("nl-BE") : "--:--"}
          </TextInstrument>
        </ContainerInstrument>

        {error && (
          <ContainerInstrument className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <TextInstrument className="text-[13px] text-amber-800">{error}</TextInstrument>
          </ContainerInstrument>
        )}

        <ContainerInstrument className="grid grid-cols-2 gap-3">
          {isLoading ? (
            <ContainerInstrument className="col-span-2 rounded-2xl bg-white border border-black/5 p-6 flex items-center justify-center dark:bg-white/10 dark:border-white/10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </ContainerInstrument>
          ) : (
            primaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.label} href={card.href} className="block">
                  <ContainerInstrument className="rounded-2xl bg-white border border-black/5 dark:bg-white/10 dark:border-white/10 p-4 min-h-[110px]">
                    <ContainerInstrument className="flex items-center justify-between">
                      <Icon size={18} className="text-primary" />
                      <ArrowRight size={14} className="text-va-black/30 dark:text-white/50" />
                    </ContainerInstrument>
                    <HeadingInstrument level={3} className="mt-3 text-2xl font-light text-va-black dark:text-white">
                      {typeof card.value === "number" ? card.value : "Open"}
                    </HeadingInstrument>
                    <TextInstrument className="text-[12px] text-va-black/55 dark:text-white/70">{card.label}</TextInstrument>
                  </ContainerInstrument>
                </Link>
              );
            })
          )}
        </ContainerInstrument>

        <ContainerInstrument className="rounded-2xl bg-white border border-black/5 dark:bg-white/10 dark:border-white/10 p-4 space-y-3">
          <HeadingInstrument level={2} className="text-lg font-light text-va-black dark:text-white">
            Snelle flows
          </HeadingInstrument>
          <Link href="/admin/orders/new" className="block">
            <ContainerInstrument className="rounded-xl border border-black/5 dark:border-white/10 p-3 flex items-center justify-between">
              <TextInstrument className="text-[14px] text-va-black dark:text-white">Nieuwe bestelling starten</TextInstrument>
              <ArrowRight size={14} className="text-va-black/35 dark:text-white/50" />
            </ContainerInstrument>
          </Link>
          <Link href="/account/login?redirect=/account/orders" className="block">
            <ContainerInstrument className="rounded-xl border border-black/5 dark:border-white/10 p-3 flex items-center justify-between">
              <TextInstrument className="text-[14px] text-va-black dark:text-white">Klant loginflow testen</TextInstrument>
              <ArrowRight size={14} className="text-va-black/35 dark:text-white/50" />
            </ContainerInstrument>
          </Link>
          <Link href="/checkout/configurator" className="block">
            <ContainerInstrument className="rounded-xl border border-black/5 dark:border-white/10 p-3 flex items-center justify-between">
              <TextInstrument className="text-[14px] text-va-black dark:text-white">Bestelflow openen</TextInstrument>
              <ArrowRight size={14} className="text-va-black/35 dark:text-white/50" />
            </ContainerInstrument>
          </Link>
        </ContainerInstrument>

        {overview.access.quick_items.length > 0 && (
          <ContainerInstrument className="rounded-2xl bg-white border border-black/5 dark:bg-white/10 dark:border-white/10 p-4 space-y-3">
            <HeadingInstrument level={2} className="text-lg font-light text-va-black dark:text-white">
              Kernbeheer
            </HeadingInstrument>
            {overview.access.quick_items.slice(0, 6).map((item) => (
              <Link key={item.id} href={item.href} className="block">
                <ContainerInstrument className="rounded-xl border border-black/5 dark:border-white/10 p-3 flex items-center justify-between gap-3">
                  <ContainerInstrument>
                    <TextInstrument className="text-[14px] text-va-black dark:text-white">{item.title}</TextInstrument>
                    <TextInstrument className="text-[12px] text-va-black/50 dark:text-white/70">{item.subtitle}</TextInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="flex items-center gap-2">
                    {typeof item.count === "number" && (
                      <ContainerInstrument className="min-w-6 rounded-lg bg-primary/10 px-2 py-1">
                        <TextInstrument className="text-[11px] text-primary text-center font-semibold">{item.count}</TextInstrument>
                      </ContainerInstrument>
                    )}
                    <ArrowRight size={14} className="text-va-black/35 dark:text-white/50" />
                  </ContainerInstrument>
                </ContainerInstrument>
              </Link>
            ))}
          </ContainerInstrument>
        )}
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
