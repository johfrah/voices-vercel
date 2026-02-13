import { execSync } from 'child_process';
import fs from 'fs';

async function auditAesthetics() {
  console.log('\n🎨 [LAYA-AESTHETIC] STARTING VOICES-MIX & DESIGN AUDIT...');
  console.log('------------------------------------------------------');

  const issues: string[] = [];

  // 1. Check for Raleway Mandate
  console.log('⏳ TYPOGRAPHY: Controleren op Raleway Mandate...');
  const tailwindConfig = '1-SITE/apps/web/tailwind.config.ts';
  if (fs.existsSync(tailwindConfig)) {
    const content = fs.readFileSync(tailwindConfig, 'utf8');
    if (content.includes('Raleway')) {
      console.log('✅ TYPOGRAPHY: Raleway is geconfigureerd.');
    } else {
      issues.push('Raleway font ontbreekt in tailwind.config.ts.');
    }
  }

  // 2. Check for Rounded Corners (Chris-Protocol: rounded-[20px])
  console.log('⏳ RADIUS: Scannen naar afwijkende afrondingen...');
  try {
    const wrongRadius = execSync('grep -r "rounded-lg" 1-SITE/apps/web/src/components | wc -l').toString().trim();
    if (parseInt(wrongRadius) > 10) { // Enkele uitzonderingen toegestaan
      issues.push(`${wrongRadius} elementen gebruiken rounded-lg. Gebruik rounded-[20px] voor de Voices-Mix.`);
    } else {
      console.log('✅ RADIUS: Afrondingen volgen de Voices-Mix standaard.');
    }
  } catch (e) {}

  // 3. Check for Liquid DNA
  console.log('⏳ ATMOSPHERE: Controleren op LiquidBackground...');
  try {
    const liquidUsage = execSync('grep -r "LiquidBackground" 1-SITE/apps/web/src/app | wc -l').toString().trim();
    if (parseInt(liquidUsage) > 0) {
      console.log(`✅ ATMOSPHERE: LiquidBackground wordt gebruikt op ${liquidUsage} pagina's.`);
    } else {
      issues.push('LiquidBackground niet gevonden in de app routes.');
    }
  } catch (e) {}

  // 4. Check for Natural Capitalization
  console.log('⏳ CONTENT: Scannen naar UPPERCASE slop...');
  try {
    const uppercaseSlop = execSync('grep -r "uppercase" 1-SITE/apps/web/src/components | grep -v "text-\\[10px\\]" | wc -l').toString().trim();
    if (parseInt(uppercaseSlop) > 5) {
      issues.push(`${uppercaseSlop} elementen gebruiken uppercase. Alleen toegestaan voor metadata < 10px.`);
    } else {
      console.log('✅ CONTENT: Natural Capitalization wordt gerespecteerd.');
    }
  } catch (e) {}

  console.log('------------------------------------------------------');
  if (issues.length === 0) {
    console.log('🚀 [LAYA-AESTHETIC] STATUS: BEAUTIFUL. De ziel ademt.');
  } else {
    console.log(`⚠️  [LAYA-AESTHETIC] AANDACHTSPUNTEN (${issues.length}):`);
    issues.forEach(issue => console.log(`- ${issue}`));
    process.exit(1);
  }
}

auditAesthetics();
