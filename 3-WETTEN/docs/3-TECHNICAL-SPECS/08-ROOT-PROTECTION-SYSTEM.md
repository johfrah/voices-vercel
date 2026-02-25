# 🛡️ Root Protection System

## Overzicht

Dit systeem voorkomt dat bestanden per ongeluk in de root directory worden geplaatst die daar niet horen.

## Preventie Lagen

### 1. `.cursorignore`
- **Doel**: Voorkomt dat Cursor bestanden in root ziet/maakt
- **Werking**: Automatisch door Cursor gelezen
- **Bestand**: `.cursorignore` in root

### 2. `.gitignore`
- **Doel**: Voorkomt dat verboden bestanden worden gecommit
- **Werking**: Automatisch door Git gelezen
- **Bestand**: `.gitignore` in root

### 3. Git Pre-Commit Hook
- **Doel**: Blokkeert commits als root niet clean is
- **Werking**: Automatisch bij elke `git commit`
- **Installatie**: `bash 3-CURSOR-ONLY/scripts/core/maintenance/setup-root-protection.sh`

## Detectie & Cleanup

### Validator Script
```bash
php 3-CURSOR-ONLY/scripts/core/maintenance/validate-root-clean.php
```
- **Doel**: Controleert of root directory clean is
- **Exit code**: 0 = OK, 1 = Fouten gevonden
- **Output**: Lijst van verboden bestanden

### Auto Cleanup Script
```bash
# Preview (geen wijzigingen)
php 3-CURSOR-ONLY/scripts/core/maintenance/auto-cleanup-root.php --dry-run

# Automatisch fixen
php 3-CURSOR-ONLY/scripts/core/maintenance/auto-cleanup-root.php --auto-fix
```
- **Doel**: Detecteert en verplaatst automatisch verboden bestanden
- **Regels**:
  - `*.md` → `3-CURSOR-ONLY/docs/`
  - `*.php` (scripts) → `1-DEVELOPMENT/scripts/` of `3-CURSOR-ONLY/scripts/`
  - `*.py` → `1-DEVELOPMENT/scripts/` of `3-CURSOR-ONLY/scripts/`
  - `*.sh` → `1-DEVELOPMENT/scripts/` of `3-CURSOR-ONLY/scripts/`

## Wat gebeurt er als het toch gebeurt?

### Scenario 1: Bestand wordt gemaakt in root
1. **Git Pre-Commit Hook**: Blokkeert commit met foutmelding
2. **Oplossing**: Run `php 3-CURSOR-ONLY/scripts/core/maintenance/auto-cleanup-root.php --auto-fix`
3. **Resultaat**: Bestand wordt automatisch verplaatst naar juiste directory

### Scenario 2: Bestand wordt gecommit (hook overgeslagen)
1. **Detectie**: Validator script detecteert probleem
2. **Oplossing**: Run auto-cleanup script
3. **Preventie**: Fix hook om te voorkomen dat het opnieuw gebeurt

### Scenario 3: Bestand wordt handmatig geplaatst
1. **Detectie**: Validator script detecteert probleem
2. **Oplossing**: Run auto-cleanup script
3. **Resultaat**: Bestand wordt automatisch verplaatst

## VS Code Integration

Na setup zijn er 3 tasks beschikbaar:

1. **Validate Root Clean**
   - Controleert of root clean is
   - Toont fouten en waarschuwingen

2. **Auto Cleanup Root (Dry Run)**
   - Preview van wat er zou gebeuren
   - Geen wijzigingen

3. **Auto Cleanup Root (Fix)**
   - Automatisch verplaatsen van verboden bestanden
   - Directe actie

**Gebruik**: `Cmd+Shift+P` → `Tasks: Run Task` → Selecteer task

## Setup

```bash
# Volledige setup (hooks + VS Code tasks)
bash 3-CURSOR-ONLY/scripts/core/maintenance/setup-root-protection.sh

# Alleen validator testen
php 3-CURSOR-ONLY/scripts/core/maintenance/validate-root-clean.php

# Auto cleanup testen (preview)
php 3-CURSOR-ONLY/scripts/core/maintenance/auto-cleanup-root.php --dry-run
```

## Toegestane Bestanden in Root

- `package.json`, `package-lock.json` (Monorepo dependencies)
- `tsconfig.json` (TypeScript config)
- `.cursorrules`, `.cursorignore` (Cursor intelligence)
- `.gitignore` (Git protection)
- `README.md` (Project entry point)

## Verboden Bestanden in Root

- ❌ `*.md` → Moet in `3-CURSOR-ONLY/docs/`
- ❌ `*.php`, `*.py`, `*.sh` → Moet in `1-DEVELOPMENT/scripts/` of `3-CURSOR-ONLY/scripts/`
- ❌ `*.txt` → Moet in `3-CURSOR-ONLY/docs/`
- ❌ `*.sql`, `*.csv` → Moet in `4-OLD/4-DATA-AND-DUMPS/`
- ❌ `apps/`, `packages/`, `assets/` → Moeten in `1-DEVELOPMENT/` of `2-SERVER-READY/` staan.

## Troubleshooting

### Hook werkt niet
```bash
# Herinstalleer hook
bash 3-CURSOR-ONLY/scripts/core/maintenance/setup-root-protection.sh
```

### Auto cleanup werkt niet
```bash
# Check permissions
chmod +x 3-CURSOR-ONLY/scripts/core/maintenance/auto-cleanup-root.php

# Test met dry-run
php 3-CURSOR-ONLY/scripts/core/maintenance/auto-cleanup-root.php --dry-run
```

### Validator geeft false positives
- Check of bestand in `$allowed_files` lijst staat
- Check of bestand niet in `$ignore_files` lijst staat
- Update validator script indien nodig

## Best Practices

1. **Altijd validator runnen** voor grote wijzigingen
2. **Auto cleanup gebruiken** bij detectie van problemen
3. **Git hook actief houden** voor automatische bescherming
4. **VS Code tasks gebruiken** voor snelle checks
































