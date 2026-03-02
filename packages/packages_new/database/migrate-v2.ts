import { db } from './src/index';
import { journeys, recordingSessions, recordingScripts, recordingFeedback, orderStatuses, paymentMethods } from './src/schema';
import { sql } from 'drizzle-orm';

async function migrateSchemaV2() {
  console.log('🚀 Starting V2 Schema Migration (The Flow Architecture)...');

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
      { code: 'studio', label: 'Voices Studio', description: 'Workshops en Academy trainingen' },
      { code: 'agency_vo', label: 'Agency: Voice-over', description: 'Standaard voice-over opdrachten' },
      { code: 'agency_ivr', label: 'Agency: Telefonie', description: 'IVR en wachtmuziek projecten' },
      { code: 'agency_commercial', label: 'Agency: Commercial', description: 'Radio, TV en online advertenties' },
      { code: 'agency_music', label: 'Agency: Music', description: 'Stock muziek en composities' }
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
      { code: 'waiting_po', label: 'Wacht op PO', color: 'purple' }
    ]).onConflictDoNothing();

    await db.insert(paymentMethods).values([
      { code: 'mollie_bancontact', label: 'Bancontact', isOnline: true },
      { code: 'mollie_ideal', label: 'iDEAL', isOnline: true },
      { code: 'mollie_banktransfer', label: 'Overschrijving', isOnline: false },
      { code: 'manual_invoice', label: 'Factuur', isOnline: false }
    ]).onConflictDoNothing();

    // 3. Update orders table
    console.log('🛒 Updating orders table columns...');
    await db.execute(sql`
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "status_id" integer REFERENCES "order_statuses"("id");
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_method_id" integer REFERENCES "payment_methods"("id");
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "amount_net" decimal(10, 2);
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "purchase_order" text;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "billing_email_alt" text;
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
