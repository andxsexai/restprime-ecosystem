import { useState } from 'react'
import { Check, Copy, Download, RefreshCw, Send, Sparkles, Upload } from 'lucide-react'
import Button3D from './ui/Button3D.jsx'
import GlassCard from './ui/GlassCard.jsx'

const PILLARS = ['Высокая маржа', 'Бар и Настойки', 'Атмосфера и Огонь', 'Шеф и Продукт']

export function PlanView({ days, status, pillar, onStatus, onApproveAll, onRebuild, onOpen, onApprove, onTelegram, onInstagram, onProject, onMatch, onReplace }) {
  const visible = days.filter((day) => (status === 'all' || day.status === status) && (pillar === 'all' || day.pillar === pillar))
  return (
    <section className="space-y-5">
      <GlassCard className="flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4 sm:p-5">
        <div>
          <h2 className="font-fraunces text-2xl text-white">Матрица директора: контент-план на 30 дней</h2>
          <p className="text-xs text-slate-400">Наведите на карточку или нажмите её — откроются сценарий, отправка и утверждение.</p>
          {pillar !== 'all' && <p className="mt-1 text-xs text-gold">Фильтр столпа: {pillar}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-white/10 bg-obsidian/80 p-1 text-xs">
            {[['all', 'Все (30)'], ['approved', 'Утверждено'], ['review', 'На проверке']].map(([id, label]) => (
              <button key={id} type="button" onClick={() => onStatus(id)} className={`rounded-lg px-3 py-1.5 ${status === id ? 'bg-kedr font-semibold text-white' : 'text-slate-300'}`}>{label}</button>
            ))}
          </div>
          <Button3D tone="kedr" className="px-3.5 py-2 text-xs" onClick={onApproveAll}><Check size={14} />Утвердить все 30 дней</Button3D>
          <Button3D tone="ghost" className="border-gold/40 px-3.5 py-2 text-xs text-gold" onClick={onRebuild}><Sparkles size={14} />Пересобрать месяц под тренды</Button3D>
        </div>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((day) => (
          <GlassCard key={day.day} className="relative rounded-2xl p-4">
            <span className="absolute right-3 top-3 text-right text-[10px] leading-tight">
              <span className="block text-gold">Пост 13:30</span>
              <span className="block text-pink-300">Reels 18:00</span>
            </span>
            <button type="button" className="w-full pr-16 text-left" onClick={() => onOpen(day)}>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-fraunces text-2xl text-gold">{String(day.day).padStart(2, '0')}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${day.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {day.status === 'approved' ? 'Утверждено' : 'На проверке'}
                </span>
              </div>
              <h3 className="text-base font-semibold leading-snug text-white">{day.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-200">{day.postText}</p>
              <p className="mt-2 text-xs text-slate-400">{day.pillar} • маржа {day.margin}{day.formatName ? ` • ${day.formatName}` : ''}</p>
            </button>
            <div className="hidden-3d-dock grid grid-cols-3 gap-2">
              <Mini onClick={() => onApprove(day.day)}>Утвердить</Mini>
              <Mini onClick={() => onOpen(day)}>Сценарий</Mini>
              <Mini onClick={() => onTelegram(day)}>В Telegram</Mini>
              <Mini onClick={() => onInstagram(day)}>В Instagram</Mini>
              <Mini onClick={() => onProject(day)}>Проект</Mini>
              <Mini onClick={() => onMatch(day.day)}>Формат</Mini>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}

function Mini({ children, onClick }) {
  return <button type="button" onClick={onClick} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-[11px] font-semibold text-gold hover:bg-white/10">{children}</button>
}

export function PostsView({ days, onCopy, onExport }) {
  const [query, setQuery] = useState('')
  const visible = days.filter((day) => `${day.title} ${day.dish} ${day.postText}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <section className="space-y-5">
      <GlassCard className="flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <div>
          <h2 className="font-fraunces text-2xl text-white">Посты на 30 дней</h2>
          <p className="text-xs text-slate-400">Тексты для Telegram, VK и Instagram в тоне взрослой гастрономии KEDR.</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по блюду или теме" className="rounded-xl border border-white/15 bg-obsidian/90 px-3.5 py-2 text-xs text-white focus:border-gold focus:outline-none" />
          <Button3D tone="ghost" className="border-gold/30 px-3.5 py-2 text-xs text-gold" onClick={onExport}><Download size={14} />Скачать CSV</Button3D>
        </div>
      </GlassCard>
      <div className="grid gap-4 lg:grid-cols-2">
        {visible.map((day) => (
          <GlassCard key={day.day} className="rounded-2xl p-5">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>День {day.day} • {day.pillar}</span>
              <button type="button" onClick={() => onCopy(day.postText)} className="inline-flex items-center gap-1 text-gold"><Copy size={13} />Копировать</button>
            </div>
            <h3 className="font-fraunces text-3xl text-white">{day.title}</h3>
            <p className="mt-1 text-xs text-gold">Пост выходит в 13:30 · Reels в 18:00</p>
            <p className="mt-4 text-lg leading-relaxed text-slate-100">{day.postText}</p>
            <p className="mt-3 text-base text-gold">{day.reelHook}</p>
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
          <h2 className="font-fraunces text-2xl text-white">Reels и Shorts: 30 сценариев</h2>
          <p className="text-xs text-slate-400">Хук первых секунд, раскадровка, звук и привязка к блюду.</p>
        </div>
        <span className="rounded-xl border border-pink-400/30 bg-pink-500/15 px-3 py-1.5 text-xs font-semibold text-pink-300">ASMR, честная кухня, голос шефа</span>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {days.map((day) => (
          <GlassCard key={day.day} className="rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-widest text-pink-300">День {day.day}</p>
            <h3 className="mt-1 text-sm font-semibold text-white">{day.title}</h3>
            <p className="mt-3 text-xs text-gold">{day.reelHook}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">{day.reelScript}</p>
            <p className="mt-3 text-[11px] text-slate-400">Звук: {day.reelAudio}</p>
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
        <h2 className="font-fraunces text-2xl text-white">Темы и воронка прогревов на 30 дней</h2>
        <p className="text-xs text-slate-400">Высокая маржа, бар, атмосфера огня и голос шефа — по столпам из плана KEDR.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PILLARS.map((pillar) => (
            <span key={pillar} className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-slate-300">{pillar}: {days.filter((day) => day.pillar === pillar).length}</span>
          ))}
        </div>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {days.map((day) => (
          <GlassCard key={day.day} className="rounded-2xl p-4">
            <p className="text-[11px] text-amber-300">День {day.day} • {day.pillar}</p>
            <h3 className="mt-1 text-sm font-semibold text-white">{day.warmupTheme}</h3>
            <p className="mt-2 text-xs text-slate-300">{day.dish}</p>
            <p className="mt-3 text-xs text-emerald-300">{day.kpi}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}

export function VideoView({ url, setUrl, presets, onAnalyze, busy, result, news, onRefresh, onApply, onTake }) {
  return (
    <section className="grid gap-6 lg:grid-cols-12">
      <GlassCard className="space-y-5 rounded-3xl p-6 lg:col-span-7">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-purple-400/40 bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300">AI Deconstructor 2026</span>
          <span className="text-xs text-slate-400">Reels / TikTok / Shorts</span>
        </div>
        <h2 className="font-fraunces text-2xl text-white sm:text-3xl">Разбор фуд-ролика и адаптация под <span className="text-gold">KEDR</span></h2>
        <p className="text-sm text-slate-300">Вставьте ссылку или выберите пример. Ответ собирается на этом экране, без внешнего API.</p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input value={url} onChange={(event) => setUrl(event.target.value)} className="flex-1 rounded-xl border border-white/15 bg-obsidian/90 px-4 py-3 text-sm text-white focus:border-gold focus:outline-none" />
          <Button3D onClick={onAnalyze} disabled={busy}>{busy ? 'Смотрим ролик…' : 'Разобрать'}</Button3D>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, index) => (
            <button key={preset.url} type="button" onClick={() => { setUrl(preset.url); onAnalyze(preset) }} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 hover:bg-white/15">
              {index === 0 ? '2.4M: дымный клош' : index === 1 ? '1.8M: хвоя и настойки' : '950K: не заказывайте, если…'}
            </button>
          ))}
        </div>
        {result && (
          <div className="space-y-3 rounded-2xl border border-gold/30 bg-obsidian/80 p-5 text-sm">
            <h3 className="font-fraunces text-xl text-white">{result.title}</h3>
            <p><span className="text-gold">Хук. </span>{result.hookAnalysis}</p>
            <p><span className="text-gold">Ритм. </span>{result.pacing}</p>
            <p><span className="text-gold">Звук. </span>{result.audioTrigger}</p>
            <p><span className="text-gold">Под KEDR. </span>{result.kedrAdaptation}</p>
          </div>
        )}
      </GlassCard>
      <GlassCard className="flex flex-col justify-between space-y-4 rounded-3xl p-6 lg:col-span-5">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">Радар фуд-маркетинга</span>
            <button type="button" onClick={onRefresh} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-gold"><RefreshCw size={13} />Обновить</button>
          </div>
          <h3 className="font-fraunces mb-4 text-2xl text-white">Что работает в ресторанах сейчас</h3>
          <div className="space-y-3">
            {news.map((item) => (
              <div key={item.id || item.title} className="rounded-2xl border border-white/10 bg-obsidian/60 p-3">
                <p className="text-[11px] text-gold">{item.dateLabel || item.tag} · {item.source || item.time}</p>
                <p className="mt-1 text-base text-white">{item.title}</p>
                <p className="mt-1 text-sm text-slate-300">{item.watch || item.action}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-obsidian">Открыть источник</a>}
                  {onTake && <button type="button" onClick={() => onTake(item)} className="rounded-lg border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold">Поставить на этот день</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-kedr/30 p-4 text-xs text-emerald-200">
          <p className="mb-1 font-bold text-white">Совет агента</p>
          Ролики со склейкой около секунды и живым звуком дров держат сохранения лучше студийной музыки. Включить паттерн в дни 4, 9 и 17?
          <Button3D className="mt-2.5 w-full" onClick={onApply}>Внедрить в план</Button3D>
        </div>
      </GlassCard>
    </section>
  )
}

export function FilesView({ files, onUpload, telegram, onAddTelegram, onDigest }) {
  const [handle, setHandle] = useState('')
  const [role, setRole] = useState('Канал гостей')
  return (
    <section className="grid gap-6 lg:grid-cols-12">
      <GlassCard className="space-y-5 rounded-3xl p-6 lg:col-span-7">
        <div className="flex items-center justify-between">
          <h2 className="font-fraunces text-2xl text-white">База знаний ресторана</h2>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">Список на этом устройстве</span>
        </div>
        <p className="text-sm text-slate-300">Word, Excel и PDF остаются в списке кабинета. Разбор содержимого подключится вместе с хранилищем.</p>
        <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-gold/40 bg-obsidian/50 p-6 text-center hover:border-gold">
          <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" className="hidden" onChange={onUpload} />
          <Upload className="mx-auto mb-3 text-gold" />
          <div className="text-sm font-semibold text-white">Перетащите файлы или выберите с компьютера</div>
          <div className="mt-1 text-xs text-slate-400">.docx, .xlsx, .csv, .pdf</div>
        </label>
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.name} className="rounded-2xl border border-white/10 bg-obsidian/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{file.name}</p>
                <span className="text-[11px] text-gold">{file.type} • {file.size}</span>
              </div>
              <p className="mt-2 text-xs text-slate-300">{file.insight}</p>
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard className="flex flex-col justify-between space-y-5 rounded-3xl p-6 lg:col-span-5">
        <div className="space-y-4">
          <h3 className="font-fraunces text-2xl text-white">Telegram-аккаунты</h3>
          <p className="text-xs text-slate-300">Канал гостей, бот директора и чат кухни. Отправка пока отмечается в кабинете, без Bot API.</p>
          <div className="space-y-2.5">
            {telegram.map((item) => (
              <div key={item.handle} className="rounded-2xl border border-white/10 bg-obsidian/60 p-3 text-xs">
                <p className="font-semibold text-white">{item.handle}</p>
                <p className="text-slate-400">{item.role}</p>
                <p className="text-emerald-300">{item.status}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-obsidian/70 p-4">
            <div className="flex gap-2">
              <input value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="@kedr_vip_club" className="flex-1 rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-xs text-white focus:border-gold focus:outline-none" />
              <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-xl border border-white/15 bg-obsidian px-2 text-xs text-slate-200">
                <option>Канал гостей</option>
                <option>Бот директора</option>
                <option>Чат кухни/SMM</option>
              </select>
            </div>
            <Button3D tone="ghost" className="w-full border-sky-400/40 text-xs text-sky-300" onClick={() => { onAddTelegram(handle, role); setHandle('') }}>Привязать аккаунт</Button3D>
          </div>
        </div>
        <Button3D className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white" onClick={onDigest}><Send size={14} />Отметить тестовую сводку директору</Button3D>
      </GlassCard>
    </section>
  )
}

const IG = {
  '7': { reach: '62 400', delta: '+12.1% к прошлой неделе', retention: '71.4%', er: '5.9% • 890', bookings: '74 брони', bars: [28, 36, 32, 48, 44, 62, 58] },
  '30': { reach: '284 900', delta: '+38.4% к прошлому месяцу', retention: '76.2%', er: '6.8% • 4 120', bookings: '318 броней', bars: [34, 42, 38, 55, 48, 70, 64, 78, 72, 88, 80, 96] },
  '90': { reach: '812 000', delta: '+21.6% к прошлому кварталу', retention: '68.5%', er: '6.1% • 11 400', bookings: '904 брони', bars: [30, 36, 44, 40, 52, 58, 50, 66, 72, 68, 80, 92] },
}

export function InstaView({ period, setPeriod, onSync }) {
  const slice = IG[period]
  return (
    <section className="space-y-6">
      <div className="metal-slide flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-fraunces text-2xl text-white">@kedr.restaurant</h2>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">Учебный срез, не Graph API</span>
          </div>
          <p className="text-xs text-slate-300">Охваты, удержание и брони — цифры из макета, чтобы директор видел форму отчёта.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={period} onChange={(event) => setPeriod(event.target.value)} className="rounded-xl border border-white/20 bg-obsidian/80 px-3.5 py-2 text-xs text-white">
            <option value="30">Последние 30 дней</option>
            <option value="7">Последние 7 дней</option>
            <option value="90">Квартал (90 дней)</option>
          </select>
          <Button3D tone="ghost" className="text-xs" onClick={onSync}><RefreshCw size={14} />Синхронизировать</Button3D>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Суммарный охват" value={slice.reach} note={slice.delta} />
        <Metric label="Удержание Reels" value={slice.retention} note="Ориентир фуд-сегмента в макете — 52%" />
        <Metric label="ER и сохранения" value={slice.er} note="Лидер макета: тартар с дымом" />
        <Metric label="Переходы в бронь" value={slice.bookings} note="Средний чек в макете ~6 400 ₽" gold />
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <GlassCard className="rounded-3xl p-6 lg:col-span-7">
          <h3 className="font-fraunces text-xl text-white">Динамика охватов</h3>
          <div className="mt-4 flex h-56 items-end gap-2 border-b border-white/10 px-2 pb-2">
            {slice.bars.map((height, index) => (
              <div key={`${period}-${index}`} className="flex-1 rounded-t-md bg-gradient-to-t from-roseMetal to-gold" style={{ height: `${height}%` }} />
            ))}
          </div>
        </GlassCard>
        <GlassCard className="space-y-3 rounded-3xl p-6 lg:col-span-5">
          <h3 className="font-fraunces text-xl text-white">Топ публикаций макета</h3>
          {[
            ['Оленина на кедровой доске', '64 200 • 74 брони', 'ER 8.9%'],
            ['Таёжный десерт с брусникой', '49 100 • 51 бронь', 'ER 7.4%'],
            ['Пятница: свечи и сет настоек', '38 700 • 63 брони', 'ER 6.9%'],
          ].map(([title, meta, er]) => (
            <div key={title} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-obsidian/70 p-3.5 text-xs">
              <div>
                <p className="font-bold text-white">{title}</p>
                <p className="text-slate-400">{meta}</p>
              </div>
              <span className="shrink-0 rounded-lg bg-emerald-500/20 px-2.5 py-1 font-bold text-emerald-300">{er}</span>
            </div>
          ))}
        </GlassCard>
      </div>
    </section>
  )
}

function Metric({ label, value, note, gold }) {
  return (
    <GlassCard className="rounded-2xl p-5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`font-fraunces mt-2 text-3xl ${gold ? 'text-gold' : 'text-white'}`}>{value}</p>
      <p className="mt-1 text-xs text-emerald-400">{note}</p>
    </GlassCard>
  )
}

export function TeamView({ messages, onSend, onInvite }) {
  const [role, setRole] = useState('Директор KEDR')
  const [text, setText] = useState('')
  return (
    <section className="grid gap-6 lg:grid-cols-12">
      <GlassCard className="flex flex-col justify-between space-y-4 rounded-3xl p-6 lg:col-span-5">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-fraunces text-2xl text-white">Комната обсуждения</h2>
            <button type="button" onClick={onInvite} className="rounded-lg border border-gold/30 bg-gold/20 px-2.5 py-1 text-xs font-semibold text-gold">Пригласить</button>
          </div>
          <p className="mb-4 text-xs text-slate-400">Директор, шеф и SMM в одном экране. Сообщения живут в этом браузере.</p>
          <div className="max-h-[380px] space-y-3 overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <div key={`${message.time}-${index}`} className="rounded-2xl border border-white/10 bg-obsidian/60 p-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-gold">{message.sender}</span>
                  <span className="text-slate-500">{message.time}</span>
                </div>
                <p className="mt-1 text-sm text-white">{message.text}</p>
                <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${message.badge === 'AI' ? 'bg-[#C6FF5E]/15 text-[#C6FF5E]' : 'bg-white/10 text-slate-300'}`}>{message.badge}</span>
              </div>
            ))}
          </div>
        </div>
        <form className="flex gap-2 border-t border-white/10 pt-3" onSubmit={(event) => { event.preventDefault(); onSend(role, text); setText('') }}>
          <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-xl border border-white/15 bg-obsidian px-2 text-xs font-semibold text-gold">
            <option>Директор KEDR</option>
            <option>Бренд-Шеф</option>
            <option>SMM Продюсер</option>
            <option>Copilot</option>
          </select>
          <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Комментарий по дню или блюду" className="flex-1 rounded-xl border border-white/15 bg-obsidian px-3 text-xs text-white focus:border-gold focus:outline-none" />
          <button type="submit" className="rounded-xl bg-gold px-4 text-xs font-bold text-obsidian" aria-label="Отправить"><Send size={14} /></button>
        </form>
      </GlassCard>
      <GlassCard className="space-y-4 rounded-3xl p-6 lg:col-span-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">Что уже в репозитории</p>
        <h2 className="font-fraunces text-2xl text-white sm:text-3xl">Кабинет KEDR на Vite и React</h2>
        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-obsidian/95 p-4 font-mono text-xs leading-relaxed text-slate-200">{SPEC}</pre>
      </GlassCard>
    </section>
  )
}

const SPEC = `restprime/
  src/App.jsx                 экран и состояние
  src/components/Chrome.jsx   шапка, светофор, 8 модулей
  src/components/Modules.jsx  план, посты, reels, темы, разбор, файлы, охваты, чат
  src/data/contentPlan.js     30 дней KEDR
  src/data/suite.js           ролики, новости, файлы, telegram, чат

Сейчас на устройстве: утверждения, чат, список файлов, переключатель ресторана.
Дальше по фазам: Supabase (вход и файлы), живые Meta и Telegram, генерация текста.`

export function DayModalBody({ day, onCopy }) {
  return (
    <div className="space-y-3 text-base leading-relaxed text-slate-100">
      <p className="text-sm text-gold">{day.pillar} • {day.dish} • маржа {day.margin}</p>
      <p className="text-sm text-slate-300">Пост выходит в 13:30 · Reels в 18:00</p>
      <p className="text-lg">{day.postText}</p>
      <p className="text-xs text-slate-300"><span className="text-gold">Хук. </span>{day.reelHook}</p>
      <p className="text-xs text-slate-300"><span className="text-gold">Сценарий. </span>{day.reelScript}</p>
      <p className="text-xs text-slate-400">Звук: {day.reelAudio}</p>
      <p className="text-xs text-emerald-300">{day.warmupTheme} • {day.kpi}</p>
      <Button3D tone="ghost" className="text-xs" onClick={() => onCopy(day.postText)}><Copy size={14} />Скопировать пост</Button3D>
    </div>
  )
}
