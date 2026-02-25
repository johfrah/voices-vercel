
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { or, sql } from 'drizzle-orm';
import { actors } from '../../1-SITE/packages/database/schema';
import { db } from '../../1-SITE/packages/database/src';

async function verifyActorData() {
  console.log(`🔍 Verifiëren van specifieke actor data (Joel & Mark)...\n`);

  try {
    const results = await db.select({
      id: actors.id,
      firstName: actors.firstName,
      lastName: actors.lastName,
      nativeLang: actors.nativeLang,
      rates: actors.rates,
      wpId: actors.wpProductId
    }).from(actors).where(or(
      sql`LOWER(${actors.firstName}) LIKE 'joel%'`,
      sql`LOWER(${actors.firstName}) LIKE 'mark%'`
    ));

    console.log(`| Name | WP ID | Native Lang | Rates JSON Keys |`);
    console.log(`| :--- | :--- | :--- | :--- |`);
    
    results.forEach(a => {
      const rateKeys = a.rates ? Object.keys(a.rates as object).join(', ') : 'null';
      console.log(`| ${a.firstName} ${a.lastName} | ${a.wpId} | ${a.nativeLang} | ${rateKeys} |`);
    });

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

verifyActorData();
