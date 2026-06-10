import React, { useEffect, useRef, useState } from 'react';
import { ConversationBubbleMessage } from '../types';

const SpeakerIcon = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);

const CopyIcon = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7.5V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1.5M6 8.5h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
  </svg>
);

const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

interface ConversationBubbleProps {
  message: ConversationBubbleMessage;
  onReplay: (message: ConversationBubbleMessage) => void;
}

export const ConversationBubble: React.FC<ConversationBubbleProps> = ({ message, onReplay }) => {
  const [copied, setCopied] = useState(false);
  const sourceTextRef = useRef<HTMLParagraphElement>(null);
  const translationTextRef = useRef<HTMLParagraphElement>(null);
  const sourceLabel = message.sourceLang || 'Sprache';
  const canReplay = message.audioChunks.length > 0;

  useEffect(() => {
    const sourceNode = sourceTextRef.current;
    const translationNode = translationTextRef.current;
    if (sourceNode) sourceNode.scrollTop = sourceNode.scrollHeight;
    if (translationNode) translationNode.scrollTop = translationNode.scrollHeight;
  }, [message.transcription, message.translation]);

  const handleCopy = async () => {
    const text = `${sourceLabel}: ${message.transcription}\n${message.targetLang}: ${message.translation}`.trim();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="flex w-full justify-center animate-fade-in-up">
      <article className="relative w-full max-w-2xl px-2 py-2 md:px-4">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-[#c3002d]">Erkannt: {sourceLabel}</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-500">Ausgabe: {message.targetLang}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onReplay(message)}
              disabled={!canReplay}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Übersetzung noch einmal abspielen"
            >
              <SpeakerIcon />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900 hover:shadow-sm"
              aria-label="Text kopieren"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </header>

        <div className="grid gap-4">
          <p ref={sourceTextRef} className="five-line-scroll min-h-7 text-lg leading-7 text-slate-500 md:text-xl md:leading-8">
            {message.transcription || <span className="shimmer-text">Ich höre zu...</span>}
          </p>
          <p ref={translationTextRef} className="five-line-scroll min-h-10 text-2xl font-semibold leading-tight text-[#373737] md:text-3xl">
            {message.translation || <span className="text-slate-300">Die Übersetzung erscheint hier</span>}
            {message.isLive && <span className="blinking-cursor">|</span>}
          </p>
        </div>
      </article>
    </div>
  );
};
