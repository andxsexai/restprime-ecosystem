import { TRENDS, deconstruct } from '../calendar-30d/content.js'
import { escapeHtml } from '../calendar-30d/cards.js'

export function renderRadar(place) {
  return `<section class="panel">
    <header class="panel__head">
      <p class="eyebrow">5 · Радар</p>
      <h2>Тренды фуд-маркетинга</h2>
      <p>Лента собрана как редакционный срез 2026 для прототипа. Это не живой парсер ленты: боевой сбор новостей подключается отдельно, чтобы не притворяться чужим сайтом.</p>
    </header>
    <div class="trend-list">
      ${TRENDS.map((trend) => `<article class="glass-card">
        <p class="eyebrow">${escapeHtml(trend.where)}</p>
        <h3>${escapeHtml(trend.title)}</h3>
        <p>${escapeHtml(trend.note)}</p>
        <p class="brief"><strong>Для ${escapeHtml(place.name)}.</strong> ${escapeHtml(trend.kedr)}</p>
      </article>`).join('')}
    </div>
    <form class="glass-card deconstruct" data-deconstruct>
      <h3>Разобрать видео по ссылке</h3>
      <p>Reels, TikTok или Shorts. Агент не забирает ролик с платформы: он кладёт каркас виральной структуры на голос ресторана.</p>
      <label>Ссылка
        <input name="url" type="url" required placeholder="https://">
      </label>
      <button type="submit">Переписать под ${escapeHtml(place.name)}</button>
      <pre data-deconstruct-out hidden></pre>
    </form>
  </section>`
}

export function bindRadar(root, place) {
  const form = root.querySelector('[data-deconstruct]')
  const out = root.querySelector('[data-deconstruct-out]')
  form?.addEventListener('submit', (event) => {
    event.preventDefault()
    const url = new FormData(form).get('url')
    out.hidden = false
    out.textContent = deconstruct(String(url || ''), place)
  })
}
