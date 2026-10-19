// ASL fingerspelling + common signs database with multilingual support

export type Locale = 'en' | 'ru' | 'uz'

export interface SignData {
  symbol: string           // The letter/word/number
  emoji: string            // Visual hint emoji
  description: Record<Locale, string>   // What this sign means
  category: 'letter' | 'number' | 'word'
  handShape: string        // Human-readable description of the hand shape
}

export const SIGNS: Record<string, SignData> = {
  A: {
    symbol: 'A', emoji: '✊', category: 'letter',
    handShape: 'Closed fist, thumb to the side',
    description: { en: 'Letter A', ru: 'Буква A', uz: 'A harfi' },
  },
  B: {
    symbol: 'B', emoji: '🖐', category: 'letter',
    handShape: 'Four fingers extended, thumb across palm',
    description: { en: 'Letter B', ru: 'Буква B', uz: 'B harfi' },
  },
  C: {
    symbol: 'C', emoji: '🤏', category: 'letter',
    handShape: 'Curved hand forming C shape',
    description: { en: 'Letter C', ru: 'Буква C', uz: 'C harfi' },
  },
  D: {
    symbol: 'D', emoji: '☝️', category: 'letter',
    handShape: 'Index extended up, others form circle with thumb',
    description: { en: 'Letter D', ru: 'Буква D', uz: 'D harfi' },
  },
  E: {
    symbol: 'E', emoji: '🤙', category: 'letter',
    handShape: 'All fingers bent at middle joint',
    description: { en: 'Letter E', ru: 'Буква E', uz: 'E harfi' },
  },
  F: {
    symbol: 'F', emoji: '👌', category: 'letter',
    handShape: 'Thumb + index form circle (OK), other 3 extended',
    description: { en: 'Letter F', ru: 'Буква F', uz: 'F harfi' },
  },
  G: {
    symbol: 'G', emoji: '👉', category: 'letter',
    handShape: 'Index + thumb pointing sideways horizontally',
    description: { en: 'Letter G', ru: 'Буква G', uz: 'G harfi' },
  },
  H: {
    symbol: 'H', emoji: '✌️', category: 'letter',
    handShape: 'Index + middle pointing sideways horizontally',
    description: { en: 'Letter H', ru: 'Буква H', uz: 'H harfi' },
  },
  I: {
    symbol: 'I', emoji: '🤙', category: 'letter',
    handShape: 'Pinky only extended',
    description: { en: 'Letter I', ru: 'Буква I', uz: 'I harfi' },
  },
  K: {
    symbol: 'K', emoji: '✌️', category: 'letter',
    handShape: 'Index + middle raised, thumb between them',
    description: { en: 'Letter K', ru: 'Буква K', uz: 'K harfi' },
  },
  L: {
    symbol: 'L', emoji: '🤙', category: 'letter',
    handShape: 'Index up, thumb out — forming L',
    description: { en: 'Letter L', ru: 'Буква L', uz: 'L harfi' },
  },
  O: {
    symbol: 'O', emoji: '👌', category: 'letter',
    handShape: 'All fingers and thumb form O circle',
    description: { en: 'Letter O', ru: 'Буква O', uz: 'O harfi' },
  },
  R: {
    symbol: 'R', emoji: '🤞', category: 'letter',
    handShape: 'Index + middle crossed (crossed fingers)',
    description: { en: 'Letter R', ru: 'Буква R', uz: 'R harfi' },
  },
  S: {
    symbol: 'S', emoji: '✊', category: 'letter',
    handShape: 'Fist with thumb over fingers',
    description: { en: 'Letter S', ru: 'Буква S', uz: 'S harfi' },
  },
  U: {
    symbol: 'U', emoji: '✌️', category: 'letter',
    handShape: 'Index + middle together, extended upward',
    description: { en: 'Letter U', ru: 'Буква U', uz: 'U harfi' },
  },
  V: {
    symbol: 'V', emoji: '✌️', category: 'letter',
    handShape: 'Index + middle spread apart upward (V sign)',
    description: { en: 'Letter V (peace)', ru: 'Буква V (мир)', uz: 'V harfi' },
  },
  W: {
    symbol: 'W', emoji: '🤟', category: 'letter',
    handShape: 'Index + middle + ring extended, spread',
    description: { en: 'Letter W', ru: 'Буква W', uz: 'W harfi' },
  },
  X: {
    symbol: 'X', emoji: '☝️', category: 'letter',
    handShape: 'Index finger hooked/bent',
    description: { en: 'Letter X', ru: 'Буква X', uz: 'X harfi' },
  },
  Y: {
    symbol: 'Y', emoji: '🤙', category: 'letter',
    handShape: 'Thumb + pinky extended (shaka/hang loose)',
    description: { en: 'Letter Y', ru: 'Буква Y', uz: 'Y harfi' },
  },
  '1': {
    symbol: '1', emoji: '☝️', category: 'number',
    handShape: 'Index finger only extended',
    description: { en: 'Number 1', ru: 'Цифра 1', uz: '1 raqami' },
  },
  '2': {
    symbol: '2', emoji: '✌️', category: 'number',
    handShape: 'Index + middle extended (V/peace sign)',
    description: { en: 'Number 2', ru: 'Цифра 2', uz: '2 raqami' },
  },
  '3': {
    symbol: '3', emoji: '🤟', category: 'number',
    handShape: 'Thumb + index + middle extended',
    description: { en: 'Number 3', ru: 'Цифра 3', uz: '3 raqami' },
  },
  '4': {
    symbol: '4', emoji: '🖖', category: 'number',
    handShape: 'Four fingers extended, thumb tucked',
    description: { en: 'Number 4', ru: 'Цифра 4', uz: '4 raqami' },
  },
  '5': {
    symbol: '5', emoji: '🖐', category: 'number',
    handShape: 'All five fingers spread open',
    description: { en: 'Number 5', ru: 'Цифра 5', uz: '5 raqami' },
  },
  'HELLO': {
    symbol: 'HELLO', emoji: '👋', category: 'word',
    handShape: 'Open hand near forehead, sweep outward (salute)',
    description: { en: 'Hello / Hi', ru: 'Привет', uz: 'Salom' },
  },
  'THANK_YOU': {
    symbol: 'THANK YOU', emoji: '🙏', category: 'word',
    handShape: 'Flat hand from chin, forward and downward',
    description: { en: 'Thank you', ru: 'Спасибо', uz: 'Rahmat' },
  },
  'YES': {
    symbol: 'YES', emoji: '👍', category: 'word',
    handShape: 'Fist nodding (like a head nod)',
    description: { en: 'Yes', ru: 'Да', uz: 'Ha' },
  },
  'NO': {
    symbol: 'NO', emoji: '👎', category: 'word',
    handShape: 'Index + middle fingers snap to thumb',
    description: { en: 'No', ru: 'Нет', uz: "Yo'q" },
  },
  'HELP': {
    symbol: 'HELP', emoji: '🆘', category: 'word',
    handShape: 'Fist (thumb up) on open palm, raise both hands',
    description: { en: 'Help / SOS', ru: 'Помощь', uz: 'Yordam' },
  },
  'LOVE': {
    symbol: 'LOVE', emoji: '🤟', category: 'word',
    handShape: 'ILY sign: thumb + index + pinky extended (I Love You)',
    description: { en: 'I Love You', ru: 'Я тебя люблю', uz: "Seni sevaman" },
  },
}

