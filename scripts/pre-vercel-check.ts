import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appDir = path.resolve(repoRoot, 'apps/web');

type Step = {
  label: string;
  command: string;
  args: string[];
  required: boolean;
};

const steps: Step[] = [
  {
    label: 'Next.js build',
    command: 'npm',
    args: ['run', 'check:build'],
    required: true,
  },
];

if (process.env.PREFLIGHT_STRICT === 'true') {
  steps.unshift({
    label: 'TypeScript check',
    command: 'npm',
    args: ['run', 'type-check'],
    required: true,
  });
}

if (process.env.PREFLIGHT_LINT === 'true') {
  steps.unshift({
    label: 'ESLint check',
    command: 'npm',
    args: ['run', 'lint'],
    required: true,
  });
}

for (const step of steps) {
  process.stdout.write(`\n[pre-vercel-check] ${step.label}\n`);
  const result = spawnSync(step.command, step.args, {
    cwd: appDir,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0 && step.required) {
    process.stderr.write(`[pre-vercel-check] Failed: ${step.label}\n`);
    process.exit(result.status ?? 1);
  }
}

process.stdout.write('\n[pre-vercel-check] Completed successfully.\n');
