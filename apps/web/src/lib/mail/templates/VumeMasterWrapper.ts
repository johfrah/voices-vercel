import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";
import { localeToBcp47, normalizeLocale } from '@/lib/system/locale-utils';

/**
 * VUME MASTER WRAPPER (2026)
 *
 * Minimal, consistent and robust:
 * - Clean typographic hierarchy
 * - Stable asset URLs for email clients
 * - World-aware signature and footer links
 */

type JourneyKey = 'agency' | 'artist' | 'portfolio' | 'studio' | 'auth';
type LocaleShort = 'nl' | 'fr' | 'en';

interface WrapperOptions {
  title: string;
  previewText?: string;
  journey?: JourneyKey;
  market?: string;
  host?: string;
  language?: string;
  showSignature?: boolean;
  headerImage?: string;
  optOutUrl?: string;
  cta?: {
    label: string;
    url: string;
  };
}

const FALLBACK_LOGO_BY_MARKET: Record<string, string> = {
  BE: 'common/branding/Voices_LOGO_BE.svg',
  NLNL: 'common/branding/Voices_LOGO_NL.svg',
  FR: 'common/branding/Voices_LOGO_FR.svg',
  ES: 'common/branding/Voices_LOGO_ES.svg',
  PT: 'common/branding/Voices_LOGO_PT.svg',
  EU: 'common/branding/Voices_LOGO_EU.svg',
  STUDIO: 'common/branding/Voices_LOGO_BE.svg',
  ACADEMY: 'common/branding/Voices_LOGO_BE.svg',
  ADEMING: 'common/branding/Voices_LOGO_BE.svg',
  FREELANCE: 'common/branding/johfrah.be_LOGO.svg',
  JOHFRAI: 'common/branding/Voices_LOGO_BE.svg',
  ARTIST: 'common/branding/logo-color.png',
  PORTFOLIO: 'common/branding/Voices_LOGO_BE.svg',
};

const JOURNEY_PROFILE: Record<
  JourneyKey,
  {
    profilePath: string;
    supportPath: string;
    line1: Record<LocaleShort, string>;
    line2: Record<LocaleShort, string>;
    worldLabel: Record<LocaleShort, string>;
  }
> = {
  agency: {
    profilePath: '/',
    supportPath: '/contact',
    line1: { nl: 'Team Voices', fr: 'Team Voices', en: 'Voices Team' },
    line2: { nl: 'Agency World', fr: 'Agency World', en: 'Agency World' },
    worldLabel: { nl: 'Agency', fr: 'Agency', en: 'Agency' },
  },
  auth: {
    profilePath: '/account',
    supportPath: '/account/mailbox',
    line1: { nl: 'Team Voices', fr: 'Équipe Voices', en: 'Voices Team' },
    line2: { nl: 'Account', fr: 'Compte', en: 'Account' },
    worldLabel: { nl: 'Account', fr: 'Account', en: 'Account' },
  },
  studio: {
    profilePath: '/studio',
    supportPath: '/studio/contact',
    line1: { nl: 'Team Voices Studio', fr: 'Équipe Voices Studio', en: 'Voices Studio Team' },
    line2: { nl: 'Studio World', fr: 'Studio World', en: 'Studio World' },
    worldLabel: { nl: 'Studio', fr: 'Studio', en: 'Studio' },
  },
  portfolio: {
    profilePath: '/portfolio',
    supportPath: '/portfolio/contact',
    line1: { nl: 'Team Portfolio', fr: 'Équipe Portfolio', en: 'Portfolio Team' },
    line2: { nl: 'Portfolio World', fr: 'Portfolio World', en: 'Portfolio World' },
    worldLabel: { nl: 'Portfolio', fr: 'Portfolio', en: 'Portfolio' },
  },
  artist: {
    profilePath: '/artist',
    supportPath: '/contact',
    line1: { nl: 'Team Artist', fr: 'Équipe Artist', en: 'Artist Team' },
    line2: { nl: 'Artist World', fr: 'Artist World', en: 'Artist World' },
    worldLabel: { nl: 'Artist', fr: 'Artist', en: 'Artist' },
  },
};

function sanitizeHost(inputHost?: string): string {
  return (inputHost || process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'www.voices.be')
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
    .trim();
}

function decodeProxyPath(input: string): string | null {
  try {
    const parsed = new URL(input);
    if (!parsed.pathname.includes('/api/proxy')) return null;
    const pathParam = parsed.searchParams.get('path');
    return pathParam ? decodeURIComponent(pathParam) : null;
  } catch {
    return null;
  }
}

