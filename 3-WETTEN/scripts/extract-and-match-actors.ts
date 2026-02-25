
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const sqlPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/4-KELDER/ID348299_voices (2).sql';

async function main() {
  console.log("🚀 Starting voice actor extraction and matching...");

  // 1. Extract voice-email from wp_postmeta
  console.log("📂 Extracting voice-email from SQL dump...");
  const tempFile = '/tmp/actor_emails.txt';
  const { execSync } = require('child_process');
  execSync(`grep "'voice-email'" "${sqlPath}" > ${tempFile}`);
  
  const emailsContent = fs.readFileSync(tempFile, 'utf8');
  const emailToWpMap = new Map<string, string>(); // email -> postId
  const emailRegex = /\(\d+,\s*(\d+),\s*'voice-email',\s*'([^']*)'\)/g;
  let match;
  while ((match = emailRegex.exec(emailsContent)) !== null) {
    if (match[2]) emailToWpMap.set(match[2].toLowerCase(), match[1]);
  }
  console.log(`✅ Found ${emailToWpMap.size} emails in wp_postmeta.`);

  // 2. Extract actors from wp_voices_actors to get names
  console.log("📂 Extracting actors from wp_voices_actors...");
  const actorsFile = '/tmp/actor_names.txt';
  execSync(`grep -A 2000 "INSERT INTO \\\`wp_voices_actors\\\`" "${sqlPath}" > ${actorsFile}`);
  const actorsContent = fs.readFileSync(actorsFile, 'utf8');
  const actorsFromSql = [];
  const actorRegex = /\((\d+),\s*'([^']+)',\s*'([^']*)',\s*'([^']+)'/g;
  while ((match = actorRegex.exec(actorsContent)) !== null) {
     actorsFromSql.push({
       actorId: match[1],
       firstName: match[2],
       lastName: match[3],
       email: match[4].toLowerCase()
     });
  }
  console.log(`✅ Found ${actorsFromSql.length} actors in wp_voices_actors.`);

  // 3. Fetch all actors from Supabase
  console.log("☁️ Fetching actors from Supabase...");
  const { data: supabaseActors, error } = await supabase
    .from('actors')
    .select('id, wp_product_id, first_name, email');

  if (error) {
    console.error("❌ Error fetching actors:", error);
    return;
  }
  console.log(`✅ Fetched ${supabaseActors?.length} actors from Supabase.`);

  // 4. Generate Markdown table
  let md = "| Actor ID | WooCommerce ID | Voornaam | Email | Supabase ID |\n";
  md += "| :--- | :--- | :--- | :--- | :--- |\n";

  for (const actor of actorsFromSql) {
    const wpId = emailToWpMap.get(actor.email) || "❌ Geen match";
    const supabaseActor = supabaseActors?.find(a => 
      (wpId !== "❌ Geen match" && String(a.wp_product_id) === wpId) || 
      (a.email?.toLowerCase() === actor.email)
    );
    const supabaseId = supabaseActor ? supabaseActor.id : "❌ Geen match";
    
    md += `| ${actor.actorId} | ${wpId} | ${actor.firstName} | ${actor.email} | ${supabaseId} |\n`;
  }

  fs.writeFileSync('/Users/voices/Library/CloudStorage/Dropbox/voices-headless/4-KELDER/VOICE-ACTORS-MATCHING.md', md);
  console.log("✅ Markdown list saved to 4-KELDER/VOICE-ACTORS-MATCHING.md");
}

main();
