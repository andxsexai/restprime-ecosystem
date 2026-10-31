import { mountGl } from './scripts/gl.js'
import { activePlace, addPlace, load, patchPlace, save } from './scripts/store.js'
import { aiScenario, buildCalendar, presentDay } from './modules/calendar-30d/content.js'
import { bindDays } from './modules/calendar-30d/cards.js'
import { renderMatrix, renderPosts, renderReels, renderThemes } from './modules/calendar-30d/view.js'
import { bindRadar, renderRadar } from './modules/trend-radar/view.js'
import { bindVault, DEMO_ROWS, insightFromRows, renderVault } from './modules/vault-docs/view.js'
import { readUpload } from './modules/vault-docs/parse.js'
import { bindIg, renderIg } from './modules/analytics-ig/view.js'
import { architectureMarkdown, bindTeam, canApprove, renderTeam, roleLabel } from './modules/team-room/view.js'

const MODES = [
  ['matrix', 'План на 30 дней', 'Матрица директора'],
  ['posts', 'Посты 30 дней', 'Тексты и фото-ТЗ'],
  ['reels', 'Reels: идеи 30 дней', 'Хук, тайминг, звук'],
  ['themes', 'Темы и прогревы', 'Линия месяца'],
  ['radar', 'Тренд-радар', 'Разбор роликов'],
  ['vault', 'Файлы и память', 'Word, Excel, PDF, TG'],
  ['ig', 'Instagram', 'Охваты и бронь'],
  ['team', 'Комната', 'Регистрация и бриф'],
]

let state = load()
let mode = sessionStorage.getItem('rp-mode') || 'matrix'

const view = document.querySelector('#view')
const traffic = document.querySelector('#traffic')
const modes = document.querySelector('#modes')
const workspace = document.querySelector('#workspace')
const toast = document.querySelector('#toast')
const sheet = document.querySelector('#sheet')
const sheetBody = document.querySelector('#sheet-body')

mountGl(document.querySelector('#gl'))

function place() {
  return activePlace(state)
}

function days() {
  return buildCalendar().map((day) => presentDay(day, place()))
}

function dishes() {
  const found = []
  for (const file of place().vault || []) {
    for (const dish of file.dishes || []) {
      if (!found.includes(dish)) found.push(dish)
    }
  }
  return found.slice(0, 4)
}

