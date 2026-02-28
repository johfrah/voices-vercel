import postgres from 'postgres';

async function assignWorld() {
  const args = process.argv.slice(2);
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL missing');
    process.exit(1);
  }

  const sql = postgres(connectionString, { prepare: false, ssl: { rejectUnauthorized: false } });

  if (args.length < 2) {
    console.log('💡 Gebruik: npx tsx 3-WETTEN/scripts/assign-world.ts [ORDER_ID of COMPANY_NAME] [WORLD_CODE]');
    console.log('Voorbeeld (ID): npx tsx 3-WETTEN/scripts/assign-world.ts 6383 freelance');
    console.log('Voorbeeld (Bulk): npx tsx 3-WETTEN/scripts/assign-world.ts "VRT" freelance');
    process.exit(0);
  }

  const target = args[0];
  const worldCode = args[1];

  try {
    const [world] = await sql`SELECT id FROM worlds WHERE code = ${worldCode}`;
    if (!world) {
      console.error(`❌ World code '${worldCode}' niet gevonden.`);
      process.exit(1);
    }

    let updatedCount = 0;

    if (!isNaN(parseInt(target))) {
      // Target is an ID
      const result = await sql`
        UPDATE orders SET world_id = ${world.id} WHERE id = ${target}
      `;
      await sql`UPDATE orders_v2 SET world_id = ${world.id} WHERE id = ${target}`;
      updatedCount = 1;
      console.log(`✅ Order ${target} toegewezen aan World: ${worldCode}`);
    } else {
      // Target is a Company Name (Bulk)
      const result = await sql`
        UPDATE orders 
        SET world_id = ${world.id} 
        WHERE raw_meta->>'_billing_company' ILIKE ${'%' + target + '%'}
        AND world_id IS NULL
      `;
      updatedCount = result.count;
      
      // Also update orders_v2 (matching by ID from orders)
      if (updatedCount > 0) {
        await sql`
          UPDATE orders_v2 
          SET world_id = ${world.id} 
          WHERE id IN (
            SELECT id FROM orders 
            WHERE raw_meta->>'_billing_company' ILIKE ${'%' + target + '%'}
            AND world_id = ${world.id}
          )
        `;
      }
      console.log(`✅ ${updatedCount} orders voor bedrijf '${target}' toegewezen aan World: ${worldCode}`);
    }

  } catch (error) {
    console.error('❌ Update Failed:', error);
  }
  process.exit(0);
}

assignWorld();
