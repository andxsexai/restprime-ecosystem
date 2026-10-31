import { TELEGRAM_CHANNELS } from '../data/telegramChannels.js'

export const TOPICS = [
  {
    id: 'brunch',
    label: 'Бранчи и поздние обеды',
    words: /бранч|завтрак|поздний обед/i,
    pillars: ['Быт', 'Меню', 'Напиток'],
    angles: [
      'Выходной не обязан начинаться рано: зал открыт с 12:00, и это лучшее время для неспешного обеда.',
      'Пока город стоит в очереди на бранч, за городом есть обед без очереди.',
    ],
  },
  {
    id: 'cinema',
    label: 'Кино и премьеры',
    words: /фильм|кино|премьер|сериал|трейлер|прокат/i,
    pillars: ['Гости', 'Повод', 'Напиток'],
    angles: [
      'После кино хочется договорить. Для этого нужен стол, а не фойе.',
      'Обсуждать фильм лучше за ужином, чем в чате.',
    ],
  },
  {
    id: 'openings',
    label: 'Открытия и закрытия в Москве',
    words: /открыл|открыти|откроется|закрыл|ребренд/i,
    pillars: ['Зал', 'Быт'],
    angles: [
      'Новые места открываются каждую неделю. Мы остаёмся там же — среди сосен в Зайцево.',
      'Город меняет вывески, а дорога в Зайцево остаётся прежней.',
    ],
  },
  {
    id: 'season',
    label: 'Осенние продукты',
    words: /тыкв|осен|брусник|грузд|гриб|облепих/i,
    pillars: ['Меню', 'Быт'],
    angles: [
      'Осень за городом чувствуется сильнее: мокрые сосны, ранние сумерки и желание горячего.',
      'В ноябре хочется еды, после которой не нужно ничего доказывать.',
    ],
  },
  {
    id: 'wine',
    label: 'Вино и бар',
    words: /вин[оа]|коктейл|бармен|гвино|сомелье/i,
    pillars: ['Напиток'],
    angles: [
      'Бокал за ужином — не повод для лекции. Просто часть вечера.',
      'К хорошему разговору нужен бокал, а не винная карта на десять страниц.',
    ],
  },
  {
    id: 'family',
    label: 'Семья и дети',
    words: /семь|дет(и|ск|ей)|мам[аеы]|родител/i,
    pillars: ['Гости'],
    angles: [
      'Семейный обед получается, когда каждому есть что заказать.',
      'Взрослые разговаривают, дети едят своё. Так выглядит спокойный выходной.',
    ],
  },
  {
    id: 'events',
    label: 'Праздники и банкеты',
    words: /банкет|корпоратив|праздн|новогод|юбиле|фестивал/i,
    pillars: ['Повод', 'Зал'],
    angles: [
      'Праздник проще планировать за ужином, чем в переписке.',
      'Даты на конец года разбирают раньше, чем кажется.',
    ],
  },
  {
    id: 'birthday',
    label: 'Дни рождения',
    words: /день рождени|именин/i,
    pillars: ['Повод'],
    angles: ['День рождения в «Кедре» длится неделю.'],
  },
  {
    id: 'weather',
    label: 'Погода и холод',
    words: /снег|мороз|холод|дожд|непогод|похолод|гололёд/i,
    pillars: ['Быт', 'Меню', 'Напиток'],
    angles: [
      'В такую погоду хочется туда, где уже накрыто.',
      'Пока снаружи сыро, внутри можно никуда не спешить.',
    ],
  },
  {
    id: 'russian',
    label: 'Русская кухня',
    words: /русск\S* (кухн|завтрак|блюд)|борщ|пельмен|блин|котлет/i,
    pillars: ['Меню'],
    angles: [
      'Русская кухня без музейной подачи: понятно, горячо, по-домашнему.',
      'Иногда хочется не нового, а того, что ели в детстве.',
    ],
  },
]

const SKIP = /теракт|погиб|ДТП|арест|суд\b|убий|войн|ФСБ|посольств/i

function channelTitle(id) {
  return TELEGRAM_CHANNELS.find((item) => item.id === id)?.title || `@${id}`
}

export function topicsOf(text) {
  const value = String(text || '')
  if (SKIP.test(value)) return []
  return TOPICS.filter((topic) => topic.words.test(value))
}

export function readSignals(feed, news = []) {
  const items = []
  for (const [id, channel] of Object.entries(feed?.channels || {})) {
    if (id === 'kedrrest') continue
    for (const post of channel.posts || []) {
      items.push({ text: post.text, url: post.url, date: String(post.date || '').slice(0, 10), from: channel.title || channelTitle(id) })
    }
  }
  for (const story of news) {
    items.push({ text: `${story.title} ${story.watch}`, url: story.url, date: story.iso, from: story.source })
  }
  const found = TOPICS.map((topic) => ({ ...topic, count: 0, refs: [] }))
  for (const item of items) {
    for (const topic of topicsOf(item.text)) {
      const bucket = found.find((entry) => entry.id === topic.id)
      bucket.count += 1
      if (bucket.refs.length < 4 && !bucket.refs.some((ref) => ref.url === item.url)) {
        bucket.refs.push({ from: item.from, url: item.url, date: item.date })
      }
    }
  }
  return {
    fetchedAt: feed?.fetchedAt || '',
    window: feed?.window || [],
    total: items.length,
    topics: found.filter((topic) => topic.count > 0).sort((a, b) => b.count - a.count),
  }
}
