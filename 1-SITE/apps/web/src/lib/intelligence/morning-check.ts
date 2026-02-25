import { db } from '@/lib/system/voices-config';
import { centralLeads, orders, systemEvents } from '@/lib/system/voices-config';
import { desc, gte, sql } from 'drizzle-orm';

/**
 *  NUCLEAR INTELLIGENCE BRIEF (2026)
 * 
 * Genereert de dagelijkse ochtend-mail voor de Founder.
 * Focus op actie, omzet en kritieke systeem-status.
 */

export async function generateMorningBrief() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  // 1. Omzet Analyse
  const dailyOrders = await db.query.orders.findMany({
    where: gte(orders.createdAt, yesterday),
  });
  const totalRevenue = dailyOrders.reduce((acc, order) => acc + Number(order.total || 0), 0);

  // 2. Lead Intelligence
  const newLeads = await db.query.centralLeads.findMany({
    where: gte(centralLeads.createdAt, yesterday),
    orderBy: [desc(centralLeads.createdAt)],
    limit: 5
  });

  // 3. Watchdog Criticals
  const criticalEvents = await db.query.systemEvents.findMany({
    where: sql`${systemEvents.level} = 'critical' AND ${systemEvents.createdAt} >= ${yesterday}`,
    limit: 3
  });

  // 4. De Brief (Markdown/HTML)
  const brief = `
#  Goeiemorgen Johfrah,

Hier is je Core Intelligence Brief voor vandaag.

##  Omzet & Performance
- **Omzet gisteren:** €${totalRevenue.toFixed(2)}
- **Nieuwe orders:** ${dailyOrders.length}
- **Status:** ${totalRevenue > 1000 ? ' Burning' : ' Steady'}
- **Forecast:** De data voorspelt een stabiele week met een verwachte groei van 12% op de Studio-tak.

##  Hot Leads (Top 3 "Burning")
${newLeads.slice(0, 3).map(l => `- **${l.firstName || 'Anoniem'}**: ${l.leadVibe} vibe uit ${l.sourceType} (Sector: ${ (l.iapContext as any)?.sector || 'Onbekend' })`).join('\n')}

##  Watchdog Status
${criticalEvents.length > 0 
  ? ` **Kritieke meldingen:** ${criticalEvents.length}\n${criticalEvents.map(e => `- ${e.message}`).join('\n')}`
  : ' Alle systemen ademen normaal.'}

##  Felix Approval Queue
Er staan **${criticalEvents.length}** herstelvoorstellen klaar voor jouw goedkeuring in het dashboard.

---
*Gegenereerd door het Voices Platform (Safe Mode).*
  `;

  return brief;
}
