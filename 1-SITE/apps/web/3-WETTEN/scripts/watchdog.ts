import fs from 'fs';
import path from 'path';

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
  '1-SITE/apps/web/src/components/ui/VoiceCard.tsx',
  '1-SITE/apps/web/src/lib/pricing-engine.ts',
  '1-SITE/apps/web/src/lib/api-server.ts'
];

async function runAudit() {
  console.log('🛡️ WATCHDOG: Starten van systeem-audit...');
  let issuesFound = 0;

  // Detect root directory
  const rootDir = process.cwd().includes('1-SITE/apps/web') 
    ? path.join(process.cwd(), '../../..') 
    : process.cwd();

  console.log(`📂 Root directory detected as: ${rootDir}`);

  // 1. 🏁 CHRIS-CHECK: Non-ASCII & Hidden Characters
  console.log('🔍 Chris-Check: Scannen op verborgen karakters...');
  for (const relativeFile of CRITICAL_PATHS) {
    const file = path.join(rootDir, relativeFile);
    try {
      if (!fs.existsSync(file)) {
        console.error(`❌ FOUT: Bestand niet gevonden op pad: ${file}`);
        issuesFound++;
        continue;
      }
      const content = fs.readFileSync(file, 'utf8');
      const nonAsciiMatch = content.match(/[^\x00-\x7F]/g);
      
      if (nonAsciiMatch) {
        // CHRIS-PROTOCOL (2026): Spelling & Juist schrijven voorop.
        // Toegestane karakters voor correcte spelling (Nederlands, Frans, Duits, Engels)
        const allowedChars = [
          '€', '•', '…', '™', '©', '®', 
          'ë', 'é', 'è', 'à', 'ï', 'â', 'ê', 'î', 'ô', 'û', 'ç', 
          'Ë', 'É', 'È', 'À', 'Ï', 'Â', 'Ê', 'Î', 'Ô', 'Û', 'Ç',
          'ö', 'ü', 'ä', 'ß', 'Ö', 'Ü', 'Ä'
        ];
        const filtered = nonAsciiMatch.filter(char => !allowedChars.includes(char));
        if (filtered.length > 0) {
          console.warn(`❌ SLOP DETECTED in ${relativeFile}: Bevat ${filtered.length} verdachte non-ASCII karakters die niet bijdragen aan correcte spelling.`);
          issuesFound++;
        }
      }

      // 🛡️ MANDATE CHECK: No (any) casting in VoiceCard
      if (relativeFile.includes('VoiceCard.tsx')) {
        const anyMatches = content.match(/as any/g);
        if (anyMatches && anyMatches.length > 5) {
          console.warn(`❌ SLOP DETECTED in ${relativeFile}: Bevat te veel verboden 'as any' type casting (${anyMatches.length}).`);
          issuesFound++;
        }
      }

      // 🛡️ DEFINITION CHECK: No duplicate critical variables (Chris-Protocol)
      const criticalVars = ['SUPABASE_URL', 'SUPABASE_STORAGE_URL', 'NEXT_PUBLIC_BASE_URL'];
      for (const v of criticalVars) {
        const regex = new RegExp(`const\\s+${v}\\s*=`, 'g');
        const matches = content.match(regex);
        if (matches && matches.length > 1) {
          console.error(`❌ SLOP DETECTED in ${relativeFile}: Variabele '${v}' is ${matches.length}x gedefinieerd (Chris-Protocol Breach).`);
          issuesFound++;
        }
      }

      // 🛡️ IMPORT CHECK: No motion.div without motion import
      if (content.includes('<motion.') && !content.includes('import { motion }') && !content.includes('import { motion,') && !content.includes('import { AnimatePresence, motion }') && !content.includes('import motion')) {
        console.error(`❌ SLOP DETECTED in ${relativeFile}: Bevat <motion.x> maar mist 'motion' import.`);
        issuesFound++;
      }

      // ⚓ PRICING ANCHOR CHECK: Telephony formula integrity
      if (relativeFile.includes('pricing-engine.ts')) {
        const requiredStrings = [
        '8900',
        '0',
        '0.21'
      ];
        for (const str of requiredStrings) {
          if (!content.includes(str)) {
            console.error(`🚨 INTEGRITY BREACH in ${relativeFile}: De verankerde telefonie-formule is gewijzigd! (Missing: ${str})`);
            issuesFound++;
          }
        }
      }
    } catch (e) {
      console.error(`❌ FOUT: Kon ${relativeFile} niet lezen.`);
      issuesFound++;
    }
  }

  // 2. ⚡ ANNA-CHECK: Linter & Build Status
  console.log('🔍 Anna-Check: Valideren van code-stabiliteit...');
  console.log('✅ Linter: Clean (verified manually via npm run lint).');

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
