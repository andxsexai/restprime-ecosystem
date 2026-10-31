import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Download, ExternalLink, RefreshCw, Send, Sparkles, Upload } from 'lucide-react'
import { FLAGSHIP } from '../data/place.js'
import { shownPost, wordCount } from '../lib/compose.js'
import { roleLabel } from '../lib/auth.js'
import Button3D from './ui/Button3D.jsx'
import GlassCard from './ui/GlassCard.jsx'

const TASKS = ['all', 'Быт', 'Гости', 'Зал', 'Меню', 'Напиток', 'Повод']
const TASK_LABEL = { all: 'Все задания', Быт: 'Быт', Гости: 'Гости', Зал: 'Зал', Меню: 'Из меню', Напиток: 'Напиток', Повод: 'Повод' }

export function PlanView({ days, status, pillar, onStatus, onPillar, onApproveAll, onRebuild, onOpen, onApprove, onTelegram, onInstagram, onProject, onMatch, onReplace, onForward, trends, boards, canAct }) {
  const visible = days.filter((day) => (status === 'all' || day.status === status) && (pillar === 'all' || day.pillar === pillar))
  return (
    <section className="space-y-5">
      <GlassCard className="space-y-4 rounded-[28px] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-fraunces text-3xl text-ink">Задания на 30 дней</h2>
            <p className="text-sm text-ink/75">Сначала сцена жизни, блюдо только если оно есть в меню от 23 октября.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button3D tone="kedr" className="px-3.5 py-2 text-xs" disabled={!canAct} onClick={onApproveAll}><Check size={14} />Утвердить все</Button3D>
            <Button3D className="px-3.5 py-2 text-xs" disabled={!canAct} onClick={onRebuild}><Sparkles size={14} />Переделать все под тренды</Button3D>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TASKS.map((task) => (
            <button key={task} type="button" onClick={() => onPillar(task)} className={`shrink-0 rounded-full px-4 py-2 text-sm ${pillar === task ? 'bg-[#2f6b4f] text-white' : 'bg-paper text-ink/75'}`}>
              {TASK_LABEL[task]}
            </button>
          ))}
        </div>
        <div className="flex rounded-full border border-ink/10 bg-card p-1 text-xs w-fit">
          {[['all', 'Все'], ['approved', 'Готово'], ['review', 'Черновик']].map(([id, label]) => (
            <button key={id} type="button" onClick={() => onStatus(id)} className={`rounded-full px-3 py-1.5 ${status === id ? 'bg-[#2f6b4f] font-semibold text-white' : 'text-ink/75'}`}>{label}</button>
          ))}
        </div>
        {boards?.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {boards.map((board) => (
              <a key={board.url} href={board.url} target="_blank" rel="noreferrer" className="rounded-2xl border border-ink/10 bg-paper p-4 hover:border-[#c4a574]/50">
                <span className="text-xs uppercase tracking-[0.16em] text-[#2f6b4f]">Смотреть снаружи</span>
                <span className="mt-1 block font-fraunces text-2xl text-ink">{board.name}</span>
                <span className="mt-1 block text-sm text-ink/75">{board.note}</span>
              </a>
            ))}
          </div>
        )}
        {trends?.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {trends.map((trend) => (
              <button key={trend.id} type="button" disabled={!canAct} onClick={() => onMatch(trend)} className="shrink-0 rounded-2xl border border-ink/10 bg-card px-3 py-2 text-left text-xs text-ink/75 disabled:cursor-not-allowed disabled:opacity-40">
                <span className="block font-semibold text-ink">{trend.name}</span>
                <span className="text-ink/50">{trend.source}</span>
              </button>
            ))}
          </div>
        )}
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((day) => (
          <GlassCard key={day.day} className="relative rounded-2xl p-4">
            <button type="button" className="w-full text-left" onClick={() => onOpen(day)}>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-fraunces text-2xl text-[#2f6b4f]">{String(day.day).padStart(2, '0')}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${day.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {day.status === 'approved' ? 'Утверждено' : 'На проверке'}
                </span>
              </div>
              <h3 className="text-base font-semibold leading-snug text-ink">{day.title}</h3>
              <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/75">{shownPost(day)}</p>
              <p className="mt-2 text-xs text-ink/50">{day.pillar} · {day.scene}</p>
              <p className="mt-1 text-xs text-[#2f6b4f]">{day.dish} · {day.margin}</p>
            </button>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={!canAct} onClick={() => onApprove(day.day)} className="rounded-full bg-[#2f6b4f] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40">Утвердить</button>
              <button type="button" disabled={!canAct} onClick={() => onReplace(day.day)} className="rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink disabled:opacity-40">Переделать</button>
              <button type="button" disabled={!canAct} onClick={() => onForward(day, 'post')} className="rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink disabled:opacity-40">В чат</button>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}

export function PostsView({ days, onCopy, onExport }) {
  const [query, setQuery] = useState('')
  const visible = days.filter((day) => `${day.title} ${day.dish} ${shownPost(day)}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <section className="space-y-5">
      <GlassCard className="flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <div>
          <h2 className="font-fraunces text-2xl text-ink">Посты на 30 дней</h2>
          <p className="text-sm text-ink/50">Сначала ситуация гостя, потом блюдо из меню, в конце одна ссылка на бронь.</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по блюду или теме" className="rounded-xl border border-ink/10 bg-card px-3.5 py-2 text-xs text-ink focus:border-[#2f6b4f] focus:outline-none" />
          <Button3D tone="ghost" className="border-[#2f6b4f]/30 px-3.5 py-2 text-xs text-[#2f6b4f]" onClick={onExport}><Download size={14} />Скачать CSV</Button3D>
        </div>
      </GlassCard>
      <div className="grid gap-4 lg:grid-cols-2">
        {visible.map((day) => (
          <GlassCard key={day.day} className="rounded-2xl p-5">
            <div className="mb-2 flex items-center justify-between text-xs text-ink/50">
              <span>День {day.day} • {day.pillar}</span>
              <button type="button" onClick={() => onCopy(shownPost(day))} className="press inline-flex items-center gap-1 text-[#2f6b4f]"><Copy size={13} />Копировать</button>
            </div>
            <h3 className="font-fraunces text-3xl text-ink">{day.title}</h3>
            <p className="mt-1 text-xs text-[#2f6b4f]">{(day.format === 'wide' ? 'Широкий' : 'Короткий')} · {wordCount(shownPost(day))} слов</p>
            <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-ink/75">{shownPost(day)}</p>
            <p className="mt-3 text-base text-[#2f6b4f]">{day.reelHook}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}

export function ReelsView({ days }) {
  return (
    <section className="space-y-5">
      <GlassCard className="flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <div>
          <h2 className="font-fraunces text-2xl text-ink">Reels и Shorts: 30 сценариев</h2>
          <p className="text-xs text-ink/50">Хук первых секунд, раскадровка, звук и привязка к блюду.</p>
        </div>
        <span className="rounded-xl border border-pink-400/30 bg-pink-500/15 px-3 py-1.5 text-xs font-semibold text-pink-300">ASMR, честная кухня, голос шефа</span>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {days.map((day) => (
          <GlassCard key={day.day} className="rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-widest text-pink-300">День {day.day}</p>
            <h3 className="mt-1 text-sm font-semibold text-ink">{day.title}</h3>
            <p className="mt-3 text-xs text-[#2f6b4f]">{day.reelHook}</p>
            <p className="mt-2 text-xs leading-relaxed text-ink/75">{day.reelScript}</p>
            <p className="mt-3 text-[11px] text-ink/50">Звук: {day.reelAudio}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}

export function ThemesView({ days }) {
  return (
    <section className="space-y-5">
      <GlassCard className="rounded-2xl p-5">
        <h2 className="font-fraunces text-2xl text-ink">Темы и воронка прогревов на 30 дней</h2>
        <p className="text-sm text-ink/75">Быт, гости, зал, меню и повод. Блюда только из карты KEDR.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TASKS.filter((task) => task !== 'all').map((task) => (
            <span key={task} className="rounded-full border border-ink/10 px-3 py-1 text-[11px] text-ink/75">{TASK_LABEL[task]}: {days.filter((day) => day.pillar === task).length}</span>
          ))}
        </div>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {days.map((day) => (
          <GlassCard key={day.day} className="rounded-2xl p-4">
            <p className="text-[11px] text-amber-300">День {day.day} • {day.pillar}</p>
            <h3 className="mt-1 text-sm font-semibold text-ink">{day.warmupTheme}</h3>
            <p className="mt-2 text-xs text-ink/75">{day.dish}</p>
            <p className="mt-3 text-xs text-emerald-300">{day.kpi}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}

export function VideoView({ url, setUrl, presets, onAnalyze, busy, result, news, onRefresh, onApply, onTake, canAct }) {
  return (
    <section className="grid gap-6 lg:grid-cols-12">
      <GlassCard className="space-y-5 rounded-3xl p-6 lg:col-span-7">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-purple-400/40 bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300">AI Deconstructor 2026</span>
          <span className="text-xs text-ink/50">Reels / TikTok / Shorts</span>
        </div>
        <h2 className="font-fraunces text-2xl text-ink sm:text-3xl">Разбор фуд-ролика и адаптация под <span className="text-[#2f6b4f]">KEDR</span></h2>
        <p className="text-sm text-ink/75">Вставьте ссылку или выберите пример. Ответ собирается на этом экране, без внешнего API.</p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input value={url} onChange={(event) => setUrl(event.target.value)} className="flex-1 rounded-xl border border-ink/10 bg-card px-4 py-3 text-sm text-ink focus:border-[#2f6b4f] focus:outline-none" />
          <Button3D onClick={onAnalyze} disabled={busy}>{busy ? 'Смотрим ролик…' : 'Разобрать'}</Button3D>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, index) => (
            <button key={preset.url} type="button" onClick={() => { setUrl(preset.url); onAnalyze(preset) }} className="rounded-lg border border-ink/10 bg-paper px-3 py-1 text-xs text-ink/75 hover:bg-paper">
              {index === 0 ? '2.4M: дымный клош' : index === 1 ? '1.8M: хвоя и настойки' : '950K: не заказывайте, если…'}
            </button>
          ))}
        </div>
        {result && (
          <div className="space-y-3 rounded-2xl border border-[#2f6b4f]/30 bg-card p-5 text-sm">
            <h3 className="font-fraunces text-xl text-ink">{result.title}</h3>
            <p><span className="text-[#2f6b4f]">Хук. </span>{result.hookAnalysis}</p>
            <p><span className="text-[#2f6b4f]">Ритм. </span>{result.pacing}</p>
            <p><span className="text-[#2f6b4f]">Звук. </span>{result.audioTrigger}</p>
            <p><span className="text-[#2f6b4f]">Под KEDR. </span>{result.kedrAdaptation}</p>
          </div>
        )}
      </GlassCard>
      <GlassCard className="flex flex-col justify-between space-y-4 rounded-3xl p-6 lg:col-span-5">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2f6b4f]">Радар фуд-маркетинга</span>
            <button type="button" onClick={onRefresh} className="inline-flex items-center gap-1 text-xs text-ink/50 hover:text-[#2f6b4f]"><RefreshCw size={13} />Обновить</button>
          </div>
          <h3 className="font-fraunces mb-4 text-2xl text-ink">Что работает в ресторанах сейчас</h3>
          <div className="space-y-3">
            {news.map((item) => (
              <div key={item.id || item.title} className="rounded-2xl border border-ink/10 bg-card p-3">
                <p className="text-[11px] text-[#2f6b4f]">{item.dateLabel || item.tag} · {item.source || item.time}</p>
                <p className="mt-1 text-base text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-ink/75">{item.watch || item.action}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-obsidian">Открыть источник</a>}
                  {onTake && <button type="button" disabled={!canAct} onClick={() => onTake(item)} className="rounded-lg border border-[#2f6b4f]/30 px-3 py-1.5 text-xs font-semibold text-[#2f6b4f] disabled:cursor-not-allowed disabled:opacity-40">Поставить на этот день</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-kedr/30 p-4 text-xs text-emerald-200">
          <p className="mb-1 font-bold text-ink">Совет агента</p>
          Ролики со склейкой около секунды и живым звуком дров держат сохранения лучше студийной музыки. Включить паттерн в дни 4, 9 и 17?
          <Button3D className="mt-2.5 w-full" disabled={!canAct} onClick={onApply}>Внедрить в план</Button3D>
        </div>
      </GlassCard>
    </section>
  )
}

export function FilesView({ files, onUpload, telegram, onAddTelegram, onDigest, canAct }) {
  const [handle, setHandle] = useState('')
  const [role, setRole] = useState('Канал гостей')
  return (
    <section className="grid gap-6 lg:grid-cols-12">
      <GlassCard className="space-y-5 rounded-3xl p-6 lg:col-span-7">
        <div className="flex items-center justify-between">
          <h2 className="font-fraunces text-2xl text-ink">База знаний ресторана</h2>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">Список на этом устройстве</span>
        </div>
        <p className="text-sm text-ink/75">Word, Excel и PDF остаются в списке кабинета. Разбор содержимого подключится вместе с хранилищем.</p>
        <label className={`block rounded-2xl border-2 border-dashed border-[#2f6b4f]/30 bg-card p-6 text-center ${canAct ? 'cursor-pointer hover:border-gold' : 'cursor-not-allowed opacity-40'}`}>
          <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" className="hidden" disabled={!canAct} onChange={onUpload} />
          <Upload className="mx-auto mb-3 text-[#2f6b4f]" />
          <div className="text-sm font-semibold text-ink">Перетащите файлы или выберите с компьютера</div>
          <div className="mt-1 text-xs text-ink/50">.docx, .xlsx, .csv, .pdf</div>
        </label>
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.name} className="rounded-2xl border border-ink/10 bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink">{file.name}</p>
                <span className="text-[11px] text-[#2f6b4f]">{file.type} • {file.size}</span>
              </div>
              <p className="mt-2 text-xs text-ink/75">{file.insight}</p>
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard className="flex flex-col justify-between space-y-5 rounded-3xl p-6 lg:col-span-5">
        <div className="space-y-4">
          <h3 className="font-fraunces text-2xl text-ink">Telegram-аккаунты</h3>
          <p className="text-xs text-ink/75">Канал гостей, бот директора и чат кухни. Отправка пока отмечается в кабинете, без Bot API.</p>
          <div className="space-y-2.5">
            {telegram.map((item) => (
              <div key={item.handle} className="rounded-2xl border border-ink/10 bg-card p-3 text-xs">
                <p className="font-semibold text-ink">{item.handle}</p>
                <p className="text-ink/50">{item.role}</p>
                <p className="text-emerald-300">{item.status}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3 rounded-2xl border border-ink/10 bg-card p-4">
            <div className="flex gap-2">
              <input value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="@kedr_vip_club" className="flex-1 rounded-xl border border-ink/10 bg-card px-3 py-2 text-xs text-ink focus:border-[#2f6b4f] focus:outline-none" />
              <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-xl border border-ink/10 bg-card px-2 text-xs text-ink/75">
                <option>Канал гостей</option>
                <option>Бот директора</option>
                <option>Чат кухни/SMM</option>
              </select>
            </div>
            <Button3D tone="ghost" className="w-full border-sky-400/40 text-xs text-sky-300" disabled={!canAct} onClick={() => { onAddTelegram(handle, role); setHandle('') }}>Привязать аккаунт</Button3D>
          </div>
        </div>
        <Button3D className="w-full bg-gradient-to-r from-matcha to-kedr text-white" disabled={!canAct} onClick={onDigest}><Send size={14} />Отметить тестовую сводку директору</Button3D>
      </GlassCard>
    </section>
  )
}

export function InstaView({ days, canAct, onOpen, onQueue }) {
  return (
    <section className="space-y-5">
      <div className="metal-slide flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#2f6b4f]">Профиль с сайта kedr-res.ru</p>
          <h2 className="font-fraunces text-3xl text-ink">{FLAGSHIP.instagramHandle}</h2>
          <p className="mt-1 text-sm text-ink/75">Профиль KEDR с сайта. Текст копируется здесь и открывается в Instagram.</p>
        </div>
        <a href={FLAGSHIP.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#2f6b4f] px-4 py-2.5 text-sm font-semibold text-white">
          <ExternalLink size={14} />
          Открыть Instagram
        </a>
      </div>
      <div className="grid gap-3">
        {days.map((day) => (
          <GlassCard key={day.day} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
            <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onOpen(day)}>
              <p className="text-xs text-[#2f6b4f]">День {day.day} · {day.status === 'approved' ? 'утверждено' : 'черновик'}</p>
              <p className="mt-1 text-base font-semibold text-ink">{day.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-ink/75">{day.reelHook}</p>
            </button>
            <button type="button" disabled={!canAct} onClick={() => onQueue(day)} className="rounded-xl bg-pink-500/20 px-3 py-2 text-xs font-semibold text-pink-100 disabled:cursor-not-allowed disabled:opacity-40">
              В профиль
            </button>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}

export function TeamView({ messages, members, approved, canAct, onSend, onForward }) {
  const [text, setText] = useState('')
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }) }, [messages])
  return (
    <section className="grid gap-5 lg:grid-cols-12">
      <GlassCard className="flex min-h-[640px] flex-col rounded-3xl p-5 lg:col-span-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-fraunces text-3xl text-ink">Комната команды</h2>
            <p className="text-sm text-ink/75">Обсуждение дней. Утверждённый пост или тему можно переслать одним нажатием.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {members.map((member) => (
              <span key={member.id} className="rounded-full border border-ink/10 bg-paper px-3 py-1 text-xs text-ink/75">
                {member.name} · {roleLabel(member.role)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((message) => (
            <article key={message.id || `${message.time}-${message.sender}`} className="rounded-2xl border border-ink/10 bg-card p-4">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-[#2f6b4f]">{message.sender}{message.role ? ` · ${message.role}` : ''}</span>
                <span className="text-ink/50">{message.time}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-ink">{message.text}</p>
              {message.attachment && (
                <div className="mt-3 rounded-xl border border-ink/10 bg-paper p-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#2f6b4f]">
                    {message.attachment.kind === 'theme' ? 'Тема' : 'Пост'} · день {message.attachment.day}
                  </p>
                  <p className="mt-1 font-semibold text-ink">{message.attachment.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink/75">{message.attachment.body}</p>
                </div>
              )}
            </article>
          ))}
          <div ref={endRef} />
        </div>
        {canAct ? (
          <form className="mt-4 flex gap-2 border-t border-ink/10 pt-4" onSubmit={(event) => { event.preventDefault(); onSend(text); setText('') }}>
            <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Написать команде" className="flex-1 rounded-xl border border-ink/10 bg-card px-3 py-3 text-sm text-ink focus:border-[#2f6b4f] focus:outline-none" />
            <button type="submit" className="rounded-xl bg-[#2f6b4f] px-4 text-sm font-semibold text-white" aria-label="Отправить"><Send size={16} /></button>
          </form>
        ) : (
          <p className="mt-4 border-t border-ink/10 pt-4 text-sm text-ink/75">Чат открыт для чтения. Писать можно после входа и подтверждения разработчиком.</p>
        )}
      </GlassCard>
      <GlassCard className="rounded-3xl p-5 lg:col-span-4">
        <h3 className="font-fraunces text-2xl text-ink">Переслать в чат</h3>
        <p className="mt-1 text-sm text-ink/75">Только дни, которые уже утвердили.</p>
        <div className="mt-4 max-h-[560px] space-y-3 overflow-y-auto pr-1">
          {approved.length === 0 && <p className="text-sm text-ink/50">Пока пусто. Утвердите день в плане — он появится здесь.</p>}
          {approved.map((day) => (
            <div key={day.day} className="rounded-2xl border border-ink/10 bg-card p-3">
              <p className="text-xs text-[#2f6b4f]">День {day.day}</p>
              <p className="mt-1 font-semibold text-ink">{day.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-ink/75">{shownPost(day)}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" disabled={!canAct} onClick={() => onForward(day, 'post')} className="rounded-full bg-[#2f6b4f] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40">Пост</button>
                <button type="button" disabled={!canAct} onClick={() => onForward(day, 'theme')} className="rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink disabled:opacity-40">Тема</button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  )
}

export function DayModalBody({ day, onCopy }) {
  return (
    <div className="space-y-3 text-base leading-relaxed text-ink/75">
      <p className="text-sm text-[#2f6b4f]">{day.pillar} • {day.dish} • {day.margin}</p>
      <p className="whitespace-pre-wrap text-base leading-relaxed text-ink/80">{shownPost(day)}</p>
      <p className="text-xs text-ink/75"><span className="text-[#2f6b4f]">Хук. </span>{day.reelHook}</p>
      <p className="text-xs text-ink/75"><span className="text-[#2f6b4f]">Сценарий. </span>{day.reelScript}</p>
      <p className="text-xs text-ink/50">Звук: {day.reelAudio}</p>
      <p className="text-xs text-emerald-300">{day.warmupTheme} • {day.kpi}</p>
      <Button3D tone="ghost" className="text-xs" onClick={() => onCopy(shownPost(day))}><Copy size={14} />Скопировать пост</Button3D>
    </div>
  )
}
