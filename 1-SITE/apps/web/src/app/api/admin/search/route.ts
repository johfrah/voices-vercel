import { db, actors, orders, users, contentArticles } from '@/lib/system/voices-config';
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
      first_name: actors.first_name,
      last_name: actors.last_name,
      slug: actors.slug,
      status: actors.status
    })
    .from(actors)
    .where(or(
      ilike(actors.first_name, searchPattern),
      ilike(actors.last_name, searchPattern),
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
      first_name: users.first_name,
      last_name: users.last_name,
      email: users.email,
      companyName: users.companyName
    })
    .from(users)
    .where(or(
      ilike(users.first_name, searchPattern),
      ilike(users.last_name, searchPattern),
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
        title: `${a.first_name} ${a.last_name || ''}`,
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
        title: u.companyName || `${u.first_name} ${u.last_name || ''}`,
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
