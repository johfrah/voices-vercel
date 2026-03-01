# 🎬 Casting Submit Flow Analysis

**Datum**: 2026-02-24 18:22 UTC
**Component**: StudioLaunchpad → /api/casting/submit

---

## 🔍 Complete Flow Analysis

### Stap 1: Formulier Invullen

**Velden**:
- Project: "Improvement Test"
- Email: "info@johfrah.be"
- Naam: "Chris Masterclass"
- Stem: (geselecteerd)
- Script: (ingevuld)

### Stap 2: Submit Handler

**Locatie**: `StudioLaunchpad.tsx` (lijn 167-213)

```tsx
const handleLaunch = async () => {
  // Validatie
  if (!script || script.trim().length < 10) {
    toast.error('Je script is te kort voor een proefopname');
    return;
  }

  setIsLaunching(true);
  
  // API Call
  const response = await fetch('/api/casting/submit', {
    method: 'POST',
    body: JSON.stringify({ 
      projectName,      // "Improvement Test"
      clientName,       // "Chris Masterclass"
      clientEmail,      // "info@johfrah.be"
      script,           // (ingevuld script)
      selectedActors,   // [geselecteerde stem]
      selectedVibe,
      selectedMedia,
      spots,
      years,
      words
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Success toast
    toast.success('Je aanvraag is succesvol verzonden!');
    
    // Clear draft
    localStorage.removeItem('voices_proefopname_draft');
    
    // Redirect na 2 seconden
    setTimeout(() => {
      window.location.href = `/pitch/${data.sessionHash}`;
    }, 2000);
  }
}
```

### Stap 3: API Processing

**Endpoint**: `/api/casting/submit/route.ts`

**Wat er gebeurt**:

1. **Validatie** (lijn 36-38)
   ```tsx
   if (!projectName || !clientEmail || !selectedActors?.length) {
     return { success: false, error: 'Incomplete data' };
   }
   ```

2. **User Lookup/Create** (lijn 44-66)
   - Zoekt gebruiker met email "info@johfrah.be"
   - Als niet gevonden: maakt nieuwe user aan
   - Role: 'guest'
   - Journey state: 'casting_lead'

3. **Session Hash Genereren** (lijn 69)
   ```tsx
   const sessionHash = nanoid(12); // Bijv: "aB3dE5fG7hI9"
   ```

4. **Dropbox Folder** (lijn 72-73)
   ```tsx
   const dropboxUrl = await dropbox.createCastingFolder(
     "Improvement Test", 
     sessionHash
   );
   ```

5. **Audition Records** (lijn 77-87)
   - Maakt audition records aan voor elke geselecteerde stem
   - Status: 'invited'
   - Script: (ingevuld script)
   - Briefing: Vibe info

6. **Casting List** (lijn 90-110)
   - Maakt casting_lists record aan
   - Hash: sessionHash (voor URL)
   - is_public: false (privacy-first)
   - Settings: alle project info

7. **Casting List Items** (lijn 115-127)
   - Koppelt stemmen aan de casting list
   - Maakt casting_list_items records

8. **Email Notificatie** (lijn 129-175)
   - Stuurt email naar Johfrah (admin)
   - Subject: "🚀 Nieuwe Casting: Improvement Test"
   - Bevat: project info, stemmen, script
   - Button: "Open Collaborative Studio" → `/pitch/${sessionHash}`

9. **Response** (lijn 177-181)
   ```json
   {
     "success": true,
     "sessionHash": "aB3dE5fG7hI9",
     "redirectUrl": "/casting/session/aB3dE5fG7hI9"
   }
   ```

### Stap 4: Client-side Redirect

**Locatie**: `StudioLaunchpad.tsx` (lijn 200-204)

```tsx
setTimeout(() => {
  window.location.href = `/pitch/${data.sessionHash}`;
}, 2000);
```

**Redirect naar**: `/pitch/aB3dE5fG7hI9`

---

## 🎯 Verwachte Resultaten

### 1. ✅ Success Toast
**Bericht**: "Je aanvraag is succesvol verzonden!"
**Locaties**: 
- Top-center (van Providers.tsx)
- Bottom-right (van layout.tsx) ← Bug!

### 2. ✅ Redirect
**Van**: `/casting/video`
**Naar**: `/pitch/{sessionHash}`
**Timing**: 2 seconden na success

### 3. ✅ Database Records

**users table**:
```sql
INSERT INTO users (
  email: 'info@johfrah.be',
  first_name: 'Chris Masterclass',
  company_name: 'Particulier',
  role: 'guest',
  journey_state: 'casting_lead'
)
```

**casting_lists table**:
```sql
INSERT INTO casting_lists (
  user_id: {user_id},
  name: 'Improvement Test',
  hash: {sessionHash},
  is_public: false,
  settings: {
    client_name: 'Chris Masterclass',
    client_company: 'Particulier',
    script: {script},
    dropbox_url: {dropboxUrl},
    ...
  }
)
```

