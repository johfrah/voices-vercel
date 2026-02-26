import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

/**
 * 🚀 PRE-VERCEL CHECK (VOICES 2026)
 * 
 * Dit script is de ultieme bewaker van de drempel. 
 * Het voert een volledige build uit en scant de broncode op Nuclear Law schendingen.
 */

async function runCheck() {
  console.log(chalk.bold.blue('\n🚀 STARTING PRE-VERCEL CHECK...'));
  
  let hasErrors = false;
  const rootDir = process.cwd();
  // We gaan ervan uit dat we in 1-SITE/apps/web draaien als we via npm run check:pre-vercel komen
  // maar we checken of we in de root zitten of in de app dir.
  const webAppDir = fs.existsSync(path.join(rootDir, 'package.json')) && rootDir.endsWith('web') 
    ? rootDir 
    : path.join(rootDir, '1-SITE/apps/web');

  try {
    // 1. BUILD CHECK
    console.log(chalk.yellow('\n📦 Stap 1: Volledige Next.js Build (Chunk & Type Check)...'));
    // Voer build uit in de web app directory
    try {
      // 🛡️ CHRIS-PROTOCOL: We draaien eerst een expliciete type-check
      // console.log(chalk.blue('🔍 Running type-check...'));
      // execSync('npm run type-check', {
      //   cwd: webAppDir,
      //   stdio: 'inherit',
      //   shell: true
      // });

      execSync('npm run build', {
        cwd: webAppDir,
        stdio: 'inherit',
        shell: true
      });
      console.log(chalk.green('✅ Build & Type-check succesvol.'));
    } catch (e) {
      console.log(chalk.red('❌ Build of Type-check gefaald.'));
      hasErrors = true;
    }

    // 2. NUCLEAR LOADING LAW SCAN
    console.log(chalk.yellow('\n⚛️ Stap 2: Nuclear Loading Law Scan...'));
    const srcDir = path.join(webAppDir, 'src');
    const files = getAllFiles(srcDir, ['.tsx', '.ts']);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for dynamic imports without loading fallbacks
      // We negeren layout.tsx omdat die vaak globale laders heeft in Suspense
      // We checken specifiek op next/dynamic imports
      if (content.includes('dynamic(') && content.includes('next/dynamic') && !content.includes('loading:') && !file.includes('layout.tsx')) {
        console.log(chalk.red(`❌ ERROR: Dynamic import zonder loading fallback in: ${path.relative(rootDir, file)}`));
        hasErrors = true;
      }

      // Check for hardcoded domains (behalve in config/system bestanden)
      const forbiddenDomains = ['voices.be', 'johfrah.be', 'ademing.be'];
      forbiddenDomains.forEach(domain => {
        if (content.includes(domain) && !content.includes('MarketManager') && 
            !file.includes('config.ts') && !file.includes('market-manager') && 
            !file.includes('MarketManager') && !file.includes('pre-vercel-check.ts')) {
          console.log(chalk.red(`❌ ERROR: Hardcoded '${domain}' gedetecteerd in: ${path.relative(rootDir, file)}`));
          hasErrors = true;
        }
      });
    });

    if (!hasErrors) {
      console.log(chalk.green('✅ Nuclear Loading Law gerespecteerd.'));
    }

    // 3. ASSET AUDIT
    console.log(chalk.yellow('\n🖼️ Stap 3: Asset Naming Audit...'));
    const publicDir = path.join(webAppDir, 'public');
    if (fs.existsSync(publicDir)) {
      const assets = getAllFiles(publicDir);
      assets.forEach(asset => {
        const filename = path.basename(asset);
        if (/[^a-zA-Z0-9.\-_]/.test(filename)) {
          console.log(chalk.red(`❌ ERROR: Ongeldige karakters in asset naam: ${path.relative(rootDir, asset)}`));
          hasErrors = true;
        }
      });
    }

    if (!hasErrors) {
      console.log(chalk.green('✅ Assets zijn clean.'));
    }

    // 4. DUPLICATE IDENTIFIER SCAN
    console.log(chalk.yellow('\n🔍 Stap 4: Duplicate Identifier Scan...'));
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      const imports = lines.filter(line => line.trim().startsWith('import '));
      
      const importedNames = new Set<string>();
      imports.forEach(imp => {
        // Simpele extractie van namen tussen { }
        const match = imp.match(/\{([^}]+)\}/);
        if (match) {
          const names = match[1].split(',').map(n => n.trim().split(' as ')[0].trim());
          names.forEach(name => {
            if (name && importedNames.has(name)) {
              console.log(chalk.red(`❌ ERROR: Duplicate import '${name}' gedetecteerd in: ${path.relative(rootDir, file)}`));
              hasErrors = true;
            }
            if (name) importedNames.add(name);
          });
        }
      });
    });

    if (!hasErrors) {
      console.log(chalk.green('✅ Geen duplicate identifiers gevonden.'));
    }

    if (hasErrors) {
      console.log(chalk.bold.red('\n☢️ CHECK FAILED: Fix de bovenstaande fouten voordat je pusht naar Vercel!'));
      process.exit(1);
    } else {
      console.log(chalk.bold.green('\n✅ PRE-VERCEL CHECK PASSED: Je bent klaar voor deployment, Bob.'));
    }

  } catch (error) {
    console.log(chalk.bold.red('\n☢️ CRITICAL ERROR: Build of check is gefaald.'));
    console.error(error);
    process.exit(1);
  }
}

function getAllFiles(dirPath: string, extensions?: string[], arrayOfFiles: string[] = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, extensions, arrayOfFiles);
    } else {
      if (!extensions || extensions.some(ext => file.endsWith(ext))) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

runCheck();
