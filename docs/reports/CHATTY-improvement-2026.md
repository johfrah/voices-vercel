# CHATTY Improvement Report 2026
**Agent:** Chatty (Form Integrity, Voicy Interaction, Conversational Flow)  
**Date:** 13 February 2026  
**Protocol:** Evidence-based, P0/P1 priorities, zero slop

---

## Audit Summary

Evidence from VoicyChat, forms, and input handling.

### P0 (CRITICAL – Chatty Mandate)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **Voicy input placeholder hardcoded** | `VoicyChat.tsx` L574 | `placeholder="Typ je bericht..."` – moet Voiceglot voor meertaligheid |
| 2 | **WorkshopInterestForm: geen echte API submit** | `WorkshopInterestForm.tsx` L59–65 | `console.log('Final Submission:'...); setTimeout(...)` – form stuurt nergens naartoe; "dode" submit |
| 3 | **DonationModal/forms: validatie** | `DonationModal.tsx`, `ContactForm` | Check of required fields en error states correct zijn; geen "dode knop" |

### P1 (WARNING)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **Voicy proactive message AI-slop** | `VoicyChat.tsx` L85–89 | "Ik zie dat je een trouwe klant bent. Kan ik je helpen met een nieuwe boeking..." – mogelijk te stijf; Chatty moet tone verfijnen |
| 2 | **Mail tab in Voicy: placeholder** | `VoicyChat.tsx` | Email/message velden – check placeholders en error feedback |
| 3 | **Geen loading state op Voicy send** | `VoicyChat.tsx` | Input blijft actief tijdens send; 100ms feedback mogelijk zwak |

---

## 3 Masterclass Improvements (Concrete)

### 1. **WorkshopInterestForm API Wiring**
- **Actie:** Vervang `setTimeout` door echte POST naar `/api/studio/workshop-interest` of `/api/leads`. Sla op in DB; stuur bevestiging. Verwijder `console.log`.
- **Bestand:** `1-SITE/apps/web/src/components/studio/WorkshopInterestForm.tsx`.
- **Impact:** Geen dode knop; Chatty mandate: "Chatty tolereert geen enkele dode knop".

### 2. **Voicy Placeholder Voiceglot**
- **Actie:** Vervang `placeholder="Typ je bericht..."` door `<VoiceglotText translationKey="voicy.input.placeholder" defaultText="Typ je bericht..." />` als string in placeholder prop (of via hook).
- **Bestand:** `1-SITE/apps/web/src/components/ui/VoicyChat.tsx`.
- **Impact:** Meertalige Voicy; conversatie-consistentie.

### 3. **Proactive Message Tone Tuning**
- **Actie:** Verplaats proactive messages naar content/DB. Herschrijf "burning" welcome: korter, warmer, minder zakelijk. Bijv. "Welkom terug! Waar kan ik je vandaag mee helpen?" in plaats van "Kan ik je helpen met een nieuwe boeking voor X?".
- **Bestand:** `VoicyChat.tsx` + content layer.
- **Impact:** Ademing-feel in chat; Chatty vibe-tuning.

---

## Files Requiring Attention

1. `1-SITE/apps/web/src/components/studio/WorkshopInterestForm.tsx` – API submit
2. `1-SITE/apps/web/src/components/ui/VoicyChat.tsx` – placeholder, proactive message
3. `1-SITE/apps/web/src/components/artist/DonationModal.tsx` – validatie
