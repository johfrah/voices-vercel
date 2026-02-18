import { db } from "./1-SITE/packages/database/src/index";
import { translations } from "./1-SITE/packages/database/src/schema/index";
import { eq, and } from "drizzle-orm";

async function fix() {
  console.log("Checking translation for studio.hero.title...");
  const results = await db.select().from(translations).where(eq(translations.translationKey, "studio.hero.title"));
  console.log("Current results:", JSON.stringify(results, null, 2));
  
  if (results.length > 0) {
    console.log("Updating translation...");
    await db.update(translations)
      .set({ translatedText: "Workshops voor professionele sprekers." })
      .where(eq(translations.translationKey, "studio.hero.title"));
    console.log("Update complete.");
  }
}

fix().catch(console.error);
