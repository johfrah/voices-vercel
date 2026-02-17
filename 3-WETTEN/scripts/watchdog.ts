import fs from 'fs';
import { execSync } from 'child_process';

/**
 * 🛡️ THE WATCHDOG (3-WETTEN)
 * 
 * Beheert de integriteit van het Voices Ecosysteem.
 * Draait proactief om 'Invisibility' en 'Slop' te voorkomen.
 */

const CRITICAL_PATHS = [
  '1-SITE/apps/web/src/app/layout.tsx',
  '1-SITE/apps/web/src/middleware.ts',
  '1-SITE/apps/web/src/app/page.tsx',
  '1-SITE/apps/web/src/components/ui/LayoutInstruments.tsx',
  '1-SITE/apps/web/src/components/ui/VoiceCard.tsx'
];

async function runAudit() {
  console.log('🛡️ WATCHDOG: Starten van systeem-audit...');
  let issuesFound = 0;

  // 1. 🏁 CHRIS-CHECK: Non-ASCII & Hidden Characters
  console.log('🔍 Chris-Check: Scannen op verborgen karakters...');
  for (const file of CRITICAL_PATHS) {
    try {
      if (!fs.existsSync(file)) {
        console.error(`❌ FOUT: Bestand niet gevonden: ${file}`);
        issuesFound++;
        continue;
      }
      const content = fs.readFileSync(file, 'utf8');
      const nonAsciiMatch = content.match(/[^\x00-\x7F]/g);
      
      if (nonAsciiMatch) {
        // Filter out common UI characters like € and •
        const filtered = nonAsciiMatch.filter(char => !['€', '•', '…', '™', '©', '®'].includes(char));
        if (filtered.length > 0) {
          console.warn(`❌ SLOP DETECTED in ${file}: Bevat ${filtered.length} verdachte non-ASCII karakters.`);
          issuesFound++;
        }
      }

      // 🛡️ MANDATE CHECK: No (any) casting in VoiceCard
      if (file.includes('VoiceCard.tsx')) {
        if (content.includes('(voice as any)') || content.includes('as any')) {
          console.warn(`❌ SLOP DETECTED in ${file}: Bevat verboden 'as any' type casting.`);
          issuesFound++;
        }
      }
    } catch (e) {
      console.error(`❌ FOUT: Kon ${file} niet lezen.`);
      issuesFound++;
    }
  }

  // 2. ⚡ ANNA-CHECK: Linter & Build Status
  console.log('🔍 Anna-Check: Valideren van code-stabiliteit...');
  try {
    execSync('cd 1-SITE/apps/web && npm run lint', { stdio: 'inherit' });
    console.log('✅ Linter: Clean.');
  } catch (e) {
    console.warn('❌ Linter: Bevat fouten die de build kunnen breken.');
    issuesFound++;
  }

  if (issuesFound > 0) {
    console.error(`\n🚨 AUDIT GEFAALD: ${issuesFound} integriteitsfouten gevonden.`);
    process.exit(1);
  } else {
    console.log('\n✅ AUDIT SUCCESVOL: Systeem is stabiel en clean.');
  }
}

runAudit().catch(err => {
  console.error('🚨 WATCHDOG CRASHED:', err);
  process.exit(1);
});
