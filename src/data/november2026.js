import { EVENT_FORMATS } from './eventFormats.js'
import { packEvent } from '../lib/eventDay.js'
import { dateForDay, isoDate } from '../lib/planDates.js'

const WEEK = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']

function eventFrom(id, patch = {}) {
  const format = EVENT_FORMATS.find((item) => item.id === id)
  if (!format) return packEvent({ id, ...patch })
  return packEvent({
    ...format,
    ...patch,
    how: patch.how || format.how,
    ads: patch.ads || format.ads,
  })
}

function slot(day, status, title = '', type = '', extra = {}) {
  const date = new Date(2026, 10, day)
  return {
    date: `2026-11-${String(day).padStart(2, '0')}`,
    dayOfWeek: WEEK[date.getDay()],
    status,
    title: title || (status === 'free' ? 'Свободно' : ''),
    type,
    ...extra,
  }
}

export const NOVEMBER_2026 = [
  slot(1, 'free'),
  slot(2, 'free'),
  slot(3, 'booked', 'Основной зал (МР)', 'booking'),
  slot(4, 'free'),
  slot(5, 'free'),
  slot(6, 'event', 'Энергетический день', 'festival', {
    event: eventFrom('yoga', {
      id: 'nov-energy',
      title: 'Энергетический день',
      hook: 'Практика к открытию. Стол с двенадцати.',
      note: 'йога, звуковая ванна, напитки с карты',
      need: 'Коврики. Инструктор. Чаши после обеда. Зал с 12:00.',
      how: [
        'Практика к открытию, стол с 12:00: раф, капучино, лимонад «Кедр», сырники, драники.',
        'Смузи и завтрак в восемь в меню нет. После обеда — звуковая ванна. Не лечим.',
      ],
    }),
  }),
  slot(7, 'event', 'Танец у входа', 'workshop', {
    event: eventFrom('fire', {
      id: 'nov-dance',
      title: 'Танец у входа',
      hook: 'Короткий огонь, потом стол. Не до утра.',
      note: 'площадка у входа, иначе зал',
      need: 'Безопасный отступ от хвои. Если площадки нет — танец в зале, без костра.',
      how: [
        'Огонь только на безопасной площадке у входа, 10–15 минут. Иначе не зажигаем: «Кедр» среди сосен.',
        'Зал открыт до полуночи, не до утра. Снимать контент можно, лица в камеру не требуем.',
      ],
    }),
  }),
  slot(8, 'event', 'Киноужин «Письма вам»', 'cinema', {
    event: eventFrom('cinema-dinner', {
      id: 'nov-letters',
      title: 'Киноужин «Письма вам»',
      hook: 'После титров остаёмся за столом.',
      note: 'фильм в зале, подачи из карты',
      need: 'Экран в зале. Закрытый стол. Не кинотеатр под открытым небом.',
      how: [
        'Показ в зале, не кинотеатр под открытым небом.',
        'Подачи из карты дня, глинтвейн или «Хвойный вечер». Пруд не обещаем.',
      ],
    }),
  }),
  slot(9, 'booked', 'Бронь (ждём меню)', 'booking'),
  slot(10, 'free'),
  slot(11, 'free'),
  slot(12, 'free'),
  slot(13, 'event', 'Мастер-класс по кадру', 'workshop', {
    event: eventFrom('art', {
      id: 'nov-photo',
      group: 'culture',
      title: 'Мастер-класс по кадру',
      hook: 'Учимся снимать зал и тарелку.',
      note: 'телефон или камера, свет зала',
      need: 'Фотограф. Телефоны гостей. Тарелка дня из меню.',
      how: [
        'Снимаем сосны, дерево, подачу дня. У зала, не на выдуманной воде.',
        'После съёмки — обед из карты. Пруд не обещаем.',
      ],
    }),
  }),
  slot(14, 'booked', 'VIP-зал (Елена)', 'booking'),
  slot(15, 'booked', 'Свадьба', 'wedding'),
  slot(16, 'free'),
  slot(17, 'free'),
  slot(18, 'free'),
  slot(19, 'free'),
  slot(20, 'event', 'Киноужин «Норвежский пир»', 'cinema', {
    event: eventFrom('cinema-dinner', {
      id: 'nov-north',
      title: 'Киноужин «Норвежский пир»',
      hook: 'Север в атмосфере. Рыба — с карты.',
      note: 'сибас, лосось, уха царская',
      need: 'Экран в зале. Рыбные позиции из меню, не норвежская карта с потолка.',
      how: [
        'В зале, не на улице. Север — свет, тишина, хвоя за окном.',
        'Из меню: сибас с наршарабом, обожжённый лосось, уха царская. Выдуманных «норвежских сетов» нет.',
      ],
    }),
  }),
  slot(21, 'event', 'Съёмка на территории', 'workshop', {
    event: eventFrom('art', {
      id: 'nov-tfp',
      title: 'Съёмка на территории',
      hook: 'Сосны и зал. Не вторая локация.',
      note: 'TFP на территории «Кедра»',
      need: 'Договорённость съёмки. Территория и зал. Не вторая локация.',
      how: [
        'Снимаем у зала и среди сосен. Не рисуем вторую локацию.',
        'TFP — условия съёмки, не курорт. Пруд не обещаем.',
      ],
    }),
  }),
  slot(22, 'booked', 'Два блока (20+20)', 'booking'),
  slot(23, 'free'),
  slot(24, 'booked', 'Свадьба', 'wedding'),
  slot(25, 'free'),
  slot(26, 'free'),
  slot(27, 'event', 'Арт-ужин с художником', 'workshop', {
    event: eventFrom('art', {
      id: 'nov-art',
      title: 'Арт-ужин с художником',
      hook: 'Лес на холсте, пока идёт горячее.',
      note: 'акрил или акварель, стол из карты',
      how: [
        'Сначала эскиз, потом горячее из карты дня. Краска не спорит с тарелкой.',
        'Напиток с карты, без названий вин, которых нет в меню.',
      ],
    }),
  }),
  slot(28, 'booked', 'VIP-зал (Елена)', 'booking'),
  slot(29, 'event', 'Чайная церемония', 'festival', {
    event: eventFrom('tea', {
      id: 'nov-tea',
      title: 'Чайная церемония',
      hook: 'Провожаем осень сетом из меню.',
      note: 'сет «Чайная церемония», 2 000 ₽',
      how: [
        'В меню есть сет «Чайная церемония», 2 000 ₽. Таёжные сборы вне карты не обещаем.',
        'В зале. Веранду не рисуем, если в этот день она закрыта. 29 ноября — День матери: стол с мамой, готовить будет не она.',
      ],
    }),
  }),
  slot(30, 'free'),
]

