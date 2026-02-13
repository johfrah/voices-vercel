import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

function log(agent: string, message: string, color: string = COLORS.white) {
  console.log(`${color}[${agent}] ${message}${COLORS.reset}`);
}

class AgentOrchestrator {
  
  async runBob() {
    log('BOB', 'De Architect: Controleren van structuur en integriteit...', COLORS.blue);
    
    // 1. Check Directory Structure
    const requiredDirs = [
      '1-SITE/apps/web',
      '1-SITE/packages/database',
      '3-WETTEN/scripts',
      '4-KELDER/0-GRONDSTOFFEN-FABRIEK'
    ];
    
    let allDirsExist = true;
    requiredDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        log('BOB', `❌ Ontbrekende map: ${dir}`, COLORS.red);
        allDirsExist = false;
      }
    });

    if (allDirsExist) {
      log('BOB', '✅ Mappenstructuur is conform de Bob-methode.', COLORS.green);
    }

    // 2. Check Drizzle Schema
    if (fs.existsSync('1-SITE/packages/database/schema.ts')) {
      log('BOB', '✅ Drizzle schema gevonden.', COLORS.green);
    } else {
      log('BOB', '❌ Drizzle schema ontbreekt!', COLORS.red);
    }
  }

  async runChris() {
    log('CHRIS', 'De Bewaker: Audit en Protocol Handhaving...', COLORS.red);
    try {
      // Shell out to existing watchdog
      execSync('npx ts-node 3-WETTEN/scripts/watchdog.ts audit 1-SITE/apps/web/src', { stdio: 'inherit' });
      log('CHRIS', '✅ Audit voltooid.', COLORS.green);
    } catch (e) {
      log('CHRIS', '⚠️ Audit vond issues.', COLORS.yellow);
    }
  }

  async runAnna() {
    log('ANNA', 'De Guardian: Stabiliteit en Uptime...', COLORS.magenta);
    
    // 1. Check Env
    if (fs.existsSync('1-SITE/apps/web/.env.local')) {
      log('ANNA', '✅ Environment variables aanwezig.', COLORS.green);
    } else {
      log('ANNA', '❌ .env.local ontbreekt! Build zal falen.', COLORS.red);
    }

    // 2. Dry Run Build (Lint check as proxy for speed)
    log('ANNA', '⏳ Draaien van linter als pre-build check...', COLORS.magenta);
    try {
      execSync('npm run lint', { cwd: '1-SITE/apps/web', stdio: 'inherit' });
      log('ANNA', '✅ Linter geslaagd. Build integriteit hoog.', COLORS.green);
    } catch (e) {
      log('ANNA', '❌ Linter faalde. Build onveilig.', COLORS.red);
    }
  }

  async runMoby() {
    log('MOBY', 'Mobile-First Orchestrator: Checking Thumb-Zone & Responsiveness...', COLORS.cyan);
    
    // Simple grep for responsive utilities
    try {
      const result = execSync('grep -r "md:" 1-SITE/apps/web/src/components/ui | wc -l').toString().trim();
      log('MOBY', `✅ Gevonden ${result} responsive overrides (md:).`, COLORS.green);
    } catch (e) {
      log('MOBY', '⚠️ Kon responsive patterns niet tellen.', COLORS.yellow);
    }

    // Check for va-bezier
    try {
      const bezierCount = execSync('grep -r "va-bezier" 1-SITE/apps/web/src | wc -l').toString().trim();
      if (parseInt(bezierCount) > 0) {
        log('MOBY', `✅ Golden Curve (va-bezier) gedetecteerd in ${bezierCount} bestanden.`, COLORS.green);
      } else {
        log('MOBY', '⚠️ Geen va-bezier animaties gevonden.', COLORS.yellow);
      }
    } catch (e) {}
  }

  async runMark() {
    log('MARK', 'Tone of Voice: Checking Natural Capitalization & Slop...', COLORS.yellow);
    
    // Check for VoiceglotText usage
    try {
      const voiceglotCount = execSync('grep -r "VoiceglotText" 1-SITE/apps/web/src | wc -l').toString().trim();
      log('MARK', `✅ ${voiceglotCount} vertalingen via VoiceglotText.`, COLORS.green);
    } catch (e) {}

    // Check for forbidden terms (AI Slop)
    const slopTerms = ['unleash', 'elevate', 'cutting-edge', 'revolutionize'];
    slopTerms.forEach(term => {
      try {
        execSync(`grep -r -i "${term}" 1-SITE/apps/web/src`);
        log('MARK', `❌ AI Slop gedetecteerd: "${term}"`, COLORS.red);
      } catch (e) {
        // Grep returns exit code 1 if not found, which is good here
      }
    });
    log('MARK', '✅ Slop-scan voltooid.', COLORS.green);
  }

  async runLaya() {
    log('LAYA', 'Aesthetic Orchestrator: Checking Design Consistency...', COLORS.magenta);
    
    // Check for rounded-[20px] mandate
    try {
      const rounded20 = execSync('grep -r "rounded-\\[20px\\]" 1-SITE/apps/web/src | wc -l').toString().trim();
      log('LAYA', `✅ ${rounded20} elementen volgen de rounded-[20px] standaard.`, COLORS.green);
    } catch (e) {}

    // Check for shadow-aura
    try {
      const shadowAura = execSync('grep -r "shadow-aura" 1-SITE/apps/web/src | wc -l').toString().trim();
      log('LAYA', `✅ ${shadowAura} elementen gebruiken shadow-aura.`, COLORS.green);
    } catch (e) {}

    // Check for forbidden extreme rounding (old style)
    try {
      execSync('grep -r "rounded-\\[100px\\]" 1-SITE/apps/web/src');
      log('LAYA', '⚠️ Waarschuwing: Extreme afronding (100px) gevonden. Controleer of dit gewenst is.', COLORS.yellow);
    } catch (e) {
      log('LAYA', '✅ Geen extreme afronding (100px) gevonden.', COLORS.green);
    }
  }

  async runAll() {
    await this.runBob();
    console.log('');
    await this.runChris();
    console.log('');
    await this.runAnna();
    console.log('');
    await this.runMoby();
    console.log('');
    await this.runMark();
    console.log('');
    await this.runLaya();
  }
}

// CLI Handling
const agent = process.argv[2];
const orchestrator = new AgentOrchestrator();

switch (agent?.toLowerCase()) {
  case 'bob': orchestrator.runBob(); break;
  case 'chris': orchestrator.runChris(); break;
  case 'anna': orchestrator.runAnna(); break;
  case 'moby': orchestrator.runMoby(); break;
  case 'mark': orchestrator.runMark(); break;
  case 'laya': orchestrator.runLaya(); break;
  case 'all': orchestrator.runAll(); break;
  default:
    console.log('Gebruik: npx ts-node 3-WETTEN/scripts/orchestrator.ts [bob|chris|anna|moby|mark|laya|all]');
}
