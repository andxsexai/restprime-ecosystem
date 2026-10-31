const WIDE_LIMIT = 500

export function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length
}

export const POST_EXTENSIONS = [
  { id: 'booking', label: 'Бронь', build: () => '📩 Стол можно занять заранее: kedr-res.ru' },
  { id: 'address', label: 'Адрес и часы', build: () => 'д. Зайцево, ул. Сосновая, 3. Каждый день с 12:00 до 24:00.' },
  { id: 'phones', label: 'Телефон', build: () => '+7 (495) 274-53-54 · +7 (929) 979-53-54' },
  { id: 'hashtags', label: 'Хештеги', build: () => '#KEDR #Зайцево #kedr_zaytsevo' },
  { id: 'close', label: 'Тёплое закрытие', build: () => 'Пусть этот вечер начнётся там, где уже всё готово для спокойного разговора.' },
]

export function extensionText(day) {
  const picked = day?.extensions || []
  return POST_EXTENSIONS.filter((item) => picked.includes(item.id)).map((item) => item.build(day)).join('\n\n')
}

export function shownPost(day) {
  const base = day?.format === 'wide' ? (day.wideText || wideFromDay(day)) : (day?.postText || '')
  const extra = extensionText(day)
  const joined = extra ? `${base}\n\n${extra}` : base
  return day?.format === 'wide' ? capWords(joined) : joined
}

function capWords(text, limit = WIDE_LIMIT) {
  const parts = String(text || '').trim().split(/\s+/)
  if (parts.length <= limit) return String(text || '').trim()
  return parts.slice(0, limit).join(' ')
}

