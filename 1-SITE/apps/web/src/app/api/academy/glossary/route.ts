import { NextResponse } from 'next/server';
import { db } from '@db';
import { lessons } from '@db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.displayOrder, 17)).limit(1);
    if (!lesson) return NextResponse.json([]);

    const terms: { term: string; definition: string }[] = [];
    const sections = lesson.content.split('### **');
    
    sections.slice(1).forEach(section => {
      const parts = section.split('**\n');
      if (parts.length >= 2) {
        const term = parts[0].trim();
        const definition = parts[1].split('---')[0].split('###')[0].trim();
        if (term && definition) {
          terms.push({ term, definition });
        }
      }
    });

    return NextResponse.json(terms);
  } catch (error) {
    console.error('Glossary API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch glossary' }, { status: 500 });
  }
}
