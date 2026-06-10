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
  // Top European & Global
  { code: 'en', englishName: 'English', nativeName: 'English', germanName: 'Englisch' },
  { code: 'de', englishName: 'German', nativeName: 'Deutsch', germanName: 'Deutsch' },
  { code: 'fr', englishName: 'French', nativeName: 'Français', germanName: 'Französisch' },
  { code: 'es', englishName: 'Spanish', nativeName: 'Español', germanName: 'Spanisch' },
  { code: 'it', englishName: 'Italian', nativeName: 'Italiano', germanName: 'Italienisch' },
  { code: 'pl', englishName: 'Polish', nativeName: 'Polski', germanName: 'Polnisch' },
  { code: 'uk', englishName: 'Ukrainian', nativeName: 'Українська', germanName: 'Ukrainisch' },
  { code: 'ru', englishName: 'Russian', nativeName: 'Русский', germanName: 'Russisch' },
  { code: 'tr', englishName: 'Turkish', nativeName: 'Türkçe', germanName: 'Türkisch' },
  { code: 'nl', englishName: 'Dutch', nativeName: 'Nederlands', germanName: 'Niederländisch' },
  { code: 'pt-PT', englishName: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', germanName: 'Portugiesisch (Portugal)' },
  { code: 'pt-BR', englishName: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', germanName: 'Portugiesisch (Brasil)' },
  { code: 'ro', englishName: 'Romanian', nativeName: 'Română', germanName: 'Rumänisch' },
  { code: 'el', englishName: 'Greek', nativeName: 'Ελληνικά', germanName: 'Griechisch' },
  { code: 'cs', englishName: 'Czech', nativeName: 'Čeština', germanName: 'Tschechisch' },
  { code: 'sv', englishName: 'Swedish', nativeName: 'Svenska', germanName: 'Schwedisch' },
  { code: 'hu', englishName: 'Hungarian', nativeName: 'Magyar', germanName: 'Ungarisch' },
  { code: 'bg', englishName: 'Bulgarian', nativeName: 'Български', germanName: 'Bulgarisch' },
  { code: 'sr', englishName: 'Serbian', nativeName: 'Српски', germanName: 'Serbisch' },
  { code: 'hr', englishName: 'Croatian', nativeName: 'Hrvatski', germanName: 'Kroatisch' },
  { code: 'sk', englishName: 'Slovak', nativeName: 'Slovenčina', germanName: 'Slowakisch' },
  { code: 'da', englishName: 'Danish', nativeName: 'Dansk', germanName: 'Dänisch' },
  { code: 'fi', englishName: 'Finnish', nativeName: 'Suomi', germanName: 'Finnisch' },
  { code: 'no', englishName: 'Norwegian', nativeName: 'Norsk', germanName: 'Norwegisch' },
  { code: 'sl', englishName: 'Slovenian', nativeName: 'Slovenščina', germanName: 'Slowenisch' },
  { code: 'sq', englishName: 'Albanian', nativeName: 'Shqip', germanName: 'Albanisch' },
  { code: 'lt', englishName: 'Lithuanian', nativeName: 'Lietuvių', germanName: 'Litauisch' },
  { code: 'lv', englishName: 'Latvian', nativeName: 'Latviešu', germanName: 'Lettisch' },
  { code: 'et', englishName: 'Estonian', nativeName: 'Eesti', germanName: 'Estnisch' },
  { code: 'mk', englishName: 'Macedonian', nativeName: 'Македонски', germanName: 'Mazedonisch' },
  { code: 'be', englishName: 'Belarusian', nativeName: 'Беларуская', germanName: 'Weißrussisch' },
  { code: 'is', englishName: 'Icelandic', nativeName: 'Íslenska', germanName: 'Isländisch' },
  { code: 'ca', englishName: 'Catalan', nativeName: 'Català', germanName: 'Katalanisch' },
  { code: 'eu', englishName: 'Basque', nativeName: 'Euskara', germanName: 'Baskisch' },
  { code: 'gl', englishName: 'Galician', nativeName: 'Galego', germanName: 'Galicisch' },
  
  // Asia
  { code: 'zh-Hans', englishName: 'Chinese (Simplified)', nativeName: '中文 (简体)', germanName: 'Chinesisch (Vereinfacht)' },
  { code: 'zh-Hant', englishName: 'Chinese (Traditional)', nativeName: '中文 (繁體)', germanName: 'Chinesisch (Traditionell)' },
  { code: 'hi', englishName: 'Hindi', nativeName: 'हिन्दी', germanName: 'Hindi' },
  { code: 'ja', englishName: 'Japanese', nativeName: '日本語', germanName: 'Japanisch' },
  { code: 'ko', englishName: 'Korean', nativeName: '한국어', germanName: 'Koreanisch' },
  { code: 'id', englishName: 'Indonesian', nativeName: 'Bahasa Indonesia', germanName: 'Indonesisch' },
  { code: 'vi', englishName: 'Vietnamese', nativeName: 'Tiếng Việt', germanName: 'Vietnamesisch' },
  { code: 'th', englishName: 'Thai', nativeName: 'ไทย', germanName: 'Thailändisch' },
  { code: 'fil', englishName: 'Filipino', nativeName: 'Filipino', germanName: 'Filipino' },
  { code: 'bn', englishName: 'Bengali', nativeName: 'বাংলা', germanName: 'Bengalisch' },
  { code: 'pa', englishName: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', germanName: 'Panjabi' },
  { code: 'te', englishName: 'Telugu', nativeName: 'తెలుగు', germanName: 'Telugu' },
  { code: 'mr', englishName: 'Marathi', nativeName: 'मराठी', germanName: 'Marathi' },
  { code: 'ta', englishName: 'Tamil', nativeName: 'தமிழ்', germanName: 'Tamil' },
  { code: 'ur', englishName: 'Urdu', nativeName: 'اردو', germanName: 'Urdu' },
  { code: 'gu', englishName: 'Gujarati', nativeName: 'ગુજરાતી', germanName: 'Gujarati' },
  { code: 'kn', englishName: 'Kannada', nativeName: 'ಕನ್ನಡ', germanName: 'Kannada' },
  { code: 'ml', englishName: 'Malayalam', nativeName: 'മലയാളം', germanName: 'Malayalam' },
  { code: 'ms', englishName: 'Malay', nativeName: 'Bahasa Melayu', germanName: 'Malaiisch' },
  { code: 'my', englishName: 'Burmese', nativeName: 'မြန်မာ', germanName: 'Birmanisch' },
  { code: 'km', englishName: 'Khmer', nativeName: 'ខ្មែរ', germanName: 'Khmer' },
  { code: 'lo', englishName: 'Lao', nativeName: 'ລາວ', germanName: 'Laotisch' },
  { code: 'si', englishName: 'Sinhala', nativeName: 'සිංහල', germanName: 'Singhalesisch' },
  { code: 'ne', englishName: 'Nepali', nativeName: 'नेपाली', germanName: 'Nepalesisch' },
  { code: 'jv', englishName: 'Javanese', nativeName: 'Jawa', germanName: 'Javanisch' },
  { code: 'su', englishName: 'Sundanese', nativeName: 'Sunda', germanName: 'Sundanesisch' },
  { code: 'fa', englishName: 'Persian', nativeName: 'فارسی', germanName: 'Persisch' },
  { code: 'ar', englishName: 'Arabic', nativeName: 'العربية', germanName: 'Arabisch' },
  { code: 'he', englishName: 'Hebrew', nativeName: 'עברית', germanName: 'Hebräisch' },
  { code: 'uz', englishName: 'Uzbek', nativeName: 'Oʻzbekcha', germanName: 'Usbekisch' },
  { code: 'kk', englishName: 'Kazakh', nativeName: 'Қазақша', germanName: 'Kasachisch' },
  { code: 'mn', englishName: 'Mongolian', nativeName: 'Монгол', germanName: 'Mongolisch' },
  { code: 'az', englishName: 'Azerbaijani', nativeName: 'Azərbaycanca', germanName: 'Aserbaidschanisch' },
  { code: 'hy', englishName: 'Armenian', nativeName: 'Հայերեն', germanName: 'Armenisch' },
  { code: 'ka', englishName: 'Georgian', nativeName: 'ქართული', germanName: 'Georgisch' },
  { code: 'sd', englishName: 'Sindhi', nativeName: 'سنڌي', germanName: 'Sindhi' },

  // Africa
  { code: 'sw', englishName: 'Swahili', nativeName: 'Kiswahili', germanName: 'Swahili' },
  { code: 'zu', englishName: 'Zulu', nativeName: 'isiZulu', germanName: 'Zulu' },
  { code: 'af', englishName: 'Afrikaans', nativeName: 'Afrikaans', germanName: 'Afrikaans' },
  { code: 'ha', englishName: 'Hausa', nativeName: 'Hausa', germanName: 'Hausa' },
  { code: 'am', englishName: 'Amharic', nativeName: 'አማርኛ', germanName: 'Amharisch' },
  { code: 'rw', englishName: 'Kinyarwanda', nativeName: 'Kinyarwanda', germanName: 'Kinyarwanda' },
  { code: 'ak', englishName: 'Akan', nativeName: 'Akan', germanName: 'Akan' },
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
