export function packEvent(format) {
  if (!format?.id) return null
  return {
    id: format.id,
    group: format.group,
    title: format.title,
    hook: format.hook,
    note: format.note,
    need: format.need,
    how: Array.isArray(format.how) ? format.how : [],
    ads: Array.isArray(format.ads) ? format.ads : [],
  }
}

export function eventBlock(event) {
  if (!event?.title) return ''
  const step = event.how?.[0] ? ` ${event.how[0]}` : event.note ? ` ${event.note}.` : ''
  return `Плюсом к этому вечеру — ${event.title}. ${event.hook || ''}${step}`.replace(/\s+/g, ' ').trim()
}

export function eventMentioned(text, event) {
  if (!event?.title) return true
  const blob = String(text || '').toLowerCase()
  const title = String(event.title).toLowerCase()
  const hook = String(event.hook || '').toLowerCase().slice(0, 18)
  return blob.includes(title) || (hook.length > 8 && blob.includes(hook))
}

export function withEvent(text, event) {
  const base = String(text || '').trim()
  const extra = eventBlock(event)
  if (!extra || eventMentioned(base, event)) return base
  const parts = base ? base.split(/\n{2,}/) : []
  const ctaAt = parts.length && /kedr-res\.ru/i.test(parts[parts.length - 1]) ? parts.length - 1 : parts.length
  return [...parts.slice(0, ctaAt), extra, ...parts.slice(ctaAt)].filter(Boolean).join('\n\n')
}
