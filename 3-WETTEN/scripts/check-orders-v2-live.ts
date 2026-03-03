#!/usr/bin/env tsx
/**
 * Orders V2 Live Reconciliation
 * Dec 2025 parity + mapping integrity for legacy -> orders_v2.
 */

import { db } from '../../packages/database/src/index';
import { sql } from 'drizzle-orm';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

type SqlRows = { rows?: any[] } | any[];

function getRows(result: SqlRows): any[] {
  return Array.isArray(result) ? result : (result.rows || []);
}

function toNumber(value: unknown): number {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function checkOrdersV2Live() {
  const startDate = process.env.MIGRATION_FROM || '2025-12-01';
  const endDate = process.env.MIGRATION_TO || '2026-01-01';
  const strict = process.env.STRICT === '1';

  console.log(`🔎 Reconciliation window: ${startDate} -> ${endDate}`);

  const sourceCountResult = await db.execute(sql`
    select count(*)::int as value
    from orders o
    where o.created_at >= ${startDate}
      and o.created_at < ${endDate}
      and o.wp_order_id is not null
  `);
  const sourceCount = toNumber(getRows(sourceCountResult)[0]?.value);

  const targetCountResult = await db.execute(sql`
    select count(*)::int as value
    from orders_v2 v2
    where v2.created_at >= ${startDate}
      and v2.created_at < ${endDate}
  `);
  const targetCount = toNumber(getRows(targetCountResult)[0]?.value);

  const missingInV2Result = await db.execute(sql`
    select o.wp_order_id
    from orders o
    left join orders_v2 v2 on v2.id = o.wp_order_id
    where o.created_at >= ${startDate}
      and o.created_at < ${endDate}
      and o.wp_order_id is not null
      and v2.id is null
    order by o.wp_order_id desc
    limit 50
  `);
  const missingInV2 = getRows(missingInV2Result).map((row) => Number(row.wp_order_id));

  const extraInV2Result = await db.execute(sql`
    select v2.id as wp_order_id
    from orders_v2 v2
    left join orders o on o.wp_order_id = v2.id
    where v2.created_at >= ${startDate}
      and v2.created_at < ${endDate}
      and o.wp_order_id is null
    order by v2.id desc
    limit 50
  `);
  const extraInV2 = getRows(extraInV2Result).map((row) => Number(row.wp_order_id));

  const bridgeMismatchesResult = await db.execute(sql`
    select
      v2.id as wp_order_id,
      v2.legacy_internal_id,
      o.id as legacy_order_id,
      o.wp_order_id as legacy_wp_order_id
    from orders_v2 v2
    left join orders o on o.id = v2.legacy_internal_id
    where v2.created_at >= ${startDate}
      and v2.created_at < ${endDate}
      and (
        v2.legacy_internal_id is null
        or o.id is null
        or o.wp_order_id is distinct from v2.id
      )
    order by v2.id desc
    limit 50
  `);
  const bridgeMismatches = getRows(bridgeMismatchesResult);

  const rawMetaCoverageResult = await db.execute(sql`
    select
      v2.id as wp_order_id
    from orders_v2 v2
    left join orders_legacy_bloat b on b.wp_order_id = v2.id
    where v2.created_at >= ${startDate}
      and v2.created_at < ${endDate}
      and (
        b.wp_order_id is null
        or b.raw_meta is null
      )
    order by v2.id desc
    limit 50
  `);
  const missingRawMeta = getRows(rawMetaCoverageResult).map((row) => Number(row.wp_order_id));

  const amountMismatchResult = await db.execute(sql`
    select count(*)::int as value
    from orders o
    join orders_v2 v2 on v2.id = o.wp_order_id
    where o.created_at >= ${startDate}
      and o.created_at < ${endDate}
      and abs(
        coalesce(v2.amount_net::numeric, 0) -
        (
          coalesce(o.total::numeric, 0) -
          case
            when coalesce(o.raw_meta->>'_order_tax', '') ~ '^-?[0-9]+(\\.[0-9]+)?$'
              then (o.raw_meta->>'_order_tax')::numeric
            else 0
          end
        )
      ) > 0.01
  `);
  const amountMismatches = toNumber(getRows(amountMismatchResult)[0]?.value);

  const poMismatchResult = await db.execute(sql`
    select count(*)::int as value
    from orders o
    join orders_v2 v2 on v2.id = o.wp_order_id
    where o.created_at >= ${startDate}
      and o.created_at < ${endDate}
      and coalesce(v2.purchase_order, '') <> coalesce(
        nullif(o.raw_meta->>'_billing_po', ''),
        nullif(o.raw_meta->>'billing_po', ''),
        ''
      )
  `);
  const poMismatches = toNumber(getRows(poMismatchResult)[0]?.value);

  const billingEmailMismatchResult = await db.execute(sql`
    select count(*)::int as value
    from orders o
    join orders_v2 v2 on v2.id = o.wp_order_id
    where o.created_at >= ${startDate}
      and o.created_at < ${endDate}
      and coalesce(v2.billing_email_alt, '') <> coalesce(
        nullif(o.raw_meta->>'_billing_department_email', ''),
        ''
      )
  `);
  const billingEmailMismatches = toNumber(getRows(billingEmailMismatchResult)[0]?.value);

  const itemCoverageResult = await db.execute(sql`
    select count(*)::int as value
    from orders_v2 v2
    where v2.created_at >= ${startDate}
      and v2.created_at < ${endDate}
      and v2.legacy_internal_id is not null
      and not exists (
        select 1
        from order_items oi
        where oi.order_id = v2.legacy_internal_id
      )
  `);
  const ordersWithoutItems = toNumber(getRows(itemCoverageResult)[0]?.value);

  const nullMappingResult = await db.execute(sql`
    select
      count(*)::int as total,
      count(*) filter (where v2.journey_id is null)::int as missing_journey,
      count(*) filter (where v2.status_id is null)::int as missing_status,
      count(*) filter (where v2.payment_method_id is null)::int as missing_payment
    from orders_v2 v2
    where v2.created_at >= ${startDate}
      and v2.created_at < ${endDate}
  `);
  const nullMappingRow = getRows(nullMappingResult)[0] || {};
  const missingJourney = toNumber(nullMappingRow.missing_journey);
  const missingStatus = toNumber(nullMappingRow.missing_status);
  const missingPayment = toNumber(nullMappingRow.missing_payment);

  const keyUniverseResult = await db.execute(sql`
    select
      key,
      count(*)::int as hits
    from orders o,
    lateral jsonb_object_keys(coalesce(o.raw_meta, '{}'::jsonb)) as key
    where o.created_at >= ${startDate}
      and o.created_at < ${endDate}
    group by key
    order by hits desc
    limit 40
  `);
  const keyUniverse = getRows(keyUniverseResult);

  const gates = {
    count_parity: sourceCount === targetCount,
    id_parity: missingInV2.length === 0 && extraInV2.length === 0,
    bridge_integrity: bridgeMismatches.length === 0,
    raw_meta_shadow: missingRawMeta.length === 0,
    amount_net_mapping: amountMismatches === 0,
    purchase_order_mapping: poMismatches === 0,
    billing_email_mapping: billingEmailMismatches === 0,
    item_linkage: ordersWithoutItems === 0,
    reference_mapping: missingJourney === 0 && missingStatus === 0 && missingPayment === 0,
  };

  const reconciliationPassed = Object.values(gates).every(Boolean);

  const report = {
    generated_at: new Date().toISOString(),
    window: { startDate, endDate },
    source_count: sourceCount,
    target_count: targetCount,
    missing_in_v2: missingInV2,
    extra_in_v2: extraInV2,
    bridge_mismatches: bridgeMismatches,
    missing_raw_meta: missingRawMeta,
    amount_mismatches: amountMismatches,
    purchase_order_mismatches: poMismatches,
    billing_email_mismatches: billingEmailMismatches,
    orders_without_items: ordersWithoutItems,
    missing_journey_id: missingJourney,
    missing_status_id: missingStatus,
    missing_payment_method_id: missingPayment,
    key_universe_top40: keyUniverse,
    gates,
    reconciliation_passed: reconciliationPassed,
  };

  const reportFile = path.resolve(
    process.cwd(),
    `3-WETTEN/reports/december-2025-reconciliation-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );

  await writeFile(reportFile, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n📊 DECEMBER 2025 RECONCILIATION');
  console.log('----------------------------------------');
  console.log(`Source count (orders):     ${sourceCount}`);
  console.log(`Target count (orders_v2):  ${targetCount}`);
  console.log(`Missing in V2:             ${missingInV2.length}`);
  console.log(`Extra in V2:               ${extraInV2.length}`);
  console.log(`Bridge mismatches:         ${bridgeMismatches.length}`);
  console.log(`Missing raw_meta shadow:   ${missingRawMeta.length}`);
  console.log(`Amount net mismatches:     ${amountMismatches}`);
  console.log(`PO mismatches:             ${poMismatches}`);
  console.log(`Billing email mismatches:  ${billingEmailMismatches}`);
  console.log(`Orders without items:      ${ordersWithoutItems}`);
  console.log(`Missing journey_id:        ${missingJourney}`);
  console.log(`Missing status_id:         ${missingStatus}`);
  console.log(`Missing payment_method_id: ${missingPayment}`);
  console.log(`Overall pass:              ${reconciliationPassed ? 'YES' : 'NO'}`);
  console.log(`Report file:               ${reportFile}`);

  if (missingInV2.length > 0) {
    console.log(`\n⚠️ Missing in V2 sample: ${missingInV2.slice(0, 10).join(', ')}`);
  }
  if (extraInV2.length > 0) {
    console.log(`⚠️ Extra in V2 sample: ${extraInV2.slice(0, 10).join(', ')}`);
  }

  if (strict && !reconciliationPassed) {
    process.exit(1);
  }
}

checkOrdersV2Live()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Reconciliation failed:', error);
    process.exit(1);
  });
