import { contentPlan } from '../data/contentPlan.js'
import { dateForDay, formatLong } from './planDates.js'
import { BIRTHDAY_LINE, capital, composePost, hashSeed, lineKeys, occasionFor, weekdayName } from './writer.js'

const PLATES = contentPlan.filter((item) => !String(item.dish).startsWith('без тарелки'))

const IDEAS = [
  {
    id: 'before-open',
    title: 'Кухня до открытия',
    pillar: 'Меню',
    angle: 'Без двадцати двенадцать. Зал ещё пустой, а на кухне уже шумно.',
    scene: 'Плиты разогреты, заготовки по местам, первые гости только выезжают из города',
    reel: { hook: 'Что происходит на кухне за 20 минут до открытия', shots: ['Пустой зал, свет включается', 'Руки повара, нарезка, пар над кастрюлей', '{dish} уходит на раздачу, дверь открывается'], sound: 'Живой звук кухни: нож, огонь, посуда' },
  },
  {
    id: 'window-table',
    title: 'Стол у окна',
    pillar: 'Зал',
    angle: 'У каждого постоянного гостя есть свой стол. Чаще всего — у окна.',
    scene: 'За стеклом сосны, на столе приборы, и вечер пока никуда не торопится',
    reel: { hook: 'Лучший стол в «Кедре» — угадайте какой', shots: ['Проход через зал, камера ищет стол', 'Окно в сосны крупно', '{dish} ставят на этот стол, финал на виде из окна'], sound: 'Тихий зал, приглушённые разговоры' },
  },
  {
    id: 'question',
    title: 'Вопрос гостям',
    pillar: 'Гости',
    angle: 'Вопрос к тем, кто у нас уже был: что вы заказали в первый раз?',
    scene: 'Первый визит запоминается одной тарелкой, и у каждого она своя',
    reel: { hook: 'Что заказать в «Кедре» в первый раз? Отвечает команда', shots: ['Официант, повар и администратор по очереди называют блюдо', 'Быстрые кадры трёх тарелок', '{dish} в финале крупно, вопрос в подписи'], sound: 'Голоса команды без музыки' },
  },
  {
    id: 'lunch',
    title: 'Обед вместо ужина',
    pillar: 'Быт',
    angle: 'Мы открываемся в полдень. Обед за городом — это полдня отдыха, а не час между делами.',
    scene: 'Днём в зале светло, дорога свободная, а возвращаться можно засветло',
    reel: { hook: 'Обед за городом, а не ужин: вот почему', shots: ['Дневная дорога между сосен', 'Солнечный зал в 13:00', '{dish} на столе при дневном свете'], sound: 'Птицы и шаги по дорожке, затем зал' },
  },
  {
    id: 'midnight',
    title: 'До полуночи',
    pillar: 'Быт',
    angle: 'Зал открыт до полуночи. Можно приехать после работы и не смотреть на часы.',
    scene: 'Поздний вечер, в городе пробки рассосались, а у нас стол ещё ждёт',
    reel: { hook: 'Ужин после работы, когда в городе всё уже закрыто', shots: ['Часы на руке: поздний вечер', 'Тёмная дорога и огни зала между сосен', '{dish} и спокойный зал'], sound: 'Ночная тишина, потом звук приборов' },
  },
  {
    id: 'one-plate',
    title: 'Одна тарелка',
    pillar: 'Меню',
    angle: 'Сегодня без истории про атмосферу. Только одна тарелка и из чего она.',
    scene: 'Состав в меню написан полностью, и в тарелке ровно то, что написано',
    reel: { hook: 'Из чего это блюдо — по составу из меню', shots: ['Каждый ингредиент крупно, по одному', 'Сборка тарелки руками повара', 'Готовая подача сверху, название и цена'], sound: 'ASMR кухни, без музыки' },
  },
  {
    id: 'company',
    title: 'Стол на компанию',
    pillar: 'Гости',
    angle: 'Компанию проще собрать, когда понятно, куда ехать. Стол на шестерых занимаем заранее.',
    scene: 'Длинный стол, стулья сдвинуты, тарелки ставят в середину, и каждый тянется к своей',
    reel: { hook: 'Как выглядит стол, когда вас много', shots: ['Сверху: пустой длинный стол', 'Таймлапс: тарелки занимают всё место', '{dish} в центре, руки тянутся'], sound: 'Смех и разговоры компании' },
  },
  {
    id: 'tea',
    title: 'После десерта',
    pillar: 'Напиток',
    angle: 'Ужин закончился, а расходиться рано. Для этого придуман чай.',
    scene: 'Чайник в середине стола, разговор, который не хочется обрывать на полуслове',
    reel: { hook: 'Самая недооценённая часть ужина', shots: ['Пустые тарелки уносят', 'Чайник ставят в центр', '{dish} и разговор, камера отъезжает'], sound: 'Звон чашек и тихий разговор' },
  },
  {
    id: 'birthday',
    title: 'Неделя дня рождения',
    pillar: 'Повод',
    angle: 'День рождения у нас длится неделю: три дня до, сам день и три дня после.',
    scene: 'Можно не подгонять праздник под выходные, а выбрать удобный вечер',
    reel: { hook: 'День рождения, который длится неделю', shots: ['Календарь: отмечаем 7 дней', 'Стол накрывают под компанию', '{dish} со свечой, плашка «скидка 10%»'], sound: 'Живой звук зала, без «хэппи бёздей»' },
  },
  {
    id: 'road',
    title: 'Последний поворот',
    pillar: 'Быт',
    angle: 'Самый приятный момент дороги — последний поворот, когда начинаются сосны.',
    scene: 'Город остаётся в зеркале, а впереди уже видны огни зала',
    reel: { hook: 'Вот момент, когда отпускает город', shots: ['Из машины: трасса', 'Поворот, сосны с двух сторон', 'Дверь зала и {dish} на столе'], sound: 'Шум дороги стихает, звук зала' },
  },
]

