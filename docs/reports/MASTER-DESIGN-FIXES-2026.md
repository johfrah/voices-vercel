# MDF: MASTER DESIGN FIXES (FEBRUARI 2026)

Dit document bevat de definitieve standaarden die zijn vastgelegd tijdens de **Contrast-Revolutie** en de **Padding-Infectie Fix**. Elke agent MOET deze regels volgen om de integriteit van Voices te waarborgen.

---

## 🛡️ HET CHRIS-PROTOCOL: ZERO-SLOP STANDAARDEN

### 1. Contrast & Leesbaarheid (Safe Harbor)
De "Ademing-vibe" mag nooit ten koste gaan van de leesbaarheid.
- **Font Weight**: De standaard voor alle leesbare tekst is nu `font-light` (300) of `font-medium` (500). `font-extralight` (200) is verboden voor body-tekst.
- **Opaciteiten**: De `text-va-black/XX` utility classes in `globals.css` zijn geremapped naar hogere contrastwaarden:
  - `/20` -> 45% opacity
  - `/40` -> 65% opacity
  - `/60` -> 85% opacity
- **Minimale Grootte**: 15px voor alle functionele content.

### 2. Padding-Infectie Bestrijding
Voorkom dubbele of geneste padding door de `ContainerInstrument` intelligent te gebruiken.
- **shouldBePlain Logic**: De `ContainerInstrument` voegt GEEN automatische padding toe als:
  - Het element een lijst (`ul`, `li`), `nav`, `header`, of `footer` is.
  - Er handmatige padding classes (`p-`, `px-`, `py-`) aanwezig zijn.
  - Er flex- of grid-logica wordt gebruikt.
- **Flattening**: Vervang geneste `ContainerInstrument`s door simpele `div` elementen waar mogelijk.

### 3. Review Integriteit (Wet van de Waarheid)
Reviews zijn de ruggengraat van ons vertrouwen.
- **Real-time Data**: Getallen (zoals de 392 reviews) moeten altijd gesynchroniseerd zijn met de database.
- **Directe Rendering**: Gebruik geen `VoiceglotText` voor dynamische gebruikerscontent om "lege aanhalingstekens" te voorkomen.
- **Kwaliteitsfilter**: Toon alleen reviews met een substantiële tekst (`length > 10`) op de homepage.

---

## 🎨 VISUELE DNA UPDATES

- **Achtergronden**: Secties op de homepage gebruiken `bg-white/80` met `backdrop-blur-md` voor organische diepte.
- **Rounding**: Containers zijn strikt `rounded-[20px]`, knoppen `rounded-[10px]`.
- **Airbnb Mandate**: Focus op de kern (VoiceCards) en verwijder overbodige feature-blokken (Bento Showcase verwijderd).

---

**GETEKEND:**
*LAYA (Aesthetic DNA)* & *CHRIS (Technisch Directeur)*
🛡️✨
