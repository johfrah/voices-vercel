import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/api-auth";

export const dynamic = "force-dynamic";

type DashboardBucket = "priority" | "quick" | "settings";

interface FinanceEntry {
  id: number;
  created_at: string;
  total: number;
  total_cost: number | null;
  status: string;
  journey: string | null;
}

interface ActivityEntry {
  id: string;
  message: string;
  source: string;
  level: string;
  created_at: string;
}

interface ActionCounters {
  pending_orders: number;
  processing_orders: number;
  pending_approvals: number;
  pending_interests: number;
  new_mails_24h: number;
  live_actors: number;
  upcoming_studio_editions: number;
}

interface DashboardLayoutConfig {
  hidden_ids?: string[];
  order_overrides?: Record<string, number>;
  labels?: Record<string, { title?: string; subtitle?: string }>;
}

interface AccessItemDefinition {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  bucket: DashboardBucket;
  order: number;
  world_scopes: string[];
}

interface AccessItemResponse {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  bucket: DashboardBucket;
  order: number;
  count: number | null;
}

const ACCESS_ITEM_DEFINITIONS: AccessItemDefinition[] = [
  {
    id: "orders",
    title: "Bestellingen",
    subtitle: "Order-opvolging",
    href: "/admin/orders",
    bucket: "priority",
    order: 20,
    world_scopes: ["all"],
  },
  {
    id: "studio_interest",
    title: "Studio interesse",
    subtitle: "Interesseformulieren opvolgen",
    href: "/admin/funnel",
    bucket: "priority",
    order: 10,
    world_scopes: ["all", "studio"],
  },
  {
    id: "approvals",
    title: "Wachtende acties",
    subtitle: "Goedkeuringen in wachtrij",
    href: "/admin/approvals",
    bucket: "priority",
    order: 30,
    world_scopes: ["all"],
  },
  {
    id: "mailbox",
    title: "Mailbox",
    subtitle: "Nieuwe mails (24u)",
    href: "/admin/mailbox",
    bucket: "priority",
    order: 40,
    world_scopes: ["all"],
  },
  {
    id: "studio_editions",
    title: "Studio inschrijvingen",
    subtitle: "Aankomende edities",
    href: "/admin/studio/inschrijvingen",
    bucket: "priority",
    order: 15,
    world_scopes: ["all", "studio"],
  },
  {
    id: "live_voices",
    title: "Live stemmen",
    subtitle: "Publieke acteurs beschikbaar",
    href: "/admin/voices",
    bucket: "priority",
    order: 50,
    world_scopes: ["all"],
  },
  {
    id: "orders_quick",
    title: "Bestellingen",
    subtitle: "Order-opvolging",
    href: "/admin/orders",
    bucket: "quick",
    order: 10,
    world_scopes: ["all"],
  },
  {
    id: "mailbox_quick",
    title: "Mailbox",
    subtitle: "Klantcontact",
    href: "/admin/mailbox",
    bucket: "quick",
    order: 20,
    world_scopes: ["all"],
  },
  {
    id: "studio_interest_quick",
    title: "Studio leads",
    subtitle: "Interesseformulieren",
    href: "/admin/funnel",
    bucket: "quick",
    order: 30,
    world_scopes: ["all", "studio"],
  },
  {
    id: "studio_editions_quick",
    title: "Studio inschrijvingen",
    subtitle: "Deelnemers",
    href: "/admin/studio/inschrijvingen",
    bucket: "quick",
    order: 40,
    world_scopes: ["all", "studio"],
  },
  {
    id: "finance_quick",
    title: "Financiën",
    subtitle: "Opbrengst en kosten",
    href: "/admin/finance",
    bucket: "quick",
    order: 50,
    world_scopes: ["all"],
  },
  {
    id: "users_quick",
    title: "Gebruikers",
    subtitle: "Accounts en toegang",
    href: "/admin/users",
    bucket: "quick",
    order: 60,
    world_scopes: ["all"],
  },
  {
    id: "settings_site",
    title: "Instellingen",
    subtitle: "Bedrijf en markten",
    href: "/admin/settings",
    bucket: "settings",
    order: 10,
    world_scopes: ["all"],
  },
  {
    id: "settings_navigation",
    title: "Navigatie",
    subtitle: "Menu en structuur",
    href: "/admin/navigation",
    bucket: "settings",
    order: 20,
    world_scopes: ["all"],
  },
  {
    id: "settings_logs",
    title: "System logs",
    subtitle: "Foutopsporing",
    href: "/admin/system/logs",
    bucket: "settings",
    order: 30,
    world_scopes: ["all"],
  },
  {
    id: "settings_ai",
    title: "AI instellingen",
    subtitle: "Assistentconfiguratie",
    href: "/admin/ai-settings",
    bucket: "settings",
    order: 40,
    world_scopes: ["all"],
  },
];

