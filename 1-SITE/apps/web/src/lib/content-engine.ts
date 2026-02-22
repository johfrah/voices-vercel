import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { format, parse } from "date-fns";
import { nl, fr, de, enUS } from "date-fns/locale";
import { db } from "@db";
import { contentArticles, translationRegistry } from "@db/schema";
import { eq, sql } from "drizzle-orm";
import { VoiceglotBridge } from "./voiceglot-bridge";
import md5 from "md5";

import { MarketManagerServer as MarketManager } from "@/lib/system/market-manager-server";

/**
 *  NUCLEAR CONTENT ENGINE (2026)
 * 
 * De motor die de "Gouden Bron" (Database-First) verbindt met de Next.js Experience Layer.
 * Ondersteunt Fragments, 84-Matrix Mapping, en Smart Placeholders.
 */

export interface ContentSection {
  id: string;
  title: string;
  content: string;
  tool?: string;
  noTranslate?: boolean;
}

export interface PageContent {
  title: string;
  slug: string;
  description?: string;
  journey?: string;
  fase?: string;
  sections: ContentSection[];
  metadata: Record<string, any>;
  noTranslate?: boolean;
}

export interface ScriptSet {
  id: string;
  title: string;
  category: string;
  journey: string;
  fase: string;
  founder_tip?: string;
  translations: {
    lang: string;
    body: string;
  }[];
}

export interface ScriptContent {
  title: string;
  category: string;
  lang: string;
  journey: string;
  fase: string;
  persona: string;
  intent: string;
  founder_tip?: string;
  keywords?: string[];
  noTranslate?: boolean;
  body: string;
}

export interface PersonalizationContext {
  company_name?: string;
  opening_hours?: string; // Format: "HH:mm-HH:mm"
  date?: string; // Format: "YYYY-MM-DD"
  [key: string]: any;
}

export class ContentEngine {
  private static PAGES_PATH = path.join(process.cwd(), "src/content/pages");
  private static STORIES_PATH = path.join(process.cwd(), "src/content/stories");
  private static FRAGMENTS_PATH = path.join(process.cwd(), "src/content/fragments");
  private static SCRIPTS_PATH = path.join(process.cwd(), "src/content/library/scripts");
  private static BLUEPRINTS_PATH = path.join(process.cwd(), "src/content/library/blueprints");

  /**
   * Haalt alle blueprints op voor een specifieke journey.
   */
  static async getBlueprints(journey: string): Promise<any[]> {
    const basePath = path.join(this.BLUEPRINTS_PATH, journey);
    if (!fs.existsSync(basePath)) return [];

    const files = fs.readdirSync(basePath);
    return files.map(file => {
      const content = fs.readFileSync(path.join(basePath, file), "utf-8");
      const { data, content: body } = matter(content);
      return { ...data, body };
    });
  }

