import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../1-SITE/packages/database/schema";
import { eq, and } from "drizzle-orm";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });
const actors = schema.actors;

async function generateAudit() {
  console.log("Fetching live actors for audit...");
  
  const liveActors = await db.select({
    id: actors.id,
    wpProductId: actors.wpProductId,
    firstName: actors.firstName,
    nativeLang: actors.nativeLang,
    deliveryDaysMin: actors.deliveryDaysMin,
    deliveryDaysMax: actors.deliveryDaysMax,
    cutoffTime: actors.cutoffTime,
    samedayDelivery: actors.samedayDelivery,
    voiceScore: actors.voiceScore,
    status: actors.status,
    deliveryDateMin: actors.deliveryDateMin,
    deliveryDateMinPriority: actors.deliveryDateMinPriority
  })
  .from(actors)
  .where(eq(actors.status, 'live'))
  .orderBy(actors.firstName);

  let mdContent = "# 🎙️ Voices Delivery Data Audit (2026)\n\n";
  mdContent += "Dit overzicht toont de huidige status van de levertijden en populariteit voor alle 'live' stemacteurs in de database.\n\n";
  mdContent += "### 💡 Legenda\n";
  mdContent += "- **Min/Max**: Het aantal werkdagen voor levering.\n";
  mdContent += "- **Cutoff**: De dagelijkse deadline. Na dit tijdstip telt de huidige dag niet meer mee.\n";
  mdContent += "- **SameDay 🚀**: Acteurs die op dezelfde dag kunnen leveren (indien voor cutoff besteld).\n";
  mdContent += "- **Score ⭐**: De populariteitsscore (lager is populairder, 10 is standaard).\n";
  mdContent += "- **Sorteer Datum**: De datum die het systeem gebruikt om de volgorde te bepalen.\n\n";
  
  mdContent += "| Naam | Taal | WP ID | Min | Max | Cutoff | SameDay | Score ⭐ | Sorteer Datum | Prio | Status |\n";
  mdContent += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n";

  for (const actor of liveActors) {
    const sameDay = actor.samedayDelivery ? "🚀" : "-";
    const sortDate = actor.deliveryDateMin ? new Date(actor.deliveryDateMin).toLocaleDateString('nl-BE') : "-";
    const statusEmoji = (actor.deliveryDaysMax || 0) <= 1 ? "✅ 24u" : "🕒 72u";
    
    mdContent += `| ${actor.firstName} | ${actor.nativeLang || '-'} | ${actor.wpProductId || '-'} | ${actor.deliveryDaysMin || '-'} | ${actor.deliveryDaysMax || '-'} | ${actor.cutoffTime || '-'} | ${sameDay} | ${actor.voiceScore || 10} | ${sortDate} | ${actor.deliveryDateMinPriority || 0} | ${statusEmoji} |\n`;
  }

  fs.writeFileSync(path.join(process.cwd(), "1-SITE/apps/web/DELIVERY_AUDIT.md"), mdContent);
  fs.writeFileSync(path.join(process.cwd(), "DELIVERY_AUDIT.md"), mdContent);
  console.log("DELIVERY_AUDIT.md updated successfully.");
  
  await client.end();
}

generateAudit().catch(console.error);
