# 🧪 Dry-Run Rapport: Metadata Verscheidenheid (200 Orders)

**Datum**: 2/25/2026, 4:44:17 PM
**Totaal gescand**: 200 random orders

## 🏗️ Structuur Analyse
*   **Nieuw Systeem (JSON-first)**: 1
*   **Legacy WP Meta (Flat keys)**: 199

## 🎭 Journey Verdeling
*   **agency**: 193
*   **studio**: 5
*   **unknown**: 2

## 💎 Speciale Data Punten
*   **Orders met Coupons/Korting**: 0
*   **Studio/Workshop gerelateerd**: 5
*   **Agency/Voice-over gerelateerd**: 194
*   **Marketing (UTM) Attributie**: 4

## 🔍 Gedetecteerde Sleutel-variaties
*   **Financieel**: _order_total, _order_tax, total, pricing
*   **Marketing**: _utm_source

## ⚠️ Observaties Sjareltje
*   **Legacy Slop**: Er is een grote groep orders met platte `_billing_...` keys. Deze moeten we anders mappen dan de nieuwe JSON orders.
*   **Marketing Goud**: UTM data is aanwezig maar inconsistent opgeslagen (soms met underscore, soms zonder).
