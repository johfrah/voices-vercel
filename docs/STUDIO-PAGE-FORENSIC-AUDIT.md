# 🔍 Studio Page Forensic Audit - voices.be/studio

**Datum**: 26 februari 2026  
**URL**: https://voices.be/studio/?wipe=1772074991864  
**Auditor**: Chris (Technical Director)  
**Methode**: Playwright Headless Browser + Full Page Screenshot

---

## 📊 Executive Summary

De Studio-pagina laadt succesvol, maar vertoont **kritieke tekortkomingen** vergeleken met de "Masterclass" standaard:

### ✅ WAT WERKT
1. **Reviews aanwezig**: 14 review/testimonial elementen gedetecteerd
2. **Video-elementen aanwezig**: 1 video element gevonden
3. **Basis structuur intact**: 2 H1, 5 H2, 6 secties
4. **Pagina laadt**: Geen fatale crashes

### ❌ KRITIEKE PROBLEMEN

#### 1. **TRANSLATION KEY NIET VERTAALD**
- **H1 toont**: `"page.studio.title"` (raw translation key)
- **Verwacht**: "Voices Studio" of de vertaalde titel
- **Impact**: Fatale UX-fout, ziet eruit als een ontwikkelaarsfout

#### 2. **WORKSHOP CAROUSEL ONTBREEKT**
- **Gevonden**: Slechts 2 carousel/video elementen (te weinig voor een volwaardige carousel)
- **Verwacht**: Een volledige carousel met meerdere workshop video-thumbnails
- **Impact**: De hoofdfunctie van de pagina (workshops tonen) is niet aanwezig

#### 3. **SMART ROUTER BLOCKS ONTBREKEN**
- **Gevonden**: `[]` (geen enkele `data-block-type` attribute)
- **Verwacht**: Gestructureerde blokken met `data-block-type="workshop"`, `data-block-type="reviews"`, etc.
- **Impact**: De pagina gebruikt NIET de Smart Router architectuur

#### 4. **MASSALE NETWORK ERRORS**
- **Video laadt niet**: `workshop_studio_teaser.mp4` - 11x ERR_ABORTED
- **Subtitles laden niet**: `workshop_studio_teaser-nl.vtt` - 9x ERR_ABORTED
- **Iconen laden niet**: `INFO.svg` - ERR_ABORTED
- **Prefetch errors**: Meerdere `?_rsc=vf0v7` requests falen (Next.js prefetch)
- **Impact**: De pagina is visueel gebroken, video's spelen niet af

#### 5. **API UNAUTHORIZED**
- **API Response**: `{"error": "Unauthorized"}`
- **Impact**: De versie kan niet worden geverifieerd via de API

---

## 🎭 Visuele Analyse (Screenshot)

### WAT IK ZIE:
1. **Hero sectie**: Toont `"page.studio.title"` (translation key bug)
2. **Mobiele mockup**: Aanwezig, maar geen video zichtbaar (zwart scherm)
3. **Intro tekst**: "Workshops voor professionele sprekers." (correct)
4. **3 USP Cards**: Aanwezig (klein, moeilijk leesbaar in screenshot)
5. **"De Instructeurs" sectie**: Aanwezig met 2 profielen (Bernadette en Johfrah)
6. **Kalender sectie**: Blauw blok met "Bekijk de kalender" CTA
7. **Workshop Quiz**: Roze blok met "Start de quiz" CTA
8. **Footer CTA**: "Klaar om jouw stem te vinden?" (zwarte sectie)
9. **Footer**: Aanwezig met links

### WAT ER ONTBREEKT:
1. **Workshop Carousel**: NIET ZICHTBAAR (dit is de kernfunctionaliteit!)
2. **Video thumbnails**: Geen enkele workshop video thumbnail zichtbaar
3. **Reviews sectie**: Niet zichtbaar in de screenshot (mogelijk te laag op de pagina)

---

## 🧩 HTML Structuur Analyse

### H1 Elementen (2):
1. `"page.studio.title"` ❌ (translation key bug)
2. `"Workshops voor professionele sprekers."` ✅

### H2 Elementen (5):
1. "Leer professioneler spreken met Bernadette en Johfrah" ✅
2. "De Instructeurs" ✅
3. "Kalender" ✅
4. "Welke workshop past bij jou?" ✅
5. "Klaar om jouw stem te vinden?" ✅

### Secties (6):
- Basis structuur aanwezig, maar geen `data-block-type` attributes

