import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomControls } from './components/BottomControls';
import { ConversationBubble } from './components/ConversationBubble';
import { useLiveMicrophone } from './hooks/useLiveMicrophone';
import { LiveTranslateClient } from './services/liveTranslateService';
import {
  AppState,
  ConversationBubbleMessage,
  DEFAULT_TARGET_LANGUAGE_CODE,
  getGermanLanguageNameByCode,
  getLanguageByCode,
  MessageDirection,
} from './types';
import { PcmAudioQueue } from './utils/pcmAudioQueue';

const BabelfischiLogo = ({ className = 'w-32 h-32' }) => (
  <svg className={className} viewBox="0 0 160 160" role="img" aria-label="Dein Babelfischi Logo" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bowl-water" cx="45%" cy="55%" r="60%">
        <stop offset="0%" stopColor="#a3e6f5" stopOpacity="0.4" />
        <stop offset="65%" stopColor="#30c5eb" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#0a89b3" stopOpacity="0.9" />
      </radialGradient>
      
      <linearGradient id="glass-reflection" x1="10%" y1="10%" x2="90%" y2="90%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="25%" stopColor="#ffffff" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      <linearGradient id="fish-body" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="25%" stopColor="#8b5cf6" />
        <stop offset="50%" stopColor="#ec4899" />
        <stop offset="75%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#eab308" />
      </linearGradient>
      
      <linearGradient id="fish-fin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>

      <radialGradient id="cheek-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>

      <filter id="fish-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <filter id="bowl-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="16" stdDeviation="12" floodColor="#061c2b" floodOpacity="0.15" />
      </filter>
    </defs>

    <ellipse cx="80" cy="148" rx="42" ry="10" fill="#000000" opacity="0.3" filter="url(#bowl-shadow)" />

    {/* Magical Water Orb */}
    <circle cx="80" cy="85" r="60" fill="url(#bowl-water)" />
    
    <g className="babelfischi-bubbles" fill="#ffffff">
      <circle cx="106" cy="85" r="2" />
      <circle cx="109" cy="76" r="3" />
      <circle cx="105" cy="68" r="1.8" />
      <circle cx="110" cy="58" r="3.5" />
    </g>

    <g className="babelfischi-fish" filter="url(#fish-glow)">
      <path className="babelfischi-tail" d="M48 88 C 30 75, 25 80, 20 68 C 30 90, 25 102, 20 115 C 32 105, 38 108, 48 98 Z" fill="url(#fish-fin)" />
      <path className="babelfischi-fin-top" d="M65 76 C 75 58, 88 62, 98 78 Z" fill="url(#fish-fin)" opacity="0.9" />
      <path className="babelfischi-fin-bottom" d="M72 105 C 82 120, 88 116, 95 102 Z" fill="url(#fish-fin)" opacity="0.9" />
      <path d="M48 92 C 48 68, 80 62, 102 74 C 120 82, 125 96, 118 105 C 108 118, 80 118, 48 92 Z" fill="url(#fish-body)" />
      
      <circle cx="104" cy="85" r="4" fill="#1f1400" />
      <circle cx="105.5" cy="83.5" r="1.5" fill="#ffffff" />
      <circle cx="95" cy="95" r="7" fill="url(#cheek-glow)" />

      <path d="M110 96 C 114 98, 116 97, 118 94" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
      
      <path className="babelfischi-marking" d="M62 86 C 68 92, 72 86, 78 96" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      <path className="babelfischi-marking" d="M78 82 C 84 88, 88 82, 94 92" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      
      <path className="babelfischi-fin-side" d="M82 92 C 72 98, 65 96, 75 88 Z" fill="url(#fish-fin)" opacity="0.95" />
    </g>

    {/* Orb Front Reflections */}
    <circle cx="80" cy="85" r="60" fill="none" stroke="#ffffff" strokeWidth="4" opacity="0.3" />
    <circle cx="80" cy="85" r="60" fill="url(#glass-reflection)" />
  </svg>
);

