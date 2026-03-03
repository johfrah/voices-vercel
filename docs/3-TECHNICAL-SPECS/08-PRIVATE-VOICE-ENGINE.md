# 🎙️ Private Voice Engine: Johfrah (A-Z Blueprint)

Dit document beschrijft de volledige opzet van de eigen 'Johfrah Voice Engine' op een Mac Mini, volledig onafhankelijk van ElevenLabs, zonder de huidige productie-site te verstoren.

## 🏗️ Architectuur (The Bob Method)

1. **De Bron (Mac Mini)**: Draait lokaal XTTS v2 of GPT-SoVITS.
2. **De Tunnel (Cloudflare)**: Maakt de Mac Mini veilig bereikbaar via een unieke URL.
3. **De Bridge (Voices.be)**: Een nieuwe, geïsoleerde service in de codebase die de Mac Mini aanroept.
4. **De Fallback**: ElevenLabs blijft de primaire bron voor de live site totdat we expliciet switchen.

## 📂 Fase 1: Dataset Voorbereiding (Training Data)

De volgende bestanden zijn geïdentificeerd in de `4-KELDER` als hoogwaardig trainingsmateriaal:

| Project | Kwaliteit | Pad (Relatief aan 4-KELDER/4-DATA-AND-DUMPS/07-historical-exports/) |
| :--- | :--- | :--- |
| **Cook-n-Style** | 48kHz/24bit | `2019-04-23_41076_ilse_delaere/Cook-n-Style-Johfrah-48khz-24bit.wav` |
| **Colruyt** | High | `2021-09-21_224488_eva_peleman/BE2301-Colruyt-Johfrah.zip` |
| **Catan** | High | `2021-02-08_199011_dewy_van_soeren/Catan-Johfrah-Flemish-VO.zip` |
| **NMBS** | High | `2021-09-20_224258_pieter_ver_elst/BE-2300-Johfrah-NMBS-Cyclu` |

### Actie:
- Kopieer deze bestanden naar `4-KELDER/assets_backup/stem-training/raw/`.
- Gebruik `ffmpeg` om ze te normaliseren naar mono, 22050Hz of 44100Hz (afhankelijk van model-eis).

## 💻 Fase 2: Mac Mini Setup (The Engine)

### 1. Installatie (Terminal)
```bash
# Installeer Conda voor isolatie
brew install --cask miniconda
conda create -n voice-engine python=3.10
conda activate voice-engine

# Installeer Coqui TTS (XTTS v2)
pip install TTS fastapi uvicorn python-multipart
```

### 2. De API Server (`voice_engine.py`)
Dit script draait op de Mac Mini en luistert naar opdrachten van de website.

```python
from fastapi import FastAPI, HTTPException
from TTS.api import TTS
import os

app = FastAPI()
# Laad het model (geoptimaliseerd voor Apple Silicon)
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("mps")

@app.post("/generate")
async def generate(text: str, speaker_wav: str = "johfrah_reference.wav"):
    output_path = "output.wav"
    tts.tts_to_file(text=text, speaker_wav=speaker_wav, language="nl", file_path=output_path)
    return {"status": "success", "file": output_path}
```

## 🌉 Fase 3: De Bridge (Vercel Connectie)

We maken een nieuwe file: `1-SITE/apps/web/src/services/PrivateVoiceService.ts`.
Deze file wordt door NIETS anders aangeroepen in de huidige site.

```typescript
export const PrivateVoiceService = {
  async generateWithMacMini(text: string) {
    const TUNNEL_URL = process.env.MAC_MINI_TUNNEL_URL;
    // Logica om de Mac Mini aan te roepen...
  }
}
```

## 🚀 Fase 4: Validatie (Safe Zone)
- Test de API lokaal op de Mac Mini.
- Test de tunnel-verbinding.
- Genereer een test-audio en vergelijk deze met ElevenLabs.

---
*Status: In opbouw door Bob & Cody (2026)*