**auditions table**:
```sql
INSERT INTO auditions (
  user_id: {user_id},
  actor_id: {selected_actor_id},
  status: 'invited',
  script: {script},
  briefing: 'Vibe: ...'
)
```

**casting_list_items table**:
```sql
INSERT INTO casting_list_items (
  list_id: {casting_list_id},
  actor_id: {selected_actor_id},
  sort_order: 0
)
```

### 4. ✅ Email Notificatie

**Naar**: Johfrah (admin email van market)
**Subject**: "🚀 Nieuwe Casting: Improvement Test (Particulier)"
**Bevat**:
- Project info
- Klant info (Chris Masterclass, info@johfrah.be)
- Geselecteerde stemmen
- Script
- Link naar Dropbox folder
- Button naar `/pitch/{sessionHash}`

### 5. ✅ Dropbox Folder

**Pad**: `/Casting/{projectName}_{sessionHash}/`
**Bevat**: Lege folder klaar voor uploads

---

## 🔬 Console Logs (Verwacht)

### Success Flow
```javascript
// StudioLaunchpad.tsx (lijn 175)
console.log('Campaign message from state:', campaignMessage);

// API response
{
  success: true,
  sessionHash: "aB3dE5fG7hI9",
  redirectUrl: "/casting/session/aB3dE5fG7hI9"
}

// Redirect
window.location.href = "/pitch/aB3dE5fG7hI9"
```

### Error Flow (als iets misgaat)
```javascript
// StudioLaunchpad.tsx (lijn 209)
console.error('Launch error:', err);

// Toast error
toast.error('Er is iets misgegaan bij het aanvragen. Probeer het later opnieuw.');
```

---

## ⚠️ Mogelijke Issues

### 1. Dubbele Toast (Bug)
**Symptoom**: Twee success toasts verschijnen
**Locaties**: Top-center EN bottom-right
**Oorzaak**: Dubbele Toaster instances
**Fix**: Verwijder één Toaster

### 2. Casting Lists Table
**Vereist**: Table moet bestaan in database
**Status**: ✅ Aanwezig (vanaf v2.14.368)
**Check**: `/api/admin/database/tables/` toont casting_lists

### 3. Auditions Table
**Vereist**: Table moet bestaan in database
**Status**: ⚠️ Niet geverifieerd in API
**Impact**: Als niet aanwezig → 500 error

### 4. Email Verzending
**Vereist**: VoicesMailEngine moet werken
**Potentieel**: Email kan falen zonder submit te blokkeren
**Logging**: Check server logs voor email errors

### 5. Dropbox Service
**Vereist**: Dropbox credentials en permissions
**Potentieel**: Folder creation kan falen
**Impact**: dropboxUrl wordt null, maar submit gaat door

---

## 📊 Verwachte Console Output

### Geen Errors (Success)
```
Campaign message from state: undefined
[Casting Submit] Creating casting list...
[Casting Submit] Sending notification email...
[Voices Mail] Email sent successfully
```

### Met Errors
```
❌ [Casting Submit] Error: {error_message}
❌ Launch error: {error_details}
```

---

## 🎯 Verificatie Checklist

Wat je zou zien in de browser (als je browser automation had):

### ✅ Success Scenario
1. Toast: "Je aanvraag is succesvol verzonden!" (2x door bug)
2. Wait: 2 seconden
3. Redirect: URL verandert naar `/pitch/{hash}`
4. Console: Geen rode errors
5. Network: POST /api/casting/submit → 200 OK

### ❌ Error Scenario
1. Toast: "Er is iets misgegaan..."
2. No redirect
3. Console: Error logs
4. Network: POST /api/casting/submit → 500 Error

---

## 📁 Affected Files

1. **Frontend**:
   - `components/ui/StudioLaunchpad.tsx` (submit handler)
   
2. **Backend**:
   - `app/api/casting/submit/route.ts` (API endpoint)
   
3. **Database Tables**:
   - `users`
   - `casting_lists`
   - `casting_list_items`
   - `auditions`
   
4. **Services**:
   - `DropboxService` (folder creation)
   - `VoicesMailEngine` (email notification)

---

## 🚀 Expected Redirect

**From**: `https://www.voices.be/casting/video`
**To**: `https://www.voices.be/pitch/{sessionHash}`

**Example**: `https://www.voices.be/pitch/aB3dE5fG7hI9`

**Timing**: 2000ms (2 seconds) after success

---

**Report Generated**: 2026-02-24 18:22 UTC
**Status**: ✅ Flow Analyzed (Code Level)
**Confidence**: 95% (based on code analysis)
**Note**: Browser testing required for 100% confirmation
