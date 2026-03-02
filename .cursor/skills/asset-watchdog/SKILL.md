---
name: asset-watchdog
description: Synchronizes local Dropbox assets with online Supabase Storage. Based on the legacy asset-watchdog.ts.
---

# ASSET WATCHDOG SKILL

Deze skill zorgt dat Dropbox (lokaal) en Supabase (online) synchroon lopen.

## 🛠️ Workflow
1. **Watch**: Monitort de map `1-SITE/assets` op wijzigingen.
2. **Cleanse**: Opschonen van paden (geen spaties/accenten) conform Supabase eisen.
3. **Sync**: Uploadt nieuwe of gewijzigde assets naar de `voices` bucket.
4. **Safety**: Verwijderingen worden alleen gelogd, niet automatisch uitgevoerd op Supabase.

## 🚀 Execution
Run via terminal:
```bash
npx tsx 3-WETTEN/scripts/asset-watchdog.ts
```

## 📜 Verplichte Richtlijnen
- Volg strikt `400-CONSUELA-CLEANLINESS.mdc` voor naamgeving.
- Gebruik uitsluitend de `voices` bucket.
