import { db } from '@db';
import { actors, users, orders, voiceAffinity } from '@db/schema';
import { sql, eq, and, or, isNotNull } from 'drizzle-orm';

/**
 *  NUCLEAR INTELLIGENCE BOOST (Supabase Edition)
 * 
 * Doel: Slim koppelen van data en verrijken van de database in de cloud.
 * Pijler: Professional Luiheid & Data-Integriteit.
 * 
 * Functies:
 * 1. linkGhostActors(): Koppelt actors aan users op basis van email (Silent).
 * 2. boostSubroles(): Deelt subrollen uit op basis van tarieven en scores.
 * 3. crunchAffinity(): Vult de voice_affinity tabel op basis van orderhistorie.
 */

export class IntelligenceBoost {

  /**
   * 1. Link Ghost Actors (Silent Preparation)
   * Zoekt naar users met dezelfde email als de actor en koppelt ze.
   * Als er geen user is, wordt er GEEN WP-account gemaakt (om mails te voorkomen).
   */
  static async linkGhostActors() {
    // ... bestaande code ...
  }

  /**
   * 1.1 Link Workshop Participants (Silent Preparation)
   * Zoekt naar workshop orders en maakt shadow users aan voor deelnemers.
   */
  static async linkWorkshopParticipants() {
    console.log(' Starting Workshop Participant linking...');
    
    // Haal alle studio orders op
    const studioOrders = await db.select().from(orders).where(eq(orders.journey, 'studio'));
    let createdCount = 0;

    for (const order of studioOrders) {
      if (!order.userId) {
        // We moeten de email vinden uit de raw_meta of via een join (in een echte sync)
        // Voor nu gaan we ervan uit dat de email in de rawMeta zit van de order
        const email = (order.rawMeta as any)?.billing_email;
        if (!email) continue;

        // 1. Zoek user op email
        let [matchedUser] = await db.select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        // 2. Als er geen user is, maak een Shadow User aan (Silent)
        if (!matchedUser) {
          console.log(`    Creating Shadow User for Workshop Participant (${email})...`);
          
          // Haal meta data op voor prefill
          const meta = (order.rawMeta as any) || {};
          const insights = {
            beroep: meta.beroep || meta.job || 'Onbekend',
            leeftijd: meta.leeftijd || meta.age || null,
            motivatie: meta.motivatie || meta.goal || ''
          };

          const [newUser] = await db.insert(users).values({
            email: email,
            firstName: meta.billing_first_name || '',
            lastName: meta.billing_last_name || '',
            role: 'guest',
            customerType: 'workshop_participant',
            subroles: ['workshop_participant'],
            journeyState: 'upcoming_workshop',
            preferences: { 
              silent_preparation: true,
              suggested_flow: 'studio'
            },
            customerInsights: insights
          }).returning();
          
          matchedUser = newUser;
          createdCount++;
        }

        // 3. Koppel de order aan de user
        await db.update(orders)
          .set({ userId: matchedUser.id })
          .where(eq(orders.id, order.id));
      }
    }

    console.log(` Workshop Participants linked: (Shadow Users created: ${createdCount})`);
  }

