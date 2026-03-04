# Voices Go-Live Testplan

**Doel:** Volledig acceptatie- en testplan voor live-gang. Een cloud agent kan dit doorlopen, per item testen, afvinken en falen rapporteren.

**Omgeving:** Production of staging (Vercel). Voor betalingen: Mollie testmodus. Admin-toegang en testklant-account vereist.

**Conventie:** `[ ]` = nog niet getest, `[x]` = geslaagd, `[-]` = overgeslagen/n.v.t. Bij falen: noteer in kolom "Resultaat" de fout of referentie (API/console/URL).

---

### Instructie voor (cloud) agent

**Gebruik dit bestand uit de repo** — niet copy-pasten. Pad: `docs/GO-LIVE-TESTPLAN.md`.

- **Snelste run:** Voer alleen de 7 IDs uit de sectie "Snelste run" hieronder uit, in de aangegeven volgorde. Rapporteer per ID: geslaagd of gefaald; bij falen: korte reden (bijv. URL, API, console).
- **Volledige run:** Voer het hele plan uit (secties 1 t/m 8). Rapporteer welke IDs falen en waarom.

Stappen en verwachtingen per ID staan in de tabellen verderop in dit document.

---

## Snelste run (~15–30 min)

Als je maar kort tijd hebt of een eerste sanity-check wilt: doe **alleen** onderstaande IDs. De rest van het document is de volledige run.

| ID | Wat |
|----|-----|
| GEN-01 | Chat opent en reageert |
| GEN-05 | Mollie webhook na betaling |
| AGY-C-01 | Voice-over bestellen (cart → checkout → betaal) |
| AGY-A-04 | Order afronden + klant krijgt mail |
| STU-C-01 | Inschrijven voor workshop |
| STU-A-03 | Certificaten maken en downloaden |
| SEC-01 | Admin-routes alleen voor admin |

**Volgorde:** 1. GEN-01 → 2. AGY-C-01 + GEN-05 (één order) → 3. AGY-A-04 → 4. STU-C-01 → 5. STU-A-03 → 6. SEC-01.

---

## 1. Algemeen

### 1.1 Chat (Voicy)

| ID | Item | Stappen | Verwachting | Resultaat |
|----|------|--------|-------------|-----------|
| GEN-01 | Chat opent en reageert | 1. Ga naar een pagina met Voicy (bijv. agency). 2. Open chat. 3. Stel een vraag. | Chat opent; Voicy geeft een relevant antwoord. | |
| GEN-02 | Admin kan chat overnemen | 1. Start als bezoeker een gesprek. 2. Log in als admin, ga naar Live Chat / Mailbox. 3. Selecteer het gesprek en klik "Overnemen". 4. Stuur een bericht als admin. | Status wordt `admin_active`; Voicy antwoordt niet meer; klant ziet admin-bericht. | |
| GEN-03 | Gegevens worden goed gevraagd | 1. In chat: vraag naar een offerte of bestelling. 2. Volg de flow (e-mail, naam, briefing, etc.). | Vereiste velden worden gevraagd; geen hallucinatie van contactgegevens of prijzen (data uit config/DB). | |
| GEN-04 | Yuki-koppeling bij bestelling | 1. Plaats een testorder en betaal (Mollie sandbox). 2. Als admin: open orderdetail. 3. Voer "Yuki sync" uit (indien beschikbaar in UI). | Order toont Yuki factuur-ID of bevestiging; ordernote bevat sync-resultaat. | |

### 1.2 Betaling & notificaties

| ID | Item | Stappen | Verwachting | Resultaat |
|----|------|--------|-------------|-----------|
| GEN-05 | Mollie webhook na betaling | 1. Plaats order, start betaling, voltooi in Mollie testmodus. 2. Controleer orderstatus in admin. | Orderstatus wordt "paid" (of equivalent); Dropbox Exports-map aangemaakt voor order. | |
| GEN-06 | Muzieklevering na betaling (telefonie) | 1. Plaats een telefonie-order met muziek. 2. Betaal. | Muziekbestanden staan in Dropbox in order-Export map (bijv. `/music/`). | |
| GEN-07 | Admin-notificatie na betaling | 1. Voltooi een testbetaling. 2. Controleer admin-mail of Telegram. | Admin ontvangt notificatie (payment_received of sameday_alert) met order-ID en klantgegevens. | |
| GEN-08 | Versie / cache na deploy | 1. Voer deploy uit. 2. Open site (bijv. incognito), check `/api/admin/config` of versie in UI. | Versie in config/UI komt overeen met `package.json`; geen oude cached UI. | |
| GEN-09 | 404 / routing | 1. Bezoek hoofdpagina, studio, agency, checkout, account. 2. Bezoek een bekende content-URL uit slug_registry. | Geen 404 op deze URLs; ontbrekende slugs loggen in watchdog indien van toepassing. | |

---

## 2. Agency – Als klant

