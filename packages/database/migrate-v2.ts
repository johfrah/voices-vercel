import { db } from './src/index';
import { journeys, recordingSessions, recordingScripts, recordingFeedback, orderStatuses, paymentMethods } from './src/schema';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function migrateSchemaV2() {
  console.log('🚀 Starting V2 Schema Migration (The Flow Architecture)...');

  // 🛡️ CHRIS-PROTOCOL: Force load env for standalone script
  if (!process.env.DATABASE_URL) {
    const envPath = path.resolve(process.cwd(), 'apps/web/.env.local');
    dotenv.config({ path: envPath });
    console.log(`📡 Env loaded from: ${envPath}`);
  }

  try {
    // 1. Create Journeys Table
    console.log('🛤️ Creating journeys table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "journeys" (
        "id" serial PRIMARY KEY NOT NULL,
        "code" text UNIQUE NOT NULL,
        "label" text NOT NULL,
        "description" text,
        "created_at" timestamp DEFAULT now()
      );
    `);

    // 2. Seed Master Journeys
    console.log('🌱 Seeding master journeys...');
    await db.insert(journeys).values([
      { code: 'studio', label: 'Voices Studio', description: 'Workshops en Academy trainingen', world_id: 2 },
      { code: 'video', label: 'Voice-over', description: 'Corporate & Website', world_id: 1 },
      { code: 'telephony', label: 'Telefoon', description: 'Voicemail & IVR', world_id: 1 },
      { code: 'commercial', label: 'Commercial', description: 'Radio, TV & Online Ads', world_id: 1 },
      { code: 'agency_music', label: 'Agency: Music', description: 'Stock muziek en composities', world_id: 1 },
      { code: 'academy', label: 'Voices Academy', description: 'Online Learning', world_id: 3 },
      { code: 'portfolio_sub', label: 'Portfolio: Abonnement', description: 'Jaarlijkse portfolio hosting', world_id: 5 },
      { code: 'portfolio_comm', label: 'Portfolio: Commissie', description: 'Commissie op directe boekingen', world_id: 5 },
      { code: 'partner_ivr', label: 'Partner: IVR Reseller', description: 'Doorverkoop via IVR partners', world_id: 8 },
      { code: 'freelance_prod', label: 'Freelance: Productie', description: 'Regie, camera en montage (B2B)', world_id: 7 },
      { code: 'ademing', label: 'Ademing', description: 'Mentale rust en meditatie', world_id: 6 },
      { code: 'artist', label: 'Artist', description: 'Muzieklabel en releases', world_id: 25 },
      { code: 'agency_ai', label: 'Agency: Johfrai (AI)', description: 'Robot voices en AI-casting', world_id: 10 }
    ]).onConflictDoNothing();

    // 2b. Create Statuses & Payment Methods
    console.log('🚦 Creating status & payment tables...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "order_statuses" (
        "id" serial PRIMARY KEY NOT NULL,
        "code" text UNIQUE NOT NULL,
        "label" text NOT NULL,
        "color" text,
        "created_at" timestamp DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "payment_methods" (
        "id" serial PRIMARY KEY NOT NULL,
        "code" text UNIQUE NOT NULL,
        "label" text NOT NULL,
        "is_online" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      );
    `);

    console.log('🌱 Seeding statuses & payment methods...');
    await db.insert(orderStatuses).values([
      { code: 'completed', label: 'Voltooid', color: 'green' },
      { code: 'refunded', label: 'Terugbetaald', color: 'red' },
      { code: 'unpaid', label: 'Onbetaald', color: 'orange' },
      { code: 'quote_sent', label: 'Offerte Verzonden', color: 'blue' },
      { code: 'waiting_po', label: 'Wacht op PO', color: 'purple' },
      { code: 'trash', label: 'Verwijderd', color: 'gray' },
      { code: 'cancelled', label: 'Geannuleerd', color: 'gray' },
      { code: 'failed', label: 'Mislukt', color: 'red' }
    ]).onConflictDoNothing();

    await db.insert(paymentMethods).values([
      { code: 'mollie_bancontact', label: 'Bancontact', isOnline: true },
      { code: 'mollie_ideal', label: 'iDEAL', isOnline: true },
      { code: 'mollie_banktransfer', label: 'Overschrijving', isOnline: false },
      { code: 'manual_invoice', label: 'Factuur', isOnline: false },
      { code: 'mollie_creditcard', label: 'Creditcard', isOnline: true },
      { code: 'mollie_paypal', label: 'PayPal', isOnline: true },
      { code: 'mollie_belfius', label: 'Belfius', isOnline: true },
      { code: 'mollie_kbc', label: 'KBC', isOnline: true },
      { code: 'mollie_applepay', label: 'Apple Pay', isOnline: true },
      { code: 'mollie_sofort', label: 'Sofort', isOnline: true },
      { code: 'cod', label: 'Cash on Delivery', isOnline: false },
      { code: 'cheque', label: 'Cheque', isOnline: false },
      { code: 'bacs', label: 'Direct Bank Transfer', isOnline: false }
    ]).onConflictDoNothing();

    // 3. Update orders table
    console.log('🛒 Updating orders table columns...');
    await db.execute(sql`
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "status_id" integer REFERENCES "order_statuses"("id");
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_method_id" integer REFERENCES "payment_methods"("id");
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "amount_net" decimal(10, 2);
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "purchase_order" text;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "billing_email_alt" text;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "legacy_order_number" text;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "legacy_invoice_number" text;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "production_status_id" integer;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "is_synced_to_accounting" boolean DEFAULT false;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "is_vies_validated" boolean DEFAULT false;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "utm_source" text;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "utm_medium" text;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "utm_campaign" text;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "market_id" integer;
    `);

    // 4. Rename Studio Sessions to Recording Sessions (The Great Purge of Slop)
    console.log('🎤 Renaming studio_sessions to recording_sessions...');
    
    // Check if old table exists before renaming
    const oldTableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'studio_sessions'
      );
    `);

    if (oldTableCheck[0]?.exists) {
      await db.execute(sql`ALTER TABLE "studio_sessions" RENAME TO "recording_sessions";`);
      await db.execute(sql`ALTER TABLE "studio_scripts" RENAME TO "recording_scripts";`);
      await db.execute(sql`ALTER TABLE "studio_feedback" RENAME TO "recording_feedback";`);
      
      // Update sequences if necessary (Postgres specific)
      await db.execute(sql`ALTER SEQUENCE IF EXISTS "studio_sessions_id_seq" RENAME TO "recording_sessions_id_seq";`);
      await db.execute(sql`ALTER SEQUENCE IF EXISTS "studio_scripts_id_seq" RENAME TO "recording_scripts_id_seq";`);
      await db.execute(sql`ALTER SEQUENCE IF EXISTS "studio_feedback_id_seq" RENAME TO "recording_feedback_id_seq";`);
    }

    console.log('✅ V2 Schema Migration Completed Successfully.');
  } catch (error) {
    console.error('❌ V2 Schema Migration Failed:', error);
    process.exit(1);
  }
  process.exit(0);
}

migrateSchemaV2();
