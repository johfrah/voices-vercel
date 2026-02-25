import { db } from '@/lib/system/db';
import { orderItems, voiceAffinity, actors } from '@/lib/system/db';
import { sql, eq, and, or } from 'drizzle-orm';

/**
 *  VOICE AFFINITY ENGINE (2026)
 * 
 * Scant historische orders om te zien welke stemmen vaak samen worden geboekt.
 * Dit activeert de "Anderen kozen ook deze stem" logica in de Bento Grid.
 */

export async function runVoiceAffinityScan() {
    console.log(' Starting Voice Affinity Deep Scan...');
    
    try {
        // 1. Haal alle orders op die meer dan 1 stem bevatten
        const multiVoiceOrders = await db.execute(sql`
            SELECT order_id, ARRAY_AGG(actor_id) as actor_ids
            FROM ${orderItems}
            WHERE actor_id IS NOT NULL
            GROUP BY order_id
            HAVING COUNT(actor_id) > 1
        `);

        console.log(` Found ${multiVoiceOrders.length} multi-voice orders to analyze.`);

        const pairs: Record<string, number> = {};

        // 2. Bereken combinaties (A-B paren)
        for (const order of multiVoiceOrders as any) {
            const ids = order.actor_ids.sort((a: number, b: number) => a - b);
            for (let i = 0; i < ids.length; i++) {
                for (let j = i + 1; j < ids.length; j++) {
                    const pairKey = `${ids[i]}-${ids[j]}`;
                    pairs[pairKey] = (pairs[pairKey] || 0) + 1;
                }
            }
        }

        // 3. Atomic Update van de voice_affinity tabel
        console.log(` Mapping ${Object.keys(pairs).length} unique voice relationships...`);

        for (const [pair, count] of Object.entries(pairs)) {
            const [idA, idB] = pair.split('-').map(Number);

            await db.insert(voiceAffinity).values({
                voiceAId: idA,
                voiceBId: idB,
                pairCount: count
            }).onConflictDoUpdate({
                target: [voiceAffinity.voiceAId, voiceAffinity.voiceBId],
                set: { pairCount: count }
            });
        }

        return { 
            success: true, 
            stats: {
                ordersAnalyzed: multiVoiceOrders.length,
                relationshipsMapped: Object.keys(pairs).length
            }
        };
    } catch (error) {
        console.error(' Voice Affinity Scan Failed:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
