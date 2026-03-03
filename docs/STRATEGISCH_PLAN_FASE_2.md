# 📝 Freedom Machine: Fase 2 Strategisch Plan (HITL & Agents)

Dit document bevat het gedetailleerde ontwerp voor de functionele diepgang van het Voices Dashboard, ter nazicht door de Directie.

---

## 1. 🏭 Content Conversie (MARK & LOUIS)
Agent **MARK** heeft de `4-KELDER` geïnventariseerd. Er liggen 60+ bestanden klaar.
- **Workflow**: We gebruiken de `/admin/nuclear` (in dev) om ruwe Markdown te zuiveren naar **Natural Capitalization**.
- **Louis Check**: Automatische matching van beelden uit de asset-database bij elk artikel.
- **Backlog**: Zie `3-WETTEN/docs/CONTENT_CONVERSION_BACKLOG.md`.

## 2. 🎙️ HITL Voice-over Workflow (`/admin/orders`)
De productielijn wordt ingericht met een strikt **Human-in-the-loop** protocol, met een voorbereiding op volledige autonomie.

### De Fasen (Nu: HITL)
1.  **Order Ontvangst**: Kelly bevestigt betaling -> Order verschijnt in `/admin/orders`.
2.  **Briefing Validatie (HITL)**: Admin klikt op `[Valideer Briefing]`. Pas daarna gaat de automatische mail naar de acteur.
3.  **Opname Upload**: Acteur uploadt audio naar de Vault.
4.  **Kwaliteitscontrole (HITL)**: Admin beluistert audio in de browser. Chris geeft een AI-advies (bijv. "Luidheid OK, 48kHz OK").
5.  **Release**: Admin klikt op `[Release naar Klant]`.

### De "Nuclear Switch" (Toekomst)
In `/admin/settings` komt een toggle: **"Enable Autonomous Production"**.
- **OFF**: Elke stap vereist een admin-klik (huidige status).
- **ON**: Systeem slaat stap 2 en 4 over bij orders onder een bepaald bedrag of bij vertrouwde acteurs.

## 3. 🧠 Agent & Prompt Control Center (`/admin/agents`)
Een dashboard om de "hersenen" van de Freedom Machine te beheren zonder code-updates.

- **Prompt Registry**: Een tabel `agent_prompts` in Supabase.
- **Live Editing**: Pas de instructies van **VOICY**, **CHRIS**, of **MOBY** direct aan in de admin.
- **Versioning**: "Rollback" naar een vorige versie als een agent begint te 'hallucineren'.
- **Sandbox**: Een intern chatvenster om de nieuwe prompt te testen met dummy-data voordat deze live gaat voor klanten.

## 4. 🛡️ God Mode v3: "The Safe Founder" (HITL Intelligence)
De volgende stap in de evolutie van het Dashboard, met de focus op **Safe Intelligence**.

### A. De "Morning Brief" (Email Edition)
Geen video, maar een vlijmscherpe tekst-mail elke ochtend om 07:00.
- **Revenue Forecast**: Passieve voorspelling van de maandomzet (alleen kijken, niet aankomen).
- **Burning Leads**: Top 3 leads met de hoogste intentie-score.
- **Watchdog Status**: "Alle systemen ademen normaal" of actie-punten.

### B. Felix Safe Mode (Approval Queue)
Felix (de Fixer) werkt proactief maar nooit autonoom.
- **Anomaly Detection**: Felix vindt fouten (BTW, corrupte assets, dubbele data).
- **Approval Queue**: Felix zet een herstelvoorstel klaar in de `/admin/approvals`.
- **HITL Fix**: Jij klikt op `[Approve]` of `[Reject]`. Pas na akkoord voert Felix de reparatie uit.

### C. Founder's Command (Cmd+K Text)
Tekst-gestuurde acties via de Spotlight bar.
- **Input**: `johfrah vakantie tot maandag`.
- **Feedback**: Voicy vraagt bevestiging: *"Ik heb de vakantie klaargezet. Zal ik ook de 3 open orders updaten? [Ja] [Nee]"*.

## 5. 🗺️ Journey Orchestrator (`/admin/journeys`)
Visuele controle over de "Theater-ervaring".
- **DNA Schakelaars**: Per journey (Agency, Artist, Portfolio) bepalen welke UI-instrumenten zichtbaar zijn.
- **Context Injection**: Beheer de `_llm_context` die Suzy gebruikt voor SEO en LLM-readability.

## 6. 🔍 Spotlight 2.0 (Universal Search)
De CMD+K interface krijgt een database-koppeling.
- **Zoekopdrachten**: "Order #12345", "Acteur Mark", "Klant Jansen".
- **Resultaat**: Directe navigatie naar de data-entiteit in plaats van alleen de pagina.

---

### ✅ Actiepunten voor de Admin
- [x] Goedkeuring op "Safe Mode" God Mode v3 plan.
- [ ] Start aanmaak `agent_prompts` database tabel.
- [ ] Implementatie HITL knoppen in de Order-interface.
- [ ] Inrichting Felix Approval Queue UI.

*Opgesteld door Agent MARK onder directie van Backend Bob op 18 februari 2026.*
