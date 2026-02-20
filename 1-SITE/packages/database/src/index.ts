import * as schema from './schema/index';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

// Sherlock: We gebruiken een lazy initializer voor de DB client om te voorkomen dat 
// postgres.js wordt geïnitialiseerd in de Edge runtime (waar het niet werkt).
// We gebruiken globalThis om te voorkomen dat er tijdens hot-reloads in dev 
// telkens nieuwe connecties worden geopend.
const getDb = () => {
  if (typeof window !== 'undefined') return null; // No DB on client
  
  if (process.env.NEXT_RUNTIME === 'edge') {
    return null;
  }
  
  if (!(globalThis as any).dbInstance) {
    try {
      const connectionString = process.env.DATABASE_URL!;
      if (!connectionString) return null;
      
      // CHRIS-PROTOCOL: Force Session Mode for Serverless stability
      // We voegen ?pgbouncer=true toe als dat nog niet zo is, of we forceren de poort
      const sessionConnectionString = connectionString.includes('?') 
        ? `${connectionString}&pgbouncer=true` 
        : `${connectionString}?pgbouncer=true`;

      const client = postgres(sessionConnectionString, { 
        prepare: false,
        max: 1,
        idle_timeout: 20,
        connect_timeout: 30,
        ssl: 'require'
      });
      
      (globalThis as any).dbInstance = drizzle(client, { 
        schema
      });
      console.log('✅ Drizzle initialized (Pool size:', process.env.NODE_ENV === 'development' ? 5 : 10, ')');
    } catch (e) {
      console.error('❌ Failed to initialize Drizzle:', e);
      return null;
    }
  }
  return (globalThis as any).dbInstance;
};

export const db = new Proxy({} as any, {
  get(target, prop) {
    const instance = getDb();
    if (!instance) {
      // Return a proxy that throws or handles missing DB gracefully
      return (...args: any[]) => {
        throw new Error(`Database access failed: Drizzle not initialized (Edge runtime or missing URL). Prop: ${String(prop)}`);
      };
    }
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});
