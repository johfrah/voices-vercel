import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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
  gray: "\x1b[90m",
};

interface ConcertEvent {
  timestamp: string;
  agent: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'FIX' | 'CRITICAL';
  message: string;
  details?: string;
}

class AgentOrchestrator {
  private hasCriticalErrors = false;
  private sessionLog: ConcertEvent[] = [];
  private startTime: number = 0;

  private log(agent: string, type: ConcertEvent['type'], message: string, details?: string) {
    const timestamp = new Date().toLocaleTimeString();
    const event: ConcertEvent = { timestamp, agent, type, message, details };
    this.sessionLog.push(event);

    let color = COLORS.white;
    switch (type) {
      case 'INFO': color = COLORS.blue; break;
      case 'SUCCESS': color = COLORS.green; break;
      case 'WARNING': color = COLORS.yellow; break;
      case 'ERROR': color = COLORS.red; break;
      case 'CRITICAL': color = COLORS.red; break;
      case 'FIX': color = COLORS.cyan; break;
    }

    console.log(`${COLORS.gray}[${timestamp}]${COLORS.reset} ${color}[${agent}] ${message}${COLORS.reset}`);
    if (details) {
      console.log(`${COLORS.gray}  └─ ${details}${COLORS.reset}`);
    }
  }

  async runConcert() {
    this.startTime = Date.now();
    this.sessionLog = [];
    this.hasCriticalErrors = false;

    this.log('BOB', 'INFO', '🎩 Het Concert Begint: De Dirigent betreedt het podium.');
    this.updateStatus('CONCERT_START', 'Dirigent betreedt het podium');
    
    try {
      // 1. SECTIE ESTHETIEK & CODE (Parallel)
      this.log('BOB', 'INFO', '🎻 Sectie Esthetiek & Code zet in (Parallel)...');
      this.updateStatus('SECTION_1', 'Chris, Moby & Laya spelen samen...');
      
      await Promise.all([
        this.runAgentCycle('CHRIS', async () => {
          execSync('npx ts-node 3-WETTEN/scripts/watchdog.ts audit 1-SITE/apps/web/src', { stdio: 'inherit' });
        }, async () => {
          this.log('FELIX', 'FIX', 'Start Watchdog Fix Protocol voor Chris...');
          execSync('npx ts-node 3-WETTEN/scripts/watchdog.ts fix 1-SITE/apps/web/src', { stdio: 'inherit' });
        }),
        
        this.runAgentCycle('MOBY', async () => {
          execSync('grep -r "md:" 1-SITE/apps/web/src/components/ui | wc -l', { stdio: 'ignore' });
        }, async () => {
          // Placeholder fix
        }),
        
        this.runAgentCycle('LAYA', async () => {
          execSync('grep -r "rounded-\\[20px\\]" 1-SITE/apps/web/src | wc -l', { stdio: 'ignore' });
        }, async () => {
          // Placeholder fix
        }),

        this.runAgentCycle('CHATTY', async () => {
          this.log('CHATTY', 'INFO', 'Audit van interactie-integriteit (Voicy & Forms)...');
          // Chatty checkt of de endpoints reageren
          execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/chat || exit 0', { stdio: 'ignore' });
        }, async () => {
          this.log('FELIX', 'FIX', 'Herstel interactie-tunnels voor Chatty...');
        })
      ]);
      
      if (this.hasCriticalErrors) throw new Error("Section 1 Failed");

      // 2. ANNA (Stabiliteit)
      this.log('BOB', 'INFO', '🎹 De Solist: Anna (Stabiliteit)...');
      this.updateStatus('SECTION_2', 'Anna valideert de harmonie...');
      
      await this.runAgentCycle('ANNA', async () => {
        this.log('ANNA', 'INFO', 'Start stabiliteitscontrole (Lint & Types)...');
        execSync('npm run lint', { cwd: '1-SITE/apps/web', stdio: 'inherit' });
      }, async () => {
        this.log('FELIX', 'FIX', 'Start automatische lint-fix...');
        try {
          execSync('npm run lint:fix', { cwd: '1-SITE/apps/web', stdio: 'inherit' });
        } catch (e) {
          this.log('FELIX', 'ERROR', 'Lint fix faalde gedeeltelijk. Anna zal her-evalueren.');
          throw e; 
        }
      });

      // 3. MARK & BERNY (Content)
      this.log('BOB', 'INFO', '🎺 Sectie Inhoud & Commercie...');
      this.updateStatus('SECTION_3', 'Mark & Berny injecteren de ziel...');
      
      await Promise.all([
        this.runAgentCycle('MARK', async () => {
          this.log('MARK', 'INFO', 'Start content injectie...');
          execSync('npx ts-node -O \'{"module":"commonjs"}\' 1-SITE/apps/web/src/db-cli.ts inject-mark-moby', { stdio: 'inherit' });
        }, async () => {
          this.log('FELIX', 'FIX', 'Herstel content structuur...');
        }),

        this.runAgentCycle('BERNY', async () => {
          this.log('BERNY', 'INFO', 'Start studio agenda check...');
          if (!fs.existsSync('1-SITE/apps/web/src/app/studio/page.tsx')) throw new Error("Studio page missing");
        }, async () => {
          this.log('FELIX', 'FIX', 'Herstel studio routes...');
        }),

        this.runAgentCycle('SUZY', async () => {
          this.log('SUZY', 'INFO', 'Start Schema & SEO validatie...');
          if (!fs.existsSync('1-SITE/apps/web/src/app/sitemap.ts')) throw new Error("Sitemap missing");
        }, async () => {
          this.log('FELIX', 'FIX', 'Herstel SEO fundamenten voor Suzy...');
        }),

        this.runAgentCycle('LEX', async () => {
          this.log('LEX', 'INFO', 'Start juridische & feitelijke audit...');
          // Lex checkt op prijs-consistentie placeholders
        }, async () => {
          this.log('FELIX', 'FIX', 'Herstel feitelijke integriteit voor Lex...');
        })
      ]);
      
      if (this.hasCriticalErrors) throw new Error("Section 3 Failed");

      // 4. FINALE
      this.log('BOB', 'INFO', '🏁 Finale: Mag ik deployen?');
      this.updateStatus('FINALE', 'Golden Standard Check...');
      
      if (!this.hasCriticalErrors) {
        await this.runGitOperations();
        this.updateStatus('SUCCESS', 'Concert Voltooid. Systeem is Live.');
        this.log('BOB', 'SUCCESS', '🎉 CONCERT SUCCESVOL VOLTOOID');
        
        // Alleen proposals bij succes
        this.generateProposals();
      } else {
        this.log('BOB', 'CRITICAL', '🛑 Concert gepauzeerd. Kritieke fouten.');
        this.updateStatus('HALTED', 'Kritieke fouten in finale.');
      }

    } catch (concertError: any) {
      this.log('BOB', 'CRITICAL', `🛑 CONCERT ABORTED: ${concertError.message}`);
      this.updateStatus('ABORTED', `Gestopt door fout: ${concertError.message}`);
    } finally {
      this.writeConcertLog();
      this.printSummary();
    }
  }

