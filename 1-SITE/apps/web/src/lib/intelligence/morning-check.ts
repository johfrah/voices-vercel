import { db } from '@db';
import { centralLeads, orders, systemEvents } from '@db/schema';
import { desc, gte, sql } from 'drizzle-orm';

/**
 * 🌅 NUCLEAR INTELLIGENCE BRIEF (2026)
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
# 🌅 Goeiemorgen Johfrah,

Hier is je Core Intelligence Brief voor vandaag.

## 💰 Omzet & Performance
- **Omzet gisteren:** €${totalRevenue.toFixed(2)}
- **Nieuwe orders:** ${dailyOrders.length}
- **Status:** ${totalRevenue > 1000 ? '🔥 Burning' : '✨ Steady'}

## 🎯 Hot Leads (Top 5)
${newLeads.map(l => `- **${l.firstName || 'Anoniem'}**: ${l.leadVibe} vibe uit ${l.sourceType}`).join('\n')}

## 🛡️ Watchdog Status
${criticalEvents.length > 0 
  ? `🚨 **Kritieke meldingen:** ${criticalEvents.length}\n${criticalEvents.map(e => `- ${e.message}`).join('\n')}`
  : '✅ Alle systemen ademen normaal.'}

---
*Gegenereerd door het Voices Platform.*
  `;

  return brief;
}
