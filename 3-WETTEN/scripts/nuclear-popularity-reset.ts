import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../1-SITE/packages/database/schema";
import { eq, and, sql } from "drizzle-orm";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });
const actors = schema.actors;

const legacyData = [
  { score: 5, wpId: 196832, name: "Christina" },
  { score: 10, wpId: 182508, name: "Johfrah" },
  { score: 20, wpId: 234829, name: "Goedele" },
  { score: 27, wpId: 183809, name: "Korneel" },
  { score: 35, wpId: 184071, name: "Kristien" },
  { score: 50, wpId: 238957, name: "Brecht" },
  { score: 60, wpId: 186533, name: "Serge" },
  { score: 70, wpId: 186362, name: "Gitta" },
  { score: 80, wpId: 258121, name: "Mona" },
  { score: 90, wpId: 182523, name: "Eveline" },
  { score: 90, wpId: 186167, name: "Charline" },
  { score: 90, wpId: 186539, name: "Mark" },
  { score: 90, wpId: 187188, name: "Mark (NL)" },
  { score: 90, wpId: 187940, name: "Laura" },
  { score: 90, wpId: 187949, name: "Patrick" },
  { score: 90, wpId: 187952, name: "Veerle" },
  { score: 90, wpId: 189009, name: "Birgit" },
  { score: 90, wpId: 189058, name: "Hannelore" },
  { score: 90, wpId: 190797, name: "Veerle" },
  { score: 90, wpId: 194242, name: "Sen" },
  { score: 90, wpId: 246059, name: "Maria (M)" },
  { score: 99, wpId: 186323, name: "Gwenny" },
  { score: 100, wpId: 207618, name: "Mark (Radio 538)" },
  { score: 105, wpId: 184388, name: "Machteld" },
  { score: 120, wpId: 187608, name: "Youri" },
  { score: 130, wpId: 183772, name: "Ilari" },
  { score: 130, wpId: 184239, name: "Ruben" },
  { score: 150, wpId: 216105, name: "Kristel" },
  { score: 152, wpId: 240103, name: "Carolina" },
  { score: 160, wpId: 186284, name: "Carolina" },
  { score: 180, wpId: 186112, name: "Jakob" },
  { score: 180, wpId: 186366, name: "Lotte" },
  { score: 180, wpId: 186373, name: "Sven" },
  { score: 180, wpId: 186379, name: "Bart" },
  { score: 190, wpId: 194248, name: "Ronald" },
  { score: 190, wpId: 196562, name: "Petra" },
  { score: 190, wpId: 203591, name: "Vera" },
  { score: 199, wpId: 182521, name: "Klaas" },
  { score: 199, wpId: 186288, name: "Sophie" },
  { score: 199, wpId: 186536, name: "Tom" },
  { score: 199, wpId: 186653, name: "Jeroen" },
  { score: 199, wpId: 186656, name: "Stephan" },
  { score: 199, wpId: 194214, name: "Lonneke" },
  { score: 199, wpId: 207663, name: "Chris" },
  { score: 220, wpId: 207660, name: "Michèle" },
  { score: 224, wpId: 240106, name: "Kirsten" },
  { score: 225, wpId: 207784, name: "Kirsten (StuBru)" },
  { score: 300, wpId: 203592, name: "Emma" },
  { score: 305, wpId: 226081, name: "Alyson" },
  { score: 305, wpId: 255862, name: "Darren" },
  { score: 310, wpId: 198586, name: "Sue" },
  { score: 310, wpId: 205727, name: "Mike" },
  { score: 315, wpId: 243232, name: "Silvia" },
  { score: 315, wpId: 258292, name: "Authentic Voice" },
  { score: 320, wpId: 187179, name: "Sylvia" },
  { score: 330, wpId: 186401, name: "Stephan" },
  { score: 330, wpId: 187185, name: "Kaja" },
  { score: 330, wpId: 219767, name: "Stephan (DE)" },
  { score: 340, wpId: 182525, name: "Sean" },
  { score: 340, wpId: 214252, name: "Sebastian" },
  { score: 350, wpId: 196306, name: "Stefan" },
  { score: 350, wpId: 205174, name: "Sarah" },
  { score: 350, wpId: 216126, name: "Yvonne" },
  { score: 350, wpId: 246138, name: "Yvonne (Psych)" },
  { score: 350, wpId: 251729, name: "Ramesh" },
  { score: 360, wpId: 251575, name: "Barbara Monaco" },
  { score: 360, wpId: 251590, name: "Giuseppe" },
];

async function nuclearPopularityReset() {
  console.log("☢️ NUCLEAR RESET: Cleaning up popularity scores...");

  console.log("Step 1: Resetting all actors to score 500...");
  await db.update(actors).set({ voiceScore: 500, menuOrder: 0 });

  console.log("Step 2: Applying legacy popularity scores...");
  for (const item of legacyData) {
    await db.update(actors)
      .set({ voiceScore: item.score })
      .where(eq(actors.wpProductId, item.wpId));
    console.log(`   - ${item.name} set to ${item.score}`);
  }

  console.log("Step 3: Applying manual corrections...");
  const corrections = [
    { name: "Annelies", score: 100 },
    { name: "Dunja", score: 100 },
    { name: "Catherine", score: 400 },
    { name: "Nicolas", score: 400 },
    { name: "Birgit K", score: 400 },
    { name: "Nadja", score: 400 },
    { name: "Sebastian", score: 400 },
    { name: "Veronique", score: 410 },
    { name: "Thomas", score: 411 },
    { name: "Bernard", score: 412 },
    { name: "Julie", score: 413 },
    { name: "Béatrice", score: 414 },
    { name: "Estelle", score: 415 },
    { name: "Marilyn", score: 416 },
    { name: "delphine", score: 417 },
  ];

  for (const item of corrections) {
    await db.update(actors)
      .set({ voiceScore: item.score })
      .where(sql`first_name ILIKE ${'%' + item.name + '%'}`);
    console.log(`   - Correction: ${item.name} set to ${item.score}`);
  }

  console.log("Step 4: Neutralizing Toos...");
  await db.update(actors)
    .set({ voiceScore: 500 })
    .where(sql`first_name ILIKE 'Toos'`);

  console.log("✅ NUCLEAR RESET COMPLETED.");
  await client.end();
}

nuclearPopularityReset().catch(console.error);
