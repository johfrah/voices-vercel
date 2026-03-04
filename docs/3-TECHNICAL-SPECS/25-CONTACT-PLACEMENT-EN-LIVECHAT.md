# Contact: plaatsing en livechat

**Vraag:** Waar staat Contact, werkt het contactformulier in de livechat, en is het world-aware?

---

## 1. Waar staat Contact?

| Plek | Type | Gedrag |
|------|------|--------|
| **GlobalNav** (header links) | Link in nav-config | Klik opent **chat met Mail-tab** (geen navigatie naar /contact) |
| **GlobalNav** (dropdown Support) | Item onderaan menu | Opent chat met Mail-tab |
| **Layout** (Portfolio footer) | `Link href="/contact"` | Navigeert naar /contact |
| **Layout** (Portfolio custom footer) | Link Contact | Navigeert naar /contact |
| **Footer per world** | Agency, Studio, Academy, Portfolio, Artist | Elk: "Contact" of mailto + link naar /contact waar van toepassing |
| **Studio** | `/studio/contact` | Eigen contactpagina (Studio-specifieke tekst, e-mail, telefoon) |
| **Portfolio footer** | "Direct contact" | Link naar /contact of mailto |
| **SmartRouter / slug** | Content met link | VoicesLink href="/contact" |
| **TopBar** | Mail- en Bel-icoon | Openen chat met tab Mail resp. Bel |
| **Account/mailbox** | "Hulp nodig?" | Link naar /agency/contact |

De **nav-Contact** (header) opent dus overal de **chatsectie Mail**; footers en andere plekken blijven vaak naar `/contact` of `mailto:${activeEmail}` linken.

---

## 2. Contactformulier in de livechat

- **Beschikbaar:** Ja. Tab **Mail** in Voicy Chat toont formulier (e-mail + bericht).
- **Werkt:** Submit → POST `/api/mailbox/contact` → lead in `central_leads`, conversatie in `chat_conversations`, bericht in `chat_messages`. Admin ziet het in de mailbox.
- **World-aware:** Ja. De chat stuurt in de context mee:
  - `journey`: `'academy' | 'studio' | 'portfolio' | 'agency'` (afgeleid van pathname)
  - `market_code`: uit `MarketManager.getCurrentMarket()`
  - `current_page`: actuele pathname

De API gebruikt `context.journey` voor de conversatie (default `'agency'`), zodat de mailbox per world/journey kan filteren.

---

## 3. Bron van waarheid voor contactgegevens

- **E-mail / telefoon per world:** `market.email`, `market.phone` (MarketManager / market config).
- **Chat:** gebruikt `activeEmail = market.email` en `activePhone = market.phone` voor de Bel-tab en context.
- **Footers:** krijgen `activeEmail` / `activePhone` uit layout/GlobalFooter (marketConfig of market).

Contact staat dus op veel plekken (nav, footer per world, studio-pagina, account), maar de **livechat-contact (Mail-tab)** is één plek, werkt, en is world-aware via journey + market_code + current_page in de API.
