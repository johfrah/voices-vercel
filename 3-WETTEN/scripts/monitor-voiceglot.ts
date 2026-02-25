#!/usr/bin/env tsx
/**
 * 🔍 VOICEGLOT LIVE MONITOR
 * 
 * Dit script monitort de live status van het Voiceglot systeem door
 * herhaaldelijk de database te pollen en de voortgang te rapporteren.
 */

import { db } from '../../1-SITE/packages/database';
import { translations, translationRegistry } from '../../1-SITE/packages/database/schema';
import { sql, desc } from 'drizzle-orm';

const POLL_INTERVAL = 5000; // 5 seconden
const MAX_CYCLES = 12; // 1 minuut monitoring (12 x 5s)

interface VoiceglotSnapshot {
  timestamp: string;
  totalStrings: number;
  coverage: {
    lang: string;
    count: number;
    percentage: number;
  }[];
  healingItems: number;
  recentActivity: any[];
}

async function fetchSnapshot(): Promise<VoiceglotSnapshot> {
  const timestamp = new Date().toISOString();
  
  // Totaal aantal strings in registry
  const totalStringsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(translationRegistry);
  const totalStrings = Number(totalStringsResult[0]?.count || 0);

  // Aantal vertalingen per taal
  const statsByLang = await db
    .select({
      lang: translations.lang,
      count: sql<number>`count(*)`
    })
    .from(translations)
    .groupBy(translations.lang);

  // Bereken coverage percentages
  const targetLanguages = ['en', 'fr', 'de', 'es', 'pt', 'it'];
  const coverage = targetLanguages.map(lang => {
    const found = statsByLang.find(s => s.lang === lang);
    const count = found ? Number(found.count) : 0;
    return {
      lang,
      count,
      percentage: totalStrings > 0 ? Math.min(100, Math.round((count / totalStrings) * 100)) : 0
    };
  });

  // Check voor items die recent zijn geüpdatet (laatste 10 seconden = "healing")
  const tenSecondsAgo = new Date(Date.now() - 10000);
  const recentActivity = await db
    .select()
    .from(translations)
    .where(sql`${translations.updatedAt} > ${tenSecondsAgo}`)
    .orderBy(desc(translations.updatedAt))
    .limit(10);

  return {
    timestamp,
    totalStrings,
    coverage,
    healingItems: recentActivity.length,
    recentActivity: recentActivity.slice(0, 3) // Toon alleen top 3
  };
}

function formatSnapshot(snapshot: VoiceglotSnapshot, cycleNumber: number): string {
  const lines: string[] = [];
  
  lines.push(`\n${'='.repeat(80)}`);
  lines.push(`📊 VOICEGLOT LIVE MONITOR - Cycle ${cycleNumber}`);
  lines.push(`⏰ ${new Date(snapshot.timestamp).toLocaleTimeString('nl-BE')}`);
  lines.push(`${'='.repeat(80)}`);
  
  lines.push(`\n📚 Total Strings in Registry: ${snapshot.totalStrings}`);
  
  lines.push(`\n🌍 Translation Coverage:`);
  snapshot.coverage.forEach(({ lang, count, percentage }) => {
    const bar = '█'.repeat(Math.floor(percentage / 5));
    const empty = '░'.repeat(20 - Math.floor(percentage / 5));
    const langDisplay = lang.toUpperCase().padEnd(4);
    lines.push(`   ${langDisplay} [${bar}${empty}] ${percentage}% (${count}/${snapshot.totalStrings})`);
  });
  
  if (snapshot.healingItems > 0) {
    lines.push(`\n🔧 Active Healing: ${snapshot.healingItems} items updated in last 10s`);
    if (snapshot.recentActivity.length > 0) {
      lines.push(`   Recent translations:`);
      snapshot.recentActivity.forEach(item => {
        const langCode = item.lang || 'unknown';
        const key = item.translationKey || 'unknown';
        lines.push(`   • [${langCode}] ${key.substring(0, 50)}...`);
      });
    }
  } else {
    lines.push(`\n✅ No active healing (system stable)`);
  }
  
  return lines.join('\n');
}

async function monitor() {
  console.log('🚀 Starting Voiceglot Live Monitor...');
  console.log(`📡 Polling every ${POLL_INTERVAL}ms for ${MAX_CYCLES} cycles`);
  
  let previousSnapshot: VoiceglotSnapshot | null = null;
  
  for (let i = 1; i <= MAX_CYCLES; i++) {
    try {
      const snapshot = await fetchSnapshot();
      console.log(formatSnapshot(snapshot, i));
      
      // Detecteer veranderingen
      if (previousSnapshot) {
        const changes: string[] = [];
        
        if (snapshot.totalStrings !== previousSnapshot.totalStrings) {
          const diff = snapshot.totalStrings - previousSnapshot.totalStrings;
          changes.push(`📈 Total strings changed: ${diff > 0 ? '+' : ''}${diff}`);
        }
        
        snapshot.coverage.forEach((curr, idx) => {
          const prev = previousSnapshot.coverage[idx];
          if (curr.percentage !== prev.percentage) {
            const diff = curr.percentage - prev.percentage;
            changes.push(`📊 ${curr.lang.toUpperCase()} coverage: ${prev.percentage}% → ${curr.percentage}% (${diff > 0 ? '+' : ''}${diff}%)`);
          }
        });
        
        if (changes.length > 0) {
          console.log('\n🔔 CHANGES DETECTED:');
          changes.forEach(change => console.log(`   ${change}`));
        }
      }
      
      previousSnapshot = snapshot;
      
      // Wacht voor de volgende cycle (behalve bij de laatste)
      if (i < MAX_CYCLES) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }
      
    } catch (error) {
      console.error(`\n❌ Error in cycle ${i}:`, error);
    }
  }
  
  console.log('\n✅ Monitoring completed');
  process.exit(0);
}

monitor().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
