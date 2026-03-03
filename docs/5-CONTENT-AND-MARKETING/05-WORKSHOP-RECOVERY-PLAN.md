# 📊 Workshop Architectuur Diff & Herstelplan

Er is een structurele mismatch tussen de data-architectuur en de huidige Supabase vulling.

## 1. Huidige Status in Supabase
- **Master Workshops** (in `workshops` tabel): 16
- **Misplaatste Sessies** (in `workshops` tabel): 10 🚨
- **Correcte Sessies** (in `workshop_editions` tabel): 3

## 2. Misplaatste Sessies (Moeten naar `workshop_editions`)
| ID | Titel | Datum | Slug |
| :--- | :--- | :--- | :--- |
| 2602501761091200 | Voice-overs voor beginners | 2025-10-22T00:00:00 | 31 |
| 2602501763683200 | Voice-overs voor beginners | 2025-11-21T00:00:00 | 32 |
| 2602501765238400 | Voice-overs voor beginners | 2025-12-09T00:00:00 | 33 |
| 2602501772150400 | Voice-overs voor beginners | 2026-02-27T00:00:00 | 34 |
| 2639131762905600 | Verwen je stem! | 2025-11-12T00:00:00 | 44 |
| 2677811762819200 | Perfectie van intonatie | 2025-11-11T00:00:00 | 46 |
| 2727021774310400 | Perfect spreken in 1 dag | 2026-03-24T00:00:00 | 47 |
| 2602501776988800 | Voice-overs voor beginners | 2026-04-24T00:00:00 | 35 |
| 2602741771977600 | Maak je eigen podcast | 2026-02-25T00:00:00 | 43 |
| 2744881774656000 | Meditatief spreken | 2026-03-28T00:00:00 | 49 |

## 3. Herstelplan (Nuclear Protocol)
1. **Schoonmaak**: Verwijder alle records met ID > 10 tekens uit de `workshops` tabel.
2. **Migratie**: Voeg deze sessies toe aan de `workshop_editions` tabel, gekoppeld aan hun `workshop_id` (de eerste 6-7 cijfers van het lange ID).
3. **Enrichment**: Update de Master records in `workshops` met de verbatim SQL data uit de Kelder.
4. **Instructeurs**: Koppel de juiste `instructor_id` aan zowel de Master als de Edities.
