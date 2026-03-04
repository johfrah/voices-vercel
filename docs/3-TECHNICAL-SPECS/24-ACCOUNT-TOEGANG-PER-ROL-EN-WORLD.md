# Account-toegang per rol en World

Overzicht: **welke soorten gebruikers** toegang hebben tot **welk account/dashboard** in welk **World**, en **wat ze daar kunnen zien of doen**.

---

## 1. Gebruikersrollen (bron: `users` tabel + auth)

| Rol / type        | `users.role`     | `users.subroles` (optioneel) | Toelichting |
|-------------------|------------------|------------------------------|-------------|
| **Gast**          | `guest` (default)| —                             | Niet ingelogd; kan wel castings indienen, chatten, checkout als gast. |
| **Klant**        | `guest` of niet gezet | —                        | Ingelogde klant zonder speciale rol. |
| **Partner**      | `partner`        | —                             | Pro voice actor; ziet Partner-dashboard en eigen “winkel”. |
| **Admin**        | `admin`          | —                             | Volledige admin; Directiekamer + alle Worlds. |
| **Superadmin**   | `superadmin`     | —                             | Gelijk aan admin (o.a. `isAdminUser`, AuthContext). |
| **Ademing-beheerder** | `ademing_admin` | —                      | Admin voor Ademing World; toegang tot `/admin/ademing` en admin-API’s. |
| **Academy-student**   | (ongewijzigd)   | `['academy_student']`         | Toegang tot Academy-lessen; geen apart account-“World”. |

**Auth-bron:** `server-auth.ts`, `api-auth.ts`, `AuthContext.tsx`, `SecurityService` (academy).

---

## 2. Zones: waar heeft wie een “account”?

Er zijn **vier zones** waar iemand “ingelogd” iets kan zien of doen. World bepaalt vooral binnen **Admin** wat zichtbaar is; bij Account/Partner gaat het om rol, niet om World.

| Zone | Pad(en) | Wie heeft toegang | Werkt op / geldt voor |
|------|---------|-------------------|------------------------|
| **Persoonlijke loge (klant)** | `/account`, `/account/orders`, `/account/favorites`, `/account/settings`, `/account/mailbox` | Iedereen met een sessie (Supabase Auth + user in `users`) | Alle markten; geen World-filter. Klant ziet eigen orders, favorieten, profiel, **notificaties** (één lijst, niet per World). |
| **Partner-dashboard** | `/account/partner` | `role === 'partner'` of admin (API: `requirePartner()`) | World 8 (Partner) / stemacteur-etalage. Pagina zelf heeft geen server-side role-check; partner-API’s wel. |
| **Directiekamer (Admin)** | `/admin`, `/admin/dashboard`, `/admin/orders`, … | `role === 'admin' | 'superadmin' | 'ademing_admin'` (server: `requireAdminRedirect()`; API: `requireAdmin()`) | **World-gefilterd:** dashboard kan `?world=all|studio|academy|…` tonen; sommige items alleen voor bepaalde Worlds. |
| **Backstage (Backoffice)** | `/backoffice`, `/backoffice/dashboard`, `/backoffice/media` | Zelfde als Admin (`isAdminUser()`); redirect naar `/studio` indien geen admin | Operationeel (o.a. media); geen aparte World-logica in dit overzicht. |
| **Ademing Admin** | `/admin/ademing` | `admin` \| `superadmin` \| `ademing_admin` (client-side check op `users.role`) | Alleen World 6 (Ademing); beheer meditatietracks. |

---

## 3. Per zone: wat kan je zien of doen?

### 3.1 Persoonlijke loge (`/account`)

- **Toegang:** Elke ingelogde gebruiker. Geen login → `AccountDashboardClient` toont `LoginPageClient`.
- **World:** Niet World-gebonden; één klantaccount over alle markten.
- **Zichtbaar/doen:**
  - Dashboard: welkomstblok, “Mijn winkel”-link (alleen als partner of admin), notificaties, orders, profiel, veiligheid.
  - **Orders** (`/account/orders`): eigen bestellingen, status, factuur/factuur volgt.
  - **Favorieten** (`/account/favorites`): opgeslagen stemmen.
  - **Instellingen** (`/account/settings`): profiel, taal, (als partner/admin) projecten/rating, (als admin) Agency Workspace, (als klant) beperkt klantprofiel.
  - **Notificaties** (`/account/mailbox`): meldingen over projecten en bestellingen (één lijst per gebruiker, **niet per World opgesplitst**); niet ingelogd → redirect naar login.

