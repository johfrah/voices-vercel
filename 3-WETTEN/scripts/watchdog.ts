/**
 * 🛡️ CHRIS WATCHDOG (2026)
 * 
 * De digitale uitsmijter van Voices.be. 
 * Handhaaft de Bob-methode: Clean, Fast, Rigid, Ademing.
 * 
 * "Als het niet ademt, is het dood. Als het niet snel is, bestaat het niet."
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Laad env vars voor self-healing checks
dotenv.config({ path: '1-SITE/apps/web/.env.local' });

interface AuditResult {
  file: string;
  issues: { line: number; message: string; severity: 'CRITICAL' | 'WARNING'; fixable: boolean }[];
}

class ChrisWatchdog {
  private supabase: any;

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      this.supabase = createClient(url, key);
    }
  }

  /**
   * 🏥 SELF-HEALING: Check database health
   */
  async checkDatabaseHealth() {
    console.log('🏥 [HEAL] Controleren van database gezondheid...');
    if (!this.supabase) {
      console.error('🔴 [HEAL] Supabase niet geconfigureerd in env.');
      return false;
    }

    try {
      const { data, error } = await this.supabase.from('actors').select('id').limit(1);
      if (error) throw error;
      console.log('✅ [HEAL] Database tunnel (SDK) is operationeel.');
      return true;
    } catch (e: any) {
      console.error('🔴 [HEAL] Database CRITICAL FAILURE:', e.message);
      // Hier kunnen we proactief actie ondernemen, bijv. een notificatie sturen
      return false;
    }
  }

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
    },
    {
      name: 'Mobile-First Spacing',
      pattern: /className="[^"]*\b(p|m)[xy]?-[0-9]+\b(?!.*md:(p|m)[xy]?-[0-9]+)[^"]*"/g,
      message: 'Zorg voor mobile-first spacing (gebruik md: voor desktop overrides).',
      severity: 'WARNING'
    },
    {
      name: 'Leesbaarheid Mandate',
      pattern: /text-\[([0-9]|1[0-4])px\]|text-xs/g,
      message: 'Minimale tekstgrootte is 15px. Geen text-[8px] tot text-[14px] of text-xs toegestaan.',
      severity: 'CRITICAL'
    },
    {
      name: 'Atomic Icon Mandate',
      pattern: /<(Zap|Star|Check|Plus|X|ArrowRight|ChevronDown|User|Mail|Briefcase|ShieldCheck|CheckCircle2|LogOut|Sparkles|ArrowLeft|Quote|Calendar|MessageSquare|HelpCircle|Shield|Send|Unlock|Lock|Activity|Monitor|Radio|Globe|Mic2|Phone|Building2|BookOpen|Wind)(?![^>]*strokeWidth={1\.5})[^>]*>/g,
      message: 'Lucide icons MOETEN strokeWidth={1.5} hebben voor de Ademing-feel.',
      severity: 'CRITICAL'
    },
    {
      name: 'Modern Stack Discipline',
      pattern: /<div|<span|<p|<a\s+href=|className="[^"]*"(?=\s*style=)|document\.getElement|document\.querySelector/g,
      message: 'Gebruik Layout Instruments (Container, Text, Section) ipv kale HTML tags. Geen inline styles of DOM manipulatie.',
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

  async run(targetPath: string): Promise<boolean> {
    console.log(`🚀 CHRIS WATCHDOG: Start audit op ${targetPath}...`);
    
    if (!fs.existsSync(targetPath)) {
      console.error(`🔴 Pad niet gevonden: ${targetPath}`);
      return false;
    }

    let hasCriticalIssues = false;

    const stats = fs.statSync(targetPath);
    if (stats.isFile()) {
      const result = await this.auditFile(targetPath);
      this.report(result);
      if (result.issues.some(i => i.severity === 'CRITICAL')) hasCriticalIssues = true;
    } else {
      hasCriticalIssues = await this.auditDir(targetPath);
    }

    return !hasCriticalIssues;
  }

  private async auditDir(dir: string): Promise<boolean> {
    const files = fs.readdirSync(dir);
    let hasCriticalIssues = false;

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('.git')) {
          const subDirHasIssues = await this.auditDir(fullPath);
          if (subDirHasIssues) hasCriticalIssues = true;
        }
      } else if (/\.(tsx|ts|js|jsx)$/.test(file)) {
        const result = await this.auditFile(fullPath);
        this.report(result);
        if (result.issues.some(i => i.severity === 'CRITICAL')) hasCriticalIssues = true;
      }
    }
    return hasCriticalIssues;
  }

  private report(result: AuditResult) {
    if (result.issues.length === 0) return;

    console.log(`\n📄 File: ${result.file}`);
    result.issues.forEach(issue => {
      const color = issue.severity === 'CRITICAL' ? '🔴' : '🟡';
      console.log(`${color} [L${issue.line}] ${issue.severity}: ${issue.message}`);
    });
  }

  async fixDir(dir: string) {
    const files = fs.readdirSync(dir);
    files.forEach(async file => {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('.git')) {
          this.fixDir(fullPath);
        }
      } else if (/\.(tsx|ts|js|jsx)$/.test(file)) {
        await this.fix(fullPath);
      }
    });
  }

  async fix(filePath: string) {
    // console.log(`🔧 CHRIS FIX: Herstellen van ${filePath}...`); // Te veel log noise
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;

    // Fix Uppercase Slop
    content = content.replace(/className="([^"]*)\buppercase\b([^"]*)"/g, (match, p1, p2) => {
      console.log(`   ✅ [FIX] ${path.basename(filePath)}: Verwijderd 'uppercase'`);
      return `className="${p1}${p2}"`.replace(/\s\s+/g, ' ');
    });

    // Fix Raleway Mandate (Uitgebreid naar alle elementen met grote tekst)
    // Vervang font-black/bold door font-light als de tekst groot is (text-4xl+)
    content = content.replace(/(className="[^"]*)\b(font-black|font-bold|font-semibold)\b([^"]*text-[4-9]xl[^"]*")/g, (match, p1, p2, p3) => {
        console.log(`   ✅ [FIX] ${path.basename(filePath)}: Vervangen '${p2}' door 'font-light' (Large Text)`);
        return `${p1}font-light${p3}`;
    });

    // Fix Raleway Mandate (Specifiek voor Headings & TextInstrument)
    content = content.replace(/<(h[1-6]|TextInstrument)([^>]*className="[^"]*)(?<!font-(light|extralight|thin|medium))([^"]*")/g, (match, p1, p2, p3, p4) => {
      if (p2.includes('font-') || p4.includes('font-')) return match;
      console.log(`   ✅ [FIX] ${path.basename(filePath)}: Toegevoegd 'font-light' aan ${p1}`);
      return `<${p1}${p2} font-light${p4}`;
    });

    // Fix Atomic Icon Mandate (Lucide icons strokeWidth)
    // 🛡️ CHRIS-PROTOCOL: Regex verfijnd om geen TypeScript generics (bv. useState<User>) te slopen.
    const iconPattern = /<(Zap|Star|Check|Plus|X|ArrowRight|ChevronDown|User|Mail|Briefcase|ShieldCheck|CheckCircle2|LogOut|Sparkles|ArrowLeft|Quote|Calendar|MessageSquare|HelpCircle|Shield|Send|Unlock|Lock|Activity|Monitor|Radio|Globe|Mic2|Phone|Building2|BookOpen|Wind)(?=\s|\/>)(?![^>]*strokeWidth={1\.5})([^>]*)>/g;
    content = content.replace(iconPattern, (match, p1, p2) => {
        // Extra check: negeer als het eruit ziet als een type (bv. <User | null>)
        if (p2.includes('|') || p2.includes('[') || p2.trim() === '') {
            if (!p2.includes('=') && !match.includes('/>')) return match; 
        }
        
        if (match.includes('strokeWidth=')) {
            // Replace existing strokeWidth
            console.log(`   ✅ [FIX] ${path.basename(filePath)}: Updated strokeWidth for ${p1}`);
            return match.replace(/strokeWidth={[^}]*}/, 'strokeWidth={1.5}');
        } else {
            // Add strokeWidth
            console.log(`   ✅ [FIX] ${path.basename(filePath)}: Added strokeWidth={1.5} to ${p1}`);
            return `<${p1} strokeWidth={1.5}${p2}>`;
        }
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
    }
  }
}

// CLI Execution
const mode = process.argv[2];
const target = process.argv[3] || '1-SITE/apps/web/src';
const watchdog = new ChrisWatchdog();

if (mode === 'fix') {
  console.log(`🔧 CHRIS FIX PROTOCOL: Start herstel op ${target}...`);
  if (fs.statSync(target).isFile()) {
    watchdog.fix(target).catch(console.error);
  } else {
    watchdog.fixDir(target).catch(console.error);
  }
} else if (mode === 'health') {
  watchdog.checkDatabaseHealth().then(ok => {
    process.exit(ok ? 0 : 1);
  });
} else {
  watchdog.run(target).then(success => {
    if (!success) {
      console.error('🔴 CHRIS: Kritieke fouten gevonden. Audit failed.');
      process.exit(1);
    }
    console.log('✅ CHRIS: Audit geslaagd. Geen kritieke fouten.');
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
