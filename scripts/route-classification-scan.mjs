import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: "apps/web/.env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials in apps/web/.env.local");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const editorialTypes = new Set([
  "story-layout",
  "lifestyle-overlay",
  "founder",
  "carousel",
  "thematic",
]);

const actionTypes = new Set([
  "hero",
  "pricing",
  "cta",
  "how_it_works",
  "faq",
  "calculator",
  "journey_cta",
  "workshop_hero",
  "workshop_carousel",
  "workshop_calendar",
  "academy_pricing",
  "academy_faq",
  "lesson_grid",
  "track_grid",
  "interest_form",
]);

const blogSlugRegex = /^(blog|nieuws|news|insights)\//i;
const numberedPostRegex = /^\d+-/;
const themeBlogRegex = /(stories|story|inspiratie|blog|news)/i;

const classifyArticleRoute = ({ slug, routingType, article, blockTypes }) => {
  const reasons = [];
  let scoreBlog = 0;
  let scoreAction = 0;

  if (routingType === "blog") {
    scoreBlog += 10;
    reasons.push("routing_type=blog");
  }

  if (blogSlugRegex.test(slug)) {
    scoreBlog += 5;
    reasons.push("slug prefix blog/news");
  }

  if (numberedPostRegex.test(slug)) {
    scoreBlog += 4;
    reasons.push("slug starts with numbered-post pattern");
  }

  const theme = String(article?.iap_context?.theme || article?.iapContext?.theme || "");
  if (themeBlogRegex.test(theme)) {
    scoreBlog += 4;
    reasons.push("iap_context.theme indicates story/blog");
  }

  const normalizedTypes = blockTypes.map((type) => String(type || "").toLowerCase());
  const hasEditorialBlock = normalizedTypes.some((type) => editorialTypes.has(type));
  const hasActionBlock = normalizedTypes.some((type) => actionTypes.has(type));

  if (hasEditorialBlock) {
    scoreBlog += 3;
    reasons.push("editorial block types present");
  }

  if (hasActionBlock) {
    scoreAction += 6;
    reasons.push("action block types present");
  }

  if (!hasEditorialBlock && !hasActionBlock && routingType === "article") {
    scoreAction += 2;
    reasons.push("policy default: non-blog article => action page");
  }

  const classification = scoreBlog > scoreAction ? "blog_article" : "action_page";
  const confidence = Math.min(99, Math.max(55, 50 + Math.abs(scoreBlog - scoreAction) * 10));

  return {
    classification,
    confidence,
    reasons,
    scoreBlog,
    scoreAction,
  };
};

const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const readArticles = async (ids) => {
  const map = new Map();
  for (const idChunk of chunk(ids, 200)) {
    const { data, error } = await supabase
      .from("content_articles")
      .select("id,slug,title,iap_context")
      .in("id", idChunk);
    if (error) {
      throw error;
    }
    for (const row of data || []) {
      map.set(Number(row.id), row);
    }
  }
  return map;
};

const readBlocks = async (articleIds) => {
  const map = new Map();
  for (const idChunk of chunk(articleIds, 200)) {
    const { data, error } = await supabase
      .from("content_blocks")
      .select("article_id,type,display_order,settings")
      .in("article_id", idChunk);
    if (error) {
      throw error;
    }
    for (const row of data || []) {
      const id = Number(row.article_id);
      if (!map.has(id)) {
        map.set(id, []);
      }
      map.get(id).push(row);
    }
  }
  return map;
};

const formatDate = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