### 3.2 Partner-dashboard (`/account/partner`)

- **Toegang:** In de UI: link in nav alleen als `role === 'partner'` of admin. API’s: `requirePartner()` (partner of admin).
- **World:** Conceptueel Partner World (8); geen aparte “World-account”-pagina.
- **Zichtbaar/doen:** Partner-overzicht, campagnes, affiliate-links, (toekomst) actieve projecten, levering, inkomsten. “Mijn winkel” in hoofddashboard wijst naar partner-etalage.

### 3.3 Directiekamer Admin (`/admin`)

- **Toegang:** Alleen als `admin`, `superadmin` of `ademing_admin` (layout: `requireAdminRedirect()`).
- **World:** Dashboard en menu zijn **World-aware** via `?world=all|studio|academy|…` en `world_scopes` op items.
- **Zichtbaar/doen (samenvatting):**
  - **world_scopes: `["all"]`** (alle Worlds): Bestellingen, Wachtende acties, Mailbox, Live stemmen, Financiën, Gebruikers, Instellingen, Navigatie, System logs, AI-instellingen.
  - **world_scopes: `["all", "studio"]`** (alleen bij world=all of studio): Studio interesse (funnel), Studio inschrijvingen.
  - Filter op World: o.a. `pathHintForWorld` (studio → `/studio/`, academy → `/academy/`, …). Layout kan via `app_configs.admin_dashboard_layout_v2` items verbergen of hernoemen.

### 3.4 Backoffice (`/backoffice`)

- **Toegang:** Zelfde als admin (`isAdminUser()`); anders redirect naar `/studio`.
- **World:** Niet expliciet per World; operationeel (o.a. media, dashboard).

### 3.5 Ademing Admin (`/admin/ademing`)

- **Toegang:** `admin`, `superadmin` of `ademing_admin` (client-side role-check; ongeautoriseerd → redirect `/`).
- **World:** Alleen Ademing (World 6).
- **Zichtbaar/doen:** Beheer Ademing-tracks (upload, bewerken, zoeken, grid/table).

---

## 4. World ↔ “account” in één plaatje

- **Geen account (gast):** Geen `/account` of `/admin`; wel publieke site (alle Worlds), castings, chat, checkout als gast.
- **Klant (ingelogd):** Account in **alle** Worlds dezelfde: één Persoonlijke loge (orders, favorieten, settings, notificaties). Geen “je zit in World X dus ander account”.
- **Partner:** Zelfde account + Partner-dashboard; conceptueel bij World 8.
- **Admin/Superadmin:** Eén admin-zone; **binnen** die zone filter op World (dashboard-items, paden).
- **Ademing_admin:** Binnen admin, specifiek toegang tot Ademing-beheer (World 6).
- **Academy-student (subrol):** Geen extra “account-World”; wel toegang tot Academy-lessen (SecurityService: `academy_student` of admin).

---

## 5. Technische referentie

| Check | Waar |
|-------|------|
| Admin (server) | `server-auth.ts`: `isAdminUser()` → `admin` \| `superadmin` \| `ademing_admin` |
| Admin (API)   | `api-auth.ts`: `checkIsAdmin()` → idem + optioneel `ADMIN_EMAIL` |
| Partner (API) | `api-auth.ts`: `checkIsPartner()` → `partner` of admin |
| Client isAdmin | `AuthContext.tsx`: `role === 'admin' \|\| role === 'superadmin'` alleen. **Let op:** `ademing_admin` is server-side wél admin (layout/API) maar krijgt in de client `isAdmin === false`; sommige client-UI (Command Palette, admin-tab in chat) blijft daardoor verborgen voor ademing_admin. |
| Academy-les   | `security-service.ts`: `role === 'admin'` of `ADMIN_EMAIL` of `subroles.includes('academy_student')` |
| Dashboard World-filter | `api/admin/dashboard/overview/route.ts`: `world_scopes`, `isVisibleForWorld()`, `requestedWorldCode` |
| Users schema   | `users.role`, `users.subroles` (o.a. `academy_student`) |

