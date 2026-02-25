import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL not found');

const client = postgres(connectionString, { ssl: 'require' });

interface AuditResult {
  check_type: string;
  [key: string]: any;
}

interface DataHealthReport {
  slugUniqueness: {
    duplicates: number;
    details: Array<{ table: string; slug: string; count: number }>;
  };
  languageIntegrity: {
    missingNativeLang: number;
    livePublicMissingNativeLang: number;
    nativeLangInRelation: number;
    noNativeLangAnywhere: number;
    detailedMissing: Array<any>;
  };
  statusConsistency: {
    totalLiveActors: number;
    missingSlug: number;
    missingFirstName: number;
    missingEmail: number;
    detailedMissing: Array<any>;
  };
  languageTable: {
    duplicateCodes: number;
    inconsistentLabels: number;
    details: Array<any>;
  };
  orphanedRelations: {
    actorLanguages: number;
    actorDemos: number;
    languageRefs: number;
  };
  totalSlop: number;
}

async function runAudit(): Promise<DataHealthReport> {
  const report: DataHealthReport = {
    slugUniqueness: { duplicates: 0, details: [] },
    languageIntegrity: {
      missingNativeLang: 0,
      livePublicMissingNativeLang: 0,
      nativeLangInRelation: 0,
      noNativeLangAnywhere: 0,
      detailedMissing: []
    },
    statusConsistency: {
      totalLiveActors: 0,
      missingSlug: 0,
      missingFirstName: 0,
      missingEmail: 0,
      detailedMissing: []
    },
    languageTable: {
      duplicateCodes: 0,
      inconsistentLabels: 0,
      details: []
    },
    orphanedRelations: {
      actorLanguages: 0,
      actorDemos: 0,
      languageRefs: 0
    },
    totalSlop: 0
  };

  console.log('🔍 Starting Deep Data Integrity Audit...\n');

  // 1. SLUG UNIQUENESS
  console.log('1️⃣ Checking slug uniqueness...');
  const duplicateSlugs = await client`
    SELECT 'actors' as table_name, slug, COUNT(*)::int as count
    FROM actors
    WHERE slug IS NOT NULL
    GROUP BY slug
    HAVING COUNT(*) > 1
    
    UNION ALL
    
    SELECT 'artists', slug, COUNT(*)::int
    FROM artists
    WHERE slug IS NOT NULL
    GROUP BY slug
    HAVING COUNT(*) > 1
    
    UNION ALL
    
    SELECT 'content_articles', slug, COUNT(*)::int
    FROM content_articles
    WHERE slug IS NOT NULL
    GROUP BY slug
    HAVING COUNT(*) > 1
    
    UNION ALL
    
    SELECT 'workshops', slug, COUNT(*)::int
    FROM workshops
    WHERE slug IS NOT NULL
    GROUP BY slug
    HAVING COUNT(*) > 1
  `;
  report.slugUniqueness.duplicates = duplicateSlugs.length;
  report.slugUniqueness.details = duplicateSlugs as any;
  report.totalSlop += duplicateSlugs.length;

  // 2. LANGUAGE INTEGRITY
  console.log('2️⃣ Checking language integrity...');
  const missingNativeLang = await client`
    SELECT 
      COUNT(*)::int as count,
      COUNT(CASE WHEN status = 'live' AND is_public = true THEN 1 END)::int as live_public_count
    FROM actors
    WHERE (native_lang IS NULL OR native_lang = '')
      AND (status = 'live' OR is_public = true)
  `;
  report.languageIntegrity.missingNativeLang = missingNativeLang[0]?.count || 0;
  report.languageIntegrity.livePublicMissingNativeLang = missingNativeLang[0]?.live_public_count || 0;

  const nativeLangInRelation = await client`
    SELECT COUNT(DISTINCT a.id)::int as count
    FROM actors a
    INNER JOIN actor_languages al ON a.id = al.actor_id
    WHERE (a.native_lang IS NULL OR a.native_lang = '')
      AND al.is_native = true
      AND (a.status = 'live' OR a.is_public = true)
  `;
  report.languageIntegrity.nativeLangInRelation = nativeLangInRelation[0]?.count || 0;

  const noNativeLangAnywhere = await client`
    SELECT COUNT(*)::int as count
    FROM actors a
    LEFT JOIN actor_languages al ON a.id = al.actor_id AND al.is_native = true
    WHERE a.status = 'live'
      AND (a.native_lang IS NULL OR a.native_lang = '')
      AND al.id IS NULL
  `;
  report.languageIntegrity.noNativeLangAnywhere = noNativeLangAnywhere[0]?.count || 0;
  report.totalSlop += noNativeLangAnywhere[0]?.count || 0;

  const detailedMissingNative = await client`
    SELECT 
      a.id,
      a.slug,
      a.first_name,
      a.status,
      a.is_public,
      a.native_lang,
      CASE WHEN al.id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_native_in_relation
    FROM actors a
    LEFT JOIN actor_languages al ON a.id = al.actor_id AND al.is_native = true
    WHERE a.status = 'live'
      AND (a.native_lang IS NULL OR a.native_lang = '')
      AND al.id IS NULL
    ORDER BY a.id
  `;
  report.languageIntegrity.detailedMissing = detailedMissingNative as any;

  // 3. STATUS CONSISTENCY
  console.log('3️⃣ Checking status consistency...');
  const missingCriticalFields = await client`
    SELECT 
      COUNT(*)::int as total_live_actors,
      COUNT(CASE WHEN slug IS NULL OR slug = '' THEN 1 END)::int as missing_slug,
      COUNT(CASE WHEN first_name IS NULL OR first_name = '' THEN 1 END)::int as missing_first_name,
      COUNT(CASE WHEN email IS NULL OR email = '' THEN 1 END)::int as missing_email
    FROM actors
    WHERE status = 'live'
  `;
  report.statusConsistency.totalLiveActors = missingCriticalFields[0]?.total_live_actors || 0;
  report.statusConsistency.missingSlug = missingCriticalFields[0]?.missing_slug || 0;
  report.statusConsistency.missingFirstName = missingCriticalFields[0]?.missing_first_name || 0;
  report.statusConsistency.missingEmail = missingCriticalFields[0]?.missing_email || 0;
  report.totalSlop += (missingCriticalFields[0]?.missing_slug || 0) + 
                      (missingCriticalFields[0]?.missing_first_name || 0) + 
                      (missingCriticalFields[0]?.missing_email || 0);

  const detailedMissingFields = await client`
    SELECT 
      id,
      slug,
      first_name,
      email,
      status,
      CASE WHEN slug IS NULL OR slug = '' THEN 'MISSING_SLUG' ELSE 'OK' END as slug_status,
      CASE WHEN first_name IS NULL OR first_name = '' THEN 'MISSING_FIRST_NAME' ELSE 'OK' END as first_name_status,
      CASE WHEN email IS NULL OR email = '' THEN 'MISSING_EMAIL' ELSE 'OK' END as email_status
    FROM actors
    WHERE status = 'live'
      AND (slug IS NULL OR slug = '' OR first_name IS NULL OR first_name = '' OR email IS NULL OR email = '')
    ORDER BY id
  `;
  report.statusConsistency.detailedMissing = detailedMissingFields as any;

  // 4. LANGUAGE TABLE AUDIT
  console.log('4️⃣ Checking language table...');
  const duplicateLanguageCodes = await client`
    SELECT code, COUNT(*)::int as count, STRING_AGG(label, ', ') as labels
    FROM languages
    GROUP BY code
    HAVING COUNT(*) > 1
  `;
  report.languageTable.duplicateCodes = duplicateLanguageCodes.length;
  report.totalSlop += duplicateLanguageCodes.length;

  const inconsistentLabels = await client`
    SELECT code, COUNT(DISTINCT label)::int as distinct_labels, STRING_AGG(DISTINCT label, ', ') as labels
    FROM languages
    GROUP BY code
    HAVING COUNT(DISTINCT label) > 1
  `;
  report.languageTable.inconsistentLabels = inconsistentLabels.length;
  report.languageTable.details = [...duplicateLanguageCodes, ...inconsistentLabels] as any;
  report.totalSlop += inconsistentLabels.length;

  // 5. ORPHANED RELATIONS
  console.log('5️⃣ Checking orphaned relations...');
  const orphanedActorLanguages = await client`
    SELECT COUNT(*)::int as count
    FROM actor_languages al
    LEFT JOIN actors a ON al.actor_id = a.id
    WHERE a.id IS NULL
  `;
  report.orphanedRelations.actorLanguages = orphanedActorLanguages[0]?.count || 0;
  report.totalSlop += orphanedActorLanguages[0]?.count || 0;

  const orphanedActorDemos = await client`
    SELECT COUNT(*)::int as count
    FROM actor_demos ad
    LEFT JOIN actors a ON ad.actor_id = a.id
    WHERE a.id IS NULL
  `;
  report.orphanedRelations.actorDemos = orphanedActorDemos[0]?.count || 0;
  report.totalSlop += orphanedActorDemos[0]?.count || 0;

  const orphanedLanguageRefs = await client`
    SELECT COUNT(*)::int as count
    FROM actor_languages al
    LEFT JOIN languages l ON al.language_id = l.id
    WHERE l.id IS NULL
  `;
  report.orphanedRelations.languageRefs = orphanedLanguageRefs[0]?.count || 0;
  report.totalSlop += orphanedLanguageRefs[0]?.count || 0;

  await client.end();
  return report;
}