const TOPIC_REELS = {
  brunch: { hook: 'Бранч без очереди — за городом', shots: ['Город и очередь у кафе (текстом на экране)', 'Свободная дорога, сосны', '{dish} на дневном столе'], sound: 'Утренний трек тихо, затем звук зала' },
  cinema: { hook: 'Где договорить после кино', shots: ['Титры на экране телефона', 'Двое садятся за стол', '{dish} и разговор крупно'], sound: 'Звук зала, без киномузыки' },
  openings: { hook: 'Все открываются, а мы просто работаем', shots: ['Текст: «новое место каждую неделю»', 'Тот же зал, те же сосны', '{dish} — стабильная классика'], sound: 'Спокойный звук зала' },
  season: { hook: 'Ноябрь за городом выглядит так', shots: ['Мокрые сосны, ранние сумерки', 'Свет в окнах зала', '{dish} с паром, крупно'], sound: 'Дождь снаружи, тепло внутри' },
  wine: { hook: 'Бокал без лекции о вине', shots: ['Бокал наполняют крупно', 'Тост без речи', '{dish} рядом с бокалом'], sound: 'Звон бокалов' },
  family: { hook: 'Обед, после которого все довольны', shots: ['Семья садится за стол', 'Детская и взрослая тарелки рядом', '{dish} и общий смех'], sound: 'Живой звук семьи за столом' },
  events: { hook: 'Праздник без банкетного зала', shots: ['Пустой зал вечером', 'Стол накрывают под своих', '{dish} в центре стола'], sound: 'Подготовка зала, потом голоса гостей' },
  birthday: { hook: 'День рождения на неделю', shots: ['Календарь ±3 дня', 'Стол для своих', '{dish} со свечой'], sound: 'Зал и аплодисменты' },
  weather: { hook: 'Когда снаружи вот так, а внутри вот так', shots: ['Непогода за окном машины', 'Тёплый свет зала', '{dish} с паром крупно'], sound: 'Дождь или ветер, затем тишина зала' },
  russian: { hook: 'Русская кухня без музейной подачи', shots: ['Руки, тесто или кастрюля', 'Подача без лишнего декора', '{dish} крупно, ложка в кадре'], sound: 'Кухня, без балалайки' },
}