| ID | Item | Stappen | Verwachting | Resultaat |
|----|------|--------|-------------|-----------|
| AGY-C-01 | Voice-over bestellen | 1. Ga naar voice-over journey. 2. Kies stem, vul briefing, voeg toe aan winkelwagen. 3. Ga door checkout en betaal (test). | Order wordt aangemaakt; betaling loopt; order zichtbaar in account. | |
| AGY-C-02 | Telefoonbestanden bestellen met muziek | 1. Ga naar telefonie-journey. 2. Selecteer muziek (achtergrond/wachtmuziek). 3. Vul script, plaats order en betaal. | Order bevat telefonie + muziek; prijs inclusief muzieksurcharge; na betaling muziek in Export-map. | |
| AGY-C-03 | Verkoopprijs klopt overal | 1. Stel in configurator een voice-over of telefonie samen. 2. Vergelijk totaal in cart en op checkout (en eventueel in orderbevestiging). | Zelfde totaal in configurator, cart, checkout en order; geen afwijking. | |
| AGY-C-04 | Account bij bestelling | 1. Plaats order als gast (e-mail). 2. Controleer of er een account is aangemaakt of link om in te loggen. | Er wordt een account aangemaakt of klant kan bestelling volgen via link/account; order gekoppeld aan gebruiker. | |
| AGY-C-05 | Vorige bestellingen zien | 1. Log in als klant met bestaande orders. 2. Ga naar account / Mijn bestellingen. | Lijst van eigen orders; geen orders van andere gebruikers. | |
| AGY-C-06 | Project / backend contact | 1. Open een order (als klant). 2. Controleer of er een manier is om anoniem/veilig te communiceren over het project (mailbox, projectview). | Klant kan berichten zien/versturen over het project; alleen eigen projecten zichtbaar. | |
| AGY-C-07 | Download afgeleverde audio | 1. Als admin: rond een order af en koppel een delivery-file. 2. Log in als klant, open die order. | Op orderdetail staat een werkende "Download audio"-knop (deliveryFileUrl, deliveryStatus ready/approved). | |
| AGY-C-08 | Klant-goedkeuring audio | 1. Als klant: open order met geleverde audio. 2. Markeer indien mogelijk als goedgekeurd. | Goedkeuring wordt opgeslagen; status wordt gebruikt voor payout/afronding (waar van toepassing). | |

---

## 3. Agency – Als admin

| ID | Item | Stappen | Verwachting | Resultaat |
|----|------|--------|-------------|-----------|
| AGY-A-01 | Juiste mailtjes ontvangen | 1. Controleer of bij nieuwe order/chat/contact de juiste admin-mail(s) binnenkomen. | Admin ontvangt o.a. betalingsbevestiging, eventueel casting/contact; afzender en inhoud kloppen. | |
| AGY-A-02 | Bestelling naar actor op juiste aankoopprijs | 1. Open een betaalde voice-over order. 2. Stuur door naar actor (indien flow aanwezig); controleer getoonde aankoopprijs. | Actor krijgt opdracht/notificatie; aankoopprijs komt overeen met afspraak/DB. | |
| AGY-A-03 | Actor levert audio via site (Imports/Vault) | 1. Als actor of admin: upload geleverde audio voor een order. 2. Controleer waar het bestand terechtkomt (Vault, Dropbox Imports). | Bestand staat in de bedoelde map; admin kan het koppelen aan de order. | |
| AGY-A-04 | Order afronden en klantmail | 1. Koppel geleverde audio aan order; markeer als afgerond. 2. Controleer of klant een afrondingsmail ontvangt (en eventueel downloadlink). | Orderstatus wordt afgerond; klant krijgt mail met bevestiging en/of download. | |
| AGY-A-05 | Yuki sync handmatig | 1. Open een betaalde order. 2. Voer Yuki-sync uit. | Order toont Yuki factuur-ID; ordernote bevestigt sync. | |

---

## 4. Agency – Als actor (next-level)

| ID | Item | Stappen | Verwachting | Resultaat |
|----|------|--------|-------------|-----------|
| AGY-V-01 | Actor uploadt eigen audio (voice-over/commercial) | 1. Log in als actor (of via actor-portal). 2. Open toegewezen opdracht. 3. Upload afgeleverde audio. | Upload slaagt; bestand komt in de juiste map (Imports/Vault); admin kan order afronden zonder tussenstap. | |
| AGY-V-02 | Actor ziet alleen eigen projecten | 1. Log in als actor. 2. Open overzicht opdrachten/projecten. | Alleen aan deze actor toegewezen opdrachten zijn zichtbaar. | |

---

## 5. Studio – Als klant

