# Mandaat: Actor Signup – Maken, Pushen, Testen als stemacteur

**Doel:** De HITL-aanmeldflow voor stemacteurs maken, naar productie pushen en end-to-end testen alsof je zelf stemacteur bent.

**Handshake-mandaat:** Alles wat de acteur aanlevert (tagline, bio, profielfoto, demo’s, video’s) moet in hetzelfde backend-schema en dezelfde Actor Edit Modal landen. **Holiday/vakantie** wordt *niet* in signup gevraagd; alleen de hint dat ze na goedkeuring beschikbaarheid kunnen instellen.

---

## 1. Maken (wat er moet staan)

- [ ] **Route:** `/account/signup` (en redirect `/auth/signup` → `/account/signup`)
- [ ] **Form:** `ActorProfileForm` mode `signup`: 5 stappen. **Door de acteur aangeleverd (handshake):**
  - **Stap 1:** Privacy-block (privé: e-mail, telefoon; zichtbaar: naam, foto, tagline, bio, …), identiteit, e-mail, **profielfoto**, **tagline**, **bio**
  - Stap 2: Talen | Stap 3: Karakter | Stap 4: Levering + **Studio** (microfoon, interface, preamp, booth); geen holiday-velden
  - **Stap 5:** **Vaste basistarief** Telefonie €89 en Corporate €249 (niet kiezen); uitleg **platformfee 25%** (ingevuld bedrag = klantprijs; 25% eraf); mediatypes/buy-out/meerdere spots/podcast 3 mnd; alleen **Onbetaald/Proef** en **Live regie** invulbaar; optionele demo + video-URL
- [ ] **API:** `POST /api/actors/signup` – actor met `tagline`, `bio`, `photo_id`, **price_online=249**, **price_ivr=89**, `rates.GLOBAL`, `actor_languages`, `actor_tones`, **studio_specs**, optioneel `actor_demos`, `actor_videos`; `central_leads`; **geen** holiday-velden
- [ ] **Upload:** `POST /api/actors/signup/upload` – foto (crop) en demo naar Supabase Storage + `media`; geen admin-auth
- [ ] **Copy:** Uitleg buy-out/tarieven; beschikbaarheid alleen als hint (na goedkeuring instelbaar)
- [ ] **Link:** Footer "Aanmelden als stem" → `/account/signup`

---

## 2. Pushen (release-lane)

Volg het **Chris-Protocol** en **700-PUSH-AND-VALIDATE**. Geen push zonder:

1. **Version Sync (drie plekken, zelfde versie):**
   - `apps/web/package.json` → `"version": "X.Y.Z"`
   - `apps/web/src/app/Providers.tsx` → `currentVersion = 'X.Y.Z'`
   - `apps/web/src/app/api/admin/config/route.ts` → `_version: 'X.Y.Z'` (alle voorkomens)
   - Bepaal X.Y.Z op basis van de **hoogste** versie op `main` (na `git fetch origin main`).

2. **Pre-Vercel Check:**
   ```bash
   npm run check:pre-vercel
   ```
   Moet slagen (build + Nuclear Law-scan).

3. **Commit en push:**
   ```bash
   git add .
   git commit -m "vX.Y.Z: Actor signup HITL – maken, pushen, testen als stemacteur"
   git push origin main
   ```

4. **Na push:** Wacht tot Vercel-build klaar is (~2 min). Optioneel: vanuit `apps/web` → `npm run audit:forensic` en browser-test op live.

---

## 3. Testen als stemacteur

**Rol:** Je bent een kandidaat-stemacteur die zich aanmeldt. Geen admin-rechten.

### 3.1 Naar de aanmeldpagina

- Ga naar **https://www.voices.be/account/signup** (of lokaal `http://localhost:3000/account/signup`).
- Controleer: titel "Word een Voices Stem", badge "Join the Agency", 5 stappen in de progressie.

### 3.2 Stap 1 – Identiteit + e-mail + foto + tagline + bio

