import { formats } from '../data/formats.js'

function fill(template, day) {
  return template.replaceAll('{dish}', day.dish).replaceAll('{title}', day.title)
}

export function rankFormats(day) {
  const blob = `${day.title} ${day.dish} ${day.postText} ${day.pillar} ${day.warmupTheme} ${day.reelHook}`.toLowerCase()
  return formats
    .map((format) => {
      let score = format.pillars.includes(day.pillar) ? 3 : 0
      let hits = 0
      for (const word of format.words) {
        if (blob.includes(word)) {
          score += 2
          hits += 1
        }
      }
      return { ...format, score, hits }
    })
    .sort((a, b) => b.score - a.score || b.hits - a.hits)
}

export function applyFormat(day, format) {
  return {
    formatId: format.id,
    formatName: format.name,
    formatSource: format.source,
    formatUrl: format.url,
    matchNote: format.why,
    reelHook: fill(format.hook, day),
    reelScript: fill(format.script, day),
  }
}

export function applyNews(day, news) {
  return {
    formatId: `news-${news.id}`,
    formatName: news.title,
    formatSource: news.source,
    formatUrl: news.url,
    matchNote: news.watch,
    reelHook: fill(news.hook, day),
  }
}