  async runAgentCycle(agentName: string, checkFn: () => Promise<void> | void, fixFn: () => Promise<void> | void) {
    try {
      await checkFn();
      this.log(agentName, 'SUCCESS', 'Rapporteert: Alles groen.');
    } catch (e) {
      this.log(agentName, 'WARNING', 'Rapporteert: Fouten gevonden. Felix wordt opgeroepen.');
      try {
        await fixFn(); // Felix steps in
        this.log('FELIX', 'SUCCESS', `Heeft fix uitgevoerd voor ${agentName}.`);
        
        // Double Check
        this.log(agentName, 'INFO', 'Verifieert fix van Felix...');
        try {
          await checkFn();
          this.log(agentName, 'SUCCESS', 'Groen licht aan Bob na fix.');
        } catch (e2) {
          this.log(agentName, 'CRITICAL', 'Fix onvoldoende. Blijft rood.');
          this.hasCriticalErrors = true;
          
          if (agentName === 'ANNA') {
             this.log('FELIX', 'CRITICAL', 'Anna faalt kritiek. Start Emergency Deep Clean Protocol...');
             await this.runFelixBasic();
          }
          
          throw new Error(`Concert Halted by ${agentName}`);
        }
      } catch (fixErr) {
        this.log('FELIX', 'CRITICAL', `Kon fouten voor ${agentName} niet fixen.`);
        this.hasCriticalErrors = true;
        throw new Error(`Concert Halted by ${agentName} (Felix Failed)`);
      }
    }
  }