---

## 🚨 Console & Network Errors

### Console Errors:
```
Failed to load resource: the server responded with a status of 401 ()
```

### Network Errors (Top 5):
1. `workshop_studio_teaser.mp4` - **11x ERR_ABORTED** ❌
2. `workshop_studio_teaser-nl.vtt` - **9x ERR_ABORTED** ❌
3. `INFO.svg` - **ERR_ABORTED** ❌
4. `branding-branding-photo-horizontal-1.webp` - **ERR_ABORTED** ❌
5. Meerdere Next.js prefetch requests (`?_rsc=vf0v7`) - **ERR_ABORTED**

**Root Cause**: De video en assets worden herhaaldelijk aangevraagd maar falen. Dit suggereert:
- Een fout in de video-component (infinite retry loop?)
- Onjuiste asset-paden
- CORS-problemen
- Supabase Storage authenticatie issues

---

## 🎯 Masterclass Standaard Vergelijking

| Criterium | Status | Opmerking |
|-----------|--------|-----------|
| **100ms LCP** | ⚠️ Onbekend | Niet gemeten in deze audit |
| **Translation Keys** | ❌ FAIL | `page.studio.title` niet vertaald |
| **Smart Router Blocks** | ❌ FAIL | Geen `data-block-type` attributes |
| **Workshop Carousel** | ❌ FAIL | Niet aanwezig/niet zichtbaar |
| **Video Playback** | ❌ FAIL | 11x network errors voor video |
| **Reviews Sectie** | ⚠️ PARTIAL | Elementen aanwezig, maar niet zichtbaar in screenshot |
| **SEO Schema** | ✅ PASS | Organization schema aanwezig |
| **Responsive Design** | ✅ PASS | Mobiele mockup aanwezig |
| **Footer CTA** | ✅ PASS | "Klaar om jouw stem te vinden?" aanwezig |

---

## 🔧 Aanbevolen Fixes (Prioriteit)

### 🔴 KRITIEK (Blokkerende bugs)
1. **Fix Translation Key**: `page.studio.title` moet worden vertaald naar "Voices Studio"
   - **Locatie**: Vermoedelijk in `1-SITE/apps/web/src/app/[...slug]/page.tsx` of de Studio page component
   - **Actie**: Controleer de `useTranslations()` hook en de `messages/nl-BE.json` bestand

2. **Fix Video Asset Paths**: `workshop_studio_teaser.mp4` laadt niet
   - **Locatie**: Controleer de asset-paden in de video-component
   - **Actie**: Verifieer dat de video bestaat in Supabase Storage en dat de URL correct is

3. **Implementeer Workshop Carousel**: De kernfunctionaliteit ontbreekt
   - **Locatie**: Moet worden toegevoegd aan de Studio page
   - **Actie**: Gebruik de `WorkshopCarousel` component (als die bestaat) of bouw deze

### 🟡 BELANGRIJK (Architectuur)
4. **Implementeer Smart Router Blocks**: Voeg `data-block-type` attributes toe
   - **Impact**: Essentieel voor de Bob-architectuur
   - **Actie**: Refactor de pagina om de Smart Router te gebruiken

5. **Fix Prefetch Errors**: Meerdere Next.js prefetch requests falen
   - **Impact**: Performance en UX
   - **Actie**: Controleer de `GlobalNav` en de prefetch-logica

### 🟢 NICE-TO-HAVE (Polish)
6. **Verbeter Reviews Visibility**: Reviews zijn aanwezig maar niet prominent
7. **Optimaliseer Asset Loading**: Reduceer het aantal herhaalde requests

---

## 📸 Screenshot Locatie

**Full Page Screenshot**: `3-WETTEN/scripts/studio-page-audit.png`

---

## 🧪 Test Commando

```bash
npx tsx 3-WETTEN/scripts/audit-studio-page.ts
```

---

## ✅ Conclusie

De Studio-pagina is **NIET Masterclass-ready**. De pagina laadt, maar mist kritieke functionaliteit (Workshop Carousel) en vertoont fatale bugs (translation key niet vertaald, video laadt niet). De Smart Router architectuur wordt NIET gebruikt.

**Aanbeveling**: Prioriteer de fixes in de volgorde hierboven voordat de pagina live gaat.

---

**Audit voltooid**: 26 februari 2026  
**Volgende stap**: Fix de translation key bug en implementeer de Workshop Carousel.
