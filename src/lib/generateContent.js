import { contentPlan } from '../data/contentPlan.js'
import { PLAN_START, formatLong, isoDate } from './planDates.js'

export const RUBRICS = [
  { id: 'sense', title: 'Сенсорика' },
  { id: 'kitchen', title: 'Кухня изнутри' },
  { id: 'events', title: 'События' },
  { id: 'people', title: 'Люди' },
  { id: 'engage', title: 'Вовлечение' },
  { id: 'service', title: 'Сервис' },
]

const SALES = [
  'д. Зайцево, ул. Сосновая, 3.',
  'Каждый день с 12:00 до 24:00.',
  '+7 (495) 274-53-54 · +7 (929) 979-53-54',
  'kedr-res.ru',
].join('\n')

function capital(text) {
  const value = String(text || '').trim()
  if (!value) return 'Вечер в соснах'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function plateLine(plate) {
  if (!plate?.dish || String(plate.dish).startsWith('без тарелки')) {
    return 'В этом кадре нет тарелки. Есть зал: свет, дерево и тишина, пока гости ещё не сели.'
  }
  const price = plate.margin && plate.margin !== 'зал' ? ` ${plate.margin}.` : ''
  return `Если остаться за столом, в карте «Кедра» есть ${plate.dish}.${price}`
}

function story(rubricId, topic, plate) {
  const scene = capital(topic)
  const dish = plateLine(plate)
  const lines = {
    sense: `${scene}.\n\nСвет в зале теплее, чем на дороге. Сосны держат звук, и разговор не приходится повышать. Это большая часть вечера: не блюдо, а то, как здесь сидится.`,
    kitchen: `Кухня не выходит в зал с речью.\n\n${scene}. Тарелка появляется, когда к ней уже есть повод, а не вместо повода.\n\n${dish}`,
    events: `${scene}.\n\nЗал закрывают под своих. День рождения в меню считается так: скидка 10% в сам день, три дня до и три дня после. Это правило карты, не обещание отдельной акции.`,
    people: `Вечер держат люди за столом, не афиша.\n\n${scene}. Кто-то только снял пальто, кто-то уже никуда не спешит.`,
    engage: `${scene}.\n\nКак провести этот вечер: остаться за столом или ехать дальше?\n\nНапишите, если дата уже есть. Если даты нет — можно просто прочитать и отложить.`,
    service: `${scene}.\n\nСтол можно занять заранее. Этот пост не обещает бронь на следующий год: он говорит, куда писать, если вечер уже ваш.`,
  }
  const body = lines[rubricId] || lines.sense
  if (rubricId === 'kitchen' || rubricId === 'service') return body
  return `${body}\n\n${dish}`
}

export function generateTelegramPost(rubricId, topic, plate = {}) {
  const storyText = story(rubricId, topic, plate)
  return `${storyText}\n\n${SALES}`
}

export function adaptSourceToToday(day, sourceText) {
  const raw = String(sourceText || '')
  const rubric = raw.includes('?') ? 'engage' : raw.length > 500 ? 'kitchen' : 'sense'
  return generateTelegramPost(rubric, day?.scene, day)
}

export function generateInfinitePlan(startDate = isoDate(PLAN_START), limit = 365) {
  const [year, month, day] = String(startDate).split('-').map(Number)
  const start = new Date(year, month - 1, day)
  if (Number.isNaN(start.getTime())) return []

  return Array.from({ length: limit }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const source = contentPlan[index] || contentPlan[index % contentPlan.length]
    const rubric = RUBRICS[index % RUBRICS.length]
    const dayNumber = index + 1
    return {
      id: isoDate(date),
      date: isoDate(date),
      label: formatLong(date),
      dayNumber,
      type: dayNumber % 5 === 0 ? 'reel' : 'post',
      rubric: rubric.title,
      rubricId: rubric.id,
      title: source.title,
      hook: source.reelHook,
      scene: source.scene,
      dish: source.dish,
      margin: source.margin,
      status: dayNumber <= contentPlan.length ? 'plan' : 'draft',
      inCabinet: dayNumber <= contentPlan.length,
    }
  })
}

export function planStartsOn() {
  return isoDate(PLAN_START)
}
