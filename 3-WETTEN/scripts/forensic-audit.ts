import { db } from '../../1-SITE/packages/database/src/index';
import { systemEvents } from '../../1-SITE/packages/database/src/schema/index';
import { desc, gte, and } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import fs from 'fs';

// 🛡️ CHRIS-PROTOCOL: Flexible env loading
const envPath = fs.existsSync('.env.local') ? '.env.local' : '1-SITE/apps/web/.env.local';
dotenv.config({ path: envPath });

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  bold: "\x1b[1m"
};

async function runForensicAudit() {
  console.log(`\n${COLORS.bold}🔍 VOICES FORENSIC AUDIT (Post-Push Validation)${COLORS.reset}\n`);

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  try {
    console.log(`${COLORS.blue}📡 Checking Vault for recent anomalies (last 5 mins)...${COLORS.reset}`);
    
    const recentErrors = await db.select()
      .from(systemEvents)
      .where(and(
        gte(systemEvents.createdAt, fiveMinutesAgo),
        gte(systemEvents.level, 'warn')
      ))
      .orderBy(desc(systemEvents.createdAt));

    if (recentErrors.length === 0) {
      console.log(`   ${COLORS.green}✅ No recent errors found. System is healthy.${COLORS.reset}`);
      process.exit(0);
    } else {
      console.log(`   ${COLORS.red}❌ Found ${recentErrors.length} recent anomalies!${COLORS.reset}\n`);
      
      recentErrors.forEach((err: any) => {
        const time = new Date(err.createdAt).toLocaleTimeString('nl-BE');
        console.log(`${COLORS.bold}[${time}] [${err.level.toUpperCase()}] [${err.source}]${COLORS.reset}`);
        console.log(`   Message: ${err.message}`);
        if (err.details) {
          console.log(`   Details: ${JSON.stringify(err.details, null, 2)}`);
        }
        console.log('   ---');
      });
      
      process.exit(1);
    }
  } catch (e: any) {
    console.error(`${COLORS.red}❌ Audit failed to connect to database:${COLORS.reset}`, e.message);
    process.exit(1);
  }
}

runForensicAudit();
