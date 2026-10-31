export const trendBoards = [
  {
    name: 'Blogway',
    url: 'https://blogway.pro/packs',
    note: 'Подборки: звук, хуки, мемы, шаблоны. Смотрите там, в день забирается только приём съёмки.',
  },
  {
    name: 'Trendsee',
    url: 'https://app.trendsee.io/',
    note: 'Живая доска трендов. Открывается отдельно, сценарий в кабинете пересобирается под выбранный приём.',
  },
]

export const trends = [
  {
    id: 'process',
    name: 'Процесс работы',
    source: 'Blogway',
    url: 'https://blogway.pro/packs',
    watch: 'Честный кадр места до гостей: свет, руки, тишина зала.',
    hook: () => `Вот как это выглядит, когда никто не позирует.`,
    script: (day) => `Сначала зал или дорога. Потом, если уместно, ${day.dish}. В конце одна ссылка: kedr-res.ru.`,
  },
  {
    id: 'try',
    name: 'Ну сходи, ну попробуй',
    source: 'Blogway',
    url: 'https://blogway.pro/packs',
    watch: 'Про страх начать и право на первую попытку. Подходит первому визиту.',
    hook: () => `Ну сходи. Первый раз может быть обычным.`,
    script: (day) => `Короткая реплика, дверь, потом ${day.dish}. Блюдо не открывает ролик.`,
  },
  {
    id: 'dawn',
    name: 'Тёплый быт',
    source: 'Blogway',
    url: 'https://blogway.pro/packs',
    watch: 'Спокойный тёплый кадр простой радости: прогулка, пауза, дом рядом с залом.',
    hook: () => `Никуда не бежим. На этом и держится вечер.`,
    script: (day) => `Медленно: окно, чашка или дорога. ${day.dish} появляется, только если сцена садится за стол.`,
  },
  {
    id: 'child',
    name: 'Глазами себя раньше',
    source: 'Blogway',
    url: 'https://blogway.pro/packs',
    watch: 'Посмотреть на сегодняшний вечер как на то, к чему когда-то хотелось прийти.',
    hook: () => `Вот вечер, к которому когда-то хотелось прийти.`,
    script: (day) => `Зал без диктора. Одна фраза на экране. ${day.dish} — деталь, не сюжет.`,
  },
  {
    id: 'before',
    name: 'До и после',
    source: 'Blogway',
    url: 'https://blogway.pro/packs',
    watch: 'Переход: дорога и зал, день и вечер, пустой стол и гости.',
    hook: () => `Сначала улица. Потом уже стол.`,
    script: (day) => `Два кадра встык. Между ними дверь или ${day.dish}.`,
  },
  {
    id: 'line',
    name: 'Одна строка крупно',
    source: 'Blogway',
    url: 'https://blogway.pro/packs',
    watch: 'Маленькая надпись становится крупной. Одна мысль, без простыни текста.',
    hook: () => `Одна фраза на весь кадр.`,
    script: (day) => `Надпись становится крупнее. За ней зал или ${day.dish}.`,
  },
]

export function nextTrend(currentId) {
  const index = trends.findIndex((item) => item.id === currentId)
  return trends[(index + 1) % trends.length]
}

export function applyTrend(day, trend) {
  return {
    trendId: trend.id,
    reelHook: trend.hook(day),
    reelScript: trend.script(day),
    formatName: trend.name,
    formatSource: trend.source,
    formatUrl: trend.url,
    matchNote: trend.watch,
  }
}
