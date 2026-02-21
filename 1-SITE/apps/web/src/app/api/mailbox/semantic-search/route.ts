import { db } from '@db';
import { VectorService } from '@/services/VectorService';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 *  SEMANTIC SEARCH API (2026)
 * 
 * Doel: Zoekt mails op basis van betekenis ipv trefwoorden.
 * Gebruikt pgvector cosine similarity.
 */
export async function POST(request: Request) {
  try {
    const { query, limit = 10 } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    const vectorService = VectorService.getInstance();
    const queryVector = await vectorService.generateEmbedding(query);

    if (queryVector.length === 0) {
      return NextResponse.json({ error: 'Could not generate vector' }, { status: 500 });
    }

    //  PGVECTOR COSINE SIMILARITY SEARCH
    // We gebruiken de <=> operator voor cosine distance (kleiner is beter)
    const formattedVector = `[${queryVector.join(',')}]`;
    
    const results = await db.execute(sql`
      SELECT id, sender, subject, date, text_body as "textBody", iap_context as "iapContext",
             1 - (embedding <=> ${formattedVector}::vector) as similarity
      FROM mail_content
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${formattedVector}::vector
      LIMIT ${limit}
    `);

    return NextResponse.json(results);
  } catch (error) {
    console.error(' Semantic Search API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
