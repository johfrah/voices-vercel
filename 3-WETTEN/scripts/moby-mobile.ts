import { execSync } from 'child_process';
import fs from 'fs';

async function auditMobile() {
  console.log('\n📱 [MOBY-MOBILE] STARTING THUMB-ZONE & PERFORMANCE AUDIT...');
  console.log('-------------------------------------------------------');

  const issues: string[] = [];

  // 1. Check for Viewport Meta
  const layoutPath = '1-SITE/apps/web/src/app/layout.tsx';
  if (fs.existsSync(layoutPath)) {
    const content = fs.readFileSync(layoutPath, 'utf8');
    if (content.includes('viewport') || content.includes('initial-scale=1')) {
      console.log('✅ VIEWPORT: Mobile-responsive meta tags aanwezig.');
    } else {
      issues.push('Viewport meta tag ontbreekt in layout.tsx.');
    }
  }

  // 2. Scan for Small Text (Chris-Protocol: min 15px)
  console.log('⏳ TYPOGRAPHY: Scannen naar tekst kleiner dan 15px...');
  try {
    // Zoek naar text-xs of text-[...px] waarbij px < 15
    const smallText = execSync('grep -r "text-xs" 1-SITE/apps/web/src/components | wc -l').toString().trim();
    if (parseInt(smallText) > 0) {
      issues.push(`${smallText} elementen gevonden met text-xs (mogelijk kleiner dan 15px).`);
    } else {
      console.log('✅ TYPOGRAPHY: Geen text-xs gevonden. Chris is tevreden.');
    }
  } catch (e) {}

  // 3. Check for Mobile Navigation
  const navPath = '1-SITE/apps/web/src/components/ui/GlobalNav.tsx';
  if (fs.existsSync(navPath)) {
    const content = fs.readFileSync(navPath, 'utf8');
    if (content.includes('Mobile') || content.includes('Sheet') || content.includes('Menu')) {
      console.log('✅ NAVIGATION: Mobile-specific navigatie gedetecteerd.');
    } else {
      issues.push('Geen expliciete mobile navigatie gevonden in GlobalNav.');
    }
  }

  // 4. Check for Image Optimization
  console.log('⏳ ASSETS: Controleren op Next.js Image component...');
  try {
    const rawImages = execSync('grep -r "<img" 1-SITE/apps/web/src/components | wc -l').toString().trim();
    if (parseInt(rawImages) > 0) {
      issues.push(`${rawImages} raw <img> tags gevonden. Gebruik <Image /> van Next.js voor LCP optimalisatie.`);
    } else {
      console.log('✅ ASSETS: Next.js Image component wordt overal gebruikt.');
    }
  } catch (e) {}

  console.log('-------------------------------------------------------');
  if (issues.length === 0) {
    console.log('🚀 [MOBY-MOBILE] STATUS: CRISPY. De Thumb-Zone is heilig.');
  } else {
    console.log(`⚠️  [MOBY-MOBILE] AANDACHTSPUNTEN (${issues.length}):`);
    issues.forEach(issue => console.log(`- ${issue}`));
    process.exit(1);
  }
}

auditMobile();
