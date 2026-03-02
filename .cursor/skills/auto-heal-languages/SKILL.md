---
name: auto-heal-languages
description: Automatically heals and migrates language relations for actors in Supabase. Based on auto-heal-languages.ts.
---

# AUTO-HEAL LANGUAGES SKILL

This skill migrates legacy language strings to structured relations in the database.

## 🛠️ Workflow
1. **Taxonomy Scan**: Fetches all languages from the `languages` table.
2. **Actor Audit**: Identifies live actors with legacy `native_lang` strings.
3. **Healing**: Maps strings (e.g., "Vlaams") to ISO codes (e.g., "nl-be") and creates `actor_languages` relations.
4. **Sync**: Updates the `actors` table with the correct ISO code.

## 🚀 Execution
Run via terminal:
```bash
npx tsx 3-WETTEN/scripts/auto-heal-languages.ts
```

## 📜 Verplichte Richtlijnen
- Follow `100-ATOMIC-TRINITY.mdc` for ISO-5 compliance.
- Managed by **LANNY (Translation Master)**.
