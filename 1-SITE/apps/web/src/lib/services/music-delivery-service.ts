import { db, media, orders, users } from '@/lib/system/voices-config';
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
      if (!order || !order.userId) return;

      const [user] = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
      if (!user) return;

      // 2. Check of er muziek in de order zit
      const musicMeta = (order.rawMeta as any)?.music;
      if (!musicMeta || !musicMeta.trackId) {
        console.log(` [MUSIC DELIVERY] No music found in Order #${orderId}. Skipping.`);
        return;
      }

      // 3. Haal de track details op uit de media tabel
      // @ts-ignore - Drizzle metadata query
      const [track] = await db.select().from(media)
        .where(eq(media.category, 'music'))
        .where(sql`${media.metadata}->>'legacyId' = ${musicMeta.trackId}`)
        .limit(1);

      if (!track) {
        console.error(` [MUSIC DELIVERY] Track ${musicMeta.trackId} not found in database!`);
        return;
      }

      const formats = (track.metadata as any)?.formats;
      if (!formats) {
        console.error(` [MUSIC DELIVERY] No formats found for track ${track.fileName}`);
        return;
      }

      // 4. Bepaal welke bestanden geleverd moeten worden
      const filesToDeliver: string[] = [];
      
      // We leveren ALTIJD alle formaten van de gekozen track
      if (formats['48khz']) filesToDeliver.push(formats['48khz']);
      if (formats['16khz']) filesToDeliver.push(formats['16khz']);
      if (formats['8khz']) filesToDeliver.push(formats['8khz']);

      // 5. Push naar Dropbox via de Service
      const dropbox = DropboxService.getInstance();
      await dropbox.syncToControlFolder(
        orderId.toString(),
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Klant',
        `Muzieklicentie - ${track.altText || track.fileName}`
      );

      console.log(` [MUSIC DELIVERY] Successfully pushed ${filesToDeliver.length} files to Dropbox for Order #${orderId}.`);

      return { success: true, files: filesToDeliver.length };

    } catch (err) {
      console.error(` [MUSIC DELIVERY] Failed to deliver music for Order #${orderId}:`, err);
      throw err;
    }
  }
}
