import { db, getTable } from '@/lib/system/voices-config';
const users = getTable('users');
const orders = getTable('orders');
const utmTouchpoints = getTable('utmTouchpoints');
const reviews = getTable('reviews');
import { eq, sql, desc, inArray } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

//  CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 *  UNIFIED CUSTOMER INTELLIGENCE (UCI) SERVICE
 * 
 * Doel: En bron van waarheid creren voor elke klant door alle data-fragmenten
 * (orders, insights, DNA, tracking) te consolideren.
 * 
 * Volgens Master Voices Protocol 2026.
 */

export interface Customer360 {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: {
    name: string | null;
    vatNumber: string | null;
    sector: string | null;
  };
  stats: {
    totalSpent: number;
    orderCount: number;
    averageOrderValue: number;
    lastOrderDate: Date | null;
  };
  orders: any[]; // CHRIS-PROTOCOL: Inclusief order items en metadata
  intelligence: {
    leadVibe: 'cold' | 'warm' | 'hot' | 'burning';
    customerType: string | null;
    journeyState: string | null;
    insights: any;
  };
  dna: {
    preferredLanguages: string[];
    topJourneys: string[];
    attribution: any[];
  };
}

export class UCIService {
  /**
   * Haalt het volledige 360 profiel op van een klant
   */
  static async getCustomer360(identifier: string | number): Promise<Customer360 | null> {
    try {
      // 1. Haal de basis user data op
      let user: any = null;
      let matchedUsers: any[] = [];
      const normalizedEmail = typeof identifier === 'string' ? identifier.trim().toLowerCase() : null;

      const mapSdkUser = (data: any) => ({
        ...data,
        wpUserId: data.wp_user_id,
        first_name: data.first_name,
        last_name: data.last_name,
        companyName: data.company_name,
        companySector: data.company_sector,
        companySize: data.company_size,
        vatNumber: data.vat_number,
        customerType: data.customer_type,
        journeyState: data.journey_state,
        customerInsights: data.customer_insights,
        activityLog: data.activity_log,
        createdAt: data.created_at,
        lastActive: data.last_active,
        approvedFlows: data.approved_flows,
        addressStreet: data.address_street,
        addressZip: data.address_zip,
        addressCity: data.address_city,
        addressCountry: data.address_country,
        is_manually_edited: data.is_manually_edited,
        howHeard: data.how_heard,
        updatedAt: data.updated_at
      });

      try {
        if (typeof identifier === 'number') {
          const [dbUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, identifier))
            .limit(1);
          matchedUsers = dbUser ? [dbUser] : [];
        } else {
          matchedUsers = await db
            .select()
            .from(users)
            .where(sql`lower(${users.email}) = ${normalizedEmail}`)
            .orderBy(desc(users.lastActive), desc(users.createdAt), desc(users.id))
            .limit(25);
        }
      } catch (dbError) {
        console.warn(' UCI Service Drizzle failed, falling back to SDK');
        if (typeof identifier === 'number') {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', identifier)
            .limit(1);
          matchedUsers = (data || []).map(mapSdkUser);
        } else {
          const { data } = await supabase
            .from('users')
            .select('*')
            .ilike('email', normalizedEmail || '')
            .order('last_active', { ascending: false })
            .limit(25);
          matchedUsers = (data || []).map(mapSdkUser);
        }
      }

      if (!matchedUsers.length) return null;

      const roleRank: Record<string, number> = {
        superadmin: 5,
        admin: 4,
        ademing_admin: 4,
        partner: 3,
        customer: 2,
        guest: 1,
      };

      const sortedUsers = [...matchedUsers].sort((a, b) => {
        const roleDiff = (roleRank[b?.role || ''] || 0) - (roleRank[a?.role || ''] || 0);
        if (roleDiff !== 0) return roleDiff;
        const aTs = new Date(a?.lastActive || a?.last_active || a?.updatedAt || a?.updated_at || 0).getTime();
        const bTs = new Date(b?.lastActive || b?.last_active || b?.updatedAt || b?.updated_at || 0).getTime();
        if (aTs !== bTs) return bTs - aTs;
        return Number(b?.id || 0) - Number(a?.id || 0);
      });

      user = sortedUsers[0];
      const userIds = sortedUsers.map((u) => Number(u.id)).filter((id) => Number.isFinite(id));
      if (!userIds.length) return null;

      // 2. Aggregeer order statistieken en haal orders op
      let totalSpent = 0;
      let orderCount = 0;
      let lastOrderDate: Date | null = null;
      let ordersList: any[] = [];
      let touchpoints: any[] = [];

    // 🛡️ CHRIS-PROTOCOL: Parallel execution of heavy queries (Bob-methode)
      try {
        const ordersWhere = userIds.length === 1
          ? eq(orders.user_id, userIds[0])
          : inArray(orders.user_id, userIds);
        const utmWhere = userIds.length === 1
          ? eq(utmTouchpoints.user_id, userIds[0])
          : inArray(utmTouchpoints.user_id, userIds);

        const [ordersResult, utmResult] = await Promise.all([
          // Orders query - Optimized with index-ready userId filter
          db.query.orders.findMany({
            where: ordersWhere,
            with: {
              items: true
            },
            orderBy: [desc(orders.createdAt)],
            limit: 50
          })
            .catch(async (err: any) => {
              console.warn(' UCI Order stats Drizzle failed, falling back to SDK:', err.message);
              let query = supabase.from('orders').select('*');
              query = userIds.length === 1
                ? query.eq('user_id', userIds[0])
                : query.in('user_id', userIds);
              const { data: ordersRows, error: ordersError } = await query.order('created_at', { ascending: false });
              if (ordersError || !ordersRows) {
                console.warn(' UCI SDK orders fetch failed:', ordersError?.message);
                return [];
              }

              const orderIds = ordersRows.map((o: any) => o.id).filter((id: any) => id != null);
              if (orderIds.length === 0) {
                return ordersRows.map((o: any) => ({ ...o, items: [] }));
              }

              const { data: itemRows, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .in('order_id', orderIds);

              if (itemsError) {
                console.warn(' UCI SDK order_items fetch failed:', itemsError.message);
              }

              const itemsByOrderId = new Map<number, any[]>();
              for (const item of itemRows || []) {
                const list = itemsByOrderId.get(item.order_id) || [];
                list.push(item);
                itemsByOrderId.set(item.order_id, list);
              }

              return ordersRows.map((o: any) => ({
                ...o,
                items: itemsByOrderId.get(o.id) || []
              }));
            }),
          // UTM query - Optimized with index-ready userId filter
          db
            .select()
            .from(utmTouchpoints)
            .where(utmWhere)
            .orderBy(desc(utmTouchpoints.createdAt))
            .limit(10)
            .catch(async (err: any) => {
              console.warn(' UCI UTM Drizzle failed, falling back to SDK:', err.message);
              let query = supabase.from('utm_touchpoints').select('*');
              query = userIds.length === 1
                ? query.eq('user_id', userIds[0])
                : query.in('user_id', userIds);
              const { data } = await query.order('created_at', { ascending: false }).limit(10);
              return data || [];
            })
        ]);

        ordersList = ordersResult.map((o: any) => ({
          ...o,
          orderItems: o.items // Map 'items' from Drizzle to 'orderItems' for frontend
        }));
        touchpoints = utmResult;

        totalSpent = ordersList.reduce((acc, o) => acc + Number(o.total || 0), 0);
        orderCount = ordersList.length;
        if (ordersList.length > 0) {
          lastOrderDate = new Date(ordersList[0].createdAt || ordersList[0].created_at);
        }
      } catch (parallelError) {
        console.error(' UCI Parallel queries failed:', parallelError);
      }

      // 4. Bereken de "Lead Vibe" (Core Logic)
      const leadVibe = this.calculateLeadVibe(totalSpent, orderCount, touchpoints.length);

      return {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        company: {
          name: user.companyName,
          vatNumber: user.vatNumber,
          sector: user.companySector,
        },
        stats: {
          totalSpent,
          orderCount,
          averageOrderValue: orderCount > 0 ? totalSpent / orderCount : 0,
          lastOrderDate,
        },
        orders: ordersList,
        intelligence: {
          leadVibe,
          customerType: user.customerType,
          journeyState: user.journeyState,
          insights: user.customerInsights,
        },
        dna: {
          preferredLanguages: (user.preferences as any)?.languages || [],
          topJourneys: Array.from(new Set(touchpoints.map(tp => tp.medium).filter(Boolean))) as string[],
          attribution: touchpoints,
        }
      };
    } catch (error) {
      console.error('[UCI Service Error]:', error);
      return null;
    }
  }

  /**
   * Core Logic: Bepaalt de temperatuur van een lead
   */
  private static calculateLeadVibe(spent: number, orders: number, touches: number): 'cold' | 'warm' | 'hot' | 'burning' {
    if (spent > 1000 || orders > 5) return 'burning';
    if (spent > 0 || orders > 0) return 'hot';
    if (touches > 3) return 'warm';
    return 'cold';
  }

  /**
   * Update de intelligentie van een klant op basis van AI-analyse
   */
  static async updateInsights(user_id: number, insights: any) {
    return await db
      .update(users)
      .set({ 
        customerInsights: insights,
        updatedAt: new Date() 
      })
      .where(eq(users.id, user_id))
      .catch((err: any) => {
        console.error(`[UCI Service] updateInsights failed for ${user_id}:`, err);
      });
  }
}