const run = async () => {
  const { data: slugRows, error: slugError } = await supabase
    .from("slug_registry")
    .select("slug,routing_type,entity_id,journey,entity_type_id,world_id,market_code,is_active")
    .eq("is_active", true);

  if (slugError) {
    throw slugError;
  }

  const rows = slugRows || [];
  const articleRoutes = rows.filter((row) => {
    const routingType = String(row.routing_type || "").toLowerCase();
    return routingType === "article" || routingType === "blog" || Number(row.entity_type_id) === 3;
  });

  const articleIds = [...new Set(articleRoutes.map((row) => Number(row.entity_id)).filter((id) => Number.isFinite(id) && id > 0))];
  const articleMap = await readArticles(articleIds);
  const blockMap = await readBlocks(articleIds);

  const classifiedRoutes = rows.map((row) => {
    const routingType = String(row.routing_type || "").toLowerCase();
    if (routingType === "article" || routingType === "blog" || Number(row.entity_type_id) === 3) {
      const article = articleMap.get(Number(row.entity_id));
      const blocks = blockMap.get(Number(row.entity_id)) || [];
      const blockTypes = [...new Set(blocks.map((block) => block.type))];
      const decision = classifyArticleRoute({
        slug: String(row.slug || ""),
        routingType: routingType || "article",
        article,
        blockTypes,
      });

      return {
        slug: row.slug,
        routing_type: row.routing_type || "article",
        entity_id: row.entity_id,
        market_code: row.market_code,
        journey: row.journey,
        classification: decision.classification,
        confidence: decision.confidence,
        reasons: decision.reasons,
        title: article?.title || null,
        block_types: blockTypes,
      };
    }

    return {
      slug: row.slug,
      routing_type: row.routing_type || "unknown",
      entity_id: row.entity_id,
      market_code: row.market_code,
      journey: row.journey,
      classification: "action_page",
      confidence: 98,
      reasons: [`routing_type=${row.routing_type || "unknown"} => hard route`],
      title: null,
      block_types: [],
    };
  });

  const totals = classifiedRoutes.reduce(
    (acc, row) => {
      acc.total += 1;
      acc[row.classification] = (acc[row.classification] || 0) + 1;
      const routingType = String(row.routing_type || "unknown").toLowerCase();
      acc.by_routing_type[routingType] = (acc.by_routing_type[routingType] || 0) + 1;
      return acc;
    },
    { total: 0, action_page: 0, blog_article: 0, by_routing_type: {} },
  );

  const blogCandidates = classifiedRoutes
    .filter((row) => row.classification === "blog_article")
    .sort((a, b) => b.confidence - a.confidence);

  const actionFromArticles = classifiedRoutes
    .filter((row) => String(row.routing_type).toLowerCase() === "article" && row.classification === "action_page")
    .sort((a, b) => b.confidence - a.confidence);

  const date = formatDate();
  const reportPath = `/workspace/docs/reports/route-classification-scan-${date}.md`;
  const jsonPath = `/opt/cursor/artifacts/route-classification-scan-${date}.json`;

  const markdown = [
    `# Route classification scan (${date})`,
    "",
    "## Summary",
    `- Total active routes: ${totals.total}`,
    `- Classified as action_page: ${totals.action_page}`,
    `- Classified as blog_article: ${totals.blog_article}`,
    `- Article routes in registry: ${articleRoutes.length}`,
    `- Unique content_articles IDs referenced: ${articleIds.length}`,
    "",
    "## Routing type distribution",
    ...Object.entries(totals.by_routing_type)
      .sort((a, b) => b[1] - a[1])
      .map(([routingType, count]) => `- ${routingType}: ${count}`),
    "",
    "## Top blog candidates (max 50)",
    ...blogCandidates.slice(0, 50).map((row) => {
      const reasons = row.reasons.join("; ");
      return `- ${row.slug} | rt=${row.routing_type} | conf=${row.confidence} | ${reasons}`;
    }),
    "",
    "## Top article routes that should be action pages (max 120)",
    ...actionFromArticles.slice(0, 120).map((row) => {
      const reasons = row.reasons.join("; ");
      return `- ${row.slug} | conf=${row.confidence} | ${reasons}`;
    }),
    "",
    "## Notes",
    "- Policy used in this scan: non-blog article routes default to action_page.",
    "- Blog classification uses routing_type=blog first, then slug/theme/block heuristics.",
    "",
  ].join("\n");

  await fs.writeFile(reportPath, markdown, "utf8");
  await fs.writeFile(jsonPath, JSON.stringify({ generated_at: new Date().toISOString(), totals, classifiedRoutes }, null, 2), "utf8");

  console.log(`Report: ${reportPath}`);
  console.log(`Artifact JSON: ${jsonPath}`);
  console.log(`Totals: ${JSON.stringify(totals)}`);
  console.log(`Top blog candidates: ${blogCandidates.length}`);
  console.log(`Article->action routes: ${actionFromArticles.length}`);
};

run().catch((error) => {
  console.error("route-classification-scan failed:", error);
  process.exitCode = 1;
});
