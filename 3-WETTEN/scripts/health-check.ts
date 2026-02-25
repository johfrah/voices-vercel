import { execSync } from 'child_process';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bold: "\x1b[1m"
};

console.log(`\n${COLORS.bold}📊 VOICES BUSINESS INTELLIGENCE${COLORS.reset}\n`);

// 1. GIT STATUS
try {
  const gitStatus = execSync('git status --porcelain').toString().trim();
  const branch = execSync('git branch --show-current').toString().trim();
  console.log(`${COLORS.blue}📂 PROJECT STATUS (${branch})${COLORS.reset}`);
  if (gitStatus) {
    const lines = gitStatus.split('\n').length;
    console.log(`   ${COLORS.yellow}⚠️  ${lines} bestanden gewijzigd (nog niet vastgelegd)${COLORS.reset}`);
  } else {
    console.log(`   ${COLORS.green}✅ Clean Working Directory${COLORS.reset}`);
  }
} catch (e) {
  console.log(`   ${COLORS.red}❌ Git check failed${COLORS.reset}`);
}

// 2. DATABASE CONNECTIVITY
console.log(`\n${COLORS.blue}🗄️  DATABASE CONNECTIVITEIT${COLORS.reset}`);
if (process.env.DATABASE_URL) {
    // Simple check if URL looks valid
    if (process.env.DATABASE_URL.includes('supabase.com')) {
        console.log(`   ${COLORS.green}✅ Supabase URL geconfigureerd${COLORS.reset}`);
    } else {
        console.log(`   ${COLORS.yellow}⚠️  Lokale/Andere Database URL${COLORS.reset}`);
    }
} else {
    console.log(`   ${COLORS.red}❌ Geen DATABASE_URL gevonden${COLORS.reset}`);
}

// 3. LAST BUILD STATUS
console.log(`\n${COLORS.blue}🏗️  LAATSTE BUILD${COLORS.reset}`);
if (fs.existsSync('1-SITE/apps/web/.next')) {
    const stats = fs.statSync('1-SITE/apps/web/.next');
    console.log(`   ${COLORS.green}✅ Build aanwezig${COLORS.reset} (Laatst gewijzigd: ${stats.mtime.toLocaleString()})`);
} else {
    console.log(`   ${COLORS.yellow}⚠️  Geen build cache gevonden (Run Bob)${COLORS.reset}`);
}

// 4. AGENT READINESS
console.log(`\n${COLORS.blue}🤖 AGENT STATUS${COLORS.reset}`);
const agents = [
    { name: 'Chris (Watchdog)', path: '3-WETTEN/scripts/watchdog.ts' },
    { name: 'Mark (Voiceglot)', path: '3-WETTEN/scripts/voiceglot-fixer.ts' },
    { name: 'Bob (Orchestrator)', path: '3-WETTEN/scripts/orchestrator.ts' }
];

agents.forEach(agent => {
    if (fs.existsSync(agent.path)) {
        console.log(`   ${COLORS.green}✅ ${agent.name} is online${COLORS.reset}`);
    } else {
        console.log(`   ${COLORS.red}❌ ${agent.name} ontbreekt!${COLORS.reset}`);
    }
});

console.log(`\n${COLORS.bold}🏁 CONCLUSIE:${COLORS.reset}`);
console.log("Run 'Bob' voor volledige synchronisatie of 'Felix' bij problemen.\n");
