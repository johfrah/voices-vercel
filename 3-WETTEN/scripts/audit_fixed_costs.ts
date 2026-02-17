import { db } from "../../1-SITE/apps/web/src/lib/db";
import { sql } from "drizzle-orm";
import * as fs from 'fs';
import * as path from 'path';

async function auditFixedCosts() {
  console.log("🔍 Start audit vaste kosten via SQL...");

  try {
    const fixedCosts = await db.execute(sql`
      SELECT 
        description, 
        amount, 
        category, 
        date,
        notes
      FROM costs
      WHERE workshop_edition_id IS NULL OR category = 'marketing'
      ORDER BY date DESC
    `);

    let mdContent = "# 📊 Overzicht Vaste Workshop Kosten (Marketing & Algemeen)\n\n";
    mdContent += "Dit overzicht bevat de kosten die niet direct aan één specifieke workshop-editie zijn gekoppeld.\n\n";

    if (fixedCosts.rows.length === 0) {
      mdContent += "## 📅 Prognose (Op basis van gebruikers-input)\n\n";
      mdContent += "| Periode | Omschrijving | Categorie | Bedrag | Status |\n";
      mdContent += "| :--- | :--- | :--- | :--- | :--- |\n";
      mdContent += "| Maandelijks | Google Ads | marketing | €3.000,00 | Schatting |\n";
      mdContent += "| Maandelijks | Instagram Ads | marketing | €3.000,00 | Schatting |\n";
      mdContent += "| **TOTAAL** | | | **€6.000,00** | |\n";
    } else {
      mdContent += "| Datum | Omschrijving | Categorie | Bedrag | Notities |\n";
      mdContent += "| :--- | :--- | :--- | :--- | :--- |\n";
      
      fixedCosts.rows.forEach((row: any) => {
        const dateStr = new Date(row.date).toLocaleDateString('nl-BE');
        mdContent += `| ${dateStr} | ${row.description} | ${row.category} | €${parseFloat(row.amount).toLocaleString('nl-BE')} | ${row.notes || '-'} |\n`;
      });
    }

    const outputPath = '3-WETTEN/docs/5-CONTENT-AND-MARKETING/09-FIXED-COSTS-AUDIT.md';
    fs.writeFileSync(outputPath, mdContent);
    console.log(`✅ MD gegenereerd op: ${outputPath}`);
    process.exit(0);

  } catch (error) {
    console.error("❌ Fout bij SQL audit:", error);
    process.exit(1);
  }
}

auditFixedCosts();
