# Onboarding flow: van aanmelding tot live stem

**Doel:** Beschrijven hoe een nieuwe stemacteur (signup) door admin wordt gecontroleerd, eventueel aangepast, en na besluit tot samenwerking naar “live” gaat.

---

## 1. Na aanmelding (signup)

- De acteur vult het formulier in op `/account/signup`: identiteit, tagline, bio, foto, talen, tonen, levering, **studio-materiaal** (microfoon, interface, preamp, booth), **vaste tarieven** (Telefonie €89, Corporate €249) + optioneel Onbetaald/Proef en Live regie, demo, video.
- Alle data komt in **Supabase** (actors, actor_languages, actor_tones, actor_demos, actor_videos, studio_specs, rates).
- Status: **pending**, **is_public: false** → nog niet zichtbaar op de site.
- De acteur ziet bevestiging: “We nemen na verificatie contact op.”

---

## 2. Admin: controleren en desgewenst aanpassen

- Admin ziet nieuwe aanmeldingen in de **Voice Manager** (lijst acteurs; status pending).
- Admin opent de **Actor Edit Modal** en controleert:
  - Identiteit, tagline, bio, foto, talen, tonen, levering, tarieven, demo(’s), video(’s), **studio_specs**.
- Admin kan alles **aanpassen** (bijv. bio herschrijven, tagline aanscherpen, foto vervangen). Geen aparte “pending”-velden nodig voor signup: de ingevulde velden zijn de bron; admin overschrijft gewoon in de modal en slaat op.
- **Privé blijven:** e-mail en telefoonnummer staan niet op de site; alleen in het admin-profiel / CRM.

---

## 3. Besluit: wel of niet samenwerken

- Als admin **niet** met de stem wil samenwerken: status laten op **pending** of expliciet op **rejected** (indien die status wordt gebruikt). Geen verdere stappen.
- Als admin **wel** met de stem wil samenwerken: start het **onboardingproces** (zie hieronder). Doel is om de acteur “live” te zetten zodra alles rond is.

---

## 4. Onboardingproces (ideaal)

Het onboardingproces is de fase tussen “we willen met je samenwerken” en “je staat live op de site”.

**Stappen (ideaal):**

1. **Contact** – Admin neemt contact op (e-mail/telefoon) en bevestigt samenwerking.
2. **Contract / voorwaarden** – Eventueel digitale handtekening of akkoord met voorwaarden (buiten of binnen het platform).
3. **Intake** – Eventuele ontbrekende gegevens (bankrekening, BTW, facturatie) indien van toepassing; kan in account- of admin-omgeving.
4. **Kwaliteitscheck** – Demo(s) en eventueel proefopname beoordelen; feedback geven indien nodig.
5. **Profiel afronden** – Laatste aanpassingen in de Actor Edit Modal (bio, tagline, foto, studio_specs, tarieven).
6. **Live zetten** – Admin zet status op **live** en **is_public: true**. De stem verschijnt op de site (SmartRouter / Lazy Discovery, slug_registry).
7. **Communicatie** – Bevestiging naar de acteur dat hij/zij live staat en wat de volgende stappen zijn (bijv. eerste opdrachten).

**Technisch:**

- Status blijft **pending** tot aan stap 6; daarna **live** (en eventueel **status_id** gekoppeld aan de juiste rij in `actor_statuses`).
- Er is geen aparte enumwaarde “onboarding” in het huidige schema; “onboarding” is de **workflow** (pending + in behandeling), niet per se een aparte status. Optioneel later: status **approved** of **onboarding** toevoegen in `actor_statuses` als je die fase expliciet wilt tonen in de admin (bijv. “In onboarding”).

---

## 5. Samenvatting

| Fase            | Wie       | Actie |
|-----------------|-----------|--------|
| Aanmelding      | Acteur    | Formulier invullen; data in Supabase; status pending. |
| Controleren     | Admin     | Gegevens in Voice Manager / Actor Edit Modal controleren en desgewenst aanpassen. |
| Besluit         | Admin     | Wel of niet samenwerken. |
| Onboarding      | Admin + acteur | Contact, contract/intake, kwaliteit, profiel afronden. |
| Live            | Admin     | Status → live, is_public → true; stem zichtbaar op de site. |

*Alle gegevens die de acteur aanlevert (inclusief studio_specs en tarieven) zijn in Supabase en handshake met dezelfde Actor Edit Modal.*
