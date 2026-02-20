import { db } from "../../1-SITE/packages/database/src";
import { actors } from "../../1-SITE/packages/database/src/schema";
import { eq, sql } from "drizzle-orm";

async function debugSorting() {
  console.log("🔍 NUCLEAR DEBUG: Checking Top 10 Actors by Delivery Date...");
  
  // We gebruiken raw SQL om de query exact te controleren
  const results = await db.execute(sql`
    SELECT id, first_name, delivery_date_min, delivery_date_min_priority, delivery_days_min
    FROM actors
    WHERE status = 'live'
    ORDER BY delivery_date_min ASC, delivery_date_min_priority DESC
    LIMIT 10
  `);

  console.table(results);
}

debugSorting().catch(console.error);
