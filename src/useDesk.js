import { useEffect, useMemo, useState } from 'react'
import { contentPlan } from './data/contentPlan.js'
import { newsFeed } from './data/news.js'
import { ADMIN_EMAIL, passwordMatches } from './lib/auth.js'
import { applyFormat, applyNews, rankFormats } from './lib/matchDay.js'

const KEY = 'restprime-desk-v2'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function stamp() {
  return new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const seedInvites = [
  {
    id: 'inv-smm',
    email: 'smm@kedr-res.ru',
    role: 'SMM',
    note: 'Просит календарь и очередь Instagram',
    status: 'pending',
    at: '31 окт, 09:40',
  },
]

export function useDesk() {
  const saved = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || 'null')
    } catch {
      return null
    }
  }, [])

  const [days, setDays] = useState(saved?.days?.length === 30 ? saved.days : contentPlan)
  const [focus, setFocus] = useState(saved?.focus || 1)
  const [queues, setQueues] = useState(saved?.queues || [])
  const [projects, setProjects] = useState(saved?.projects || [])
  const [notices, setNotices] = useState(saved?.notices || [
    { id: 'hello', at: 'сейчас', title: 'Стол разработчика открыт', body: `${ADMIN_EMAIL} видит календарь, очереди и приглашения.`, kind: 'system' },
  ])
  const [invites, setInvites] = useState(saved?.invites || seedInvites)
  const [members, setMembers] = useState(saved?.members || [
    { email: ADMIN_EMAIL, role: 'Администратор', status: 'confirmed' },
  ])
  const [locked, setLocked] = useState(Boolean(saved?.locked))
  const [process, setProcess] = useState(null)
  const [view, setView] = useState('calendar')
  const [authError, setAuthError] = useState('')
  const [shortlist, setShortlist] = useState([])
  const [matchBoard, setMatchBoard] = useState([])

  const day = days.find((item) => item.day === focus) || days[0]

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ days, focus, queues, projects, notices, invites, members, locked }))
  }, [days, focus, queues, projects, notices, invites, members, locked])

  function notify(title, body, kind = 'work') {
    setNotices((current) => [{ id: uid(), at: stamp(), title, body, kind }, ...current].slice(0, 40))
  }

  function patchDay(dayNumber, patch) {
    setDays((current) => current.map((item) => (item.day === dayNumber ? { ...item, ...patch } : item)))
  }

  function approve(dayNumber) {
    const item = days.find((entry) => entry.day === dayNumber)
    patchDay(dayNumber, { status: 'approved' })
    notify('День утверждён', `${item?.title || `День ${dayNumber}`} стоит в календаре как готовый.`, 'approve')
    setProcess(null)
  }

  function enqueue(channel, payload) {
    setQueues((current) => [{
      id: uid(),
      channel,
      day: day.day,
      title: day.title,
      text: payload.text,
      when: payload.when,
      status: 'в очереди',
    }, ...current])
    notify(channel === 'instagram' ? 'Очередь Instagram' : 'Очередь Telegram', `День ${day.day} · ${payload.when}`, channel)
    setProcess(null)
  }

  function advanceQueue(id) {
    setQueues((current) => current.map((item) => (item.id === id ? { ...item, status: 'готово к публикации' } : item)))
    notify('Материал готов к публикации', 'Текст можно нести в сервис. Статус очереди обновлён.', 'work')
  }

  function removeQueue(id) {
    setQueues((current) => current.filter((item) => item.id !== id))
  }

  function addProject(draft) {
    setProjects((current) => [{
      id: uid(),
      day: day.day,
      title: draft.title.trim(),
      channel: draft.channel,
      note: draft.note.trim(),
      at: stamp(),
    }, ...current])
    notify('Проект добавлен', `${draft.title.trim()} привязан к дню ${day.day}.`, 'project')
    setProcess(null)
  }

  function putFormat(dayNumber, format) {
    const item = days.find((entry) => entry.day === dayNumber)
    patchDay(dayNumber, applyFormat(item, format))
    notify('Формат поставлен', `День ${dayNumber}: ${format.name}.`, 'ai')
  }

  function matchOne(dayNumber = focus) {
    const item = days.find((entry) => entry.day === dayNumber)
    const ranked = rankFormats(item)
    setShortlist(ranked)
    putFormat(dayNumber, ranked[0])
    setProcess('ai')
    setFocus(dayNumber)
  }

  function matchAll() {
    const lines = []
    setDays((current) => current.map((item) => {
      const best = rankFormats(item)[0]
      lines.push({ day: item.day, name: best.name, score: best.score, title: item.title })
      return { ...item, ...applyFormat(item, best) }
    }))
    setMatchBoard(lines)
    notify('ИИ прошёл все 30 дней', 'На каждый день поставлен ближайший актуальный формат.', 'ai')
    setProcess('ai-all')
  }

  function takeNews(news) {
    patchDay(day.day, applyNews(day, news))
    notify('Новость поставлена в день', `${news.source} → день ${day.day}.`, 'news')
  }

  function createInvite(email, role, note) {
    const clean = email.trim().toLowerCase()
    if (!clean) return
    setInvites((current) => [{ id: uid(), email: clean, role, note, status: 'pending', at: stamp() }, ...current])
    notify('Приглашение ждёт вас', `${clean} · ${role}. Подтверждение только у администратора.`, 'access')
  }

  function confirmInvite(id) {
    const invite = invites.find((item) => item.id === id)
    if (!invite) return
    setInvites((current) => current.map((item) => (item.id === id ? { ...item, status: 'confirmed' } : item)))
    setMembers((current) => (
      current.some((item) => item.email === invite.email)
        ? current
        : [...current, { email: invite.email, role: invite.role, status: 'confirmed' }]
    ))
    notify('Доступ подтверждён', `${invite.email} в команде как ${invite.role}.`, 'access')
  }

  function declineInvite(id) {
    const invite = invites.find((item) => item.id === id)
    setInvites((current) => current.map((item) => (item.id === id ? { ...item, status: 'declined' } : item)))
    if (invite) notify('Приглашение отклонено', invite.email, 'access')
  }

  async function unlock(email, password) {
    const ok = email.trim().toLowerCase() === ADMIN_EMAIL && await passwordMatches(password)
    if (!ok) {
      setAuthError('Неверная почта или пароль.')
      return false
    }
    setAuthError('')
    setLocked(false)
    notify('Стол снова открыт', ADMIN_EMAIL, 'system')
    return true
  }

  function lockDesk() {
    setLocked(true)
    setProcess(null)
    notify('Стол закрыт', 'Календарь остаётся видимым. Полный доступ откроется после входа.', 'system')
  }

  return {
    days, day, focus, setFocus, view, setView, process, setProcess, locked, authError,
    queues, projects, notices, invites, members, shortlist, matchBoard, news: newsFeed,
    approve, enqueue, advanceQueue, removeQueue, addProject, matchOne, matchAll, putFormat, takeNews,
    createInvite, confirmInvite, declineInvite, unlock, lockDesk, adminEmail: ADMIN_EMAIL,
  }
}
