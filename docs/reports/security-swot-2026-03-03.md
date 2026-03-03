# 🛡️ SECURITY SWOT — Van W/O/T naar Strengths (2026-03-03)

## 1) Context (huidige waarheid)

- Security Center is nu centraal beschikbaar via API (`/api/admin/security/center`) met settings + audit-score.
- Middleware forceert security headers, bot-blocking en hotlink-protectie.
- Forensic audit baseline is nog niet groen en release-gate `check:pre-vercel` heeft een padfout.

---

## 2) SWOT (Security)

### ✅ Strengths (bestaand)
1. **Centrale Security Registry actief**
   - Eén key (`security_settings`) met typed settings + audit engine + runtime policy.
2. **Actieve edge-bescherming**
   - Bot user-agents worden geblokkeerd (403), hotlinking heeft beschermde asset-prefixes.
3. **Defensieve response headers**
   - `x-frame-options`, `nosniff`, `referrer-policy`, `permissions-policy`, HSTS.
4. **Observability-first**
   - Watchdog/signalering zit in de veiligheidsflow.

### ⚠️ Weaknesses
1. **CSP staat nog op report-only**
   - Nog geen volledige enforce-mode.
2. **Auto-login bridge staat nog aan**
   - Legacy admin bridge blijft een extra aanvalsoppervlak.
3. **Forensic baseline nog rood**
   - Veel warnings/legacy slop, beperkt “clean release confidence”.
4. **Pre-vercel gatekeeper script-path is stuk**
   - Hierdoor kan preflight als mandatory shield niet volledig afdwingen.

### 🚀 Opportunities
1. **Progressive hardening zonder big-bang**
   - Security Center laat je instellingen gefaseerd aanscherpen per markt/journey.
2. **Policy-as-code voor admin**
   - MFA/bridge/CSP kunnen als beheerde flags naar strengere defaults.
3. **Meetbare security maturity**
   - Score + checks vormen een continue KPI richting “green-only deploy”.

### ⛔ Threats
1. **AI scraping & geautomatiseerde bots**
2. **Credential/session abuse via legacy paden**
3. **Configuratie-drift tussen runtime, docs en scripts**
4. **Operationele regressie door onvolledige gates**

---

## 3) Van W/O/T naar Strengths (transformatieplan)

## A) Weakness → Strength

1. **W: CSP report-only**  
   **→ S: Enforced CSP met exceptions-registry**
   - Actie:
     1. CSP-violations 7 dagen loggen.
     2. Toegestane bronnen expliciet whitelisten.
     3. `csp_mode: enforce` per markt inschakelen.
   - Resultaat: sterke XSS-mitigatie in productie.

2. **W: Auto-login bridge enabled**  
   **→ S: Zero-trust admin toegang**
   - Actie:
     1. Bridge beperken tot allowlist IP/window.
     2. Expiry + one-time token policy afdwingen.
     3. Finale stap: bridge standaard uit (`false`) en alleen break-glass flow.
   - Resultaat: admin-toegang wordt voorspelbaar, auditbaar en minimaal.

3. **W: Forensic audit rood**  
   **→ S: Green baseline as release contract**
   - Actie:
     1. Hard errors eerst op 0 brengen.
     2. Warnings burn-down op vaste sprintquota.
     3. “No green, no deploy” hard maken.
   - Resultaat: security wordt release-gated i.p.v. best-effort.

4. **W: check:pre-vercel script-path stuk**  
   **→ S: Betrouwbare preflight governance**
   - Actie:
     1. Script-pad fixen naar monorepo-compatibele route.
     2. CI step verplicht maken op elke push.
     3. Build + audit + smoke tests koppelen.
   - Resultaat: deployment shield is opnieuw afdwingbaar.

## B) Opportunity → Strength

1. **O: Progressive hardening**  
   **→ S: Security Posture Ladder (L1→L4)**
   - L1: headers + bot block (nu)
   - L2: enforced CSP + strict cookies
   - L3: admin zero-trust + anomaly response
   - L4: continuous auto-remediation

2. **O: Policy-as-code**  
   **→ S: Single source of security truth**
   - Elke kritieke instelling loopt via `security_settings`.
   - Geen verspreide hardcodes in losse endpoints.

3. **O: Maturity score**  
   **→ S: Board-level security KPI**
   - Security score en checks rapporteren per release.
   - Trendline op weekbasis i.p.v. incident-gedreven sturen.

## C) Threat → Strength

1. **T: AI scraping**  
   **→ S: Active bot defense**
   - UA-lijst onderhouden + block telemetry + automated watchlist updates.

2. **T: Session abuse**  
   **→ S: Controlled admin boundary**
   - Bridge afbouwen, MFA verplicht op gevoelige acties, trusted cookie policy aanscherpen.

3. **T: Drift**  
   **→ S: Monorepo truth discipline**
   - Script/document paths uniformeren en bij elke release valideren.

4. **T: Regressie door ontbrekende gates**  
   **→ S: Immutable release gates**
   - `build + type-check + pre-vercel + forensic + smoke` als vaste keten.

---

## 4) 30-60-90 uitvoering

### 30 dagen (stabiliseren)
- Fix `check:pre-vercel` pad.
- Elimineer huidige hard errors uit forensic audit.
- Admin bridge beperken met expiry + allowlist.

### 60 dagen (hardenen)
- CSP naar enforce voor low-risk paden.
- Warnings 40% reduceren.
- Security score target: **90+**.

### 90 dagen (verankeren)
- Bridge standaard uit.
- “Green-only deploy” contract in CI.
- Security KPI opnemen in release report.

---

## 5) Definitie van “veilig genoeg om te schalen”

Je bent schaalbaar veilig als:
1. Criticals/hard errors = 0
2. Release gates altijd groen
3. Admin toegang is zero-trust
4. CSP enforced op productie
5. Security score stabiel ≥ 90