  /**
   * Haalt een pagina of story op en injecteert fragments en placeholders.
   *  GOD MODE: Kijkt eerst in de database, valt terug op Markdown.
   *  VOICEGLOT: Vertaalt alle content on-the-fly via de database.
   */
  static async getPage(slug: string, locale: string = "nl", type: "pages" | "stories" = "pages"): Promise<PageContent | null> {
    let rawPage: PageContent | null = null;

    // 1.  DATABASE-FIRST (GOD MODE)
    try {
      const [dbArticle] = await db.select()
        .from(contentArticles)
        .where(eq(contentArticles.slug, slug))
        .limit(1);

      if (dbArticle) {
        console.log(` CONTENT ENGINE: Loaded [${slug}] from Database`);
        const iapContext = (dbArticle.iapContext as any) || {};
        const seoData = (dbArticle.seoData as any) || {};

        // Injecteer Fragments en Localize
        let processedContent = this.injectFragments(dbArticle.content || "");
        processedContent = this.localizeDomain(processedContent, locale);

        const sections = this.parseSections(processedContent, dbArticle.isManuallyEdited || false);

        rawPage = {
          title: this.localizeDomain(dbArticle.title, locale),
          slug: dbArticle.slug,
          description: this.localizeDomain(dbArticle.excerpt || seoData.description || "", locale),
          journey: iapContext.journey,
          fase: iapContext.fase,
          sections,
          metadata: iapContext,
          noTranslate: dbArticle.isManuallyEdited || false
        };
      }
    } catch (dbError) {
      console.error(' CONTENT ENGINE: Database fetch failed, falling back to FS:', dbError);
    }

    // 2.  FALLBACK TO MARKDOWN (LEGACY/BACKUP)
    if (!rawPage) {
      const basePath = type === "stories" ? this.STORIES_PATH : this.PAGES_PATH;
      const filePath = path.join(basePath, `${slug}.md`);
      if (!fs.existsSync(filePath)) return null;

      console.log(` CONTENT ENGINE: Falling back to Markdown for [${slug}]`);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      // 1. Injecteer Fragments: {{fragment:name}}
      let processedContent = this.injectFragments(content);

      // 2. Dynamische Domein Vervanging (Market Intelligence)
      processedContent = this.localizeDomain(processedContent, locale);

      // 3. Parse Secties (gebaseerd op ## koppen)
      const sections = this.parseSections(processedContent, data.no_translate);

      rawPage = {
        title: this.localizeDomain(data.title, locale),
        slug: data.slug,
        description: this.localizeDomain(data.description || "", locale),
        journey: data.journey,
        fase: data.fase,
        sections,
        metadata: data,
        noTranslate: data.no_translate
      };
    }

    // 3.  VOICEGLOT TRANSLATION LAYER
    if (locale !== 'nl' && !rawPage.noTranslate) {
      console.log(` CONTENT ENGINE: Translating [${slug}] to [${locale}] via Voiceglot...`);
      
      // Vertaal Titel en Beschrijving
      const originalTitle = rawPage.title;
      rawPage.title = await VoiceglotBridge.t(rawPage.title, locale);
      
      if (rawPage.description) {
        const originalDesc = rawPage.description;
        rawPage.description = await VoiceglotBridge.t(rawPage.description, locale);
      }

      // Vertaal Secties
      for (const section of rawPage.sections) {
        if (!section.noTranslate) {
          const originalSecTitle = section.title;
          const originalSecContent = section.content;
          
          section.title = await VoiceglotBridge.t(section.title, locale);
          section.content = await VoiceglotBridge.t(section.content, locale);

          //  REGISTER FOR ADMIN (If translation is missing)
          if (section.title === originalSecTitle || section.content === originalSecContent) {
            this.registerMissingTranslation(originalSecTitle, slug);
            this.registerMissingTranslation(originalSecContent, slug);
          }
        }
      }
    }

    return rawPage;
  }

  /**
   * Registreert een ontbrekende vertaling in de registry voor de admin.
   */
  private static async registerMissingTranslation(text: string, slug: string) {
    if (!text || text.length < 2) return;
    
    try {
      const hash = md5(text);
      await db.insert(translationRegistry).values({
        stringHash: hash,
        originalText: text,
        context: `Page: ${slug}`,
        lastSeen: new Date()
      }).onConflictDoUpdate({
        target: [translationRegistry.stringHash],
        set: { lastSeen: new Date() }
      });
    } catch (e) {
      // Silent fail, registry is non-critical
    }
  }

  /**
   * Vertaalt voices.be naar het actuele domein op basis van de markt.
   */
  private static localizeDomain(text: string, locale: string): string {
    const market = MarketManager.getCurrentMarket();
    // NUCLEAR: Use dynamic host from MarketManager lookup
    const host = Object.keys(MarketManager.MARKETS_STATIC).find(h => MarketManager.MARKETS_STATIC[h].market_code === market.market_code) || 'voices.be';

    const defaultHost = process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'voices.be';
    if (host !== defaultHost) {
      return text.replace(/voices\.be/gi, host);
    }
    
    return text;
  }

  /**
   * Vervangt {{fragment:name}} door de inhoud van src/content/fragments/name.md
   */
  private static injectFragments(content: string): string {
    return content.replace(/\{\{fragment:(.+?)\}\}/g, (match, fragmentName) => {
      const fragmentPath = path.join(this.FRAGMENTS_PATH, `${fragmentName.trim()}.md`);
      if (fs.existsSync(fragmentPath)) {
        return fs.readFileSync(fragmentPath, "utf-8");
      }
      return `<!-- Fragment ${fragmentName} niet gevonden -->`;
    });
  }

