import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { contentPlan } from './data/contentPlan.js'
import { newsFeed } from './data/news.js'
import { FLAGSHIP } from './data/place.js'
import { starterChat, starterFiles, starterTelegram, videoPresets } from './data/suite.js'
import { motion } from 'framer-motion'
import Sidebar, { NAV } from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/TopBar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AIAgent from './pages/AIAgent.jsx'
import ReleaseCorner from './components/ReleaseCorner.jsx'
import AccessModal from './components/AccessModal.jsx'
import DeveloperDesk from './components/DeveloperDesk.jsx'
import { improveReel, shownPost, wideFromDay, wordCount, writeFromNews, writeLikeChannel } from './lib/compose.js'
import telegramFeed from './data/telegramFeed.json'
import { applyTrend, nextTrend, trendBoards, trends } from './data/trends.js'
import { dateForDay, formatLong, isoDate, moscowToday, planDayForDate } from './lib/planDates.js'
import { adaptSourceToToday } from './lib/generateContent.js'
import { autoPlan, findRepeats } from './lib/autoPlan.js'
import { readSignals } from './lib/signals.js'
import PostWorkshop from './pages/PostWorkshop.jsx'
import ReviewSheet from './components/ReviewSheet.jsx'
import { copyText } from './lib/clipboard.js'
import { EVENT_FORMATS, THEME_SOURCES, formatGroup } from './data/eventFormats.js'
import { REEL_BANK } from './data/reelBank.js'
import { RELAY_TEST, announceDecision, announceRecovery, announceSignup, pollRelay, pollTeam, resendSignup, sendTeam } from './lib/relay.js'
import TaskDesk, { taskStamp } from './components/TaskDesk.jsx'
import { loadAccess, saveAccess } from './lib/access.js'
import { ADMIN_EMAIL, ROLES, SIGNUP_ROLES, hashPassword, normalizePhrase, roleLabel } from './lib/auth.js'
import {
  DayModalBody, FilesView, InstaView, PlanView, PostsView, ReelsView, TeamView, ThemesView,
} from './components/Modules.jsx'
import Button3D from './components/ui/Button3D.jsx'
import Modal from './components/ui/Modal.jsx'

const YearCalendar = lazy(() => import('./pages/Calendar.jsx'))
const Analytics = lazy(() => import('./pages/Analytics.jsx'))
const ChannelDesk = lazy(() => import('./components/ChannelDesk.jsx'))
const TrendFeed = lazy(() => import('./components/TrendFeed.jsx'))
const SiteDesk = lazy(() => import('./pages/SiteDesk.jsx'))
const ThreeDaysDesk = lazy(() => import('./pages/ThreeDaysDesk.jsx'))

const KEY = 'restprime-cabinet-v3'

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!saved?.days?.length || saved.days[0]?.day !== 1) return null
    if (saved.edition === 'readable' || saved.edition === 'bento') return saved
    if (!String(saved.days[0]?.postText || '').startsWith('До Зайцево')) return null
    return saved
  } catch {
    return null
  }
}

const MENU_FILE = starterFiles[0]

function feedLabel(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'последней сборки'
  const time = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' }).format(date)
  const [year, month, day] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow' }).format(date).split('-').map(Number)
  return `${formatLong(new Date(year, month - 1, day))}, ${time}`
}
const REEL_SOURCE_IDS = ['viterno', 'aubrium', 'velocity', 'metaroots', 'foodinstitute', 'nra-hot', 'nrn-scrolls', 'sevenrooms', 'kedr-site']

function cabinetFiles(saved) {
  const own = (saved?.files || []).filter((file) => file?.url && file.url !== MENU_FILE.url && !/фудкост|редполитика|основное_меню|винная/i.test(file.name || ''))
  return [MENU_FILE, ...own]
}

function initialChat(saved) {
  const raw = saved?.chat
  if (!raw?.length || raw.some((item) => item.sender === 'Бренд-Шеф')) return starterChat
  return raw
}

function chatStamp() {
  return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date()).replace(/[\s\u202f\u00a0]+/g, ' ')
}

