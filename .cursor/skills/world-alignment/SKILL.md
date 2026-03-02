---
name: world-alignment
description: Aligns and synchronizes content, articles, and categories across the 9 Worlds (Agency, Studio, Ademing, etc.). Consolidates alignment and assignment scripts.
---

# WORLD ALIGNMENT SUPER-SKILL

Deze skill zorgt dat alle content en entiteiten in de juiste World en Journey staan.

## 🌍 Core Workflows

### 1. Entity Assignment
Wijs entiteiten toe aan de juiste World:
- **Assign World**: `npx tsx 3-WETTEN/scripts/assign-world.ts`
- **Align Studio**: `npx tsx 3-WETTEN/scripts/align-studio-world.ts`

### 2. Content & Article Alignment
Zorg dat artikelen en content-blocks synchroon lopen met de World-ID:
- **Agency Articles**: `npx tsx 3-WETTEN/scripts/align-agency-articles.ts`
- **Studio Alignment**: `npx tsx 3-WETTEN/scripts/align-studio-world.ts`

### 3. Category & Taxonomy Validation
Controleer of categorieën correct zijn toegewezen:
- **Workshop Categories**: `npx tsx 3-WETTEN/scripts/academy/verify-workshop-categories.ts`
- **Past Workshops**: `npx tsx 3-WETTEN/scripts/academy/verify-past-workshops.ts`

## 📜 Verplichte Richtlijnen
- **ID-First**: Gebruik altijd de officiële `world_id` uit de `slug_registry`.
- **Trinity Compliance**: Elke wijziging moet voldoen aan de World > Market > Journey hiërarchie.
- Managed by **BOB (Grand Visionary)**.
