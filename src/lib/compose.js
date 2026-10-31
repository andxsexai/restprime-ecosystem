import { CLOSERS, CONTACT_LINES, capital, closerFor, composePost, composeWide, dishLine, hashSeed } from './writer.js'
import { topicsOf } from './signals.js'

const WIDE_LIMIT = 500

export function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length
}

export const POST_EXTENSIONS = [
  { id: 'booking', label: 'Бронь', has: /kedr-res\.ru/i, build: () => '📩 Стол можно занять заранее: kedr-res.ru' },
  { id: 'address', label: 'Адрес и часы', has: /Сосновая/i, build: () => `${CONTACT_LINES.address} ${CONTACT_LINES.hours}` },
  { id: 'phones', label: 'Телефон', has: /274-53-54|979-53-54/, build: () => CONTACT_LINES.phones },
  { id: 'hashtags', label: 'Хештеги', has: /#kedr/i, build: () => '#KEDR #Зайцево #kedr_zaytsevo' },
  { id: 'close', label: 'Финальная фраза', has: new RegExp(CLOSERS.map((line) => line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')), build: (day) => closerFor(day, day?.variant || 0) },
]

function extensionLines(day, base, ids) {
  const picked = day?.extensions || []
  return POST_EXTENSIONS
    .filter((item) => ids.includes(item.id) && picked.includes(item.id) && !(item.has && item.has.test(base)))
    .map((item) => item.build(day))
    .filter((line) => line && !base.includes(line))
}

export function extensionPresent(day, id) {
  const item = POST_EXTENSIONS.find((entry) => entry.id === id)
  const base = day?.format === 'wide' ? (day.wideText || wideFromDay(day)) : (day?.postText || '')
  return Boolean(item?.has && item.has.test(base))
}

export function shownPost(day) {
  const base = String(day?.format === 'wide' ? (day.wideText || wideFromDay(day)) : (day?.postText || '')).trim()
  const parts = base ? base.split(/\n{2,}/) : []
  const ctaAt = parts.length && /kedr-res\.ru/i.test(parts[parts.length - 1]) ? parts.length - 1 : parts.length
  const middle = extensionLines(day, base, ['close', 'address', 'phones', 'booking'])
  const tail = extensionLines(day, base, ['hashtags'])
  const joined = [...parts.slice(0, ctaAt), ...middle, ...parts.slice(ctaAt), ...tail].join('\n\n')
  return day?.format === 'wide' ? capWords(joined) : joined
}

function capWords(text, limit = WIDE_LIMIT) {
  const parts = String(text || '').trim().split(/\s+/)
  if (parts.length <= limit) return String(text || '').trim()
  return parts.slice(0, limit).join(' ')
}

export function wideFromDay(day, angle) {
  return capWords(composeWide(day, { angle, variant: day?.variant || 0 }))
}

export function improveReel(day) {
  const hall = !day?.dish || day.dish.startsWith('без тарелки')
  const hooks = hall
    ? ['Вот зал, пока никто не сел.', 'Пять секунд тишины до первых гостей.', 'Пустой зал за минуту до открытия.']
    : [`${capital(day.scene)}.`, 'Звук раньше картинки: сначала слышно, потом видно.', 'Без слов: только руки, стол и тарелка.']
  const scripts = hall
    ? ['Свет, дерево, пустые стулья. Тарелки в кадре нет. В конце адрес: Сосновая, 3.', 'Камера идёт от двери к окну. Рука поправляет прибор. В конце kedr-res.ru.']
    : [
      `Сначала сцена: ${day.scene}. Потом крупно ${day.dish}. В конце одна фраза про стол и kedr-res.ru.`,
      `Три кадра: дорога или дверь, руки за столом, ${day.dish} крупно. Подпись в конце — kedr-res.ru.`,
      `Начинаем со звука зала. ${capital(day.dish)} появляется на пятой секунде. Лица в камеру не смотрят.`,
    ]
  const seed = hashSeed(day.day, day.reelVariant || 0, 'reel')
  const pickNext = (list, current) => {
    const start = seed % list.length
    for (let step = 0; step < list.length; step += 1) {
      const option = list[(start + step) % list.length]
      if (option !== current) return option
    }
    return list[start]
  }
  return {
    reelVariant: (day.reelVariant || 0) + 1,
    reelHook: pickNext(hooks, day.reelHook),
    reelScript: pickNext(scripts, day.reelScript),
  }
}

export function writeFromNews(day, news, format) {
  const topic = topicsOf(`${news.title} ${news.watch}`)[0] || null
  if (format === 'wide') return capWords(composeWide(day, { topic }))
  return composePost(day, { topic })
}

const CHANNEL_OPEN = {
  sysoevfm: 'Коротко о вечере.',
  nerestorani: 'Можно без повода и без дресс-кода.',
  restomano: 'Из зала, не из ленты.',
  restaurantmoscow: 'Куда ехать, если хочется тишины.',
  vkusonomika: 'Для тех, кому важен вкус, а не шум.',
  afisharestaurants: 'Один вечер, который стоит поставить в план.',
  eatmoskva: 'Если ехать за город и остаться среди сосен.',
  raidedrests: 'Не слух и не открытие на бумаге. Зал уже работает.',
  foodiscovery: 'Своими словами, не пересказ чужого поста.',
  instafoodpassion: 'Сходили бы вдвоём.',
  checkedmoscow: 'После своего визита, не по анонсу.',
  newinmoscow: 'Если приехали впервые.',
  moscow_taste: 'Из того, к чему хочется вернуться.',
  gotoeatmsk: 'На этот день сцена уже есть.',
  diaryrest: 'Со стороны зала, не со стороны афиши.',
}

export function channelTraits(posts) {
  const list = (posts || []).filter((post) => post?.text && post.text.length > 40)
  if (!list.length) return null
  const ratio = (check) => list.filter(check).length / list.length
  const avg = Math.round(list.reduce((sum, post) => sum + wordCount(post.text), 0) / list.length)
  return {
    avg,
    emoji: ratio((post) => /^(\p{Extended_Pictographic}|[\u2600-\u27BF])/u.test(post.text.trim())),
    price: ratio((post) => /₽|руб/.test(post.text)),
    address: ratio((post) => /📍|ул\.|улиц|д\.|адрес/i.test(post.text)),
    hash: ratio((post) => /#[\p{L}\d_]/u.test(post.text)),
    question: ratio((post) => /\?/.test(post.text.slice(0, 220))),
    person: ratio((post) => /(^|[\s.«"])(я|мне|мой|моя|сходил|сходила|был|была)\b/i.test(post.text.slice(0, 280))),
    list: ratio((post) => /(^|\n)\s*(•|—|–|\d+\.)\s/m.test(post.text)),
  }
}

export function traitNotes(traits) {
  if (!traits) return ['свежих постов в превью нет, тон взят из карточки канала']
  const notes = [`в среднем ${traits.avg} слов`]
  if (traits.person >= 0.34) notes.push('часто от первого лица')
  if (traits.price >= 0.34) notes.push('часто с ценой')
  if (traits.address >= 0.34) notes.push('часто с адресом')
  if (traits.question >= 0.34) notes.push('часто с вопросом')
  if (traits.list >= 0.34) notes.push('часто списком')
  if (traits.hash >= 0.34) notes.push('часто с хештегом')
  if (traits.emoji >= 0.34) notes.push('часто с эмодзи в начале')
  return notes
}

export function writeLikeChannel(day, channel, posts, format) {
  const traits = channelTraits(posts)
  const open = CHANNEL_OPEN[channel?.id] || ''
  if (format === 'wide') return capWords(composeWide(day, { angle: open || undefined }))
  const seed = hashSeed(day.day, channel?.id || '', 'channel')
  const lines = []
  if (open) lines.push(traits?.emoji >= 0.34 ? `✨ ${open}` : open)
  lines.push(composePost(day, { angle: '', occasion: null }).split('\n\n').slice(1, -1).join('\n\n'))
  if (traits?.question >= 0.34) lines.push('Остаться на этот вечер?')
  if (traits?.list >= 0.34 && !day.dish?.startsWith('без тарелки')) {
    lines.push(['— дорога между сосен до двери', `— ${dishLine(day, seed).replace(/\.$/, '')}`, '— зал каждый день с 12:00 до 24:00'].join('\n'))
  }
  if (!traits || traits.address >= 0.34 || traits.price >= 0.34) lines.push(`${CONTACT_LINES.address} ${CONTACT_LINES.phones}`)
  lines.push('kedr-res.ru')
  if (traits?.hash >= 0.34) lines.push('#KEDR #Зайцево #kedr_zaytsevo')
  return lines.filter(Boolean).join('\n\n')
}

export const WIDE_SAMPLE = `✨ Открыта бронь на 2027 год в «Кедре»

Есть даты, которые хочется сохранить в памяти навсегда. И мы уже открыли календарь на 2027 год - самое время выбрать свою 🤍

Свадьба, камерный семейный праздник, день рождения или масштабное корпоративное событие - территория «Кедра» позволяет создавать самые разные форматы. Мы с вниманием подходим к каждому мероприятию, продумывая детали и создавая атмосферу именно под вас.

Лучшие даты, как правило, разбирают заранее. Поэтому, если 2027 год уже связан для вас с важным событием, самое время занять свою дату в календаре «Кедра» ✨

Пусть ваш особенный день начнётся с места, где всё продумано для красивых воспоминаний.

📩 Бронируйте дату уже сейчас - будем рады стать частью вашей истории.`
