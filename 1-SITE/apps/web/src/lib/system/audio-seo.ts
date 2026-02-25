import { db } from '@/lib/system/db';
import { actorDemos, actors } from '@/lib/system/db';
import { eq } from "drizzle-orm";

/**
 *  NUCLEAR AUDIO SEO SERVICE (2026)
 * 
 * Genereert voorspelbare URL's en JSON-LD metadata voor audio demo's.
 * Vervangt de PHP Audio Demo Structure SEO.
 */

export interface AudioMetadata {
  slug: string;
  language: string;
  type: string;
  label?: string;
  number: number;
}

export class AudioSeo {
  /**
   * Genereert een voorspelbare, SEO-vriendelijke URL voor een demo.
   */
  static getPredictableUrl(actorSlug: string, type: string, filename: string): string {
    return `/media/voices/${actorSlug}/${type}/${filename}`;
  }

  /**
   * Genereert JSON-LD voor een audio-object (AI Readability).
   */
  static generateAudioSchema(actorName: string, demoTitle: string, audioUrl: string) {
    return {
      "@context": "https://schema.org",
      "@type": "AudioObject",
      "name": `${demoTitle} - ${actorName}`,
      "contentUrl": audioUrl,
      "encodingFormat": "audio/mpeg",
      "author": {
        "@type": "Person",
        "name": actorName
      },
      "description": `Professionele stem-demo van ${actorName} in de categorie ${demoTitle}.`
    };
  }

  /**
   * Parseert een bestandsnaam naar metadata (bijv. johfrah_nl-BE_commercial_retail_01.mp3)
   */
  static parseFilename(filename: string): AudioMetadata | null {
    const basename = filename.replace('.mp3', '');
    const parts = basename.split('_');

    if (parts.length < 2) return null;

    return {
      slug: parts[0],
      language: parts[1].includes('-') ? parts[1] : '',
      type: parts[2] || parts[1],
      label: parts.length > 4 ? parts[3] : undefined,
      number: parseInt(parts[parts.length - 1]) || 1
    };
  }
}
