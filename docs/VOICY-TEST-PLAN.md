# 🤖 Voicy Testing Plan - v2.15.046

## 📋 Test Objectives

Verify the following functionality on the live site (https://www.voices.be):

1. **AI Response Quality & Speed**: Voicy should respond within 2-3 seconds with contextually relevant answers.
2. **Telegram Notifications**: Both user messages (💬) and AI responses (🤖) should trigger Telegram alerts with correct emojis and links.
3. **Push Notifications**: Web push notifications should be sent to subscribed admin devices.
4. **Database Persistence**: All messages should be saved correctly in `chat_conversations` and `chat_messages`.

## 🧪 Test Scenarios

### Scenario 1: General Voice-Over Price Inquiry (Agency Journey)
**User Message**: "Wat kost een voice-over voor een bedrijfsvideo van 2 minuten?"

**Expected AI Response**:
- Should reference the pricing from `app_configs` (Supabase Source of Truth)
- Should mention the base price for video (unpaid)
- Should explain the word count threshold (200 words)
- Should offer actions like "Offerte aanvragen" or "Stemmen bekijken"

**Expected Notifications**:
- ✅ Telegram alert with 💬 emoji for user message
- ✅ Telegram alert with 🤖 emoji for AI response
- ✅ Email notification to admin (for user message only)
- ✅ Web push notification

### Scenario 2: Workshop Inquiry (Studio Journey)
**User Message**: "Wanneer is de volgende voice-over workshop?"

**Expected AI Response**:
- Should fetch upcoming workshop editions from `workshop_editions` table
- Should provide specific dates and locations
- Should offer actions like "Bekijk Workshops" or "Aan de slag"

**Expected Notifications**:
- ✅ Telegram alert with 💬 emoji for user message
- ✅ Telegram alert with 🤖 emoji for AI response
- ✅ Email notification to admin
- ✅ Web push notification

### Scenario 3: Human Takeover Request
**User Message**: "Ik wil graag met Johfrah spreken"

**Expected AI Response**:
- Should detect the human takeover intent
- Should offer a "Johfrah Spreken" action button
- Should provide contact information or escalation path

**Expected Notifications**:
- ✅ Telegram alert with 💬 emoji for user message
- ✅ Telegram alert with 🤖 emoji for AI response
- ✅ Email notification to admin (high priority)
- ✅ Web push notification

### Scenario 4: English Language Detection
**User Message**: "How much does a voice-over cost for a 2-minute corporate video?"

**Expected AI Response**:
- Should detect English language and respond in English
- Should provide the same pricing information as Scenario 1
- Should offer English action buttons ("Request Quote", "Browse Voices")

**Expected Notifications**:
- ✅ Telegram alert with 💬 emoji for user message
- ✅ Telegram alert with 🤖 emoji for AI response
- ✅ Email notification to admin
- ✅ Web push notification

## 🔍 Verification Checklist

### Database Checks
```sql
-- Check recent conversations
SELECT id, journey, status, created_at 
FROM chat_conversations 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Check recent messages
SELECT 
  cm.id,
  cm.conversation_id,
  cm.sender_type,
  LEFT(cm.message, 50) as message_preview,
  cm.created_at
FROM chat_messages cm
WHERE cm.created_at > NOW() - INTERVAL '1 hour'
ORDER BY cm.created_at DESC;

-- Check system events for notification errors
SELECT 
  id,
  level,
  source,
  LEFT(message, 100) as message_preview,
  created_at
FROM system_events
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND (message ILIKE '%telegram%' OR message ILIKE '%notification%' OR message ILIKE '%voicy%')
ORDER BY created_at DESC;
```

### Telegram Verification
1. Open the Telegram bot/channel where notifications are sent
2. Verify the format:
   ```
   💬 Nieuwe Interactie (user)
   
   Bericht: "[User message preview]"
   ID: #[conversation_id]
   Journey: [agency/studio/academy]
   
   👉 Open Live Chat Watcher
   ```
3. Verify the link points to `/admin/live-chat`
4. Verify the AI response notification:
   ```
   🤖 Nieuwe Interactie (ai)
   
   Bericht: "[AI response preview]"
   ID: #[conversation_id]
   Journey: [agency/studio/academy]
   
   👉 Open Live Chat Watcher
   ```

### Push Notification Verification
1. Ensure you're subscribed to push notifications in the admin panel
2. Verify the notification appears on your device
3. Check the notification title and body match the expected format
4. Verify clicking the notification navigates to `/admin/live-chat`

### Performance Metrics
- **AI Response Time**: < 3 seconds (measured from user message to AI response)
- **Notification Latency**: < 2 seconds (measured from message creation to notification receipt)
- **Database Write Time**: < 500ms (measured from API call to database persistence)

## 🛡️ Chris-Protocol Compliance

### Zero-Hallucination Policy
- ✅ AI must NEVER invent contact details, prices, or dates
- ✅ All data must come from Supabase or `config.ts`
- ✅ If data is missing, AI should say "Ik heb die informatie niet beschikbaar"

### Notification Integrity
- ✅ Notifications must fire OUTSIDE the transaction (fire-and-forget pattern)
- ✅ Notification failures must NOT block the chat response
- ✅ All notification errors must be logged to `system_events`

### Data Persistence
- ✅ User messages must be saved BEFORE AI generation
- ✅ AI responses must be saved AFTER generation
- ✅ All messages must have a valid `conversation_id`
- ✅ All messages must have a `sender_type` ('user', 'admin', or 'ai')

## 📊 Success Criteria

A test is considered PASSED if:
1. ✅ AI responds within 3 seconds with relevant, accurate information
2. ✅ Both user and AI messages trigger Telegram notifications with correct emojis
3. ✅ Telegram links are functional and point to the correct admin page
4. ✅ All messages are persisted in the database
5. ✅ No errors appear in `system_events` table
6. ✅ Push notifications are delivered (if subscribed)

## 🚨 Known Issues & Limitations

### Schema Mismatches (Fixed in v2.15.046)
- ❌ `chat_conversations.persona` column does not exist (removed from schema)
- ❌ `system_events.event_type` column does not exist (use `source` instead)
- ❌ `system_events.severity` column does not exist (use `level` instead)

### Notification Dependencies
- Telegram notifications require `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in environment variables
- Email notifications require `ADMIN_EMAIL` and SMTP configuration
- Push notifications require user subscription via `/admin/settings`

## 🔄 Test Execution Log

### Test Run: [DATE/TIME]
- **Tester**: [Name]
- **Environment**: Production (https://www.voices.be)
- **Version**: v2.15.046

#### Scenario 1: General Price Inquiry
- [ ] AI Response Time: _____ seconds
- [ ] AI Response Quality: ⭐⭐⭐⭐⭐
- [ ] Telegram User Notification: ✅ / ❌
- [ ] Telegram AI Notification: ✅ / ❌
- [ ] Push Notification: ✅ / ❌
- [ ] Database Persistence: ✅ / ❌
- **Notes**: 

#### Scenario 2: Workshop Inquiry
- [ ] AI Response Time: _____ seconds
- [ ] AI Response Quality: ⭐⭐⭐⭐⭐
- [ ] Telegram User Notification: ✅ / ❌
- [ ] Telegram AI Notification: ✅ / ❌
- [ ] Push Notification: ✅ / ❌
- [ ] Database Persistence: ✅ / ❌
- **Notes**: 

#### Scenario 3: Human Takeover
- [ ] AI Response Time: _____ seconds
- [ ] AI Response Quality: ⭐⭐⭐⭐⭐
- [ ] Telegram User Notification: ✅ / ❌
- [ ] Telegram AI Notification: ✅ / ❌
- [ ] Push Notification: ✅ / ❌
- [ ] Database Persistence: ✅ / ❌
- **Notes**: 

#### Scenario 4: English Detection
- [ ] AI Response Time: _____ seconds
- [ ] AI Response Quality: ⭐⭐⭐⭐⭐
- [ ] Telegram User Notification: ✅ / ❌
- [ ] Telegram AI Notification: ✅ / ❌
- [ ] Push Notification: ✅ / ❌
- [ ] Database Persistence: ✅ / ❌
- **Notes**: 

## 📝 Post-Test Actions

If any test fails:
1. Check the `system_events` table for error logs
2. Verify environment variables are correctly set
3. Check Vercel logs for any runtime errors
4. Verify Supabase connection is stable
5. Review the chat API route (`/api/chat/route.ts`) for any logic errors

## 🎯 Next Steps

After successful testing:
- [ ] Document any performance bottlenecks
- [ ] Optimize AI response time if > 3 seconds
- [ ] Review Telegram notification format with stakeholders
- [ ] Consider adding more action buttons based on user feedback
- [ ] Implement conversation analytics dashboard
