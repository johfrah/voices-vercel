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
                  let connectionString = process.env.DATABASE_URL!;
                  if (!connectionString) return null;
                  
                  // CHRIS-PROTOCOL: Transaction Mode for Serverless Stability (v2.14)
                  // We use port 6543 (Transaction Mode) with a small pool size to avoid saturation.
                  if (connectionString.includes(':5432')) {
                    console.log('🔄 Switching to transaction mode pooler (port 6543) for stability...');
                    connectionString = connectionString.replace(':5432', ':6543');
                  }
                  
                  if (!connectionString.includes('pgbouncer=true')) {
                    connectionString += (connectionString.includes('?') ? '&' : '?') + 'pgbouncer=true';
                  }
                  
                  console.log('🔗 Final Connection String (sanitized):', connectionString.replace(/:[^:]+@/, ':****@'));
      const supabaseRootCA = `-----BEGIN CERTIFICATE-----
MIIDxDCCAqygAwIBAgIUbLxMod62P2ktCiAkxnKJwtE9VPYwDQYJKoZIhvcNAQEL
BQAwazELMAkGA1UEBhMCVVMxEDAOBgNVBAgMB0RlbHdhcmUxEzARBgNVBAcMCk5l
dyBDYXN0bGUxFTATBgNVBAoMDFN1cGFiYXNlIEluYzEeMBwGA1UEAwwVU3VwYWJh
c2UgUm9vdCAyMDIxIENBMB4XDTIxMDQyODEwNTY1M1oXDTMxMDQyNjEwNTY1M1ow
azELMAkGA1UEBhMCVVMxEDAOBgNVBAgMB0RlbHdhcmUxEzARBgNVBAcMCk5ldyBD
YXN0bGUxFTATBgNVBAoMDFN1cGFiYXNlIEluYzEeMBwGA1UEAwwVU3VwYWJhc2Ug
Um9vdCAyMDIxIENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqQXW
QyHOB+qR2GJobCq/CBmQ40G0oDmCC3mzVnn8sv4XNeWtE5XcEL0uVih7Jo4Dkx1Q
DmGHBH1zDfgs2qXiLb6xpw/CKQPypZW1JssOTMIfQppNQ87K75Ya0p25Y3ePS2t2
GtvHxNjUV6kjOZjEn2yWEcBdpOVCUYBVFBNMB4YBHkNRDa/+S4uywAoaTWnCJLUi
cvTlHmMw6xSQQn1UfRQHk50DMCEJ7Cy1RxrZJrkXXRP3LqQL2ijJ6F4yMfh+Gyb4
O4XajoVj/+R4GwywKYrrS8PrSNtwxr5StlQO8zIQUSMiq26wM8mgELFlS/32Uclt
NaQ1xBRizkzpZct9DwIDAQABo2AwXjALBgNVHQ8EBAMCAQYwHQYDVR0OBBYEFKjX
uXY32CztkhImng4yJNUtaUYsMB8GA1UdIwQYMBaAFKjXuXY32CztkhImng4yJNUt
aUYsMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAB8spzNn+4VU
tVxbdMaX+39Z50sc7uATmus16jmmHjhIHz+l/9GlJ5KqAMOx26mPZgfzG7oneL2b
VW+WgYUkTT3XEPFWnTp2RJwQao8/tYPXWEJDc0WVQHrpmnWOFKU/d3MqBgBm5y+6
jB81TU/RG2rVerPDWP+1MMcNNy0491CTL5XQZ7JfDJJ9CCmXSdtTl4uUQnSuv/Qx
Cea13BX2ZgJc7Au30vihLhub52De4P/4gonKsNHYdbWjg7OWKwNv/zitGDVDB9Y2
CMTyZKG3XEu5Ghl1LEnI3QmEKsqaCLv12BnVjbkSeZsMnevJPs1Ye6TjjJwdik5P
o/bKiIz+Fq8=
-----END CERTIFICATE-----`;

      const poolSize = process.env.NEXT_PHASE === 'phase-production-build' ? 5 : (process.env.NODE_ENV === 'production' ? 1 : 10);
      
      if (!(globalThis as any).postgresClient) {
        (globalThis as any).postgresClient = postgres(connectionString, { 
          prepare: false, 
          ssl: {
            ca: supabaseRootCA,
            rejectUnauthorized: false,
          },
          connect_timeout: 20,
          onnotice: () => {},
          idle_timeout: 20,
          max: poolSize,
        });
      }

      (globalThis as any).dbInstance = drizzle((globalThis as any).postgresClient, { 
        schema
      });
      console.log(`✅ Drizzle initialized (Pool size: ${poolSize})`);
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
