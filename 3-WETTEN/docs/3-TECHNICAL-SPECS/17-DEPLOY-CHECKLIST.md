# 🚀 Voices 2026 Nuclear Deploy Checklist

Dit document beschrijft de stappen om de site veilig van de lokale Dropbox naar de Combell server te brengen.

## 📦 1. Voorbereiding (Lokaal)
- [ ] Controleer of alle wijzigingen in `1-DEVELOPMENT` zijn doorgevoerd.
- [ ] Draai `npm run lint` in `1-DEVELOPMENT/apps/web`.
- [ ] Zorg dat `2-SERVER-READY` up-to-date is met de laatste code uit `1-DEVELOPMENT`.
- [ ] Controleer of de `assets/` map in `2-SERVER-READY` de juiste bestanden bevat (Logo's, Video's, Stemmen).

        ## 🗼 2. De Controletoren (3-CURSOR-ONLY)
        - [ ] Open de terminal in de root van het project.
        - [ ] Voer het deploy script uit:
          ```bash
          ./3-CURSOR-ONLY/scripts/core/deploy/deploy-via-ftp.sh
          ```

## 🛰️ 3. Post-Deploy Checks
- [ ] Controleer of de site bereikbaar is op [voices.be](https://voices.be).
- [ ] Check of het logo zichtbaar is (Assets check).
- [ ] Test de verbinding met Supabase (Health check API).
- [ ] Controleer of er geen onbedoelde mappen (zoals `nuclear-content`) op de server staan.

## ⚠️ Belangrijke Regels
- Verwijder **nooit** bestanden direct op de server via een FTP-client. Gebruik altijd het deploy-script.
- Grote media-wijzigingen (Stemmen/Muziek) worden slim afgehandeld via de `--only-newer` vlag in het script.
