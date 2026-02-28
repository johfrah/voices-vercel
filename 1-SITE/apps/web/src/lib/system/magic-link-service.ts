import { db, getTable } from '@/lib/system/voices-config';

const users = getTable('users');
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 *  MAGIC LINK SERVICE (VOICES 2026)
 * 
 * Beheert de generatie en validatie van tijdelijke tokens voor
 * wachtwoordloze toegang tot het dashboard.
 */
export class MagicLinkService {
  /**
   * Genereert een unieke token voor een gebruiker die 24 uur geldig is.
   */
  static async generateToken(user_id: number): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await db.update(users)
      .set({
        // @ts-ignore - Dynamic column
        magic_link_token: token,
        // @ts-ignore - Dynamic column
        magic_link_expires_at: expiresAt
      })
      .where(eq(users.id, user_id));

    return token;
  }

  /**
   * Valideert een token en geeft de userId terug indien geldig.
   */
  static async validateToken(token: string): Promise<number | null> {
    // @ts-ignore - Dynamic query
    const user = await db.query.users.findFirst({
      // @ts-ignore - Dynamic column
      where: eq(users.magic_link_token, token)
    });

    if (!user || !user.magic_link_expires_at) return null;

    const now = new Date();
    if (now > user.magic_link_expires_at) {
      // Token verlopen, opschonen
      await db.update(users)
        .set({ magic_link_token: null, magic_link_expires_at: null })
        .where(eq(users.id, user.id));
      return null;
    }

    return user.id;
  }

  /**
   * Verbruikt een token (nmalig gebruik).
   */
  static async consumeToken(token: string): Promise<void> {
    await db.update(users)
      .set({ magic_link_token: null, magic_link_expires_at: null })
      // @ts-ignore - Dynamic column
      .where(eq(users.magic_link_token, token));
  }
}
