import { db, getTable } from '@/lib/system/voices-config';
const users = getTable('users');
const orders = getTable('orders');
const ordersV2 = getTable('ordersV2');
const ordersLegacyBloat = getTable('ordersLegacyBloat');
const orderItems = getTable('orderItems');
const orderStatuses = getTable('orderStatuses');
const paymentMethods = getTable('paymentMethods');
const journeys = getTable('journeys');
const utmTouchpoints = getTable('utmTouchpoints');
import { desc, eq, inArray } from 'drizzle-orm';
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
      try {
        const [dbUser] = await db
          .select()
          .from(users)
          .where(
            typeof identifier === 'number' 
              ? eq(users.id, identifier) 
              : eq(users.email, identifier)
          )
          .limit(1);
        user = dbUser;
      } catch (dbError) {
        console.warn(' UCI Service Drizzle failed, falling back to SDK');
        const query = supabase.from('users').select('*');
        if (typeof identifier === 'number') query.eq('id', identifier);
        else query.eq('email', identifier);
        
        const { data } = await query.single();
        if (data) {
          user = {
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
          };
        }
      }

      if (!user) return null;

      // 2. Aggregeer order statistieken en haal orders op
      let totalSpent = 0;
      let orderCount = 0;
      let lastOrderDate: Date | null = null;
      let ordersList: any[] = [];
      let touchpoints: any[] = [];

      // 🛡️ CHRIS-PROTOCOL: Parallel execution of heavy queries (Bob-methode)
      try {
        const [legacyOrdersResult, utmResult] = await Promise.all([
          // Orders query - Optimized with index-ready userId filter
          db.query.orders.findMany({
            where: eq(orders.user_id, user.id),
            with: {
              items: true
            },
            orderBy: [desc(orders.createdAt)],
            limit: 50
          })
            .catch(async (err: any) => {
              console.warn(' UCI Order stats Drizzle failed, falling back to SDK:', err.message);
              const { data } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false });
              return (data || []).map(o => ({ ...o, items: o.order_items }));
            }),
          // UTM query - Optimized with index-ready userId filter
          db
            .select()
            .from(utmTouchpoints)
            .where(eq(utmTouchpoints.user_id, user.id))
            .orderBy(desc(utmTouchpoints.createdAt))
            .limit(10)
            .catch(async (err: any) => {
              console.warn(' UCI UTM Drizzle failed, falling back to SDK:', err.message);
              const { data } = await supabase.from('utm_touchpoints').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
              return data || [];
            })
        ]);

        ordersList = legacyOrdersResult.map((o: any) => ({
          ...o,
          orderItems: o.items // Map 'items' from Drizzle to 'orderItems' for frontend
        }));
        touchpoints = utmResult;

        // 🔁 Mixed-mode bridge: include V2-only rows not present in legacy history.
        if (ordersV2 && orderItems && orderStatuses && paymentMethods && journeys && ordersLegacyBloat) {
          try {
            const v2Rows = await db
              .select({
                id: ordersV2.id,
                legacyInternalId: ordersV2.legacyInternalId,
                amountTotal: ordersV2.amountTotal,
                createdAt: ordersV2.createdAt,
                statusCode: orderStatuses.code,
                paymentCode: paymentMethods.code,
                journeyCode: journeys.code,
                rawMeta: ordersLegacyBloat.rawMeta,
              })
              .from(ordersV2)
              .leftJoin(orderStatuses, eq(ordersV2.statusId, orderStatuses.id))
              .leftJoin(paymentMethods, eq(ordersV2.paymentMethodId, paymentMethods.id))
              .leftJoin(journeys, eq(ordersV2.journeyId, journeys.id))
              .leftJoin(ordersLegacyBloat, eq(ordersV2.id, ordersLegacyBloat.wpOrderId))
              .where(eq(ordersV2.userId, user.id))
              .orderBy(desc(ordersV2.createdAt))
              .limit(50);

            const legacyInternalIds = v2Rows
              .map((row: any) => (row.legacyInternalId ? Number(row.legacyInternalId) : null))
              .filter((id: number | null): id is number => id !== null);

            const v2ItemRows = legacyInternalIds.length > 0
              ? await db.select().from(orderItems).where(inArray(orderItems.orderId, legacyInternalIds))
              : [];

            const itemsByLegacyOrderId = new Map<number, any[]>();
            for (const item of v2ItemRows) {
              const key = Number(item.orderId);
              const current = itemsByLegacyOrderId.get(key) || [];
              current.push({
                ...item,
                metaData: item.metaData || {},
                deliveryStatus: item.deliveryStatus || 'waiting',
              });
              itemsByLegacyOrderId.set(key, current);
            }

            const existingWpOrderIds = new Set(
              ordersList
                .map((order: any) => Number(order.wpOrderId || order.id))
                .filter((value: number) => Number.isFinite(value))
            );

            const mapJourneyFromCode = (journeyCode?: string | null): string => {
              if (!journeyCode) return 'agency';
              if (journeyCode === 'studio') return 'studio';
              if (journeyCode === 'academy') return 'academy';
              if (journeyCode.includes('agency')) return 'agency';
              return 'agency';
            };

            const mapStatusFromCode = (statusCode?: string | null): string => {
              const code = (statusCode || '').toLowerCase();
              if (['completed', 'completed_paid', 'paid', 'wc-completed'].includes(code)) return 'completed';
              if (['failed', 'cancelled', 'refunded', 'wc-refunded'].includes(code)) return 'failed';
              if (['quote_sent', 'quote_pending', 'quote-pending'].includes(code)) return 'quote-pending';
              return 'pending';
            };

            const v2OnlyOrders = v2Rows
              .filter((row: any) => !existingWpOrderIds.has(Number(row.id)))
              .map((row: any) => {
                let meta: any = {};
                if (typeof row.rawMeta === 'string') {
                  try {
                    meta = JSON.parse(row.rawMeta || '{}');
                  } catch {
                    meta = {};
                  }
                } else {
                  meta = row.rawMeta || {};
                }
                const legacyId = row.legacyInternalId ? Number(row.legacyInternalId) : null;
                const linkedItems = legacyId ? (itemsByLegacyOrderId.get(legacyId) || []) : [];
                const paymentCode = String(row.paymentCode || '').toLowerCase();

                return {
                  id: legacyId || Number(row.id),
                  wpOrderId: Number(row.id),
                  total: row.amountTotal || '0',
                  status: mapStatusFromCode(row.statusCode),
                  journey: mapJourneyFromCode(row.journeyCode),
                  createdAt: row.createdAt,
                  isQuote: ['quote_sent', 'quote_pending', 'quote-pending'].includes(String(row.statusCode || '').toLowerCase()),
                  paymentMethod: ['manual_invoice', 'mollie_banktransfer', 'banktransfer'].includes(paymentCode) ? 'banktransfer' : 'online',
                  billingVatNumber: meta._billing_vat_number || meta.billing_vat_number || null,
                  ipAddress: meta._customer_ip_address || meta.customer_ip || null,
                  orderItems: linkedItems,
                };
              });

            ordersList = [...ordersList, ...v2OnlyOrders];
          } catch (v2Err) {
            console.warn(' UCI V2 merge failed, continuing with legacy orders only:', v2Err);
          }
        }

        ordersList = ordersList.sort((a: any, b: any) => {
          const aDate = new Date(a.createdAt || a.created_at || 0).getTime();
          const bDate = new Date(b.createdAt || b.created_at || 0).getTime();
          return bDate - aDate;
        });

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
