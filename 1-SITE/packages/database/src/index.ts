// Sherlock: We gebruiken een lazy initializer voor de DB client om te voorkomen dat 
// postgres.js wordt geïnitialiseerd in de Edge runtime (waar het niet werkt).
let dbInstance: any = null;
let schema: any = null;

const getDb = () => {
  if (typeof window !== 'undefined') return null; // No DB on client
  
  // Sherlock: Als we in een Edge of Node.js runtime van Next.js zitten (tijdens build/edge),
  // dan mogen we postgres.js niet laden omdat het 'net' en 'path' nodig heeft.
  if (process.env.NEXT_RUNTIME === 'edge' || process.env.NEXT_RUNTIME === 'nodejs') {
    return null;
  }
  
  if (!dbInstance) {
    try {
      // Sherlock: We gebruiken eval('require') om te voorkomen dat Webpack de modules 
      // probeert te bundelen voor de Edge runtime, wat 'net' errors veroorzaakt.
      const req = eval('require');
      const postgres = req('postgres');
      const { drizzle } = req('drizzle-orm/postgres-js');
      schema = req('./schema');

      const connectionString = process.env.DATABASE_URL!;
      if (!connectionString) return null;
      
      const client = postgres(connectionString, { prepare: false });
      dbInstance = drizzle(client, { schema });
    } catch (e) {
      console.error('❌ Failed to initialize Drizzle:', e);
      return null;
    }
  }
  return dbInstance;
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
