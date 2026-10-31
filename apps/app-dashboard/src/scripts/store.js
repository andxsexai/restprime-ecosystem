const KEY = 'restprime-os-v1'

export const KEDR = {
  id: 'kedr',
  name: 'KEDR',
  url: 'https://kedr-res.ru/',
  city: 'д. Зайцево, ул. Сосновая, д. 3',
  cuisine: 'Авторская кухня: дичь, хвоя, лесные ягоды',
  tone: 'Тихий, сенсорный, северный. Короткие фразы. Запах хвои, огонь, смола, бор. Без пищевого крика и восклицательных призывов.',
  phone: '+7 (495) 274-53-54',
}

function blankPlace(partial) {
  return {
    status: {},
    replaced: {},
    vault: [],
    tg: { channel: '', queue: [] },
    ig: { handle: '', connected: false },
    chat: [],
    votes: {},
    ...partial,
  }
}

export function defaultState() {
  return {
    activeId: 'kedr',
    session: null,
    places: [blankPlace(KEDR)],
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const data = JSON.parse(raw)
    if (!data.places?.length) return defaultState()
    return data
  } catch {
    return defaultState()
  }
}

export function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function activePlace(state) {
  return state.places.find((place) => place.id === state.activeId) || state.places[0]
}

export function patchPlace(state, id, recipe) {
  const next = {
    ...state,
    places: state.places.map((place) => (place.id === id ? recipe(place) : place)),
  }
  save(next)
  return next
}

export function addPlace(state, fields) {
  const id = fields.name.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-|-$/g, '') || `place-${Date.now()}`
  const unique = state.places.some((place) => place.id === id) ? `${id}-${Date.now()}` : id
  const place = blankPlace({
    id: unique,
    name: fields.name.trim(),
    url: fields.url.trim() || 'https://',
    city: fields.city.trim() || 'Город не указан',
    cuisine: fields.cuisine.trim() || 'Кухня появится из загруженных файлов',
    tone: fields.tone.trim() || 'Спокойный голос дома. Без крика и чужих мемов.',
    phone: fields.phone.trim() || '',
  })
  const next = { ...state, activeId: place.id, places: [...state.places, place] }
  save(next)
  return next
}
