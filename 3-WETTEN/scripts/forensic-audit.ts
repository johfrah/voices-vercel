import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

/**
 * 🛡️ NUCLEAR FORENSIC AUDIT (CHRIS-PROTOCOL 2026)
 * 
 * Doel: Automatische detectie van 'Slop' en protocol-schendingen.
 * Dit script is de onverbiddelijke bewaker van de code-integriteit.
 */

const ROOT_DIR = process.cwd();
const WEB_APP_DIR = fs.existsSync(path.join(ROOT_DIR, 'src')) 
  ? path.join(ROOT_DIR, 'src')
  : path.join(ROOT_DIR, '1-SITE/apps/web/src');

interface AuditIssue {
  file: string;
  line: number;
  type: 'error' | 'warning';
  message: string;
  context: string;
}

const issues: AuditIssue[] = [];

// 1. VERBODEN PATRONEN (REGEX)
const FORBIDDEN_PATTERNS = [
  {
    regex: /voices\.be|johfrah\.be|04[0-9]{8}|info@/gi,
    message: 'Hardcoded contactgegevens gedetecteerd. Gebruik MarketManager.',
    type: 'error' as const,
    exclude: [/market-manager.*\.ts/, /config\.ts/, /middleware\.ts/, /\.md$/, /log-explorer\.ts/, /db-cli\.ts/],
    test: (match: string, line: string) => {
      // Sta window.location.hostname toe
      if (line.includes('window.location.hostname')) return false;
      // Sta dynamische host variabelen toe die al berekend zijn via MarketManager
      if (line.includes('const host =') || line.includes('const finalHost =') || line.includes('const canonicalHost =')) {
        // Als de regel de variabele definieert, sta het toe als er geen hardcoded domein in staat (behalve als fallback)
        const cleanLine = line.replace(/'https?:\/\/'/g, '').replace(/'host'/g, '').replace(/'www\.'/g, '');
        if (!cleanLine.includes("'") && !cleanLine.includes('"')) return false;
        // Sta voices.be toe als het in een fallback zit (bijv. || 'voices.be')
        if (cleanLine.includes("|| 'voices.be'") || cleanLine.includes('|| "voices.be"')) return false;
        if (cleanLine.includes("|| 'www.voices.be'") || cleanLine.includes('|| "www.voices.be"')) return false;
        if (cleanLine.includes("|| 'www.voices.be'}") || cleanLine.includes('|| "www.voices.be"}')) return false;
        if (cleanLine.includes("|| 'www.voices.be'`") || cleanLine.includes('|| "www.voices.be"`')) return false;
        if (cleanLine.includes("|| 'voices.be'`") || cleanLine.includes('|| "voices.be"`')) return false;
      }
      // Sta JSDoc/comments toe
      if (line.trim().startsWith('*') || line.trim().startsWith('//')) return false;
      // Sta fallback in template literals toe
      if (line.includes("|| 'www.voices.be'") || line.includes('|| "www.voices.be"')) return false;
      return true;
    }
  },
  {
    regex: /<div|<span|<p|<h[1-6]/g,
    message: 'Rauwe HTML gedetecteerd. Gebruik LayoutInstruments.',
    type: 'warning' as const,
    exclude: [/LayoutInstruments\.tsx/, /VoiceglotText\.tsx/, /RichText\.tsx/, /instrument/i, /\.md$/]
  },
  {
    regex: /dynamic\(\(\) => import\(['"].*['"]\)/g,
    message: 'Zwaar instrument zonder { ssr: false } gedetecteerd.',
    type: 'error' as const,
    test: (match: string, line: string) => {
      // Als de regel ssr: false bevat, is het goed
      if (line.includes('ssr: false')) return false;
      // Als de regel dynamic opent maar niet sluit, moeten we in de volgende regels kijken
      // Maar aangezien we per regel auditen, kijken we of de regel de opening bevat
      // en of er ergens in de buurt ssr: false staat.
      // Voor nu: als de regel ssr: false bevat is het OK.
      return !line.includes('ssr: false');
    },
    exclude: [/\.md$/]
  },
  {
    regex: /['"]nl['"]|['"]fr['"]|['"]en['"]/g,
    message: 'Mogelijke non-ISO taalcode gedetecteerd. Gebruik ISO-5 (nl-BE).',
    type: 'warning' as const,
    exclude: [/market-manager.*\.ts/, /config\.ts/, /i18n/, /\.md$/]
  }
];

function auditFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  FORBIDDEN_PATTERNS.forEach(({ regex, message, type, exclude, test }) => {
    if (exclude?.some(pattern => pattern.test(filePath))) return;

    // Speciale afhandeling voor multi-line regex (zoals dynamic imports)
    if (regex.source.includes('dynamic')) {
      const fullContent = content;
      let match;
      const dynamicRegex = /dynamic\(\(\) => import\(['"](.*)['"]\),\s*\{([^}]*)\}\)/gs;
      while ((match = dynamicRegex.exec(fullContent)) !== null) {
        const options = match[2];
        if (!options.includes('ssr: false')) {
          const lineIndex = fullContent.substring(0, match.index).split('\n').length;
          issues.push({
            file: path.relative(ROOT_DIR, filePath),
            line: lineIndex,
            type,
            message,
            context: match[0].split('\n')[0] + '...'
          });
        }
      }
      return;
    }

    lines.forEach((line, index) => {
      const matches = line.match(regex);
      if (matches) {
        matches.forEach(match => {
          if (!test || (test as any)(match, line)) {
            issues.push({
              file: path.relative(ROOT_DIR, filePath),
              line: index + 1,
              type,
              message,
              context: line.trim()
            });
          }
        });
      }
    });
  });
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.startsWith('.')) {
        walkDir(filePath);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      auditFile(filePath);
    }
  });
}

console.log(chalk.bold.blue('\n🚀 STARTING NUCLEAR FORENSIC AUDIT...\n'));

walkDir(WEB_APP_DIR);

const errors = issues.filter(i => i.type === 'error');
const warnings = issues.filter(i => i.type === 'warning');

issues.forEach(issue => {
  const color = issue.type === 'error' ? chalk.red : chalk.yellow;
  console.log(`${color(issue.type.toUpperCase())} ${chalk.cyan(issue.file)}:${chalk.green(issue.line)}`);
  console.log(`   ${issue.message}`);
  console.log(`   ${chalk.gray('> ' + issue.context)}\n`);
});

console.log(chalk.bold('Audit Summary:'));
console.log(chalk.red(`❌ Errors: ${errors.length}`));
console.log(chalk.yellow(`⚠️ Warnings: ${warnings.length}\n`));

if (errors.length > 0) {
  console.log(chalk.bold.red('☢️ AUDIT FAILED: Fix errors before pushing slop to production!\n'));
  process.exit(1);
} else {
  console.log(chalk.bold.green('✅ AUDIT PASSED: Masterclass quality confirmed.\n'));
  process.exit(0);
}
