# 🎭 Studio World Visual & Functional Audit Report

**Datum**: 26 februari 2026, 01:58 UTC  
**Domein**: https://www.voices.be  
**Methode**: Playwright Browser Automation (Headless Chrome)  
**Agent**: Chris/Technical Director

---

## 📊 Executive Summary

**STATUS**: ❌ **CRITICAL FAILURES DETECTED**

Beide Studio-pagina's vertonen **Server Component Render Errors** en tonen error states in plaats van de verwachte content. Dit is een **productie-blokkerende situatie**.

---

## 🎬 Test 1: Quiz Page (`/studio/quiz`)

### ✅ Succesvolle Elementen
- **Pagina laadt**: De pagina toont content (geen volledig wit scherm)
- **Button aanwezig**: 1 button gevonden: "Opnieuw Proberen"
- **Button is interactief**: Visible en enabled

### ❌ Kritieke Problemen

#### 1. **GEEN VIDEO ACHTERGROND**
```
Video Elements Found: 0
```
- Er is **GEEN** `<video>` element aanwezig in de DOM
- De quiz-pagina toont een **error state** met een "Opnieuw Proberen" knop
- Dit wijst op een **Server Component render failure**

#### 2. **Error State Actief**
De aanwezigheid van de "Opnieuw Proberen" button duidt op een foutafhandeling die is geactiveerd, niet op de normale quiz-interface.

**Button Details**:
```json
{
  "text": "Opnieuw Proberen",
  "className": "rounded-[10px] active:scale-95 transition-all duration-500 text-[15px] ease-va-bezier inline-flex items-center justify-center whitespace-nowrap cursor-pointer font-light bg-va-black text-white hover:bg-va-black/90 px-6 py-3 va-btn-pro !px-12",
  "disabled": false,
  "type": "button"
}
```

### 📸 Screenshot
Opgeslagen als: `quiz-deep.png`

---

## 📚 Test 2: Workshops Page (`/studio/doe-je-mee`)

### ❌ Kritieke Problemen

#### 1. **GEEN WORKSHOPS GELADEN**
```
Grid containers: 0
Card/Article elements: 0
Workshop-specific elements: 0
```
- De pagina toont **GEEN** workshop items
- De pagina is in een **error state**

#### 2. **Error Message Zichtbaar**
```
Heading: "Oeps, even geduld"
```
Dit is de standaard error fallback van Voices, wat bevestigt dat er een **Server Component failure** is opgetreden.

### ⚠️ Esthetische Bevindingen

#### Font Issues
```
Body font: Inter, system-ui, sans-serif
Heading font: __Raleway_ea7542, __Raleway_Fallback_ea7542, Raleway, sans-serif
```
- **Body**: Gebruikt Inter (correct voor algemene tekst)
- **Headings**: Gebruikt Raleway (✅ correct volgens Bob-methode)

#### Natural Capitalization
```
Found 3 element(s) with text-transform: uppercase
```
⚠️ Er zijn nog steeds 3 elementen met `text-transform: uppercase`, wat in strijd is met de Natural Capitalization wet.

### 📸 Screenshot
Opgeslagen als: `workshops-deep.png`

---

## 🚨 Console Errors (Beide Pagina's)

### Error Count
```
Total console messages: 27
Errors: 4
Warnings: 0
```

### Error Details

Alle 4 errors zijn **identiek** en wijzen op een **Server Component Render Failure**:

```
Error: An error occurred in the Server Components render. 
The specific message is omitted in production builds to avoid 
leaking sensitive details. A digest property is included on 
this error instance which may provide additional details about 
the nature of the error.
```

**Kritieke Observatie**: De digest ID's zijn **niet zichtbaar** in de browser console output, wat betekent dat we de exacte foutlocatie niet kunnen traceren zonder toegang tot de Vercel logs of lokale development mode.

### Additional Error
```
Failed to load resource: the server responded with a status of 401 ()
```
Dit duidt op een **authenticatie-fout** bij het ophalen van een resource (waarschijnlijk API call of asset).

---

## 🔍 Test 3: Version Check

### ❌ Versie Niet Beschikbaar

**API Endpoint**: `https://www.voices.be/api/admin/config`  
**Resultaat**: **401 Unauthorized** (redirect naar login)

