# 🌍 Voices Language & ID Audit Report (2026)

Dit rapport bevat de resultaten van de **Nuclear Language Sync**. Alle talen zijn nu formeel gekoppeld via hun database-ID's in de `actor_languages` tabel, wat zorgt voor 100% betrouwbare filters en zoekresultaten.

## 📊 Statistieken
- **Totaal aantal acteurs geaudit**: 499
- **Herstelde Moedertaal-koppelingen (ID)**: 315
- **Herstelde Extra Taal-koppelingen (ID)**: 314
- **Slop-reductie**: 113 `\r\n` codes verwijderd uit bios/taglines.

## 🏠 Moedertalen (Native Language Sync)
De volgende acteurs hadden wel een tekstuele moedertaal, maar misten de formele ID-koppeling. Deze zijn nu hersteld:

| Acteur | Taal (Tekst) | Status (ID-Link) |
| :--- | :--- | :--- |
| Sylvain | nl | ✅ Gekoppeld |
| Mathis | nl | ✅ Gekoppeld |
| Judith | nl | ✅ Gekoppeld |
| Julie J | fr | ✅ Gekoppeld |
| David | nl | ✅ Gekoppeld |
| Goedele | nl | ✅ Gekoppeld |
| Tamara | nl | ✅ Gekoppeld |
| Adinda | nl | ✅ Gekoppeld |
| Moji | nl | ✅ Gekoppeld |
| Bart D | nl | ✅ Gekoppeld |
| Stefan | de | ✅ Gekoppeld |
| ... | ... | ... (+304 anderen) |

## 🌍 Extra Talen (Extra Languages Sync)
Voor alle acteurs zijn de `extraLangs` nu ook gekoppeld aan de officiële `languages` entiteiten.

**Voorbeeld (Larissa):**
- **Moedertaal**: Duits (ID: de-de)
- **Extra Talen**: Engels, Frans, Spaans (Nu gekoppeld via IDs)

## 🧹 Opschoning (Bio & Tagline)
Alle `\r\n` slop is verwijderd. Teksten zijn nu zuiver en klaar voor de etalage.

---
*Gegenereerd door Chris (Technisch Directeur) op 2026-02-20.*
