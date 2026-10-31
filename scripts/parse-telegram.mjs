import { readFileSync, writeFileSync } from 'node:fs'
import { TELEGRAM_CHANNELS } from '../src/data/telegramChannels.js'

const OUT = new URL('../src/data/telegramFeed.json', import.meta.url)
const LIMIT = 8

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

function clip(text) {
  const clean = text.replace(/\s+\n/g, '\n').trim()
  if (clean.length <= 900) return clean
  return `${clean.slice(0, 900).trim()}…`
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
    const text = clip(decode(raw))
    if (text.length < 40) continue
    posts.push({
      id: messageId,
      date,
      text,
      url: `https://t.me/${id}/${messageId}`,
    })
  }
  return posts.sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, LIMIT)
}

async function readChannel(id) {
  const response = await fetch(`https://t.me/s/${id}`, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; RESTPRIME/1.0; +https://kedr-res.ru/)' },
    redirect: 'follow',
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const html = await response.text()
  if (!html.includes('tgme_widget_message')) throw new Error('нет публичной ленты')
  const title = decode(html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] || '')
  return { ok: true, title, subscribers: subscribers(html), posts: postsFrom(html, id), error: '' }
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
  try {
    channels[channel.id] = await readChannel(channel.id)
    const count = channels[channel.id].posts.length
    console.log(`${channel.id}: ${count} постов`)
  } catch (error) {
    const saved = previous.channels?.[channel.id]
    channels[channel.id] = saved?.posts?.length
      ? { ...saved, ok: false, error: error.message }
      : { ok: false, title: channel.title, subscribers: '', posts: [], error: error.message }
    console.log(`${channel.id}: ${error.message}`)
  }
  await new Promise((resolve) => setTimeout(resolve, 350))
}

const feed = { fetchedAt: new Date().toISOString(), channels }
writeFileSync(OUT, `${JSON.stringify(feed, null, 2)}\n`)
console.log(`записано ${OUT.pathname}`)
