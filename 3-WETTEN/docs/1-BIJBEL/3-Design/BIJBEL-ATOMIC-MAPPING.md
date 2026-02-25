# BIJBEL: ATOMIC MAPPING & CATEGORIES (2026)

Dit document is de "Source of Truth" voor alle visuele en functionele categorieën binnen het Voices Platform. Consistentie is de wet.

## 📱 De Big 8 Hoofdcategorieën (Moby-Mandate)

Elke stemacteur en elke demo moet gematcht worden aan één van deze 8 categorieën. Dit zorgt voor een voorspelbare en snelle UX op mobile.

| ID | Label | Icon (Lucide) | Beschrijving |
| :--- | :--- | :--- | :--- |
| `tv` | TV | `Monitor` | High-impact commercials voor televisie. |
| `radio` | Radio | `Radio` | Audio-only spots voor radio en streaming. |
| `online` | Online | `Globe` | Social media ads, YouTube, webvideo. |
| `podcast` | Podcast | `Mic2` | Intro's, outro's en branded podcast content. |
| `telefonie` | Telefonie | `Phone` | IVR, keuzemenu's, on-hold berichten. |
| `corporate` | Corporate | `Building2` | Bedrijfsfilms, manifesten, interne communicatie. |
| `e-learning` | E-learning | `BookOpen` | Uitlegvideo's, online trainingen, tutorials. |
| `meditatie` | Meditatie | `Wind` | Mindfulness, Ademing-content, rustgevende audio. |

## 🎯 Journey Mapping (Live Pricing)

De frontpage en checkout gebruiken deze journeys om live prijzen te berekenen en de juiste context te tonen.

| Journey ID | Label | Icon | Gekoppelde Prijs |
| :--- | :--- | :--- | :--- |
| `telephony` | Telefonie | `Phone` | `price_ivr` |
| `video` | Video | `Video` | `starting_price` (Base) |
| `commercial` | Advertentie | `Megaphone` | `price_online` |

## ✨ Vibe Tags (Mark's Lexicon)

Tags die de emotionele laag van een stem omschrijven. Te gebruiken in bio's en filters.

- **Warm**: Zacht, omhullend, menselijk.
- **Zakelijk**: Autoriteit, helder, professioneel.
- **Fris**: Jong, energiek, modern.
- **Betrouwbaar**: Stabiel, rustig, overtuigend.
- **Stoer**: Rauw, krachtig, karaktervol.
- **Zacht**: Intiem, kwetsbaar, ademend.
- **Energiek**: Snel, vrolijk, activerend.
- **Naturel**: Ongepolijst, authentiek, "buurman/vrouw".

## 🛠️ Implementatie Wetten

1. **Icon Mandate**: Gebruik uitsluitend de Lucide icons zoals hierboven gedefinieerd met een `strokeWidth` van 1.5 (standaard) of 2 (actief).
2. **Zero Emoji Policy**: Geen emoji's in de UI-instrumenten voor categorieën.
3. **Automatisatie First**: Nieuwe demo's worden door de fabriek gehaald en automatisch gematcht op basis van titel-keywords (bijv. "IVR" -> `telefonie`).
4. **Haptic Feedback**: Elke interactie met een categorie of journey-keuze MOET een Sonic DNA click triggeren.

---
*Vastgelegd door Moby, in overleg met Mark en Bob - Februari 2026*
