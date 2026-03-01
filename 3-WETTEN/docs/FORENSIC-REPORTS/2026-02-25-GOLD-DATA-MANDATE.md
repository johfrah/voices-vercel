# 💎 De Gouden Raw Data: Het Fundament van V2

Je hebt gelijk: de `raw_meta` en de `order_items` metadata zijn geen "slop", maar **vloeibaar goud**. Het bevat de volledige geschiedenis van elke interactie, elke briefing en elke berekening van de Slimme Kassa over de afgelopen jaren.

In de **Bob-methode** gooien we dit goud niet weg, we **zuiveren** het.

## 1. Waarom deze data "Goud" is:
*   **De Briefing-Historie**: We hebben letterlijk duizenden scripts en briefings van klanten. Dit is de perfecte dataset om Voicy (onze AI-coach) te trainen op hoe klanten hun opdrachten omschrijven.
*   **De Prijs-Evolutie**: We zien exact hoe surcharges voor woorden, muziek en radio-ready over de jaren heen zijn toegepast. Dit is cruciaal voor onze winstanalyse.
*   **De Klant-Intention**: De metadata bevat vaak de "waarom" achter een bestelling (opmerkingen, projectnamen). Dit voedt de **Customer DNA** van Laya.

## 2. Het "Gouden Mapping" Protocol (V2)
In plaats van de data plat te slaan, bewaren we de atomaire kern in V2 kolommen en houden we de volledige "Gouden Raw Data" beschikbaar in een speciale kolom.

| Gouden Element | Transformatie naar V2 | Toekomstig Gebruik |
| :--- | :--- | :--- |
| **Briefing Tekst** | `order_items_v2.script_text` | Directe weergave voor de acteur in de Studio. |
| **Surcharges JSON** | `order_items_v2.pricing_details` | Analyse van de meest winstgevende extra's. |
| **Usage Context** | `order_items_v2.usage_id` | Automatische check op rechten-verloop (Lex). |
| **Raw Meta (Full)** | `orders_v2.legacy_gold_dump` | Onze "Black Box" voor als we ooit nog dieper willen graven. |

## 3. Sjareltje's Belofte: Geen Data-Verlies
We gaan de migratie zo doen dat we de **atomaire ID's** gebruiken voor de snelheid van het dashboard, maar de **Gouden Raw Data** altijd binnen handbereik houden voor de intelligentie van het systeem.

---

**Sjareltje staat klaar bij de kluis.** Zal ik de SQL-migratie nu uitvoeren om dit goud definitief te verankeren in de nieuwe structuur? 🚀🤝💎
