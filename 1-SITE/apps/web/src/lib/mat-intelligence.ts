/**
 * 🚪 MAT: VISITOR INTELLIGENCE HELPER (2026)
 * 
 * Eenvoudige client-side helper om events naar Mat's radar te sturen.
 */
export const matTrack = (data: {
  event: 'pageview' | 'click' | 'hover' | 'conversion';
  pathname?: string;
  intent?: string;
  iapContext?: any;
}) => {
  if (typeof window === 'undefined') return;

  fetch('/api/marketing/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      pathname: data.pathname || window.location.pathname,
      referrer: document.referrer,
    })
  }).catch(() => {}); // Silent fail om de UX niet te verstoren
};
