import { useEffect, useMemo, useState } from 'react'
import { Sparkles, UserRound } from 'lucide-react'
import { contentPlan } from './data/contentPlan.js'
import { newsFeed } from './data/news.js'
import { starterChat, starterFiles, starterTelegram, videoPresets } from './data/suite.js'
import { HeroBoard, ModuleNav, RESTAURANTS, TopBar } from './components/Chrome.jsx'
import ReleaseCorner from './components/ReleaseCorner.jsx'
import { applyNews } from './lib/matchDay.js'
import { applyTrend, nextTrend, trendBoards, trends } from './data/trends.js'
import { dateForDay, formatLong } from './lib/planDates.js'
import {
  DayModalBody, FilesView, InstaView, PlanView, PostsView, ReelsView, TeamView, ThemesView, VideoView,
} from './components/Modules.jsx'
import Button3D from './components/ui/Button3D.jsx'
import Modal from './components/ui/Modal.jsx'

const KEY = 'restprime-kedr-menu-v2'

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!saved?.days?.length || !saved.days[0]?.scene) return null
    return saved
  } catch {
    return null
  }
}

function stamp() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function variantFor(day) {
  const quiet = day.day % 2 === 0
  return quiet
    ? {
      title: `Тихий кадр: ${day.dish}`,
      postText: `${day.dish}. Без музыки: огонь, дерево и пауза перед подачей. Бронь стола — kedr-res.ru.`,
      reelHook: `0–3 сек: только звук огня и ${day.dish.toLowerCase()} в тёплом свете.`,
    }
    : {
      title: `${day.dish}: вечер у огня`,
      postText: `Сегодня в зале KEDR — ${day.dish}. Подача у живого огня. Столы на вечер открыты.`,
      reelHook: `0–3 сек: рука снимает клош, пар и ${day.dish.toLowerCase()}.`,
    }
}

