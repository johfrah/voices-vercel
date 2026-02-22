import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * NUCLEAR MIDDLEWARE (GOD MODE 2026)
 * 
 * Doel: Volledige controle over routing, i18n, en journey detection.
 * Deze middleware is de 'Traffic Controller' van het Voices Ecosysteem.
 * 
 * @lock-file
 */

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname
  const userAgent = request.headers.get('user-agent') || ''

  // NUCLEAR BOT PROTECTION
  const aiBots = [
    'gptbot', 'chatgpt-user', 'google-extended', 'ccbot', 'anthropicai', 
    'claude-web', 'omgili', 'facebookbot', 'diffbot', 'bytespider', 
    'imagesiftbot', 'perplexitybot', 'youbot', 'claudebot', 'cohere-ai',
    'proximic', 'meta-externalagent', 'amazonbot', 'duckduckbot', 'mojeekbot'
  ]
  
  if (aiBots.some(bot => userAgent.toLowerCase().includes(bot))) {
    console.warn(` NUCLEAR BLOCK: AI Bot detected [${userAgent}] at ${pathname}`)
    return new NextResponse('AI Training and Scraping is strictly prohibited.', { status: 403 })
  }

  // 1. SECURITY & ASSET BYPASS
  // Laat statische assets en API's direct door (matcher doet dit ook, maar extra veiligheid)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|wav|mp3|mp4|css|js|woff2?)$/)
  ) {
    return NextResponse.next()
  }

  // HOTLINKING PROTECTION FOR ASSETS
  const referer = request.headers.get('referer')
  const isAsset = pathname.startsWith('/assets/agency/voices')
  const host = request.headers.get('host') || ''
  
  if (isAsset && referer && !referer.includes(host) && !referer.includes('localhost')) {
    console.warn(` HOTLINK BLOCK: Asset requested from external domain [${referer}]`)
    return new NextResponse('Unauthorized asset request.', { status: 403 })
  }

  let response: NextResponse
  try {
    response = await updateSession(request)
  } catch (err) {
    console.error(' Middleware updateSession failed:', err)
    response = NextResponse.next()
  }

  // 1.5 NUCLEAR SESSION CLEANUP (FORCE LOGOUT FROM OLD WP)
  // We dwingen een schone lei af voor de nieuwe Next.js omgeving.
  const hasNewSession = request.cookies.has('voices_session_v2')

  if (!hasNewSession) {
    // Verwijder alle oude WP cookies indien nog aanwezig
    request.cookies.getAll().forEach(c => {
      if (c.name.startsWith('wordpress_') || c.name.startsWith('wp-')) {
        response.cookies.delete(c.name)
      }
    })
    
    // Zet de nieuwe sessie-vlag zodat we dit niet bij elke request doen
    response.cookies.set('voices_session_v2', 'true', { 
      path: '/', 
      maxAge: 60 * 60 * 24 * 365, // 1 jaar
      sameSite: 'lax' 
    })
    
    console.log(' NUCLEAR CLEANUP: Legacy session flags cleared.')
  }

  // 1.7 UNDER CONSTRUCTION GATE (GOD MODE)
  // Als de site in 'under construction' modus staat, laten we alleen admins door.
  // We gebruiken een environment variable of een cookie voor de bypass.
  const forceUnderConstruction = process.env.NEXT_PUBLIC_UNDER_CONSTRUCTION === 'true';
  const isMainDomain = host.includes('voices.') || host.includes('ademing.be') || host.includes('johfrah.be') || host.includes('youssefzaki.eu');
  const isUnderConstruction = false; // Bob: De gate staat nu definitief open voor de lancering! 🚀🏗️

  // 1.8 LEGACY REDIRECTS (v2.24)
  // Vang oude URL-structuren op en stuur ze naar de nieuwe canonieke paden.
  const isLegacyAgencyPath = pathname.startsWith('/agency/video') || 
                             pathname.startsWith('/agency/telephony') || 
                             pathname.startsWith('/agency/commercial');
  
  const isOtherLegacyPath = pathname === '/agency/tarieven' || 
                            pathname === '/agency/tarieven/' ||
                            pathname === '/price' ||
                            pathname === '/price/';

  if (isOtherLegacyPath) {
    const tarievenUrl = url.clone();
    tarievenUrl.pathname = '/tarieven';
    // Behoud eventuele query params voor de calculator
    return NextResponse.redirect(tarievenUrl, 301);
  }

  if (isLegacyAgencyPath) {
    const tarievenUrl = url.clone();
    tarievenUrl.pathname = '/tarieven';
    // Behoud eventuele query params voor de calculator
    return NextResponse.redirect(tarievenUrl, 301);
  }

  // 1.9 AUTO-LOGIN BRIDGE (v2.29)
  // Ondersteunt de legacy auto_login link voor Johfrah.
  const autoLogin = url.searchParams.get('auto_login');
  if (autoLogin === 'b2dda905e581e6cea1daec513fe68bfebbefb1cfbc685f4ca8cade424fad0500') {
    console.log(' NUCLEAR LOGIN: Auto-login bridge triggered for Johfrah.');
    
    // We redirecten naar de nieuwe admin dashboard met de juiste cookies
    const adminUrl = url.clone();
    adminUrl.pathname = '/admin/dashboard';
    adminUrl.searchParams.delete('auto_login');
    
    const loginResponse = NextResponse.redirect(adminUrl);
    
    // Zet de admin cookies direct in de response
    loginResponse.cookies.set('voices_role', 'admin', { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' });
    // sb-access-token is nodig voor Supabase Auth helpers
    loginResponse.cookies.set('sb-access-token', 'true', { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' });
    
    return loginResponse;
  }
  
  // DOMAIN BYPASS: Specifieke domeinen en staging mogen ALTIJD door (Johfrah, Ademing, Youssef, Staging)
  const isBypassDomain = host.includes('staging.') ||
                         host.includes('johfrah.be') || 
                         host.includes('ademing.be') || 
                         host.includes('youssefzaki.eu') ||
                         host.includes('johfrai.be') ||
                         host.includes('localhost') || // LOCAL TEST BYPASS
                         url.searchParams.get('moby') === 'true' ||
                         url.searchParams.get('launch') === 'true' ||
                         url.searchParams.get('bob') === 'true'; // BOB BYPASS

  // LLM CONTEXT & INTENT FILTER (Project DNA-Filter)
  const intent = url.searchParams.get('intent') || 'explore'
  const persona = url.searchParams.get('persona') || 'visitor'
  
  // Injecteer context in headers voor server components
  response.headers.set('x-voices-intent', intent)
  response.headers.set('x-voices-persona', persona)

  const isAdmin = request.cookies.get('voices_role')?.value === 'admin' || request.cookies.get('sb-access-token') !== undefined
  const isAuthPath = pathname.startsWith('/auth')
  const isUnderConstructionPath = pathname === '/under-construction' || pathname === '/under-construction/'

  if (isUnderConstruction && !isAdmin && !isAuthPath && !isUnderConstructionPath && !isBypassDomain) {
    url.pathname = '/under-construction'
    // We gebruiken rewrite in plaats van redirect om de headers te behouden
    const response = NextResponse.rewrite(url)
    // Voeg een header toe zodat we in de layout weten dat we in construction mode zitten
    response.headers.set('x-voices-under-construction', 'true')
    response.headers.set('x-voices-pathname', '/under-construction')
    return response
  }

  // REDIRECT OLD AUTH PATHS TO UNIVERSAL ACCOUNT PAGE
  if (pathname === '/auth/login' || pathname === '/auth/login/') {
    const accountUrl = url.clone()
    accountUrl.pathname = '/account/login'
    return NextResponse.redirect(accountUrl)
  }

  // REDIRECT OLD SIGNUP TO UNIVERSAL ACCOUNT
  if (pathname === '/auth/signup-legacy' || pathname === '/auth/signup') {
    url.pathname = '/account/signup'
    return NextResponse.redirect(url)
  }

  // 2. MARKET DETECTION
  const marketMap: Record<string, string> = {
    'voices.nl': 'NLNL',
    'voices.fr': 'FR',
    'voices.es': 'ES',
    'voices.eu': 'EU',
    'voices.pt': 'PT',
    'voices.academy': 'ACADEMY',
    'ademing.be': 'ADEMING',
    'johfrai.be': 'JOHFRAI',
    'johfrah.be': 'PORTFOLIO',
    'youssefzaki.eu': 'ARTIST'
  }

  let market = 'BE'
  for (const [domain, code] of Object.entries(marketMap)) {
    if (host.includes(domain)) {
      market = code
      break
    }
  }

  // 2.5 SUB-JOURNEY DETECTION (v2.30)
  // Voices.be/studio en /academy zijn aparte journeys met eigen branding/socials
  const isStudioJourney = pathname.startsWith('/studio') || pathname.startsWith('/studio/');
  const isAcademyJourney = pathname.startsWith('/academy') || pathname.startsWith('/academy/');
  
  if (market === 'BE') {
    if (isStudioJourney) market = 'STUDIO';
    if (isAcademyJourney) market = 'ACADEMY';
  }

  // 3. JOURNEY ROUTING (DOMAIN BASED REWRITES)
  
  //  CHRIS-PROTOCOL: Localhost Journey Protection
  if (host.includes('localhost')) {
    const explicitJourneys = ['/agency', '/artist', '/voice', '/academy', '/ademing', '/johfrai', '/account', '/admin', '/price', '/tarieven'];
    const firstPart = pathname.split('/').filter(Boolean)[0];
    const topLevelSubRoutes = ['demos', 'host', 'tarieven', 'contact', 'bestellen', 'over-mij'];
    
    if (!explicitJourneys.some(j => pathname.startsWith(j)) && topLevelSubRoutes.includes(firstPart)) {
      url.pathname = `/portfolio/johfrah/${firstPart}`;
      const subRouteResponse = NextResponse.rewrite(url);
      subRouteResponse.headers.set('x-voices-pathname', pathname);
      subRouteResponse.headers.set('x-voices-host', `${request.nextUrl.protocol}//${host}`);
      return subRouteResponse;
    }
  }

  // Portfolio Journey
  if (market === 'PORTFOLIO') {
    //  CHRIS-PROTOCOL: Map all root requests to the Johfrah portfolio directory
    const targetPath = pathname === '/' ? '' : pathname;
    url.pathname = `/portfolio/johfrah${targetPath}`;
    const portfolioResponse = NextResponse.rewrite(url)
    portfolioResponse.headers.set('x-voices-market', 'PORTFOLIO')
    portfolioResponse.headers.set('x-voices-pathname', pathname)
    portfolioResponse.headers.set('x-voices-host', `${request.nextUrl.protocol}//${host}`)
    return portfolioResponse
  }

  // JOHFRAI AI DOMAIN
  if (market === 'JOHFRAI') {
    url.pathname = `/johfrai${pathname === '/' ? '' : pathname}`
    const johfraiResponse = NextResponse.rewrite(url)
    johfraiResponse.headers.set('x-voices-market', 'JOHFRAI')
    johfraiResponse.headers.set('x-voices-pathname', pathname)
    johfraiResponse.headers.set('x-voices-host', `${request.nextUrl.protocol}//${host}`)
    return johfraiResponse
  }
  
  // ARTIST DOMAIN (YOUSSEF) - STRICT ISOLATION
  if (market === 'ARTIST' || (host.includes('localhost') && pathname.startsWith('/artist/youssef'))) {
    const targetPath = pathname.replace('/artist/youssef', '') || '/';
    url.pathname = `/artist/youssef${targetPath}`;
    const artistResponse = NextResponse.rewrite(url)
    artistResponse.headers.set('x-voices-market', 'ARTIST')
    artistResponse.headers.set('x-voices-lang', 'en')
    artistResponse.headers.set('x-voices-pathname', pathname)
    artistResponse.headers.set('x-voices-host', `${request.nextUrl.protocol}//${host}`)
    artistResponse.cookies.set('voices_lang', 'en', { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
    return artistResponse
  }

  // Academy Journey
  if (market === 'ACADEMY') {
    url.pathname = `/academy${pathname === '/' ? '' : pathname}`
    const academyResponse = NextResponse.rewrite(url)
    academyResponse.headers.set('x-voices-market', 'ACADEMY')
    academyResponse.headers.set('x-voices-pathname', pathname)
    academyResponse.headers.set('x-voices-host', `${request.nextUrl.protocol}//${host}`)
    return academyResponse
  }

  // Meditation Journey (ADEMING)
  if (market === 'ADEMING') {
    url.pathname = `/ademing${pathname === '/' ? '' : pathname}`
    const ademingResponse = NextResponse.rewrite(url)
    ademingResponse.headers.set('x-voices-market', 'ADEMING')
    ademingResponse.headers.set('x-voices-pathname', pathname)
    ademingResponse.headers.set('x-voices-host', `${request.nextUrl.protocol}//${host}`)
    return ademingResponse
  }

  // 4. I18N NUCLEAR REWRITE (CLEAN URLS)
  // Ondersteunt /fr/, /en/, /nl/, /de/, /es/, /it/, /pt/
  const langMatch = pathname.match(/^\/(fr|en|nl|de|es|it|pt)(\/|$)/i)
  
  // Intelligent Stickiness: Check cookie, then Accept-Language header
  let detectedLang = request.cookies.get('voices_lang')?.value
  
  if (!detectedLang) {
    // Fallback 1: Browser preferences
    const acceptLang = request.headers.get('accept-language') || ''
    if (acceptLang.startsWith('fr')) detectedLang = 'fr'
    else if (acceptLang.startsWith('en')) detectedLang = 'en'
    else if (acceptLang.startsWith('de')) detectedLang = 'de'
    else if (acceptLang.startsWith('es')) detectedLang = 'es'
    else if (acceptLang.startsWith('it')) detectedLang = 'it'
    else if (acceptLang.startsWith('pt')) detectedLang = 'pt'
    
    // Fallback 2: Domain-based defaults
    if (!detectedLang) {
      if (market === 'FR') detectedLang = 'fr'
      else if (market === 'ES') detectedLang = 'es'
      else if (market === 'PT') detectedLang = 'pt'
      else if (market === 'EU') detectedLang = 'en'
      else if (market === 'DE') detectedLang = 'de'
      else detectedLang = 'nl' // Default
    }
  }

  // Als de URL een taalprefix heeft, overschrijft deze alles en zetten we de cookie
  if (langMatch) {
    const urlLang = langMatch[1].toLowerCase()
    const pathWithoutLocale = pathname.replace(/^\/(fr|en|nl|de|es|it|pt)/i, '') || '/'
    
    // Update detectedLang to match URL
    detectedLang = urlLang
    
    url.pathname = pathWithoutLocale
    const i18nResponse = NextResponse.rewrite(url)
    i18nResponse.headers.set('x-voices-lang', detectedLang)
    i18nResponse.headers.set('x-voices-market', market)
    i18nResponse.headers.set('x-voices-pathname', pathname)
    i18nResponse.headers.set('x-voices-host', `${request.nextUrl.protocol}//${host}`)
    
    // Verleng de cookie bij elk bezoek met prefix
    i18nResponse.cookies.set('voices_lang', detectedLang, { 
      path: '/', 
      maxAge: 60 * 60 * 24 * 365, 
      sameSite: 'lax' 
    })
    return i18nResponse
  }

  // INTELLIGENT REDIRECT: Als de bezoeker een franstalige cookie heeft maar op de NL root zit
  // (en het is niet een expliciete taal-switch actie), stuur ze naar de juiste prefix.
  // We doen dit alleen voor de hoofd-domeinen om loops te voorkomen.
  if (!langMatch && detectedLang && detectedLang !== 'nl' && market === 'BE' && pathname === '/') {
    const redirectUrl = url.clone()
    redirectUrl.pathname = `/${detectedLang}${pathname}`.replace(/\/+$/, '/')
    return NextResponse.redirect(redirectUrl)
  }

  // 5. FINAL HEADERS (FOR SERVER COMPONENTS)
  const protocol = request.nextUrl.protocol
  response.headers.set('x-voices-host', `${protocol}//${host}`)
  response.headers.set('x-voices-market', market)
  response.headers.set('x-voices-lang', detectedLang)
  response.headers.set('x-voices-pathname', pathname)

  // Ook hier de taal cookie zetten voor de default taal
  response.cookies.set('voices_lang', detectedLang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax'
  })
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (interne API routes)
     * - admin (admin dashboard)
     * - assets (statische assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|admin|assets|static|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff2?)$).*)',
  ],
}
