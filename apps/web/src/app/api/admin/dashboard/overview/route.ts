import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/api-auth";

export const dynamic = "force-dynamic";

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

function parseAmount(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pathHintForWorld(worldCode: string | null): string | null {
  if (!worldCode) return null;
  const code = worldCode.toUpperCase();
  const hints: Record<string, string> = {
    STUDIO: "/studio/",
    ACADEMY: "/academy/",
    ADEMING: "/ademing/",
    AGENCY: "/agency/",
    PARTNER: "/partners/",
    JOHFRAI: "/johfrai/",
    ARTIST: "/artist/",
  };
  return hints[code] ?? null;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { searchParams } = new URL(request.url);
  const requestedWorldCode = searchParams.get("world");

  let selectedWorldId: number | null = null;
  let selectedWorldLabel: string | null = null;

  if (requestedWorldCode && requestedWorldCode !== "all") {
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
    const recentOrders = (recentOrdersData || []) as FinanceEntry[];
    recentFinance = recentOrders;

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
    let approvalsQuery = supabase
      .from("approval_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    let activityQuery = supabase
      .from("system_events")
      .select("id, message, source, level, created_at")
      .order("created_at", { ascending: false })
      .limit(8);

    let mails24hQuery = supabase
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

    let actorsQuery = supabase
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

    if (requestedWorldCode && requestedWorldCode.toUpperCase() !== "STUDIO") {
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

  const netRevenue = completedRevenue - completedCosts;
  const marginPercentage = completedRevenue > 0 ? (netRevenue / completedRevenue) * 100 : 0;

  return NextResponse.json({
    world: {
      id: selectedWorldId,
      code: requestedWorldCode || "all",
      label: selectedWorldLabel || "Global View",
    },
    actions: {
      pending_orders: pendingOrdersCount,
      processing_orders: processingOrdersCount,
      pending_approvals: pendingApprovalsCount,
      pending_interests: pendingInterestsCount,
      new_mails_24h: newMails24hCount,
      live_actors: liveActorsCount,
      upcoming_studio_editions: upcomingStudioEditionsCount,
    },
    finance: {
      revenue: completedRevenue,
      costs: completedCosts,
      net: netRevenue,
      margin_percentage: marginPercentage,
      recent_entries: recentFinance,
    },
    activity: recentActivity,
    generated_at: new Date().toISOString(),
  });
}