function parseAmount(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pathHintForWorld(worldCode: string | null): string | null {
  if (!worldCode || worldCode === "all") return null;

  const code = worldCode.toUpperCase();
  const hints: Record<string, string> = {
    STUDIO: "/studio/",
    ACADEMY: "/academy/",
    ADEMING: "/ademing/",
    AGENCY: "/agency/",
    PARTNER: "/partners/",
    JOHFRAI: "/johfrai/",
    ARTIST: "/artist/",
    PORTFOLIO: "/portfolio/",
    FREELANCE: "/freelance/",
  };

  return hints[code] ?? null;
}

function countForItem(itemId: string, actions: ActionCounters): number | null {
  const map: Record<string, number> = {
    orders: actions.pending_orders + actions.processing_orders,
    studio_interest: actions.pending_interests,
    approvals: actions.pending_approvals,
    mailbox: actions.new_mails_24h,
    studio_editions: actions.upcoming_studio_editions,
    live_voices: actions.live_actors,
    orders_quick: actions.pending_orders + actions.processing_orders,
    mailbox_quick: actions.new_mails_24h,
    studio_interest_quick: actions.pending_interests,
    studio_editions_quick: actions.upcoming_studio_editions,
    finance_quick: 0,
    users_quick: 0,
    settings_site: 0,
    settings_navigation: 0,
    settings_logs: 0,
    settings_ai: 0,
  };

  if (!(itemId in map)) return null;
  return map[itemId];
}

function isVisibleForWorld(scopes: string[], worldCode: string): boolean {
  if (scopes.includes("all")) return true;
  if (worldCode === "all") return true;
  return scopes.includes(worldCode);
}

function applyLayoutConfig(
  item: AccessItemDefinition,
  layoutConfig: DashboardLayoutConfig
): AccessItemDefinition {
  const labelOverride = layoutConfig.labels?.[item.id];
  const orderOverride = layoutConfig.order_overrides?.[item.id];

  return {
    ...item,
    title: labelOverride?.title || item.title,
    subtitle: labelOverride?.subtitle || item.subtitle,
    order: typeof orderOverride === "number" ? orderOverride : item.order,
  };
}

function buildAccessItems(
  requestedWorldCode: string,
  actions: ActionCounters,
  layoutConfig: DashboardLayoutConfig
) {
  const hiddenIds = new Set(layoutConfig.hidden_ids || []);

  const allItems: AccessItemResponse[] = ACCESS_ITEM_DEFINITIONS.map((base) =>
    applyLayoutConfig(base, layoutConfig)
  )
    .filter((item) => !hiddenIds.has(item.id))
    .filter((item) => isVisibleForWorld(item.world_scopes, requestedWorldCode))
    .map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      href: item.href,
      bucket: item.bucket,
      order: item.order,
      count: countForItem(item.id, actions),
    }));

  const priorityItems = allItems
    .filter((item) => item.bucket === "priority")
    .sort((a, b) => {
      const countA = a.count ?? -1;
      const countB = b.count ?? -1;
      if (countA !== countB) return countB - countA;
      return a.order - b.order;
    });

  const quickItems = allItems
    .filter((item) => item.bucket === "quick")
    .sort((a, b) => a.order - b.order);

  const settingsItems = allItems
    .filter((item) => item.bucket === "settings")
    .sort((a, b) => a.order - b.order);

  const visiblePages = allItems
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      id: item.id,
      title: item.title,
      href: item.href,
      bucket: item.bucket,
    }));

  return {
    priority_items: priorityItems,
    quick_items: quickItems,
    settings_items: settingsItems,
    visible_pages: visiblePages,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { searchParams } = new URL(request.url);
  const requestedWorldCode = (searchParams.get("world") || "all").toLowerCase();

  let selectedWorldId: number | null = null;
  let selectedWorldLabel: string | null = null;

  if (requestedWorldCode !== "all") {
    const { data: worldData } = await supabase
      .from("worlds")
      .select("id, code, label")
      .eq("code", requestedWorldCode)
      .maybeSingle();

    if (worldData) {
      selectedWorldId = worldData.id;
      selectedWorldLabel = worldData.label || worldData.code;
    }
  }

  let layoutConfig: DashboardLayoutConfig = {};
  try {
    const { data: layoutRow } = await supabase
      .from("app_configs")
      .select("value")
      .eq("key", "admin_dashboard_layout_v2")
      .maybeSingle();

    if (layoutRow?.value && typeof layoutRow.value === "object") {
      layoutConfig = layoutRow.value as DashboardLayoutConfig;
    }
  } catch (error) {
    console.warn("[Admin Dashboard Overview] Layout config fetch failed:", error);
  }

  // Orders snapshot (sorted by date desc)
  let recentFinance: FinanceEntry[] = [];
  let pendingOrdersCount = 0;
  let processingOrdersCount = 0;
  let completedRevenue = 0;
  let completedCosts = 0;

  try {
    let recentOrdersQuery = supabase
      .from("orders")
      .select("id, created_at, total, total_cost, status, journey")
      .order("created_at", { ascending: false })
      .limit(20);

    if (selectedWorldId) {
      recentOrdersQuery = recentOrdersQuery.eq("world_id", selectedWorldId);
    }

    const { data: recentOrdersData } = await recentOrdersQuery;
    recentFinance = (recentOrdersData || []) as FinanceEntry[];

    let pendingCountQuery = supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    let processingCountQuery = supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "processing");

    let completedOrdersQuery = supabase
      .from("orders")
      .select("total, total_cost")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(500);

    if (selectedWorldId) {
      pendingCountQuery = pendingCountQuery.eq("world_id", selectedWorldId);
      processingCountQuery = processingCountQuery.eq("world_id", selectedWorldId);
      completedOrdersQuery = completedOrdersQuery.eq("world_id", selectedWorldId);
    }

    const [pendingCountResult, processingCountResult, completedRowsResult] = await Promise.all([
      pendingCountQuery,
      processingCountQuery,
      completedOrdersQuery,
    ]);

    pendingOrdersCount = pendingCountResult.count || 0;
    processingOrdersCount = processingCountResult.count || 0;

    const completedRows = completedRowsResult.data || [];
    completedRevenue = completedRows.reduce((sum, row) => sum + parseAmount(row.total), 0);
    completedCosts = completedRows.reduce((sum, row) => sum + parseAmount(row.total_cost), 0);
  } catch (error) {
    console.warn("[Admin Dashboard Overview] Orders snapshot failed:", error);
  }

  // Core counters
  let pendingApprovalsCount = 0;
  let pendingInterestsCount = 0;
  let newMails24hCount = 0;
  let liveActorsCount = 0;
  let upcomingStudioEditionsCount = 0;
  const recentActivity: ActivityEntry[] = [];

  try {
    const approvalsQuery = supabase
      .from("approval_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    const activityQuery = supabase
      .from("system_events")
      .select("id, message, source, level, created_at")
      .order("created_at", { ascending: false })
      .limit(8);

    const mails24hQuery = supabase
      .from("system_events")
      .select("id", { count: "exact", head: true })
      .eq("source", "mail")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const worldPathHint = pathHintForWorld(requestedWorldCode);
    let interestsQuery = supabase
      .from("workshop_interest")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    if (worldPathHint) {
      interestsQuery = interestsQuery.ilike("source_url", `%${worldPathHint}%`);
    }

    const actorsQuery = supabase
      .from("actors")
      .select("id", { count: "exact", head: true })
      .eq("status", "live")
      .eq("is_public", true);

    const studioSince = new Date().toISOString();
    let editionsQuery = supabase
      .from("workshop_editions")
      .select("id", { count: "exact", head: true })
      .gte("date", studioSince)
      .neq("status", "cancelled");

    if (requestedWorldCode !== "all" && requestedWorldCode !== "studio") {
      editionsQuery = editionsQuery.eq("id", -1);
    }

    const [
      approvalsResult,
      interestsResult,
      mailsResult,
      actorsResult,
      editionsResult,
      activityResult,
    ] = await Promise.all([
      approvalsQuery,
      interestsQuery,
      mails24hQuery,
      actorsQuery,
      editionsQuery,
      activityQuery,
    ]);

    pendingApprovalsCount = approvalsResult.count || 0;
    pendingInterestsCount = interestsResult.count || 0;
    newMails24hCount = mailsResult.count || 0;
    liveActorsCount = actorsResult.count || 0;
    upcomingStudioEditionsCount = editionsResult.count || 0;

    for (const log of activityResult.data || []) {
      recentActivity.push({
        id: String(log.id),
        message: String(log.message || "Nieuwe activiteit"),
        source: String(log.source || "system"),
        level: String(log.level || "info"),
        created_at: String(log.created_at || new Date().toISOString()),
      });
    }
  } catch (error) {
    console.warn("[Admin Dashboard Overview] Core counters failed:", error);
  }

  const actions: ActionCounters = {
    pending_orders: pendingOrdersCount,
    processing_orders: processingOrdersCount,
    pending_approvals: pendingApprovalsCount,
    pending_interests: pendingInterestsCount,
    new_mails_24h: newMails24hCount,
    live_actors: liveActorsCount,
    upcoming_studio_editions: upcomingStudioEditionsCount,
  };

  const netRevenue = completedRevenue - completedCosts;
  const marginPercentage = completedRevenue > 0 ? (netRevenue / completedRevenue) * 100 : 0;
  const access = buildAccessItems(requestedWorldCode, actions, layoutConfig);

  return NextResponse.json({
    world: {
      id: selectedWorldId,
      code: requestedWorldCode,
      label: selectedWorldLabel || "Global View",
    },
    actions,
    finance: {
      revenue: completedRevenue,
      costs: completedCosts,
      net: netRevenue,
      margin_percentage: marginPercentage,
      recent_entries: recentFinance,
    },
    activity: recentActivity,
    access,
    generated_at: new Date().toISOString(),
  });
}
