import { useCallback } from 'react';
import { soundEngine } from '@/lib/soundEngine';

export function useAudioEffects() {
  const playSuccess = useCallback(() => soundEngine.playSuccess(), []);
  const playError = useCallback(() => soundEngine.playError(), []);
  const playLevelUp = useCallback(() => soundEngine.playLevelUp(), []);
  const playStreak = useCallback(() => soundEngine.playStreak(), []);
  const playClick = useCallback(() => soundEngine.playClick(), []);

  // Web Speech API Native Text-to-Speech
  const speakText = useCallback(async (text: string, rate: number = 0.9) => {
    // 1. Try high-quality human-like AI voice from backend
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${API_BASE_URL}/tts/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'nova' })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.playbackRate = rate;
        audio.play();
        return; // Success, exit early
      }
    } catch (e) {
      console.warn("Backend TTS failed or unavailable. Falling back to native browser speech.");
    }

    // 2. Native Browser Fallback (Robotic)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any pending speech
      
      const attemptSpeak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = rate;

        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.onvoiceschanged = null;
            attemptSpeak();
          };
          return;
        }

        let engVoice = voices.find(v => v.lang.startsWith('en-US') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Premium') || v.name.includes('Enhanced')));
        
        if (!engVoice) {
           engVoice = voices.find(v => v.lang.startsWith('en'));
        }

        if (engVoice) {
          utterance.voice = engVoice;
        }

        window.speechSynthesis.speak(utterance);
      };

      attemptSpeak();
    }
  }, []);

  return {
    playSuccess,
    playError,
    playLevelUp,
    playStreak,
    playClick,
    speakText,
  };
}
