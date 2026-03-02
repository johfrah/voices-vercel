---
name: aesthetic-audit
description: Voert een volledige esthetische audit uit op een component of pagina volgens de Laya-normen.
---

# /aesthetic-audit

Voer een audit uit op de geselecteerde code of het huidige bestand:

1. **HTML Zero Check**: Zoek naar verboden tags (`div`, `span`, `p`, `h1-h6`).
2. **Instrument Suffix**: Controleer of alle UI componenten in `src/components/ui/` eindigen op `Instrument`.
3. **Tailwind Discipline**: Controleer op inline styles of rauwe CSS.
4. **Voiceglot Check**: Zoek naar hardcoded strings die vertaald moeten worden.
5. **Liquid DNA**: Beoordeel of de "Island filosofie" en "Natural Capitalization" worden toegepast.

**Output**: Een lijst met "Splinters" (fouten) en een plan voor de "Masterclass Fix".
