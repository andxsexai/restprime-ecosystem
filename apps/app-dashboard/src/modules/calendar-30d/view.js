import { card, escapeHtml } from './cards.js'

export function renderMatrix(days) {
  return `<section class="panel">
    <header class="panel__head">
      <p class="eyebrow">1 · Матрица директора</p>
      <h2>План на 30 дней</h2>
      <p>Светофор месяца. В покое виден топик, формат и статус. Док действий поднимается вместе с карточкой.</p>
    </header>
    <div class="matrix">${days.map((day) => card(day)).join('')}</div>
  </section>`
}

export function renderPosts(days) {
  return `<section class="panel">
    <header class="panel__head">
      <p class="eyebrow">2 · Тексты</p>
      <h2>Посты на 30 дней</h2>
      <p>Готовый текст, фото-ТЗ и теги для TG / VK / IG. Копирование — на самой карточке, без отдельного документа.</p>
    </header>
    <div class="stack">${days.map((day) => card(day, `
      <p class="copy-source" data-copy-source>${escapeHtml(day.post)}</p>
      <p class="brief"><strong>Фото.</strong> ${escapeHtml(day.photo)}</p>
      <p class="tags">${day.tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join('')}</p>
      <button type="button" class="text-btn" data-copy>Копировать</button>
    `)).join('')}</div>
  </section>`
}

export function renderReels(days) {
  return `<section class="panel">
    <header class="panel__head">
      <p class="eyebrow">3 · Раскадровка</p>
      <h2>Reels: идеи и сценарии</h2>
      <p>Хук первых трёх секунд, таймкод, строка на экране и звук. Полный сценарий собирает кнопка «ИИ-сценарий».</p>
    </header>
    <div class="stack">${days.map((day) => card(day, `
      <p class="hook">Хук: ${escapeHtml(day.hook)}</p>
      <ol class="beats">${day.beats.map((beat) => `<li><span>${escapeHtml(beat.t)}</span> ${escapeHtml(beat.shot)} <em>${escapeHtml(beat.text)}</em></li>`).join('')}</ol>
      <p class="brief">Звук: ${escapeHtml(day.sound)}. Удержание: не резать тишину между 3 и 8 секундами.</p>
    `)).join('')}</div>
  </section>`
}

export function renderThemes(days, dishes) {
  const push = dishes.length ? `Память файлов просит на этой неделе: ${dishes.join(', ')}.` : 'Загрузите Excel в «Файлы и память» — маржа подставится в строку блюда.'
  return `<section class="panel">
    <header class="panel__head">
      <p class="eyebrow">4 · Стратегия</p>
      <h2>Темы и прогревы</h2>
      <p>${escapeHtml(push)}</p>
    </header>
    <div class="stack">${days.map((day) => card(day, `
      <p class="brief"><strong>Линия.</strong> ${escapeHtml(day.line)}</p>
      <p class="brief"><strong>Боль гостя.</strong> ${escapeHtml(day.pain)}</p>
      <p class="brief"><strong>Ход.</strong> ${escapeHtml(day.offer)}</p>
      <p class="brief"><strong>Маржа.</strong> ${escapeHtml(dishes[0] || day.margin)} · <strong>Зал.</strong> ${escapeHtml(day.hall)}</p>
    `)).join('')}</div>
  </section>`
}