function mergeTranscript(previous: string, nextChunk: string): string {
  const next = nextChunk.trim();
  if (!next) return previous;
  if (!previous) return next;

  const normalizedPrevious = previous.trim();
  if (next === normalizedPrevious) return previous;
  if (next.startsWith(normalizedPrevious)) return next;

  const lowerPrevious = normalizedPrevious.toLowerCase();
  const lowerNext = next.toLowerCase();
  if (lowerPrevious.endsWith(lowerNext)) return previous;

  return `${normalizedPrevious} ${next}`.replace(/\s+/g, ' ').trim();
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [targetLanguageCode, setTargetLanguageCode] = useState(DEFAULT_TARGET_LANGUAGE_CODE);
  const [echoTargetLanguage, setEchoTargetLanguage] = useState(false);
  const [autoPlayback, setAutoPlayback] = useState(true);
  const [conversation, setConversation] = useState<ConversationBubbleMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const activeMessageIdRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const liveClientRef = useRef<LiveTranslateClient | null>(null);
  const playbackQueueRef = useRef<PcmAudioQueue | null>(null);

  const targetLanguage = useMemo(() => getLanguageByCode(targetLanguageCode), [targetLanguageCode]);
  const { amplitude, start: startMicrophone, stop: stopMicrophone } = useLiveMicrophone();

  const closeLiveClient = useCallback(() => {
    liveClientRef.current?.close();
  }, []);

  useEffect(() => {
    const playbackQueue = new PcmAudioQueue();
    playbackQueueRef.current = playbackQueue;
    return () => {
      closeLiveClient();
      stopMicrophone();
      playbackQueue.close();
    };
  }, [closeLiveClient, stopMicrophone]);

  useEffect(() => {
    const node = scrollContainerRef.current;
    if (!node) return;

    const timer = window.setTimeout(() => {
      node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [conversation.length]);

  const stopLiveSession = useCallback(() => {
    const activeMessageId = activeMessageIdRef.current;
    liveClientRef.current?.close();
    liveClientRef.current = null;
    stopMicrophone();
    playbackQueueRef.current?.stop();

    setConversation((current) =>
      current.map((message) =>
        message.type === 'CONVERSATION' && message.id === activeMessageId
          ? { ...message, isLive: false }
          : message
      )
    );

    activeMessageIdRef.current = null;
    setAppState(AppState.IDLE);
  }, [stopMicrophone]);

  const startLiveSession = useCallback(async () => {
    setError(null);
    setAppState(AppState.CONNECTING);

    const messageId = Date.now();
    const initialMessage: ConversationBubbleMessage = {
      id: messageId,
      type: 'CONVERSATION',
      direction: MessageDirection.RIGHT,
      sourceLang: undefined,
      targetLang: targetLanguage.germanName,
      transcription: '',
      translation: '',
      audioChunks: [],
      isLive: true,
    };

    setConversation([initialMessage]);
    activeMessageIdRef.current = messageId;

    const client = new LiveTranslateClient();
    liveClientRef.current = client;

    try {
      await client.start({
        targetLanguageCode,
        echoTargetLanguage,
        callbacks: {
          onOpen: () => {
            setAppState(AppState.LIVE);
          },
          onInputTranscript: (text, languageCode) => {
            setConversation((current) =>
              current.map((message) =>
                message.type === 'CONVERSATION' && message.id === messageId
                  ? {
                      ...message,
                      sourceLang: languageCode ? getGermanLanguageNameByCode(languageCode) : message.sourceLang,
                      transcription: mergeTranscript(message.transcription, text),
                    }
                  : message
              )
            );
          },
          onOutputTranscript: (text) => {
            setConversation((current) =>
              current.map((message) =>
                message.type === 'CONVERSATION' && message.id === messageId
                  ? { ...message, translation: mergeTranscript(message.translation, text) }
                  : message
              )
            );
          },
          onAudioChunk: (base64Pcm) => {
            setConversation((current) =>
              current.map((message) =>
                message.type === 'CONVERSATION' && message.id === messageId
                  ? { ...message, audioChunks: [...message.audioChunks, base64Pcm] }
                  : message
              )
            );

            if (autoPlayback) {
              playbackQueueRef.current?.enqueue(base64Pcm);
            }
          },
          onClose: (reason) => {
            if (reason && reason !== 'Turn complete') {
              setError(reason);
            }
          },
          onError: (message) => {
            setError(message);
            stopLiveSession();
          },
        },
      });

      await startMicrophone((base64Pcm) => {
        client.sendPcmChunk(base64Pcm);
      });
    } catch (event) {
      const message = event instanceof Error ? event.message : String(event);
      setError(message);
      client.close();
      setConversation((current) => current.filter((item) => item.id !== messageId));
      activeMessageIdRef.current = null;
      setAppState(AppState.IDLE);
    }
  }, [autoPlayback, echoTargetLanguage, startMicrophone, stopLiveSession, targetLanguage.germanName, targetLanguageCode]);

  const handleMicToggle = () => {
    if (appState === AppState.LIVE || appState === AppState.CONNECTING) {
      stopLiveSession();
      return;
    }

    startLiveSession();
  };

  const handleGoHome = () => {
    if (appState === AppState.LIVE || appState === AppState.CONNECTING) {
      stopLiveSession();
    }
    setConversation([]);
    setAppState(AppState.IDLE);
    setError(null);
  };

  const handleTargetLanguageChange = (code: string) => {
    setTargetLanguageCode(code);
  };

  const handleReplay = (message: ConversationBubbleMessage) => {
    playbackQueueRef.current?.replay(message.audioChunks);
  };

  const liveCaption = appState === AppState.CONNECTING
    ? 'Verbindung wird aufgebaut...'
    : appState === AppState.LIVE
      ? `Sag etwas. Dein Babelfischi spricht ${targetLanguage.germanName}.`
      : 'Wähle die Sprache aus, die herauskommen soll.';

  return (
    <div className="flex h-[100dvh] flex-col bg-[#faf8f3] text-[#373737]">
      <header className="grid min-h-16 shrink-0 place-items-center px-4 py-2">
        <div className="grid w-full gap-0.5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c3002d]">Dein Babelfischi</p>
          <p className="truncate text-sm font-medium text-slate-600">{liveCaption}</p>
        </div>
      </header>

      <main ref={scrollContainerRef} className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        {conversation.length === 0 && appState === AppState.IDLE ? (
          <section className="mx-auto flex w-full max-w-2xl flex-col items-center px-2 pt-6 pb-8 text-center">
            <div className="grid max-w-xl gap-4 animate-fade-in-up">
              <div className="mx-auto flex items-center justify-center">
                <BabelfischiLogo />
              </div>
              <div>
                <h1 className="text-5xl font-semibold tracking-normal text-[#373737] md:text-6xl">
                  Dein Babelfischi.
                </h1>
                <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-500">
                  Wähle unten die Sprache aus, drück Starten und rede einfach los. Dein Babelfischi hört zu und spricht die Übersetzung für dich.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center gap-6 px-2 py-8">
            {conversation.map((message) => (
              <ConversationBubble key={message.id} message={message} onReplay={handleReplay} />
            ))}
          </section>
        )}
      </main>

      {error && (
        <div className="fixed bottom-32 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-[#c3002d] px-4 py-3 text-center text-sm font-medium text-white shadow-xl animate-fade-in-up">
          {error}
        </div>
      )}

      <BottomControls
        appState={appState}
        amplitude={amplitude}
        targetLanguage={targetLanguage}
        echoTargetLanguage={echoTargetLanguage}
        autoPlayback={autoPlayback}
        hasConversation={conversation.length > 0}
        onTargetLanguageChange={handleTargetLanguageChange}
        onEchoTargetLanguageToggle={() => setEchoTargetLanguage((value) => !value)}
        onAutoPlaybackToggle={() => setAutoPlayback((value) => !value)}
        onMicToggle={handleMicToggle}
        onGoHome={handleGoHome}
      />
    </div>
  );
};

export default App;