function paint() {
  const current = place()
  workspace.innerHTML = state.places.map((item) => `<option value="${item.id}" ${item.id === current.id ? 'selected' : ''}>${item.name}</option>`).join('')
  document.querySelector('#place-meta').textContent = `${current.city} · ${current.url.replace(/^https?:\/\//, '')}`
  renderTraffic(current)
  modes.innerHTML = MODES.map(([id, title, note]) => `
    <button type="button" class="mode-btn ${mode === id ? 'is-on' : ''}" data-mode="${id}">
      <strong>${title}</strong>
      <span>${note}</span>
    </button>
  `).join('')
  const list = days()
  if (mode === 'matrix') view.innerHTML = renderMatrix(list)
  if (mode === 'posts') view.innerHTML = renderPosts(list)
  if (mode === 'reels') view.innerHTML = renderReels(list)
  if (mode === 'themes') view.innerHTML = renderThemes(list, dishes())
  if (mode === 'radar') view.innerHTML = renderRadar(current)
  if (mode === 'vault') view.innerHTML = renderVault(current)
  if (mode === 'ig') view.innerHTML = renderIg(current)
  if (mode === 'team') view.innerHTML = renderTeam(state, current, list)
  bindDays(view, {
    ai: openScenario,
    replace: replaceDay,
    tg: sendTg,
    approve: approveDay,
  })
  if (mode === 'radar') bindRadar(view, current)
  if (mode === 'vault') {
    bindVault(view, {
      onFiles: async (files) => {
        const parsed = []
        for (const file of files) parsed.push(await readUpload(file, current.name))
        state = patchPlace(state, current.id, (item) => ({ ...item, vault: [...parsed, ...item.vault].slice(0, 12) }))
        paint()
        note('Файл прочитан. Инсайт лежит в памяти ресторана.')
      },
      onDemo: () => {
        const built = insightFromRows(DEMO_ROWS, current.name)
        state = patchPlace(state, current.id, (item) => ({
          ...item,
          vault: [{ name: 'Отчёт маржи KEDR.xlsx', kind: 'Excel', ...built }, ...item.vault].slice(0, 12),
        }))
        paint()
        note('Учебный отчёт KEDR добавлен в память.')
      },
      onChannel: (channel) => {
        state = patchPlace(state, current.id, (item) => ({ ...item, tg: { ...item.tg, channel: String(channel || '').trim() } }))
        paint()
        note('Канал сохранён на этом устройстве.')
      },
    })
  }
  if (mode === 'ig') {
    bindIg(view, (handle) => {
      state = patchPlace(state, current.id, (item) => ({ ...item, ig: { handle, connected: true } }))
      paint()
      note('Аккаунт записан локально. Выгрузки Meta нет.')
    })
  }
  if (mode === 'team') {
    bindTeam(view, {
      onAuth: (session) => {
        state = { ...state, session }
        save(state)
        paint()
        note(`${session.name} вошёл как ${roleLabel(session.role)}.`)
      },
      onLogout: () => {
        state = { ...state, session: null }
        save(state)
        paint()
      },
      onChat: ({ day, text }) => {
        if (!text) return
        const found = days().find((item) => item.key === day)
        const session = state.session || { name: 'Гость', role: 'guest' }
        state = patchPlace(state, current.id, (item) => ({
          ...item,
          chat: [...(item.chat || []), { author: session.name, role: session.role, text, label: found?.label || day, at: Date.now() }].slice(-40),
        }))
        paint()
      },
      onVote: (day, side) => {
        if (!day) return
        state = patchPlace(state, current.id, (item) => {
          const prev = item.votes?.[day] || { up: 0, down: 0 }
          return { ...item, votes: { ...item.votes, [day]: { ...prev, [side]: prev[side] + 1 } } }
        })
        paint()
      },
      onExport: () => {
        const blob = new Blob([architectureMarkdown()], { type: 'text/markdown;charset=utf-8' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'RESTPRIME-KEDR-architecture.md'
        link.click()
        URL.revokeObjectURL(link.href)
        note('Архитектура скачана.')
      },
    })
  }
}

function renderTraffic(current) {
  const today = days()[0]
  const hot = dishes()
  traffic.innerHTML = `
    <article class="traffic">
      <div>
        <p class="eyebrow">Светофор директора · сегодня</p>
        <h2>${today.label}</h2>
        <p class="traffic__topic">${today.topic}</p>
        <p class="traffic__tone">${current.name} · ${current.tone}</p>
      </div>
      <ul class="traffic__slots">
        <li><span class="lamp lamp-${today.status}"></span><strong>Пост</strong><em>${today.format}</em></li>
        <li><span class="lamp lamp-ready"></span><strong>Reels</strong><em>${today.hook}</em></li>
        <li><span class="lamp lamp-draft"></span><strong>Stories</strong><em>${today.stories}</em></li>
      </ul>
      <button type="button" class="approve-day" data-approve-today>Утвердить день</button>
      ${hot.length ? `<p class="traffic__push">Кухня просит на неделе: ${hot.join(', ')}</p>` : ''}
    </article>`
  traffic.querySelector('[data-approve-today]')?.addEventListener('click', () => approveDay(today.key))
}

function openScenario(key) {
  const day = days().find((item) => item.key === key)
  if (!day) return
  sheetBody.textContent = aiScenario(day, place(), dishes())
  sheet.showModal()
}

function replaceDay(key) {
  const current = place().replaced?.[key]
  state = patchPlace(state, place().id, (item) => ({
    ...item,
    replaced: { ...item.replaced, [key]: !current },
  }))
  paint()
  note(current ? 'Вернули исходную идею.' : 'Идея заменена на запасную.')
}

function sendTg(key) {
  const day = days().find((item) => item.key === key)
  if (!day) return
  const channel = place().tg?.channel || '@черновик'
  state = patchPlace(state, place().id, (item) => ({
    ...item,
    tg: {
      ...item.tg,
      queue: [...(item.tg?.queue || []), { channel, label: day.label, text: day.post, at: Date.now() }].slice(-20),
    },
  }))
  paint()
  note(`В очереди Telegram (${channel}): ${day.label}. Наружу сообщение не ушло.`)
}

function approveDay(key) {
  if (!canApprove(state.session)) {
    note('Утверждает директор или маркетолог. Зайдите в комнату и выберите роль.')
    mode = 'team'
    sessionStorage.setItem('rp-mode', mode)
    paint()
    return
  }
  state = patchPlace(state, place().id, (item) => ({
    ...item,
    status: { ...item.status, [key]: 'approved' },
  }))
  const who = state.session ? `${state.session.name}` : 'локально'
  paint()
  note(`День утверждён (${who}).`)
}

function note(text) {
  toast.hidden = false
  toast.textContent = text
  clearTimeout(note.timer)
  note.timer = setTimeout(() => { toast.hidden = true }, 3200)
}

modes.addEventListener('click', (event) => {
  const button = event.target.closest('[data-mode]')
  if (!button) return
  mode = button.dataset.mode
  sessionStorage.setItem('rp-mode', mode)
  paint()
})

workspace.addEventListener('change', () => {
  state = { ...state, activeId: workspace.value }
  save(state)
  paint()
  note(`Тон и план переключены на ${place().name}.`)
})

document.querySelector('#add-place').addEventListener('click', () => {
  document.querySelector('#place-dialog').showModal()
})

document.querySelector('#place-form').addEventListener('submit', (event) => {
  event.preventDefault()
  const data = new FormData(event.currentTarget)
  state = addPlace(state, {
    name: data.get('name'),
    url: data.get('url'),
    city: data.get('city'),
    cuisine: data.get('cuisine'),
    tone: data.get('tone'),
    phone: data.get('phone'),
  })
  event.currentTarget.reset()
  document.querySelector('#place-dialog').close()
  paint()
  note('Ресторан добавлен. Матрица говорит его голосом.')
})

document.querySelector('#sheet-copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(sheetBody.textContent)
    note('Сценарий скопирован.')
  } catch {
    note('Скопируйте текст из окна вручную.')
  }
})

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {})
}

paint()
