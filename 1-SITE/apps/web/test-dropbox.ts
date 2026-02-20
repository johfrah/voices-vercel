import { DropboxService } from './src/services/DropboxService';
import * as dotenv from 'dotenv';
import path from 'path';

// Laad .env vanuit de root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testDropbox() {
  console.log('🚀 Start Dropbox Test...');
  const hasRefresh = !!process.env.DROPBOX_REFRESH_TOKEN;
  console.log('Refresh Token check:', hasRefresh ? '✅ Aanwezig' : '❌ Ontbreekt');

  if (!hasRefresh) {
    console.error('❌ DROPBOX_REFRESH_TOKEN niet gevonden in .env.local');
    return;
  }

  const dropbox = DropboxService.getInstance();
  const projectName = "BOB_TEST_PROJECT";
  const sessionHash = "TEST_" + Math.random().toString(36).substring(7);

  console.log(`📂 Aanmaken testmap voor: ${projectName}...`);
  const url = await dropbox.createCastingFolder(projectName, sessionHash);

  if (url) {
    console.log('✅ Succes! Map aangemaakt.');
    console.log('🔗 Link:', url);
  } else {
    console.log('❌ Fout bij aanmaken map. Check de console logs.');
  }
}

testDropbox();
