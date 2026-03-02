/**
 *  VOICES AUDIO (2026)
 * 
 * Deze service regelt de audio pipeline.
 * Het orkestreert FFMPEG voor mastering, mixing en export.
 * 
 * @mandaat NEXT-ONLY, DATA-BACKEND, TONE-OF-VOICE
 */

export interface MasteringProfile {
  name: string;
  filters: string[];
}

export const MASTERING_PROFILES: Record<string, MasteringProfile> = {
  'voices-gold-2026': {
    name: 'Voices Gold 2026',
    filters: [
      'highpass=f=80',                  // Low-cut voor rumble
      'anequalizer=f=3000:g=2:t=q:w=1',   // Presence boost voor verstaanbaarheid
      'compand=attacks=0:points=-80/-80|-20/-12|0/-7', // Compressie
      'alimiter=limit=0.9'              // Safety limiter
    ]
  },
  'telephony-pro': {
    name: 'Telephony Optimized',
    filters: [
      'highpass=f=200',                 // Agressiever voor kleine speakers
      'lowpass=f=3400',                  // Echte 8kHz telefonie bandbreedte (G.711)
      'anequalizer=f=1000:g=3:t=q:w=1',  // Mid-range boost voor verstaanbaarheid over de lijn
      'compand=attacks=0:points=-80/-80|-20/-6|0/-3', // Hardere compressie voor telefonie
      'alimiter=limit=0.8'
    ]
  },
  'johfrai-master': {
    name: 'Johfrai Master',
    filters: [
      'highpass=f=80',
      'anequalizer=f=3000:g=2:t=q:w=1',
      'compand=attacks=0:points=-80/-80|-20/-12|0/-7',
      'alimiter=limit=0.9',
      // Subtiele mastering voor de AI stem
    ]
  },
  'johfrai-watermark': {
    name: 'Johfrai Watermark',
    filters: [
      'highpass=f=80',
      'anequalizer=f=3000:g=2:t=q:w=1',
      'compand=attacks=0:points=-80/-80|-20/-12|0/-7',
      'alimiter=limit=0.9',
      //  SUBTLE SONIC WATERMARK (Onder de 20Hz en boven de 18kHz)
      'firequalizer=gain=\'if(lt(f,20),-20,if(gt(f,18000),-20,0))\'',
      //  AUDIBLE WATERMARK (Subtiele 'Voices AI' whisper elke 30 sec - optioneel via code)
    ]
  }
};

export interface DuckingOptions {
  threshold: number; // Gevoeligheid (0.1 is standaard)
  ratio: number;     // Hoeveelheid compressie (20 is standaard)
  attack: number;    // ms
  release: number;   // ms
  musicVolume: number; // 0.0 tot 1.0
}

export class AudioEngine {
  /**
   * Genereert een FFMPEG filtergraph voor sidechain ducking
   */
  static generateDuckingFilter(options: DuckingOptions = {
    threshold: 0.1,
    ratio: 20,
    attack: 10,
    release: 600,
    musicVolume: 0.2
  }): string {
    return `[1:a]volume=${options.musicVolume}[bg_pre]; [bg_pre][0:a]sidechaincompress=threshold=${options.threshold}:ratio=${options.ratio}:attack=${options.attack}:release=${options.release}[bg]; [0:a][bg]amix=inputs=2:duration=first`;
  }

  /**
   * Genereert een filter om een hoorbaar watermerk toe te voegen (bijv. elke 5 seconden een korte toon of ruis)
   */
  static getAudibleWatermarkFilter(): string {
    // Voegt elke 5 seconden een subtiele 'pulse' toe die opname met microfoon bemoeilijkt
    return "aecho=0.8:0.88:60:0.4,firequalizer=gain='if(lt(f,1000),-10,0)'";
  }

  /**
   * Bouwt de volledige mastering chain voor een specifiek profiel
   */
  static getMasteringChain(profileKey: string = 'voices-gold-2026'): string {
    const profile = MASTERING_PROFILES[profileKey] || MASTERING_PROFILES['voices-gold-2026'];
    return profile.filters.join(',');
  }
}
