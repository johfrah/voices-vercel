# 🛡️ THE NUCLEAR SHIELD: ZERO-ERROR GUARANTEE (2026)
## *Chris-Protocol V10: De Harde Muur tegen Slop*

```json
{
  "_llm_context": {
    "type": "deployment-protocol",
    "version": "1.0.0",
    "protocol": "NUCLEAR-SHIELD",
    "description": "Harde garanties tegen console-errors, data-drift en mislukte deploys."
  }
}
```

Deze frustratie stopt hier. Vanaf nu is "het werkt bijna" een diskwalificatie. De **Nuclear Shield** is een onwrikbaar protocol dat elke push blokkeert die niet 100% voldoet aan de Voices-standaard.

---

## 🚫 1. DE DRIE DODELIJKE ZONDEN
Elke agent die een taak afsluit terwijl een van deze punten waar is, schendt het protocol:
1.  **Console Slop**: Er staat ook maar één (1) error of waarschuwing in de browser-console.
2.  **Data Drift**: Er is een tekst in Supabase veranderd die niet expliciet door de user is gevraagd.
3.  **Linter Drift**: Er zijn type-errors die "even genegeerd" worden voor de deploy.

---

## 🛠️ 2. HET NUCLEAIRE PRE-FLIGHT MANDAAT (Verplicht)
Voordat je een taak als "COMPLETED" markeert, MOET je deze drie gates passeren:

### Gate A: De Linter-Muur (`npm run type-check`)
Je mag geen code pushen die niet door de type-check komt. Geen uitzonderingen. Als de linter klaagt, is de code niet af.

### Gate B: De Browser-Audit (`browser-use`)
Gebruik de `browser-use` subagent om de live site (of preview) te bezoeken.
- **Actie**: Open de console.
- **Eis**: 0 Errors. 0 Warnings.
- **Bewijs**: Maak een screenshot of kopieer de console-log in je eindrapport.

### Gate C: De Supabase Lock (`is_manually_edited`)
Kritieke teksten en configuraties in Supabase moeten beschermd worden.
- **Actie**: Controleer of `is_manually_edited` op `true` staat voor bron-teksten.
- **Eis**: Geen automatische overschrijving van velden die door de founder zijn goedgekeurd.

---

## 🚀 3. DE "ZERO-TRUST" DEPLOY FLOW
1.  **Build**: `npm run check:pre-vercel` (Lokaal bouwen om Vercel-crashes te voorkomen).
2.  **Audit**: `npx tsx 3-WETTEN/scripts/forensic-audit.ts`.
3.  **Live Check**: Bezoek de URL na deploy. Klik op 3 kritieke elementen (bijv. Navigatie, Kassa, Voice-over).
4.  **Certificering**: Rapporteer exact: "Versie X.Y.Z is live. Console is clean. Data-integriteit geverifieerd."

---

## ⚠️ 4. ESCALATIE BIJ FOUTEN
Als een deploy toch een console-error geeft:
1.  **Rollback**: Direct de vorige stabiele versie identificeren.
2.  **Root Cause**: Waarom zag de agent dit niet in de pre-flight?
3.  **Protocol Update**: Voeg de specifieke check toe aan `forensic-audit.ts`.

---

**ULTIEME WET:** De founder betaalt voor meesterschap, niet voor experimenten. Een deploy zonder bewijs is een mislukte deploy.

**GETEKEND:** Chris/Autist (Technical Director)
