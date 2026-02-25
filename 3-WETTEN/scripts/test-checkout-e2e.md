# 🛒 End-to-End Checkout Test Guide

**Date**: 2026-02-24  
**Purpose**: Manual testing guide for the complete checkout flow on Voices.be

---

## 🎯 Test Scenario 1: Invoice Payment (Betalen op factuur)

### Step 1: Navigate to Voice Actor Listing
1. Open browser: `https://www.voices.be/`
2. Wait for page to load completely
3. Verify voice actor cards are visible (not skeleton loaders)

### Step 2: Select a Voice Actor
1. Click on **Johfrah**'s card (or any live actor)
2. Verify the actor detail page loads
3. Click **"Voeg toe aan winkelwagen"** or **"Bestel nu"**

### Step 3: Configure the Order
1. In the briefing step, enter test text:
   ```
   Dit is een test briefing voor de checkout flow. We testen de volledige flow van selectie tot bestelling.
   ```
2. Select usage type (e.g., "Commercieel")
3. Select media type (e.g., "Radio")
4. Click **"Volgende"** or **"Naar checkout"**

### Step 4: Fill Customer Details
1. Email: `test-checkout@voices.be`
2. First Name: `Test`
3. Last Name: `Gebruiker`
4. Postal Code: `3000`
5. City: `Leuven`
6. Country: `België`
7. (Optional) Phone: `+32 470 12 34 56`
8. (Optional) Company: `Test BV`

### Step 5: Select Payment Method
1. Scroll to **"Betaalmethode"** section
2. Click on **"Betalen op factuur (Offerte)"** or **"Banktransfer"**
3. Verify the info box appears: *"Factuur via e-mail"*

### Step 6: Submit Order
1. Click **"Bestelling plaatsen"** button
2. **MONITOR**:
   - Browser console (F12 → Console)
   - Network tab (F12 → Network)
   - Look for `/api/checkout/submit` request

### Step 7: Verify Success
1. Check if redirected to `/account/orders?orderId=XXXXX`
2. Verify order ID is >= 300002
3. Check order status is `pending` or `quote-pending`

### Step 8: Database Verification
Run this SQL query:
```sql
SELECT 
  id, 
  wp_order_id,
  total, 
  status, 
  journey,
  is_quote,
  created_at
FROM orders
WHERE id >= 300002
ORDER BY id DESC
LIMIT 5;
```

### Step 9: Check System Events
Run this SQL query:
```sql
SELECT 
  level,
  source,
  message,
  details,
  created_at
FROM system_events
WHERE source = 'CheckoutAPI'
  AND created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎯 Test Scenario 2: Mollie Payment (Bancontact)

### Steps 1-4: Same as Scenario 1

### Step 5: Select Mollie Payment
1. Scroll to **"Betaalmethode"** section
2. Click on **"Bancontact"** (or "iDEAL", "Visa", "Mastercard")
3. Verify the Mollie logo is visible

### Step 6: Submit Order
1. Click **"Bestelling plaatsen"**
2. **MONITOR**:
   - Console for errors
   - Network tab for `/api/checkout/submit` response
   - Look for `checkoutUrl` in response

### Step 7: Verify Mollie Redirect
1. Check if redirected to Mollie payment page
2. URL should start with `https://www.mollie.com/checkout/...`
3. **DO NOT COMPLETE PAYMENT** (unless testing full flow)

### Step 8: Database Verification
```sql
SELECT 
  id, 
  total, 
  status, 
  created_at,
  raw_meta
FROM orders
WHERE created_at > NOW() - INTERVAL '10 minutes'
ORDER BY id DESC
LIMIT 3;
```

---

## 🚨 Common Errors to Watch For

### 1. **400 Bad Request**
- **Symptom**: "Ongeldige bestelgegevens"
- **Check**: Console logs for validation errors
- **Fix**: Ensure all required fields are filled

### 2. **500 Internal Server Error**
- **Symptom**: "Checkout failed"
- **Check**: `system_events` table for error details
- **Fix**: Check database connection, Mollie API keys

### 3. **Empty Cart**
- **Symptom**: Total shows €0.00
- **Check**: Browser localStorage or cookies for cart data
- **Fix**: Re-add items to cart

### 4. **Missing Mollie Icons**
- **Symptom**: Broken image icons for payment methods
- **Check**: `/assets/common/branding/payment/` folder
- **Fix**: Run `npm run mollie:fix` script

### 5. **Redirect Loop**
- **Symptom**: Page keeps redirecting to homepage
- **Check**: Auth cookies (`voices_role`, `sb-access-token`)
- **Fix**: Clear cookies and retry

---

## 🛠️ Debug Commands

### Check Recent Orders
```bash
cd /Users/voices/Library/CloudStorage/Dropbox/voices-headless
npx tsx 3-WETTEN/scripts/query-orders.ts
```

### Check System Events
```bash
npx tsx 3-WETTEN/scripts/forensic-audit.ts
```

### Check Mollie Configuration
```bash
curl -X GET "https://www.voices.be/api/checkout/config" | jq
```

---

## ✅ Success Criteria

- [ ] Voice actor can be selected
- [ ] Cart shows correct total
- [ ] Customer form accepts all fields
- [ ] Invoice payment creates order with status `pending`
- [ ] Mollie payment redirects to Mollie checkout
- [ ] Order ID is >= 300002
- [ ] No console errors
- [ ] No 400/500 errors in Network tab
- [ ] User is redirected to order confirmation page
- [ ] Email notification is sent (check inbox)

---

**Note**: This is a MANUAL test guide since browser automation is not available in the current environment.
