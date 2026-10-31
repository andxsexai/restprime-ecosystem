const WIDE_LIMIT = 500

export function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length
}

export function shownPost(day) {
  if (day?.format === 'wide') return day.wideText || wideFromDay(day)
  return day?.postText || ''
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

export const WIDE_SAMPLE = `✨ Открыта бронь на 2027 год в «Кедре»

Есть даты, которые хочется сохранить в памяти навсегда. И мы уже открыли календарь на 2027 год - самое время выбрать свою 🤍

Свадьба, камерный семейный праздник, день рождения или масштабное корпоративное событие - территория «Кедра» позволяет создавать самые разные форматы. Мы с вниманием подходим к каждому мероприятию, продумывая детали и создавая атмосферу именно под вас.

Лучшие даты, как правило, разбирают заранее. Поэтому, если 2027 год уже связан для вас с важным событием, самое время занять свою дату в календаре «Кедра» ✨

Пусть ваш особенный день начнётся с места, где всё продумано для красивых воспоминаний.

📩 Бронируйте дату уже сейчас - будем рады стать частью вашей истории.`
