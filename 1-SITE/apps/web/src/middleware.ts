import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

/**
 * ⚡ NUCLEAR MIDDLEWARE (GOD MODE 2026)
 * 
 * Doel: Volledige controle over routing, i18n, en journey detection.
 * Deze middleware is de 'Traffic Controller' van het Voices Ecosysteem.
 */

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname
  const userAgent = request.headers.get('user-agent') || ''

  // 🛡️ NUCLEAR BOT PROTECTION
  const aiBots = [
    'gptbot', 'chatgpt-user', 'google-extended', 'ccbot', 'anthropicai', 
    'claude-web', 'omgili', 'facebookbot', 'diffbot', 'bytespider', 
    'imagesiftbot', 'perplexitybot', 'youbot'
  ]
  
  if (aiBots.some(bot => userAgent.toLowerCase().includes(bot))) {
    console.warn(`🚫 NUCLEAR BLOCK: AI Bot detected [${userAgent}] at ${pathname}`)
    return new NextResponse('AI Training and Scraping is strictly prohibited on Voices.be.', { status: 403 })
  }

  // 1. 🛡️ SECURITY & ASSET BYPASS
  // Laat statische assets en API's direct door (matcher doet dit ook, maar extra veiligheid)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|wav|mp3|mp4)$/)
  ) {
    // 🔒 HOTLINKING PROTECTION FOR ASSETS
    const referer = request.headers.get('referer')
    const isAsset = pathname.startsWith('/assets/agency/voices')
    const host = request.headers.get('host') || ''
    
    if (isAsset && referer && !referer.includes(host) && !referer.includes('localhost')) {
      console.warn(`🚫 HOTLINK BLOCK: Asset requested from external domain [${referer}]`)
      return new NextResponse('Unauthorized asset request.', { status: 403 })
    }

    return NextResponse.next()
  }

  let response: NextResponse
  try {
    response = await updateSession(request)
  } catch (err) {
    console.error('❌ Middleware updateSession failed:', err)
    response = NextResponse.next()
  }
  const host = request.headers.get('host') || ''

  // 1.5 🧹 NUCLEAR SESSION CLEANUP (FORCE LOGOUT FROM OLD WP)
  // Als we WordPress cookies zien, of als de 'voices_session_v2' vlag ontbreekt, 
  // dwingen we een schone lei af voor de nieuwe Next.js omgeving.
  const hasNewSession = request.cookies.has('voices_session_v2')
  const hasWpCookies = request.cookies.getAll().some(c => c.name.startsWith('wordpress_'))

  if (!hasNewSession || hasWpCookies) {
    // Verwijder alle oude WP cookies
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
    
    console.log('🧹 NUCLEAR CLEANUP: Old WordPress sessions cleared.')
  }

  // 1.7 🚧 UNDER CONSTRUCTION GATE (GOD MODE)
  // Als de site in 'under construction' modus staat, laten we alleen admins door.
  // We gebruiken een environment variable of een cookie voor de bypass.
  const isUnderConstruction = process.env.NEXT_PUBLIC_UNDER_CONSTRUCTION === 'true'
  const isAdmin = request.cookies.get('voices_role')?.value === 'admin'
  const isAuthPath = pathname.startsWith('/auth')
  const isUnderConstructionPath = pathname === '/under-construction'

  // 🛡️ REDIRECT OLD SIGNUP TO UNIVERSAL LOGIN
  if (pathname === '/auth/signup') {
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // 🩹 SELF-HEALING: Redirect kapotte links naar de juiste pagina
  // Alleen redirecten als we zeker weten dat het een oude link is die niet door de slug handler wordt gepakt
  const priceRedirects: Record<string, string> = {
    '/prices': '/price',
    '/tarieven': '/price',
    '/prijzen': '/price',
    '/price': '/agency', // 🩹 TEMP FIX: Redirect /price to agency until dedicated page exists
  }
  const normalizedPath = pathname.replace(/\/$/, '') || '/'
  
  // Voorkom oneindige redirects: redirect alleen als het pad NIET al /price is
  if (normalizedPath !== '/price' && (priceRedirects[normalizedPath] || priceRedirects[pathname])) {
    url.pathname = priceRedirects[normalizedPath] || priceRedirects[pathname]
    return NextResponse.redirect(url)
  }

  // 🩹 SELF-HEALING: Redirect /[locale]/price naar /price
  // Anders 404 wanneer iemand op FR/EN klikt en naar prijzen gaat
  const localePriceMatch = pathname.match(/^\/(fr|en|nl|de|es|it|pt)\/(price|prices|tarieven|prijzen)\/?$/i)
  if (localePriceMatch) {
    url.pathname = `/price`
    return NextResponse.redirect(url)
  }

  if (isUnderConstruction && !isAdmin && !isAuthPath && !isUnderConstructionPath) {
    url.pathname = '/under-construction'
    return NextResponse.redirect(url)
  }

  // 2. 🌍 MARKET DETECTION
  let market = 'BE'
  if (host.includes('voices.nl')) market = 'NL'
  else if (host.includes('voices.fr')) market = 'FR'
  else if (host.includes('voices.es')) market = 'ES'
  else if (host.includes('voices.eu')) market = 'EU'
  else if (host.includes('voices.pt')) market = 'PT'
  else if (host.includes('voices.de')) market = 'DE'
  else if (host.includes('voices.academy')) market = 'ACADEMY'
  else if (host.includes('ademing.be')) market = 'ADEMING'
  else if (host.includes('johfrai.be')) market = 'JOHFRAI'

  // 3. 🗺️ JOURNEY ROUTING (DOMAIN BASED REWRITES)
  
  // Portfolio Journey
  if (host.includes('johfrah.be')) {
    // 🎯 JOHFRAI REDIRECT: Als we op johfrah.be zitten en naar /johfrai gaan, stuur door naar de hoofdpagina
    if (pathname === '/johfrai') {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    
    // 🛡️ EXCLUDE SYSTEM PATHS FROM PORTFOLIO REWRITE
    if (!pathname.startsWith('/auth') && !pathname.startsWith('/api') && !pathname.startsWith('/admin')) {
      url.pathname = `/portfolio/johfrah${pathname === '/' ? '' : pathname}`
      const portfolioResponse = NextResponse.rewrite(url)
      portfolioResponse.headers.set('x-voices-market', 'JOHFRAH')
      portfolioResponse.headers.set('x-voices-lang', 'nl')
      return portfolioResponse
    }
  }

  // 🤖 JOHFRAI AI DOMAIN
  if (host.includes('johfrai.be')) {
    url.pathname = `/johfrai${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }
  
  if (host.includes('youssefzaki.eu')) {
    url.pathname = `/artist/youssef-zaki${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  // Academy Journey
  if (market === 'ACADEMY') {
    url.pathname = `/academy${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  // Meditation Journey
  if (market === 'ADEMING') {
    url.pathname = `/ademing${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  // 4. 🌍 I18N NUCLEAR REWRITE (CLEAN URLS)
  // Ondersteunt /fr/, /en/, /nl/, /de/, /es/, /it/, /pt/
  const langMatch = pathname.match(/^\/(fr|en|nl|de|es|it|pt)(\/|$)/i)
  let detectedLang = 'nl' // Default

  // Forceer default taal op basis van domein
  if (market === 'FR') detectedLang = 'fr'
  else if (market === 'ES') detectedLang = 'es'
  else if (market === 'PT') detectedLang = 'pt'
  else if (market === 'EU') detectedLang = 'en'
  else if (market === 'DE') detectedLang = 'de'

  if (langMatch) {
    detectedLang = langMatch[1].toLowerCase()
    const pathWithoutLocale = pathname.replace(/^\/(fr|en|nl|de|es|it|pt)/i, '')
    // ⚠️ content-preview zit onder [locale]/content-preview/[slug] – de locale moet in het pad blijven
    // anders matcht de route niet en krijg je 404
    if (pathWithoutLocale.startsWith('/content-preview/')) {
      url.pathname = pathname
    } else {
      url.pathname = pathWithoutLocale || '/'
    }
    
    console.log(`⚡ NUCLEAR I18N: ${pathname} -> ${url.pathname} [Market: ${market}, Lang: ${detectedLang}]`)
    
    const i18nResponse = NextResponse.rewrite(url)
    i18nResponse.headers.set('x-voices-market', market)
    i18nResponse.headers.set('x-voices-lang', detectedLang)
    i18nResponse.headers.set('x-voices-host', `${request.nextUrl.protocol}//${host}`)
    
    // 🍪 Bewaar de taalvoorkeur in een cookie voor de bezoeker
    i18nResponse.cookies.set('voices_lang', detectedLang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 jaar
      sameSite: 'lax'
    })
    
    return i18nResponse
  }

  // 5. 🚀 FINAL HEADERS (FOR SERVER COMPONENTS)
  const protocol = request.nextUrl.protocol
  response.headers.set('x-voices-host', `${protocol}//${host}`)
  response.headers.set('x-voices-market', market)
  response.headers.set('x-voices-lang', detectedLang)
  response.headers.set('x-voices-pathname', pathname)

  // 🍪 Ook hier de taal cookie zetten voor de default taal
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
     * - assets (statische assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|admin|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
