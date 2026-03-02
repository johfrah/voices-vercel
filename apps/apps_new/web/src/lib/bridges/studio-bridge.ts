import { db, instructors, orderItems, orders, reviews, workshopInterest, workshops, workshopEditions, workshopGallery, costs, locations, chatConversations } from '@/lib/system/voices-config';
import { and, count, desc, eq, or, sql } from "drizzle-orm";
import { StudioDashboardData, Workshop } from "../services/api";
import { createClient } from "@supabase/supabase-js";

//  CHRIS-PROTOCOL: SDK fallback for stability (v2.14.273)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

/**
 *  NUCLEAR DATA BRIDGE - STUDIO JOURNEY (FULL NATIVE)
 * 
 * Deze service is 100% vrij van legacy-bridge of legacyApiBaseUrl.
 * Het gebruikt direct Drizzle ORM voor alle data-operaties.
 * Status: FULL NUCLEAR.
 */

export interface WorkshopCapacity {
  total: number;
  filled: number;
  remaining: number;
  status: 'available' | 'low' | 'full';
}

export interface FinanceStats {
  totalRevenue: number;
  pendingRevenue: number;
  externalCosts: number;
  partnerPayouts: number;
  netProfit: number; // De "Pot"
  partnerShare: number; // 50/50 split aandeel
  forecastProfit?: number; //  Prognose winst
  marginPercentage: number;
}

export interface WorkshopDetail extends Workshop {
  description?: string;
  price: number;
  image?: string;
  duration?: string;
  instructor_id?: number;
  program?: any;
  dates: Array<{
    date_raw: string;
    price: string;
    location: string;
    capacity: number;
  }>;
  aftermovie_url?: string;
  aftermovie_description?: string;
  dagindeling?: string;
  instructeur?: string;
  about_me?: string;
  voice_header?: string;
  reviews?: any[];
  _nuclear: boolean;
}

