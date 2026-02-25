# Supabase Security Remediation – Voices.be

**Report:** 08 Feb 2026 | **Project:** Voices.be (vcbxyyjsxuquytcsskpj)

---

## Overzicht

| Issue | Level | Actie |
|-------|-------|-------|
| extension_in_public (vector) | WARN | Dashboard / SQL |
| auth_leaked_password_protection | WARN | Dashboard |
| rls_disabled_in_public (40 tables) | ERROR | Migratie (zie hieronder) |
| sensitive_columns_exposed (users.iban, voicejar_events.session_id) | ERROR | Opgelost via RLS |

---

## 1. RLS + Extension (atomisch uitgevoerd)

**Status:** Uitvoeren via `npm run db:security-remediation` (of handmatig in SQL Editor)

De atomische migratie in `supabase/migrations/20260211000000_security_remediation_atomic.sql` bevat:
- Vector extension verplaatsen naar schema `extensions`
- RLS inschakelen op alle 55+ tabellen
- Users-policy voor AuthContext

### Uitvoeren

1. Zorg dat `DATABASE_URL` (Supabase Postgres connection string) staat in `apps/web/.env.local`
2. Run: `npm run db:security-remediation` vanuit projectroot
3. Of handmatig: [Supabase SQL Editor](https://supabase.com/dashboard/project/vcbxyyjsxuquytcsskpj/sql) → plak inhoud van `supabase/migrations/20260211000000_security_remediation_atomic.sql`

### Impact

- **AuthContext** haalt `role` via `supabase.from('users').select('role')` – daar is een RLS-policy voor (eigen rij op basis van `email = auth.jwt().email`)
- **Drizzle / server** gebruikt directe Postgres (DATABASE_URL) en bypassed RLS, dus geen impact op bestaande API-routes

---

## 2. Vector extension buiten public (extension_in_public)

**Supabase docs:** https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public

**Prioriteit:** Laag (WARN). De `vector`-extension staat in `public`; best practice is verplaatsen naar `extensions`.

`mail_content.embedding` gebruikt het `vector`-type. Na verplaatsing blijft het type werken, maar test mailbox/semantic-search na uitvoering.

### SQL uitvoeren in SQL Editor

```sql
-- 1. Extensions-schema aanmaken
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Vector extension verplaatsen (bestaat al in public)
ALTER EXTENSION vector SET SCHEMA extensions;

-- 3. Search path aanpassen zodat vector() beschikbaar blijft (optioneel)
ALTER DATABASE postgres SET search_path TO public, extensions;
```

**Test na uitvoering:** Mailbox semantische zoekfunctie in de app.

---

## 3. Leaked Password Protection (auth_leaked_password_protection)

**Supabase docs:** https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

**Vereist:** Pro Plan of hoger.

### Stappen

1. Ga naar **Authentication** → **Providers** → **Email**
2. Schakel **Leaked password protection** in
3. Optioneel: stel ook **Minimum password length** en **Required characters** in

---

## 4. Sensitive columns (users.iban, voicejar_events.session_id)

### users.iban

- **Probleem:** Kolom in publieke API zonder RLS
- **Oplossing:** RLS ingeschakeld; alleen eigen rij via policy (`email = auth.jwt().email`)
- **Let op:** Een ingelogde gebruiker kan zijn eigen IBAN nog steeds zien. Wil je dat beperken, overweeg:
  - IBAN in aparte, versleutelde tabel
  - View zonder `iban` voor client-side gebruik

### voicejar_events.session_id

- **Probleem:** Session-ID kan tracking-sessies identificeren
- **Oplossing:** RLS ingeschakeld, geen policy → alle toegang via PostgREST geblokkeerd
- Admin/backoffice gebruikt Drizzle + service role, dus blijft werken

---

## Na uitvoering

1. Draai de Security Advisor opnieuw: [Security Advisor](https://supabase.com/dashboard/project/vcbxyyjsxuquytcsskpj/database/security-advisor)
2. Test AuthContext: log in en controleer of rol correct geladen wordt
3. Test relevante flows (checkout, academy, backoffice)
