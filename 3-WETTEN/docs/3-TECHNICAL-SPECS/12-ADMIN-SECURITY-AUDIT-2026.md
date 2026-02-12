# 🛡️ Admin Security Audit (Feb 2026)

Diepe analyse van admin-only features zonder authenticatie-check.

## ✅ GEFIXT (deze sessie)

| Component | Was | Nu |
|-----------|-----|-----|
| VoicyProactiveIntelligence | Geen check, zichtbaar voor iedereen | `useAuth().isAdmin` |
| CodyPreviewBanner | Alleen sessionStorage | `useAuth().isAdmin` |

## ✅ AL CORRECT BESCHERMD

| Component | Bescherming |
|-----------|-------------|
| CommandPalette | `if (!isAdmin) return null` |
| EditModeOverlay | `useEditMode()` – alleen bij admin |
| VoicyChat admin tab | `isAdmin` check |
| SpotlightDashboard | Alleen zichtbaar bij isEditMode (homepage) |
| Account mailbox page | Client-side redirect bij !isAdmin |
| API mailbox/send | Supabase auth + johfrah email check |

---

## 🔴 KRITIEK: API's ZONDER AUTH

### 1. `/api/godmode/[collection]` – CRITICAL
- **Exposeert:** reviews, workshops, appointments, ademing-tracks, yuki-outstanding
- **Operaties:** GET (lezen) + POST (creëren)
- **Risico:** Volledige DB-lek en ongeautoriseerde mutaties
- **Actie:** Supabase auth + admin check toevoegen

### 2. `/api/intelligence/customer-360` – CRITICAL
- **Exposeert:** Volledige Customer 360 data per email/userId
- **Risico:** GDPR-lek – iedereen kan klantgegevens opvragen
- **Actie:** Auth + check dat aanvrager eigen email/admin is

### 3. `/api/admin/vibecode/push` – CRITICAL
- **Operatie:** Voert `git push origin main` uit
- **Comment zegt:** "Alleen toegankelijk voor admins" – **maar er is geen auth**
- **Risico:** Iedereen kan deploy triggeren
- **Actie:** Supabase auth + admin check

### 4. `/api/admin/users` – HIGH
- **Exposeert:** Volledige users-tabel
- **Risico:** Persoonsgegevens lek
- **Actie:** Auth + admin check

### 5. `/api/admin/reviews` – HIGH
- **Exposeert:** Alle reviews met actor/user namen
- **Gebruikt door:** /studio/reviews (publiek bereikbaar!)
- **Actie:** Auth + admin check

### 6. `/api/admin/config` – MEDIUM
- **GET:** actor, actors, music – gebruikt door agency (kan publiek zijn), maar ook appConfigs
- **POST:** Wijzigt globale config – **geen auth**
- **Actie:** POST moet auth hebben; GET voor actor/music kan publiek blijven

### 7. `/api/mailbox/inbox` – HIGH
- **Exposeert:** Volledige mailbox
- **Risico:** Mail lezen zonder login
- **Actie:** Auth + admin check

### 8. `/api/mailbox/insights` – HIGH
### 9. `/api/mailbox/faq-proposals` – HIGH
### 10. `/api/mailbox/customer-dna/[userId]` – HIGH
### 11. `/api/mailbox/project-dna/[projectId]` – HIGH
- **Risico:** Zelfde als inbox – allemaal mailbox-gerelateerd
- **Actie:** Auth + admin check

### 12. `/api/debug/health` – LOW
- **Exposeert:** hasSupabaseUrl, hasDatabaseUrl, nodeEnv
- **Risico:** Info disclosure
- **Actie:** Alleen in development, of achter auth

### 13. `/api/debug-kirsten` – LOW
- **Exposeert:** Actors met "Kirsten" in naam
- **Risico:** Dev/debug endpoint in productie
- **Actie:** Verwijderen of achter auth

---

## 🔴 ROUTES ZONDER MIDDLEWARE PROTECTIE

| Route | Middleware | Opmerking |
|-------|------------|-----------|
| `/admin/*` | ❌ | Alleen /backoffice en /artist/dashboard zijn beschermd |
| `/studio/beheer` | ❌ | Hardcoded userId 9450, geen echte auth |
| `/studio/reviews` | ❌ | Toont admin review data, geen auth |

**Actie:** Middleware uitbreiden: redirect naar login voor `/admin/*` en `/studio/beheer` wanneer geen user.

---

## AANBEVELING: HERHAALBARE AUTH HELPER

Maak een centrale helper voor API routes:

```ts
// lib/auth/api-auth.ts
import { createClient } from '@/utils/supabase/server';

export async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.email === 'johfrah@voices.be' || (user as any)?.role === 'admin';
  if (!user || !isAdmin) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  return user;
}
```

Gebruik in elke admin-API:
```ts
export async function GET(request: NextRequest) {
  await requireAdmin();
  // ... rest
}
```