  /**
   * Deelt de tekst op in secties op basis van ## Markdown koppen.
   */
  private static parseSections(content: string, globalNoTranslate: boolean = false): ContentSection[] {
    const sections: ContentSection[] = [];
    const parts = content.split(/^##\s+/m).filter(Boolean);

    for (const part of parts) {
      const lines = part.split("\n");
      const title = lines[0].trim();
      const body = lines.slice(1).join("\n").trim();
      
      // Check voor tool-triggers: {{tool:name, ...}}
      const toolMatch = body.match(/\{\{tool:(.+?)\}\}/);
      
      // Check voor section-level no-translate
      const sectionNoTranslate = body.includes("{{no-translate}}") || globalNoTranslate;
      
      sections.push({
        id: title.toLowerCase().replace(/\s+/g, "-"),
        title,
        content: body.replace(/\{\{tool:(.+?)\}\}/, "").replace("{{no-translate}}", "").trim(),
        tool: toolMatch ? toolMatch[1] : undefined,
        noTranslate: sectionNoTranslate
      });
    }

    return sections;
  }

  /**
   * Haalt alle scripts op voor een specifiek kruispunt in de 84-matrix.
   * Prioriteert de huidige locale, maar toont ook andere talen als referentie.
   */
  static async getScriptsByMatrix(journey: string, fase: string, locale: string = "nl"): Promise<ScriptContent[]> {
    const scriptsPath = path.join(process.cwd(), `src/content/library/scripts/${journey}`);
    if (!fs.existsSync(scriptsPath)) return [];

    const files = fs.readdirSync(scriptsPath);
    const scripts = files.map(file => {
      const content = fs.readFileSync(path.join(scriptsPath, file), "utf-8");
      const { data, content: body } = matter(content);
      return {
        title: data.title || "",
        category: data.category || "",
        lang: data.lang || "nl",
        journey: data.journey || "",
        fase: data.fase || "",
        persona: data.persona || "",
        intent: data.intent || "",
        founder_tip: data.founder_tip,
        keywords: data.keywords,
        body: body.trim(),
        noTranslate: true
      } as ScriptContent;
    }).filter((script: ScriptContent) => script.fase === fase);

    // Sorteer: huidige locale eerst
    return scripts.sort((a: ScriptContent, b: ScriptContent) => {
      if (a.lang === locale && b.lang !== locale) return -1;
      if (a.lang !== locale && b.lang === locale) return 1;
      return 0;
    });
  }

  /**
   * Personaliseert een script-tekst op basis van de taal en user context.
   * Dit is de "Slimme" laag die 09:30 omzet naar 9:30 AM in het Engels etc.
   */
  static personalize(text: string, lang: string, context: PersonalizationContext): string {
    let result = text;

    // 1. Bedrijfsnaam
    if (context.company_name) {
      result = result.replace(/\{\{company_name\}\}/g, context.company_name);
    }

    // 2. Openingsuren (Smart Formatting)
    if (context.opening_hours && result.includes("{{opening_hours}}")) {
      const formattedHours = this.formatOpeningHours(context.opening_hours, lang);
      result = result.replace(/\{\{opening_hours\}\}/g, formattedHours);
    }

    // 3. Datum (Smart Formatting)
    if (context.date && result.includes("{{date}}")) {
      const formattedDate = this.formatSmartDate(context.date, lang);
      result = result.replace(/\{\{date\}\}/g, formattedDate);
    }

    return result;
  }

  private static formatOpeningHours(raw: string, lang: string): string {
    // Normalize input: replace 'u' with ':' and remove spaces around '-'
    const normalized = raw.replace(/u/gi, ":").replace(/\s*-\s*/g, "-");
    const parts = normalized.split("-");
    if (parts.length !== 2) return raw;

    const locales: Record<string, any> = { nl, fr, de, en: enUS };
    
    try {
      // Handle cases like "9:30" or "09:30"
      const parseTime = (t: string) => {
        if (!t.includes(":")) t = t + ":00";
        return parse(t.padStart(5, "0"), "HH:mm", new Date());
      };

      const start = parseTime(parts[0]);
      const end = parseTime(parts[1]);

      if (lang === "en") {
        return `${format(start, "h:mm a")} to ${format(end, "h:mm a")}`;
      }
      if (lang === "fr") {
        return `${format(start, "HH'h'mm")}  ${format(end, "HH'h'mm")}`;
      }
      // Default / NL / DE
      const separator = lang === "de" ? " bis " : " tot ";
      return `${format(start, "HH:mm")}${separator}${format(end, "HH:mm")}`;
    } catch (e) {
      return raw;
    }
  }

  private static formatSmartDate(raw: string, lang: string): string {
    const locales: Record<string, any> = { nl, fr, de, en: enUS };
    const currentLocale = locales[lang] || nl;

    try {
      const date = new Date(raw);
      if (lang === "en") return format(date, "MMMM do", { locale: enUS });
      return format(date, "d MMMM", { locale: currentLocale });
    } catch (e) {
      return raw;
    }
  }
}
