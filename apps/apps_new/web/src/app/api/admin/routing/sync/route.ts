import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    console.log('☢️ Starting Nuclear Sync from UI...');
    
    // We run the sitemap generation script
    const scriptPath = path.resolve(process.cwd(), '3-WETTEN/scripts/generate-atomic-sitemap.ts');
    const { stdout, stderr } = await execAsync(`npx tsx ${scriptPath}`);
    
    if (stderr && !stdout) {
      console.error('❌ Sync Error:', stderr);
      return NextResponse.json({ error: stderr }, { status: 500 });
    }

    console.log('✅ Sync Success:', stdout);
    return NextResponse.json({ success: true, output: stdout });
  } catch (err: any) {
    console.error('❌ Fatal Sync Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
