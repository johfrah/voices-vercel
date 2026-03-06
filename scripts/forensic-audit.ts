import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type FindingLevel = 'critical' | 'warning' | 'info';

type Finding = {
  level: FindingLevel;
  title: string;
  details: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const reportDir = path.join(repoRoot, 'docs', 'reports');
const dateKey = new Date().toISOString().slice(0, 10);

const findings: Finding[] = [];

const addFinding = (level: FindingLevel, title: string, details: string) => {
  findings.push({ level, title, details });
};

const fileExists = async (targetPath: string) => {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const readJson = async (targetPath: string) => {
  const raw = await fs.readFile(targetPath, 'utf8');
  return JSON.parse(raw);
};

const runChecks = async () => {
  const requiredPaths = [
    'AGENTS.md',
    '.cursorrules',
    'apps/web/package.json',
    'scripts/pre-vercel-check.ts',
  ];

  for (const relPath of requiredPaths) {
    const absPath = path.join(repoRoot, relPath);
    if (!(await fileExists(absPath))) {
      addFinding('critical', 'Missing required file', relPath);
    }
  }

  const rootEntries = await fs.readdir(repoRoot, { withFileTypes: true });
  const rootDirs = rootEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.'))
    .filter((name) => name !== 'node_modules');

  const underscoreRootDirs = rootDirs.filter((name) => name.includes('_'));
  if (underscoreRootDirs.length > 0) {
    addFinding(
      'critical',
      'Underscore detected in root directory',
      underscoreRootDirs.join(', ')
    );
  } else {
    addFinding('info', 'Root naming check', 'No underscore folders detected in root.');
  }

  const appPackagePath = path.join(repoRoot, 'apps', 'web', 'package.json');
  if (await fileExists(appPackagePath)) {
    const pkg = await readJson(appPackagePath);
    const auditScript = pkg?.scripts?.['audit:forensic'];
    if (
      typeof auditScript !== 'string' ||
      !auditScript.includes('scripts/forensic-audit.ts')
    ) {
      addFinding(
        'critical',
        'apps/web forensic script drift',
        "Expected 'audit:forensic' to target scripts/forensic-audit.ts."
      );
    } else {
      addFinding('info', 'apps/web forensic script', auditScript);
    }
  }

  const legacyAppPackagePath = path.join(repoRoot, 'apps', 'apps_new', 'web', 'package.json');
  if (await fileExists(legacyAppPackagePath)) {
    const legacyPkg = await readJson(legacyAppPackagePath);
    const auditScript = legacyPkg?.scripts?.['audit:forensic'];
    if (
      typeof auditScript !== 'string' ||
      !auditScript.includes('scripts/forensic-audit.ts')
    ) {
      addFinding(
        'warning',
        'apps/apps_new forensic script drift',
        "Legacy app script does not point to scripts/forensic-audit.ts."
      );
    } else {
      addFinding('info', 'apps/apps_new forensic script', auditScript);
    }
  }
};

const writeReport = async () => {
  await fs.mkdir(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `forensic-audit-${dateKey}.md`);

  const criticalCount = findings.filter((f) => f.level === 'critical').length;
  const warningCount = findings.filter((f) => f.level === 'warning').length;
  const infoCount = findings.filter((f) => f.level === 'info').length;

  const lines: string[] = [];
  lines.push(`# Forensic Audit ${dateKey}`);
  lines.push('');
  lines.push(`- Critical: ${criticalCount}`);
  lines.push(`- Warning: ${warningCount}`);
  lines.push(`- Info: ${infoCount}`);
  lines.push('');
  lines.push('## Findings');
  lines.push('');

  if (findings.length === 0) {
    lines.push('- No findings.');
  } else {
    for (const finding of findings) {
      lines.push(`- [${finding.level.toUpperCase()}] ${finding.title}: ${finding.details}`);
    }
  }

  lines.push('');
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push('');

  await fs.writeFile(reportPath, `${lines.join('\n')}\n`, 'utf8');
  return { reportPath, criticalCount, warningCount, infoCount };
};

const main = async () => {
  await runChecks();
  const summary = await writeReport();

  console.log('[forensic-audit] Report:', path.relative(repoRoot, summary.reportPath));
  console.log(
    `[forensic-audit] Critical=${summary.criticalCount} Warning=${summary.warningCount} Info=${summary.infoCount}`
  );

  if (summary.criticalCount > 0) {
    process.exit(1);
  }
};

main().catch((error) => {
  console.error('[forensic-audit] Fatal error:', error);
  process.exit(1);
});
