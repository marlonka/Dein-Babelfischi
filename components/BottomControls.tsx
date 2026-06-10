import React from 'react';
import { AppState, LanguageOption, LIVE_TRANSLATE_LANGUAGES } from '../types';

const MicIcon = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
  </svg>
);

const StopIcon = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M8 8h8v8H8z" />
  </svg>
);

const HomeIcon = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const VolumeIcon = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);

const MutedIcon = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);

const Waveform: React.FC<{ amplitude: number }> = ({ amplitude }) => {
  const height = (factor: number) => Math.max(7, Math.min(32, amplitude * 260 * factor));
  return (
    <div className="flex h-8 items-center justify-center gap-1.5">
      <span className="w-2 rounded-full bg-white transition-all duration-75" style={{ height: height(1.1) }} />
      <span className="w-2 rounded-full bg-white transition-all duration-75" style={{ height: height(1.7) }} />
      <span className="w-2 rounded-full bg-white transition-all duration-75" style={{ height: height(1.25) }} />
    </div>
  );
};

interface BottomControlsProps {
  appState: AppState;
  amplitude: number;
  targetLanguage: LanguageOption;
  echoTargetLanguage: boolean;
  autoPlayback: boolean;
  onTargetLanguageChange: (code: string) => void;
  onEchoTargetLanguageToggle: () => void;
  onAutoPlaybackToggle: () => void;
  onMicToggle: () => void;
  hasConversation: boolean;
  onGoHome: () => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  appState,
  amplitude,
  targetLanguage,
  echoTargetLanguage,
  autoPlayback,
  onTargetLanguageChange,
  onEchoTargetLanguageToggle,
  onAutoPlaybackToggle,
  onMicToggle,
  hasConversation,
  onGoHome,
}) => {
  const isLive = appState === AppState.LIVE;
  const isConnecting = appState === AppState.CONNECTING;

  return (
    <footer className="shrink-0 border-t border-stone-200 bg-white/90 px-4 py-4 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-xl gap-4">
        <div className="grid grid-cols-2 items-end gap-4">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Übersetzen in</span>
            <select
              value={targetLanguage.code}
              onChange={(event) => onTargetLanguageChange(event.target.value)}
              disabled={appState !== AppState.IDLE}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold text-slate-800 shadow-inner outline-none transition focus:border-[#c3002d] disabled:cursor-not-allowed disabled:opacity-70"
              aria-label="Zielsprache auswählen"
            >
              {LIVE_TRANSLATE_LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.germanName}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onMicToggle}
            disabled={isConnecting}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#c3002d] px-4 text-white shadow-lg shadow-red-900/20 transition duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
            aria-label={isLive ? 'Übersetzung stoppen' : 'Übersetzung starten'}
          >
            {isConnecting ? (
              <span className="flex items-center gap-3 text-base font-semibold">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Verbinde...
              </span>
            ) : isLive ? (
              <span className="flex items-center gap-3 text-base font-bold">
                <StopIcon />
                Stoppen
                <span className="ml-1 scale-75 opacity-90">
                  <Waveform amplitude={amplitude} />
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-base font-bold">
                <MicIcon />
                Übersetzung starten
              </span>
            )}
          </button>
        </div>

        <div className="flex min-h-[28px] items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onGoHome}
              disabled={!hasConversation}
              className="flex items-center justify-center rounded-full p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
              aria-label="Zurück zur Startseite"
            >
              <HomeIcon className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onAutoPlaybackToggle}
              className={`flex items-center gap-2 text-sm font-medium transition hover:text-slate-900 ${autoPlayback ? 'text-slate-700' : 'text-slate-400'}`}
              aria-label={autoPlayback ? 'Ton ist an' : 'Ton ist aus'}
            >
              {autoPlayback ? <VolumeIcon /> : <MutedIcon />}
              <span>{autoPlayback ? 'Ton an' : 'Ton aus'}</span>
            </button>
          </div>

          {!isLive && (
            <button
              type="button"
              onClick={onEchoTargetLanguageToggle}
              disabled={appState !== AppState.IDLE}
              className="flex items-center gap-3 text-sm font-medium text-slate-700 disabled:opacity-70"
              aria-pressed={echoTargetLanguage}
            >
              <span>{targetLanguage.germanName} auch vorlesen</span>
              <span className={`relative h-7 w-12 rounded-full transition ${echoTargetLanguage ? 'bg-[#c3002d]' : 'bg-slate-300'}`}>
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${echoTargetLanguage ? 'left-6' : 'left-1'}`} />
              </span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
