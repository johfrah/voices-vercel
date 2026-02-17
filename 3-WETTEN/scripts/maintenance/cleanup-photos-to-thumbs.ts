import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PHOTOS_DIR = './1-SITE/assets/visuals/active/photos';
const THUMBS_DIR = './1-SITE/assets/visuals/active/thumbnails';

function getDimensions(filePath: string) {
  try {
    const output = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const w = output.match(/pixelWidth: (\d+)/);
    const h = output.match(/pixelHeight: (\d+)/);
    if (w && h) return { width: parseInt(w[1]), height: parseInt(h[1]) };
  } catch (e) {}
  return null;
}

async function cleanupThumbs() {
  console.log("🧹 Opschonen van thumbnails uit de photos map...");
  
  if (!fs.existsSync(PHOTOS_DIR)) return;
  if (!fs.existsSync(THUMBS_DIR)) fs.mkdirSync(THUMBS_DIR, { recursive: true });

  const files = fs.readdirSync(PHOTOS_DIR);
  let movedCount = 0;

  files.forEach(fileName => {
    const filePath = path.join(PHOTOS_DIR, fileName);
    const dims = getDimensions(filePath);
    
    if (dims && dims.width === 230 && dims.height === 350) {
      const newFileName = fileName.replace('-photo-', '-thumb-');
      const newPath = path.join(THUMBS_DIR, newFileName);
      
      fs.renameSync(filePath, newPath);
      console.log(`✅ Verplaatst naar thumbnails: ${fileName} -> ${newFileName}`);
      movedCount++;
    }
  });

  console.log(`\n✨ Klaar! ${movedCount} thumbnails verplaatst.`);
}

cleanupThumbs().catch(console.error);