function lead(value) {
  const text = String(value || '').trim()
  if (!text) return 'Вечер в «Кедре»'
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function plate(day) {
  if (!day?.dish || day.dish.startsWith('без тарелки')) {
    return 'В этом кадре нет тарелки. Есть зал: свет, дерево и тишина, пока гости ещё не сели.'
  }
  const price = day.margin && day.margin !== 'зал' ? ` ${day.margin}.` : ''
  return `Если остаться за столом, в карте «Кедра» на этот вечер есть ${day.dish}.${price}`
}

export function improveShort(day) {
  return [
    `${lead(day.scene)}.`,
    plate(day),
    'Если этот вечер уже кажется вашим — стол в KEDR: kedr-res.ru',
  ].join('\n\n')
}

export function wideFromDay(day, angle) {
  const bridge = angle
    ? angle
    : 'Свадьба, камерный семейный праздник, день рождения или просто желание никуда не спешить — территория «Кедра» собирает разные форматы. Мы держим детали под конкретный вечер, не под шаблон.'
  const text = [
    `✨ ${day.title}`,
    '',
    `Есть вечера, которые хочется сохранить. ${lead(day.scene)} — как раз такой момент.`,
    '',
    bridge,
    '',
    plate(day),
    '',
    'Зал стоит в соснах, д. Зайцево, ул. Сосновая, 3. Каждый день с 12:00 до 24:00. Хорошие даты и тихие столы разбирают раньше, чем кажется.',
    '',
    'Пусть ваш день начнётся с места, где уже тепло, когда с улицы ещё темно.',
    '',
    '📩 Бронируйте стол уже сейчас — будем рады стать частью вашей истории. kedr-res.ru',
  ].join('\n')
  return capWords(text)
}

export function improveWide(day) {
  const current = day.wideText || wideFromDay(day)
  const withClose = /kedr-res\.ru/.test(current)
    ? current
    : `${current}\n\n📩 Бронируйте стол уже сейчас — будем рады стать частью вашей истории. kedr-res.ru`
  const withOpen = withClose.trim().startsWith('✨') ? withClose.trim() : `✨ ${day.title}\n\n${withClose.trim()}`
  return capWords(withOpen)
}

export function improveReel(day) {
  if (!day?.dish || day.dish.startsWith('без тарелки')) {
    return {
      reelHook: 'Вот зал, пока никто не сел.',
      reelScript: 'Свет, дерево, пустые стулья. Тарелки в кадре нет. В конце — адрес: Сосновая, 3.',
    }
  }
  return {
    reelHook: lead(day.scene).endsWith('.') ? lead(day.scene) : `${lead(day.scene)}.`,
    reelScript: `Сначала сцена: ${day.scene}. Потом крупно ${day.dish}. В конце одна фраза про стол и kedr-res.ru.`,
  }
}

export function writeFromNews(day, news, format) {
  const angle = `${news.title}. ${news.watch}`
  if (format === 'wide') return wideFromDay(day, angle)
  return [
    news.title.endsWith('.') ? news.title : `${news.title}.`,
    `В «Кедре» это выглядит так: ${lead(day.scene)}.`,
    plate(day),
    'kedr-res.ru',
  ].join('\n\n')
}

const CHANNEL_OPEN = {
  sysoevfm: (day) => `Коротко о вечере. ${lead(day.scene)}`,
  nerestorani: (day) => `Можно без повода и без дресс-кода. ${lead(day.scene)}`,
  restomano: (day) => `Из зала, не из ленты. ${lead(day.scene)}`,
  restaurantmoscow: (day) => `Куда ехать, если хочется тишины. ${lead(day.scene)}`,
  vkusonomika: (day) => `Для тех, кому важен вкус, а не шум. ${lead(day.scene)}`,
  afisharestaurants: (day) => `Один вечер, который стоит поставить в план. ${lead(day.scene)}`,
  eatmoskva: (day) => `Если ехать за город и остаться среди сосен. ${lead(day.scene)}`,
  raidedrests: (day) => `Не слух и не открытие на бумаге. Зал уже работает. ${lead(day.scene)}`,
  foodiscovery: (day) => `Не пересказ чужого поста. ${lead(day.scene)}`,
  instafoodpassion: (day) => `Сходили бы вдвоём. ${lead(day.scene)}`,
  checkedmoscow: (day) => `После своего визита, не по анонсу. ${lead(day.scene)}`,
  newinmoscow: (day) => `Если приехали впервые. ${lead(day.scene)}`,
  moscow_taste: (day) => `Из того, к чему хочется вернуться. ${lead(day.scene)}`,
  gotoeatmsk: (day) => `На этот день сцена уже есть. ${lead(day.scene)}`,
  diaryrest: (day) => `Со стороны зала, не со стороны афиши. ${lead(day.scene)}`,
  kedrrest: (day) => lead(day.scene),
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
  const open = CHANNEL_OPEN[channel?.id]?.(day) || lead(day.scene)
  const lines = [traits?.emoji >= 0.34 ? `✨ ${open}` : open, plate(day)]
  if (traits?.question >= 0.34) lines.push('Остаться на этот вечер?')
  if (traits?.list >= 0.34) {
    lines.push(['— дорога между сосен до двери', `— ${day.dish}`, '— зал каждый день с 12:00 до 24:00'].join('\n'))
  }
  if (!traits || traits.address >= 0.34 || traits.price >= 0.34) {
    lines.push('д. Зайцево, ул. Сосновая, 3. +7 (495) 274-53-54')
  }
  lines.push('kedr-res.ru')
  if (traits?.hash >= 0.34) lines.push('#KEDR #Зайцево #kedr_zaytsevo')
  const short = lines.join('\n\n')
  if (format !== 'wide') return short
  return wideFromDay(day, open)
}

export const WIDE_SAMPLE = `✨ Открыта бронь на 2027 год в «Кедре»

Есть даты, которые хочется сохранить в памяти навсегда. И мы уже открыли календарь на 2027 год - самое время выбрать свою 🤍

Свадьба, камерный семейный праздник, день рождения или масштабное корпоративное событие - территория «Кедра» позволяет создавать самые разные форматы. Мы с вниманием подходим к каждому мероприятию, продумывая детали и создавая атмосферу именно под вас.

Лучшие даты, как правило, разбирают заранее. Поэтому, если 2027 год уже связан для вас с важным событием, самое время занять свою дату в календаре «Кедра» ✨

Пусть ваш особенный день начнётся с места, где всё продумано для красивых воспоминаний.

📩 Бронируйте дату уже сейчас - будем рады стать частью вашей истории.`
