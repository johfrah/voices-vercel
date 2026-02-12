import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * 📰 API: ARTICLES (NUCLEAR 2026)
 * 
 * Doel: Haalt alle artikelen (Stories & Blueprints) op voor de blog/overzichtspagina.
 */
export async function GET(request: NextRequest) {
  try {
    const storiesPath = path.join(process.cwd(), 'src/content/stories');
    const blueprintsPath = path.join(process.cwd(), 'src/content/library/blueprints');
    
    const articles: any[] = [];

    // 1. Haal Stories op
    if (fs.existsSync(storiesPath)) {
      const storyFiles = fs.readdirSync(storiesPath).filter(f => f.endsWith('.md'));
      storyFiles.forEach(file => {
        const content = fs.readFileSync(path.join(storiesPath, file), 'utf-8');
        const { data } = matter(content);
        articles.push({
          id: `story-${file}`,
          slug: file.replace('.md', ''),
          title: data.title || file.replace('.md', ''),
          excerpt: data.description || '',
          category: 'Case Study',
          createdAt: data.date || new Date().toISOString(),
          type: 'story'
        });
      });
    }

    // 2. Haal Blueprints op
    if (fs.existsSync(blueprintsPath)) {
      const journeys = fs.readdirSync(blueprintsPath);
      journeys.forEach(journey => {
        const journeyPath = path.join(blueprintsPath, journey);
        if (fs.statSync(journeyPath).isDirectory()) {
          const blueprintFiles = fs.readdirSync(journeyPath).filter(f => f.endsWith('.md'));
          blueprintFiles.forEach(file => {
            const content = fs.readFileSync(path.join(journeyPath, file), 'utf-8');
            const { data } = matter(content);
            articles.push({
              id: `blueprint-${file}`,
              slug: file.replace('.md', ''),
              title: data.title || file.replace('.md', ''),
              excerpt: data.description || '',
              category: journey.charAt(0).toUpperCase() + journey.slice(1),
              createdAt: data.date || new Date().toISOString(),
              type: 'blueprint'
            });
          });
        }
      });
    }

    // Sorteer op datum (nieuwste eerst)
    articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ results: articles });
  } catch (error) {
    console.error('[API Articles Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
