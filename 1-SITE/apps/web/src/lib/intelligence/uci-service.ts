import { db } from '@db';
import { users, orders, utmTouchpoints, reviews } from '@db/schema';
import { eq, sql, desc, sum, count } from 'drizzle-orm';
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
  firstName: string | null;
  lastName: string | null;
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
            firstName: data.first_name,
            lastName: data.last_name,
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
            wpId: data.wp_id,
            isManuallyEdited: data.is_manually_edited,
            howHeard: data.how_heard,
            updatedAt: data.updated_at
          };
        }
      }

      if (!user) return null;

      // 2. Aggregeer order statistieken
      let totalSpent = 0;
      let orderCount = 0;
      let lastOrderDate: Date | null = null;

      try {
        const orderStats = await db
          .select({
            totalSpent: sum(orders.total),
            orderCount: count(orders.id),
            lastOrder: sql`MAX(${orders.createdAt})`,
          })
          .from(orders)
          .where(eq(orders.userId, user.id));

        const stats = orderStats[0];
        totalSpent = Number(stats?.totalSpent || 0);
        orderCount = Number(stats?.orderCount || 0);
        lastOrderDate = stats?.lastOrder as Date;
      } catch (orderError) {
        console.warn(' UCI Order stats Drizzle failed, falling back to SDK');
        const { data: ordersData } = await supabase.from('orders').select('total, created_at').eq('user_id', user.id);
        if (ordersData) {
          totalSpent = ordersData.reduce((acc, o) => acc + Number(o.total || 0), 0);
          orderCount = ordersData.length;
          if (ordersData.length > 0) {
            lastOrderDate = new Date(Math.max(...ordersData.map(o => new Date(o.created_at).getTime())));
          }
        }
      }

      // 3. Haal UTM touchpoints op voor DNA
      let touchpoints: any[] = [];
      try {
        touchpoints = await db
          .select()
          .from(utmTouchpoints)
          .where(eq(utmTouchpoints.userId, user.id))
          .orderBy(desc(utmTouchpoints.createdAt))
          .limit(10);
      } catch (utmError) {
        console.warn(' UCI UTM Drizzle failed, falling back to SDK');
        const { data } = await supabase.from('utm_touchpoints').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
        touchpoints = data || [];
      }

      // 4. Bereken de "Lead Vibe" (Core Logic)
      const leadVibe = this.calculateLeadVibe(totalSpent, orderCount, touchpoints.length);

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
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
        intelligence: {
          leadVibe,
          customerType: user.customerType,
          journeyState: user.journeyState,
          insights: user.customerInsights,
        },
        dna: {
          preferredLanguages: (user.preferences as any)?.languages || [],
          topJourneys: Array.from(new Set(touchpoints.map(t => t.medium).filter(Boolean))) as string[],
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
  static async updateInsights(userId: number, insights: any) {
    return await db
      .update(users)
      .set({ 
        customerInsights: insights,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }
}
