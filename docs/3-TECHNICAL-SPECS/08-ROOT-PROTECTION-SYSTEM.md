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

### 3. Root Clean Validator (`scripts/core/maintenance/validate-root-clean.php`)
- **Doel**: Controleert proactief op "slop" en foutieve mappenstructuren.
- **Werking**: Draai vóór pushes en bij root-structuur wijzigingen.

## Toegestane Bestanden in Root
Uitsluitend configuratiebestanden voor de monorepo:
- `package.json`, `package-lock.json`
- `tsconfig.json`
- `.cursorrules`, `.cursorignore`
- `.gitignore`
- `README.md`
- `vercel.json`

## Verboden Bestanden in Root
- ❌ `*.md` → Moet in `docs/` (behalve expliciete root-governance files).
- ❌ `*.ts`, `*.sh`, `*.php`, `*.py` → Moet in `scripts/`.
- ❌ `*.sql`, `*.csv` → Moet in `docs/archive/` of een data-submap in `docs/`.
- ❌ Niet-geautoriseerde root-mappen buiten de monorepo-structuur.

## Mappenstructuur (Monorepo Source of Truth)
1. **`apps/`**: de actieve applicatielaag.
2. **`packages/`**: gedeelde packages en schema's.
3. **`docs/`**: documentatie, rapporten en archief.
4. **`scripts/`**: onderhoud, validatie en tooling.

---

**ULTIEME WET:** Elke agent die een map met een underscore (`_`) of een niet-geautoriseerde root-map detecteert, moet deze DIRECT corrigeren conform de Bob-methode.