export function occupancyByIso(iso) {
  return NOVEMBER_2026.find((item) => item.date === iso) || null
}

export function occupancyForDay(dayNumber) {
  return occupancyByIso(isoDate(dateForDay(dayNumber)))
}

export function applyOccupancy(days) {
  return days.map((day) => {
    const slotItem = occupancyForDay(day.day)
    if (!slotItem) return { ...day, occupancy: null, booked: false }
    const occupancy = { status: slotItem.status, title: slotItem.title, type: slotItem.type }
    if (slotItem.status === 'booked') {
      return { ...day, occupancy, event: null, booked: true }
    }
    if (slotItem.status === 'event' && slotItem.event) {
      return { ...day, occupancy, event: slotItem.event, warmupTheme: slotItem.event.title, booked: false }
    }
    return { ...day, occupancy, booked: false }
  })
}

export const NOVEMBER_ANNOUNCEMENT = `Ноябрь в «Кедре»: кино, практика и стол

Часть дат уже закрыта под свадьбы и свои брони. Свободные вечера заполняем форматами зала. Каждый день с 12:00 до 24:00.

Киноужины в зале, не под открытым небом:
• 8 ноября — «Письма вам». Стол и фильм. Подачи из карты.
• 20 ноября — «Норвежский пир». Север в атмосфере. Рыба с карты: сибас, лосось, уха царская.

Практика и тело:
• 6 ноября — практика к открытию, стол с 12:00, звуковая ванна после обеда. Смузи в меню нет: раф, капучино, лимонад «Кедр».
• 7 ноября — танец. Огонь только если площадка у входа безопасна. Иначе в зале. До полуночи, не до утра.

Кадр и холст:
• 13 ноября — учимся снимать зал и тарелку на телефон.
• 21 ноября — съёмка на территории, среди сосен. Пруд не обещаем.
• 27 ноября — арт-ужин: лес на холсте, горячее из карты.

Чай:
• 29 ноября — сет «Чайная церемония», 2 000 ₽. Провожаем осень в зале.

Эти даты уже заняты, новые брони на них не ставим:
3, 9, 14, 15, 22, 24 и 28 ноября.

Запись: +7 (495) 274-53-54 · +7 (929) 979-53-54
д. Зайцево, ул. Сосновая, 3
kedr-res.ru`