| ID | Item | Stappen | Verwachting | Resultaat |
|----|------|--------|-------------|-----------|
| STU-C-01 | Inschrijven voor workshop | 1. Ga naar een workshop met beschikbare editie. 2. Vul inschrijfformulier in en betaal. | Inschrijving wordt opgeslagen; betaling verwerkt; bevestiging zichtbaar (mail of account). | |
| STU-C-02 | Inschrijven op "geïnteresseerd"-lijst | 1. Ga naar een workshop zonder (volgende) editie of klik "Meld je aan". 2. Vul gegevens in voor interesse. | Gegevens komen in workshop_interest of equivalent; bevestiging of bedankpagina. | |
| STU-C-03 | Workshoppagina's juist en volledig | 1. Bezoek meerdere workshoppagina's (verschillende workshops/edities). | Titel, beschrijving, datum, prijs, locatie, capaciteit en CTA kloppen; geen lege of gebroken secties. | |
| STU-C-04 | Beschikbare plaatsen (seats) | 1. Bekijk een workshop met beperkte capaciteit. 2. Controleer of "X plaatsen beschikbaar" / "Volzet" klopt (eventueel door inschrijvingen te tellen). | Aantal beschikbare plaatsen komt overeen met capaciteit minus bevestigde inschrijvingen; bij volzet geen boekbare optie. | |
| STU-C-05 | Mail bij inschrijving | 1. Schrijf in voor een workshop (of interesse). 2. Controleer mailbox. | Klant ontvangt bevestigingsmail met juiste gegevens (datum, workshop, eventueel betaling). | |

---

## 6. Studio – Als admin

| ID | Item | Stappen | Verwachting | Resultaat |
|----|------|--------|-------------|-----------|
| STU-A-01 | Deelnemer verplaatsen naar andere dag | 1. Ga naar studio-inschrijvingen of editie-detail. 2. Verplaats een deelnemer naar een andere editie/dag. | Deelnemer staat bij de nieuwe editie; oude editie toont geen dubbele inschrijving. | |
| STU-A-02 | Deelnemer verplaatsen zonder annulering | 1. Verplaats een deelnemer van dag A naar dag B (workshop niet geannuleerd). | Verplaatsing slaagt; capaciteit van beide edities klopt. | |
| STU-A-03 | Certificaten maken en downloaden | 1. Open editie met deelnemers. 2. Genereer certificaten (per deelnemer of bulk). 3. Download een certificaat-PDF. | Certificaat wordt gegenereerd; download levert een geldige PDF met naam/workshop/datum. | |
| STU-A-04 | Workshop annuleren – next steps | 1. Annuleer een workshop of editie. 2. Controleer of deelnemers een mail/bericht krijgen en of er terugbetaling of verplaatsingsoptie is. | Deelnemers worden geïnformeerd; gedocumenteerde next steps (mail, status, refund) kloppen. | |
| STU-A-05 | Workshop toevoegen | 1. Als admin: voeg een nieuwe workshop of editie toe (via beheer). 2. Controleer op de frontend. | Workshop/editie staat in Supabase en is zichtbaar op de site op de juiste plek. | |
| STU-A-06 | Workshopdata aanpassen vanaf frontend | 1. Pas vanaf admin-frontend workshopdata aan (datum, capaciteit, titel). 2. Vernieuw publieke workshoppagina of controleer DB. | Wijziging staat direct in Supabase; publieke pagina toont de nieuwe data. | |

---

## 7. Security & toegang

| ID | Item | Stappen | Verwachting | Resultaat |
|----|------|--------|-------------|-----------|
| SEC-01 | Admin-routes alleen voor admin | 1. Zonder inloggen: bezoek `/admin`, `/admin/orders`, `/admin/mailbox`. 2. Ingelogd als gewone klant: idem. | Geen toegang of redirect naar login; alleen admin ziet admin-pagina's. | |
| SEC-02 | Account/orders alleen eigen data | 1. Log in als klant A. 2. Probeer order van klant B te openen (via URL met ander order-ID). | Geen toegang of 403; klant ziet alleen eigen orders. | |
| SEC-03 | Actor ziet alleen eigen opdrachten | 1. Log in als actor (indien actor-portal bestaat). 2. Probeer order van andere actor te openen. | Alleen eigen opdrachten zichtbaar; geen toegang tot andere acteurs. | |

---

## 8. Multi-market (optioneel)

| ID | Item | Stappen | Verwachting | Resultaat |
|----|------|--------|-------------|-----------|
| MKT-01 | Prijzen/taal per markt | 1. Bezoek voices.be, voices.nl (of andere geconfigureerde markten). 2. Controleer prijzen, taal, contactgegevens. | Prijzen en teksten kloppen per market_code; geen hardcoded BE overal. | |

---

## Samenvatting voor cloud agent

- **Volg de secties in volgorde 1 → 8**, of per domein (Algemeen → Agency → Studio → Security).
- **Per rij:** voer de stappen uit, controleer de verwachting, vink `[ ]` af als `[x]` bij succes of noteer in "Resultaat" bij falen (bijv. "AGY-C-01: checkout 404").
- **Fix-indicator:** Noteer waar de fout zit (bijv. "API / Admin UI / DB / Mail").
- **Output:** Een rapport met: lijst geslaagde IDs, lijst gefaalde IDs + Resultaat-kolom, en eventueel overgeslagen items (`[-]`).

*Laatste update: Maart 2026. Bewaak tegen docs/1-MASTER-BLUEPRINTS en .cursorrules.*
```
