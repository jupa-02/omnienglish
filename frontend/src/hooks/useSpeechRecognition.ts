import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionOptions {
  continuous?: boolean;
  lang?: string;
  autoStopOnSilenceMs?: number; // e.g. 1400ms of silence after speaking triggers onSilence
  onSilenceDetected?: (transcript: string, blob?: Blob) => void;
}

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  volumeLevel: number; // 0.0 to 1.0 for visualizer
  isSpeaking: boolean; // True when user is actively producing vocal sound
  startListening: () => Promise<void>;
  stopListening: () => Promise<Blob | null>;
  resetTranscript: () => void;
  getAudioBlob: () => Blob | null;
  hasSupport: boolean;
  permissionGranted: boolean;
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): SpeechRecognitionHook {
  const {
    continuous = true,
    lang = 'en-US',
    autoStopOnSilenceMs = 0,
    onSilenceDetected
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSupport, setHasSupport] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const latestAudioBlobRef = useRef<Blob | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isListeningRef = useRef(false);
  const hasSpokenSinceStartRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fullTranscriptRef = useRef('');

  // Keep ref updated
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    fullTranscriptRef.current = (transcript + ' ' + interimTranscript).trim();
  }, [transcript, interimTranscript]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setHasSupport(true);
      }
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const setupMediaRecorderAndAudioMeter = async (): Promise<MediaStream> => {
    // If stream is already active and healthy, reuse it
    if (micStreamRef.current && micStreamRef.current.active) {
      return micStreamRef.current;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    micStreamRef.current = stream;
    setPermissionGranted(true);

    // 1. AudioContext Analyser
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioCtx();
    audioContextRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.4;
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateMeter = () => {
      if (!analyserRef.current || !isListeningRef.current) {
        setVolumeLevel(0);
        setIsSpeaking(false);
        return;
      }

      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const normalized = Math.min(1.0, avg / 70.0);
      setVolumeLevel(normalized);

      // Voice Activity Detection (RMS threshold)
      const speechThreshold = 0.12;
      const currentlySpeaking = normalized > speechThreshold;
      setIsSpeaking(currentlySpeaking);

      if (currentlySpeaking) {
        hasSpokenSinceStartRef.current = true;
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } else if (hasSpokenSinceStartRef.current && autoStopOnSilenceMs > 0) {
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            if (isListeningRef.current && onSilenceDetected) {
              const currentTxt = fullTranscriptRef.current;
              onSilenceDetected(currentTxt, latestAudioBlobRef.current || undefined);
            }
          }, autoStopOnSilenceMs);
        }
      }

      animFrameRef.current = requestAnimationFrame(updateMeter);
    };

    animFrameRef.current = requestAnimationFrame(updateMeter);

    // 2. MediaRecorder setup
    try {
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          latestAudioBlobRef.current = blob;
        }
      };

      mediaRecorderRef.current = recorder;
    } catch (recErr) {
      console.warn('MediaRecorder init fallback:', recErr);
    }

    return stream;
  };

  const startListening = useCallback(async () => {
    try {
      hasSpokenSinceStartRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      await setupMediaRecorderAndAudioMeter();

      // Start MediaRecorder if available
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        audioChunksRef.current = [];
        mediaRecorderRef.current.start(250);
      }

      // Initialize or start Web Speech Recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          if (recognitionRef.current) {
            recognitionRef.current.abort();
          }
        } catch {
          // ignore
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = lang;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let currentFinal = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item.isFinal) {
              currentFinal += item[0].transcript + ' ';
            } else {
              currentInterim += item[0].transcript;
            }
          }

          if (currentFinal) {
            setTranscript((prev) => (prev + ' ' + currentFinal).trim());
          }
          setInterimTranscript(currentInterim);
        };

        recognition.onerror = (event: any) => {
          // Ignore harmless 'no-speech' or 'aborted' events
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            console.warn('SpeechRecognition notice:', event.error);
          }
        };

        recognition.onend = () => {
          // If still marked as listening and continuous is true, auto-restart to prevent browser dropouts
          if (isListeningRef.current && continuous) {
            try {
              recognition.start();
            } catch {
              // Ignore already started error
            }
          }
        };

        recognitionRef.current = recognition;
        try {
          recognition.start();
        } catch (startErr) {
          console.warn('Recognition start caught:', startErr);
        }
      }

      setIsListening(true);
      isListeningRef.current = true;
    } catch (err) {
      console.warn('Microphone permission or audio start error:', err);
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [continuous, lang, autoStopOnSilenceMs]);

  const stopListening = useCallback(async (): Promise<Blob | null> => {
    setIsListening(false);
    isListeningRef.current = false;
    setIsSpeaking(false);
    setVolumeLevel(0);

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    // Stop Web Speech
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    // Stop MediaRecorder and return blob
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      return new Promise((resolve) => {
        if (!mediaRecorderRef.current) return resolve(null);
        mediaRecorderRef.current.onstop = () => {
          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          latestAudioBlobRef.current = blob;
          resolve(blob);
        };
        try {
          mediaRecorderRef.current.stop();
        } catch {
          resolve(latestAudioBlobRef.current);
        }
      });
    }

    return latestAudioBlobRef.current;
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    audioChunksRef.current = [];
    latestAudioBlobRef.current = null;
    hasSpokenSinceStartRef.current = false;
    fullTranscriptRef.current = '';
  }, []);

  const getAudioBlob = useCallback(() => {
    return latestAudioBlobRef.current;
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    volumeLevel,
    isSpeaking,
    startListening,
    stopListening,
    resetTranscript,
    getAudioBlob,
    hasSupport,
    permissionGranted,
  };
}
