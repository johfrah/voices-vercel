import { db } from "../../1-SITE/packages/database/src";
import { actors, appConfigs } from "../../1-SITE/packages/database/src/schema";
import { calculateDeliveryDate } from "../../1-SITE/apps/web/src/lib/delivery-logic";
import { eq, sql } from "drizzle-orm";

async function runWatchdog() {
  console.log("🛰️ START: Nuclear Delivery Watchdog...");
  
  // 0. Haal systeem werkdagen op
  const configs = await db.select().from(appConfigs).where(eq(appConfigs.key, 'general_settings'));
  const systemWorkingDays = configs[0]?.value?.system_working_days || ['mon', 'tue', 'wed', 'thu', 'fri'];
  console.log(`System Working Days: ${systemWorkingDays.join(', ')}`);

  //  BOB-METHODE: Forceer Belgische tijdzone voor cutoff berekeningen
  const now = new Date();
  console.log(`Current UTC Time: ${now.toISOString()}`);
  
  const belgiumTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Brussels"}));
  console.log(`Current Belgium Time: ${belgiumTime.toString()}`);

  try {
    // 1. Haal alle live acteurs op
    const liveActors = await db.query.actors.findMany({
      where: eq(actors.status, 'live')
    });

    console.log(`Processing ${liveActors.length} live actors...`);

    let updatedCount = 0;

    for (const actor of liveActors) {
      // 2. Bereken de werkelijke leverdatum op basis van Belgische tijd
      // De calculateDeliveryDate functie pakt nu automatisch de delivery_config mee
      const delivery = calculateDeliveryDate(actor as any, belgiumTime, systemWorkingDays);

      // 3. Bepaal de prioriteit (Same-Day/Direct = 1, anders 0)
      const priority = delivery.deliveryDaysMin === 0 ? 1 : 0;

      // 4. Update de database
      // We gebruiken raw SQL om de timestamp direct te injecteren en Drizzle mapping te omzeilen
      await db.execute(sql`
        UPDATE actors 
        SET 
          delivery_date_min = ${delivery.dateMin.toISOString()},
          delivery_date_min_priority = ${priority},
          updated_at = ${new Date().toISOString()}
        WHERE id = ${actor.id}
      `);

      updatedCount++;
    }

    console.log(`✅ Watchdog voltooid! ${updatedCount} acteurs bijgewerkt.`);
  } catch (error) {
    console.error("❌ Watchdog Error:", error);
  }
}

runWatchdog().catch(console.error);
