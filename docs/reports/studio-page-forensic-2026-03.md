# Studio-pagina forensisch rapport (maart 2026)

## Vraag
Waarom is op `/studio` geen data zichtbaar, geen menu, en opent de video niet? Moeten wijzigingen naar main gepusht worden? Is er iets verkeerd gemapt?

## Bevindingen

### 1. Market-resolutie (layout)
- **Voorheen:** Bij `/studio` werd `lookupHost = "voices.be/studio"` doorgegeven aan `getMarketSafe()`. In `getCurrentMarket(host)` werd het path eraf gehaald (`split('/')[0]`), dus je kreeg toch BE – maar de datastroom was onduidelijk.
- **Aanpassing:** Market wordt nu expliciet op **domein** opgehaald: `marketHost = cleanHost.split('/')[0]`. Studio en Academy zijn journeys op hetzelfde domein (BE). Geen path meer in de host; daardoor altijd dezelfde market (o.a. `market_configs`, vertalingen) voor voices.be.

### 2. Menu (layout)
- **Oorzaak:** De Studio-pagina gebruikte een **minimale layout** (geen GlobalNav/TopBar). Daardoor geen hoofdnavigatie en geen taalswitcher.
- **Aanpassing:** Minimale layout alleen nog voor Admin en Ademing offline. `/studio` gebruikt nu de **volle layout** (menu + taalswitcher). Geen wijziging in databronnen; alleen welke layout wordt gerenderd.

### 3. Data (workshops / carousel)
- **Bron:** Alle content komt uit `getStudioWorkshopsData()` in `studio-service.ts`. Die draait alleen op de server en hangt **niet** af van layout of market.
- **Query-eis:** Er worden alleen workshops getoond met:
  - `world_id = 2` (Studio World)
  - `status IN ('publish', 'live')`
- **Als er geen data is:** Dan voldoet geen enkele workshop aan deze voorwaarden. In het schema is de default voor `status` o.a. `'upcoming'`; als die nooit naar `'publish'` of `'live'` is gezet, blijft de lijst leeg.

**Controle in Supabase:**

```sql
SELECT id, title, status, world_id FROM workshops WHERE world_id = 2;
```

- Geen rijen → er zijn geen Studio-workshops, of `world_id` is niet 2.
- Wel rijen maar `status` is bv. `upcoming`/`draft` → zet voor de gewenste workshops `status = 'publish'` (of `'live'`).

### 4. Video hero
- **Logica:** De hero gebruikt een workshop met `video.id === 722` of de eerste workshop met `video.file_path`. De video-URL komt uit `workshops.meta.video_id` → `media.file_path`.
- **Geen fallbacks:** Er is geen aftermovie-fallback meer; alleen de primaire workshop-video telt.
- **“Opent niet”:** Als er geen workshop met geldige video (id 722 of een ander met `file_path`) is, blijft de placeholder “Studio video niet beschikbaar” zichtbaar. Oplossing: in de DB voor de gewenste workshop `meta.video_id` zetten op een bestaand `media.id` met een geldig `file_path`.

### 5. Taal (Frans)
- Tekst komt uit VoiceGlot (`page.studio.title`, `page.studio.description`). De actieve taal komt van cookie/header. Met het menu zichtbaar kan de bezoeker via de taalswitcher naar NL.

## Wijzigingen in code (geen fallbacks)

| Bestand | Wijziging |
|--------|-----------|
| `apps/web/src/app/layout.tsx` | Market op `marketHost` (domein alleen); minimale layout alleen Admin/Ademing offline; Studio krijgt volle layout. |
| `apps/web/src/app/studio/page.tsx` | Geen aftermovie-fallback; hero alleen van `workshop.video`; placeholder weer vaste tekst (geen Voiceglot-key). Video-container blijft verticaal (9:16). |
| `apps/web/src/lib/services/studio-service.ts` | Comment toegevoegd met data-eis en voorbeeld-SQL voor diagnose. |

## Moet er naar main gepusht worden?

- **Lokaal/test:** Na pull van deze wijzigingen zou je het menu en dezelfde databronnen moeten zien. Als de DB al workshops met `world_id = 2` en `status IN ('publish','live')` heeft, zou de carousel en hero-content zichtbaar moeten zijn.
- **Productie:** Na push naar main moet opnieuw gedeployed worden. “Geen data” oplossen vereist daarnaast dat in Supabase de workshops voor Studio de juiste `world_id` en `status` hebben; dat is geen code- maar data-aanpassing.

## Kort antwoord

- **Menu:** Opgelost door Studio de volle layout te geven.
- **Market/data-stroom:** Expliciet gemaakt (market op domein; geen path in host).
- **Geen data:** Komt door de filter in de DB (`world_id = 2`, `status IN ('publish','live')`). Controleer en corrigeer in Supabase; er is niets verkeerd gemapt in de code.
- **Video:** Alleen zichtbaar als er een workshop met geldige `meta.video_id` → `media.file_path` is; geen fallback meer.
