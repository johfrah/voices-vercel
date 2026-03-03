### 11: Academy - Cursus Materiaal Toegang
**Scenario**: Ga naar `/academy/`. Verifieer cursusmodules.
**Browser Test**: Uitgevoerd op v2.15.089 (FAIL).
**Resultaat**: ❌ FAILED. De route `/academy` is niet gedefinieerd in de `SmartRouter` of als fysieke pagina. Lessen worden wel opgehaald in de code maar niet gerendeerd.
**Fixes**: Vereist creatie van `/app/academy/page.tsx`.

### 12: Academy - Video Quiz Functionaliteit
**Scenario**: Start een video quiz.
**Browser Test**: Uitgevoerd op v2.15.089 (PARTIAL).
**Resultaat**: ⚠️ PARTIAL PASS. De `WorkshopQuiz` component bestaat en werkt op `/studio/quiz`, maar is niet gekoppeld aan Academy lessen of voortgang.
**Fixes**: `LessonQuiz.tsx` component nodig met database-integratie.

### 13: Academy - Voicy-Coach Interactie
**Scenario**: Open Voicy-Coach in Academy context.
**Browser Test**: Uitgevoerd op v2.15.089 (PASS).
**Resultaat**: ✅ PASS. `VoicyChat.tsx` detecteert de context en toont Academy-specifieke suggesties.
**Fixes**: Geen fix nodig.

### 14: Academy - Voortgangsregistratie
**Scenario**: Verifieer opslag van voortgang.
**Browser Test**: Uitgevoerd op v2.15.089 (FAIL).
**Resultaat**: ❌ FAILED. Hoewel de database tabel `course_progress` bestaat, ontbreekt de UI-logica in de `VideoPlayer` om voltooiing te registreren.
**Fixes**: `onEnded` handler toevoegen aan `VideoPlayer.tsx` die `/api/academy/submit` aanroept.

### 15: Academy - Certificaat Generatie
**Scenario**: Verifieer certificaat logica.
**Browser Test**: Uitgevoerd op v2.15.089 (FAIL).
**Resultaat**: ❌ FAILED. Geen code of database kolommen gevonden voor certificaten.
**Fixes**: Implementatie van PDF-generatie en database schema update nodig.
