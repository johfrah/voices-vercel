# Voiceglot Live Verification Checklist

## Version: v2.14.381+

### 🎯 Page: https://www.voices.be/admin/voiceglot/

#### ✅ Step 1: Version Check
- [ ] Open browser console (F12)
- [ ] Look for: `🚀 [Voices] Nuclear Version: v2.14.381`
- [ ] Confirm version is **2.14.381 or higher**

#### ✅ Step 2: Stats Display
- [ ] Top of page shows 6 language cards (EN, FR, DE, ES, PT, IT)
- [ ] Each card shows a percentage (NOT 0%)
- [ ] Each card shows count like "3588 / 3588 teksten live"

#### ✅ Step 3: Console Logs
Look for these logs in order:
- [ ] `📡 [Voiceglot Page] Fetching stats...`
- [ ] `📊 [Voiceglot Page] Stats Received:`
- [ ] `📋 [Voiceglot Page] List Received (Page 1):`
- [ ] `📦 [Voiceglot Page] Grouped List for Rendering:`

#### ✅ Step 4: Inspect List Data
- [ ] Click on `📋 [Voiceglot Page] List Received (Page 1):` in console
- [ ] Expand the object
- [ ] Verify `translations` is an Array with 100 items
- [ ] Click on `translations[0]`
- [ ] Verify it has structure:
  ```javascript
  {
    translationKey: "nav.main_nav.2.label",
    originalText: "Tarieven",
    translations: [
      { lang: "en", translatedText: "Rates", ... },
      { lang: "fr", translatedText: "Tarifs", ... }
    ]
  }
  ```

#### ✅ Step 5: Table Visual Check
Look at the actual table on screen:

| What to Check | Expected Result |
|---------------|-----------------|
| First column | Shows keys like "nav.main_nav.2.label" |
| Second column (NL) | Shows "Tarieven", "Hoe het werkt", etc. |
| EN column | Shows "Rates", "How it works" (NOT "Missing") |
| FR column | Shows "Tarifs", "Comment ça marche" (NOT "Missing") |
| DE column | Shows "Preise", "Wie es funktioniert" (NOT "Missing") |

#### ✅ Step 6: Error Check
- [ ] Filter console by "Error"
- [ ] Confirm NO red errors
- [ ] Specifically check: NO "TypeError" about "leadVibe"
- [ ] Specifically check: NO "500" errors from `/api/admin/voiceglot/*`

#### ✅ Step 7: Slimme Kassa Check
- [ ] Navigate to: https://www.voices.be/admin/orders
- [ ] Page loads without errors
- [ ] Orders table displays
- [ ] No console errors

#### ✅ Step 8: Account Dashboard Check
- [ ] Navigate to: https://www.voices.be/account/
- [ ] Page loads without errors
- [ ] Customer DNA section visible
- [ ] No TypeError about "leadVibe"

---

## 📝 Final Confirmation

If all checks pass, confirm with:

```
✅ VERIFIED WORKING ON LIVE
- Version: v2.14.381
- Voiceglot: Table populated with translations
- Stats: 3588 strings, percentages visible
- Translations: "Rates", "Tarifs", "Preise", etc. (no "Missing")
- Slimme Kassa: Working
- Account Dashboard: No errors
- Console: Clean (no TypeErrors)
```

If any check fails, report:

```
❌ ISSUE FOUND
- Step: [Which step failed]
- Expected: [What should happen]
- Actual: [What actually happened]
- Error: [Copy exact error message if any]
```
