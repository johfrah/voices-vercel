import { db, actors, orders, users, contentArticles } from '@/lib/system/db';
import { ilike, or, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: GLOBAL ADMIN SEARCH (Spotlight 2.0)
 * 
 * Zoekt in alle relevante database tabellen voor de admin cockpit.
 */

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const searchPattern = `%${query}%`;

  try {
    // 1. Zoek Acteurs
    const foundActors = await db.select({
      id: actors.id,
      firstName: actors.firstName,
      lastName: actors.lastName,
      slug: actors.slug,
      status: actors.status
    })
    .from(actors)
    .where(or(
      ilike(actors.firstName, searchPattern),
      ilike(actors.lastName, searchPattern),
      ilike(actors.slug, searchPattern)
    ))
    .limit(5);

    // 2. Zoek Orders
    const foundOrders = await db.select({
      id: orders.id,
      wpOrderId: orders.wpOrderId,
      displayOrderId: orders.displayOrderId,
      status: orders.status,
      journey: orders.journey
    })
    .from(orders)
    .where(or(
      sql`CAST(${orders.wpOrderId} AS TEXT) ILIKE ${searchPattern}`,
      ilike(orders.displayOrderId, searchPattern)
    ))
    .limit(5);

    // 3. Zoek Gebruikers / Klanten
    const foundUsers = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      companyName: users.companyName
    })
    .from(users)
    .where(or(
      ilike(users.firstName, searchPattern),
      ilike(users.lastName, searchPattern),
      ilike(users.email, searchPattern),
      ilike(users.companyName, searchPattern)
    ))
    .limit(5);

    // 4. Zoek Artikelen
    const foundArticles = await db.select({
      id: contentArticles.id,
      title: contentArticles.title,
      slug: contentArticles.slug,
      status: contentArticles.status
    })
    .from(contentArticles)
    .where(or(
      ilike(contentArticles.title, searchPattern),
      ilike(contentArticles.slug, searchPattern)
    ))
    .limit(5);

    // Formatteer resultaten voor de UI
    const results = [
      ...foundActors.map(a => ({
        type: 'actor',
        title: `${a.firstName} ${a.lastName || ''}`,
        subtitle: `Stemacteur • ${a.status}`,
        href: `/admin/voices?id=${a.id}`,
        id: a.id
      })),
      ...foundOrders.map(o => ({
        type: 'order',
        title: `Order #${o.displayOrderId || o.wpOrderId}`,
        subtitle: `Transactie • ${o.journey} • ${o.status}`,
        href: `/admin/orders?id=${o.id}`,
        id: o.id
      })),
      ...foundUsers.map(u => ({
        type: 'user',
        title: u.companyName || `${u.firstName} ${u.lastName || ''}`,
        subtitle: `Klant • ${u.email}`,
        href: `/admin/users?id=${u.id}`,
        id: u.id
      })),
      ...foundArticles.map(art => ({
        type: 'article',
        title: art.title,
        subtitle: `Content • ${art.status}`,
        href: `/admin/articles?slug=${art.slug}`,
        id: art.id
      }))
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('[Admin Search GET Error]:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
