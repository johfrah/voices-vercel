import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 🕵️‍♂️ ORANGE TAG DETECTOR (2026)
 * 
 * Doel: Alle bestanden met een "Oranje" Finder tag identificeren en analyseren.
 */

const PHOTOS_DIR = './1-SITE/assets/visuals/active/photos';

function getDimensions(filePath: string) {
  try {
    const output = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const w = output.match(/pixelWidth: (\d+)/);
    const h = output.match(/pixelHeight: (\d+)/);
    if (w && h) return { width: parseInt(w[1]), height: parseInt(h[1]) };
  } catch (e) {}
  return null;
}

function hasOrangeTag(filePath: string) {
  try {
    const output = execSync(`xattr -p com.apple.metadata:_kMDItemUserTags "${filePath}"`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    return output.includes('Oranje') || output.includes('Orange');
  } catch (e) {}
  return false;
}

async function analyzeOrangeFiles() {
  console.log("🔍 Scannen op oranje labels...");
  
  if (!fs.existsSync(PHOTOS_DIR)) return;

  const files = fs.readdirSync(PHOTOS_DIR);
  const orangeFiles: any[] = [];

  files.forEach(fileName => {
    const filePath = path.join(PHOTOS_DIR, fileName);
    if (hasOrangeTag(filePath)) {
      const dims = getDimensions(filePath);
      const stats = fs.statSync(filePath);
      orangeFiles.push({
        fileName,
        dims: dims ? `${dims.width}x${dims.height}` : 'unknown',
        size: (stats.size / 1024).toFixed(1) + ' KB',
        id: fileName.split('-')[0]
      });
    }
  });

  console.log(`\n📊 Gevonden oranje bestanden: ${orangeFiles.length}`);
  
  // Groepeer per ID om dubbelen te zien
  const grouped: { [id: string]: any[] } = {};
  orangeFiles.forEach(f => {
    if (!grouped[f.id]) grouped[f.id] = [];
    grouped[f.id].push(f);
  });

  orangeFiles.forEach(f => {
    console.log(`- ${f.fileName} (${f.dims}, ${f.size})`);
    
    // Check of er een betere versie is voor dit ID
    const otherFiles = files.filter(name => name.startsWith(f.id + '-') && name !== f.fileName);
    if (otherFiles.length > 0) {
      console.log(`  💡 Er zijn ${otherFiles.length} andere versies voor dit ID.`);
    }
  });

  fs.writeFileSync('./3-WETTEN/scripts/maintenance/orange-files-analysis.json', JSON.stringify(orangeFiles, null, 2));
}

analyzeOrangeFiles().catch(console.error);
