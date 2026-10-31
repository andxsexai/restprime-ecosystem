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
    title: (day) => `Как это выглядит на самом деле: ${day.scene}`,
    post: (day) => `${day.scene}. Без постановочной улыбки. Если остаётесь за столом, в меню KEDR на это есть ${day.dish}.`,
    hook: (day) => `0–2 сек: ${day.scene}. Камера уже внутри, без приветствия.`,
    script: (day) => `Кадр зала или дороги. Потом, если уместно, ${day.dish}. Финал — kedr-res.ru.`,
  },
  {
    id: 'try',
    name: 'Ну сходи, ну попробуй',
    source: 'Blogway',
    url: 'https://blogway.pro/packs',
    watch: 'Про страх начать и право на первую попытку. Подходит первому визиту.',
    title: (day) => `Ну сходи: ${day.scene}`,
    post: (day) => `Не обязательно знать меню наизусть. ${day.scene}. Можно начать с простого: ${day.dish}.`,
    hook: (day) => `0–2 сек: фраза «ну сходи». Дальше ${day.scene}.`,
    script: (day) => `Короткая реплика. Дорога или дверь. ${day.dish} появляется не первым кадром.`,
  },
  {
    id: 'dawn',
    name: 'Тёплый быт',
    source: 'Blogway',
    url: 'https://blogway.pro/packs',
    watch: 'Спокойный тёплый кадр простой радости: прогулка, пауза, дом рядом с залом.',
    title: (day) => `Простая радость: ${day.scene}`,
    post: (day) => `${day.scene}. Тёплый свет, без спешки. Рядом в карте — ${day.dish}.`,
    hook: (day) => `0–2 сек: тихий бытовой кадр. ${day.scene}.`,
    script: (day) => `Медленно: окно, чашка или дорога. Потом ${day.dish}, если сцена садится за стол.`,
  },
  {
    id: 'child',
    name: 'Глазами себя раньше',
    source: 'Blogway',
    url: 'https://blogway.pro/packs',
    watch: 'Посмотреть на сегодняшний вечер как на то, к чему когда-то хотелось прийти.',
    title: (day) => `Если бы увидели это раньше: ${day.scene}`,
    post: (day) => `${day.scene}. Не про идеальную тарелку, про то, что вечер уже состоялся. На столе может быть ${day.dish}.`,
    hook: (day) => `0–2 сек: тихий кадр и одна фраза про путь. ${day.scene}.`,
    script: (day) => `Лицо или зал без диктора. Одна строка на экране. ${day.dish} — деталь, не сюжет.`,
  },
  {
    id: 'before',
    name: 'До и после',
    source: 'Blogway',
    url: 'https://blogway.pro/packs',
    watch: 'Переход: дорога и зал, день и вечер, пустой стол и гости.',
    title: (day) => `До и после: ${day.scene}`,
    post: (day) => `Сначала одно состояние, потом другое. ${day.scene}. Якорь меню — ${day.dish}.`,
    hook: (day) => `0–2 сек: резкая смена. ${day.scene}.`,
    script: (day) => `Два кадра встык. Между ними ${day.dish} или дверь зала.`,
  },
  {
    id: 'line',
    name: 'Одна строка крупно',
    source: 'Blogway',
    url: 'https://blogway.pro/packs',
    watch: 'Маленькая надпись становится крупной. Одна мысль, без простыни текста.',
    title: (day) => `Одна строка: ${day.scene}`,
    post: (day) => `${day.scene}. В ролике одна фраза. Если нужен стол — ${day.dish}. Бронь: kedr-res.ru.`,
    hook: (day) => `0–2 сек: короткая надпись на весь кадр. ${day.scene}.`,
    script: (day) => `Текст растёт под музыку. За ним зал или ${day.dish}.`,
  },
]

export function nextTrend(currentId) {
  const index = trends.findIndex((item) => item.id === currentId)
  return trends[(index + 1) % trends.length]
}

export function applyTrend(day, trend) {
  return {
    trendId: trend.id,
    title: trend.title(day),
    postText: trend.post(day),
    reelHook: trend.hook(day),
    reelScript: trend.script(day),
    formatName: trend.name,
    formatSource: trend.source,
    formatUrl: trend.url,
    matchNote: trend.watch,
  }
}
