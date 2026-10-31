import { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { contentPlan } from './data/contentPlan.js'
import { newsFeed } from './data/news.js'
import { FLAGSHIP } from './data/place.js'
import { starterChat, starterFiles, starterTelegram, videoPresets } from './data/suite.js'
import { ModuleNav, TopBar } from './components/Chrome.jsx'
import TodayScreen from './components/TodayScreen.jsx'
import ReleaseCorner from './components/ReleaseCorner.jsx'
import AccessModal from './components/AccessModal.jsx'
import DeveloperDesk from './components/DeveloperDesk.jsx'
import { improveReel, improveShort, improveWide, shownPost, wideFromDay, wordCount, writeFromNews } from './lib/compose.js'
import TrendFeed from './components/TrendFeed.jsx'
import { applyTrend, nextTrend, trendBoards, trends } from './data/trends.js'
import { dateForDay, formatLong, isoDate, planDayForDate } from './lib/planDates.js'
import { loadAccess, saveAccess } from './lib/access.js'
import { hashPassword, normalizePhrase, roleLabel } from './lib/auth.js'
import {
  DayModalBody, FilesView, InstaView, PlanView, PostsView, ReelsView, TeamView, ThemesView,
} from './components/Modules.jsx'
import Button3D from './components/ui/Button3D.jsx'
import Modal from './components/ui/Modal.jsx'

const KEY = 'restprime-cabinet-v3'

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!saved?.days?.length || !String(saved.days[0]?.postText || '').startsWith('До Зайцево')) return null
    return saved
  } catch {
    return null
  }
}

function initialChat(saved) {
  const raw = saved?.chat
  if (!raw?.length || raw.some((item) => item.sender === 'Бренд-Шеф')) return starterChat
  return raw
}

