import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type NextStaticRoute = { page: string };
type NextDynamicRoute = { page: string };
type NextRoutesManifest = {
  staticRoutes?: NextStaticRoute[];
  dynamicRoutes?: NextDynamicRoute[];
};

type RouteInventory = {
  source_files: string[];
  critical_routes: string[];
  extended_routes: string[];
  dynamic_templates: string[];
  generated_dynamic_routes: string[];
  totals: {
    critical: number;
    extended: number;
    dynamic_templates: number;
  };
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appDir = path.resolve(repoRoot, 'apps/web');
const nextDir = path.resolve(appDir, '.next');
const routesManifestPath = path.resolve(nextDir, 'routes-manifest.json');
const appPathRoutesManifestPath = path.resolve(nextDir, 'app-path-routes-manifest.json');
const appPathsManifestPath = path.resolve(nextDir, 'server/app-paths-manifest.json');
const outputPath = path.resolve(appDir, 'tests/e2e/route-inventory.json');

const CRITICAL_ROUTES = [
  '/',
  '/agency/video',
  '/agency/commercial',
  '/checkout/configurator',
  '/cart',
  '/checkout',
  '/studio',
  '/studio/contact',
];

const DYNAMIC_ROUTE_SEEDS: Record<string, string[]> = {
  '/studio/[slug]': ['/studio/workshop-beginners'],
  '/[...slug]': [
    '/agency/video',
    '/agency/commercial',
    '/agency/contact',
    '/studio/contact',
    '/academy/contact',
    '/freelance/contact',
    '/partners/contact',
    '/johfrai/contact',
    '/ademing/contact',
    '/artist/youssef',
  ],
};

function normalizeRoute(route: string): string {
  if (!route) return '/';
  const trimmed = route.trim();
  if (!trimmed || trimmed === '/') return '/';
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function isPublicPageCandidate(route: string): boolean {
  const normalized = normalizeRoute(route);
  if (!normalized.startsWith('/')) return false;
  if (normalized.startsWith('/api')) return false;
  if (normalized.startsWith('/_')) return false;
  if (normalized.startsWith('/admin')) return false;
  if (normalized.startsWith('/backoffice')) return false;
  if (normalized.startsWith('/account')) return false;
  if (normalized === '/admin-login') return false;
  if (normalized === '/manifest.webmanifest' || normalized === '/sitemap.xml') return false;
  if (normalized.includes('[') || normalized.includes(']')) return false;
  return true;
}

function createDynamicPlaceholder(template: string): string {
  if (template === '/[...slug]') return '/agency/video';
  const normalized = normalizeRoute(template);
  return normalized
    .replace(/\[\.\.\.[^\]]+\]/g, 'sample/path')
    .replace(/\[[^\]]+\]/g, 'sample');
}

function uniqSorted(input: string[]): string[] {
  return Array.from(new Set(input.map(normalizeRoute))).sort((a, b) => a.localeCompare(b));
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

async function readJsonFileIfExists<T>(filePath: string): Promise<T | null> {
  try {
    return await readJsonFile<T>(filePath);
  } catch {
    return null;
  }
}

function normalizeAppPathManifestKey(route: string): string {
  if (!route || route === '/page') return '/';
  if (route.endsWith('/page')) {
    const withoutSuffix = route.slice(0, -'/page'.length);
    return withoutSuffix || '/';
  }
  if (route.endsWith('/route')) {
    const withoutSuffix = route.slice(0, -'/route'.length);
    return withoutSuffix || '/';
  }
  return route;
}

async function main() {
  const [routesManifest, appPathRoutesManifest, appPathsManifest] = await Promise.all([
    readJsonFileIfExists<NextRoutesManifest>(routesManifestPath),
    readJsonFileIfExists<Record<string, string>>(appPathRoutesManifestPath),
    readJsonFileIfExists<Record<string, string>>(appPathsManifestPath),
  ]);

  if (!routesManifest && !appPathRoutesManifest && !appPathsManifest) {
    throw new Error(
      `Route inventory requires Next build manifests. Run npm run check:pre-vercel first. Missing: ${routesManifestPath}, ${appPathRoutesManifestPath}, ${appPathsManifestPath}`
    );
  }

  const appManifestKeys = [
    ...Object.keys(appPathRoutesManifest || {}),
    ...Object.keys(appPathsManifest || {}),
  ].map(normalizeAppPathManifestKey);

  const staticFromRoutesManifest = (routesManifest?.staticRoutes || []).map((route) => route.page);
  const staticFromAppManifest = appManifestKeys;
  const publicStaticRoutes = uniqSorted(
    [...staticFromRoutesManifest, ...staticFromAppManifest].filter(isPublicPageCandidate)
  );

  const dynamicTemplates = uniqSorted(
    [
      ...(routesManifest?.dynamicRoutes || []).map((route) => route.page),
      ...appManifestKeys.filter((route) => route.includes('[') || route.includes(']')),
    ]
      .filter((route) => !route.startsWith('/api') && !route.startsWith('/admin'))
  );

  const generatedDynamicRoutes = uniqSorted(
    dynamicTemplates.flatMap((template) => {
      const seededRoutes = DYNAMIC_ROUTE_SEEDS[template];
      if (Array.isArray(seededRoutes) && seededRoutes.length > 0) return seededRoutes;
      return [createDynamicPlaceholder(template)];
    })
  );

  const criticalRoutes = uniqSorted([...CRITICAL_ROUTES, ...generatedDynamicRoutes]);
  const extendedRoutes = uniqSorted([...publicStaticRoutes, ...generatedDynamicRoutes, ...criticalRoutes]);

  const inventory: RouteInventory = {
    source_files: [
      routesManifest ? routesManifestPath : `${routesManifestPath} (missing)`,
      appPathRoutesManifest ? appPathRoutesManifestPath : `${appPathRoutesManifestPath} (missing)`,
      appPathsManifest ? appPathsManifestPath : `${appPathsManifestPath} (missing)`,
    ],
    critical_routes: criticalRoutes,
    extended_routes: extendedRoutes,
    dynamic_templates: dynamicTemplates,
    generated_dynamic_routes: generatedDynamicRoutes,
    totals: {
      critical: criticalRoutes.length,
      extended: extendedRoutes.length,
      dynamic_templates: dynamicTemplates.length,
    },
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');

  process.stdout.write(
    `[route-inventory] Generated ${criticalRoutes.length} critical and ${extendedRoutes.length} extended routes at ${outputPath}\n`
  );
}

main().catch((error) => {
  process.stderr.write(`[route-inventory] Failed: ${(error as Error)?.message || String(error)}\n`);
  process.exit(1);
});
