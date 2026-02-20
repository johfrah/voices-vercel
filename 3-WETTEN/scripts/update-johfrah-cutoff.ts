import { db } from '../../1-SITE/packages/database/src';
import { actors } from '../../1-SITE/packages/database/src/schema';
import { eq, sql } from 'drizzle-orm';

async function updateJohfrahCutoff() {
  console.log("🚀 START: Updating Johfrah Cutoff to 13:00...");
  
  try {
    // Update Johfrah naar Same-Day (voor 13:00)
    console.log("✨ Updating Johfrah (ID 1760) cutoff to 13:00...");
    await db.execute(sql`
      UPDATE actors 
      SET 
        cutoff_time = '13:00',
        delivery_time = 'Vandaag geleverd (indien besteld voor 13:00)',
        updated_at = ${new Date().toISOString()}
      WHERE id = 1760
    `);

    console.log("✅ Johfrah cutoff succesvol bijgewerkt naar 13:00!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Fout bij database update:", error);
    process.exit(1);
  }
}

updateJohfrahCutoff();
