import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

//  SECURITY: Only allow specific agents
const ALLOWED_AGENTS: Record<string, string> = {
  'bob': 'npx ts-node 3-WETTEN/scripts/orchestrator.ts live',
  'chris': 'npx ts-node 3-WETTEN/scripts/watchdog.ts audit 1-SITE/apps/web/src',
  'mark': 'npx ts-node 3-WETTEN/scripts/voiceglot-fixer.ts 1-SITE/apps/web/src/components/ui',
  'anna': 'cd 1-SITE/apps/web && npm run lint',
  'felix': 'rm -rf 1-SITE/apps/web/.next',
  'moby': 'grep -r "md:" 1-SITE/apps/web/src/components/ui | wc -l',
  'laya': 'grep -r "rounded-\\[20px\\]" 1-SITE/apps/web/src | wc -l',
  'berny': 'ls 1-SITE/apps/web/src/app/studio/page.tsx'
};

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Admin (Basic check, assumes middleware handles auth)
    // In a real scenario, check session/cookies here.
    
    const body = await req.json();
    const { agent } = body;

    if (!agent || !ALLOWED_AGENTS[agent]) {
      return NextResponse.json({ error: 'Invalid agent' }, { status: 400 });
    }

    // 2. ENVIRONMENT CHECK: Local vs Production (Vercel)
    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

    if (isProduction) {
      //  REMOTE CONTROL PROTOCOL (GitHub Actions)
      console.log(` Triggering Remote Concert for Agent: ${agent}`);
      
      const GITHUB_TOKEN = process.env.BOB_GITHUB_TOKEN;
      const REPO_OWNER = 'johfrah';
      const REPO_NAME = 'voices-vercel';
      const WORKFLOW_ID = 'bob-concert.yml';

      if (!GITHUB_TOKEN) {
        return NextResponse.json({ error: 'Missing BOB_GITHUB_TOKEN in environment variables.' }, { status: 500 });
      }

      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_ID}/dispatches`, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          ref: 'main', // or the current branch
          inputs: {
            agent: agent
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub Dispatch Failed:', errorText);
        return NextResponse.json({ error: `GitHub Dispatch Failed: ${response.statusText}` }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        logs: ` Remote Concert gestart op GitHub! Bob wordt wakker... (Check Actions tab)` 
      });

    } else {
      //  LOCAL EXECUTION (Dev Mode)
      // Check if we are in apps/web or root
      const currentDir = process.cwd();
      let command = ALLOWED_AGENTS[agent];
      let cwd = currentDir;

    // If we are running inside 1-SITE/apps/web (dev server), we need to go up 3 levels to reach root
    // But wait, the 'command' strings assume we are at ROOT (e.g. "3-WETTEN/scripts/...").
    // So we need to execute from the Workspace Root.
    
    if (currentDir.endsWith('apps/web') || currentDir.endsWith('apps/web/')) {
       cwd = path.resolve(currentDir, '../../..');
    }

    console.log(` AGENT RUN: ${agent}`);
    console.log(`   Command: ${command}`);
    console.log(`   CWD: ${cwd}`);

    // 3. Execute Script
    return new Promise((resolve) => {
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          console.error(` Agent ${agent} failed:`, error);
          resolve(NextResponse.json({ 
            success: false, 
            error: error.message, 
            logs: stderr || stdout 
          }, { status: 500 }));
          return;
        }

        console.log(` Agent ${agent} finished.`);
        resolve(NextResponse.json({ 
          success: true, 
          logs: stdout 
        }));
      });
    });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}