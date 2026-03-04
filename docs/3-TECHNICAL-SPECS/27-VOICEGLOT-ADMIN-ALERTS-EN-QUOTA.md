# Voiceglot – Admin-alerts en Gemini-quota

Korte uitleg: hoe je een mail krijgt bij quota-problemen en hoe je de daglimiet kunt verhogen.

---

## 1. Admin-mail bij quota-problemen

Als de **Gemini API-daglimiet** is bereikt (429), doet het systeem het volgende:

- **Background Heal** stopt direct (geen verdere vertaalpogingen tot de volgende dag).
- De **admin** krijgt **maximaal één e-mail per 24 uur** met onderwerp:  
  `Voiceglot: Gemini-quota overschreden – vertalingen gepauzeerd`.

### Admin-mail inschakelen

1. **`ADMIN_EMAIL`** in `.env` (of Vercel) zetten op het adres dat de melding moet krijgen.
2. **Admin-mails aanzetten:**  
   `DISABLE_ADMIN_EMAILS` op **`false`** zetten.  
   (Staat dit op `true` of is het niet gezet, dan worden geen quota-mails verstuurd; je ziet het alleen in logs en in `system_events`.)

Na het eerste quota-incident binnen 24 uur wordt geen tweede mail gestuurd (rate limit). Na 24 uur kan opnieuw één mail gaan bij een nieuw incident.

---

## 2. Quota verhogen (meer vertalingen per dag)

De daglimiet (bijv. 10.000 requests per model per dag) wordt door **Google** bepaald en hangt af van je plan.

- **Documentatie en limieten:**  
  [Gemini API – Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- **Quota/billing aanpassen:**  
  [Google AI Studio](https://aistudio.google.com/) → je project → quota / billing.

Na verhogen van de limiet of na het wisselen van een nieuw dagelijkse venster lopen de Voiceglot-vertalingen weer normaal; er is geen code- of deploy-actie nodig.

---

## 3. Samenvatting

| Vraag | Antwoord |
|--------|----------|
| Mail bij quota? | Ja, als `ADMIN_EMAIL` is gezet en `DISABLE_ADMIN_EMAILS=false`. Max 1 mail per 24 uur. |
| Hoe weet ik dat iets vastloopt? | Ontvang de admin-mail, of kijk in logs naar `[RegisterAPI] Gemini unavailable (quota or key)`. |
| Quota verhogen? | In Google AI Studio / Cloud Console: hoger plan of hogere quota voor het gebruikte model. |
