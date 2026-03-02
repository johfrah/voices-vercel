import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 *  CLEAN TEXT (VOICES 2026)
 * Verwijdert HTML tags, \r\n, en andere rommel uit database teksten.
 */
export function cleanText(text: string | null | undefined): string {
  if (!text) return "";
  
  return text
    .replace(/<br\s*\/?>/gi, '\n') // Vervang <br> door echte newlines
    .replace(/<\/p>/gi, '\n\n')    // Vervang </p> door dubbele newlines
    .replace(/<[^>]*>/g, '')       // Verwijder overige HTML tags
    .replace(/\\r\\n/g, '\n')      // Verwijder escape characters en maak newlines
    .replace(/\r?\n|\r/g, '\n')    // Normaliseer newlines
    .replace(/[ \t]+/g, ' ')       // Normaliseer spaties (behalve newlines)
    .trim();
}
