#!/usr/bin/env node
/**
 * 🛡️ VOICES WATCHDOG AGENT (V1.0)
 * 
 * "De Waak-Agent die nooit slaapt."
 * 
 * Doel: Real-time analyse van de engine logs en pro-actieve respons op werkpunten.
 * Mandaat: Unconditional (God Mode).
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// --- CONFIGURATIE ---
const LOG_PATTERNS = [
    { 
        id: 'php-fatal', 
        severity: 'CRITICAL',
        regex: /PHP Fatal error: (.*) in (.*) on line (\d+)/,
        action: 'analyze_fix'
    },
    { 
        id: 'php-warning', 
        severity: 'WARNING',
        regex: /PHP Warning: (.*) in (.*) on line (\d+)/,
        action: 'suggest_fix'
    },
    { 
        id: 'safety-violation', 
        severity: 'CRITICAL',
        regex: /SAFETY: Status=VIOLATION, Target=(.*), Reason=(.*)/,
        action: 'lock_protocol'
    },
    {
        id: 'iap-anomaly',
        severity: 'MEDIUM',
        regex: /IAP_OBSERVABILITY: Anomaly detected: (.*)/,
        action: 'log_event'
    }
];

// Ruis die we negeren (bekende legacy issues)
const IGNORE_PATTERNS = [
    /Attempt to read property "ID" on null in .*class-external-permalinks\.php/,
    /Attempt to read property "ID" on null in .*post-template\.php/
];

// --- CORE LOGICA ---

class VoicesWatchdog {
    private sshProcess: any;

    constructor() {
        console.log("\x1b[34m%s\x1b[0m", "🛡️ VOICES WATCHDOG AGENT GEACTIVEERD");
        console.log("\x1b[34m%s\x1b[0m", "====================================");
    }

    public start() {
        console.log("📡 Verbinden met voices-prod voor real-time log analyse...");

        // We gebruiken de bestaande SSH tunnel logica
        this.sshProcess = spawn('ssh', ['voices-prod', "tail -f wp-core/wp-content/debug.log"]);

        this.sshProcess.stdout.on('data', (data: Buffer) => {
            const lines = data.toString().split('\n');
            lines.forEach(line => this.processLine(line));
        });

        this.sshProcess.stderr.on('data', (data: Buffer) => {
            // console.error(`SSH Error: ${data}`);
        });

        this.sshProcess.on('close', (code: number) => {
            console.log(`Watchdog verbinding verbroken (code ${code}). Herstarten in 5s...`);
            setTimeout(() => this.start(), 5000);
        });
    }

    private processLine(line: string) {
        if (!line.trim()) return;

        // 1. Check of we de lijn moeten negeren
        if (IGNORE_PATTERNS.some(p => p.test(line))) {
            return;
        }

        // 2. Match tegen bekende patronen
        for (const pattern of LOG_PATTERNS) {
            const match = line.match(pattern.regex);
            if (match) {
                this.handleMatch(pattern, match, line);
                return;
            }
        }

        // 3. Fallback: toon de lijn als het een "interessante" log is (bijv. V2/CORE/SAFETY)
        if (line.includes('CORE') || line.includes('V2') || line.includes('SAFETY') || line.includes('MASTER DOOR')) {
            console.log("\x1b[32m%s\x1b[0m", `[ENGINE] ${line}`);
        }
    }

    private handleMatch(pattern: any, match: RegExpMatchArray, originalLine: string) {
        const timestamp = new Date().toLocaleTimeString();
        
        console.log("\n\x1b[31m%s\x1b[0m", `🚨 [${pattern.severity}] ${pattern.id.toUpperCase()} GEDETECTEERD om ${timestamp}`);
        console.log(`   Log: ${originalLine}`);

        if (pattern.action === 'analyze_fix' || pattern.action === 'suggest_fix') {
            const errorMsg = match[1];
            const filePath = match[2];
            const lineNum = match[3];

            console.log("\x1b[33m%s\x1b[0m", `   📍 Locatie: ${filePath}:${lineNum}`);
            console.log("\x1b[33m%s\x1b[0m", `   💡 Analyse: Bezig met genereren van pro-actieve fix via God Mode...`);
            
            // In een echte implementatie zouden we hier een signaal sturen naar de Cursor agent
            // Voor nu loggen we de intentie.
            this.triggerAgentResponse(pattern, errorMsg, filePath, lineNum);
        }
    }

    private triggerAgentResponse(pattern: any, error: string, file: string, line: string) {
        // Hier kunnen we een lokaal bestand schrijven dat de Cursor agent oppikt
        const reportPath = path.join(process.cwd(), 'documentation/watchdog-report.json');
        const report = {
            timestamp: new Date().toISOString(),
            pattern: pattern.id,
            error,
            file,
            line,
            status: 'pending_fix'
        };

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log("\x1b[35m%s\x1b[0m", `   ✅ Rapport gegenereerd in documentation/watchdog-report.json`);
    }
}

// Start de agent
const watchdog = new VoicesWatchdog();
watchdog.start();