  /**
   * 2. Boost Subroles (The Talent Ladder)
   * Deelt subrollen uit op basis van de "Core" regels (A/B/C categorien).
   */
  static async boostSubroles() {
    console.log(' Boosting Subroles (Talent Ladder)...');
    
    const allUsers = await db.select().from(users);
    let updatedCount = 0;

    for (const user of allUsers) {
      const currentSubroles = (user.subroles as string[]) || [];
      const newSubroles = [...currentSubroles];

      // Haal gekoppelde actor data op
      const [actor] = await db.select()
        .from(actors)
        .where(eq(actors.userId, user.id))
        .limit(1);

      if (actor) {
        const score = actor.voiceScore || 1000;
        const status = actor.status || 'live';
        const isSpotlight = (actor as any).isSpotlight === true || score <= 50;

        //  THE LADDER LOGIC
        // Tier A: Spotlight / Top 10 (Score 0-50)
        // Tier B: Main Database (Score 51-300)
        // Tier C: Extended / Offline (Score 301+)

        if ((status as string) === 'trash' || status === 'rejected') {
          if (!newSubroles.includes('agency_offline')) newSubroles.push('agency_offline');
          // Remove all active tiers
          const filtered = newSubroles.filter(sr => !['agency_top10', 'agency_main', 'agency_extended'].includes(sr));
          newSubroles.length = 0;
          newSubroles.push(...filtered);
        } else if (isSpotlight) {
          // PROMOTION TO TIER A
          if (!newSubroles.includes('agency_top10')) newSubroles.push('agency_top10');
          const filtered = newSubroles.filter(sr => !['agency_main', 'agency_extended', 'agency_offline'].includes(sr));
          newSubroles.length = 0;
          newSubroles.push(...filtered);
        } else if (score <= 300) {
          // PROMOTION TO TIER B
          if (!newSubroles.includes('agency_main')) newSubroles.push('agency_main');
          const filtered = newSubroles.filter(sr => !['agency_top10', 'agency_extended', 'agency_offline'].includes(sr));
          newSubroles.length = 0;
          newSubroles.push(...filtered);
        } else {
          // TIER C (Default for new/extended talent)
          if (!newSubroles.includes('agency_extended')) newSubroles.push('agency_extended');
          const filtered = newSubroles.filter(sr => !['agency_top10', 'agency_main', 'agency_offline'].includes(sr));
          newSubroles.length = 0;
          newSubroles.push(...filtered);
        }

        // 2. Tarief-gebaseerde rollen + Admin Curation
        const rates = (actor.rates as any) || {};
        const approvedFlows = (actor as any).approvedFlows || ['commercial', 'corporate', 'telephony'];

        const hasIvr = approvedFlows.includes('telephony') && (rates.BE?.price_ivr > 0 || parseFloat(actor.priceIvr || '0') > 0);
        const hasOnline = approvedFlows.includes('commercial') && (rates.BE?.price_online_media > 0 || parseFloat(actor.priceOnline || '0') > 0);
        const hasUnpaid = approvedFlows.includes('corporate') && (rates.BE?.price_unpaid_media > 0 || parseFloat(actor.priceUnpaid || '0') > 0);

        if (hasIvr) {
          if (!newSubroles.includes('agency_voiceover_telephony')) newSubroles.push('agency_voiceover_telephony');
        } else {
          const idx = newSubroles.indexOf('agency_voiceover_telephony');
          if (idx > -1) newSubroles.splice(idx, 1);
        }

        if (hasOnline) {
          if (!newSubroles.includes('agency_voiceover_commercial')) newSubroles.push('agency_voiceover_commercial');
        } else {
          const idx = newSubroles.indexOf('agency_voiceover_commercial');
          if (idx > -1) newSubroles.splice(idx, 1);
        }

        if (hasUnpaid) {
          if (!newSubroles.includes('agency_voiceover_corporate')) newSubroles.push('agency_voiceover_corporate');
        } else {
          const idx = newSubroles.indexOf('agency_voiceover_corporate');
          if (idx > -1) newSubroles.splice(idx, 1);
        }
      }

      // Update als er wijzigingen zijn
      if (JSON.stringify(newSubroles) !== JSON.stringify(currentSubroles)) {
        await db.update(users)
          .set({ subroles: newSubroles })
          .where(eq(users.id, user.id));
        updatedCount++;
      }
    }

    console.log(` Users boosted: ${updatedCount}`);
  }

  /**
   * 3. Crunch Affinity
   * Analyseert orders om de voice_affinity tabel te vullen.
   */
  static async crunchAffinity() {
    console.log(' Crunching Voice Affinity from Historical Orders...');
    
    // 1. Get all orders with rawMeta
    const allOrders = await db.select().from(orders).where(isNotNull(orders.rawMeta));
    console.log(` Analyzing ${allOrders.length} orders for voice pairs...`);

    const affinityPairs: Record<string, number> = {};

    for (const order of allOrders) {
      const meta = (order.rawMeta as any) || {};
      
      // Look for voice IDs in common WooCommerce meta keys
      // In Voices.be, voice IDs are often stored in line items or specific meta keys
      // For this migration, we'll look for '_voice_id' or similar in the raw meta
      // and also check if we can find multiple voices in one order.
      
      const voiceIds: number[] = [];
      
      // Check common keys
      if (meta._voice_id) voiceIds.push(parseInt(meta._voice_id));
      if (meta.voice_id) voiceIds.push(parseInt(meta.voice_id));
      
      // If we have line items in rawMeta (sometimes stored as serialized strings)
      // we would parse them here. For now, we'll focus on the explicit meta.
      
      if (voiceIds.length > 1) {
        // Sort to ensure A-B is the same as B-A
        const uniqueVoices = Array.from(new Set(voiceIds)).sort((a, b) => a - b);
        
        for (let i = 0; i < uniqueVoices.length; i++) {
          for (let j = i + 1; j < uniqueVoices.length; j++) {
            const pairKey = `${uniqueVoices[i]}-${uniqueVoices[j]}`;
            affinityPairs[pairKey] = (affinityPairs[pairKey] || 0) + 1;
          }
        }
      }
    }

    let pairsFound = 0;
    for (const [pair, count] of Object.entries(affinityPairs)) {
      const [idA, idB] = pair.split('-').map(Number);
      
      // Find internal actor IDs from WP Product IDs
      const [actorA] = await db.select({ id: actors.id }).from(actors).where(eq(actors.wpProductId, idA)).limit(1);
      const [actorB] = await db.select({ id: actors.id }).from(actors).where(eq(actors.wpProductId, idB)).limit(1);
      
      if (actorA && actorB) {
        await db.insert(voiceAffinity).values({
          voiceAId: actorA.id,
          voiceBId: actorB.id,
          pairCount: count
        }).onConflictDoUpdate({
          target: [voiceAffinity.voiceAId, voiceAffinity.voiceBId],
          set: { pairCount: sql`pair_count + ${count}` }
        });
        pairsFound++;
      }
    }
    
    console.log(` Affinity crunching completed. ${pairsFound} pairs updated.`);
  }

  /**
   * Voer de volledige boost uit
   */
  static async runAll() {
    console.log(' STARTING FULL NUCLEAR INTELLIGENCE BOOST...');
    await this.linkGhostActors();
    await this.linkWorkshopParticipants();
    await this.boostSubroles();
    await this.crunchAffinity();
    console.log(' ALL ENGINES COMPLETED SILENTLY.');
  }
}
