---
name: financial-orchestrator
description: Manages the complete financial flow, including Mollie payments, Yuki sync, Ponto payouts, and VAT verification. Consolidates 10+ API routes and services.
---

# FINANCIAL ORCHESTRATOR SUPER-SKILL

Deze skill beheert de volledige geldstroom en financiële integriteit van Voices.

## 💳 Core Workflows

### 1. Payment & Checkout
Beheer de interactie met Mollie en de Slimme Kassa:
- **Mollie Sync**: `apps/web/src/lib/payments/mollie.ts`
- **Checkout Logic**: `apps/web/src/lib/checkout/checkout-service.ts`
- **Webhook Handling**: `apps/web/src/app/api/checkout/webhook/route.ts`

### 2. Accounting & Invoicing
Synchroniseer met Yuki en beheer facturatie:
- **Yuki Sync**: `apps/web/src/lib/commerce/invoice-service.ts`
- **Financial Sync**: `apps/web/src/lib/commerce/financial-sync-engine.ts`
- **VAT Verification**: `apps/web/src/lib/compliance/vat-service.ts` (VIES API)

### 3. Payouts & Partners
Beheer uitbetalingen aan talenten en partners via Ponto:
- **Ponto Bridge**: `apps/web/src/lib/payments/ponto-bridge.ts`
- **Payout Readiness**: `apps/web/src/lib/services/payout-readiness-service.ts`

## 📜 Verplichte Richtlijnen
- **Excl. BTW**: Bedragen in dashboards en rapportages zijn ALTIJD exclusief BTW.
- **Cents Only**: Gebruik uitsluitend Integers (centen) voor berekeningen om float-errors te voorkomen.
- **Legal Veracity**: Elke transactie moet voldoen aan de juridische kaders van Lex.
- Managed by **KELLY (Kassa)** and **LEX (Legal)**.