const DISH_REELS = [
  { hook: 'Первый кусок — самый честный отзыв', shots: ['Тарелку ставят на стол, руки гостя', 'Состав из меню текстом поверх кадра', '{dish}: первый кусок крупно, реакция без слов'], sound: 'Живой звук зала' },
  { hook: 'Это блюдо заказывают второй раз', shots: ['Официант несёт тарелку через зал', 'Подача сверху', '{dish} крупно, в подписи цена из меню'], sound: 'Шаги и посуда' },
  { hook: 'За чем ехать в «Кедр» сегодня', shots: ['Дорога и сосны, 2 секунды', 'Кухня: последняя секунда сборки', '{dish} на столе у окна'], sound: 'Дорога, затем кухня' },
]

const DRINK_REELS = [
  { hook: 'Первый глоток после дороги', shots: ['Ключи от машины кладут на стол', 'Напиток наливают крупно', '{dish}: первый глоток, сосны за окном'], sound: 'Лёд и стекло' },
  { hook: 'Как готовят {dish} в «Кедре»', shots: ['Бар: составляющие по одной', 'Сборка напитка руками', 'Готовый {dish} на столе'], sound: 'Шейкер, лёд, без музыки' },
]

const GENERIC_REEL = DISH_REELS[0]

function isDrink(dish) {
  return /лимонад|коктейл|глинтвейн|капучино|раф|чай|\d+\s*мл/i.test(dish)
}

function plateFor(pillars, seed, taken) {
  const fits = PLATES.filter((item) => !taken.has(item.dish) && (!pillars?.length || pillars.includes(item.pillar)))
  const pool = fits.length ? fits : PLATES.filter((item) => !taken.has(item.dish))
  const plate = (pool.length ? pool : PLATES)[seed % (pool.length || PLATES.length)]
  taken.add(plate.dish)
  return plate
}

function shortDish(dish) {
  return String(dish).split(':')[0].replace(/,\s*\d+\s*(мл|г)$/, '').trim()
}

function reelFrom(template, dish, title, why) {
  const name = shortDish(dish)
  return {
    title,
    why,
    hook: template.hook.replaceAll('{dish}', name),
    shots: template.shots.map((shot, index) => `${index * 3 + 1}–${index * 3 + 3} с: ${shot.replaceAll('{dish}', name)}`).join('\n'),
    sound: template.sound,
  }
}

function takeLines(text, used) {
  for (const line of text.split('\n\n')) lineKeys(line).forEach((key) => used.add(key))
}

