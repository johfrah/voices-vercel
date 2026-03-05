"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  FolderClock,
  Loader2,
  Mail,
  RefreshCw,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  ButtonInstrument,
  ContainerInstrument,
  HeadingInstrument,
  PageWrapperInstrument,
  SectionInstrument,
  TextInstrument,
} from "@/components/ui/LayoutInstruments";

type MobileTab = "orders" | "approvals" | "mailbox" | "activity";

interface DashboardActivity {
  id: string;
  message: string;
  source: string;
  level: string;
  created_at: string;
}

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
  activity: DashboardActivity[];
  generated_at: string;
}

interface MobileOrder {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  date: string;
  customer: {
    name: string;
    email: string;
    company: string | null;
  } | null;
}

interface ApprovalPayload {
  subject?: string | null;
  title?: string | null;
}

interface ApprovalItem {
  id: number;
  type?: string | null;
  priority?: string | null;
  reasoning?: string | null;
  payload?: ApprovalPayload | null;
  createdAt?: string | null;
  created_at?: string | null;
}

interface InboxMail {
  id: string;
  sender: string;
  subject: string;
  preview?: string;
  date: string;
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
  activity: [],
  generated_at: "",
};

const TAB_DEFINITIONS: Array<{ key: MobileTab; label: string; icon: LucideIcon }> = [
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "approvals", label: "Approvals", icon: FileCheck2 },
  { key: "mailbox", label: "Mailbox", icon: Mail },
  { key: "activity", label: "Activity", icon: FolderClock },
];

