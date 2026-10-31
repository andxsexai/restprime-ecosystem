export const STATUS = {
  draft: 'Черновик',
  ready: 'Готово',
  approved: 'Утверждено',
  live: 'В эфире',
}

export function dock() {
  return `<div class="dock">
    <button type="button" data-act="ai" title="Сгенерировать ИИ-сценарий">ИИ-сценарий</button>
    <button type="button" data-act="replace" title="Заменить идею">Заменить</button>
    <button type="button" data-act="tg" title="Отправить в Telegram">В Telegram</button>
    <button type="button" data-act="approve" title="Утвердить">Утвердить</button>
  </div>`
}

export function card(day, body) {
  return `<article class="day-card status-${day.status}${day.replaced ? ' is-replaced' : ''}" data-day="${day.key}" tabindex="0">
    <header class="day-card__top">
      <span class="day-card__date">${escapeHtml(day.label)}</span>
      <span class="lamp lamp-${day.status}">${STATUS[day.status] || day.status}</span>
    </header>
    <h3 class="day-card__topic">${escapeHtml(day.topic)}</h3>
    <p class="day-card__meta"><span>${escapeHtml(day.format)}</span></p>
    ${body || ''}
    ${dock()}
  </article>`
}

export function bindDays(root, handlers) {
  const hoverNone = window.matchMedia('(hover: none)').matches
  root.querySelectorAll('[data-day]').forEach((node) => {
    const key = node.dataset.day
    node.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch') return
      node.classList.add('is-raised')
    })
    node.addEventListener('pointerleave', () => node.classList.remove('is-raised'))
    node.addEventListener('click', (event) => {
      const act = event.target.closest('[data-act]')
      if (act) {
        event.preventDefault()
        handlers[act.dataset.act]?.(key)
        return
      }
      if (hoverNone) node.classList.toggle('is-raised')
    })
  })
  root.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const text = button.closest('article')?.querySelector('[data-copy-source]')?.textContent || ''
      try {
        await navigator.clipboard.writeText(text.trim())
        button.textContent = 'Скопировано'
      } catch {
        button.textContent = 'Не вышло'
      }
      setTimeout(() => { button.textContent = 'Копировать' }, 1400)
    })
  })
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