export function threeDays(days, { signals, fromDay, variant = 0 } = {}) {
  const topics = signals?.topics || []
  const seedBase = hashSeed(signals?.fetchedAt || '', variant)
  const used = new Set()
  const taken = new Set()
  const ideaOrder = [...IDEAS].sort((a, b) => hashSeed(a.id, seedBase) - hashSeed(b.id, seedBase))
  const out = []

  for (let index = 0; index < 3; index += 1) {
    const dayNumber = fromDay + index
    const date = dateForDay(dayNumber)
    const base = days.find((item) => item.day === dayNumber) || { day: dayNumber, scene: 'вечер за городом', pillar: 'Быт', title: 'Вечер за городом' }
    const seed = (slot) => hashSeed(seedBase, dayNumber, slot)
    const occasion = occasionFor(date)
    const posts = []
    const reels = []

    const topic = topics.length ? topics[(index + variant) % topics.length] : null
    const topicPlate = plateFor(topic?.pillars, seed('topic-plate'), taken)
    if (topic) {
      const refs = topic.refs.filter((ref, index, list) => list.findIndex((item) => item.from === ref.from) === index).slice(0, 2)
      const why = `В каналах за три дня: «${topic.label}» — ${topic.count} упоминаний. Берём только тему, чужой текст не цитируем.`
      const text = composePost({ ...topicPlate }, { topic, used, variant: variant + index, date, occasion: null })
      takeLines(text, used)
      posts.push({ id: `t-${dayNumber}`, kind: 'По ленте', title: topic.label, why, refs, dish: topicPlate.dish, text })
      reels.push({ id: `rt-${dayNumber}`, kind: 'По ленте', refs, ...reelFrom(TOPIC_REELS[topic.id] || GENERIC_REEL, topicPlate.dish, topic.label, why) })
    }

    const ownPlate = PLATES.find((item) => item.dish === base.dish && !taken.has(item.dish))
    const occasionPlate = ownPlate || plateFor(occasion?.pillars || [base.pillar], seed('day-plate'), taken)
    taken.add(occasionPlate.dish)
    const dayWhy = occasion ? `Повод дня: ${occasion.label}.` : `${capital(weekdayName(date))}: пост под ритм дня недели и сцену плана «${base.scene}».`
    const hall = String(base.dish || '').startsWith('без тарелки')
    const dayText = composePost(hall ? { ...base, day: dayNumber } : { ...base, dish: occasionPlate.dish, margin: occasionPlate.margin, day: dayNumber }, { used, variant: variant + index + 7, date, occasion })
    takeLines(dayText, used)
    posts.push({ id: `d-${dayNumber}`, kind: 'Повод дня', title: occasion?.label || capital(base.scene), why: dayWhy, refs: [], dish: hall ? 'зал без тарелки' : occasionPlate.dish, text: dayText })
    reels.push({ id: `rd-${dayNumber}`, kind: 'Блюдо дня', refs: [], ...reelFrom(isDrink(occasionPlate.dish) ? DRINK_REELS[seed('dish-reel') % DRINK_REELS.length] : DISH_REELS[seed('dish-reel') % DISH_REELS.length], occasionPlate.dish, `Блюдо дня: ${shortDish(occasionPlate.dish)}`, dayWhy) })

    const ideas = ideaOrder.filter((idea) => topic?.id !== idea.id)
    for (let slot = 0; posts.length < 3 || reels.length < 3; slot += 1) {
      const idea = ideas[(index * 2 + slot) % ideas.length]
      const plate = plateFor([idea.pillar], seed(`idea-${slot}`), taken)
      const why = `Своя идея «Кедра»: ${idea.title.toLowerCase()}. Свежий заход, которого не было в плане.`
      if (posts.length < 3) {
        let text = composePost({ ...plate, day: dayNumber, scene: idea.scene, pillar: idea.pillar }, { angle: idea.angle, used, variant: variant + index + slot, date, occasion: null })
        if (idea.id === 'birthday' && !text.includes('10%')) text = text.replace(/\n\n([^\n]+)$/, `\n\n${BIRTHDAY_LINE}\n\n$1`)
        takeLines(text, used)
        posts.push({ id: `i-${dayNumber}-${idea.id}`, kind: 'Идея', title: idea.title, why, refs: [], dish: plate.dish, text })
      }
      if (reels.length < 3) reels.push({ id: `ri-${dayNumber}-${idea.id}`, kind: 'Идея', refs: [], ...reelFrom(idea.reel, plate.dish, idea.title, why) })
      if (slot > 5) break
    }

    out.push({ day: dayNumber, date, label: formatLong(date), weekday: weekdayName(date), planTitle: base.title, posts: posts.slice(0, 3), reels: reels.slice(0, 3) })
  }
  return out
}

export function reelText(reel) {
  return `${reel.title}\n\nХук: ${reel.hook}\n\nКадры:\n${reel.shots}\n\nЗвук: ${reel.sound}`
}
