import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export async function POST(req: NextRequest) {
  try {
    const { voiceId, fileName, crop, aspect } = await req.json();

    // Bronpad bepalen (we gaan ervan uit dat het in visuals/active/photos staat)
    const sourceDir = path.resolve(process.cwd(), '1-SITE/assets/visuals/active/photos');
    const targetDir = path.resolve(process.cwd(), '1-SITE/assets/visuals/active/photos/optimised');
    
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const sourcePath = path.join(sourceDir, fileName);
    const fileNameNoExt = path.parse(fileName).name;
    
    // Bepaal de target naam op basis van aspect
    const isSquare = Math.abs(aspect - 1) < 0.01;
    const targetFileName = isSquare ? `${fileNameNoExt}.jpg` : `${fileNameNoExt}-${aspect < 1 ? '9x16' : '16x9'}.jpg`;
    const targetPath = path.join(targetDir, targetFileName);

    // SIPS commando bouwen
    // crop: { x, y, width, height } in pixels op de bron
    // sips --cropArea <top> <left> <height> <width>
    const sipsCmd = `sips --cropArea ${Math.round(crop.y)} ${Math.round(crop.x)} ${Math.round(crop.height)} ${Math.round(crop.width)} -Z ${isSquare ? 800 : 1200} "${sourcePath}" --out "${targetPath}"`;
    
    console.log(` Executing sips: ${sipsCmd}`);
    execSync(sipsCmd);

    return NextResponse.json({ success: true, path: targetPath });
  } catch (error: any) {
    console.error(' Error saving crop:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
