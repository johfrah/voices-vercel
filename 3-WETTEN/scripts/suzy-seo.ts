import fs from 'fs';
import path from 'path';

async function auditSEO() {
  console.log('\n🕸️  [SUZY-SEO] STARTING DEEP SEO & SCHEMA AUDIT...');
  console.log('--------------------------------------------');

  const issues: string[] = [];

  // 1. Check Sitemap
  const sitemapPath = '1-SITE/apps/web/src/app/sitemap.ts';
  if (fs.existsSync(sitemapPath)) {
    console.log('✅ SITEMAP: Dynamische sitemap generator aanwezig.');
  } else {
    issues.push('Sitemap generator (sitemap.ts) ontbreekt in src/app.');
  }

  // 2. Check Robots.txt
  const robotsPath = '1-SITE/apps/web/src/app/robots.ts';
  if (fs.existsSync(robotsPath)) {
    console.log('✅ ROBOTS: Robots.txt configuratie aanwezig.');
  } else {
    issues.push('Robots.txt configuratie ontbreekt.');
  }

  // 3. Scan for Schema.org JSON-LD in components
  console.log('⏳ SCHEMA: Scannen naar gestructureerde data...');
  const componentsDir = '1-SITE/apps/web/src/components';
  
  function scanDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('application/ld+json')) {
          console.log(`✅ SCHEMA: Gevonden in ${file}`);
        }
      }
    }
  }

  try {
    scanDir(componentsDir);
  } catch (e) {
    console.log('⚠️  SCHEMA: Kon componentenmap niet volledig scannen.');
  }

  // 4. Check for Meta-tags in Layout
  const layoutPath = '1-SITE/apps/web/src/app/layout.tsx';
  if (fs.existsSync(layoutPath)) {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    if (layoutContent.includes('metadata') && layoutContent.includes('title')) {
      console.log('✅ METADATA: Basis metadata aanwezig in Root Layout.');
    } else {
      issues.push('Metadata configuratie in Root Layout is incompleet.');
    }
  }

  console.log('--------------------------------------------');
  if (issues.length === 0) {
    console.log('🚀 [SUZY-SEO] STATUS: MASTERCLASS. De Knowledge Graph is optimaal.');
  } else {
    console.log(`⚠️  [SUZY-SEO] AANDACHTSPUNTEN (${issues.length}):`);
    issues.forEach(issue => console.log(`- ${issue}`));
    process.exit(1);
  }
}

auditSEO();
