# ☢️ Platform Integrity Report (2026)

Dit rapport bevat de resterende **Hybrid Slop** en ontbrekende handshakes op het Voices-platform, gebaseerd op de audit van 25 februari 2026.

## 🎙️ Actors: Missing Photo Handshake (0 stemmen)
Alle live stemmen hebben nu een `photo_id` gekoppeld.

## 🎧 Workshops: Missing Media Handshake (2 workshops)
Deze workshops hebben nog geen gekoppelde asset in de `media` tabel.

| ID | Titel | Status |
| :--- | :--- | :--- |
| 275901 | Voices Academy | 🚩 No Media ID |
| 272907 | Workshop op maat | 🚩 No Media ID |

## 📧 Actors: Missing Email (1 record)
| ID | Naam | Type Vermoeden |
| :--- | :--- | :--- |
| 1758 | Jose | 🎙️ Actor (Status: pending) |

---
**Actieplan**: 
1. Voor de overige (niet-live) stemmen moeten we bepalen of de foto's in Storage staan.
2. De "nep-actors" (muziek/workshops) zijn verwijderd of gearchiveerd.
3. De workshop "Presenteren in de camera" is nu volledig Handshake-compliant.