De versie kon niet worden geverifieerd omdat:
1. De API endpoint vereist authenticatie
2. Er is geen versie-indicator zichtbaar in de footer of page source

**Verwachte versie**: v2.14.770 of hoger  
**Gedetecteerde versie**: ❌ Niet beschikbaar

---

## 🎯 Root Cause Analysis

### Primaire Oorzaak: Server Component Render Failures

De **identieke error patterns** op beide pagina's wijzen op een **gemeenschappelijke oorzaak**:

1. **Mogelijke Oorzaken**:
   - Database connectie issues (Supabase Pooler drift)
   - Ontbrekende of corrupte data in de `studio_workshops` of gerelateerde tabellen
   - API route failures in de data-fetching layer
   - Hydration mismatches door inconsistente server/client state

2. **401 Error Implicatie**:
   - Een resource (mogelijk workshop data of video assets) vereist authenticatie
   - Dit zou kunnen wijzen op een misconfiguratie in de Supabase RLS policies of API routes

### Secundaire Oorzaak: Missing Video Element

De quiz-pagina mist het video-element volledig, wat kan betekenen:
- De video-component crasht tijdens server-side rendering
- De video-bron is niet beschikbaar of geeft een 401
- Er is een import/export issue met de video-component

---

## 📋 Aanbevolen Acties (Prioriteit)

### 🔴 URGENT (Productie-Blokkerende Fixes)

1. **Check Vercel Logs**:
   ```bash
   vercel logs --follow
   ```
   Zoek naar de exacte error stack traces met digest IDs.

2. **Verify Database Connection**:
   - Controleer of de Supabase Pooler (6543) bereikbaar is
   - Test de `studio_workshops` query direct via SQL

3. **Check RLS Policies**:
   - Verify dat de Studio-gerelateerde tabellen de juiste `anon` access hebben
   - Check of er recent RLS policy changes zijn geweest

4. **Inspect Video Component**:
   - Lokaal de quiz-pagina laden in development mode
   - Check of de video-component correct importeert en rendert

### 🟡 HIGH (Esthetische Fixes)

5. **Fix ALL CAPS Elements**:
   - Identificeer de 3 elementen met `text-transform: uppercase`
   - Vervang door Natural Capitalization

6. **Version Visibility**:
   - Voeg versie-indicator toe aan de footer (publiek zichtbaar)
   - Of: maak `/api/admin/config` deels publiek voor versie-info

---

## 🛡️ Chris-Protocol Compliance

### ❌ FAILED Mandates

1. **ACTOR VISIBILITY MANDATE**: Niet van toepassing (geen acteurs op deze pagina's)
2. **ZERO-HALLUCINATION POLICY**: ✅ Geen verzonnen data gedetecteerd
3. **ANTI-FANTASIE MANDAAT**: ✅ Geen eigen branding-termen
4. **DATA-DRIVEN CONFIGURATION**: ❌ FAILED - Data wordt niet geladen
5. **MODERN STACK DISCIPLINE**: ✅ Tailwind CSS correct gebruikt

### ⚠️ WARNINGS

- **Nuclear Loading Law**: Niet te verifiëren zonder werkende pagina
- **100ms LCP**: Niet te meten vanwege error state

---

## 📸 Evidence

Alle screenshots en JSON reports zijn opgeslagen in:
```
scripts/screenshots/
├── quiz-deep.png
├── workshops-deep.png
├── deep-audit-report.json
└── STUDIO-AUDIT-REPORT.md (dit bestand)
```

---

## ✅ Certificering

**VERIFIED LIVE**: ❌ **FAILED**  
**Browser Used**: ✅ Playwright Chromium (Headless)  
**Proof of Testing**: ✅ Screenshots + JSON report  
**Console Errors**: ❌ 4 Server Component errors + 1 401 error  
**Functional Status**: ❌ Both pages in error state  

---

**Conclusie**: De Studio-wereld is **NIET FUNCTIONEEL** in productie. Beide pagina's tonen error states in plaats van de verwachte content. Dit vereist **onmiddellijke aandacht** van het development team.

---

*"Code is ofwel Masterclass, ofwel Slop. Dit is Slop."* - Chris/Autist
