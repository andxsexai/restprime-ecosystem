import { readFileSync, writeFileSync } from 'node:fs'
import { TELEGRAM_CHANNELS } from '../src/data/telegramChannels.js'
import { moscowKey, recentMoscowKeys } from '../src/lib/planDates.js'

const OUT = new URL('../src/data/telegramFeed.json', import.meta.url)
const WINDOW = recentMoscowKeys(3)
const OLDEST = WINDOW[WINDOW.length - 1]
const MAX_PAGES = 6

function decode(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function subscribers(html) {
  const meta = html.match(/<meta property="og:description" content="([^"]+)"/)
  const source = meta?.[1] || ''
  const count = source.match(/([\d\s\u00a0]+)\s+(?:subscribers|подписчик)/i)
  return count ? count[1].replace(/\s+/g, ' ').trim() : ''
}

function postsFrom(html, id) {
  const posts = []
  for (const part of html.split('data-post="').slice(1)) {
    const key = part.match(/^([^"]+)/)?.[1] || ''
    const messageId = key.split('/')[1]
    if (!messageId) continue
    const date = part.match(/<time[^>]*datetime="([^"]+)"/)?.[1] || ''
    const raw = part.match(/class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1] || ''
    const text = decode(raw)
    if (!text) continue
    posts.push({
      id: messageId,
      date,
      text,
      url: `https://t.me/${id}/${messageId}`,
    })
  }
  return posts
}

async function fetchPage(id, before) {
  const url = before ? `https://t.me/s/${id}?before=${before}` : `https://t.me/s/${id}`
  const response = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; RESTPRIME/1.0; +https://kedr-res.ru/)' },
    redirect: 'follow',
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const html = await response.text()
  if (!html.includes('tgme_widget_message')) throw new Error('нет публичной ленты')
  return html
}

async function readChannel(id) {
  const kept = []
  const seen = new Set()
  let before = ''
  let title = ''
  let subs = ''
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const html = await fetchPage(id, before)
    if (!title) {
      title = decode(html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] || '')
      subs = subscribers(html)
    }
    const batch = postsFrom(html, id)
    if (!batch.length) break
    let oldestId = ''
    let crossedWindow = false
    for (const post of batch) {
      if (seen.has(post.id)) continue
      seen.add(post.id)
      const key = moscowKey(post.date)
      if (WINDOW.includes(key)) kept.push(post)
      if (key && key < OLDEST) crossedWindow = true
      if (!oldestId || Number(post.id) < Number(oldestId)) oldestId = post.id
    }
    if (crossedWindow || !oldestId || oldestId === before) break
    before = oldestId
  }
  kept.sort((a, b) => String(b.date).localeCompare(String(a.date)))
  return { ok: true, title, subscribers: subs, posts: kept, error: '' }
}

function loadPrevious() {
  try {
    return JSON.parse(readFileSync(OUT, 'utf8'))
  } catch {
    return { channels: {} }
  }
}

const previous = loadPrevious()
const channels = {}

for (const channel of TELEGRAM_CHANNELS) {
  if (channel.feed === false) {
    channels[channel.id] = { ok: false, title: channel.title, subscribers: '', posts: [], error: 'без публичной ленты' }
    console.log(`${channel.id}: без публичной ленты`)
    continue
  }
  try {
    channels[channel.id] = await readChannel(channel.id)
    const count = channels[channel.id].posts.length
    console.log(`${channel.id}: ${count} постов`)
  } catch (error) {
    const saved = previous.channels?.[channel.id]
    const posts = (saved?.posts || []).filter((post) => WINDOW.includes(moscowKey(post.date)))
    channels[channel.id] = posts.length
      ? { ...saved, ok: false, posts, error: error.message }
      : { ok: false, title: channel.title, subscribers: '', posts: [], error: error.message }
    console.log(`${channel.id}: ${error.message}`)
  }
  await new Promise((resolve) => setTimeout(resolve, 350))
}

const feed = { fetchedAt: new Date().toISOString(), window: WINDOW, channels }
writeFileSync(OUT, `${JSON.stringify(feed, null, 2)}\n`)
console.log(`записано ${OUT.pathname}`)
