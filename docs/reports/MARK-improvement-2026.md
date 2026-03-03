# MARK Improvement Report 2026
**Agent:** Mark (Tone of Voice, Conversion Copy, Zero AI Slop)  
**Date:** 13 February 2026  
**Protocol:** Evidence-based, P0/P1 priorities, zero slop

---

## Audit Summary

Evidence from VoiceglotText usage, defaultText content, and hardcoded strings.

### P0 (CRITICAL – Content First Mandate)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **Uppercase in Voiceglot defaultText** | `WorkshopInterestForm.tsx`, `BookingFunnel.tsx`, `CookieBanner.tsx` | defaultText: "VORIGE", "VERWERKEN...", "INSCHRIJVING VOLTOOIEN", "Accepteer", "Noodzakelijk" – Natural Capitalization breach; buttons mogen geen UPPERCASE |
| 2 | **Hardcoded strings buiten Voiceglot** | `CheckoutForm.tsx` L451 | "Door af te ronden ga je akkoord met onze algeme voorwaarden." – moet `VoiceglotText` zijn voor IAP/LLM |
| 3 | **Voicy proactive message hardcoded** | `VoicyChat.tsx` L85–89 | `content: \`Welkom terug, ${data.firstName}! 🔥 Ik zie dat je...\`` – moet uit Voiceglot of database |

### P1 (WARNING)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **Typography typo in article page** | `article/[slug]/page.tsx` L84 | `className="hred text-white"` – `hred` is ongeldige class; waarschijnlijk `bg-va-black` of gelijkaardig |
| 2 | **text-sm in Article CTA** | `article/[slug]/page.tsx` L86 | `text-sm` – Leesbaarheid Mandate: min 15px |
| 3 | **API email templates: UPPERCASE CTA** | `api/translations/heal/route.ts`, `api/admin/voiceglot/heal-all/route.ts` | "BEVESTIG OF PAS AAN", "BEKIJK STATISTIEKEN" – email CTAs ook Natural Cap |

---

## 3 Masterclass Improvements (Concrete)

### 1. **Voiceglot Uppercase Purge**
- **Actie:** Wijzig defaultText in `WorkshopInterestForm`, `BookingFunnel`, `CookieBanner` naar Natural Capitalization: "Vorige", "Verwerken...", "Inschrijving voltooien", "Accepteer alle", "Alleen noodzakelijk".
- **Bestanden:** `WorkshopInterestForm.tsx`, `BookingFunnel.tsx`, `Legal/CookieBanner.tsx`.
- **Impact:** Zero-Slop UI; Chris-Protocol Natural Capitalization compliant.

### 2. **CheckoutForm Legal Copy naar Voiceglot**
- **Actie:** Vervang hardcoded "Door af te ronden ga je akkoord..." door `<VoiceglotText translationKey="checkout.terms_agreement" defaultText="Door af te ronden ga je akkoord met onze algemene voorwaarden." />`.
- **Bestand:** `1-SITE/apps/web/src/components/checkout/CheckoutForm.tsx`.
- **Impact:** IAP/Content First compliant; Lex kan juridische tekst centraal beheren.

### 3. **Voicy Proactive Messages Database-Driven**
- **Actie:** Verplaats proactive welcome messages uit `VoicyChat.tsx` naar `contentArticles` of een `voicy_messages` table. Haal op basis van `leadVibe` en journey de juiste copy. Fallback naar Voiceglot keys.
- **Bestand:** `VoicyChat.tsx` + nieuwe API of content-fetch.
- **Impact:** Chatty kan copy verfijnen zonder code deploy; Mark controle over tone.

---

## Files Requiring Attention

1. `1-SITE/apps/web/src/components/studio/WorkshopInterestForm.tsx` – uppercase defaultText
2. `1-SITE/apps/web/src/components/checkout/CheckoutForm.tsx` – hardcoded terms text
3. `1-SITE/apps/web/src/components/ui/VoicyChat.tsx` – proactive message
4. `1-SITE/apps/web/src/app/article/[slug]/page.tsx` – `hred` typo, text-sm
