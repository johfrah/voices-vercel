import { db } from "../../1-SITE/packages/database/src";
import { actors } from "../../1-SITE/packages/database/src/schema";
import { eq } from "drizzle-orm";

async function checkKirsten() {
  console.log("🔍 Checking Kirsten (ID 1715) and Johfrah (ID 1760)...");
  
  const kirsten = await db.query.actors.findFirst({
    where: eq(actors.id, 1715)
  });

  const johfrah = await db.query.actors.findFirst({
    where: eq(actors.id, 1760)
  });

  console.log("\n--- KIRSTEN (1715) ---");
  console.log(JSON.stringify({
    id: kirsten?.id,
    name: kirsten?.firstName,
    deliveryDaysMin: kirsten?.deliveryDaysMin,
    deliveryDaysMax: kirsten?.deliveryDaysMax,
    cutoffTime: kirsten?.cutoffTime,
    samedayDelivery: kirsten?.samedayDelivery,
    availability: kirsten?.availability,
    deliveryTime: kirsten?.deliveryTime
  }, null, 2));

  console.log("\n--- JOHFRAH (1760) ---");
  console.log(JSON.stringify({
    id: johfrah?.id,
    name: johfrah?.firstName,
    deliveryDaysMin: johfrah?.deliveryDaysMin,
    deliveryDaysMax: johfrah?.deliveryDaysMax,
    cutoffTime: johfrah?.cutoffTime,
    samedayDelivery: johfrah?.samedayDelivery,
    availability: johfrah?.availability,
    deliveryTime: johfrah?.deliveryTime
  }, null, 2));
}

checkKirsten().catch(console.error);
