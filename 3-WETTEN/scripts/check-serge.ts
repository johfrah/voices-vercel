
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

import { sql } from 'drizzle-orm';
import { actors } from '../../1-SITE/packages/database/schema';
import { db } from '../../1-SITE/packages/database/src';

async function checkSerge() {
  console.log(`🔍 Forensische check voor Serge...\n`);

  try {
    const results = await db.select({
      id: actors.id,
      firstName: actors.firstName,
      lastName: actors.lastName,
      email: actors.email,
      status: actors.status
    }).from(actors).where(sql`LOWER(${actors.firstName}) LIKE 'serge%'`);

    if (results.length === 0) {
      console.log("❌ Geen acteur gevonden met de naam Serge.");
    } else {
      results.forEach(a => {
        console.log(`✅ Gevonden:`);
        console.log(`   ID: ${a.id}`);
        console.log(`   Voornaam: ${a.firstName}`);
        console.log(`   Familienaam: ${a.lastName || 'NIET INGEVULD'}`);
        console.log(`   E-mail: ${a.email || 'NIET INGEVULD'}`);
        console.log(`   Status: ${a.status}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Fout bij database query:", error);
    process.exit(1);
  }
}

checkSerge();
