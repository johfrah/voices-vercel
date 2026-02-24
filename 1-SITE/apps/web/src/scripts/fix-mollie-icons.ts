import { MollieService } from '../lib/payments/mollie';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

async function fixMollieIcons() {
  console.log('🚀 Starting Mollie Icon Fixer...');
  
  try {
    const methods = await MollieService.getMethods();
    console.log('✅ Fetched methods from Mollie:', methods._embedded?.methods?.length || 0);
    
    if (methods._embedded?.methods) {
      methods._embedded.methods.forEach((m: any) => {
        console.log(`- ${m.id}: ${m.image?.size2x}`);
      });
    }
    
    console.log('\n💡 Tip: Zorg dat de volgende domeinen in next.config.mjs staan:');
    console.log('- www.mollie.com');
    
  } catch (error: any) {
    console.error('❌ Error fetching Mollie methods:', error.message);
  }
}

fixMollieIcons();
