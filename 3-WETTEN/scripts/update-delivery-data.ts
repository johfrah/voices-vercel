import { db } from '../../1-SITE/packages/database/src';
import { actors } from '../../1-SITE/packages/database/src/schema';
import { eq, or, ilike, sql } from 'drizzle-orm';

async function updateDeliveryData() {
  console.log("🚀 START: Database Update Delivery Data...");
  
  try {
    // 1. Update Johfrah naar Same-Day (voor 12:00)
    console.log("✨ Updating Johfrah (ID 1760) to Same-Day...");
    await db.update(actors)
      .set({
        samedayDelivery: true,
        cutoffTime: '12:00',
        deliveryDaysMin: 0,
        deliveryDaysMax: 1,
        deliveryTime: 'Vandaag geleverd (indien besteld voor 12:00)',
        isManuallyEdited: true
      })
      .where(eq(actors.id, 1760));

    // 2. Corrigeer alle andere 24u acteurs
    // We zoeken op tekstuele aanwijzingen in deliveryTime
    console.log("✨ Correcting other 24u actors...");
    const result = await db.execute(sql`
      UPDATE actors 
      SET 
        delivery_days_min = 1,
        delivery_days_max = 1,
        is_manually_edited = true
      WHERE 
        status = 'live' 
        AND id != 1760
        AND (
          delivery_time ILIKE '%24u%' 
          OR delivery_time ILIKE '%1 werkdag%' 
          OR delivery_time ILIKE '%24h%'
        )
    `);

    console.log("✅ Database succesvol bijgewerkt!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Fout bij database update:", error);
    process.exit(1);
  }
}

updateDeliveryData();
