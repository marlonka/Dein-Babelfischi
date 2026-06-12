import { GoogleGenAI, MediaResolution, Modality, type Session } from '@google/genai';
import { LiveTokenResponse } from '../types';

interface LiveTranslateCallbacks {
  onOpen: () => void;
  onInputTranscript: (text: string, languageCode?: string) => void;
  onOutputTranscript: (text: string, languageCode?: string) => void;
  onAudioChunk: (base64Pcm: string) => void;
  onClose: (reason?: string) => void;
  onError: (message: string) => void;
}

interface LiveTranslateStartOptions {
  targetLanguageCode: string;
  echoTargetLanguage: boolean;
  callbacks: LiveTranslateCallbacks;
}

interface LiveMessage {
  serverContent?: {
    inputTranscription?: { text?: string; languageCode?: string };
    outputTranscription?: { text?: string; languageCode?: string };
    modelTurn?: { parts?: Array<{ inlineData?: { data?: string } }> };
  };
}

export async function requestLiveToken(
  targetLanguageCode: string,
  echoTargetLanguage: boolean
): Promise<LiveTokenResponse> {
  const response = await fetch('/api/live-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetLanguageCode, echoTargetLanguage }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? 'Failed to create Live API token.');
  }

  return payload as LiveTokenResponse;
}

export class LiveTranslateClient {
  private session: Session | null = null;

  async start({ targetLanguageCode, echoTargetLanguage, callbacks }: LiveTranslateStartOptions): Promise<void> {
    const tokenResponse = await requestLiveToken(targetLanguageCode, echoTargetLanguage);
    const ai = new GoogleGenAI({
      apiKey: tokenResponse.token,
      httpOptions: { apiVersion: 'v1alpha' },
    });

    this.session = await ai.live.connect({
      model: tokenResponse.model,
      config: {
        responseModalities: [Modality.AUDIO],
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        contextWindowCompression: {
          triggerTokens: '0',
          slidingWindow: { targetTokens: '0' },
        },
        translationConfig: {
          targetLanguageCode,
          echoTargetLanguage,
        },
      },
      callbacks: {
        onopen: callbacks.onOpen,
        onmessage: (message: LiveMessage) => {
          const content = message.serverContent;
          const inputTranscript = content?.inputTranscription;
          const outputTranscript = content?.outputTranscription;

          if (inputTranscript?.text) {
            callbacks.onInputTranscript(inputTranscript.text, inputTranscript.languageCode);
          }

          if (outputTranscript?.text) {
            callbacks.onOutputTranscript(outputTranscript.text, outputTranscript.languageCode);
          }

          for (const part of content?.modelTurn?.parts ?? []) {
            const audioData = part.inlineData?.data;
            if (audioData) callbacks.onAudioChunk(audioData);
          }
        },
        onerror: (event: ErrorEvent) => {
          callbacks.onError(event.message || 'Live Translate session error.');
        },
        onclose: (event: CloseEvent) => {
          callbacks.onClose(event.reason);
        },
      },
    });
  }

  sendPcmChunk(base64Pcm: string): void {
    this.session?.sendRealtimeInput({
      audio: {
        data: base64Pcm,
        mimeType: 'audio/pcm;rate=16000',
      },
    });
  }

  close(): void {
    this.session?.close();
    this.session = null;
  }
}
