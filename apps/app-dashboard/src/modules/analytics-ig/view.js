import { escapeHtml } from '../calendar-30d/cards.js'

const SNAPSHOT = [
  { label: 'Охват 30 дней', value: '48 200', hint: 'учебный срез' },
  { label: 'ER', value: '4,6%', hint: 'сохранения + комментарии' },
  { label: 'Досмотр Reels', value: '41% → 24%', hint: '3 секунды и финал' },
  { label: 'Подписчики', value: '+186', hint: 'за 30 дней среза' },
  { label: 'В бронь', value: '3,1%', hint: 'от нажатий на профиль' },
]

export function renderIg(place) {
  const connected = place.ig?.connected
  return `<section class="panel">
    <header class="panel__head">
      <p class="eyebrow">7 · Аналитика</p>
      <h2>Instagram и охваты</h2>
      <p>Цифры ниже — демонстрационный срез для кабинета, не выгрузка Meta. Подключение сохраняет только @имя на этом устройстве.</p>
    </header>
    <form class="glass-card ig-form" data-ig>
      <label>Аккаунт
        <input name="handle" value="${escapeHtml(place.ig?.handle || '')}" placeholder="@kedr.rest" required>
      </label>
      <button type="submit">${connected ? 'Обновить привязку' : 'Подключить аккаунт'}</button>
      <p class="brief">${connected ? `Привязан ${escapeHtml(place.ig.handle)}. Боевой API не вызывается.` : 'Аккаунт ещё не привязан.'}</p>
    </form>
    <div class="metrics">
      ${SNAPSHOT.map((item) => `<article class="metric">
        <p class="eyebrow">${escapeHtml(item.hint)}</p>
        <strong>${escapeHtml(item.value)}</strong>
        <span>${escapeHtml(item.label)}</span>
      </article>`).join('')}
    </div>
    <div class="glass-card">
      <h3>Удержание ролика</h3>
      <div class="bars" aria-hidden="true">
        <span style="--h:92%"><i>0с</i></span>
        <span style="--h:71%"><i>3с</i></span>
        <span style="--h:48%"><i>8с</i></span>
        <span style="--h:33%"><i>12с</i></span>
        <span style="--h:24%"><i>15с</i></span>
      </div>
      <p>Совет агента для ${escapeHtml(place.name)}: обрыв чаще всего между 3 и 8 секундами. Не ставьте титр с адресом раньше доказательства — сначала уголь или хвоя, адрес в конце.</p>
    </div>
  </section>`
}

export function bindIg(root, onSave) {
  root.querySelector('[data-ig]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    onSave(String(new FormData(event.currentTarget).get('handle') || '').trim())
  })
}
