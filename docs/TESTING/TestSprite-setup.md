# TestSprite MCP – Setup voor Voices

TestSprite is een MCP (Model Context Protocol) testserver die in Cursor draait: je vraagt in gewone taal om tests, en TestSprite genereert en voert UI- en API-tests uit (inclusief self-healing en rapporten).

## 1. TestSprite MCP installeren in Cursor

### API-key

1. Maak een [gratis TestSprite-account](https://www.testsprite.com/auth/cognito/sign-up) aan.
2. Ga in het [TestSprite Dashboard](https://www.testsprite.com/dashboard) naar **Settings → API Keys**.
3. Maak een **New API Key** aan en kopieer die.

### Cursor: één-klik installatie

1. Open **Cursor Settings** (⌘⇧J) → **Tools & Integration** → **Add custom MCP** (of gebruik de [one-click install link](cursor://anysphere.cursor-deeplink/mcp/install?name=TestSprite&config=eyJjb21tYW5kIjoibnB4IEB0ZXN0c3ByaXRlL3Rlc3RzcHJpdGUtbWNwQGxhdGVzdCIsImVudiI6eyJBUElfS0VZIjoiIn19) en vul daarna je API key in).
2. Vul bij de MCP-server je **API_KEY** in.

### Cursor: handmatige configuratie

In **Cursor Settings → Tools & Integration → MCP** voeg je toe:

```json
{
  "mcpServers": {
    "TestSprite": {
      "command": "npx",
      "args": ["@testsprite/testsprite-mcp@latest"],
      "env": {
        "API_KEY": "jouw-testsprite-api-key"
      }
    }
  }
}
```

Vervang `jouw-testsprite-api-key` door je echte key.

### Sandbox-modus (belangrijk)

Voor volledige TestSprite-functionaliteit in Cursor:

1. **Chat → Auto-Run → Auto-Run Mode** zetten op **Ask Every time** of **Run Everything** (niet alleen sandbox).
2. Controleer dat de TestSprite MCP-server een groen bolletje heeft en de tools geladen zijn.

---

## 2. Voorbereiden van het Voices-project

### App moet op localhost draaien (verplicht)

**De te testen app (Voices) moet tijdens de TestSprite-run op localhost bereikbaar zijn.** TestSprite opent en bezoekt je app op de opgegeven Frontend URL; als de server niet draait, kunnen de tests niet slagen.

Start de Next.js-app lokaal (standaard poort 3000):

```bash
npm run dev
```

Daarna is de app bereikbaar op **http://localhost:3000**. In het TestSprite-configuratiescherm vul je bij **Frontend URL** exact dit adres in: `http://localhost:3000`.

Vanuit de repo-root: `npm run dev` (start `apps/web` op port 3000).

### PRD / Product Specification (voor TestSprite)

TestSprite vraagt bij de eerste run om een **PRD** of product specification. Je kunt gebruiken:

- **`docs/TESTING/TestSprite-Product-Specification.md`** – volledig Product Specification Document (doel, persona’s, functionele/niet-functionele eisen, flows, acceptatiecriteria). **Aanbevolen voor TestSprite.**
- **`docs/TESTING/TestSprite-PRD-draft.md`** – korte draft (Worlds, flows, techniek). Upload één van deze bestanden in de TestSprite-configuratiestap.

Als je een uitgebreidere PRD hebt (bijv. in `docs/`), kun je die in plaats daarvan uploaden.

### Optioneel: test-account

Als je flows wilt testen die inloggen vereisen (bijv. `/account`, `/admin`), heb je testcredentials nodig. Vul die in het TestSprite-configuratiescherm in wanneer daarom gevraagd wordt (bijv. e-mail + wachtwoord).

---

## 3. De “magic command” uitvoeren

1. Open een **nieuwe chat** in Cursor.
2. Typ (of iets in die trant):

   **“Help me test this project with TestSprite.”**  
   of: **“Can you test this project with TestSprite?”**

3. Druk op **⇧ Enter** (of start de chat).
4. Eventueel: sleep de projectmap (of alleen `apps/web`) in de chat als je een specifiek deel wilt testen.

De AI-assistent gebruikt dan de TestSprite MCP-tools en begeleidt je door de stappen.

---

## 4. Configuratie in de browser

Na de magic command opent TestSprite een **Testing Configuration**-pagina in de browser. Vul in:

| Veld | Voor Voices (voorbeeld) |
|------|-------------------------|
| **Testing type** | Frontend (UI/flows) en/of Backend (API’s), afhankelijk van wat je wilt testen. |
| **Scope** | **Codebase** (eerste keer of volledige sweep) of **Code Diff** (alleen recente wijzigingen). |
| **Frontend URL** | `http://localhost:3000` |
| **Backend URL** | (optioneel) bijv. `http://localhost:3000` (Next.js API routes) of leeg als je alleen frontend test. |
| **Test credentials** | Alleen als je login-flows test (zie hierboven). |
| **PRD** | Upload `docs/TESTING/TestSprite-Product-Specification.md` (aanbevolen) of `docs/TESTING/TestSprite-PRD-draft.md`. |

Daarna volgt de automatische workflow: bootstrap → analyse → testplan → uitvoering → rapport.

---

## 5. Alleen frontend testen (TestSprite MCP)

Om **uitsluitend frontend/UI** te testen met de TestSprite MCP engine:

1. **Zorg dat de app draait:** `npm run dev` → [http://localhost:3000](http://localhost:3000).
2. **Open een nieuwe Cursor-chat** en plak deze prompt (of gebruik de TestSprite-tool als die wordt aangeboden):

   ```
   Please conduct frontend testing with the TestSprite MCP engine. Test the UI and user flows at http://localhost:3000. Use Frontend mode and the Product Specification at docs/TESTING/TestSprite-Product-Specification.md.
   ```

3. In het **Testing Configuration**-scherm (browser):
   - **Mode:** Frontend  
   - **Scope:** Codebase (of Code Diff voor alleen wijzigingen)  
   - **Frontend URL:** `http://localhost:3000`  
   - **Backend URL:** leeg laten (of `http://localhost:3000` als je ook API-routes wilt meenemen)  
   - **PRD:** upload `docs/TESTING/TestSprite-Product-Specification.md` (of `TestSprite-PRD-draft.md`)

4. Bevestig/start de run; TestSprite genereert en voert de UI-tests uit en levert een rapport in `testsprite_tests/`.

---

## 6. Resultaten

Na de run vind je o.a. in je project:

- **`testsprite_tests/`** – o.a. `TestSprite_MCP_Test_Report.md`, `.html`, en gegenereerde testcases (bijv. `.py`).
- Rapport met o.a. pass rate, coverage, gefaalde tests en aanbevelingen.

Daarna kun je bijvoorbeeld vragen: **“Please fix the codebase based on TestSprite testing results.”** om gerichte fixes te laten voorstellen en (indien mogelijk) toe te passen.

---

## Handige links

- [TestSprite MCP – First test](https://testspriteinc.mintlify.app/mcp/getting-started/first-test)
- [TestSprite MCP – Installation](https://testspriteinc.mintlify.app/mcp/getting-started/installation)
- [TestSprite – MCP Testing Server](https://www.testsprite.com/use-cases/en/mcp-testing-server)