export const ALPHABET = 'ABCDEGHIKLORSUVWY'.split('')
export const NUMBERS = ['1', '2', '3', '4', '5']
export const COMMON_WORDS = ['HELLO', 'THANK_YOU', 'YES', 'NO', 'HELP', 'LOVE']

export const UI_STRINGS: Record<string, Record<Locale, string>> = {
  tagline: {
    en: 'Real-time sign language AI',
    ru: 'ИИ жестового языка в реальном времени',
    uz: "Real vaqtda ishoralar tili YI",
  },
  startInterpreting: {
    en: 'Start interpreting',
    ru: 'Начать интерпретацию',
    uz: 'Talqinni boshlash',
  },
  waitingForHand: {
    en: 'Show your hand to the camera',
    ru: 'Покажите руку камере',
    uz: "Qo'lingizni kameraga ko'rsating",
  },
  detecting: {
    en: 'Hand detected — analyzing…',
    ru: 'Рука обнаружена — анализирую…',
    uz: "Qo'l aniqlandi — tahlil qilinmoqda…",
  },
  clearWord: {
    en: 'Clear',
    ru: 'Очистить',
    uz: 'Tozalash',
  },
  speakWord: {
    en: 'Speak',
    ru: 'Прочитать',
    uz: "O'qish",
  },
  confidence: {
    en: 'Confidence',
    ru: 'Уверенность',
    uz: 'Ishonch',
  },
  howItWorks: {
    en: 'How it works',
    ru: 'Как это работает',
    uz: 'Qanday ishlaydi',
  },
  modelLoading: {
    en: 'Loading hand tracking AI…',
    ru: 'Загружаю ИИ отслеживания рук…',
    uz: "Qo'l kuzatish YI yuklanmoqda…",
  },
  globalDeaf: {
    en: '70M+ deaf people. Zero free tools. Until now.',
    ru: '70+ млн глухих людей. Ноль бесплатных инструментов. До сих пор.',
    uz: "70M+ kar odamlar. Birorta ham bepul vosita yo'q. Hozirgacha.",
  },
}