export function AdminMobileOpsPage() {
  const [overview, setOverview] = useState<OverviewResponse>(EMPTY_OVERVIEW);
  const [orders, setOrders] = useState<MobileOrder[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [mails, setMails] = useState<InboxMail[]>([]);
  const [activeTab, setActiveTab] = useState<MobileTab>("orders");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionBusyKey, setActionBusyKey] = useState<string>("");
  const [error, setError] = useState<string>("");

  const refreshAll = useCallback(async (showLoader: boolean) => {
    if (showLoader) setIsLoading(true);
    setIsRefreshing(true);
    setError("");

    try {
      const [overviewResult, ordersResult, approvalsResult, mailsResult] = await Promise.allSettled([
        fetch("/api/admin/dashboard/overview?world=all", { cache: "no-store" }),
        fetch("/api/admin/orders?page=1&limit=12", { cache: "no-store" }),
        fetch("/api/admin/approvals", { cache: "no-store" }),
        fetch("/api/mailbox/inbox?limit=8&offset=0&folder=INBOX&account=all", { cache: "no-store" }),
      ]);

      if (overviewResult.status === "fulfilled" && overviewResult.value.ok) {
        const data = (await overviewResult.value.json()) as OverviewResponse;
        setOverview({
          ...EMPTY_OVERVIEW,
          ...data,
          activity: Array.isArray(data.activity) ? data.activity : [],
        });
      } else {
        setOverview(EMPTY_OVERVIEW);
      }

      if (ordersResult.status === "fulfilled" && ordersResult.value.ok) {
        const data = await ordersResult.value.json();
        setOrders(Array.isArray(data.orders) ? (data.orders as MobileOrder[]) : []);
      } else {
        setOrders([]);
      }

      if (approvalsResult.status === "fulfilled" && approvalsResult.value.ok) {
        const data = await approvalsResult.value.json();
        setApprovals(Array.isArray(data) ? (data as ApprovalItem[]) : []);
      } else {
        setApprovals([]);
      }

      if (mailsResult.status === "fulfilled" && mailsResult.value.ok) {
        const data = await mailsResult.value.json();
        setMails(Array.isArray(data.mails) ? (data.mails as InboxMail[]) : []);
      } else {
        setMails([]);
      }

      const failedCount = [overviewResult, ordersResult, approvalsResult, mailsResult].filter(
        (result) => result.status === "rejected" || (result.status === "fulfilled" && !result.value.ok)
      ).length;
      if (failedCount > 0) {
        setError("Een deel van de mobiele opvolging kon niet laden. Vernieuw opnieuw.");
      }
    } catch {
      setOverview(EMPTY_OVERVIEW);
      setOrders([]);
      setApprovals([]);
      setMails([]);
      setError("Live overzicht tijdelijk niet beschikbaar.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refreshAll(true);
    const interval = window.setInterval(() => {
      void refreshAll(false);
    }, 30000);
    return () => window.clearInterval(interval);
  }, [refreshAll]);

  const handleOrderAction = useCallback(async (
    orderId: number,
    action: "request_po" | "mark_in_production" | "mark_delivered"
  ) => {
    const busyKey = `${orderId}-${action}`;
    setActionBusyKey(busyKey);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        throw new Error("order_action_failed");
      }
      await refreshAll(false);
    } catch {
      setError("Actie op bestelling mislukt. Probeer opnieuw.");
    } finally {
      setActionBusyKey("");
    }
  }, [refreshAll]);

  const handleApprovalAction = useCallback(async (approvalId: number, action: "approve" | "reject") => {
    const busyKey = `approval-${approvalId}-${action}`;
    setActionBusyKey(busyKey);
    try {
      const response = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: approvalId, action }),
      });
      if (!response.ok) throw new Error("approval_action_failed");
      await refreshAll(false);
    } catch {
      setError("Approval actie mislukt. Probeer opnieuw.");
    } finally {
      setActionBusyKey("");
    }
  }, [refreshAll]);

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

  const tabContent = useMemo(() => {
    if (activeTab === "orders") {
      return (
        <ContainerInstrument className="space-y-3">
          {orders.length === 0 && (
            <ContainerInstrument className="rounded-xl border border-black/5 dark:border-white/10 p-4">
              <TextInstrument className="text-[13px] text-va-black/60 dark:text-white/70">
                Geen orders om op te volgen.
              </TextInstrument>
            </ContainerInstrument>
          )}
          {orders.map((order) => (
            <ContainerInstrument key={order.id} className="rounded-xl border border-black/5 dark:border-white/10 p-4 space-y-3">
              <ContainerInstrument className="flex items-start justify-between gap-2">
                <ContainerInstrument>
                  <TextInstrument className="text-[12px] uppercase tracking-widest text-va-black/35 dark:text-white/45">
                    Order #{order.orderNumber}
                  </TextInstrument>
                  <TextInstrument className="text-[14px] text-va-black dark:text-white">
                    {order.customer?.name || "Onbekende klant"}
                  </TextInstrument>
                  <TextInstrument className="text-[12px] text-va-black/50 dark:text-white/70">
                    {order.status} • €{Number(order.total || 0).toFixed(2)}
                  </TextInstrument>
                </ContainerInstrument>
                <Link href={`/admin/orders/${order.id}`} className="inline-flex">
                  <ContainerInstrument className="h-8 w-8 rounded-full border border-black/10 dark:border-white/15 flex items-center justify-center">
                    <ExternalLink size={14} className="text-va-black/45 dark:text-white/70" />
                  </ContainerInstrument>
                </Link>
              </ContainerInstrument>
              <ContainerInstrument className="grid grid-cols-3 gap-2">
                <ButtonInstrument
                  disabled={actionBusyKey === `${order.id}-request_po`}
                  onClick={() => handleOrderAction(order.id, "request_po")}
                  className="text-[11px] py-2 rounded-lg bg-va-off-white dark:bg-white/10 text-va-black dark:text-white"
                >
                  {actionBusyKey === `${order.id}-request_po` ? "..." : "PO"}
                </ButtonInstrument>
                <ButtonInstrument
                  disabled={actionBusyKey === `${order.id}-mark_in_production`}
                  onClick={() => handleOrderAction(order.id, "mark_in_production")}
                  className="text-[11px] py-2 rounded-lg bg-primary/10 text-primary"
                >
                  {actionBusyKey === `${order.id}-mark_in_production` ? "..." : "Productie"}
                </ButtonInstrument>
                <ButtonInstrument
                  disabled={actionBusyKey === `${order.id}-mark_delivered`}
                  onClick={() => handleOrderAction(order.id, "mark_delivered")}
                  className="text-[11px] py-2 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400"
                >
                  {actionBusyKey === `${order.id}-mark_delivered` ? "..." : "Geleverd"}
                </ButtonInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          ))}
        </ContainerInstrument>
      );
    }

    if (activeTab === "approvals") {
      return (
        <ContainerInstrument className="space-y-3">
          {approvals.length === 0 && (
            <ContainerInstrument className="rounded-xl border border-black/5 dark:border-white/10 p-4">
              <TextInstrument className="text-[13px] text-va-black/60 dark:text-white/70">
                Geen approvals in wachtrij.
              </TextInstrument>
            </ContainerInstrument>
          )}
          {approvals.map((item) => {
            const createdAt = item.createdAt || item.created_at || "";
            return (
              <ContainerInstrument key={item.id} className="rounded-xl border border-black/5 dark:border-white/10 p-4 space-y-3">
                <ContainerInstrument className="flex items-start justify-between gap-2">
                  <ContainerInstrument>
                    <TextInstrument className="text-[12px] uppercase tracking-widest text-va-black/35 dark:text-white/45">
                      {(item.type || "approval").toString()}
                    </TextInstrument>
                    <TextInstrument className="text-[14px] text-va-black dark:text-white">
                      {item.payload?.subject || item.payload?.title || item.reasoning || "Wachtende goedkeuring"}
                    </TextInstrument>
                    <TextInstrument className="text-[12px] text-va-black/50 dark:text-white/70">
                      {createdAt ? new Date(createdAt).toLocaleString("nl-BE") : "Nu"}
                    </TextInstrument>
                  </ContainerInstrument>
                  <TextInstrument className="text-[11px] uppercase tracking-widest text-primary">
                    {item.priority || "normal"}
                  </TextInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="grid grid-cols-2 gap-2">
                  <ButtonInstrument
                    disabled={actionBusyKey === `approval-${item.id}-approve`}
                    onClick={() => handleApprovalAction(item.id, "approve")}
                    className="text-[11px] py-2 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400"
                  >
                    {actionBusyKey === `approval-${item.id}-approve` ? "..." : "Goedkeuren"}
                  </ButtonInstrument>
                  <ButtonInstrument
                    disabled={actionBusyKey === `approval-${item.id}-reject`}
                    onClick={() => handleApprovalAction(item.id, "reject")}
                    className="text-[11px] py-2 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400"
                  >
                    {actionBusyKey === `approval-${item.id}-reject` ? "..." : "Weigeren"}
                  </ButtonInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            );
          })}
        </ContainerInstrument>
      );
    }

    if (activeTab === "mailbox") {
      return (
        <ContainerInstrument className="space-y-3">
          {mails.length === 0 && (
            <ContainerInstrument className="rounded-xl border border-black/5 dark:border-white/10 p-4">
              <TextInstrument className="text-[13px] text-va-black/60 dark:text-white/70">
                Geen recente mails gevonden.
              </TextInstrument>
            </ContainerInstrument>
          )}
          {mails.map((mail) => (
            <ContainerInstrument key={mail.id} className="rounded-xl border border-black/5 dark:border-white/10 p-4 space-y-2">
              <TextInstrument className="text-[12px] uppercase tracking-widest text-va-black/35 dark:text-white/45">
                {mail.sender}
              </TextInstrument>
              <TextInstrument className="text-[14px] text-va-black dark:text-white">
                {mail.subject || "(zonder onderwerp)"}
              </TextInstrument>
              <TextInstrument className="text-[12px] text-va-black/50 dark:text-white/70">
                {mail.preview || "Open mailbox voor volledige inhoud."}
              </TextInstrument>
            </ContainerInstrument>
          ))}
          <Link href="/admin/mailbox" className="block">
            <ContainerInstrument className="rounded-xl bg-va-black text-white p-3 flex items-center justify-center gap-2">
              <Mail size={14} />
              <TextInstrument className="text-[12px] uppercase tracking-widest">Open volledige mailbox</TextInstrument>
            </ContainerInstrument>
          </Link>
        </ContainerInstrument>
      );
    }

    return (
      <ContainerInstrument className="space-y-3">
        {overview.activity.length === 0 && (
          <ContainerInstrument className="rounded-xl border border-black/5 dark:border-white/10 p-4">
            <TextInstrument className="text-[13px] text-va-black/60 dark:text-white/70">
              Geen recente activity.
            </TextInstrument>
          </ContainerInstrument>
        )}
        {overview.activity.map((item) => (
          <ContainerInstrument key={item.id} className="rounded-xl border border-black/5 dark:border-white/10 p-4 space-y-1">
            <TextInstrument className="text-[14px] text-va-black dark:text-white">{item.message}</TextInstrument>
            <TextInstrument className="text-[12px] text-va-black/50 dark:text-white/70">
              {item.source} • {new Date(item.created_at).toLocaleString("nl-BE")}
            </TextInstrument>
          </ContainerInstrument>
        ))}
      </ContainerInstrument>
    );
  }, [activeTab, actionBusyKey, approvals, mails, orders, overview.activity, handleApprovalAction, handleOrderAction]);

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white dark:bg-va-black pb-28">
      <SectionInstrument className="px-4 pt-20 space-y-5">
        <ContainerInstrument className="rounded-3xl bg-white border border-black/5 dark:bg-white/10 dark:border-white/10 p-5">
          <ContainerInstrument className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-2">
            <Sparkles size={14} />
            <TextInstrument className="text-[11px] font-semibold tracking-widest uppercase">
              Admin mobile
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="flex items-center justify-between gap-3">
            <ContainerInstrument>
              <HeadingInstrument level={1} className="text-3xl font-light tracking-tight text-va-black dark:text-white">
                Mobile backend opvolging
              </HeadingInstrument>
              <TextInstrument className="mt-2 text-[14px] text-va-black/60 dark:text-white/70">
                Volg orders, approvals, mailbox en activity direct vanaf je telefoon.
              </TextInstrument>
            </ContainerInstrument>
            <ButtonInstrument
              onClick={() => void refreshAll(false)}
              className="h-10 w-10 rounded-full border border-black/10 dark:border-white/20 flex items-center justify-center"
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin text-primary" : "text-va-black/60 dark:text-white/70"} />
            </ButtonInstrument>
          </ContainerInstrument>
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
            Directe opvolging
          </HeadingInstrument>
          <ContainerInstrument className="grid grid-cols-2 gap-2">
            {TAB_DEFINITIONS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <ButtonInstrument
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg py-2 px-2 text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 ${
                    active
                      ? "bg-va-black text-white dark:bg-white dark:text-va-black"
                      : "bg-va-off-white text-va-black/70 dark:bg-white/10 dark:text-white/80"
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}
                </ButtonInstrument>
              );
            })}
          </ContainerInstrument>
          {tabContent}
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
          <Link href="/admin/dashboard" className="block">
            <ContainerInstrument className="rounded-xl border border-black/5 dark:border-white/10 p-3 flex items-center justify-between">
              <TextInstrument className="text-[14px] text-va-black dark:text-white">Volledig admin dashboard</TextInstrument>
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

        <ContainerInstrument className="rounded-2xl bg-white border border-black/5 dark:bg-white/10 dark:border-white/10 p-4">
          <ContainerInstrument className="flex items-center gap-2">
            <Clock3 size={14} className="text-primary" />
            <TextInstrument className="text-[12px] text-va-black/60 dark:text-white/70">
              Deze mobiele cockpit ververst elke 30 seconden automatisch.
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
