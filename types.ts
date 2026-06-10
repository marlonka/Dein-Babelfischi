export enum AppState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  LIVE = 'LIVE',
}

export enum MessageDirection {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
}

export interface LanguageOption {
  code: string;
  englishName: string;
  nativeName: string;
  germanName: string;
}

export const LIVE_TRANSLATE_LANGUAGES: LanguageOption[] = [
  { code: 'en', englishName: 'English', nativeName: 'English', germanName: 'Englisch' },
  { code: 'de', englishName: 'German', nativeName: 'Deutsch', germanName: 'Deutsch' },
  { code: 'pl', englishName: 'Polish', nativeName: 'Polski', germanName: 'Polnisch' },
  { code: 'tr', englishName: 'Turkish', nativeName: 'Türkçe', germanName: 'Türkisch' },
  { code: 'ro', englishName: 'Romanian', nativeName: 'Română', germanName: 'Rumänisch' },
  { code: 'es', englishName: 'Spanish', nativeName: 'Español', germanName: 'Spanisch' },
  { code: 'fr', englishName: 'French', nativeName: 'Français', germanName: 'Französisch' },
  { code: 'it', englishName: 'Italian', nativeName: 'Italiano', germanName: 'Italienisch' },
  { code: 'pt-BR', englishName: 'Portuguese (Brazil)', nativeName: 'Portugues', germanName: 'Portugiesisch' },
  { code: 'nl', englishName: 'Dutch', nativeName: 'Nederlands', germanName: 'Niederländisch' },
  { code: 'uk', englishName: 'Ukrainian', nativeName: 'Ukrainian', germanName: 'Ukrainisch' },
  { code: 'ru', englishName: 'Russian', nativeName: 'Russian', germanName: 'Russisch' },
  { code: 'ar', englishName: 'Arabic', nativeName: 'Arabic', germanName: 'Arabisch' },
  { code: 'hi', englishName: 'Hindi', nativeName: 'Hindi', germanName: 'Hindi' },
  { code: 'ja', englishName: 'Japanese', nativeName: 'Japanese', germanName: 'Japanisch' },
  { code: 'ko', englishName: 'Korean', nativeName: 'Korean', germanName: 'Koreanisch' },
  { code: 'zh-Hans', englishName: 'Chinese (Simplified)', nativeName: 'Chinese', germanName: 'Chinesisch' },
  { code: 'id', englishName: 'Indonesian', nativeName: 'Bahasa Indonesia', germanName: 'Indonesisch' },
  { code: 'th', englishName: 'Thai', nativeName: 'Thai', germanName: 'Thailändisch' },
  { code: 'vi', englishName: 'Vietnamese', nativeName: 'Tieng Viet', germanName: 'Vietnamesisch' },
  { code: 'bn', englishName: 'Bengali', nativeName: 'Bangla', germanName: 'Bengalisch' },
  { code: 'ta', englishName: 'Tamil', nativeName: 'Tamil', germanName: 'Tamil' },
  { code: 'te', englishName: 'Telugu', nativeName: 'Telugu', germanName: 'Telugu' },
  { code: 'mr', englishName: 'Marathi', nativeName: 'Marathi', germanName: 'Marathi' },
];

export const DEFAULT_TARGET_LANGUAGE_CODE = 'en';

export function getLanguageByCode(code: string): LanguageOption {
  return LIVE_TRANSLATE_LANGUAGES.find((language) => language.code === code) ?? LIVE_TRANSLATE_LANGUAGES[0];
}

export function getGermanLanguageNameByCode(code: string): string {
  const normalizedCode = code.toLowerCase();
  const language = LIVE_TRANSLATE_LANGUAGES.find((option) => {
    const optionCode = option.code.toLowerCase();
    return normalizedCode === optionCode || normalizedCode.startsWith(`${optionCode}-`);
  });

  return language?.germanName ?? code.toUpperCase();
}

export interface ConversationBubbleMessage {
  id: number;
  type: 'CONVERSATION';
  direction: MessageDirection;
  sourceLang?: string;
  targetLang: string;
  transcription: string;
  translation: string;
  audioChunks: string[];
  isLive?: boolean;
}

export interface LiveTokenResponse {
  token: string;
  model: string;
  expireTime?: string;
}