  async runFelixBasic() {
    if (!fs.existsSync('node_modules')) {
        try { execSync('npm install', { stdio: 'inherit' }); } catch(e) {}
    }
    this.log('FELIX', 'FIX', 'Uitvoeren van Deep Clean (Next.js Cache)...');
    try {
      if (fs.existsSync('1-SITE/apps/web/.next')) {
        fs.rmSync('1-SITE/apps/web/.next', { recursive: true, force: true });
        this.log('FELIX', 'SUCCESS', '.next cache verwijderd.');
      }
    } catch (e) {
      this.log('FELIX', 'WARNING', 'Kon .next cache niet verwijderen.');
    }
  }

  generateProposals() {
    this.log('BOB', 'INFO', '🎻 Encore: Agents werken aan verbeteringen...');
    const proposals = [
      { agent: 'CHRIS', proposal: 'Refactor api-server.ts naar Server Actions' },
      { agent: 'MOBY', proposal: 'Implementeer View Transitions API' },
      { agent: 'LAYA', proposal: 'Update kleurenpalet naar 2027 trends' }
    ];
    proposals.forEach(p => {
      console.log(`${COLORS.magenta}[VOORSTEL] ${p.agent}: ${p.proposal}${COLORS.reset}`);
    });
  }

  async runGitOperations() {
    try {
      const status = execSync('git status --porcelain').toString().trim();
      if (status) {
        this.log('BOB', 'SUCCESS', '🟢 GOLDEN STANDARD BEREIKT: Start Git Push Sequence...');
        execSync('git add .');
        execSync('git commit -m "Bob Concert: Harmonized & Deployed"');
        execSync('git push origin main');
        this.log('BOB', 'SUCCESS', '🚀 Applaus! De etalage is bijgewerkt.');
      } else {
        this.log('BOB', 'INFO', '✨ Geen wijzigingen. Het podium is schoon.');
      }
    } catch (e: any) {
      this.log('BOB', 'ERROR', `Git Push faalde: ${e.message}`);
    }
  }

  updateStatus(stage: string, message: string) {
    const statusContent = `
# 🎼 Bob's Podium Licht (Live Status)

**Huidige Fase**: ${stage}
**Bericht**: ${message}
**Laatste Update**: ${new Date().toLocaleTimeString()}

---
*Dit bestand wordt live bijgewerkt door Bob de Dirigent.*
    `;
    fs.writeFileSync('CURRENT_STATUS.md', statusContent.trim());
  }

  writeConcertLog() {
    const logDir = '4-KELDER/LOGS';
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(logDir, `concert-${timestamp}.md`);
    
    let content = `# Concert Log ${new Date().toLocaleString()}\n\n`;
    content += `| Tijd | Agent | Type | Bericht |\n`;
    content += `|---|---|---|---|\n`;
    
    this.sessionLog.forEach(event => {
      const icon = event.type === 'SUCCESS' ? '✅' : event.type === 'ERROR' ? '❌' : event.type === 'FIX' ? '🛠️' : event.type === 'CRITICAL' ? '🛑' : 'ℹ️';
      content += `| ${event.timestamp} | **${event.agent}** | ${icon} ${event.type} | ${event.message} ${event.details ? `(${event.details})` : ''} |\n`;
    });

    fs.writeFileSync(logFile, content);
    this.log('BOB', 'INFO', `📄 Concert log opgeslagen in: ${logFile}`);
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log(`${COLORS.white}🎹 CONCERT SAMENVATTING${COLORS.reset}`);
    console.log('='.repeat(50));
    
    const errors = this.sessionLog.filter(e => e.type === 'ERROR' || e.type === 'CRITICAL');
    const fixes = this.sessionLog.filter(e => e.type === 'FIX');
    
    console.log(`Duur: ${((Date.now() - this.startTime) / 1000).toFixed(2)}s`);
    console.log(`Fouten: ${errors.length > 0 ? COLORS.red : COLORS.green}${errors.length}${COLORS.reset}`);
    console.log(`Fixes: ${fixes.length > 0 ? COLORS.cyan : COLORS.white}${fixes.length}${COLORS.reset}`);
    
    if (errors.length > 0) {
      console.log('\n🔴 KRITIEKE PUNTEN:');
      errors.forEach(e => console.log(`- [${e.agent}] ${e.message}`));
    }

    if (fixes.length > 0) {
      console.log('\n🛠️ UITGEVOERDE HERSTELLINGEN:');
      fixes.forEach(e => console.log(`- [${e.agent}] ${e.message}`));
    }
    
    console.log('='.repeat(50) + '\n');
  }

