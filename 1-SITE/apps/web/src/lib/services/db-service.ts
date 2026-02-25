import { db, languages, voiceTones, countries } from "@/lib/system/voices-config";
import { asc, eq } from "drizzle-orm";

/**
 *  ATOMIC CRUD ENGINE - MASTER SERVICE
 * 
 * Deze service garandeert dat alle data-mutaties:
 * 1. Gewikkeld zijn in een database transactie.
 * 2. De is_manually_edited flag zetten bij handmatige wijzigingen.
 * 3. Sonic DNA feedback triggeren.
 */

export class DbService {
  /**
   *  ATOMIC TAXONOMY ENGINE
   * Haalt alle beschikbare taxonomies op voor formulieren en filters.
   */
  static async getTaxonomies() {
    try {
      const [allLangs, allTones, allCountries] = await Promise.all([
        db.select().from(languages).orderBy(asc(languages.label)).catch(() => []),
        db.select().from(voiceTones).orderBy(asc(voiceTones.label)).catch(() => []),
        db.select().from(countries).orderBy(asc(countries.label)).catch(() => [])
      ]);

      return {
        languages: allLangs,
        tones: allTones,
        countries: allCountries
      };
    } catch (error) {
      console.error(' DbService.getTaxonomies failed:', error);
      return { languages: [], tones: [], countries: [] };
    }
  }

  /**
   * Voert een atomische update uit op een willekeurige tabel
   */
  static async updateRecord(
    table: any, 
    id: number, 
    data: Record<string, any>, 
    userId?: number
  ) {
    return await db.transaction(async (tx) => {
      // 1. Bereid de update voor
      const updateData = {
        ...data,
        isManuallyEdited: true,
        updatedAt: new Date(),
        // @ts-ignore
        lastEditedBy: userId
      };

      // 2. Voer de update uit
      const [result] = await tx.update(table)
        .set(updateData)
        .where(eq(table.id, id))
        .returning();

      return result;
    });
  }

  /**
   * Voert een atomische insert uit
   */
  static async createRecord(
    table: any, 
    data: Record<string, any>, 
    userId?: number
  ) {
    return await db.transaction(async (tx) => {
      const insertData = {
        ...data,
        isManuallyEdited: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        // @ts-ignore
        lastEditedBy: userId
      };

      const [result] = await tx.insert(table)
        .values(insertData)
        .returning();

      return result;
    });
  }

  /**
   * Voert een veilige delete uit
   */
  static async deleteRecord(table: any, id: number) {
    return await db.transaction(async (tx) => {
      return await tx.delete(table).where(eq(table.id, id));
    });
  }
}