function printReport(report: DataHealthReport) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 DATA HEALTH REPORT - SUPABASE INTEGRITY AUDIT');
  console.log('='.repeat(60) + '\n');

  // Slug Uniqueness
  console.log('1️⃣ SLUG UNIQUENESS');
  console.log(`   Duplicate slugs found: ${report.slugUniqueness.duplicates}`);
  if (report.slugUniqueness.details.length > 0) {
    report.slugUniqueness.details.forEach((d: any) => {
      console.log(`   ❌ ${d.table_name}: "${d.slug}" appears ${d.count} times`);
    });
  } else {
    console.log('   ✅ No duplicate slugs found');
  }
  console.log('');

  // Language Integrity
  console.log('2️⃣ LANGUAGE INTEGRITY');
  console.log(`   Actors with missing native_lang (live/public): ${report.languageIntegrity.livePublicMissingNativeLang}`);
  console.log(`   Actors with native_lang in relation table: ${report.languageIntegrity.nativeLangInRelation}`);
  console.log(`   Live actors with NO native language anywhere: ${report.languageIntegrity.noNativeLangAnywhere}`);
  if (report.languageIntegrity.detailedMissing.length > 0) {
    console.log('   ❌ Detailed list:');
    report.languageIntegrity.detailedMissing.forEach((actor: any) => {
      console.log(`      - ID ${actor.id}: ${actor.first_name} (slug: ${actor.slug || 'N/A'})`);
    });
  } else {
    console.log('   ✅ All live actors have native language defined');
  }
  console.log('');

  // Status Consistency
  console.log('3️⃣ STATUS CONSISTENCY');
  console.log(`   Total live actors: ${report.statusConsistency.totalLiveActors}`);
  console.log(`   Missing slug: ${report.statusConsistency.missingSlug}`);
  console.log(`   Missing first_name: ${report.statusConsistency.missingFirstName}`);
  console.log(`   Missing email: ${report.statusConsistency.missingEmail}`);
  if (report.statusConsistency.detailedMissing.length > 0) {
    console.log('   ❌ Detailed list:');
    report.statusConsistency.detailedMissing.forEach((actor: any) => {
      const issues = [];
      if (actor.slug_status !== 'OK') issues.push('slug');
      if (actor.first_name_status !== 'OK') issues.push('first_name');
      if (actor.email_status !== 'OK') issues.push('email');
      console.log(`      - ID ${actor.id}: Missing ${issues.join(', ')}`);
    });
  } else {
    console.log('   ✅ All live actors have required fields');
  }
  console.log('');

  // Language Table
  console.log('4️⃣ LANGUAGE TABLE AUDIT');
  console.log(`   Duplicate language codes: ${report.languageTable.duplicateCodes}`);
  console.log(`   Inconsistent labels: ${report.languageTable.inconsistentLabels}`);
  if (report.languageTable.details.length > 0) {
    report.languageTable.details.forEach((lang: any) => {
      console.log(`   ❌ Code "${lang.code}": ${lang.labels}`);
    });
  } else {
    console.log('   ✅ Language table is clean');
  }
  console.log('');

  // Orphaned Relations
  console.log('5️⃣ ORPHANED RELATIONS');
  console.log(`   Orphaned actor_languages: ${report.orphanedRelations.actorLanguages}`);
  console.log(`   Orphaned actor_demos: ${report.orphanedRelations.actorDemos}`);
  console.log(`   Orphaned language references: ${report.orphanedRelations.languageRefs}`);
  if (report.orphanedRelations.actorLanguages === 0 && 
      report.orphanedRelations.actorDemos === 0 && 
      report.orphanedRelations.languageRefs === 0) {
    console.log('   ✅ No orphaned relations found');
  }
  console.log('');

  // Summary
  console.log('='.repeat(60));
  console.log(`🎯 TOTAL SLOP COUNT: ${report.totalSlop}`);
  console.log('='.repeat(60));
  
  if (report.totalSlop === 0) {
    console.log('\n✅ PERFECT INTEGRITY: Database is 100% clean!');
  } else {
    console.log(`\n⚠️  FOUND ${report.totalSlop} DATA INTEGRITY ISSUES`);
    console.log('   This is the foundation for building the 1-Truth Handshake.');
  }
  console.log('');
}

runAudit()
  .then(printReport)
  .catch((err) => {
    console.error('❌ Audit failed:', err);
    process.exit(1);
  });