function stamp() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function ProfileEditor({ session, onSave }) {
  const [name, setName] = useState(session.name || '')
  const [role, setRole] = useState(session.role || 'director')
  const choices = session.email === ADMIN_EMAIL ? ROLES : SIGNUP_ROLES
  return (
    <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); onSave({ name, role }) }}>
      <label className="block text-sm text-ink">
        Имя в кабинете
        <input value={name} onChange={(event) => setName(event.target.value)} minLength={2} required className="mt-2 w-full rounded-2xl border border-white/15 bg-card px-4 py-3 text-sm text-ink outline-none focus:border-[#C9A96A]" />
      </label>
      <div>
        <p className="text-sm text-ink">Роль</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {choices.map((item) => (
            <button key={item.id} type="button" onClick={() => setRole(item.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${role === item.id ? 'bg-[#C9A96A] text-[#0A0F0B]' : 'border border-[#C9A96A]/35 text-[#F4F0E6]'}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <Button3D type="submit" className="w-full">Сохранить профиль</Button3D>
    </form>
  )
}

export default function App() {
  const saved = useMemo(loadState, [])
  const [clock, setClock] = useState(() => moscowToday())
  const todayNumber = planDayForDate(clock)
  const [tab, setTab] = useState('overview')
  const [navOpen, setNavOpen] = useState(false)
  const [days, setDays] = useState(saved?.days || contentPlan)
  const [focus, setFocus] = useState(() => planDayForDate(moscowToday()) || saved?.focus || 1)
  const [goalOpen, setGoalOpen] = useState(false)
  const [goalSource, setGoalSource] = useState(null)
  const [reviewDay, setReviewDay] = useState(null)
  const [extraReels, setExtraReels] = useState(saved?.extraReels || [])
  const [tasks, setTasks] = useState(saved?.tasks || [])
  const [taskLog, setTaskLog] = useState(saved?.taskLog || [])
  const [tasksOpen, setTasksOpen] = useState(false)
  const [autoFeedAt, setAutoFeedAt] = useState(saved?.autoFeedAt || '')
  const [bannerHidden, setBannerHidden] = useState(() => {
    try { return sessionStorage.getItem('restprime-banner') === 'hidden' } catch { return false }
  })
  const [relayState, setRelayState] = useState('')
  const relaySeen = useRef(new Set())
  const [teamState, setTeamState] = useState('')
  const teamLast = useRef('')
  const teamSeen = useRef(new Set())
  const tabRef = useRef('overview')
  const undoRef = useRef([])
  const [undoCount, setUndoCount] = useState(0)
  const [siteNotes, setSiteNotes] = useState(saved?.siteNotes || '')
  const [status, setStatus] = useState('all')
  const [pillar, setPillar] = useState('all')
  const [files, setFiles] = useState(() => cabinetFiles(saved))
  const [telegram, setTelegram] = useState(saved?.telegram || starterTelegram)
  const [chat, setChat] = useState(() => initialChat(saved))
  const news = newsFeed
  const [projectDraft, setProjectDraft] = useState({ title: '', channel: 'Съёмка', note: '' })
  const [access, setAccess] = useState(loadAccess)
  const [authMode, setAuthMode] = useState(null)
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [deskOpen, setDeskOpen] = useState(false)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const [url, setUrl] = useState(videoPresets[0].url)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(videoPresets[0])
  const [auditUrl, setAuditUrl] = useState('https://kedr-res.ru/')
  const [auditResult, setAuditResult] = useState('')
  const [auditBusy, setAuditBusy] = useState(false)
  const [phraseDraft, setPhraseDraft] = useState('')

  const day = days.find((item) => item.day === focus) || days[0]
  const session = access.users.find((user) => user.email === access.sessionEmail) || null
  const canAct = session?.status === 'active'
  const isDeveloper = canAct && (session?.role === 'developer' || session?.email === ADMIN_EMAIL)
  const pending = access.users.filter((user) => user.status === 'pending')
  const members = access.users.filter((user) => user.status === 'active')
  const approved = days.filter((item) => item.status === 'approved' || item.status === 'agreed')
  const recentNews = useMemo(() => {
    const limit = isoDate(clock)
    return news.filter((item) => item.iso && item.iso <= limit).sort((a, b) => b.iso.localeCompare(a.iso))
  }, [news, clock])
  const todayDay = days.find((item) => item.day === todayNumber) || days[0]
  const todayLabel = formatLong(clock)
  const signals = useMemo(() => readSignals(telegramFeed, recentNews.slice(0, 20)), [recentNews])
  const repeats = useMemo(() => findRepeats(days), [days])

  useEffect(() => {
    try {
      const storedFiles = files.map((file) => (String(file.url || '').startsWith('blob:') ? { ...file, url: '' } : file))
      localStorage.setItem(KEY, JSON.stringify({ edition: 'readable', days, focus, files: storedFiles, telegram, chat, siteNotes, extraReels, tasks, taskLog, autoFeedAt }))
    } catch {
      /* браузер закрыл память: кабинет остаётся только на этот заход */
    }
  }, [days, focus, files, telegram, chat, siteNotes, extraReels, tasks, taskLog, autoFeedAt])

  useEffect(() => {
    if (!signals.fetchedAt || autoFeedAt === signals.fetchedAt) return
    const result = autoPlan(days, { signals, fromDay: (todayNumber || 0) + 1 })
    setAutoFeedAt(signals.fetchedAt)
    if (!result.changed.length) return
    remember({ kind: 'days', items: days })
    setDays(result.days)
    notify(`Автоплан: лента от ${feedLabel(signals.fetchedAt)}, пересобрано дней: ${result.changed.length}. Утверждённые и ручные правки не тронуты.`)
  }, [signals, autoFeedAt])

  useEffect(() => {
    const watching = isDeveloper || access.users.some((user) => user.status === 'pending' && user.passwordHash)
    if (!watching) return undefined
    let alive = true
    const run = () => { syncRelay().catch(() => alive && setRelayState('offline')) }
    run()
    const timer = setInterval(run, isDeveloper ? 20000 : 30000)
    const onFocus = () => { if (document.visibilityState === 'visible') run() }
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      alive = false
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [isDeveloper, access.users.length, pending.length])

  useEffect(() => { tabRef.current = tab }, [tab])

  useEffect(() => {
    if (!canAct && !RELAY_TEST) return undefined
    let alive = true
    const run = () => {
      if (document.visibilityState === 'hidden') return
      syncTeam().then(() => alive && setTeamState('online')).catch(() => alive && setTeamState('offline'))
    }
    run()
    const timer = setInterval(run, 20000)
    document.addEventListener('visibilitychange', run)
    return () => {
      alive = false
      clearInterval(timer)
      document.removeEventListener('visibilitychange', run)
    }
  }, [canAct, session?.email])

  useEffect(() => {
    const timer = setInterval(() => setClock(moscowToday()), 30000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => { saveAccess(access) }, [access])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 8000)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setModal(null)
        setAuthMode(null)
        setDeskOpen(false)
        setTasksOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function notify(message) { setToast(message) }

  function remember(entry) {
    if (!entry) return
    const snap = entry.kind ? entry : { kind: 'day', item: entry }
    undoRef.current = [...undoRef.current.slice(-19), JSON.parse(JSON.stringify(snap))]
    setUndoCount(undoRef.current.length)
  }

  function undoLast() {
    const last = undoRef.current.pop()
    setUndoCount(undoRef.current.length)
    if (!last) {
      notify('Убирать нечего: действий ещё не было.')
      return
    }
    if (last.kind === 'days') {
      setDays(last.items)
      notify('Убрано. План вернулся к виду до этого действия.')
      return
    }
    if (last.kind === 'reels') {
      setExtraReels(last.items)
      notify('Убрано. Новый рилс снят со списка.')
      return
    }
    const item = last.item
    setDays((current) => current.map((entry) => (entry.day === item.day ? item : entry)))
    setFocus(item.day)
    notify(`Убрано. Вернулось ${formatLong(dateForDay(item.day))} · «${item.title}».`)
  }

  function requireAct() {
    if (canAct) return true
    notify(session ? 'Кнопки откроются после подтверждения разработчиком.' : 'Сначала войдите. Пока доступен только просмотр.')
    if (!session) {
      setAuthError('')
      setAuthMode('login')
    }
    return false
  }

  function patchDay(dayNumber, patch) {
    setDays((current) => current.map((item) => (item.day === dayNumber ? { ...item, ...patch } : item)))
  }

  function pushMessage(text, attachment) {
    const message = {
      id: uid(),
      sender: session?.name || 'Команда',
      role: roleLabel(session?.role),
      time: chatStamp(),
      text,
      badge: roleLabel(session?.role),
      from: session?.email || '',
      attachment,
    }
    setChat((current) => [...current, message])
    if (canAct) sendTeam({ type: 'chat', message }).then(() => setTeamState('online')).catch(() => setTeamState('offline'))
  }

  function shareTask(op, task, log) {
    if (!canAct) return
    sendTeam({ type: 'task', op, task, log: log ? { id: uid(), at: taskStamp(), text: log } : null }).catch(() => setTeamState('offline'))
  }

  async function syncTeam() {
    const events = await pollTeam(teamLast.current || '12h')
    const fresh = events.filter((event) => !teamSeen.current.has(event.relayId))
    if (events.length) teamLast.current = events[events.length - 1].relayId
    fresh.forEach((event) => teamSeen.current.add(event.relayId))
    if (!fresh.length) return
    const messages = fresh.filter((event) => event.type === 'chat' && event.message?.id).map((event) => event.message)
    if (messages.length) {
      let added = []
      setChat((current) => {
        const ids = new Set(current.map((item) => item.id))
        added = messages.filter((item) => !ids.has(item.id))
        return added.length ? [...current, ...added] : current
      })
      const foreign = messages.filter((item) => item.from !== session?.email)
      if (foreign.length && tabRef.current !== 'github-tz') {
        const last = foreign[foreign.length - 1]
        notify(`Чат · ${last.sender}: ${String(last.text).slice(0, 90)}`)
        showSystemNotice(`RESTPRIME · ${last.sender}`, String(last.text).slice(0, 140))
      }
    }
    const taskEvents = fresh.filter((event) => event.type === 'task' && event.task?.id)
    if (taskEvents.length) {
      setTasks((current) => taskEvents.reduce((list, event) => {
        if (event.op === 'remove') return list.filter((item) => item.id !== event.task.id)
        if (list.some((item) => item.id === event.task.id)) return list.map((item) => (item.id === event.task.id ? event.task : item))
        return [event.task, ...list]
      }, current))
      const logs = taskEvents.map((event) => event.log).filter(Boolean)
      if (logs.length) setTaskLog((current) => [...logs.filter((log) => !current.some((item) => item.id === log.id)).reverse(), ...current].slice(0, 200))
    }
  }

  function setDayStatus(dayNumber, status) {
    if (!requireAct()) return
    const item = days.find((entry) => entry.day === dayNumber)
    if (item) remember(item)
    patchDay(dayNumber, { status })
    const label = status === 'agreed' ? 'Согласовано' : status === 'approved' ? 'Утвердил' : 'На проверку'
    notify(item ? `${formatLong(dateForDay(item.day))} · «${item.title}»: ${label}.` : `Статус: ${label}.`)
    if (item && status !== 'review') {
      pushMessage(`${label}: ${formatLong(dateForDay(item.day))}, ${item.title}`, {
        kind: 'post',
        day: item.day,
        title: item.title,
        body: shownPost(item),
      })
    }
  }

  function adaptForDay(dayNumber, sourceText) {
    if (!requireAct()) return
    const target = days.find((item) => item.day === dayNumber)
    if (!target) {
      notify('Этот день не найден в плане. Текст не записан.')
      return
    }
    const text = adaptSourceToToday(target, sourceText)
    remember(target)
    patchDay(target.day, { format: 'short', postText: text, status: 'review' })
    setFocus(target.day)
    setGoalOpen(false)
    setTab('posts-edit')
    notify(`Переработано: ${formatLong(dateForDay(target.day))} · «${target.title}».`)
  }

  function adaptForToday(sourceText) {
    adaptForDay(todayNumber, sourceText)
  }

  function openGoal(source) {
    setGoalSource(source?.text ? { text: source.text, title: source.channelTitle || source.title || '' } : null)
    setGoalOpen(true)
  }

  function approve(dayNumber) {
    if (!requireAct()) return
    const item = days.find((entry) => entry.day === dayNumber)
    if (item) remember(item)
    patchDay(dayNumber, { status: 'approved' })
    setFocus(dayNumber)
    if (item) {
      pushMessage(`Утверждено ${formatLong(dateForDay(item.day))}: ${item.title}`, {
        kind: 'post',
        day: item.day,
        title: item.title,
        body: shownPost(item),
      })
    }
    notify(item ? `Утверждено: ${formatLong(dateForDay(item.day))} · «${item.title}».` : 'День утверждён и отправлен в комнату.')
  }

  function forwardDay(item, kind) {
    if (!requireAct()) return
    pushMessage(kind === 'theme' ? `Пересылаю тему на ${formatLong(dateForDay(item.day))}.` : `Пересылаю пост на ${formatLong(dateForDay(item.day))}.`, {
      kind,
      day: item.day,
      title: item.title,
      body: kind === 'theme' ? item.warmupTheme : shownPost(item),
    })
    setTab('github-tz')
    notify(kind === 'theme' ? 'Тема в комнате команды.' : 'Пост в комнате команды.')
  }

  function setFormat(dayNumber, format) {
    if (!requireAct()) return
    const item = days.find((entry) => entry.day === dayNumber)
    if (!item) return
    const patch = { format }
    if (format === 'wide' && !item.wideText) patch.wideText = wideFromDay(item)
    patchDay(dayNumber, patch)
    setFocus(dayNumber)
  }

  function improveDay(dayNumber) {
    if (!requireAct()) return
    const item = days.find((entry) => entry.day === dayNumber)
    if (!item) return
    remember(item)
    const variant = (item.variant || 0) + 1
    const result = autoPlan(days, { signals, only: [dayNumber], force: true, variant })
    const next = result.days.find((entry) => entry.day === dayNumber)
    patchDay(dayNumber, { postText: next.postText, wideText: next.wideText, auto: next.auto, variant, manual: false, status: 'review' })
    notify(`${item.format === 'wide' ? `Широкий пост, ${wordCount(shownPost(next))} слов` : 'Новая версия поста'}: ${formatLong(dateForDay(item.day))} · «${item.title}». Фразы других дней не повторяются.`)
    setFocus(dayNumber)
  }

  function runAutoPlan() {
    if (!requireAct()) return
    const result = autoPlan(days, { signals, fromDay: Math.max(1, todayNumber || 1) })
    if (!result.changed.length) {
      notify('Пересобирать нечего: все дни впереди утверждены или правились вручную.')
      return
    }
    remember({ kind: 'days', items: days })
    setDays(result.days)
    setAutoFeedAt(signals.fetchedAt)
    notify(`Автоплан по ленте от ${feedLabel(signals.fetchedAt)}: пересобрано дней — ${result.changed.length}. Утверждённые и ручные не тронуты.`)
  }

  function fixRepeats() {
    if (!requireAct()) return
    const flagged = Object.keys(repeats).map(Number)
    const only = flagged.filter((dayNumber) => !days.find((entry) => entry.day === dayNumber)?.manual)
    if (!only.length) {
      notify(flagged.length ? 'Повторы остались только в днях с ручной правкой. Их меняйте в «Редакторе».' : 'Повторов нет.')
      return
    }
    remember({ kind: 'days', items: days })
    const result = autoPlan(days, { signals, only, force: true, variant: 1 })
    setDays(result.days)
    notify(`Повторы убраны: пересобрано дней — ${result.changed.length}. Эти дни снова «На проверку».`)
  }

  function toggleExtension(dayNumber, id) {
    if (!requireAct()) return
    const item = days.find((entry) => entry.day === dayNumber)
    if (!item) return
    const current = item.extensions || []
    const extensions = current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    patchDay(dayNumber, { extensions })
  }

  function refineReel(dayNumber) {
    if (!requireAct()) return
    const item = days.find((entry) => entry.day === dayNumber)
    if (!item) return
    remember(item)
    patchDay(dayNumber, improveReel(item))
    setFocus(dayNumber)
    notify(`Сценарий рилса: ${formatLong(dateForDay(item.day))} · «${item.title}».`)
  }

  function placeAgentText(dayNumber, text) {
    if (!requireAct()) return
    const target = days.find((item) => item.day === dayNumber)
    if (!target) {
      notify('Этот день не найден в плане. Текст не записан.')
      return
    }
    remember(target)
    patchDay(target.day, { format: 'short', postText: text, status: 'review' })
    setFocus(target.day)
    notify(`Пересобрано: ${formatLong(dateForDay(target.day))} · «${target.title}».`)
  }

  function placeIdeaPost(dayNumber, post) {
    if (!requireAct()) return
    const target = days.find((item) => item.day === dayNumber)
    if (!target) {
      notify('Этот день не найден в плане. Текст не записан.')
      return
    }
    remember(target)
    patchDay(target.day, { format: 'short', postText: post.text, status: 'review', manual: true, auto: { why: post.why, refs: post.refs || [], at: new Date().toISOString() } })
    setFocus(target.day)
    notify(`Поставлено на ${formatLong(dateForDay(target.day))}: «${post.title}». День помечен ручным — автоплан его не перепишет.`)
  }

  function openReview(item) {
    if (!requireAct()) return
    remember(item)
    patchDay(item.day, { status: 'review' })
    setReviewDay(item.day)
    notify(`На проверке: ${formatLong(dateForDay(item.day))} · «${item.title}».`)
  }

  function applyFormat(dayNumber, format) {
    if (!requireAct()) return
    const item = days.find((entry) => entry.day === dayNumber)
    if (!item) return
    const scene = item.scene ? item.scene.charAt(0).toUpperCase() + item.scene.slice(1) : item.title
    const plate = String(item.dish || '').startsWith('без тарелки')
      ? 'В этом кадре нет тарелки. Есть зал.'
      : `Из меню этого дня: ${item.dish}${item.margin && item.margin !== 'зал' ? `, ${item.margin}` : ''}.`
    remember(item)
    patchDay(dayNumber, {
      warmupTheme: format.title,
      format: 'short',
      status: 'review',
      postText: `${format.title}.\n\n${scene}. ${format.note}.\n\n${plate}\n\nkedr-res.ru`,
    })
    notify(`Тема «${format.title}»: ${formatLong(dateForDay(item.day))} · «${item.title}».`)
  }

  function applyReelSource(dayNumber, source) {
    if (!requireAct()) return
    const item = days.find((entry) => entry.day === dayNumber)
    if (!item) return
    const dish = String(item.dish || '').startsWith('без тарелки') ? 'зал без тарелки' : item.dish
    remember(item)
    patchDay(dayNumber, {
      reelHook: String(source.hook || source.title).replaceAll('{dish}', dish),
      reelScript: `По заметке «${source.source}»: ${source.title}. Снимаем в KEDR сцену «${item.scene}». В кадре: ${dish}. В конце kedr-res.ru.`,
      reelAudio: 'Живой звук зала, без закадровой музыки',
    })
    notify(`Сценарий на ${formatLong(dateForDay(item.day))} по «${source.source}». Пост дня не менялся.`)
  }

  function restoreDay(dayNumber) {
    const source = contentPlan.find((item) => item.day === ((dayNumber - 1) % 30) + 1)
    const current = days.find((item) => item.day === dayNumber)
    if (!source || !current) return
    remember(current)
    patchDay(dayNumber, {
      title: source.title,
      postText: source.postText,
      wideText: '',
      reelHook: source.reelHook,
      reelScript: source.reelScript,
      warmupTheme: source.warmupTheme,
    })
    notify(`Вернул текст плана: ${formatLong(dateForDay(current.day))} · «${current.title}».`)
  }

  function writeChannel(channel, format) {
    if (!requireAct()) return
    const posts = telegramFeed.channels?.[channel.id]?.posts || []
    remember(day)
    const text = writeLikeChannel(day, channel, posts, format)
    if (format === 'wide') patchDay(day.day, { format: 'wide', wideText: text })
    else patchDay(day.day, { format: 'short', postText: text })
    setTab('posts-30')
    notify(`${format === 'wide' ? 'Широкий' : 'Короткий'} пост в тоне «${channel.title}»: ${formatLong(dateForDay(day.day))} · «${day.title}».`)
  }

  function writeNews(story, format) {
    if (!requireAct()) return
    remember(day)
    const text = writeFromNews(day, story, format)
    if (format === 'wide') patchDay(day.day, { format: 'wide', wideText: text })
    else patchDay(day.day, { format: 'short', postText: text })
    setTab('posts-30')
    notify(`${format === 'wide' ? 'Широкий' : 'Короткий'} пост по «${story.source}»: ${formatLong(dateForDay(day.day))} · «${day.title}».`)
  }

  function rebuildDay(dayNumber, trend) {
    if (!requireAct()) return
    const item = days.find((entry) => entry.day === dayNumber)
    if (!item) return
    const picked = trend?.id ? trend : nextTrend(item.trendId)
    const variant = (item.variant || 0) + 1
    const text = autoPlan(days, { signals, only: [dayNumber], force: true, variant }).days.find((entry) => entry.day === dayNumber)
    remember(item)
    patchDay(dayNumber, { ...applyTrend(item, picked), postText: text.postText, wideText: text.wideText, auto: text.auto, variant, manual: false, status: 'review' })
    setFocus(dayNumber)
    notify(`Пересобрано: ${formatLong(dateForDay(item.day))} · «${item.title}». Рилс по приёму «${picked.name}».`)
  }

  function logTask(text) {
    setTaskLog((current) => [{ id: uid(), at: taskStamp(), text }, ...current].slice(0, 200))
  }

  function ownerName(assignee) {
    if (String(assignee).startsWith('role:')) return roleLabel(assignee.slice(5))
    return members.find((member) => member.email === assignee)?.name || 'команда'
  }

  function addTask(draft) {
    if (!requireAct()) return
    const task = { id: uid(), title: draft.title, assignee: draft.assignee, due: draft.due || isoDate(clock), day: draft.day || null, by: session.name, createdAt: taskStamp(), doneAt: '', doneBy: '' }
    setTasks((current) => [task, ...current])
    const line = `${session.name} поставил «${task.title}» → ${ownerName(task.assignee)}`
    logTask(line)
    shareTask('add', task, line)
    pushMessage(`Задача: ${task.title} → ${ownerName(task.assignee)}`)
    notify(`Задача поставлена: ${ownerName(task.assignee)}.`)
  }

  function toggleTask(id) {
    if (!requireAct()) return
    const task = tasks.find((item) => item.id === id)
    if (!task) return
    const closing = !task.doneAt
    const next = { ...task, doneAt: closing ? taskStamp() : '', doneBy: closing ? session.name : '' }
    setTasks((current) => current.map((item) => (item.id === id ? next : item)))
    const line = closing ? `${session.name} выполнил «${task.title}»` : `${session.name} вернул в работу «${task.title}»`
    logTask(line)
    shareTask('update', next, line)
    if (closing) pushMessage(`Выполнено: ${task.title}`)
    notify(closing ? `Выполнено: «${task.title}».` : `Снова в работе: «${task.title}».`)
  }

  function removeTask(id) {
    if (!requireAct()) return
    const task = tasks.find((item) => item.id === id)
    if (!task) return
    setTasks((current) => current.filter((item) => item.id !== id))
    const line = `${session.name} удалил «${task.title}»`
    logTask(line)
    shareTask('remove', task, line)
    notify(`Задача удалена: «${task.title}».`)
  }

  function seedDayTasks() {
    if (!requireAct() || !todayDay) return
    const when = formatLong(dateForDay(todayDay.day))
    const due = isoDate(clock)
    const plan = [
      { title: `Проверить и утвердить пост на ${when}`, assignee: 'role:director' },
      { title: `Подготовить кадр: ${todayDay.dish}`, assignee: 'role:chef' },
      { title: `Опубликовать пост ${when} в Telegram и Instagram`, assignee: 'role:admin' },
    ].filter((item) => !tasks.some((task) => task.title === item.title && !task.doneAt))
    if (!plan.length) {
      notify('Задачи этого дня уже стоят.')
      return
    }
    const fresh = plan.map((item) => ({ id: uid(), ...item, due, day: todayDay.day, by: session.name, createdAt: taskStamp(), doneAt: '', doneBy: '' }))
    setTasks((current) => [...fresh, ...current])
    const line = `${session.name} раздал задачи на ${when}: ${fresh.length}`
    logTask(line)
    fresh.forEach((task, index) => shareTask('add', task, index === fresh.length - 1 ? line : ''))
    notify(`Задачи на ${when} розданы по ролям.`)
  }

  function createReel(draft) {
    if (!requireAct()) return
    const title = String(draft.title || '').trim()
    if (!title) return
    remember({ kind: 'reels', items: extraReels })
    setExtraReels((current) => [{
      id: uid(),
      title,
      hook: String(draft.hook || '').trim() || title,
      shots: String(draft.shots || '').trim() || 'Кадр без привязки к посту дня.',
      sound: 'Живой звук зала',
    }, ...current])
    notify('Новый рилс сохранён отдельно от постов.')
  }

  function placeReel(dayNumber, reel) {
    if (!requireAct()) return
    const item = days.find((entry) => entry.day === dayNumber)
    if (!item) return
    remember(item)
    patchDay(dayNumber, {
      reelHook: reel.hook,
      reelScript: reel.shots,
      reelAudio: reel.sound || 'Живой звук зала',
    })
    notify(`Ролик «${reel.title}» на ${formatLong(dateForDay(item.day))}. Пост «${item.title}» не менялся.`)
  }

  function openChannel(kind, item) {
    if (!requireAct()) return
    setFocus(item.day)
    setModal(kind)
  }

  function analyze(preset) {
    const known = preset || videoPresets.find((item) => item.url === url.trim())
    setBusy(true)
    setResult(null)
    window.setTimeout(() => {
      setResult(known || {
        title: 'Разбор по ссылке',
        hookAnalysis: 'Первые две секунды — действие с блюдом, без приветствия в кадре.',
        pacing: 'Три склейки короче трёх секунд. Удержание держит звук кухни.',
        audioTrigger: 'Живой огонь и нож, без студийного трека.',
        kedrAdaptation: `Берём ближайший день плана (${day.title}) и ставим плашку брони kedr-res.ru на восьмой секунде.`,
      })
      setBusy(false)
    }, 1200)
  }

  function exportCsv() {
    const header = 'day,title,pillar,status,dish,post\n'
    const body = days.map((item) => [item.day, item.title, item.pillar, item.status, item.dish, shownPost(item)]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'kedr-30-posts.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  function addFiles(event) {
    if (!requireAct()) return
    const picked = [...event.target.files].map((file) => ({
      name: file.name,
      type: file.name.split('.').pop().toUpperCase(),
      size: `${Math.max(1, Math.round(file.size / 1024))} КБ`,
      url: URL.createObjectURL(file),
      insight: 'Открывается отдельной ссылкой, пока эта вкладка браузера не закрыта.',
    }))
    setFiles((current) => [...picked, ...current])
    notify(picked.length ? `В список добавлено файлов: ${picked.length}.` : 'Файл не выбран.')
    event.target.value = ''
  }

  async function login({ email, password }) {
    const clean = email.trim().toLowerCase()
    const person = access.users.find((user) => user.email === clean)
    if (!person) {
      setAuthError('Такой почты нет. Зарегистрируйтесь.')
      return
    }
    setAuthBusy(true)
    const passwordHash = await hashPassword(password)
    setAuthBusy(false)
    if (passwordHash !== person.passwordHash) {
      setAuthError('Пароль не подошёл.')
      return
    }
    if (person.status === 'rejected') {
      setAuthError('Заявку отклонили.')
      return
    }
    setAccess((current) => ({ ...current, sessionEmail: clean }))
    setAuthMode(null)
    setAuthError('')
    notify(person.status === 'active' ? `Вход выполнен: ${roleLabel(person.role)}.` : 'Вход есть. Кнопки откроются после подтверждения.')
    if (person.role === 'developer') setDeskOpen(true)
  }

  async function register({ name, email, password, role, phrase }) {
    const clean = email.trim().toLowerCase()
    if (normalizePhrase(phrase).length < 4) {
      setAuthError('Секретная фраза короче четырёх символов.')
      return
    }
    if (access.users.some((user) => user.email === clean)) {
      setAuthError('Эта почта уже есть. Войдите или дождитесь подтверждения.')
      return
    }
    setAuthBusy(true)
    const passwordHash = await hashPassword(password)
    const secretHash = await hashPassword(normalizePhrase(phrase))
    const person = {
      id: uid(),
      name: name.trim(),
      email: clean,
      passwordHash,
      secretHash,
      role,
      status: 'pending',
      at: stamp(),
    }
    setAccess((current) => ({
      ...current,
      sessionEmail: clean,
      users: [...current.users, person],
      notices: [{ id: uid(), text: `${person.name} (${roleLabel(role)}) зарегистрировался: ${person.email}`, at: stamp() }, ...current.notices],
    }))
    setAuthMode(null)
    setAuthError('')
    notify('Отправляем заявку разработчику…')
    const sent = await announceSignup(person)
    setAuthBusy(false)
    try { localStorage.setItem(`restprime-ping-${clean}`, String(Date.now())) } catch { /* память закрыта */ }
    notify(sent ? 'Заявка ушла разработчику: пуш и письмо. Кнопки откроются сами, как только он подтвердит.' : 'Заявка сохранена, но сеть не ответила. Нажмите «Отправить ещё раз» в плашке сверху.')
  }

  async function resendMine() {
    if (!session || session.status !== 'pending') return
    const sent = await announceSignup(session)
    try { localStorage.setItem(`restprime-ping-${session.email}`, String(Date.now())) } catch { /* память закрыта */ }
    notify(sent ? 'Заявка отправлена ещё раз.' : 'Сеть не ответила. Проверьте интернет и попробуйте снова.')
  }

  async function syncRelay() {
    const events = await pollRelay()
    setRelayState('online')
    const fresh = events.filter((event) => !relaySeen.current.has(event.relayId))
    fresh.forEach((event) => relaySeen.current.add(event.relayId))
    if (!fresh.length) {
      pingIfQuiet(events)
      return
    }
    const known = new Map(access.users.map((user) => [user.email, user]))
    const added = []
    const decided = []
    const repeatDecisions = []
    for (const event of fresh) {
      const local = known.get(event.email)
      if (event.type === 'signup' && isDeveloper) {
        if (!local) {
          const person = { id: event.id || uid(), name: event.name, email: event.email, role: event.role, status: 'pending', at: event.at || stamp(), remote: true }
          known.set(event.email, person)
          added.push(person)
        } else if (local.status !== 'pending' && local.email !== ADMIN_EMAIL && !events.some((item) => item.type === 'decision' && item.email === local.email && item.time >= event.time)) {
          repeatDecisions.push(local)
        }
      }
      if (event.type === 'decision' && local && local.status === 'pending' && local.passwordHash) {
        decided.push({ email: event.email, status: event.status === 'active' ? 'active' : 'rejected' })
      }
      if (event.type === 'recovery' && isDeveloper) {
        setAccess((current) => (current.notices.some((notice) => notice.relayId === event.relayId) ? current : {
          ...current,
          notices: [{ id: uid(), relayId: event.relayId, text: `${event.name} просит восстановить пароль: ${event.email}`, at: stamp() }, ...current.notices],
        }))
      }
    }
    if (added.length) {
      setAccess((current) => ({
        ...current,
        users: [...current.users, ...added.filter((person) => !current.users.some((user) => user.email === person.email))],
        notices: [...added.map((person) => ({ id: uid(), text: `${person.name} (${roleLabel(person.role)}) зарегистрировался: ${person.email}`, at: stamp() })), ...current.notices],
      }))
      notify(added.length === 1 ? `Новая заявка: ${added[0].name}, ${roleLabel(added[0].role)}. Откройте «Заявки».` : `Новых заявок: ${added.length}. Откройте «Заявки».`)
      showSystemNotice('RESTPRIME: новая заявка', added.map((person) => `${person.name} · ${person.email}`).join('\n'))
    }
    if (decided.length) {
      setAccess((current) => ({
        ...current,
        users: current.users.map((user) => decided.find((item) => item.email === user.email) ? { ...user, status: decided.find((item) => item.email === user.email).status } : user),
      }))
      const mine = decided.find((item) => item.email === session?.email)
      if (mine) notify(mine.status === 'active' ? 'Разработчик подтвердил вход. Кнопки открыты.' : 'Разработчик отклонил заявку.')
    }
    repeatDecisions.forEach((person) => announceDecision(person, person.status))
    pingIfQuiet(events)
  }

  function pingIfQuiet(events) {
    if (!session || session.status !== 'pending' || !session.passwordHash) return
    if (events.some((event) => event.email === session.email && event.type === 'signup')) return
    let last = 0
    try { last = Number(localStorage.getItem(`restprime-ping-${session.email}`) || 0) } catch { /* память закрыта */ }
    if (Date.now() - last < 6 * 3600000) return
    try { localStorage.setItem(`restprime-ping-${session.email}`, String(Date.now())) } catch { /* память закрыта */ }
    resendSignup(session)
  }

  function showSystemNotice(title, body) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body })
    } catch { /* уведомления браузера недоступны */ }
  }

  async function enableSystemNotices() {
    if (!('Notification' in window)) {
      notify('Этот браузер не показывает системные уведомления. Подпишитесь на канал в приложении ntfy.')
      return
    }
    const result = await Notification.requestPermission()
    notify(result === 'granted' ? 'Уведомления браузера включены, пока вкладка открыта.' : 'Браузер запретил уведомления. Подпишитесь на канал в приложении ntfy.')
  }

  function confirmUser(id) {
    const person = access.users.find((user) => user.id === id)
    if (!person) return
    setAccess((current) => ({
      ...current,
      users: current.users.map((user) => (user.id === id ? { ...user, status: 'active' } : user)),
      notices: [{ id: uid(), text: `${person.name} в команде. Роль: ${roleLabel(person.role)}.`, at: stamp() }, ...current.notices],
    }))
    announceDecision(person, 'active').then((sent) => notify(sent ? `${person.name} подтверждён. У него кнопки откроются в течение минуты.` : `${person.name} подтверждён здесь, но сеть не ответила. Нажмите «Подтвердить» ещё раз позже.`))
  }

  function rejectUser(id) {
    const person = access.users.find((user) => user.id === id)
    if (!person) return
    setAccess((current) => ({
      ...current,
      users: current.users.map((user) => (user.id === id ? { ...user, status: 'rejected' } : user)),
      notices: [{ id: uid(), text: `Заявка ${person.name} отклонена.`, at: stamp() }, ...current.notices],
    }))
    announceDecision(person, 'rejected')
    notify(`Заявка ${person.name} отклонена.`)
  }

  async function resetPassword({ email, phrase, password }) {
    const clean = email.trim().toLowerCase()
    const person = access.users.find((user) => user.email === clean)
    if (!person) {
      setAuthError('Такой почты нет.')
      return
    }
    if (!person.secretHash) {
      setAuthError('Фраза ещё не задана. Отправьте заявку разработчику.')
      return
    }
    setAuthBusy(true)
    const secretHash = await hashPassword(normalizePhrase(phrase))
    const passwordHash = await hashPassword(password)
    setAuthBusy(false)
    if (secretHash !== person.secretHash) {
      setAuthError('Фраза не совпала.')
      return
    }
    setAccess((current) => ({
      ...current,
      users: current.users.map((user) => (user.email === clean ? { ...user, passwordHash } : user)),
    }))
    setAuthMode(null)
    setAuthError('')
    notify('Новый пароль сохранён. Можно входить.')
  }

  function requestRecovery(email) {
    const clean = email.trim().toLowerCase()
    const person = access.users.find((user) => user.email === clean)
    if (!person) {
      setAuthError('Такой почты нет.')
      return
    }
    setAccess((current) => ({
      ...current,
      notices: [{ id: uid(), text: `${person.name} просит восстановить пароль: ${person.email}`, at: stamp() }, ...current.notices],
    }))
    setAuthMode(null)
    setAuthError('')
    announceRecovery(person).then((sent) => notify(sent ? 'Просьба ушла разработчику: пуш и письмо.' : 'Сеть не ответила. Попробуйте ещё раз.'))
  }

  async function savePhrase(event) {
    event.preventDefault()
    if (!session || session.secretHash) return
    if (normalizePhrase(phraseDraft).length < 4) {
      notify('Фраза короче четырёх символов.')
      return
    }
    const secretHash = await hashPassword(normalizePhrase(phraseDraft))
    setAccess((current) => ({
      ...current,
      users: current.users.map((user) => (user.email === session.email ? { ...user, secretHash } : user)),
    }))
    setPhraseDraft('')
    notify('Секретная фраза сохранена в кабинете и больше не показывается.')
  }

  function saveProfile({ name, role }) {
    if (!session) return
    const cleanName = String(name || '').trim()
    if (cleanName.length < 2) {
      notify('Имя короче двух букв.')
      return
    }
    const allowed = session.email === ADMIN_EMAIL ? ROLES : SIGNUP_ROLES
    const nextRole = allowed.some((item) => item.id === role) ? role : session.role
    setAccess((current) => ({
      ...current,
      users: current.users.map((user) => (user.email === session.email ? { ...user, name: cleanName, role: nextRole } : user)),
    }))
    notify(`Профиль сохранён: ${cleanName}, ${roleLabel(nextRole)}.`)
  }

  function logout() {
    setAccess((current) => ({ ...current, sessionEmail: null }))
    setModal(null)
    setDeskOpen(false)
    notify('Вы вышли. Снова открыт только просмотр.')
  }

  const section = NAV.find((item) => item.id === tab)?.title || 'Сегодня'
  const reviewItem = days.find((item) => item.day === reviewDay) || null
  const reelSources = news.filter((item) => REEL_SOURCE_IDS.includes(item.id))
  const gameFormats = EVENT_FORMATS.filter((item) => formatGroup(item) === 'игры')

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar
        tab={tab}
        onTab={setTab}
        open={navOpen}
        onClose={() => setNavOpen(false)}
        isDeveloper={isDeveloper}
      />
      <div className="min-w-0 flex-1">
      <TopBar
        title={section}
        dateLabel={todayLabel}
        isDeveloper={isDeveloper}
        pendingCount={pending.length}
        onDesk={() => setDeskOpen((open) => !open)}
        openTasks={tasks.filter((task) => !task.doneAt).length}
        onTasks={() => { setDeskOpen(false); setTasksOpen(true) }}
        onMenu={() => setNavOpen(true)}
        onAuth={() => {
          if (session) setModal('session')
          else { setAuthError(''); setAuthMode('login') }
        }}
        onRegister={() => { setAuthError(''); setAuthMode('register') }}
        account={session}
      />
      <main className="relative z-10 mx-auto max-w-[1440px] space-y-6 px-4 pb-16 pt-6 sm:px-6">
        {!canAct && (!bannerHidden || session?.status === 'pending') && (
          <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#C9A96A]/20 bg-[#121A14]/60 py-3 pl-5 pr-12 text-sm leading-relaxed text-[#F4F0E6]/80">
            <p>{session?.status === 'pending'
              ? `Заявка у разработчика. Кнопки откроются сами, как только он подтвердит${relayState === 'offline' ? ' — сейчас нет связи, проверим позже' : ''}.`
              : session?.status === 'rejected' ? 'Заявку отклонили. Пока открыт только просмотр.' : 'Сейчас открыт просмотр. Чтобы утверждать дни и писать команде, зарегистрируйтесь. Разработчик подтвердит вход.'}</p>
            {!session && <button type="button" onClick={() => { setAuthError(''); setAuthMode('register') }} className="shrink-0 rounded-full bg-[#C9A96A] px-4 py-2 text-sm font-semibold text-[#0A0F0B]">Регистрация</button>}
            {session?.status === 'pending' && <button type="button" onClick={resendMine} className="shrink-0 rounded-full border border-[#C9A96A]/50 px-4 py-2 text-sm text-[#C9A96A]">Отправить ещё раз</button>}
            <button type="button" aria-label="Закрыть" onClick={() => { setBannerHidden(true); try { sessionStorage.setItem('restprime-banner', 'hidden') } catch { /* память закрыта */ } }} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-[#F4F0E6]/60 hover:bg-white/10 hover:text-[#F4F0E6]"><X size={16} /></button>
          </div>
        )}
        <Suspense fallback={<p className="py-16 text-center text-sm text-[#7A8580]">Открываем раздел…</p>}>
        <motion.div key={tab} initial={{ opacity: 0, filter: 'blur(8px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.35 }}>
        {tab === 'overview' && (
          <Dashboard
            day={todayDay}
            canAct={canAct}
            onPublish={() => openChannel('telegram', todayDay)}
            onEdit={() => { setFocus(todayDay.day); setTab('posts-edit') }}
            onOpenPlan={() => setTab('plan-30')}
            onOpenAgent={() => setTab('agent')}
            onOpenChannels={() => setTab('tg-channels')}
            onOpenThree={() => setTab('three-days')}
            onReview={openReview}
            onStatus={setDayStatus}
            onToggleExtension={toggleExtension}
          />
        )}
        {tab === 'calendar-year' && (
          <YearCalendar
            days={days}
            todayIso={isoDate(clock)}
            onOpenDay={(dayNumber) => { setFocus(dayNumber); setTab('plan-30') }}
            onCopy={async (text) => { await copyText(text); notify('Текст скопирован.') }}
          />
        )}
        {tab === 'agent' && (
          <AIAgent
            days={days}
            day={day}
            canAct={canAct}
            onPick={setFocus}
            onRebuild={placeAgentText}
            onUndo={undoLast}
            onCopy={async (text) => { await copyText(text); notify('Текст агента скопирован.') }}
          />
        )}
        {tab === 'three-days' && (
          <ThreeDaysDesk
            days={days}
            signals={signals}
            fromDay={(todayNumber || 0) + 1}
            canAct={canAct}
            onPlacePost={placeIdeaPost}
            onPlaceReel={placeReel}
            onSendChat={(text, attachment) => { if (!requireAct()) return; pushMessage(text, attachment); notify('Отправлено в чат команды.') }}
            onCopy={async (text) => { await copyText(text); notify('Скопировано.') }}
          />
        )}
        {tab === 'analytics' && <Analytics days={days} todayNumber={todayNumber || day.day} />}
        {tab === 'plan-30' && (
          <PlanView
            days={days}
            status={status}
            pillar={pillar}
            canAct={canAct}
            onStatus={setStatus}
            onPillar={setPillar}
            trends={trends}
            boards={trendBoards}
            onApproveAll={() => {
              if (!requireAct()) return
              setDays((current) => current.map((item) => ({ ...item, status: 'approved' })))
              notify('Все 30 дней утверждены.')
            }}
            onAutoPlan={runAutoPlan}
            onFixRepeats={fixRepeats}
            repeats={repeats}
            signals={signals}
            onOpen={(item) => { setFocus(item.day); setModal('day') }}
            onSetStatus={setDayStatus}
            onReview={openReview}
            onTelegram={(item) => openChannel('telegram', item)}
            onInstagram={(item) => openChannel('instagram', item)}
            onProject={(item) => openChannel('project', item)}
            onMatch={(trend) => rebuildDay(focus, trend)}
            onReplace={rebuildDay}
            onForward={forwardDay}
            onImprove={improveDay}
            onImproveReel={refineReel}
          />
        )}
        {tab === 'posts-30' && <PostsView days={days} canAct={canAct} onToggleExtension={toggleExtension} onSetStatus={setDayStatus} onReview={openReview} onCopy={async (text) => { await copyText(text); notify('Текст поста скопирован.') }} onExport={exportCsv} />}
        {tab === 'posts-edit' && (
          <PostWorkshop
            days={days}
            day={day}
            canAct={canAct}
            repeats={repeats}
            onPick={setFocus}
            onStatus={setDayStatus}
            onFormat={setFormat}
            onToggleExtension={toggleExtension}
            onAuto={improveDay}
            onCopy={async (text) => { await copyText(text); notify('Текст поста скопирован.') }}
            onSave={(dayNumber, patch) => {
              if (!requireAct()) return
              const item = days.find((entry) => entry.day === dayNumber)
              if (item) remember(item)
              patchDay(dayNumber, { ...patch, manual: true })
              notify(item ? `Правка сохранена: ${formatLong(dateForDay(item.day))} · «${patch.title || item.title}». Автоплан этот день больше не трогает.` : 'Правка сохранена.')
            }}
          />
        )}
        {tab === 'site-desk' && isDeveloper && (
          <SiteDesk
            days={days}
            notes={siteNotes}
            onNotes={(text) => { setSiteNotes(text); notify('Заметка кабинета сохранена.') }}
            onStatus={setDayStatus}
            onPatch={(dayNumber, patch) => {
              const item = days.find((entry) => entry.day === dayNumber)
              if (item) remember(item)
              patchDay(dayNumber, patch)
              notify(item ? `Записано: ${formatLong(dateForDay(item.day))} · «${item.title}».` : 'Текст записан.')
            }}
            onRestore={restoreDay}
          />
        )}
        {tab === 'news-feed' && <TrendFeed items={recentNews} days={days} day={day} canAct={canAct} onPick={setFocus} onWrite={writeNews} />}
        {tab === 'tg-channels' && <ChannelDesk canAct={canAct} onWrite={writeChannel} onRework={openGoal} />}
        {tab === 'reels-30' && (
          <ReelsView
            days={days}
            day={day}
            sources={reelSources}
            bank={REEL_BANK}
            custom={extraReels}
            canAct={canAct}
            onPick={setFocus}
            onImprove={refineReel}
            onApplySource={applyReelSource}
            onUseBank={placeReel}
            onCreate={createReel}
            onCopy={async (text) => { await copyText(text); notify('Текст рилса скопирован.') }}
          />
        )}
        {tab === 'themes-30' && (
          <ThemesView
            days={days}
            day={day}
            formats={EVENT_FORMATS}
            sources={THEME_SOURCES}
            games={gameFormats}
            canAct={canAct}
            onPick={setFocus}
            onApply={applyFormat}
            onUndo={undoLast}
          />
        )}
        {tab === 'files-tg' && (
          <FilesView
            files={files}
            telegram={telegram}
            canAct={canAct}
            onUpload={addFiles}
            onAddTelegram={(handle, role) => {
              if (!requireAct()) return
              if (!handle.trim()) return
              setTelegram((current) => [...current, { handle: handle.trim(), role, status: 'Отмечен в кабинете' }])
              notify('Аккаунт добавлен в список кабинета.')
            }}
            onDigest={() => { if (!requireAct()) return; notify('Сводка отмечена. Утренний бот появится вместе с Telegram API.') }}
          />
        )}
        {tab === 'insta-analytics' && (
          <InstaView
            days={days}
            canAct={canAct}
            onOpen={(item) => { setFocus(item.day); setModal('day') }}
            onQueue={(item) => openChannel('instagram', item)}
            url={url}
            setUrl={setUrl}
            busy={busy}
            result={result}
            onAnalyze={analyze}
          />
        )}
        {tab === 'github-tz' && (
          <TeamView
            messages={chat}
            members={members}
            teamState={canAct || RELAY_TEST ? teamState || 'connecting' : ''}
            approved={approved}
            canAct={canAct}
            onSend={(text) => { if (!requireAct() || !text.trim()) return; pushMessage(text.trim()) }}
            onForward={forwardDay}
          />
        )}
        </motion.div>
        </Suspense>
      </main>
      </div>

      <ReviewSheet
        day={reviewItem}
        onClose={() => setReviewDay(null)}
        onApprove={() => { setDayStatus(reviewItem.day, 'approved'); setReviewDay(null) }}
        onAgree={() => { setDayStatus(reviewItem.day, 'agreed'); setReviewDay(null) }}
        onRedo={() => { improveDay(reviewItem.day); setReviewDay(null) }}
      />
      <ReleaseCorner
        days={days}
        focus={focus}
        open={goalOpen}
        source={goalSource}
        onOpen={() => setGoalOpen(true)}
        onClose={() => setGoalOpen(false)}
        onPick={(item) => {
          if (goalSource?.text) adaptForDay(item.day, goalSource.text)
          else { setFocus(item.day); setTab('posts-30'); setGoalOpen(false) }
        }}
      />
      {tasksOpen && (
        <TaskDesk
          tasks={tasks}
          log={taskLog}
          members={members}
          days={days}
          todayIso={isoDate(clock)}
          todayDay={todayNumber ? todayDay : null}
          canAct={canAct}
          session={session}
          onClose={() => setTasksOpen(false)}
          onAdd={addTask}
          onToggle={toggleTask}
          onRemove={removeTask}
          onSeedDay={seedDayTasks}
        />
      )}
      {isDeveloper && deskOpen && (
        <DeveloperDesk
          pending={pending}
          notices={access.notices}
          relayState={relayState}
          onClose={() => setDeskOpen(false)}
          onConfirm={confirmUser}
          onReject={rejectUser}
          onRefresh={() => syncRelay().then(() => notify('Заявки проверены.')).catch(() => notify('Нет связи с каналом заявок.'))}
          onEnableNotices={enableSystemNotices}
          onDismissNotice={(id) => setAccess((current) => ({ ...current, notices: current.notices.filter((notice) => notice.id !== id) }))}
        />
      )}
      {toast && (
        <div className="fixed left-1/2 top-[76px] sm:top-auto sm:bottom-6 z-[120] flex w-[min(92vw,460px)] -translate-x-1/2 items-start justify-between gap-3 rounded-2xl bg-[#C9A96A] px-4 py-3 text-sm leading-snug text-[#0A0F0B] shadow-xl">
          <p className="min-w-0 flex-1">{toast}</p>
          {undoCount > 0 && <button type="button" onClick={undoLast} className="shrink-0 rounded-full bg-[#0A0F0B] px-3 py-1 text-xs font-semibold text-[#C9A96A]">Убрать</button>}
          <button type="button" aria-label="Закрыть уведомление" onClick={() => setToast('')} className="-mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-full hover:bg-[#0A0F0B]/15"><X size={16} /></button>
        </div>
      )}

      {(modal === 'instagram' || modal === 'telegram') && (
        <Modal title={modal === 'instagram' ? `Очередь ${FLAGSHIP.instagramHandle}` : `Очередь ${FLAGSHIP.telegramHandle}`} onClose={() => setModal(null)}>
          <p className="mb-3 text-sm text-ink/60">
            {formatLong(dateForDay(day.day))} · {day.title}
          </p>
          <p className="mb-4 whitespace-pre-wrap text-lg leading-relaxed text-ink">{modal === 'instagram' ? `${shownPost(day)}\n\n${day.reelHook}` : shownPost(day)}</p>
          <Button3D className="w-full" onClick={async () => {
            const text = modal === 'instagram' ? `${shownPost(day)}\n\n${day.reelHook}` : shownPost(day)
            await copyText(text)
            window.open(modal === 'instagram' ? FLAGSHIP.instagram : FLAGSHIP.telegram, '_blank', 'noopener')
            notify(modal === 'instagram' ? 'Текст скопирован, открыт профиль KEDR в Instagram.' : 'Текст скопирован, открыт канал KEDR в Telegram.')
          }}>{modal === 'instagram' ? 'Скопировать и открыть Instagram' : 'Скопировать и открыть Telegram'}</Button3D>
        </Modal>
      )}

      {modal === 'project' && (
        <Modal title="Новый проект на этот день" onClose={() => setModal(null)}>
          <form className="space-y-3" onSubmit={(event) => {
            event.preventDefault()
            if (!requireAct() || !projectDraft.title.trim()) return
            patchDay(day.day, { projectTitle: projectDraft.title.trim(), projectChannel: projectDraft.channel, projectNote: projectDraft.note.trim() })
            setModal(null)
            setProjectDraft({ title: '', channel: 'Съёмка', note: '' })
            notify(`Проект привязан к ${formatLong(dateForDay(day.day))}.`)
          }}>
            <p className="text-sm text-ink/60">{formatLong(dateForDay(day.day))} · {day.title}</p>
            <input required value={projectDraft.title} onChange={(event) => setProjectDraft({ ...projectDraft, title: event.target.value })} placeholder="Название" className="w-full rounded-2xl border border-ink/10 bg-card px-3 py-2 text-sm text-ink focus:border-[#C9A96A] focus:outline-none" />
            <select value={projectDraft.channel} onChange={(event) => setProjectDraft({ ...projectDraft, channel: event.target.value })} className="w-full rounded-2xl border border-ink/10 bg-card px-3 py-2 text-sm text-ink">
              <option>Съёмка</option>
              <option>Банкет</option>
              <option>Меню</option>
              <option>Спецпроект</option>
            </select>
            <textarea value={projectDraft.note} onChange={(event) => setProjectDraft({ ...projectDraft, note: event.target.value })} rows={3} placeholder="Что сделать" className="w-full rounded-2xl border border-ink/10 bg-card px-3 py-2 text-sm text-ink focus:border-[#C9A96A] focus:outline-none" />
            <Button3D type="submit" className="w-full">Создать проект</Button3D>
          </form>
        </Modal>
      )}

      {modal === 'day' && (
        <Modal title={`${formatLong(dateForDay(day.day))}. ${day.title}`} onClose={() => setModal(null)}>
          <DayModalBody day={day} onCopy={async (text) => { await copyText(text); notify('Текст поста скопирован.') }} />
        </Modal>
      )}

      {modal === 'audit' && (
        <Modal title="Аудит ресторана по ссылке" icon={<Sparkles className="text-gold" size={18} />} onClose={() => setModal(null)}>
          <p className="mb-3 text-sm text-ink/60">Короткий конспект по адресу, без внешнего разбора сайта.</p>
          <input value={auditUrl} onChange={(event) => setAuditUrl(event.target.value)} className="mb-3 w-full rounded-2xl border border-ink/10 bg-card px-3 py-2 text-sm text-ink focus:border-[#C9A96A] focus:outline-none" />
          <Button3D disabled={auditBusy} onClick={() => {
            setAuditBusy(true)
            window.setTimeout(() => {
              setAuditResult(`Адрес ${auditUrl || 'без ссылки'}: тёмный зал, живой огонь и кухня севера. Для кабинета берём тон KEDR — без капса и без детских смайлов. Меню и цены с сайта не выдумываем.`)
              setAuditBusy(false)
            }, 1200)
          }}>{auditBusy ? 'Смотрим адрес…' : 'Собрать конспект'}</Button3D>
          {auditResult && <p className="mt-4 text-sm leading-relaxed text-ink/80">{auditResult}</p>}
        </Modal>
      )}

      {modal === 'session' && session && (
        <Modal title={session.name} onClose={() => setModal(null)}>
          <p className="text-sm text-ink/70">{session.email}</p>
          <p className="mt-1 text-sm text-gold">{roleLabel(session.role)} · {session.status === 'active' ? 'доступ открыт' : 'ожидает подтверждения'}</p>
          <ProfileEditor key={`${session.email}-${session.name}-${session.role}`} session={session} onSave={saveProfile} />
          <p className="mt-4 text-sm text-ink/70">{session.secretHash ? 'Секретная фраза сохранена в этом кабинете. Её нельзя посмотреть повторно.' : 'Фраза ещё не задана. Придумайте её один раз — по ней восстанавливается пароль.'}</p>
          {!session.secretHash && (
            <form className="mt-3 space-y-3" onSubmit={savePhrase}>
              <input value={phraseDraft} onChange={(event) => setPhraseDraft(event.target.value)} minLength={4} required placeholder="Секретная фраза" className="w-full rounded-2xl border border-white/15 bg-card px-4 py-3 text-sm text-ink outline-none focus:border-[#C9A96A]" />
              <Button3D type="submit" className="w-full">Зафиксировать фразу</Button3D>
            </form>
          )}
          <Button3D tone="ghost" className="mt-5 w-full" onClick={logout}>Выйти</Button3D>
        </Modal>
      )}

      {authMode && (
        <AccessModal
          mode={authMode}
          error={authError}
          busy={authBusy}
          onMode={(next) => { setAuthError(''); setAuthMode(next) }}
          onClose={() => { setAuthMode(null); setAuthError('') }}
          onLogin={login}
          onRegister={register}
          onReset={resetPassword}
          onRequest={requestRecovery}
        />
      )}
    </div>
  )
}
