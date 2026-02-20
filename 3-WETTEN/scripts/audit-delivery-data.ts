import { db } from '../../1-SITE/packages/database/src';
import { actors } from '../../1-SITE/packages/database/src/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

async function generateAudit() {
  console.log("🚀 START: Delivery Data Audit...");
  
  try {
    const liveActors = await db.select().from(actors).where(eq(actors.status, 'live'));
    
    let md = "# 🎙️ Voices Delivery Data Audit (2026)\n\n";
    md += "Dit overzicht toont de huidige status van de levertijden voor alle 'live' stemacteurs in de database.\n\n";
    
    md += "### 💡 Legenda\n";
    md += "- **Min/Max**: Het aantal werkdagen voor levering.\n";
    md += "- **Cutoff**: De dagelijkse deadline. Na dit tijdstip telt de huidige dag niet meer mee.\n";
    md += "- **SameDay 🚀**: Acteurs die op dezelfde dag kunnen leveren (indien voor cutoff besteld).\n";
    md += "- **Sorteer Datum**: De datum die het systeem gebruikt om de volgorde te bepalen (Nuclear God Mode).\n";
    md += "- **Prio**: Een interne 'tie-breaker'. SameDay acteurs krijgen Prio 1 zodat ze bij een gelijke datum ALTIJD boven 24u acteurs staan.\n\n";

    md += "| Naam | Taal | WP ID | Min | Max | Cutoff | SameDay | Sorteer Datum | Prio | Status |\n";
    md += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n";
    
    const langOrder = ['nl-be', 'nl-nl', 'fr', 'en', 'de'];
    
    const getLangRank = (lang: string | null) => {
      if (!lang) return 999;
      const l = lang.toLowerCase();
      if (l.includes('nl-be')) return 0;
      if (l.includes('nl-nl') || l === 'nl' || l === 'nederlands') return 1;
      if (l.includes('fr')) return 2;
      if (l.includes('en')) return 3;
      if (l.includes('de')) return 4;
      return 999;
    };

    liveActors.sort((a, b) => {
      const rankA = getLangRank(a.nativeLang);
      const rankB = getLangRank(b.nativeLang);
      
      if (rankA !== rankB) return rankA - rankB;
      
      const dateA = a.deliveryDateMin ? new Date(a.deliveryDateMin).getTime() : Infinity;
      const dateB = b.deliveryDateMin ? new Date(b.deliveryDateMin).getTime() : Infinity;
      
      if (dateA !== dateB) return dateA - dateB;
      
      const prioA = a.deliveryDateMinPriority || 0;
      const prioB = b.deliveryDateMinPriority || 0;
      
      if (prioA !== prioB) return prioB - prioA;
      
      return a.firstName.localeCompare(b.firstName);
    }).forEach(actor => {
      const name = `${actor.firstName} ${actor.lastName || ''}`.trim();
      const is24u = actor.deliveryDaysMax === 1 || (actor.deliveryTime && actor.deliveryTime.includes('24u'));
      const status = is24u ? "✅ 24u" : "🕒 72u";
      const lang = actor.nativeLang || '-';
      const sortDate = actor.deliveryDateMin ? new Date(actor.deliveryDateMin).toLocaleDateString('nl-BE') : '-';
      
      md += `| ${name} | ${lang} | ${actor.wpProductId || '-'} | ${actor.deliveryDaysMin || 1} | ${actor.deliveryDaysMax || 3} | ${actor.cutoffTime || '-'} | ${actor.samedayDelivery ? '🚀' : '-'} | ${sortDate} | ${actor.deliveryDateMinPriority || 0} | ${status} |\n`;
    });
    
    const outputPath = path.join(process.cwd(), 'DELIVERY_AUDIT.md');
    fs.writeFileSync(outputPath, md);
    console.log(`✅ Audit voltooid! Zie ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Fout bij audit:", error);
    process.exit(1);
  }
}

generateAudit();