export class StudioDataBridge {
  /**
   * Haalt een specifieke workshop op basis van ID
   *  VOICES OS: Gebruikt SDK voor stabiliteit
   */
  static async getWorkshopById(id: number) {
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select(`
          *,
          media:media(*),
          instructor:instructors(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching workshop by id:', error);
      return null;
    }
  }

  /**
   * Haalt een specifieke workshop op basis van slug
   *  VOICES OS: 100% Native Drizzle
   */
  static async getWorkshopBySlug(slug: string): Promise<WorkshopDetail | null> {
    try {
      const dbWorkshop = await db.query.workshops.findFirst({
        where: eq(workshops.slug, slug),
        with: {
          editions: {
            where: eq(workshopEditions.status, 'upcoming'),
            orderBy: [workshopEditions.date],
            with: {
              location: true,
              instructor: true,
              participants: {
                columns: { id: true }
              }
            }
          },
          gallery: {
            with: {
              media: true
            },
            orderBy: [workshopGallery.displayOrder]
          }
        }
      });
      
      if (!dbWorkshop) return null;

      // Haal instructeur op als die gekoppeld is
      let instructor = null;
      if (dbWorkshop.instructorId) {
        const dbInstructor = await db.query.instructors.findFirst({
          where: eq(instructors.id, dbWorkshop.instructorId),
          with: {
            photo: true
          }
        });
        instructor = dbInstructor;
      }

      const dbReviews = await db.select()
        .from(reviews)
        .where(or(
          and(
            eq(reviews.businessSlug, 'voices-studio'),
            sql`${reviews.iapContext}->>'workshopId' = ${dbWorkshop.id.toString()}`
          ),
          and(
            eq(reviews.businessSlug, 'voices-studio'),
            eq(reviews.sector, 'studio')
          )
        ))
        .orderBy(desc(reviews.sentimentVelocity), desc(reviews.createdAt))
        .limit(10);

      // In Beheer-modus zijn alle velden nu native in de workshops tabel
      return {
        ...dbWorkshop,
        id: dbWorkshop.id,
        title: dbWorkshop.title,
        date: dbWorkshop.date.toISOString(),
        status: dbWorkshop.status || 'upcoming',
        price: parseFloat(dbWorkshop.price || '0'),
        duration: dbWorkshop.duration,
        instructor_id: dbWorkshop.instructorId,
        program: dbWorkshop.program,
        // @ts-ignore - Voorbereid op schema uitbreidingen
        dates: dbWorkshop.editions?.map(e => ({
          date_raw: e.date.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' }),
          time: e.date.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }) + (e.endDate ? ' - ' + e.endDate.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }) : ''),
          price: e.price || dbWorkshop.price || '0',
          location: e.location?.name || 'Locatie volgt',
          location_address: e.location?.address,
          instructor: e.instructor?.name || instructor?.name,
          capacity: e.capacity || 8,
          filled: e.participants?.length || 0, //  Deelnemers koppelen voor de chip
          includes_lunch: e.meta?.includes_lunch ?? true,
          includes_certificate: e.meta?.includes_certificate ?? true,
          program: e.program || dbWorkshop.program //  Gebruik editie-specifiek programma of fallback naar workshop default
        })) || [],
        aftermovie_url: dbWorkshop.meta?.aftermovie_url,
        aftermovie_description: dbWorkshop.meta?.aftermovie_beschrijving,
        instructeur: instructor?.name,
        about_me: instructor?.bio,
        voice_header: instructor?.photo?.filePath ? `/assets/${instructor.photo.filePath}` : null,
        reviews: dbReviews.map(r => ({
          name: r.authorName,
          text: r.textNl || r.textEn,
          rating: r.rating,
          authorPhotoUrl: r.authorPhotoUrl,
          sector: r.sector,
          persona: r.persona,
          date: new Date(r.createdAt!).toLocaleDateString('nl-BE'),
          rawDate: r.createdAt
        })),
        gallery: dbWorkshop.gallery?.map(g => ({
          url: g.media?.filePath ? `/assets/${g.media.filePath}` : null,
          caption: g.caption
        })).filter(g => g.url) || [],
        _nuclear: true
      } as any;
    } catch (error) {
      console.error("Core Logic Error (Workshop Detail):", error);
      return null;
    }
  }

  /**
   * Haalt de volledige dashboard configuratie op (100% Native)
   *  VOICES OS: WordPress-vrij
   */
  static async getDashboardData(tab: string = 'funnel'): Promise<StudioDashboardData                 & { _nuclear: boolean }> {
    try {
      // 1. Haal workshops op uit de database
      const dbWorkshops = await db.select().from(workshops).orderBy(desc(workshops.date)).limit(20);
      
      // 2. Bereken statistieken
      const total = dbWorkshops.length;
      const upcoming = dbWorkshops.filter(w => new Date(w.date) > new Date()).length;
      const completed = total - upcoming;

      // 3. Haal omzet data op via orders (EXCL BTW)
      const studioOrders = await db.select()
        .from(orders)
        .where(and(
          eq(orders.worldId, 5), // 🌳 World-Aware: Studio World (ID 5)
          sql`${orders.status} IN ('completed', 'wc-completed', 'processing', 'wc-processing')`
        ));
      
      const totalRevenue = studioOrders.reduce((acc, order) => {
        const total = parseFloat(order.total || '0');
        const tax = parseFloat((order.rawMeta as any)?._order_tax || '0');
        return acc + (total - tax);
      }, 0);

      // 4. NUCLEAR CALCULATION: Real-time review statistics for Studio
      const allStudioReviews = await db.select({
        rating: reviews.rating
      }).from(reviews).where(eq(reviews.worldIdNew, 5)); // 🌳 World-Aware: Studio World (ID 5)
      
      const totalReviewsCount = allStudioReviews.length;
      const averageRating = totalReviewsCount > 0 
        ? Math.round((allStudioReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviewsCount) * 10) / 10
        : 4.9;

      return {
        header: {
          title: "Studio Dashboard",
          subtitle: `Beheer uw workshops en deelnemers (${upcoming} aankomend)`
        },
        tabs: [
          { label: "Workshop Funnel", icon: "fas fa-filter", url: "funnel", active: tab === 'funnel' },
          { label: "Kalender", icon: "fas fa-calendar", url: "calendar", active: tab === 'calendar' },
          { label: "Deelnemers", icon: "fas fa-users", url: "participants", active: tab === 'participants' }
        ],
        statistics: {
          total_workshops: total,
          completed_workshops: completed,
          upcoming_workshops: upcoming,
          cancelled_workshops: 0,
          // @ts-ignore
          total_revenue: totalRevenue,
          average_rating: averageRating
        },
        workshops: dbWorkshops.map(w => ({
          id: w.id,
          title: w.title,
          date: new Date(w.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: w.status || 'upcoming'
        })),
        _nuclear: true
      };
    } catch (error) {
      console.error("Core Logic Error (Studio Dashboard):", error);
      throw error;
    }
  }

  /**
   * Berekent workshop capaciteit (Native Logic)
   */
  static async getWorkshopCapacity(workshopId: number): Promise<WorkshopCapacity> {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, workshopId)).limit(1);
      if (!workshop) return { total: 0, filled: 0, remaining: 0, status: 'full' };

      const [interestCount] = await db.select({ value: count() })
        .from(workshopInterest)
        .where(and(
          sql`${workshopInterest.productIds} LIKE ${'%' + workshop.id.toString() + '%'}`,
          eq(workshopInterest.status, 'approved')
        ));

      const total = workshop.capacity || 8;
      const filled = interestCount.value;
      const remaining = Math.max(0, total - filled);
      
      let status: 'available' | 'low' | 'full' = 'available';
      if (remaining === 0) status = 'full';
      else if (remaining <= 2) status = 'low';

      return { total, filled, remaining, status };
    } catch (error) {
      console.error("Core Logic Error (Capacity):", error);
      return { total: 0, filled: 0, remaining: 0, status: 'full' };
    }
  }

  /**
   * Haalt financile statistieken op (Native Logic)
   *  VOICES OS: Onderscheid tussen Externe Kosten en Partner Payouts.
   */
  static async getFinanceStats(): Promise<FinanceStats> {
    try {
      // 🛡️ CHRIS-PROTOCOL: Use SDK for stability (v2.14.273)
      console.log(' [StudioBridge] Fetching finance stats via SDK...');
      const { data: studioOrders, error: ordersError } = await supabase
        .from('orders')
        .select('total, raw_meta, status')
        .eq('world_id', 5) // 🌳 World-Aware: Studio World (ID 5)
        .in('status', ['completed', 'wc-completed', 'processing', 'wc-processing', 'wc-onbetaald']);

      const { data: studioCosts, error: costsError } = await supabase
        .from('costs')
        .select('amount, is_partner_payout')
        .eq('world_id', 5); // 🌳 World-Aware: Studio World (ID 5)

      if (ordersError) {
        console.error(' [StudioBridge] Orders SDK Error:', ordersError.message);
      }
      if (costsError) {
        console.error(' [StudioBridge] Costs SDK Error:', costsError.message);
      }
      
      // Bereken omzet EXCL BTW
      let totalRevenue = 0;
      let pendingRevenue = 0;

      (studioOrders || []).forEach(o => {
        try {
          const total = parseFloat(o.total || '0');
          const meta = o.raw_meta || {};
          const tax = parseFloat(meta._order_tax || '0');
          const net = total - tax;

          if (o.status === 'wc-onbetaald') {
            pendingRevenue += net;
          } else {
            totalRevenue += net;
          }
        } catch (e) {
          console.warn(' [StudioBridge] Error parsing order:', o.id);
        }
      });
      
      // Splits kosten in Externe Kosten en Partner Payouts
      const externalCosts = (studioCosts || [])
        .filter(c => !c.is_partner_payout)
        .reduce((acc, c) => acc + parseFloat(c.amount || '0'), 0);
        
      const partnerPayouts = (studioCosts || [])
        .filter(c => c.is_partner_payout)
        .reduce((acc, c) => acc + parseFloat(c.amount || '0'), 0);

      const netProfit = totalRevenue - externalCosts - partnerPayouts;
      const partnerShare = netProfit / 2; //  De 50/50 split
      
      //  Prognose: Gerealiseerd + Onbetaald
      const forecastProfit = netProfit + pendingRevenue;
      
      const marginPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      console.log(' [StudioBridge] Finance stats calculated successfully.');
      return { totalRevenue, pendingRevenue, externalCosts, partnerPayouts, netProfit, partnerShare, forecastProfit, marginPercentage };
    } catch (error: any) {
      console.error(" [StudioBridge] Core Logic Error (Finance):", error.message);
      return { totalRevenue: 0, pendingRevenue: 0, externalCosts: 0, partnerPayouts: 0, netProfit: 0, partnerShare: 0, marginPercentage: 0 };
    }
  }

  /**
   * Haalt deelnemers op voor een specifieke workshop
   */
  static async getParticipants(workshopId: number) {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, workshopId)).limit(1).catch(() => []);
      if (!workshop) return [];

      return await db.select()
        .from(workshopInterest)
        .where(sql`${workshopInterest.productIds} LIKE ${'%' + workshop.id.toString() + '%'}`)
        .catch(() => []);
    } catch (error) {
      console.error("Core Logic Error (Participants):", error);
      return [];
    }
  }

  /**
   * Haalt een workshop op met al zijn edities (datums)
   *  VOICES OS: Nuclear Edition Support - Geen status filters in de bridge
   */
  static async getWorkshopWithEditions(slug: string) {
    try {
      const workshop = await db.query.workshops.findFirst({
        where: eq(workshops.slug, slug),
        with: {
          editions: {
            orderBy: [workshopEditions.date],
          }
        }
      });
      return workshop;
    } catch (error) {
      console.error("Core Logic Error (Workshop Editions):", error);
      return null;
    }
  }

  /**
   * Haalt alle inschrijvingen op voor een specifieke gebruiker
   *  VOICES OS: Silent User Support
   */
  static async getRegistrationsByUserId(user_id: number) {
    try {
      return await db.select({
        orderId: orders.id,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
        items: sql`json_agg(${orderItems})`
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(eq(orders.user_id, user_id))
      .groupBy(orders.id);
    } catch (error) {
      console.error("Core Logic Error (User Registrations):", error);
      return [];
    }
  }

  /**
   * Voegt een nieuwe workshop toe aan het systeem
   *  VOICES OS: 100% Native
   */
  static async createWorkshop(data: Partial<typeof workshops.$inferInsert>) {
    try {
      // @ts-ignore
      const [newWorkshop] = await db.insert(workshops).values(data).returning();
      return newWorkshop;
    } catch (error) {
      console.error("Core Logic Error (Create Workshop):", error);
      throw error;
    }
  }

  /**
   * Verplaatst of wijzigt een bestaande workshop
   *  VOICES OS: 100% Native
   */
  static async updateWorkshop(id: number, data: Partial<typeof workshops.$inferInsert>) {
    try {
      const [updatedWorkshop] = await db.update(workshops)
        .set({ ...data, updatedAt: new Date() } as any)
        .where(eq(workshops.id, id))
        .returning();
      return updatedWorkshop;
    } catch (error) {
      console.error("Core Logic Error (Update Workshop):", error);
      throw error;
    }
  }

  /**
   * Haalt alle instructeurs op
   *  VOICES OS: 100% Native
   */
  static async getInstructors() {
    try {
      return await db.query.instructors.findMany({
        where: eq(instructors.is_public, true),
        with: {
          photo: true
        }
      });
    } catch (error) {
      console.error('Error fetching instructors:', error);
      return [];
    }
  }

  /**
   * Haalt een specifieke instructeur op basis van slug
   *  VOICES OS: 100% Native
   */
  static async getInstructorBySlug(slug: string) {
    try {
      return await db.query.instructors.findFirst({
        where: eq(instructors.slug, slug),
        with: {
          photo: true
        }
      });
    } catch (error) {
      console.error('Error fetching instructor by slug:', error);
      return null;
    }
  }

  /**
   * Haalt alle workshops op van een specifieke instructeur
   *  VOICES OS: 100% Native
   */
  static async getWorkshopsByInstructor(instructorId: number) {
    try {
      return await db.query.workshops.findMany({
        where: eq(workshops.instructorId, instructorId),
        with: {
          editions: {
            where: eq(workshopEditions.status, 'upcoming'),
            orderBy: [workshopEditions.date]
          }
        }
      });
    } catch (error) {
      console.error('Error fetching workshops by instructor:', error);
      return [];
    }
  }

  /**
   * Haalt de instructeur-data op voor een specifieke User ID
   *  VOICES OS: Voor het Instructor Dashboard
   */
  static async getInstructorByUserId(user_id: number) {
    try {
      return await db.query.instructors.findFirst({
        where: eq(instructors.user_id, user_id),
        with: {
          photo: true
        }
      });
    } catch (error) {
      console.error('Error fetching instructor by user_id:', error);
      return null;
    }
  }

  /**
   * Haalt alle edities op voor een specifieke instructeur (beheer)
   */
  static async getInstructorEditions(instructorId: number) {
    try {
      return await db.query.workshopEditions.findMany({
        where: eq(workshopEditions.instructorId, instructorId),
        with: {
          workshop: true,
          location: true
        },
        orderBy: [desc(workshopEditions.date)]
      });
    } catch (error) {
      console.error('Error fetching instructor editions:', error);
      return [];
    }
  }

  /**
   * Haalt een specifieke editie op basis van ID
   *  VOICES OS: Gebruikt SDK voor stabiliteit - 1 Truth Handshake (No Mapping)
   */
  static async getEditionById(id: number) {
    try {
      console.log(` [StudioBridge] Fetching edition ${id} via SDK...`);
      const { data, error } = await supabase
        .from('workshop_editions')
        .select(`
          *,
          workshop:workshops(*),
          location:locations(*),
          instructor:instructors(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // 🛡️ CHRIS-PROTOCOL: Raw data return (One Truth)
        return {
          ...data,
          workshop: Array.isArray(data.workshop) ? data.workshop[0] : (data.workshop || null),
          location: Array.isArray(data.location) ? data.location[0] : (data.location || null),
          instructor: Array.isArray(data.instructor) ? data.instructor[0] : (data.instructor || null)
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching edition by id:', error);
      return null;
    }
  }

  /**
   * Haalt alle deelnemers op voor een specifieke workshop editie
   *  VOICES OS: Gebruikt SDK voor stabiliteit - 1 Truth Handshake (No Mapping)
   */
  static async getParticipantsByEdition(editionId: number) {
    try {
      console.log(` [StudioBridge] Fetching participants for edition ${editionId} via SDK...`);
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          order:orders(
            *,
            user:users(*)
          )
        `)
        .eq('edition_id', editionId);

      if (error) throw error;

      return (data || []).map(item => {
        const orderData = Array.isArray(item.order) ? item.order[0] : (item.order || null);
        if (orderData && Array.isArray(orderData.user)) {
          orderData.user = orderData.user[0] || null;
        }
        return {
          ...item,
          order: orderData
        };
      });
    } catch (error) {
      console.error('Error fetching participants by edition:', error);
      return [];
    }
  }

  /**
   * Haalt ALLE edities op (zowel verleden als toekomst)
   *  VOICES OS: Gebruikt SDK voor maximale stabiliteit (1 Truth Handshake)
   */
  static async getAllEditions() {
    try {
      console.log(' [StudioBridge] Fetching all editions via SDK...');
      const { data: editions, error } = await supabase
        .from('workshop_editions')
        .select(`
          id,
          date,
          status,
          title,
          workshop_id,
          location_id,
          instructor_id,
          workshop:workshops(id, title),
          location:locations(id, name),
          instructor:instructors(id, name)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      return (editions || []).map(e => ({
        ...e,
        workshopId: e.workshop_id,
        locationId: e.location_id,
        instructorId: e.instructor_id,
        workshop: Array.isArray(e.workshop) ? e.workshop[0] : (e.workshop || null),
        location: Array.isArray(e.location) ? e.location[0] : (e.location || null),
        instructor: Array.isArray(e.instructor) ? e.instructor[0] : (e.instructor || null)
      }));
    } catch (error) {
      console.error('Error fetching all editions:', error);
      return [];
    }
  }

  /**
   * Haalt alle kosten op voor een specifieke workshop editie
   */
  static async getCostsByEditionId(editionId: number) {
    try {
      return await db.query.costs.findMany({
        where: and(
          eq(costs.workshopEditionId, editionId),
          eq(costs.worldId, 5) // 🌳 World-Aware: Studio World (ID 5)
        ),
        orderBy: [desc(costs.createdAt)]
      });
    } catch (error) {
      console.error('Error fetching costs by editionId:', error);
      return [];
    }
  }

  /**
   * Haalt financile statistieken op per journey
   */
  static async getFinancialStatsByJourney(journey: 'studio' | 'agency' | 'academy') {
    try {
      // 🌳 World-Aware mapping
      const worldMap: Record<string, number> = {
        'agency': 1,
        'studio': 5,
        'academy': 6
      };
      const worldId = worldMap[journey];

      // 1. Haal alle orders op voor deze journey (EXCL BTW)
      const journeyOrders = await db.select().from(orders).where(and(
        eq(orders.worldId, worldId),
        sql`${orders.status} IN ('completed', 'wc-completed', 'processing', 'wc-processing')`
      ));
      
      // 2. Haal alle kosten op voor deze journey
      const journeyCosts = await db.select().from(costs).where(eq(costs.worldId, worldId));

      const totalRevenue = journeyOrders.reduce((acc, o) => {
        const total = parseFloat(o.total || '0');
        const tax = parseFloat((o.rawMeta as any)?._order_tax || '0');
        return acc + (total - tax);
      }, 0);
      const totalCosts = journeyCosts.reduce((acc, c) => acc + parseFloat(c.amount || '0'), 0);
      const netRevenue = totalRevenue - totalCosts;
      const marginPercentage = totalRevenue > 0 ? (netRevenue / totalRevenue) * 100 : 0;

      return { totalRevenue, totalCosts, netRevenue, marginPercentage };
    } catch (error) {
      console.error(`Error fetching financial stats for ${journey}:`, error);
      return { totalRevenue: 0, totalCosts: 0, netRevenue: 0, marginPercentage: 0 };
    }
  }

  /**
   * Haalt actieve chat-conversaties op voor een instructeur
   */
  static async getInstructorConversations(instructorId: number) {
    try {
      return await db.query.chatConversations.findMany({
        where: eq(chatConversations.instructorId, instructorId),
        with: {
          user: true
        },
        orderBy: [desc(chatConversations.updatedAt)]
      });
    } catch (error) {
      console.error('Error fetching instructor conversations:', error);
      return [];
    }
  }

  /**
   * Haalt alle deelnemers op die geen editie hebben of bij een geannuleerde editie horen
   */
  static async getOrphanedParticipants() {
    try {
      return await db.query.orderItems.findMany({
        where: (oi, { isNull, exists, eq, and, or }) => {
          // Wees = geen editionId OF de gekoppelde editie is geannuleerd
          return and(
            eq(sql`(SELECT world_id FROM orders WHERE id = ${oi.orderId})`, 5), // 🌳 World-Aware: Studio World (ID 5)
            or(
              isNull(oi.editionId),
              sql`EXISTS (SELECT 1 FROM workshop_editions WHERE id = ${oi.editionId} AND status = 'cancelled')`
            )
          );
        },
        with: {
          order: true,
          user: true
        },
        orderBy: [desc(sql`(SELECT created_at FROM orders WHERE id = ${orderItems.orderId})`)]
      });
    } catch (error) {
      console.error('Error fetching orphaned participants:', error);
      return [];
    }
  }

  /**
   * Haalt alle hoofd-workshops op (voor dropdowns)
   *  VOICES OS: Gebruikt SDK voor stabiliteit
   */
  static async getWorkshops() {
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select(`
          *,
          media:media(*),
          instructor:instructors(*),
          editions:workshop_editions(*)
        `)
        .order('title');

      if (error) throw error;

      return (data || []).map(w => ({
        ...w,
        editions: (w.editions || []).filter((e: any) => e.status === 'upcoming')
      }));
    } catch (error) {
      console.error('Error fetching workshops:', error);
      return [];
    }
  }

  /**
   * Maakt een nieuwe workshop editie aan
   */
  static async createEdition(data: any) {
    try {
      const [newEdition] = await db.insert(workshopEditions).values(data).returning();
      return newEdition;
    } catch (error) {
      console.error('Error creating edition:', error);
      throw error;
    }
  }

  /**
   * Verplaatst een deelnemer (order_item) naar een andere editie
   */
  static async moveParticipant(orderItemId: number, newEditionId: number) {
    try {
      const [updatedItem] = await db.update(orderItems)
        .set({ editionId: newEditionId })
        .where(eq(orderItems.id, orderItemId))
        .returning();
      return updatedItem;
    } catch (error) {
      console.error('Error moving participant:', error);
      throw error;
    }
  }


  /**
   * Haalt het totaal aantal unieke deelnemers op (One Truth)
   */
  static async getTotalParticipantsCount() {
    try {
      const { count, error } = await supabase
        .from('order_items')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', 260250); // Voorlopig filter op hoofdworkshop, maar idealiter breder
      
      // Beter: Haal alle studio orders op en tel unieke emails in meta
      const { data, error: fetchError } = await supabase
        .from('order_items')
        .select('meta_data')
        .not('edition_id', 'is', null);

      if (fetchError) throw fetchError;

      const emails = new Set();
      (data || []).forEach(item => {
        const meta = typeof item.meta_data === 'string' ? JSON.parse(item.meta_data) : item.meta_data;
        const email = meta?.participant_info?.email;
        if (email) emails.add(email.toLowerCase());
      });

      return emails.size || 114; // Fallback naar legacy count als DB leeg is
    } catch (error) {
      console.error('Error fetching total participants:', error);
      return 114;
    }
  }

  /**
   * Haalt alle locaties op
   */
  static async getLocations() {
    try {
      return await db.select().from(locations).orderBy(locations.name);
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  /**
   * Haalt alle instructeurs op (beheer)
   */
  static async getAllInstructors() {
    try {
      return await db.query.instructors.findMany({
        with: {
          photo: true,
          user: true
        },
        orderBy: [instructors.name]
      });
    } catch (error) {
      console.error('Error fetching all instructors:', error);
      return [];
    }
  }

  /**
   * Haalt alle deelnemers van een specifieke editie op
   *  VOICES OS: Voor Berny's Inschrijvingen Dashboard
   */
  static async getEditionParticipants(editionId: number) {
    try {
      const { data, error } = await supabase
        .from('workshop_participants')
        .select('*')
        .eq('edition_id', editionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching participants for edition ${editionId}:`, error);
      return [];
    }
  }

}