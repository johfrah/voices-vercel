import { db } from '../../1-SITE/packages/database/src/index';
import { marketConfigs, worlds, languages } from '../../1-SITE/packages/database/src/schema';

async function main() {
  try {
    const configs = await db.select().from(marketConfigs);
    console.log('--- Market Configs ---');
    console.log(JSON.stringify(configs, null, 2));

    const allWorlds = await db.select().from(worlds);
    console.log('\n--- Worlds ---');
    console.log(JSON.stringify(allWorlds, null, 2));

    const allLangs = await db.select().from(languages);
    console.log('\n--- Languages ---');
    console.log(JSON.stringify(allLangs, null, 2));
  } catch (err) {
    console.error('Error during introspection:', err);
  }
}

main().catch(console.error);
