import { escapeHtml } from '../calendar-30d/cards.js'

export function renderVault(place) {
  const files = place.vault || []
  const queue = place.tg?.queue || []
  return `<section class="panel">
    <header class="panel__head">
      <p class="eyebrow">6 · Память</p>
      <h2>Файлы, инсайты и Telegram</h2>
      <p>Word, Excel и PDF читаются в браузере и остаются на этом устройстве. Токен бота сюда не вставляйте: канал — это имя, очередь — локальная.</p>
    </header>
    <div class="split">
      <form class="drop" data-drop>
        <p>Перетащите .docx, .xlsx или .pdf</p>
        <input type="file" accept=".docx,.xlsx,.xls,.csv,.pdf,application/pdf" multiple data-files>
        <button type="button" data-demo>Подставить отчёт KEDR</button>
        <p class="drop-error" data-drop-error hidden></p>
      </form>
      <form class="glass-card" data-tg>
        <h3>Telegram</h3>
        <label>Канал или чат команды
          <input name="channel" value="${escapeHtml(place.tg?.channel || '')}" placeholder="@kedr_team">
        </label>
        <button type="submit">Сохранить привязку</button>
        <ul class="queue">${queue.length ? queue.slice().reverse().map((item) => `<li><strong>${escapeHtml(item.channel || 'без канала')}</strong> · ${escapeHtml(item.label)}<br>${escapeHtml(item.text)}</li>`).join('') : '<li>Очередь пуста. Отправка живёт на карточке дня.</li>'}</ul>
      </form>
    </div>
    <div class="file-list">
      ${files.length ? files.map((file) => `<article class="glass-card">
        <p class="eyebrow">${escapeHtml(file.kind)}</p>
        <h3>${escapeHtml(file.name)}</h3>
        <p>${escapeHtml(file.insight)}</p>
        ${file.dishes?.length ? `<p class="tags">${file.dishes.map((dish) => `<span>${escapeHtml(dish)}</span>`).join('')}</p>` : ''}
      </article>`).join('') : '<p class="empty">Память пуста. Директорский инсайт появится после первого файла.</p>'}
    </div>
  </section>`
}

export function bindVault(root, handlers) {
  const input = root.querySelector('[data-files]')
  const drop = root.querySelector('[data-drop]')
  const error = root.querySelector('[data-drop-error]')
  const take = async (list) => {
    error.hidden = true
    try {
      await handlers.onFiles([...list])
    } catch (err) {
      error.hidden = false
      error.textContent = err.message || 'Файл не прочитан'
    }
  }
  input?.addEventListener('change', () => take(input.files))
  drop?.addEventListener('dragover', (event) => {
    event.preventDefault()
    drop.classList.add('is-over')
  })
  drop?.addEventListener('dragleave', () => drop.classList.remove('is-over'))
  drop?.addEventListener('drop', (event) => {
    event.preventDefault()
    drop.classList.remove('is-over')
    take(event.dataTransfer.files)
  })
  root.querySelector('[data-demo]')?.addEventListener('click', () => handlers.onDemo())
  root.querySelector('[data-tg]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    handlers.onChannel(new FormData(event.currentTarget).get('channel'))
  })
}

export const DEMO_ROWS = [
  { Блюдо: 'Ягодный чай', 'Маржа %': 80, Категория: 'Бар', Пушить: 'да' },
  { Блюдо: 'Хвойный тоник', 'Маржа %': 74, Категория: 'Бар', Пушить: 'да' },
  { Блюдо: 'Десерт «Смола»', 'Маржа %': 71, Категория: 'Десерт', Пушить: 'да' },
  { Блюдо: 'Оленина на углях', 'Маржа %': 68, Категория: 'Дичь', Пушить: 'да' },
  { Блюдо: 'Настойка кедровая', 'Маржа %': 66, Категория: 'Бар', Пушить: 'нет' },
  { Блюдо: 'Шеф-тейбл', 'Маржа %': 54, Категория: 'Сервис', Пушить: 'да' },
]

export function insightFromRows(rows, placeName) {
  const scored = rows.map((row) => {
    const name = String(row['Блюдо'] || row['блюдо'] || row.name || row.Name || Object.values(row)[0] || '').trim()
    const margin = Number(String(row['Маржа %'] || row['маржа'] || row.margin || '').replace(',', '.')) || 0
    const push = String(row['Пушить'] || row.push || 'да').toLowerCase()
    return { name, margin, push }
  }).filter((row) => row.name)
  const hot = scored.filter((row) => row.push === 'да' || row.push === 'yes' || row.push === '1').sort((a, b) => b.margin - a.margin)
  const dishes = (hot.length ? hot : scored).slice(0, 4).map((row) => row.name)
  const insight = dishes.length
    ? `${placeName}: на этой неделе пушить ${dishes.join(', ')}. Это верх списка по марже из загруженной таблицы, не вся карта.`
    : `${placeName}: в таблице не нашлось блюд. Проверьте первую строку с заголовками.`
  return { dishes, insight }
}

export function insightFromText(text, name, placeName) {
  const hits = ['оленин', 'хво', 'ягод', 'смол', 'настой', 'гриб', 'банкет', 'свад', 'вино']
    .filter((needle) => text.toLowerCase().includes(needle))
  const insight = hits.length
    ? `${placeName}: в «${name}» слышно про ${hits.join(', ')}. Имеет смысл опереть ближайшие дни на эти слова, а не на общий «уют».`
    : `${placeName}: «${name}» прочитан. Явных блюд в текстовом слое мало — агент сохранил файл как контекст бренда.`
  return { dishes: hits, insight, excerpt: text.slice(0, 420) }
}
