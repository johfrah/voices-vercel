import { db } from '@/lib/system/db';
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
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

    let mdContent = "#  Overzicht Vaste Workshop Kosten (Marketing & Algemeen)\n\n";
    mdContent += "Dit overzicht bevat de kosten die niet direct aan één specifieke workshop-editie zijn gekoppeld.\n\n";

    if (fixedCosts.rows.length === 0) {
      mdContent += "##  Prognose (Op basis van gebruikers-input)\n\n";
      mdContent += "| Periode | Omschrijving | Categorie | Bedrag | Status |\n";
      mdContent += "| :--- | :--- | :--- | :--- | :--- |\n";
      mdContent += "| Maandelijks | Google Ads | marketing | 3.000,00 | Schatting |\n";
      mdContent += "| Maandelijks | Instagram Ads | marketing | 3.000,00 | Schatting |\n";
      mdContent += "| **TOTAAL** | | | **6.000,00** | |\n";
    } else {
      mdContent += "| Datum | Omschrijving | Categorie | Bedrag | Notities |\n";
      mdContent += "| :--- | :--- | :--- | :--- | :--- |\n";
      
      fixedCosts.rows.forEach((row: any) => {
        const dateStr = new Date(row.date).toLocaleDateString('nl-BE');
        mdContent += `| ${dateStr} | ${row.description} | ${row.category} | ${parseFloat(row.amount).toLocaleString('nl-BE')} | ${row.notes || '-'} |\n`;
      });
    }

    return new NextResponse(mdContent, {
      headers: { 'Content-Type': 'text/markdown' }
    });

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