function normalizeAssetPath(rawPath: string | undefined, marketCode: string): string {
  const fallback = FALLBACK_LOGO_BY_MARKET[marketCode] || 'common/branding/email/logos/email-logo.png';
  if (!rawPath || typeof rawPath !== 'string') return fallback;

  let candidate = rawPath.trim();

  const extractedProxyPath = decodeProxyPath(candidate);
  if (extractedProxyPath) candidate = extractedProxyPath;

  if (candidate.includes('/storage/v1/object/public/voices/')) {
    const [, pathTail] = candidate.split('/storage/v1/object/public/voices/');
    if (pathTail) candidate = pathTail;
  }

  if (/^https?:\/\//i.test(candidate)) {
    try {
      const parsed = new URL(candidate);
      candidate = `${parsed.pathname}${parsed.search}`;
    } catch {
      return fallback;
    }
  }

  if (candidate.includes('?path=')) {
    const [, pathTail] = candidate.split('?path=');
    candidate = decodeURIComponent(pathTail || '');
  }

  candidate = candidate.split('?')[0];
  candidate = candidate.startsWith('/assets/') ? candidate.slice('/assets/'.length) : candidate;
  candidate = candidate.startsWith('assets/') ? candidate.slice('assets/'.length) : candidate;
  candidate = candidate.startsWith('/') ? candidate.slice(1) : candidate;

  if (
    !candidate ||
    candidate === 'common/branding/Voices-LOGO-Animated.svg' ||
    candidate === 'common/branding/Voices-LOGO.svg'
  ) {
    return fallback;
  }

  return candidate;
}

function buildProxyAssetUrl(host: string, storagePath: string): string {
  return `https://${host}/api/proxy/?path=${encodeURIComponent(storagePath)}`;
}

