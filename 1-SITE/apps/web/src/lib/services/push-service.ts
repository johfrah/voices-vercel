import webpush from 'web-push';
import { db, getTable } from '../system/voices-config';

const chatPushSubscriptions = getTable('chatPushSubscriptions');
import { MarketManager } from "../system/core/market-manager";
import { eq, inArray } from 'drizzle-orm';

/**
 * 🚀 PUSH SERVICE (VOICES 2026)
 * 
 * Verstuurt real-time notificaties naar geabonneerde admins.
 */
export class PushService {
  private static isInitialized = false;

  private static init() {
    if (this.isInitialized) return;

    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    
    // 🛡️ CHRIS-PROTOCOL: Use MarketManager for dynamic subject (v2.15.022)
    const market = MarketManager.getCurrentMarket();
    const subject = process.env.VAPID_SUBJECT || `mailto:${market.email}`;

    if (!publicKey || !privateKey) {
      console.error('[PushService] VAPID keys missing in environment');
      return;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    this.isInitialized = true;
    console.log('[PushService] VAPID details initialized');
  }

  /**
   * Stuur een notificatie naar alle actieve admin subscriptions.
   */
  static async notifyAdmins(payload: { title: string, body: string, url?: string }) {
    this.init();
    if (!this.isInitialized) return;

    try {
      // 🛡️ CHRIS-PROTOCOL: Use Drizzle for connection stability (v2.14.789)
      const subscriptions = await db
        .select({
          endpoint: chatPushSubscriptions.endpoint,
          p256dh: chatPushSubscriptions.p256Dh,
          auth: chatPushSubscriptions.auth
        })
        .from(chatPushSubscriptions)
        .where(eq(chatPushSubscriptions.enabled, true));

      if (subscriptions.length === 0) {
        console.log('[PushService] No active subscriptions found');
        return;
      }

      console.log(`[PushService] Sending notification to ${subscriptions.length} subscribers...`);

      const notificationPayload = JSON.stringify(payload);

      const results = await Promise.allSettled(
        subscriptions.map(sub => 
          webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            },
            notificationPayload
          ).then(res => {
            console.log(`[PushService] Successfully sent to ${sub.endpoint.substring(0, 30)}... Status: ${res.statusCode}`);
            return res;
          })
        )
      );

      // Cleanup failed subscriptions (e.g. expired)
      const failedEndpoints: string[] = [];
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`[PushService] Failed for ${subscriptions[i].endpoint.substring(0, 30)}... Reason:`, r.reason.message || r.reason);
          if (r.reason.statusCode === 410 || r.reason.statusCode === 404) {
            failedEndpoints.push(subscriptions[i].endpoint);
          }
        }
      });

      if (failedEndpoints.length > 0) {
        await db
          .update(chatPushSubscriptions)
          .set({ enabled: false })
          .where(inArray(chatPushSubscriptions.endpoint, failedEndpoints));
        
        console.log(`[PushService] Cleaned up ${failedEndpoints.length} expired subscriptions`);
      }

    } catch (error) {
      console.error('[PushService] Notification broadcast failed:', error);
    }
  }
}
