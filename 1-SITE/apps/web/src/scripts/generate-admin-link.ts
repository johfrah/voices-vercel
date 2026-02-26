import { db, users } from '@/lib/system/voices-config';
import { MarketManager } from '@/lib/system/market-manager-server';
import { eq, sql } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// 🛡️ CHRIS-PROTOCOL: MarketManager is Source of Truth (v2.15.022)
const currentMarket = MarketManager.getCurrentMarket();
const adminEmail = process.env.ADMIN_EMAIL || currentMarket.email;

async function generatePersistentLink() {
  console.log(`🚀 Genereren van PERSISTENTE admin link voor: ${adminEmail}`);

  // 1. Genereer een unieke admin key
  const adminKey = `ak_${uuidv4().replace(/-/g, '')}`;

  try {
    // 2. Sla de key op in de database via Raw SQL (Chris-Protocol: Anti-Drift)
    // We gebruiken de postgres client direct om de Supabase API cache te omzeilen
    const postgres = require('postgres');
    const connectionString = process.env.DATABASE_URL!.replace('?pgbouncer=true', '');
    const sqlDirect = postgres(connectionString, {
      ssl: 'require',
    });
    
    // Sherlock: Eerst de kolom toevoegen als deze nog niet bestaat (Chris-Protocol: Self-Healing)
    try {
      await sqlDirect`ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_key TEXT`;
      console.log('✅ Database schema updated (admin_key column added)');
    } catch (e) {
      // Kolom bestaat waarschijnlijk al
    }

    await sqlDirect`UPDATE users SET admin_key = ${adminKey} WHERE email = ${adminEmail}`;
    await sqlDirect.end();

    const domains = MarketManager.getMarketDomains();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || domains[currentMarket.market_code] || domains['BE'];
    const finalLink = `${siteUrl.replace(/\/$/, '')}/api/auth/admin-key?key=${adminKey}`;

    console.log('\n✅ Persistente link succesvol gegenereerd!');
    console.log('Deze link is herbruikbaar en blijft 1 jaar geldig op je smartphone.');
    console.log('-----------------------------------');
    console.log(finalLink);
    console.log('-----------------------------------');
    console.log('\nTIP: Open deze link op je smartphone en kies "Zet op beginscherm" voor de app-ervaring.');

  } catch (error: any) {
    console.error('❌ Fout bij database update:', error.message);
  }
}

generatePersistentLink();
