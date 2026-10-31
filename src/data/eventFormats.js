export const EVENT_FORMATS = [
  { id: 'cinema', title: 'Просмотр кино', note: 'тёмный зал, один стол, без суеты' },
  { id: 'mafia', title: 'Мафия', note: 'компания, которая уже договорилась об игре' },
  { id: 'yoga', title: 'После йоги', note: 'приехали спокойные, есть хочется не спеша' },
  { id: 'tea', title: 'Чайная церемония', note: 'долгий стол, разговор тише обычного' },
  { id: 'birthday', title: 'День рождения', note: 'скидка 10% в меню: день, три до и три после' },
  { id: 'date', title: 'Свидание', note: 'двое, без сценария на весь вечер' },
  { id: 'family', title: 'Семейный обед', note: 'несколько поколений за одним столом' },
  { id: 'business', title: 'Деловой ужин', note: 'разговор, который не хочется вести в переговорке' },
  { id: 'friends', title: 'Свои', note: 'компания, которой не нужно объяснять место' },
  { id: 'sunday', title: 'Тихое воскресенье', note: 'день без повода и без дресс-кода' },
  { id: 'kids', title: 'Дети за столом', note: 'взрослым своё, детям своё' },
  { id: 'drinks', title: 'Вечер с картой напитков', note: 'без названий, которых нет в меню' },
  { id: 'fireplace', title: 'У камина', note: 'если в зале тепло и никуда не надо' },
  { id: 'anniversary', title: 'Годовщина', note: 'дата уже есть, стол лучше занять заранее' },
  { id: 'small-company', title: 'Небольшая компания', note: 'до десяти, без банкета' },
  { id: 'proposal', title: 'Помолвка', note: 'короткий повод, длинный вечер' },
  { id: 'after-show', title: 'После спектакля', note: 'приехали поздно и хотят сесть' },
  { id: 'books', title: 'Книжный стол', note: 'читают вслух или просто приносят книгу' },
  { id: 'games', title: 'Настольные игры', note: 'стол остаётся столом, не сценой' },
  { id: 'tasting', title: 'Стол по меню', note: 'несколько позиций из карты этого дня' },
  { id: 'window', title: 'Стол у окна', note: 'сосны ближе, чем зал' },
  { id: 'late', title: 'Поздний ужин', note: 'зал ещё открыт, до 24:00' },
  { id: 'two-families', title: 'Две семьи', note: 'знакомство за едой, не за речью' },
  { id: 'weekday-date', title: 'Свидание в будни', note: 'вечер среди недели, без праздника' },
  { id: 'no-plan', title: 'Без сценария', note: 'приехали, потому что дорога уже привела' },
  { id: 'just-sit', title: 'Просто посидеть', note: 'нет повода, и это нормальный повод' },
  { id: 'road', title: 'После дороги', note: 'Зайцево, сосны, хочется остаться' },
  { id: 'rain', title: 'Дождь снаружи', note: 'внутри сухо, пальто на спинке' },
  { id: 'first-time', title: 'Первый визит', note: 'меню можно не знать наизусть' },
  { id: 'return', title: 'Вернулись', note: 'уже были и знают, куда сесть' },
]

const GAME_IDS = new Set(['cinema', 'mafia', 'games'])

export function formatGroup(format) {
  return GAME_IDS.has(format?.id) ? 'игры' : 'стол'
}

export const THEME_SOURCES = {
  игры: [
    { title: 'Афиша. Рестораны', place: 'Москва', url: 'https://www.afisha.ru/msk/restaurants/' },
    { title: 'Time Out Moscow', place: 'Москва', url: 'https://www.timeout.com/moscow/restaurants' },
    { title: 'Great List', place: 'Москва', url: 'https://greatlist.ru/' },
  ],
  стол: [
    { title: 'Restoclub', place: 'Москва', url: 'https://www.restoclub.ru/' },
    { title: 'Гастрономъ', place: 'Москва', url: 'https://www.gastronom.ru/' },
    { title: 'Michelin. Москва', place: 'Мир', url: 'https://guide.michelin.com/ru/ru/moscow-region/moscow/restaurants' },
    { title: 'The World’s 50 Best', place: 'Мир', url: 'https://www.theworlds50best.com/list/1-50' },
    { title: 'Eater', place: 'Мир', url: 'https://www.eater.com/' },
  ],
}