- Vul **Voornaam**, **Achternaam**, **E-mail** in.
- **Profielfoto (delivery photo):** klik op de foto-placeholder, kies een afbeelding, centreer/crop, bevestig upload. Controleer dat de voorvertoning verschijnt.
- Vul **Tagline** in (korte zin) en **Bio** (tekst voor op de stemmenpagina).
- Kies **Geslacht** en **Land**.

### 3.3 Stap 2 – Talen

- Kies **Moedertaal**.
- Optioneel: selecteer **Extra talen**.

### 3.4 Stap 3 – Karakter

- Selecteer één of meer **tonen** (bijv. warm, zakelijk).

### 3.5 Stap 4 – Levering

- Zet **Min./max. levertijd** en **Cutoff-tijd**.
- Controleer de korte uitleg over beschikbaarheid na goedkeuring.

### 3.6 Stap 5 – Tarieven + demo + video

- Controleer de uitleg over buy-out en tarieven.
- Vul **Online**, **Onbetaald/Proef**, **IVR**, **Live regie** in (getallen).
- Optioneel: upload één **demo** (mp3/wav/ogg/m4a). Controleer dat "Demo geüpload" verschijnt.
- Optioneel: vul een **video-URL** in (YouTube of Vimeo) en eventueel de **naam van de video**.
- Klik **Profiel Opslaan**.

### 3.7 Na submit

- Er moet een **succespagina** verschijnen: "Profiel ontvangen" / "We nemen contact op" / niet meteen live.
- Geen rode foutmelding; geen console errors.

### 3.8 Backend verifiëren (als admin)

- Log in als admin of gebruik de API.
- **Lijst acteurs:** `GET /api/admin/actors` (of open de admin-pagina die deze aanroept). De nieuwe acteur moet in de lijst staan.
- **Detail:** open de **Actor Edit Modal** voor deze acteur. Controleer (alles handshake met signup):
  - **Identiteit:** voornaam, achternaam, e-mail, geslacht, land.
  - **Tagline & bio:** door acteur aangeleverd, zichtbaar in modal.
  - **Talen:** moedertaal en extra talen (uit `actor_languages`).
  - **Karakter:** tone_of_voice als labels (niet als ids).
  - **Levering:** delivery_days_min/max, cutoff_time (geen holiday in signup).
  - **Tarieven:** price_online, price_unpaid, price_ivr, price_live_regie; en `rates.GLOBAL` gevuld.
  - **Profielfoto (delivery photo):** photo_id → foto zichtbaar.
  - **Demo:** één demo met afspeelbare audio.
  - **Video(s):** indien ingevuld, actor_videos met url/naam/type.
  - **Status:** `pending`, **niet** `live`; **niet** zichtbaar op de publieke stemmenpagina.

### 3.9 Certificering

- [ ] Volledige signup-flow doorlopen als stemacteur (alle stappen + tagline, bio, foto, demo, optioneel video).
- [ ] Succespagina getoond, geen fouten in console.
- [ ] Nieuwe acteur zichtbaar in admin met alle ingevulde velden en status `pending`.
- [ ] Actor Edit Modal toont alle data correct (tagline, bio, talen, tonen, tarieven, foto, demo, video’s); geen holiday in signup.

---

## 4. Kort checklist

| Fase   | Actie |
|--------|--------|
| **Maken** | Signup: tagline, bio, profielfoto (delivery photo), demo, video(s); API + modal handshake; **geen** holiday-velden |
| **Pushen** | Version sync (3×) → `check:pre-vercel` → commit `vX.Y.Z: ...` → push |
| **Testen** | Als stemacteur: /account/signup → 5 stappen + tagline/bio/foto/demo/video → submit → succes; als admin: modal toont alles, status pending |

*"Alles door de acteur aangeleverd (tagline, bio, delivery photo, demo’s, video’s) – één handshake met de backend. Holiday niet in signup."* – Chris-Protocol
