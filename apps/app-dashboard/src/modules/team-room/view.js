import { escapeHtml } from '../calendar-30d/cards.js'

const ROLES = [
  ['director', 'Директор'],
  ['marketer', 'Маркетолог'],
  ['smm', 'SMM'],
  ['chef', 'Шеф-повар'],
]

export function renderTeam(state, place, days) {
  const session = state.session
  const votes = place.votes || {}
  return `<section class="panel">
    <header class="panel__head">
      <p class="eyebrow">8 · Команда</p>
      <h2>Комната обсуждения</h2>
      <p>Регистрация живёт на этом устройстве: имя и роль, без пароля и без сервера. Директор и маркетолог утверждают день, SMM ведёт тексты и Telegram, шеф меняет идею и смотрит память кухни.</p>
    </header>
    <div class="split">
      <form class="glass-card" data-auth>
        <h3>${session ? 'Смена роли' : 'Регистрация'}</h3>
        <label>Имя
          <input name="name" required value="${escapeHtml(session?.name || '')}" autocomplete="name">
        </label>
        <label>Роль
          <select name="role">
            ${ROLES.map(([id, label]) => `<option value="${id}" ${session?.role === id ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
        <button type="submit">${session ? 'Обновить' : 'Войти в комнату'}</button>
        ${session ? '<button type="button" class="btn-quiet" data-logout>Выйти</button>' : ''}
        <p class="brief">${session ? `Сейчас: ${escapeHtml(session.name)}, ${escapeHtml(roleLabel(session.role))}.` : 'Без входа кабинет можно смотреть. Утверждение подпишет роль, когда она есть.'}</p>
      </form>
      <form class="glass-card" data-chat>
        <h3>Чат поверх плана</h3>
        <label>День
          <select name="day">
            ${days.map((day) => `<option value="${day.key}">${escapeHtml(day.label)} — ${escapeHtml(day.topic)}</option>`).join('')}
          </select>
        </label>
        <label>Сообщение
          <textarea name="text" rows="3" required placeholder="Коротко: что меняем в кадре"></textarea>
        </label>
        <div class="row-actions">
          <button type="submit">Написать</button>
          <button type="button" class="btn-quiet" data-vote="up">За идею</button>
          <button type="button" class="btn-quiet" data-vote="down">Против</button>
        </div>
      </form>
    </div>
    <div class="chat-log">
      ${(place.chat || []).slice().reverse().map((item) => `<article class="glass-card chat-item">
        <p class="eyebrow">${escapeHtml(item.author)} · ${escapeHtml(roleLabel(item.role))} · ${escapeHtml(item.label)}</p>
        <p>${escapeHtml(item.text)}</p>
      </article>`).join('') || '<p class="empty">В комнате ещё тихо.</p>'}
    </div>
    <div class="vote-strip">
      ${days.slice(0, 8).map((day) => {
        const vote = votes[day.key] || { up: 0, down: 0 }
        return `<p><strong>${escapeHtml(day.topic)}</strong> · за ${vote.up} / против ${vote.down}</p>`
      }).join('')}
    </div>
    <div class="glass-card export-card">
      <h3>Экспорт GitHub-архитектуры</h3>
      <p>Скачивается заполненный бриф и дерево Vite 6 «как Корнер» для репозитория. Это текст для команды, не секретный ключ.</p>
      <button type="button" data-export>Скачать архитектуру</button>
    </div>
  </section>`
}

export function roleLabel(role) {
  return ROLES.find(([id]) => id === role)?.[1] || 'Гость'
}

export function canApprove(session) {
  return !session || session.role === 'director' || session.role === 'marketer'
}

export function bindTeam(root, handlers) {
  root.querySelector('[data-auth]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    handlers.onAuth({ name: String(data.get('name') || '').trim(), role: String(data.get('role') || 'smm') })
  })
  root.querySelector('[data-logout]')?.addEventListener('click', () => handlers.onLogout())
  root.querySelector('[data-chat]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    handlers.onChat({ day: String(data.get('day')), text: String(data.get('text') || '').trim() })
    event.currentTarget.querySelector('textarea').value = ''
  })
  root.querySelectorAll('[data-vote]').forEach((button) => {
    button.addEventListener('click', () => {
      const day = root.querySelector('[data-chat] select')?.value
      handlers.onVote(day, button.dataset.vote)
    })
  })
  root.querySelector('[data-export]')?.addEventListener('click', () => handlers.onExport())
}

export function architectureMarkdown() {
  return `# RESTPRIME & KEDR — архитектура репозитория

Платформа: RESTPRIME
Флагман: KEDR — https://kedr-res.ru/
Язык: ru
Слоган: AI-экосистема ресторанного маркетинга и управления контентом без операционной рутины.

## Палитра

- Фон: #0B0C10
- Стекло: #141720, blur 24px
- Золото: #D4AF37
- Изумруд: #1E4D3B
- Металл слайдов: #1A0F2E → #3B1C32 → #6B2D5C

## Шрифты

- Заголовки: Fraunces Italic
- Текст: Source Serif 4
- Интерфейс: Source Sans 3

## Дерево

\`\`\`
apps/web-journey/     Vite 6 MPA, без React
  public/images/
  src/partials/       HEADER FOOTER COOKIE POLICY_BODY
  src/styles/         main.css journey.css locations.css
  src/scripts/main.js lerp-скролл, canvas, stitch-3D
  index.html
  location-1.html
  policy.html
  safety.html
  vite.config.js
apps/app-dashboard/   кабинет RESTPRIME
  src/modules/calendar-30d
  src/modules/trend-radar
  src/modules/vault-docs
  src/modules/analytics-ig
  src/modules/team-room
\`\`\`

## Витрина

На html:has(body.is-journey) стоит scroll-behavior: auto.
Свой цикл requestAnimationFrame пишет --cover с lerp 0.1.
Canvas атмосферы: fixed, pointer-events none, z-index 40. Шапка z-index 80.
Частицы — хвоя, пыль света и искры. Пауза при document.hidden.
prefers-reduced-motion отключает частицы, Ken Burns и 3D-ленту.
Лента интерьеров на ширине до 759px — нативный горизонтальный scroll-snap.

## Кабинет

Четыре режима месяца и четыре модуля: радар, файлы, Instagram, комната.
Файлы и заявки остаются в браузере.
`
}
