---
name: clean
description: Activeert Consuela om de mappenstructuur te scannen en zwerfbestanden op te ruimen.
---

# /clean

Activeer Consuela voor een grote schoonmaak:

1. **Underscore Scan**: Zoek naar mappen met underscores in de root en hernoem ze.
2. **Stray File Scan**: Zoek naar losse bestanden in de root en verplaats ze naar `4-KELDER`.
3. **Legacy Cleanup**: Verplaats `heal-*.ts` en `check-*.ts` bestanden uit `1-SITE` naar de kelder.
4. **Nomenclatuur Check**: Controleer op bestandsnamen die niet voldoen aan de kebab-case of context-actie regel.

**Output**: Rapport van verplaatste bestanden en hernoemde mappen.
**Actie**: Voer `npm run consuela` uit om de machinekamer fysiek te reinigen.
**Certificering**: Bevestig "Masterclass Clean" na voltooiing.