export default function App() {
  const saved = useMemo(loadState, [])
  const [tab, setTab] = useState('plan-30')
  const [restaurant, setRestaurant] = useState(saved?.restaurant || 'kedr')
  const [days, setDays] = useState(saved?.days || contentPlan)
  const [focus, setFocus] = useState(saved?.focus || 1)
  const [status, setStatus] = useState('all')
  const [pillar, setPillar] = useState('all')
  const [files, setFiles] = useState(saved?.files || starterFiles)
  const [telegram, setTelegram] = useState(saved?.telegram || starterTelegram)
  const [chat, setChat] = useState(saved?.chat || starterChat)
  const [news, setNews] = useState(newsFeed)
  const [projectDraft, setProjectDraft] = useState({ title: '', channel: 'Съёмка', note: '' })
  const [account, setAccount] = useState(saved?.account || null)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const [url, setUrl] = useState(videoPresets[0].url)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(videoPresets[0])
  const [auditUrl, setAuditUrl] = useState('https://kedr-res.ru/')
  const [auditResult, setAuditResult] = useState('')
  const [auditBusy, setAuditBusy] = useState(false)
  const [period, setPeriod] = useState('30')
  const [draftAccount, setDraftAccount] = useState({ name: '', email: '', role: 'Директор' })

  const day = days.find((item) => item.day === focus) || days[0]
  const place = RESTAURANTS[restaurant] || RESTAURANTS.kedr

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ restaurant, days, focus, files, telegram, chat, account }))
  }, [restaurant, days, focus, files, telegram, chat, account])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2800)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') setModal(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function notify(message) { setToast(message) }

  function patchDay(dayNumber, patch) {
    setDays((current) => current.map((item) => (item.day === dayNumber ? { ...item, ...patch } : item)))
  }

  function approve(dayNumber) {
    patchDay(dayNumber, { status: 'approved' })
    setFocus(dayNumber)
    notify(`День ${dayNumber} утверждён на этом устройстве.`)
  }

  function rebuildDay(dayNumber, trend) {
    const item = days.find((entry) => entry.day === dayNumber)
    if (!item) return
    const picked = trend?.post ? trend : nextTrend(item.trendId)
    patchDay(dayNumber, applyTrend(item, picked))
    setFocus(dayNumber)
    notify(`День ${dayNumber} пересобран: «${picked.name}».`)
  }

  function rebuildAll() {
    setDays((current) => current.map((item) => ({ ...item, ...applyTrend(item, nextTrend(item.trendId)) })))
    notify('Все задания сдвинуты на следующий приём из трендов.')
  }

  function openChannel(kind, item) {
    setFocus(item.day)
    setModal(kind)
  }

  function replaceDay(dayNumber) {
    const current = days.find((item) => item.day === dayNumber)
    if (!current) return
    patchDay(dayNumber, variantFor(current))
    setFocus(dayNumber)
    notify(`День ${dayNumber} переписан запасным сценарием.`)
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
    const body = days.map((item) => [item.day, item.title, item.pillar, item.status, item.dish, item.postText]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'kedr-30-posts.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  function addFiles(event) {
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

  return (
    <div className="min-h-screen">
      <TopBar restaurant={restaurant} onRestaurant={setRestaurant} onAudit={() => { setAuditResult(''); setModal('audit') }} onAuth={() => setModal('auth')} account={account} />
      <main className="relative z-10 mx-auto max-w-[1440px] space-y-7 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <HeroBoard
          place={place}
          day={day}
          approved={day.status === 'approved'}
          onPillar={(next) => { setPillar(next); setTab('plan-30') }}
          onOpenAi={() => setTab('plan-30')}
          onApprove={() => approve(day.day)}
          onReplace={() => rebuildDay(day.day)}
          onInstagram={() => setModal('instagram')}
          onTelegram={() => setModal('telegram')}
          onProject={() => setModal('project')}
          onMatch={() => rebuildDay(day.day)}
        />
        <ModuleNav tab={tab} onTab={setTab} />
        {tab === 'plan-30' && (
          <PlanView
            days={days}
            status={status}
            pillar={pillar}
            onStatus={setStatus}
            onPillar={setPillar}
            trends={trends}
            boards={trendBoards}
            onApproveAll={() => { setDays((current) => current.map((item) => ({ ...item, status: 'approved' }))); notify('Все 30 дней утверждены на этом устройстве.') }}
            onRebuild={rebuildAll}
            onOpen={(item) => { setFocus(item.day); setModal('day') }}
            onApprove={approve}
            onTelegram={(item) => openChannel('telegram', item)}
            onInstagram={(item) => openChannel('instagram', item)}
            onProject={(item) => openChannel('project', item)}
            onMatch={(trend) => rebuildDay(focus, trend)}
            onReplace={rebuildDay}
          />
        )}
        {tab === 'posts-30' && <PostsView days={days} onCopy={async (text) => { await navigator.clipboard.writeText(text); notify('Текст поста скопирован.') }} onExport={exportCsv} />}
        {tab === 'reels-30' && <ReelsView days={days} />}
        {tab === 'themes-30' && <ThemesView days={days} />}
        {tab === 'video-ai' && (
          <VideoView
            url={url}
            setUrl={setUrl}
            presets={videoPresets}
            busy={busy}
            result={result}
            news={news}
            onAnalyze={analyze}
            onTake={(item) => { patchDay(day.day, applyNews(day, item)); notify(`${item.source} поставлен на день ${day.day}.`) }}
            onRefresh={() => setNews((current) => [...current].reverse())}
            onApply={() => { setDays((current) => current.map((item) => ([4, 9, 17].includes(item.day) ? { ...item, reelAudio: 'Склейка ~0.8 сек и треск дров' } : item))); setTab('plan-30'); notify('Паттерн огня записан в дни 4, 9 и 17.') }}
          />
        )}
        {tab === 'files-tg' && (
          <FilesView
            files={files}
            telegram={telegram}
            onUpload={addFiles}
            onAddTelegram={(handle, role) => {
              if (!handle.trim()) return
              setTelegram((current) => [...current, { handle: handle.trim(), role, status: 'Отмечен в кабинете' }])
              notify('Аккаунт добавлен в список кабинета.')
            }}
            onDigest={() => notify('Сводка отмечена. Утренний бот появится вместе с Telegram API.')}
          />
        )}
        {tab === 'insta-analytics' && <InstaView period={period} setPeriod={setPeriod} onSync={() => notify('Цифры макета на месте. Живые охваты — фаза Meta.')} />}
        {tab === 'github-tz' && (
          <TeamView
            messages={chat}
            onInvite={() => setModal('auth')}
            onSend={(sender, text) => {
              if (!text.trim()) return
              const badge = sender === 'Copilot' ? 'AI' : 'Команда'
              setChat((current) => [...current, { sender, time: stamp(), text: text.trim(), badge }])
            }}
          />
        )}
      </main>

      <ReleaseCorner days={days} focus={focus} onPick={(item) => { setFocus(item.day); setTab('posts-30') }} />
      {toast && <div className="fixed left-1/2 top-20 z-[120] -translate-x-1/2 rounded-full border border-gold/40 bg-obsidian/95 px-4 py-2 text-sm text-gold shadow-2xl">{toast}</div>}

      {(modal === 'instagram' || modal === 'telegram') && (
        <Modal title={modal === 'instagram' ? 'Очередь Instagram' : 'Очередь Telegram'} onClose={() => setModal(null)}>
          <p className="mb-3 text-sm text-slate-300">
            {formatLong(dateForDay(day.day))} · день {day.day} · {modal === 'instagram' ? 'Reels в 18:00' : 'пост в 13:30'}
          </p>
          <p className="mb-4 whitespace-pre-wrap text-lg leading-relaxed text-white">{modal === 'instagram' ? `${day.postText}\n\n${day.reelHook}` : day.postText}</p>
          <Button3D className="w-full" onClick={async () => {
            const text = modal === 'instagram' ? `${day.postText}\n\n${day.reelHook}` : day.postText
            await navigator.clipboard.writeText(text)
            window.open(modal === 'instagram' ? 'https://www.instagram.com/' : 'https://web.telegram.org/', '_blank', 'noopener')
            notify(modal === 'instagram' ? 'Текст скопирован, Instagram открыт. Выход Reels — 18:00.' : 'Текст скопирован, Telegram открыт. Выход поста — 13:30.')
          }}>{modal === 'instagram' ? 'Скопировать и открыть Instagram' : 'Скопировать и открыть Telegram'}</Button3D>
        </Modal>
      )}

      {modal === 'project' && (
        <Modal title="Новый проект на этот день" onClose={() => setModal(null)}>
          <form className="space-y-3" onSubmit={(event) => {
            event.preventDefault()
            if (!projectDraft.title.trim()) return
            patchDay(day.day, { projectTitle: projectDraft.title.trim(), projectChannel: projectDraft.channel, projectNote: projectDraft.note.trim() })
            setModal(null)
            setProjectDraft({ title: '', channel: 'Съёмка', note: '' })
            notify(`Проект привязан к дню ${day.day}.`)
          }}>
            <p className="text-sm text-slate-300">{formatLong(dateForDay(day.day))} · {day.title}</p>
            <input required value={projectDraft.title} onChange={(event) => setProjectDraft({ ...projectDraft, title: event.target.value })} placeholder="Название" className="w-full rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-sm text-white focus:border-gold focus:outline-none" />
            <select value={projectDraft.channel} onChange={(event) => setProjectDraft({ ...projectDraft, channel: event.target.value })} className="w-full rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-sm text-white">
              <option>Съёмка</option>
              <option>Банкет</option>
              <option>Меню</option>
              <option>Спецпроект</option>
            </select>
            <textarea value={projectDraft.note} onChange={(event) => setProjectDraft({ ...projectDraft, note: event.target.value })} rows={3} placeholder="Что сделать" className="w-full rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-sm text-white focus:border-gold focus:outline-none" />
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
          <p className="mb-3 text-sm text-slate-300">Ссылка сохраняется как объект. Разбор сайта без внешнего API: короткий конспект по адресу.</p>
          <input value={auditUrl} onChange={(event) => setAuditUrl(event.target.value)} className="mb-3 w-full rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-sm text-white focus:border-gold focus:outline-none" />
          <Button3D disabled={auditBusy} onClick={() => {
            setAuditBusy(true)
            window.setTimeout(() => {
              setAuditResult(`Адрес ${auditUrl || 'без ссылки'}: тёмный зал, живой огонь и кухня севера. Для кабинета берём тон KEDR — без капса и без детских смайлов. Меню и цены с сайта не выдумываем.`)
              setAuditBusy(false)
            }, 1200)
          }}>{auditBusy ? 'Смотрим адрес…' : 'Собрать конспект'}</Button3D>
          {auditResult && <p className="mt-4 text-sm leading-relaxed text-slate-200">{auditResult}</p>}
        </Modal>
      )}

      {modal === 'auth' && (
        <Modal title="Аккаунт на этом устройстве" icon={<UserRound className="text-gold" size={18} />} onClose={() => setModal(null)}>
          <form className="space-y-3" onSubmit={(event) => {
            event.preventDefault()
            if (!draftAccount.name.trim() || !draftAccount.email.trim()) return
            setAccount(draftAccount)
            setModal(null)
            notify('Аккаунт записан в браузере. Почта и вход команды — следующая фаза.')
          }}>
            <input required placeholder="Имя" value={draftAccount.name} onChange={(event) => setDraftAccount({ ...draftAccount, name: event.target.value })} className="w-full rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-sm text-white focus:border-gold focus:outline-none" />
            <input required type="email" placeholder="Почта" value={draftAccount.email} onChange={(event) => setDraftAccount({ ...draftAccount, email: event.target.value })} className="w-full rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-sm text-white focus:border-gold focus:outline-none" />
            <select value={draftAccount.role} onChange={(event) => setDraftAccount({ ...draftAccount, role: event.target.value })} className="w-full rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-sm text-white">
              <option>Директор</option>
              <option>Маркетолог</option>
              <option>SMM</option>
              <option>Шеф</option>
            </select>
            <Button3D type="submit" className="w-full">Сохранить аккаунт</Button3D>
          </form>
        </Modal>
      )}
    </div>
  )
}