function stamp() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export default function App() {
  const saved = useMemo(loadState, [])
  const todayNumber = useMemo(() => planDayForDate(new Date()), [])
  const [tab, setTab] = useState('plan-30')
  const [days, setDays] = useState(saved?.days || contentPlan)
  const [focus, setFocus] = useState(todayNumber || saved?.focus || 1)
  const [status, setStatus] = useState('all')
  const [pillar, setPillar] = useState('all')
  const [files, setFiles] = useState(saved?.files || starterFiles)
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
  const isDeveloper = canAct && session?.role === 'developer'
  const pending = access.users.filter((user) => user.status === 'pending')
  const members = access.users.filter((user) => user.status === 'active')
  const approved = days.filter((item) => item.status === 'approved')
  const recentNews = useMemo(() => {
    const limit = isoDate(new Date())
    return news.filter((item) => item.iso && item.iso <= limit).sort((a, b) => b.iso.localeCompare(a.iso))
  }, [news])

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ edition: 'readable', days, focus, files, telegram, chat }))
  }, [days, focus, files, telegram, chat])

  useEffect(() => { saveAccess(access) }, [access])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2800)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setModal(null)
        setAuthMode(null)
        setDeskOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function notify(message) { setToast(message) }

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
    setChat((current) => [...current, {
      id: uid(),
      sender: session?.name || 'Команда',
      role: roleLabel(session?.role),
      time: stamp(),
      text,
      badge: roleLabel(session?.role),
      attachment,
    }])
  }

  function approve(dayNumber) {
    if (!requireAct()) return
    const item = days.find((entry) => entry.day === dayNumber)
    patchDay(dayNumber, { status: 'approved' })
    setFocus(dayNumber)
    if (item) {
      pushMessage(`Утверждён день ${dayNumber}: ${item.title}`, {
        kind: 'post',
        day: item.day,
        title: item.title,
        body: shownPost(item),
      })
    }
    notify(`День ${dayNumber} утверждён и отправлен в комнату.`)
  }

  function forwardDay(item, kind) {
    if (!requireAct()) return
    pushMessage(kind === 'theme' ? `Пересылаю тему дня ${item.day}.` : `Пересылаю пост дня ${item.day}.`, {
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
    if (item.format === 'wide') {
      const wideText = improveWide({ ...item, wideText: item.wideText || wideFromDay(item) })
      patchDay(dayNumber, { format: 'wide', wideText })
      notify(`Широкий пост дня ${dayNumber}: ${wordCount(wideText)} слов.`)
    } else {
      const postText = improveShort(item)
      patchDay(dayNumber, { format: 'short', postText })
      notify(`Короткий пост дня ${dayNumber} собран заново.`)
    }
    setFocus(dayNumber)
  }

  function refineReel(dayNumber) {
    if (!requireAct()) return
    const item = days.find((entry) => entry.day === dayNumber)
    if (!item) return
    patchDay(dayNumber, improveReel(item))
    setFocus(dayNumber)
    notify(`Сценарий дня ${dayNumber} собран заново.`)
  }

  function writeNews(story, format) {
    if (!requireAct()) return
    const text = writeFromNews(day, story, format)
    if (format === 'wide') patchDay(day.day, { format: 'wide', wideText: text })
    else patchDay(day.day, { format: 'short', postText: text })
    setTab('posts-30')
    notify(`${format === 'wide' ? 'Широкий' : 'Короткий'} пост дня ${day.day} собран из «${story.source}». ${wordCount(text)} слов.`)
  }

  function rebuildDay(dayNumber, trend) {
    if (!requireAct()) return
    const item = days.find((entry) => entry.day === dayNumber)
    if (!item) return
    const picked = trend?.post ? trend : nextTrend(item.trendId)
    const next = applyTrend(item, picked)
    if (item.format === 'wide') next.wideText = wideFromDay({ ...item, ...next })
    patchDay(dayNumber, next)
    setFocus(dayNumber)
    notify(`День ${dayNumber} пересобран: «${picked.name}».`)
  }

  function rebuildAll() {
    if (!requireAct()) return
    setDays((current) => current.map((item) => ({ ...item, ...applyTrend(item, nextTrend(item.trendId)) })))
    notify('Все задания сдвинуты на следующий приём из трендов.')
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
      insight: 'Файл в списке кабинета. Разбор техкарт подключится с хранилищем.',
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
    setAuthBusy(false)
    setAuthMode(null)
    setAuthError('')
    notify('Заявка отправлена. Пока открыт только просмотр.')
  }

  function confirmUser(id) {
    const person = access.users.find((user) => user.id === id)
    if (!person) return
    setAccess((current) => ({
      ...current,
      users: current.users.map((user) => (user.id === id ? { ...user, status: 'active' } : user)),
      notices: [{ id: uid(), text: `${person.name} в команде. Роль: ${roleLabel(person.role)}.`, at: stamp() }, ...current.notices],
    }))
    notify(`${person.name} подтверждён.`)
  }

  function rejectUser(id) {
    const person = access.users.find((user) => user.id === id)
    if (!person) return
    setAccess((current) => ({
      ...current,
      users: current.users.map((user) => (user.id === id ? { ...user, status: 'rejected' } : user)),
      notices: [{ id: uid(), text: `Заявка ${person.name} отклонена.`, at: stamp() }, ...current.notices],
    }))
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
    notify('Заявка на восстановление отправлена разработчику.')
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

  function logout() {
    setAccess((current) => ({ ...current, sessionEmail: null }))
    setModal(null)
    setDeskOpen(false)
    notify('Вы вышли. Снова открыт только просмотр.')
  }

  return (
    <div className="min-h-screen">
      <TopBar
        onAuth={() => {
          if (session) setModal('session')
          else { setAuthError(''); setAuthMode('login') }
        }}
        onRegister={() => { setAuthError(''); setAuthMode('register') }}
        account={session}
        isDeveloper={isDeveloper}
        pendingCount={pending.length}
        onDesk={() => setDeskOpen((open) => !open)}
      />
      <main className="relative z-10 mx-auto max-w-[1100px] space-y-6 px-4 pb-16 pt-6 sm:px-6">
        {!canAct && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-ink/10 bg-card px-5 py-3 text-sm leading-relaxed text-ink/80">
            <p>{session?.status === 'pending' ? 'Заявка отправлена. Пока можно читать план, посты и чат. Кнопки откроются после подтверждения.' : 'Сейчас открыт просмотр. Чтобы утверждать дни и писать команде, зарегистрируйтесь. Разработчик подтвердит вход.'}</p>
            {!session && <button type="button" onClick={() => { setAuthError(''); setAuthMode('register') }} className="shrink-0 rounded-full bg-[#2f6b4f] px-4 py-2 text-sm font-semibold text-white">Регистрация</button>}
          </div>
        )}
        <TodayScreen
          days={days}
          day={day}
          todayNumber={todayNumber}
          news={recentNews}
          canAct={canAct}
          onPick={setFocus}
          onFormat={(format) => setFormat(day.day, format)}
          onImprove={() => improveDay(day.day)}
          onImproveReel={() => refineReel(day.day)}
          onApprove={() => approve(day.day)}
          onReplace={() => rebuildDay(day.day)}
          onChat={() => forwardDay(day, 'post')}
        />
        <ModuleNav tab={tab} onTab={setTab} />
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
            onRebuild={rebuildAll}
            onOpen={(item) => { setFocus(item.day); setModal('day') }}
            onApprove={approve}
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
        {tab === 'posts-30' && <PostsView days={days} onCopy={async (text) => { await navigator.clipboard.writeText(text); notify('Текст поста скопирован.') }} onExport={exportCsv} />}
        {tab === 'news-feed' && <TrendFeed items={recentNews} days={days} day={day} canAct={canAct} onPick={setFocus} onWrite={writeNews} />}
        {tab === 'reels-30' && <ReelsView days={days} canAct={canAct} onImprove={refineReel} />}
        {tab === 'themes-30' && <ThemesView days={days} />}
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
            approved={approved}
            canAct={canAct}
            onSend={(text) => { if (!requireAct() || !text.trim()) return; pushMessage(text.trim()) }}
            onForward={forwardDay}
          />
        )}
      </main>

      <ReleaseCorner days={days} focus={focus} onPick={(item) => { setFocus(item.day); setTab('posts-30') }} />
      {isDeveloper && deskOpen && (
        <DeveloperDesk pending={pending} notices={access.notices} onClose={() => setDeskOpen(false)} onConfirm={confirmUser} onReject={rejectUser} />
      )}
      {toast && <div className="fixed left-1/2 top-20 z-[120] -translate-x-1/2 rounded-full bg-[#d7e6d4] px-4 py-2 text-sm text-[#1a2e24] shadow-xl">{toast}</div>}

      {(modal === 'instagram' || modal === 'telegram') && (
        <Modal title={modal === 'instagram' ? `Очередь ${FLAGSHIP.instagramHandle}` : `Очередь ${FLAGSHIP.telegramHandle}`} onClose={() => setModal(null)}>
          <p className="mb-3 text-sm text-ink/60">
            {formatLong(dateForDay(day.day))} · день {day.day}
          </p>
          <p className="mb-4 whitespace-pre-wrap text-lg leading-relaxed text-ink">{modal === 'instagram' ? `${shownPost(day)}\n\n${day.reelHook}` : shownPost(day)}</p>
          <Button3D className="w-full" onClick={async () => {
            const text = modal === 'instagram' ? `${shownPost(day)}\n\n${day.reelHook}` : shownPost(day)
            await navigator.clipboard.writeText(text)
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
            notify(`Проект привязан к дню ${day.day}.`)
          }}>
            <p className="text-sm text-ink/60">{formatLong(dateForDay(day.day))} · {day.title}</p>
            <input required value={projectDraft.title} onChange={(event) => setProjectDraft({ ...projectDraft, title: event.target.value })} placeholder="Название" className="w-full rounded-2xl border border-ink/10 bg-card px-3 py-2 text-sm text-ink focus:border-[#2f6b4f] focus:outline-none" />
            <select value={projectDraft.channel} onChange={(event) => setProjectDraft({ ...projectDraft, channel: event.target.value })} className="w-full rounded-2xl border border-ink/10 bg-card px-3 py-2 text-sm text-ink">
              <option>Съёмка</option>
              <option>Банкет</option>
              <option>Меню</option>
              <option>Спецпроект</option>
            </select>
            <textarea value={projectDraft.note} onChange={(event) => setProjectDraft({ ...projectDraft, note: event.target.value })} rows={3} placeholder="Что сделать" className="w-full rounded-2xl border border-ink/10 bg-card px-3 py-2 text-sm text-ink focus:border-[#2f6b4f] focus:outline-none" />
            <Button3D type="submit" className="w-full">Создать проект</Button3D>
          </form>
        </Modal>
      )}

      {modal === 'day' && (
        <Modal title={`День ${day.day}. ${day.title}`} onClose={() => setModal(null)}>
          <DayModalBody day={day} onCopy={async (text) => { await navigator.clipboard.writeText(text); notify('Текст поста скопирован.') }} />
        </Modal>
      )}

      {modal === 'audit' && (
        <Modal title="Аудит ресторана по ссылке" icon={<Sparkles className="text-gold" size={18} />} onClose={() => setModal(null)}>
          <p className="mb-3 text-sm text-ink/60">Короткий конспект по адресу, без внешнего разбора сайта.</p>
          <input value={auditUrl} onChange={(event) => setAuditUrl(event.target.value)} className="mb-3 w-full rounded-2xl border border-ink/10 bg-card px-3 py-2 text-sm text-ink focus:border-[#2f6b4f] focus:outline-none" />
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
          <p className="mt-1 text-sm text-[#9dccb0]">{roleLabel(session.role)} · {session.status === 'active' ? 'доступ открыт' : 'ожидает подтверждения'}</p>
          <p className="mt-4 text-sm text-ink/70">{session.secretHash ? 'Секретная фраза сохранена в этом кабинете. Её нельзя посмотреть повторно.' : 'Фраза ещё не задана. Придумайте её один раз — по ней восстанавливается пароль.'}</p>
          {!session.secretHash && (
            <form className="mt-3 space-y-3" onSubmit={savePhrase}>
              <input value={phraseDraft} onChange={(event) => setPhraseDraft(event.target.value)} minLength={4} required placeholder="Секретная фраза" className="w-full rounded-2xl border border-white/15 bg-card px-4 py-3 text-sm text-ink outline-none focus:border-[#2f6b4f]" />
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
