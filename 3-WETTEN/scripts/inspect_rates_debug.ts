import { ilike } from "drizzle-orm";
import { db } from "./1-SITE/packages/database/src/index";
import { actors } from "./1-SITE/packages/database/src/schema/index";

async function inspectRates() {
  console.log("--- Inspecting Rates ---");
  
  const results = await db.select({
    id: actors.id,
    firstName: actors.firstName,
    rates: actors.rates
  })
  .from(actors)
  .where(ilike(actors.firstName, "%Sen%"))
  .limit(5);

  console.log(JSON.stringify(results, null, 2));
  
  const sampleActors = await db.select({
    id: actors.id,
    firstName: actors.firstName,
    rates: actors.rates
  })
  .from(actors)
  .limit(3);
  
  console.log("--- Sample Actors ---");
  console.log(JSON.stringify(sampleActors, null, 2));
  
  process.exit(0);
}

inspectRates().catch(err => {
  console.error(err);
  process.exit(1);
});
