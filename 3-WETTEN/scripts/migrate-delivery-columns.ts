import { db } from "../../1-SITE/packages/database/src";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("🚀 START: Database Migration (Delivery Date Columns)...");
  
  try {
    // Voeg kolommen toe via raw SQL (Drizzle schema update is al gedaan in code)
    await db.execute(sql`
      ALTER TABLE actors 
      ADD COLUMN IF NOT EXISTS delivery_date_min TIMESTAMP,
      ADD COLUMN IF NOT EXISTS delivery_date_min_priority INTEGER DEFAULT 0;
    `);
    
    console.log("✅ Migration voltooid! Kolommen toegevoegd.");
  } catch (error) {
    console.error("❌ Migration mislukt:", error);
  }
}

migrate().catch(console.error);
