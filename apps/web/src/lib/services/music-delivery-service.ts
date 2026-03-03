import { db, getTable } from '@/lib/system/voices-config';

const media = getTable('media');
const orders = getTable('orders');
const users = getTable('users');
import { eq, sql } from 'drizzle-orm';
import { DropboxService } from '@/lib/services/dropbox-service';

/**
 *  MUSIC DELIVERY SERVICE (2026)
 * 
 * Verantwoordelijk voor het leveren van aangekochte muziekstukken.
 * Na betaling worden de juiste formaten klaargezet in Dropbox.
 */
export class MusicDeliveryService {
  static async deliverMusic(orderId: number) {
    console.log(` [MUSIC DELIVERY] Starting delivery for Order #${orderId}...`);

    try {
      // 1. Haal order en klantgegevens op
      const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (!order || !order.user_id) return;

      const [user] = await db.select().from(users).where(eq(users.id, order.user_id)).limit(1);
      if (!user) return;

      // 2. Check of er muziek in de order zit
      const musicMeta = (order.rawMeta as any)?.music;
      if (!musicMeta || !musicMeta.trackId) {
        console.log(` [MUSIC DELIVERY] No music found in Order #${orderId}. Skipping.`);
        return;
      }

      // 3. Haal de track details op uit de media tabel
      // 🛡️ CHRIS-PROTOCOL: Match by media.id first (new flow), fallback to legacyId (v2.28.1)
      let [track] = await db.select().from(media)
        .where(eq(media.id, parseInt(musicMeta.trackId)))
        .limit(1);
      
      if (!track) {
        // @ts-ignore - Drizzle metadata query (legacy fallback)
        [track] = await db.select().from(media)
          .where(eq(media.category, 'music'))
          .where(sql`${media.metadata}->>'legacyId' = ${musicMeta.trackId}`)
          .limit(1);
      }

      if (!track) {
        console.error(` [MUSIC DELIVERY] Track ${musicMeta.trackId} not found in database!`);
        return;
      }

      const formats = (track.metadata as any)?.formats;
      if (!formats) {
        console.error(` [MUSIC DELIVERY] No formats found for track ${track.fileName}`);
        return;
      }

      // 4. Download WAVs from Supabase Storage and upload to Dropbox Exports
      const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/voices/`;
      // Order folder name = just the order ID number (e.g. "27342")
      const orderRef = String(orderId);
      const trackName = (track as any).altText || (track as any).alt_text || (track as any).fileName || 'muziek';
      
      const qualityMap: Record<string, string> = {
        '48khz': '48kHz 24bit',
        '8khz': '8kHz 16bit',
        '16khz': '16kHz 16bit',
      };
      
      let deliveredCount = 0;
      
      // Get Dropbox access token via OAuth refresh
      const tokenParams = new URLSearchParams();
      tokenParams.append('grant_type', 'refresh_token');
      tokenParams.append('refresh_token', process.env.DROPBOX_REFRESH_TOKEN || '');
      tokenParams.append('client_id', process.env.DROPBOX_CLIENT_ID || '');
      tokenParams.append('client_secret', process.env.DROPBOX_CLIENT_SECRET || '');
      const tokenRes = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenParams
      });
      const { access_token: accessToken } = await tokenRes.json();
      if (!accessToken) {
        console.error(' [MUSIC DELIVERY] Failed to get Dropbox access token');
        return { success: false, files: 0 };
      }
      
      for (const [quality, storagePath] of Object.entries(formats)) {
        const subFolder = qualityMap[quality] || quality;
        const fileName = storagePath.split('/').pop() || `${trackName}-${quality}.wav`;
        const dropboxPath = `/Voices.be/Projects/Exports/${orderRef}/${subFolder}/${fileName}`;
        
        try {
          // Download from Supabase
          const wavRes = await fetch(`${storageBase}${storagePath}`);
          if (!wavRes.ok) {
            console.error(` [MUSIC DELIVERY] Failed to download ${quality}: ${wavRes.status}`);
            continue;
          }
          const wavBuffer = Buffer.from(await wavRes.arrayBuffer());
          
          // Upload to Dropbox
          const uploadRes = await fetch('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/octet-stream',
              'Dropbox-API-Arg': JSON.stringify({
                path: dropboxPath,
                mode: 'overwrite',
                autorename: false
              })
            },
            body: wavBuffer
          });
          const uploadData = await uploadRes.json();
          
          if (uploadData.id) {
            console.log(` [MUSIC DELIVERY] ✅ ${quality}: ${fileName} → ${dropboxPath}`);
            deliveredCount++;
          } else {
            console.error(` [MUSIC DELIVERY] ❌ ${quality} upload failed:`, uploadData.error_summary);
          }
        } catch (err) {
          console.error(` [MUSIC DELIVERY] ❌ ${quality} delivery error:`, err);
        }
      }

      console.log(` [MUSIC DELIVERY] Delivered ${deliveredCount} music files for Order #${orderId}.`);
      return { success: deliveredCount > 0, files: deliveredCount };

    } catch (err) {
      console.error(` [MUSIC DELIVERY] Failed to deliver music for Order #${orderId}:`, err);
      throw err;
    }
  }
}
