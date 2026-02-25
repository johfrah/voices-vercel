
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("🔍 Forensic Audit: Checking for Duplicate First Names and Data Integrity...\n");

  // 1. Haal alle actoren op
  const { data: allActors, error } = await supabase
    .from('actors')
    .select('id, first_name, last_name, email, tagline, is_manually_edited');

  if (error || !allActors) {
    console.error("❌ Error fetching actors:", error?.message);
    return;
  }

  // 2. Groepeer op voornaam om dubbelen te vinden
  const nameGroups = new Map<string, any[]>();
  allActors.forEach(actor => {
    const name = (actor.first_name || "").trim().toLowerCase();
    if (!name) return;
    if (!nameGroups.has(name)) nameGroups.set(name, []);
    nameGroups.get(name)!.push(actor);
  });

  const duplicates = Array.from(nameGroups.entries()).filter(([name, actors]) => actors.length > 1);

  if (duplicates.length === 0) {
    console.log("✅ No duplicate first names found in the database.");
    return;
  }

  console.log(`⚠️ Found ${duplicates.length} first names that appear multiple times:\n`);

  for (const [name, actors] of duplicates) {
    console.log(`--- 👥 Name: "${name.toUpperCase()}" (${actors.length} actors) ---`);
    actors.forEach(a => {
      const status = a.is_manually_edited ? "🔒 MANUEEL" : "⏳ AUTO";
      console.log(`   [ID: ${a.id}] ${a.first_name} ${a.last_name || ""} | Email: ${a.email} | ${status}`);
      console.log(`   Tagline: ${a.tagline ? a.tagline.substring(0, 60) + "..." : "(LEEG)"}`);
      console.log("");
    });
  }

  console.log("\n✅ Duplicate check completed.");
}

main();
