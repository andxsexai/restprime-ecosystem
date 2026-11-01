import { contentPlan } from '../data/contentPlan.js'
import { dateForDay, formatLong } from './planDates.js'

export const CONTACT_LINES = {
  address: 'д. Зайцево, ул. Сосновая, 3.',
  hours: 'Каждый день с 12:00 до 24:00.',
  phones: '+7 (495) 274-53-54 · +7 (929) 979-53-54',
  link: 'kedr-res.ru',
}

const WEEKDAY = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']

export function hashSeed(...parts) {
  let value = 2166136261
  for (const char of parts.join('|')) {
    value ^= char.codePointAt(0)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}

export function sentenceKey(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\d\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function capital(text) {
  const value = String(text || '').trim()
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

export function lineKeys(line) {
  return String(line || '').split(/(?<=[.!?…])\s+/).map(sentenceKey).filter(Boolean)
}

function pick(list, seed, used) {
  if (!list?.length) return ''
  for (let step = 0; step < list.length; step += 1) {
    const line = list[(seed + step) % list.length]
    if (!used || !lineKeys(line).some((key) => used.has(key))) return line
  }
  return ''
}

const SENSE = {
  Быт: [
    'Сосны по обе стороны дороги, и город остаётся где-то за спиной.',
    'За окном темнеет раньше, чем хочется, а в зале уже зажгли свет.',
    'Куртку можно повесить и забыть о ней до конца вечера.',
    'Трассы здесь не слышно, только посуду и негромкие разговоры.',
    'Телефон сам ложится экраном вниз.',
    'Первые десять минут после дороги просто сидят и молчат. Это нормально.',
    'Ключи от машины на краю стола, а торопиться уже некуда.',
  ],
  Меню: [
    'Сначала запах, потом уже меню.',
    'Тарелку приносят горячей, а разговор как раз доходит до главного.',
    'Состав написан честно, угадывать ничего не нужно.',
    'Вилка замирает на секунду, и за столом становится тише.',
    'Здесь едят не для фото, а потому что голодны.',
    'Хлеб заканчивается раньше, чем успевают договорить.',
    'Кухня не торопится, и это видно по тарелке.',
  ],
  Гости: [
    'Никто не смотрит на часы, и никто не торопит.',
    'Можно говорить вполголоса и всё слышать.',
    'У соседних столов свои разговоры, до вас им нет дела.',
    'Кто-то здесь впервые, кто-то уже знает свой стол у окна.',
    'Стулья отодвигают, когда разговор только начался.',
    'Смех за столом слышно, но он никому не мешает.',
  ],
  Зал: [
    'Дерево, мягкий свет и окна в сосны.',
    'В зале так тихо, что слышно, как ставят бокалы.',
    'Ближе к вечеру свет приглушают, и зал становится камернее.',
    'Скатерти ровные, приборы лежат там, где им положено.',
    'Снаружи хвоя, внутри дерево. Граница почти не чувствуется.',
  ],
  Напиток: [
    'Бокал держат дольше, чем пьют.',
    'Лёд звякает, и разговор становится тише.',
    'Такой напиток не торопят.',
    'Первый глоток, и дорога окончательно позади.',
  ],
  Повод: [
    'Повод не обязан быть громким, чтобы его отметить.',
    'Иногда лучший праздник обходится без ведущего и микрофона.',
    'Самые важные слова говорят не в тосте, а между блюдами.',
    'Дату запоминают по людям за столом, а не по декору.',
    'Шары и колонки можно оставить дома.',
  ],
}

const SENSE_CUP = [
  'Чашка остывает медленно, как и сам вечер.',
  'Над чашкой пар, за окном сосны.',
  'Кофе пьют маленькими глотками, чтобы не заканчивать разговор.',
  'Чайник ставят в середину стола, и все тянутся к нему по очереди.',
]

const SENSE_ANY = [
  'Здесь не нужно никуда успевать.',
  'Вечер идёт своим темпом.',
  'Город остался за поворотом.',
  'Меню можно листать медленно.',
]

const DISH_LINES = [
  (dish, price) => `${capital(dish)}${price ? ` — ${price}` : ''}.`,
  (dish, price) => `Из карты на этот вечер: ${dish}${price ? `, ${price}` : ''}.`,
  (dish, price) => `На стол — ${dish}${price ? `. ${price}` : ''}.`,
  (dish, price) => `Если нужна конкретика: ${dish}${price ? `, ${price}` : ''}.`,
  (dish, price) => `В меню «Кедра» это ${dish}${price ? `. ${price}` : ''}.`,
  (dish, price) => `Мы бы начали с этого: ${dish}${price ? `, ${price}` : ''}.`,
]

const HALL_LINES = [
  'В этом кадре нет тарелки. Есть зал: свет, дерево и тишина, пока гости ещё не сели.',
  'Сегодня без блюда в кадре. Только зал, каким его видят первые гости.',
  'Тарелки здесь не будет. Пусть сначала запомнится место.',
]

const CTA = [
  'Стол на этот вечер: kedr-res.ru',
  'Забронировать: kedr-res.ru',
  'Бронь на сайте — kedr-res.ru',
  'Если вечер ваш — kedr-res.ru',
  'Занять стол заранее: kedr-res.ru',
  'Ждём по брони: kedr-res.ru',
]

export const CLOSERS = [
  'Возвращайтесь, когда снова захочется тишины.',
  'Дорога обратно покажется короче.',
  'Сосны никуда не денутся, а стол лучше занять заранее.',
  'Остальное решится за столом.',
  'Приезжайте без повода, он найдётся по дороге.',
  'Можно не спешить: зал открыт до полуночи.',
  'Пусть вечер будет длиннее, чем планировали.',
  'Свободный стол у окна лучше не откладывать.',
]

export const RUBRICS = [
  { id: 'sense', title: 'Сенсорика' },
  { id: 'kitchen', title: 'Кухня изнутри' },
  { id: 'events', title: 'События' },
  { id: 'people', title: 'Люди' },
  { id: 'engage', title: 'Вовлечение' },
  { id: 'service', title: 'Сервис' },
]

const RUBRIC_ANGLES = {
  sense: ['Этот пост не про блюдо. Он про то, как здесь сидится.', 'Сначала атмосфера, потом меню.'],
  kitchen: ['Кухня не выходит в зал с речью. Она просто приносит тарелку.', 'Про кухню лучше всего говорит то, что остаётся на тарелке. То есть ничего.'],
  events: ['Свой праздник проще собрать за ужином, чем в переписке.', 'Зал можно закрыть под своих, без чужих столов рядом.'],
  people: ['Вечер держат люди за столом, не афиша.', 'Здесь важнее, с кем вы приехали, чем что заказали.'],
  engage: ['Как вам такой вечер: остаться за столом или ехать дальше? Напишите в комментариях.', 'Что вы заказываете первым, когда приезжаете голодными? Расскажите.'],
  service: ['Стол можно занять заранее, и он будет ждать.', 'Если дата уже есть, напишите нам, остальное подготовим.'],
}

export const BIRTHDAY_LINE = 'В день рождения, а также три дня до и три дня после, скидка 10% по меню.'

const SEASON_SCENES = {
  10: ['первый мокрый снег на ветках', 'ноябрьские сумерки в четыре часа', 'дорога после работы в пятницу'],
  11: ['декабрь, когда все ищут стол на праздники', 'гирлянда в окне и снег на крыльце', 'встреча старых друзей перед Новым годом', 'снег на крыльце и гирлянда над дверью'],
  0: ['каникулы, когда уже никуда не надо', 'морозный день и короткое солнце', 'январский вечер без суеты'],
  1: ['февральская метель за окном', 'ужин вдвоём в середине зимы', 'воскресный обед после лыжной прогулки'],
  2: ['март, когда снег ещё лежит, а свет уже весенний', 'семейный обед в выходной', 'вечер без повода посреди недели'],
  3: ['апрель, сосны пахнут сильнее', 'длинный светлый вечер', 'встреча после долгой зимы'],
  4: ['май, когда сосны пахнут смолой', 'первый тёплый вечер с открытым окном', 'обед после прогулки по лесу'],
  5: ['июнь, светло почти до полуночи', 'летний ужин после жаркого дня', 'компания друзей в пятницу'],
  6: ['июльский вечер, когда в городе душно', 'ужин после дачи', 'день рождения летом'],
  7: ['август и первые прохладные вечера', 'последние выходные лета', 'долгий семейный обед'],
  8: ['сентябрь, снова будни', 'первый дождливый вечер осени', 'встреча коллег после отпуска'],
  9: ['октябрь, листья на дороге', 'тёмный вечер и горящие окна', 'выходные без планов'],
}

const OCCASIONS = [
  { md: '11-04', label: '4 ноября — выходной', line: 'Четвёртое ноября — выходной. Можно выехать за город днём и вернуться к ночи.', pillars: ['Быт', 'Гости'] },
  { md: '11-29', label: '29 ноября — День матери', line: 'Двадцать девятое ноября — День матери. Хороший повод позвать маму на обед, где готовить будет не она.', pillars: ['Гости', 'Повод'] },
  { md: '12-31', label: '31 декабря', line: 'Последний день года. Кто-то ещё ищет, где его проводить.', pillars: ['Повод'] },
  { md: '01-07', label: '7 января — Рождество', line: 'Рождество — тихий день, когда хочется долгого обеда с близкими.', pillars: ['Гости'] },
  { md: '02-14', label: '14 февраля', line: 'Четырнадцатое февраля. Ужин вдвоём без сердечек на скатерти.', pillars: ['Гости', 'Повод'] },
  { md: '02-23', label: '23 февраля', line: 'Двадцать третье февраля. Можно отметить без банкетного зала и тостов по бумажке.', pillars: ['Повод'] },
  { md: '03-08', label: '8 марта', line: 'Восьмое марта. Цветы привезут, а стол лучше забронировать сейчас.', pillars: ['Повод'] },
  { md: '05-01', label: '1 мая', line: 'Майские начинаются. За городом в эти дни свободнее, чем кажется.', pillars: ['Быт'] },
  { md: '06-12', label: '12 июня — выходной', line: 'Двенадцатое июня — выходной. Длинный светлый день для обеда за городом.', pillars: ['Быт'] },
]

const RANGES = [
  { from: '12-01', to: '12-28', label: 'Декабрь: встречи перед праздниками', line: 'Декабрь — месяц встреч перед праздниками. Удобные даты разбирают первыми.', pillars: ['Повод', 'Зал', 'Гости'] },
  { from: '01-01', to: '01-08', label: 'Новогодние каникулы', line: 'Каникулы: можно не ставить будильник и приехать к обеду.', pillars: ['Быт', 'Гости'] },
]

const WEEKEND = {
  5: ['Пятница. Неделя закончилась, можно ехать сразу после работы.', 'В пятницу вечер начинается раньше, а зал открыт до полуночи.'],
  6: ['Суббота. Ни планов, ни будильника.', 'Субботний обед за городом длится сам собой.'],
  0: ['Воскресенье. Готовить дома необязательно.', 'В воскресенье можно приехать к обеду и остаться до вечера.'],
}

function md(date) {
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function occasionFor(date) {
  const key = md(date)
  const exact = OCCASIONS.find((item) => item.md === key)
  if (exact) return { ...exact, kind: 'date' }
  const range = RANGES.find((item) => key >= item.from && key <= item.to)
  if (range) return { ...range, kind: 'season' }
  return null
}

export function weekendLine(date, seed, used) {
  return pick(WEEKEND[date.getDay()], seed, used)
}

export function weekdayName(date) {
  return WEEKDAY[date.getDay()]
}

function priceOf(day) {
  const value = String(day?.margin || '').trim()
  return value && value !== 'зал' ? value : ''
}

function isHall(day) {
  return !day?.dish || String(day.dish).startsWith('без тарелки')
}

export function dishLine(day, seed, used) {
  if (isHall(day)) return pick(HALL_LINES, seed, used)
  const colon = String(day.dish).includes(':')
  const options = DISH_LINES.map((build) => build(day.dish, priceOf(day))).filter((line) => !colon || (line.match(/:/g) || []).length < 2)
  return pick(options, seed, used) || options[seed % options.length]
}

export function scenePara(day) {
  const source = day.day <= contentPlan.length ? contentPlan.find((item) => item.day === day.day) : null
  if (source && day.scene === source.scene) return source.postText.split('\n\n')[0]
  return `${capital(day.scene)}.`
}

export function senseLine(day, seed, used) {
  const pool = /капучино|раф|кофе|чай/i.test(day.dish || '') ? SENSE_CUP : SENSE[day.pillar] || []
  return pick(pool, seed, used) || pick(SENSE_ANY, seed, used)
}

export function closerFor(day, variant = 0) {
  return CLOSERS[hashSeed(day?.day ?? 0, variant, 'close') % CLOSERS.length]
}

export function composePost(day, options = {}) {
  const { topic, rubric, angle, used = new Set(), variant = 0 } = options
  const date = options.date || dateForDay(day.day)
  const seed = (slot) => hashSeed(day.day, variant, slot, day.scene)
  const occasion = options.occasion === undefined ? occasionFor(date) : options.occasion
  const take = (line) => {
    lineKeys(line).forEach((key) => used.add(key))
    return line
  }

  const timely = angle
    || (rubric ? pick(RUBRIC_ANGLES[rubric] || [], seed('rubric')) : '')
    || (occasion ? pick([occasion.line], 0, occasion.kind === 'date' ? null : used) : '')
    || (topic ? pick(topic.angles, seed('topic'), used) : '')
    || weekendLine(date, seed('weekend'), used)
  const lines = []
  if (timely) lines.push(take(timely))
  else lines.push(take(senseLine(day, seed('hook'), used)))
  lines.push(take(scenePara(day)))
  if (timely) {
    const sense = senseLine(day, seed('sense'), used)
    if (sense) lines.push(take(sense))
  }
  lines.push(take(dishLine(day, seed('dish'), used)))
  if ((/рожд/i.test(`${day.scene} ${day.title}`) || topic?.id === 'birthday') && !lines.some((line) => /10%/.test(line))) lines.push(BIRTHDAY_LINE)
  lines.push(pick(CTA, seed('cta')))
  return lines.filter(Boolean).join('\n\n')
}

export function composeWide(day, options = {}) {
  const used = options.used || new Set()
  const variant = options.variant || 0
  const seed = (slot) => hashSeed(day.day, variant, slot, 'wide')
  const short = composePost(day, { ...options, used }).split('\n\n')
  const body = short.slice(0, -1)
  const bridge = pick([
    'Свадьба, камерный семейный праздник, день рождения или просто желание никуда не спешить — территория «Кедра» собирает разные форматы. Детали держим под конкретный вечер, не под шаблон.',
    'Кто-то приезжает на обед вдвоём, кто-то собирает всю семью, кто-то закрывает зал под свой праздник. Под каждый формат мы готовим стол отдельно.',
    'Здесь одинаково хорошо и короткому обеду, и долгому празднику. Разница только в том, сколько стульев поставить.',
  ], seed('bridge'), used)
  const text = [
    `✨ ${day.title}`,
    ...body,
    bridge,
    `Зал стоит в соснах: ${CONTACT_LINES.address} ${CONTACT_LINES.hours}`,
    closerFor(day, variant),
    `📩 ${pick(CTA, seed('cta'))}`,
  ]
  return text.filter(Boolean).join('\n\n')
}

const SITUATIONS = [
  { scene: 'двое без повода', pillar: 'Гости', plates: [8, 23, 12, 24] },
  { scene: 'компания друзей не спешит', pillar: 'Гости', plates: [14, 10, 27, 3] },
  { scene: 'семейный обед', pillar: 'Гости', plates: [18, 25, 11, 21] },
  { scene: 'деловая встреча не в офисе', pillar: 'Повод', plates: [15, 9, 19, 28] },
  { scene: 'поздний ужин после работы', pillar: 'Быт', plates: [22, 13, 7, 17] },
  { scene: 'обед в выходной', pillar: 'Меню', plates: [11, 7, 21, 30] },
  { scene: 'первый визит', pillar: 'Меню', plates: [3, 2, 1, 26] },
  { scene: 'долгий разговор за чаем', pillar: 'Напиток', plates: [29, 9, 16, 26] },
  { scene: 'тихий день рождения', pillar: 'Повод', plates: [5, 26, 23] },
  { scene: 'зал перед открытием', pillar: 'Зал', plates: [4] },
]

export function seasonDay(date, index) {
  const situation = SITUATIONS[index % SITUATIONS.length]
  const season = SEASON_SCENES[date.getMonth()]
  const mood = season[Math.floor(index / SITUATIONS.length) % season.length]
  const plateDay = situation.plates[Math.floor(index / SITUATIONS.length) % situation.plates.length]
  const plate = contentPlan.find((item) => item.day === plateDay)
  const scene = `${situation.scene}: ${mood}`
  return { scene, pillar: situation.pillar, dish: plate.dish, margin: plate.margin, title: capital(scene) }
}

export function planLabel(day) {
  return formatLong(dateForDay(day.day))
}
