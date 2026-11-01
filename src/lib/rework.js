import { TELEGRAM_CHANNELS } from '../data/telegramChannels.js'
import { moscowKey, recentMoscowKeys } from './planDates.js'
import { topicsOf } from './signals.js'
import { hashSeed } from './writer.js'
import { rebuildPost } from './rebuild.js'

function pickDay(days, topic, fromDay, seed) {
  const upcoming = days.filter((day) => day.day >= fromDay && day.status !== 'approved' && day.status !== 'agreed' && !day.manual)
  const fit = upcoming.filter((day) => topic?.pillars?.includes(day.pillar))
  const pool = fit.length ? fit : upcoming.length ? upcoming : days.filter((day) => day.day >= fromDay)
  if (!pool.length) return days[days.length - 1] || days[0]
  return pool[seed % pool.length]
}

export function reworkFor(day, sourceText, { variant = 0, format = 'short' } = {}) {
  return rebuildPost(day, { sourceText, variant, format })
}

export function buildReworkPack({ feed, news = [], days, fromDay }) {
  const windowKeys = feed?.window?.length ? feed.window : recentMoscowKeys(3)
  const items = []
  const seen = new Set()

  for (const channel of TELEGRAM_CHANNELS) {
    if (channel.id === 'kedrrest' || channel.feed === false) continue
    for (const post of feed?.channels?.[channel.id]?.posts || []) {
      const key = `${channel.id}-${post.id}`
      if (seen.has(key) || !windowKeys.includes(moscowKey(post.date))) continue
      const source = String(post.text || '').trim()
      if (source.length < 50) continue
      seen.add(key)
      const topic = topicsOf(source)[0] || null
      const seed = hashSeed(key, feed?.fetchedAt || '', fromDay)
      const day = pickDay(days, topic, fromDay, seed)
      if (!day) continue
      const built = reworkFor(day, source, { variant: seed % 8 })
      items.push({
        id: key,
        kind: 'telegram',
        from: channel.title,
        channelId: channel.id,
        date: post.date,
        url: post.url,
        source,
        day: day.day,
        dish: day.dish,
        planTitle: day.title,
        ...built,
      })
    }
  }

  for (const story of news) {
    const key = `news-${story.id || story.url}`
    if (seen.has(key)) continue
    const source = `${story.title || ''}\n\n${story.watch || ''}`.trim()
    if (source.length < 30) continue
    seen.add(key)
    const topic = topicsOf(source)[0] || null
    const seed = hashSeed(key, feed?.fetchedAt || '')
    const day = pickDay(days, topic, fromDay, seed)
    if (!day) continue
    const built = reworkFor(day, source, { variant: seed % 8 })
    items.push({
      id: key,
      kind: 'news',
      from: story.source,
      channelId: '',
      date: story.iso,
      url: story.url,
      source,
      day: day.day,
      dish: day.dish,
      planTitle: day.title,
      ...built,
    })
  }

  items.sort((a, b) => String(b.date).localeCompare(String(a.date)))
  return {
    fetchedAt: feed?.fetchedAt || '',
    window: windowKeys,
    items: items.slice(0, 36),
  }
}
