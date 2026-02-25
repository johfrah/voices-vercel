import { db, vaultFiles, actors, users, orders } from '@/lib/system/voices-config';
import { desc, eq, and, or, like, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

/**
 *  VAULT BROWSER API (2026)
 * 
 * Krachtige API voor het doorzoeken en filteren van de Kluis.
 * Ondersteunt filters op Project ID, Klant, Categorie en Datum.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const customerId = searchParams.get('customerId');
  const category = searchParams.get('category');
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    let conditions = [];

    if (projectId) {
      // Zoek op WP Order ID (6-cijferig) via de orders tabel link
      const order = await db.query.orders.findFirst({
        where: eq(orders.wpOrderId, parseInt(projectId))
      });
      if (order) {
        conditions.push(eq(vaultFiles.projectId, order.id));
      } else {
        // Als project niet gevonden is, return lege lijst
        return NextResponse.json([]);
      }
    }

    if (customerId) {
      conditions.push(eq(vaultFiles.customerId, parseInt(customerId)));
    }

    if (category && category !== 'all') {
      conditions.push(eq(vaultFiles.category, category));
    }

    if (query) {
      conditions.push(
        or(
          like(vaultFiles.originalName, `%${query}%`),
          like(vaultFiles.fileName, `%${query}%`)
        )
      );
    }

    const files = await db.query.vaultFiles.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        actor: true,
        customer: true,
        project: true
      },
      orderBy: [desc(vaultFiles.createdAt)],
      limit: limit,
      offset: offset
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error(' Vault Browser API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
