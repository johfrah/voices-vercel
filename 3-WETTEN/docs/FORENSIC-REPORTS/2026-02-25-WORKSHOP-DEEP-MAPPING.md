# 🎓 Workshop Forensic Mapping: De "Deep Interest" Handshake (V2)

Je hebt gelijk: een workshop-order is veel rijker dan een simpele verkoop. Het is een journey die vaak begint in de `workshop_interest` tabel en eindigt in de `workshop_editions` tabel. In de **Bob-methode** mappen we deze volledige biografie atoom-zuiver.

## 1. De "Deep Interest" Koppeling
We koppelen de order niet alleen aan een user, maar trekken de volledige voorgeschiedenis uit de `workshop_interest` tabel erbij op basis van de **atomaire email-handshake**.

| Gegeven | Bron: `workshop_interest` | Waarom in V2? |
| :--- | :--- | :--- |
| **Beroep** | `profession` | Voor de docent (Berny) om de groepssamenstelling te kennen. |
| **Ervaring** | `experience` | Om het niveau van de workshop (beginner/pro) te bewaken. |
| **Doel** | `goal` | De persoonlijke motivatie van de deelnemer. |
| **Stem-sample** | `sample` | De "auditie" die voorafging aan de inschrijving. |

## 2. De "Edition" Waarheid (Wanneer & Waar)
In plaats van een datum als tekst in de order te zetten, koppelen we de order aan een specifieke **Editie**.

| Atomaire Kolom | Bron: `workshop_editions` | Status |
| :--- | :--- | :--- |
| **Datum & Tijd** | `date` | ✅ **Nuclear**. Geen tekst ("14/03"), maar een ISO-timestamp. |
| **Locatie** | `location_id` | ✅ **Nuclear**. Koppeling naar de `locations` tabel (Studio). |
| **Docent** | `instructor_id` | ✅ **Nuclear**. Koppeling naar de `instructors` tabel (Berny/Johfrah). |

## 3. Voorbeeld: De "Ann van Loon" Reconstructie (Order #6828)
Dit is hoe we een echte workshop-order uit je database atoom-zuiver mappen:

### 🔴 Legacy (Verspreide Data)
- **Order:** #6828 (BE-275955)
- **User:** Ann van Loon (`ann.vanloon@vai.be`)
- **Item:** "Perfectie van intonatie"

### 🟢 Nuclear V2 (De Gekoppelde Waarheid)
1.  **Order** → `orders_v2.id`
2.  **User** → `users.id` (Ann)
3.  **Interest Trace** → `workshop_interest.id: 794`
    - *Beroep:* "Digital content producer"
    - *Ervaring:* "Nee, geen ervaring"
    - *Doel:* "Verbeteren van uitspraak, ademhaling en intonatie."
4.  **Edition Trace** → `workshop_editions.id` (De specifieke dag in de Studio).

---

## 🎭 Sjareltje's Conclusie
De `workshops` tabel is inderdaad al keurig gemapt, maar de échte kracht zit in de **dwarsverbindingen**. In V2 wordt een workshop-order een knooppunt tussen:
*   **De Klant** (User DNA)
*   **De Intentie** (Workshop Interest)
*   **De Uitvoering** (Workshop Edition)

**Zal ik deze "Deep Interest" koppelingen nu definitief verankeren in de migratie-logica?** Dan is Berny's dashboard voor de Studio straks 100% compleet. 🚀🤝🎓