---

## 6. Kort antwoord op “wie heeft toegang tot een account in welke World?”

- **Account (Persoonlijke loge):** Elke ingelogde gebruiker; **niet** per World gesplitst.
- **Notificaties:** Eén lijst per gebruiker; we delen **niet** op per World. (Optioneel later: `world_id` op notificaties voor filter/label, bv. “Studio: inschrijving bevestigd”.)
- **Partner-dashboard:** Alleen `partner` (en admin); hoort bij Partner World (8).
- **Admin:** Alleen admin/superadmin/ademing_admin; **binnen** admin kun je per World filteren (welke items/menu’s je ziet).
- **Ademing Admin:** Zelfde rollen; specifiek voor World 6 (Ademing).
- **Academy:** Toegang tot lessen via subrol `academy_student` (of admin); geen apart “account per World”.

Daarmee is de toegang gemapt op rol + zone; World bepaalt vooral de **admin-interface** (welke onderdelen) en de **content-context** (Ademing, Studio, Academy), niet verschillende "soorten" klantaccounts per World.

---

## 7. Briefing voor cloud agent (atomic rules)

Gebruik deze sectie als **single source of truth** voor een cloud agent die toegang, redirects of UI moet implementeren of valideren.

### Rollen (users.role + subroles)

- **Admin-rechten (server + API):** `role` ∈ `{ admin, superadmin, ademing_admin }`. Bron: `server-auth.isAdminUser()`, `api-auth.checkIsAdmin()`.
- **Admin-rechten (client `isAdmin`):** alleen `role` ∈ `{ admin, superadmin }`. Bron: `AuthContext`. Voor `ademing_admin`: server/admin-pagina’s wel, client-only admin-UI mogelijk niet.
- **Partner-rechten:** `role === 'partner'` of admin. API: `requirePartner()`; UI: nav-link Partner alleen als partner of admin.
- **Academy-les toegang:** `role === 'admin'` of `ADMIN_EMAIL` of `subroles` bevat `academy_student`. Bron: `security-service.checkAccess()`.

### Zones en toegangsregels

| Zone | Toegang | Implementatie |
|------|---------|----------------|
| `/account/*` | Elke ingelogde user (Supabase Auth + users). Geen login → toon login (client). | Geen server layout-guard; `AccountDashboardClient` en bv. `account/mailbox` doen client-side redirect of tonen login. |
| `/account/partner` | Partner of admin. | Geen server guard op de pagina; partner-API’s gebruiken `requirePartner()`. Nav toont link alleen bij partner of admin. |
| `/admin/*` | Admin/superadmin/ademing_admin. | Layout: `requireAdminRedirect()` (server). API’s: `requireAdmin()`. |
| `/admin/ademing` | Zelfde als admin. | Client-side role-check; redirect naar `/` indien niet geautoriseerd. |
| `/backoffice/*` | Zelfde als admin. | Per page: `getServerUser()` + `isAdminUser(user)`; anders `redirect('/studio')`. |

### World (alleen in Admin)

- Dashboard-items: `world_scopes` in `api/admin/dashboard/overview/route.ts` (`ACCESS_ITEM_DEFINITIONS`). `isVisibleForWorld(scopes, worldCode)`: toon als `"all" ∈ scopes` of `worldCode === "all"` of `worldCode ∈ scopes`.
- Studio-specifieke items: `world_scopes: ["all", "studio"]`. Alleen zichtbaar bij `?world=all` of `?world=studio`.

### Wat NIET doen

- Geen hardcoded e-mails voor admin; gebruik `users.role` of (alleen waar bestaand) `ADMIN_EMAIL` uit env.
- Account niet per World splitsen: één account voor alle markten; World-filter alleen in admin-dashboard.
- Partner-pagina niet alleen op client vertrouwen: alle partner-API’s moeten `requirePartner()` gebruiken.
