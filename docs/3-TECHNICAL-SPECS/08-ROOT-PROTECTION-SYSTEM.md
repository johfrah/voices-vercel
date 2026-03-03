# 🛡️ Root Protection System (2026)

## Overzicht
Dit systeem voorkomt dat bestanden per ongeluk in de root directory worden geplaatst die daar niet horen, conform de **Bob-methode**.

## Preventie Lagen

### 1. `.cursorignore`
- **Doel**: Voorkomt dat Cursor bestanden in root ziet/maakt.
- **Bestand**: `.cursorignore` in root.

### 2. `.gitignore`
- **Doel**: Voorkomt dat verboden bestanden worden gecommit.
- **Bestand**: `.gitignore` in root.

### 3. Forensic Audit (`3-WETTEN/scripts/forensic-audit.ts`)
- **Doel**: Controleert proactief op "slop" en foutieve mappenstructuren.
- **Werking**: Wordt gedraaid vóór elke push.

## Toegestane Bestanden in Root
Uitsluitend configuratiebestanden voor de monorepo:
- `package.json`, `package-lock.json`
- `tsconfig.json`
- `.cursorrules`, `.cursorignore`
- `.gitignore`
- `README.md`
- `vercel.json`

## Verboden Bestanden in Root
- ❌ `*.md` → Moet in `3-WETTEN/docs/`
- ❌ `*.ts`, `*.sh` → Moet in `3-WETTEN/scripts/`
- ❌ `*.sql`, `*.csv` → Moet in `4-KELDER/`
- ❌ `apps/`, `packages/`, `assets/` → Moeten in `1-SITE/` staan.

## Mappenstructuur (De Gouden Drie-Eenheid)
1. **`1-SITE/`**: De actieve etalage en motor (Next.js, Drizzle, Assets).
2. **`3-WETTEN/`**: De controlekamer (Scripts, Docs, Wetten).
3. **`4-KELDER/`**: Het archief (Legacy code, Grondstoffen).

---

**ULTIEME WET:** Elke agent die een map met een underscore (`_`) of een niet-geautoriseerde root-map detecteert, moet deze DIRECT corrigeren conform de Bob-methode.
