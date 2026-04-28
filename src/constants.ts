import { Language, PillarData } from "./types";
import { PILLAR_DATA as data } from "./data/PILLAR_DATA";

export const LANGUAGES: Language[] = [
  { id: "en", name: "English", flag: "🇺🇸", code: "en-US" },
  { id: "fr", name: "French", flag: "🇫🇷", code: "fr-FR" },
  { id: "de", name: "German", flag: "🇩🇪", code: "de-DE" },
  { id: "es", name: "Spanish", flag: "🇪🇸", code: "es-ES" },
  { id: "ja", name: "Japanese", flag: "🇯🇵", code: "ja-JP" },
  { id: "ko", name: "Korean", flag: "🇰🇷", code: "ko-KR" },
];

export const PILLAR_DATA: Record<string, PillarData> = data;
