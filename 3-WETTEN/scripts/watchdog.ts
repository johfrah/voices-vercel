/**
 * 🛡️ CHRIS WATCHDOG (2026)
 * 
 * De digitale uitsmijter van Voices.be. 
 * Handhaaft de Bob-methode: Clean, Fast, Rigid, Ademing.
 * 
 * "Als het niet ademt, is het dood. Als het niet snel is, bestaat het niet."
 */

import fs from 'fs';
import path from 'path';

interface AuditResult {
  file: string;
  issues: { line: number; message: string; severity: 'CRITICAL' | 'WARNING'; fixable: boolean }[];
}

class ChrisWatchdog {
  private rules = [
    {
      name: 'Raleway Mandate',
      pattern: /font-(?!light|extralight|thin|medium).*(h[1-6]|text-[4-9]xl)/g,
      message: 'Koppen MOETEN font-light of font-extralight Raleway zijn.',
      severity: 'CRITICAL'
    },
    {
      name: 'Zero-Uppercase Slop',
      pattern: /className="[^"]*\buppercase\b[^"]*"/g,
      message: 'Uppercase is verboden. Gebruik Natural Capitalization.',
      severity: 'CRITICAL'
    },
    {
      name: 'Centralized Imports',
      pattern: /from ['"]\.\.\/.*components\/ui\/(?!LayoutInstruments|VoiceglotText)/g,
      message: 'Gebruik uitsluitend @/components/ui/LayoutInstruments voor UI componenten.',
      severity: 'WARNING'
    },
    {
      name: 'Hardcoded Text Detection',
      pattern: />[^<{]*[a-zA-Z]{5,}[^<{]*</g,
      message: 'Mogelijke hardcoded tekst gedetecteerd. Gebruik <VoiceglotText />.',
      severity: 'WARNING'
    }
  ];

  async auditFile(filePath: string): Promise<AuditResult> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const result: AuditResult = { file: filePath, issues: [] };

    lines.forEach((line, index) => {
      this.rules.forEach(rule => {
        if (rule.pattern.test(line)) {
          result.issues.push({
            line: index + 1,
            message: rule.message,
            severity: rule.severity as any,
            fixable: true
          });
        }
      });
    });

    return result;
  }

  async run(targetPath: string) {
    console.log(`🚀 CHRIS WATCHDOG: Start audit op ${targetPath}...`);
    
    if (!fs.existsSync(targetPath)) {
      console.error(`🔴 Pad niet gevonden: ${targetPath}`);
      return;
    }

    const stats = fs.statSync(targetPath);
    if (stats.isFile()) {
      const result = await this.auditFile(targetPath);
      this.report(result);
    } else {
      this.auditDir(targetPath);
    }
  }

  private auditDir(dir: string) {
    const files = fs.readdirSync(dir);
    files.forEach(async file => {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('.git')) {
          this.auditDir(fullPath);
        }
      } else if (/\.(tsx|ts|js|jsx)$/.test(file)) {
        const result = await this.auditFile(fullPath);
        this.report(result);
      }
    });
  }

  private report(result: AuditResult) {
    if (result.issues.length === 0) return;

    console.log(`\n📄 File: ${result.file}`);
    result.issues.forEach(issue => {
      const color = issue.severity === 'CRITICAL' ? '🔴' : '🟡';
      console.log(`${color} [L${issue.line}] ${issue.severity}: ${issue.message}`);
    });
  }

  async fix(filePath: string) {
    console.log(`🔧 CHRIS FIX: Herstellen van ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Fix Uppercase Slop
    content = content.replace(/className="([^"]*)\buppercase\b([^"]*)"/g, (match, p1, p2) => {
      console.log(`   ✅ Verwijderd: 'uppercase' uit className`);
      return `className="${p1}${p2}"`.replace(/\s\s+/g, ' ');
    });

    // Fix Raleway Mandate (simpele injectie van font-light als het een kop is zonder gewicht)
    content = content.replace(/<(h[1-6]|TextInstrument)([^>]*className="[^"]*)(?<!font-(light|extralight|thin|medium))([^"]*")/g, (match, p1, p2, p3, p4) => {
      console.log(`   ✅ Toegevoegd: 'font-light' aan ${p1}`);
      return `<${p1}${p2} font-light${p4}`;
    });

    fs.writeFileSync(filePath, content);
  }
}

// CLI Execution
const mode = process.argv[2] === '--fix' ? 'fix' : 'audit';
const target = process.argv[3] || '1-SITE/apps/web/src';
const watchdog = new ChrisWatchdog();

if (mode === 'fix') {
  // Voor nu alleen fixen op een specifiek bestand voor veiligheid
  if (fs.statSync(target).isFile()) {
    watchdog.fix(target).catch(console.error);
  } else {
    console.log('🔴 Geef een specifiek bestand op voor --fix.');
  }
} else {
  watchdog.run(target).catch(console.error);
}
