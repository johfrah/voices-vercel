import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Device } from '@capacitor/device';

/**
 * 📱 MOBILE BRIDGE (Capacitor)
 * 
 * Zorgt voor de naadloze overgang tussen Web en Native (iOS/Android).
 * Detecteert hardware mogelijkheden en activeert native tools.
 */

export const MobileBridge = {
  /**
   * Check of we in een Capacitor (Native) omgeving zitten
   */
  isNative: () => Capacitor.isNativePlatform(),

  /**
   * Haal unieke Device ID op voor 'God Mode' beveiliging (tegen account sharing)
   */
  getDeviceId: async () => {
    if (!Capacitor.isNativePlatform()) {
      // Fallback voor web: Fingerprint op basis van browser/user-agent
      return btoa(window.navigator.userAgent + window.screen.width);
    }
    const info = await Device.getId();
    return info.identifier;
  },

  /**
   * Native Recorder Logic
   */
  recorder: {
    requestPermission: async () => {
      if (!Capacitor.isNativePlatform()) return true;
      const result = await VoiceRecorder.requestAudioRecordingPermission();
      return result.value;
    },
    start: async () => {
      if (!Capacitor.isNativePlatform()) return null;
      return await VoiceRecorder.startRecording();
    },
    stop: async () => {
      if (!Capacitor.isNativePlatform()) return null;
      const result = await VoiceRecorder.stopRecording();
      return result.value; // Base64 audio
    }
  },

  /**
   * Haptic Feedback (voor die premium 'God Mode' feel)
   */
  impact: () => {
    if (Capacitor.isNativePlatform()) {
      // @ts-ignore
      Capacitor.Plugins.Haptics?.impact({ style: 'LIGHT' });
    }
  }
};