export function VumeMasterWrapper(content: string, options: WrapperOptions) {
  const {
    title,
    previewText,
    journey = 'agency',
    host,
    showSignature = true,
    language,
    headerImage,
    optOutUrl,
    cta,
  } = options;
  const resolvedHost = sanitizeHost(host);
  const market = MarketManager.getCurrentMarket(resolvedHost);
  const resolvedLanguage = normalizeLocale(language || market.primary_language || 'nl-be');
  const languageShort = (resolvedLanguage.split('-')[0] === 'fr' || resolvedLanguage.split('-')[0] === 'en'
    ? resolvedLanguage.split('-')[0]
    : 'nl') as LocaleShort;
  const profile = JOURNEY_PROFILE[journey] || JOURNEY_PROFILE.agency;
  const fallbackLogo = FALLBACK_LOGO_BY_MARKET[market.market_code] || 'common/branding/email/logos/email-logo.png';
  const logoStoragePath = normalizeAssetPath(market.logo_url || fallbackLogo, market.market_code);
  const logoSrc = buildProxyAssetUrl(resolvedHost, logoStoragePath);
  const founderStoragePath = journey === 'artist'
    ? 'common/branding/founder/johfrah-contact.jpg'
    : languageShort === 'nl'
      ? 'common/branding/founder/johfrah-avatar-nl.png'
      : 'common/branding/founder/johfrah-avatar-be.png';
  const founderSrc = buildProxyAssetUrl(resolvedHost, founderStoragePath);
  const supportHref = `https://${resolvedHost}${profile.supportPath}`;
  const websiteHref = `https://${resolvedHost}${profile.profilePath}`;
  const accountHref = `https://${resolvedHost}/account`;
  const i18n =
    languageShort === 'fr'
      ? {
          unsubscribe: 'Se désinscrire',
          forMarketing: 'des e-mails marketing',
          websiteCta: 'Site',
          supportCta: 'Chat',
          accountCta: 'Compte',
        }
      : languageShort === 'en'
        ? {
            unsubscribe: 'Unsubscribe',
            forMarketing: 'from marketing emails',
            websiteCta: 'Website',
            supportCta: 'Live chat',
            accountCta: 'Account',
          }
        : {
            unsubscribe: 'Uitschrijven',
            forMarketing: 'voor marketing-mails',
            websiteCta: 'Website',
            supportCta: 'Live chat',
            accountCta: 'Account',
          };
  const signatureName = profile.line1[languageShort] || profile.line1.nl;
  const signatureRole = profile.line2[languageShort] || profile.line2.nl;
  const journeyLabel = profile.worldLabel[languageShort] || profile.worldLabel.nl;

  // Replace {{host}} in content
  const processedContent = content.replace(/\{\{host\}\}/g, resolvedHost);

  let resolvedHeaderImage: string | null = null;
  if (headerImage) {
    if (
      /^https?:\/\//i.test(headerImage) &&
      !headerImage.includes('/api/proxy') &&
      !headerImage.includes('/storage/v1/object/public/voices/') &&
      !headerImage.includes('/assets/')
    ) {
      resolvedHeaderImage = headerImage;
    } else {
      const headerAssetPath = normalizeAssetPath(headerImage, market.market_code);
      resolvedHeaderImage = buildProxyAssetUrl(resolvedHost, headerAssetPath);
    }
  }

  const logoHtml = `
    <tr>
      <td align="center" style="padding: 0 0 20px 0;">
        <img src="${logoSrc}" alt="${market.name}" width="136" style="display:block; border:0; width:136px; height:auto;" />
      </td>
    </tr>
  `;

  const headerHtml = `
    ${
      resolvedHeaderImage
        ? `
      <tr>
        <td style="padding: 0 40px 0 40px;">
          <img src="${resolvedHeaderImage}" alt="${title}" width="520" style="display:block; width:100%; max-width:520px; border-radius:14px; border:1px solid #E5E7EB;" />
        </td>
      </tr>
      `
        : ''
    }
    <tr>
      <td style="padding: ${resolvedHeaderImage ? '22px' : '6px'} 40px 0 40px;">
        <p style="margin:0 0 10px 0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#9CA3AF; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${journeyLabel}</p>
        <h1 style="margin:0; font-size:30px; line-height:1.2; font-weight:600; color:#111827; letter-spacing:-0.01em; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${title}</h1>
      </td>
    </tr>
  `;

  const signatureHtml = showSignature ? `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 24px;">
      <tr>
        <td width="68" style="vertical-align: top;">
          <a href="${websiteHref}?utm_source=email&utm_medium=transactional" style="text-decoration:none;">
            <img src="${founderSrc}" alt="${signatureName}" width="56" height="56" style="display:block; width:56px; height:56px; border-radius:999px; object-fit:cover; border:1px solid #E5E7EB;" />
          </a>
        </td>
        <td style="vertical-align: top; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:14px; line-height:1.5; color:#4B5563;">
          <div style="font-weight:600; color:#111827;">${signatureName}</div>
          <div style="margin-bottom:4px; color:#6B7280;">${signatureRole}</div>
          <a href="mailto:${market.email}" style="color:#4B5563; text-decoration:none;">${market.email}</a>
          ${market.phone ? `<br /><a href="tel:${market.phone.replace(/\s+/g, '')}" style="color:#4B5563; text-decoration:none;">${market.phone}</a>` : ''}
        </td>
      </tr>
    </table>
  ` : '';

  const ctaHtml = cta?.label && cta?.url
    ? `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:24px;">
        <tr>
          <td align="left">
            <a href="${cta.url}" style="display:inline-block; padding:12px 22px; border-radius:999px; background:#111827; color:#FFFFFF; text-decoration:none; font-size:14px; font-weight:600; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${cta.label}</a>
          </td>
        </tr>
      </table>
    `
    : '';

  const footerHtml = `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:26px; text-align:center; color:#6B7280; font-size:12px; line-height:1.6; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <tr>
        <td style="padding-top:16px;">
          <a href="${websiteHref}" style="color:#6B7280; text-decoration:none;">${i18n.websiteCta}</a>
          &nbsp;&nbsp;&bull;&nbsp;&nbsp;
          <a href="${supportHref}" style="color:#6B7280; text-decoration:none;">${i18n.supportCta}</a>
          &nbsp;&nbsp;&bull;&nbsp;&nbsp;
          <a href="${accountHref}" style="color:#6B7280; text-decoration:none;">${i18n.accountCta}</a>
          <br />
          &copy; 2026 ${market.company_name} - ${market.name}
          ${optOutUrl ? `<br /><a href="${optOutUrl}" style="color:#6B7280; text-decoration:underline;">${i18n.unsubscribe}</a> ${i18n.forMarketing}` : ''}
        </td>
      </tr>
    </table>
  `;

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="${localeToBcp47(resolvedLanguage)}">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${title}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#F5F5F7; -webkit-font-smoothing:antialiased;">
      ${previewText ? `<div style="display:none; max-height:0; max-width:0; opacity:0; overflow:hidden;">${previewText}</div>` : ''}

      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F5F5F7; padding:32px 0 56px 0;">
        <tr>
          <td align="center" style="padding:0 16px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
              ${logoHtml}
              <tr>
                <td style="background-color:#FFFFFF; border-radius:18px; overflow:hidden; border:1px solid #E5E7EB; box-shadow:0 4px 18px rgba(17,24,39,0.06);">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    ${headerHtml}
                    <tr>
                      <td style="padding:28px 40px 34px 40px; color:#374151; font-size:15px; line-height:1.68; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                        ${processedContent}
                        ${ctaHtml}
                        ${signatureHtml}
                        ${footerHtml}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export type BaseTemplateProps = {
  title: string;
  previewText?: string;
  journey?: JourneyKey;
  market?: string;
  host?: string;
  language?: string;
  children: string;
  headerImage?: string;
  optOutUrl?: string;
  showSignature?: boolean;
  cta?: {
    label: string;
    url: string;
  };
};

export function BaseTemplate(props: BaseTemplateProps) {
  return VumeMasterWrapper(props.children, {
    title: props.title,
    previewText: props.previewText,
    journey: props.journey,
    market: props.market,
    host: props.host,
    language: props.language,
    showSignature: props.showSignature,
    headerImage: props.headerImage,
    optOutUrl: props.optOutUrl,
    cta: props.cta,
  });
}