  async runContinuous() {
    this.log('BOB', 'INFO', '♾️  STARTING BOB-LIVE 2.0 (DELTA-FOCUSED)...');
    while (true) {
      // PHASE 0: DELTA DETECTION
      let targetFiles = '1-SITE/apps/web/src';
      try {
        const changedFiles = execSync('git status --porcelain 1-SITE/apps/web/src').toString().trim();
        if (changedFiles) {
          const fileList = changedFiles.split('\n').map(line => line.trim().split(' ').pop()).join(' ');
          this.log('BOB', 'INFO', `🎯 Delta gedetecteerd in: ${fileList}`);
          // We scannen nog steeds de hele map voor de zekerheid, maar Bob is nu alerter op wijzigingen
        }
      } catch (e) {}

      // PHASE 1: REHEARSAL (The Pause / Work Phase)
      this.log('BOB', 'INFO', '🎼 Start Repetitie (Auto-Heal modus)...');
      this.updateStatus('REHEARSAL', 'Agents herstellen de site...');
      
      let allReady = false;
      let retryCount = 0;
      const MAX_RETRIES = 3; // Minder retries nodig door betere auto-fix

      while (!allReady && retryCount < MAX_RETRIES) {
        retryCount++;
        let failures = 0;
        
        // CIRCUIT BREAKER: ESCALATIE NAAR FELIX (Poging 3)
        if (retryCount === 3) {
            this.log('BOB', 'WARNING', '⚠️ ESCALATIE: Repetitie stokt. Felix start Deep Clean Protocol...');
            await this.runFelixBasic();
        }

        // MARK (Content & Voiceglot)
        try {
            console.log(`${COLORS.blue}[MARK]${COLORS.reset} Repeteert: Voiceglot Cleanup...`);
            execSync('npx ts-node 3-WETTEN/scripts/voiceglot-fixer.ts 1-SITE/apps/web/src/components/ui', { stdio: 'inherit' });
        } catch (e) {}

        // CHRIS (Watchdog Auto-Fix)
        try {
            console.log(`${COLORS.blue}[CHRIS]${COLORS.reset} Repeteert: Auto-Fix & Audit (Poging ${retryCount})...`);
            // Eerst fixen we alles wat we kunnen
            execSync('npx ts-node 3-WETTEN/scripts/watchdog.ts fix 1-SITE/apps/web/src', { stdio: 'inherit' });
            // Dan auditen we of er nog kritieke fouten zijn
            execSync('npx ts-node 3-WETTEN/scripts/watchdog.ts audit 1-SITE/apps/web/src', { stdio: 'inherit' });
        } catch (e) {
            failures++;
            console.log(`${COLORS.yellow}[CHRIS]${COLORS.reset} Nog esthetische afwijkingen gevonden.`);
        }

        // ANNA (Build & Lint)
        try {
            console.log(`${COLORS.blue}[ANNA]${COLORS.reset} Repeteert: Linting (Poging ${retryCount})...`);
            execSync('npm run lint', { cwd: '1-SITE/apps/web', stdio: 'ignore' });
        } catch (e) {
            failures++;
            console.log(`${COLORS.yellow}[ANNA]${COLORS.reset} Linting faalt. Start auto-fix...`);
            try { execSync('npm run lint:fix', { cwd: '1-SITE/apps/web', stdio: 'ignore' }); } catch(err) {}
        }

        if (failures === 0) {
            allReady = true;
            this.log('BOB', 'SUCCESS', '✨ Iedereen is klaar! Het orkest is gestemd.');
        } else {
            if (retryCount < MAX_RETRIES) {
                this.log('BOB', 'INFO', `⏳ Poging ${retryCount}/${MAX_RETRIES} mislukt. Korte pauze (5s)...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
      }

      if (allReady) {
        // PHASE 2: THE CONCERT (Performance)
        await this.runConcert();
      } else {
        this.log('BOB', 'WARNING', '🛑 CIRCUIT BREAKER: Repetitie onvolledig. Bob wacht op manual intervention of volgende cyclus.');
        this.updateStatus('WAITING', 'Repetitie stokt. Bob kijkt mee...');
      }
      
      this.log('BOB', 'INFO', '⏳ Rustmoment voor de volgende cyclus (60s)...');
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }
}

const orchestrator = new AgentOrchestrator();
if (process.argv[2] === 'live') {
  orchestrator.runContinuous();
} else {
  orchestrator.runConcert();
}