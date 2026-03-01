# 🔒 Legacy Order Lock: De Onveranderlijkheid van het Verleden

In de **Bob-methode** is het verleden heilig. We gaan **NOOIT** prijzen uit het legacy-systeem (WooCommerce/V1) herberekenen of wijzigen. Wat betaald is, is betaald. Wat gefactureerd is, staat vast.

## 🛡️ Het Legacy-Lock Protocol

1.  **Read-Only Mandate**: De oude `orders` tabel wordt behandeld als een historisch archief. We lezen de data uit voor het dashboard, maar we voeren geen nieuwe berekeningen uit op deze records.
2.  **Snapshot Integriteit**: De prijzen die in de `raw_meta` van de legacy orders staan, zijn de "Source of Truth" voor die specifieke transacties. Zelfs als de Slimme Kassa V2 nu een andere prijs zou berekenen voor dezelfde acteur, raakt dit de oude order niet.
3.  **Geen Retroactieve Wijzigingen**: 
    *   Nieuwe `usage_id`'s worden alleen toegepast op nieuwe orders (V2).
    *   Oude orders behouden hun originele tekstuele metadata (bijv. "Usage: Radio 1 jaar") om de audit-trail met de oude facturen intact te houden.

## 🏗️ De Architectuur van de Twee Werelden

| Kenmerk | Legacy Orders (V1) | Nuclear Orders (V2) |
| :--- | :--- | :--- |
| **Status** | **Bevroren Archief** | **Levend Systeem** |
| **Prijzen** | Originele WP-prijzen (Onveranderlijk) | Slimme Kassa V2 (Real-time) |
| **Data Structuur** | JSON Slop (Legacy Meta) | ID-First (1 Truth) |
| **Berekening** | Geen (Statische weergave) | Dynamisch & Valideerbaar |

---

## 🎭 Sjareltje's Belofte
We bouwen een **Bridge**, geen tunnel. Het dashboard laat beide werelden zien, maar de logica die de prijzen berekent, raakt alleen de nieuwe orders. Je historische winstmarges, omzetcijfers en facturen blijven tot op de cent nauwkeurig zoals ze waren.

**Zal ik de SQL-migratie nu starten met dit "Legacy Lock" principe als fundament?** We bouwen de toekomst, zonder het verleden te beschadigen. 🚀🤝
