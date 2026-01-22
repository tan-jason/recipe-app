import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Recipe } from '@/types/recipe';
import { recipeService } from '@/services/recipeService';
import {
  cacheDirectory,
  writeAsStringAsync,
  deleteAsync,
  readAsStringAsync,
  EncodingType,
} from 'expo-file-system/legacy';

export type VoiceState = 'idle' | 'greeting' | 'listening' | 'processing' | 'speaking';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Audio mode for playback (TTS) - main speaker
const setPlaybackMode = async () => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    interruptionModeIOS: InterruptionModeIOS.DuckOthers,
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
};

// Audio mode for recording (STT) - allows microphone
const setRecordingMode = async () => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
  });
};

// Recording settings optimized for speech
const RECORDING_OPTIONS = {
  android: {
    extension: '.wav',
    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.wav',
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/wav',
    bitsPerSecond: 128000,
  },
};

export function useVoiceAssistant(recipe: Recipe) {
  const [state, setState] = useState<VoiceState>('idle');
  const [isActive, setIsActive] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const isActiveRef = useRef(false);
  const conversationHistoryRef = useRef<ConversationMessage[]>([]);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recipeRef = useRef(recipe);

  // Keep refs in sync
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    conversationHistoryRef.current = conversationHistory;
  }, [conversationHistory]);

  useEffect(() => {
    recipeRef.current = recipe;
  }, [recipe]);

  // Request microphone permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.warn('Microphone permission not granted');
      }
    };
    requestPermissions();
  }, []);

  const speak = useCallback(async (text: string): Promise<void> => {
    try {
      // Switch to playback mode (main speaker, no recording)
      await setPlaybackMode();

      // Get audio from ElevenLabs via backend
      const audioData = await recipeService.textToSpeech(text);

      // Convert ArrayBuffer to base64
      const bytes = new Uint8Array(audioData);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Audio = btoa(binary);

      // Save to temporary file
      const fileUri = `${cacheDirectory}tts_${Date.now()}.mp3`;
      await writeAsStringAsync(fileUri, base64Audio, {
        encoding: EncodingType.Base64,
      });

      // Unload previous sound if exists
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch (e) {
          // Ignore
        }
      }

      // Create and play the sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;

      // Wait for playback to finish
      return new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
            soundRef.current = null;
            // Clean up temp file
            deleteAsync(fileUri, { idempotent: true }).catch(() => {});
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Error in TTS:', error);
    }
  }, []);

  const processRecording = useCallback(async (recordingUri: string) => {
    if (!isActiveRef.current) return;

    setState('processing');

    try {
      // Read the recording file as base64
      const audioBase64 = await readAsStringAsync(recordingUri, {
        encoding: EncodingType.Base64,
      });

      // Send to backend for transcription
      const transcript = await recipeService.speechToText(audioBase64, 'audio/wav');

      // Clean up recording file
      deleteAsync(recordingUri, { idempotent: true }).catch(() => {});

      if (!transcript || !transcript.trim()) {
        console.log('No speech detected, resuming listening');
        if (isActiveRef.current) {
          startListening();
        }
        return;
      }

      console.log('Transcript:', transcript);

      // Add user message to history
      const currentHistory = conversationHistoryRef.current;
      const newHistory: ConversationMessage[] = [
        ...currentHistory,
        { role: 'user', content: transcript },
      ];
      setConversationHistory(newHistory);
      conversationHistoryRef.current = newHistory;

      // Get AI response
      const result = await recipeService.cookingAssistant({
        recipe: recipeRef.current,
        conversationHistory: newHistory,
        userMessage: transcript,
      });

      // Add assistant response to history
      const updatedHistory: ConversationMessage[] = [
        ...newHistory,
        { role: 'assistant', content: result.response },
      ];
      setConversationHistory(updatedHistory);
      conversationHistoryRef.current = updatedHistory;

      // Speak response
      setState('speaking');
      await speak(result.response);

      // Continue listening
      if (isActiveRef.current) {
        startListening();
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      setState('speaking');
      await speak("Sorry, I couldn't understand that. Please try again.");
      if (isActiveRef.current) {
        startListening();
      }
    }
  }, [speak]);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (uri) {
        processRecording(uri);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      recordingRef.current = null;
    }
  }, [processRecording]);

  const startListening = useCallback(async () => {
    if (!isActiveRef.current) return;

    setState('listening');

    try {
      // Switch to recording mode
      await setRecordingMode();

      // Create and start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(RECORDING_OPTIONS);
      await recording.startAsync();
      recordingRef.current = recording;

      // Auto-stop after 10 seconds of recording
      setTimeout(() => {
        if (recordingRef.current && isActiveRef.current) {
          stopRecording();
        }
      }, 10000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setState('idle');
    }
  }, [stopRecording]);

  const start = useCallback(async () => {
    setIsActive(true);
    isActiveRef.current = true;
    setConversationHistory([]);
    conversationHistoryRef.current = [];

    // Greeting
    setState('greeting');
    const greeting = `Hi! I'm here to help you cook ${recipeRef.current.title}. Ask me anything about the recipe, like what's the first step, or how to prepare an ingredient.`;

    const greetingHistory: ConversationMessage[] = [{ role: 'assistant', content: greeting }];
    setConversationHistory(greetingHistory);
    conversationHistoryRef.current = greetingHistory;
    await speak(greeting);

    // Start listening loop
    if (isActiveRef.current) {
      startListening();
    }
  }, [speak, startListening]);

  const stop = useCallback(async () => {
    setIsActive(false);
    isActiveRef.current = false;
    setState('idle');

    // Stop any ongoing recording
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      } catch (error) {
        // Ignore
      }
    }

    // Stop any playing audio
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } catch (error) {
        // Ignore
      }
    }

    // Reset to playback mode
    await setPlaybackMode();
  }, []);

  // Manual trigger to stop listening and process
  const finishListening = useCallback(() => {
    if (recordingRef.current && state === 'listening') {
      stopRecording();
    }
  }, [state, stopRecording]);

  const toggle = useCallback(() => {
    if (isActive) {
      stop();
    } else {
      start();
    }
  }, [isActive, start, stop]);

  return {
    state,
    isActive,
    toggle,
    finishListening,
    conversationHistory,
  };
}
