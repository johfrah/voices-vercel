---
name: system-watchdog
description: Deep system monitoring and self-healing. Tracks 404s, broken assets, SSL status, and triggers Telegram alerts.
---

# SYSTEM WATCHDOG SUPER-SKILL

Deze skill maakt het ecosysteem "Self-Aware" en "Self-Healing".

## 🛰️ Core Workflows

### 1. Health Monitoring
Monitor de vitale functies van de machine:
- **Server Watchdog**: `apps/web/src/lib/services/server-watchdog.ts`
- **404 Tracking**: `apps/web/src/app/api/watchdog/404/route.ts`
- **Broken Assets**: `apps/web/src/app/api/watchdog/broken-asset/route.ts`

### 2. Alerting & Communication
Breng de Harmonieraad op de hoogte van afwijkingen:
- **Telegram Service**: `apps/web/src/lib/services/telegram-service.ts`
- **Push Service**: `apps/web/src/lib/services/push-service.ts`

### 3. Self-Healing
Herstel bekende fouten automatisch:
- **Repair API**: `apps/web/src/app/api/admin/system/repair/route.ts`
- **Cache Manager**: `apps/web/src/lib/system/cache-manager.ts`

## 📜 Verplichte Richtlijnen
- **Nuclear Pulse**: Elke kritieke error moet binnen 10 seconden gelogd zijn in `system_events`.
- **Zero Drift**: Gebruik de `log-explorer` skill voor diepe analyse.
- Managed by **FELIX (Fixer)** and **ANNA (Stage Manager)**.
