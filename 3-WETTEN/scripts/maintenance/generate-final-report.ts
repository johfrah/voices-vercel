import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateFinalReport() {
  console.log('📊 Generating Final Demo Relations Report with Demoreel classification...');

  // 1. Fetch all actors with at least one demo
  const { data: actorsWithDemos, error: actorsError } = await supabase
    .from('actors')
    .select('id, first_name, last_name, wp_product_id')
    .order('first_name');

  if (actorsError) throw actorsError;

  // 2. Fetch all demos (handling pagination)
  let allDemos: any[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: demos, error: demosError } = await supabase
      .from('actor_demos')
      .select('id, actor_id, name, url, type, menu_order')
      .range(from, from + 999);

    if (demosError) throw demosError;
    if (demos && demos.length > 0) {
      allDemos = [...allDemos, ...demos];
      from += 1000;
    } else {
      hasMore = false;
    }
  }

  // Filter actors to only include those who actually HAVE demos
  const actors = actorsWithDemos.filter(actor => allDemos.some(d => d.actor_id === actor.id));

  let report = '# 🎙️ Demo Relations Report (FINAL - LIVE)\n\n';
  report += `*Gegenereerd op: ${new Date().toLocaleString()}*\n`;
  report += `*Totaal aantal live stemmen (met demo's): ${actors.length}*\n`;
  report += `*Totaal aantal gekoppelde demo's: ${allDemos.length}*\n\n`;
  
  report += '## 📑 Overzicht per Stem\n\n';

  for (const actor of actors) {
    const actorDemos = allDemos.filter(d => d.actor_id === actor.id);
    const wpId = actor.wp_product_id || 'GEEN ID';
    const fullName = `${actor.first_name} ${actor.last_name || ''}`.trim();
    
    report += `### ${fullName} (${wpId})\n`;
    report += `**ID:** \`${actor.id}\` | **WP ID:** \`${wpId}\` | **Demo's:** ${actorDemos.length}\n\n`;

    if (actorDemos.length > 0) {
      const demoreels = actorDemos.filter(d => d.menu_order > 0).sort((a, b) => a.menu_order - b.menu_order);
      const clientSpecific = actorDemos.filter(d => d.menu_order === 0);

      if (demoreels.length > 0) {
        report += '#### 🎭 Primary Demoreels\n';
        report += '| ID | Type | Titel | URL |\n';
        report += '| :--- | :--- | :--- | :--- |\n';
        demoreels.forEach(d => {
          report += `| ${d.id} | **${d.type.toUpperCase()}** | ${d.name} | [Link](${d.url}) |\n`;
        });
        report += '\n';
      }

      if (clientSpecific.length > 0) {
        report += '#### 📂 Client-Specific Demos\n';
        report += '| ID | Titel | URL |\n';
        report += '| :--- | :--- | :--- | :--- |\n';
        clientSpecific.forEach(d => {
          report += `| ${d.id} | ${d.name} | [Link](${d.url}) |\n`;
        });
      }
    } else {
      report += '> ⚠️ Geen demo\'s gekoppeld in Supabase.\n';
    }
    report += '\n---\n\n';
  }

  fs.writeFileSync('3-WETTEN/docs/5-CONTENT-AND-MARKETING/06-DEMO-RELATIONS-REPORT.md', report);
  console.log('✅ Report generated: 3-WETTEN/docs/5-CONTENT-AND-MARKETING/06-DEMO-RELATIONS-REPORT.md');
}

generateFinalReport().catch(console.error);
