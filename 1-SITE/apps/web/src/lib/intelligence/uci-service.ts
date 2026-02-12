import { db } from '@db';
import { users, orders, utmTouchpoints, reviews } from '@db/schema';
import { eq, sql, desc, sum, count } from 'drizzle-orm';

/**
 * ⚡ UNIFIED CUSTOMER INTELLIGENCE (UCI) SERVICE
 * 
 * Doel: Eén bron van waarheid creëren voor elke klant door alle data-fragmenten
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
   * Haalt het volledige 360° profiel op van een klant
   */
  static async getCustomer360(identifier: string | number): Promise<Customer360 | null> {
    try {
      // 1. Haal de basis user data op
      const [user] = await db
        .select()
        .from(users)
        .where(
          typeof identifier === 'number' 
            ? eq(users.id, identifier) 
            : eq(users.email, identifier)
        )
        .limit(1);

      if (!user) return null;

      // 2. Aggregeer order statistieken
      const orderStats = await db
        .select({
          totalSpent: sum(orders.total),
          orderCount: count(orders.id),
          lastOrder: sql`MAX(${orders.createdAt})`,
        })
        .from(orders)
        .where(eq(orders.userId, user.id));

      const stats = orderStats[0];
      const totalSpent = Number(stats?.totalSpent || 0);
      const orderCount = Number(stats?.orderCount || 0);

      // 3. Haal UTM touchpoints op voor DNA
      const touchpoints = await db
        .select()
        .from(utmTouchpoints)
        .where(eq(utmTouchpoints.userId, user.id))
        .orderBy(desc(utmTouchpoints.createdAt))
        .limit(10);

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
          lastOrderDate: stats?.lastOrder as Date,
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
