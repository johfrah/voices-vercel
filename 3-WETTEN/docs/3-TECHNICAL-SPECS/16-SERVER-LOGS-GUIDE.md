# Server logs opvragen – Voices.be

## 1. SSH (directe toegang)

```bash
ssh -p 22 voicesbe@ssh.voices.be
```

### Waar logs staan

| Platform | Pad |
|----------|-----|
| **Node.js (PM2)** | `~/.pm2/logs/` of `~/.pm2/logs/*.out` |
| **Node.js (systemd)** | `journalctl -u voices` of `journalctl -u node` |
| **Apache/Nginx** | `/var/log/apache2/error.log` of `/var/log/nginx/error.log` |
| **Combell** | Control panel → Websites → Logs / Error logs |
| **Next.js stdout** | Vaak in PM2 of systemd output |

### Handige commando’s

```bash
# Laatste 100 regels error log
tail -100 /var/log/nginx/error.log

# Live volgen
tail -f ~/.pm2/logs/voices-out.log

# Zoeken naar 500 / Internal Server
grep -i "500\|Internal Server\|Error" ~/.pm2/logs/*.log
```

---

## 2. Combell Control Panel

1. Login op [my.combell.com](https://my.combell.com)
2. **Websites** → **voices.be** → **Logs**
3. Download of bekijk **Error log** en **Access log**

---

## 3. Debug API-route (na deploy)

Na deploy kun je als admin de foutinformatie ophalen via:

```
GET /api/debug/health
```

Deze route geeft onder meer info over env vars (zonder gevoelige waarden) en basis health-status.

---

## 4. Lokaal reproduceren

```bash
cd apps/web
npm run build
npm run start
```

Bezoek `http://localhost:3000` en check de terminaloutput voor errors.

---

## 5. Wat je zoekt bij een 500

- **`Your project's URL and API key are required`** (Supabase) → `NEXT_PUBLIC_SUPABASE_*` niet op de server. **Fix:** `./3-CURSOR-ONLY/scripts/core/deploy/deploy-env-to-server.sh` + op server `npm run build` + `pm2 restart voices`. [Supabase API-settings](https://supabase.com/dashboard/project/_/settings/api)
- **`Supabase env vars missing`** / health `hasSupabaseUrl: false` → Zie boven; gebruik `deploy-env-to-server.sh` om `.env.local` naar productie te pushen.
- **`ECONNREFUSED`** → database/Supabase niet bereikbaar  
- **`Cannot read property 'X' of undefined`** → ontbrekende of lege config  
- **`Module not found`** → foutieve build of deploy
