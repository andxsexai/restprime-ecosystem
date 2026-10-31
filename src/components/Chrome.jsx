import { motion } from 'framer-motion'
import {
  CalendarCheck, PenLine, Clapperboard, Compass, Eye, FileUp, ChartLine, MessagesSquare,
  Sparkles, UserRound, Coins, Flame, Film,
} from 'lucide-react'

const TABS = [
  { id: 'plan-30', title: 'План на 30 дней', hint: 'Матрица директора', badge: '30 дн', icon: CalendarCheck, chip: 'bg-kedr/60 border-gold/30 text-gold' },
  { id: 'posts-30', title: 'Посты 30 дней', hint: 'Тексты TG / VK / IG', badge: 'Copy', icon: PenLine, chip: 'bg-sky-950/70 border-sky-400/30 text-sky-300' },
  { id: 'reels-30', title: 'Reels: Идеи 30 дн', hint: 'Хуки и раскадровки', badge: 'Reels', icon: Clapperboard, chip: 'bg-pink-950/70 border-pink-400/30 text-pink-300' },
  { id: 'themes-30', title: 'Темы на 30 дней', hint: 'Прогревы и маржа', badge: 'Стратегия', icon: Compass, chip: 'bg-amber-950/70 border-amber-400/30 text-amber-300' },
  { id: 'video-ai', title: 'Разбор Роликов', hint: 'и фуд-тренды 2026', badge: 'AI Vision', icon: Eye, chip: 'bg-purple-950/70 border-purple-400/30 text-purple-300' },
  { id: 'files-tg', title: 'Файлы и Telegram', hint: 'Word, Excel, PDF', badge: 'Doc/Xls/TG', icon: FileUp, chip: 'bg-emerald-950/70 border-emerald-400/30 text-emerald-300' },
  { id: 'insta-analytics', title: 'Instagram Охваты', hint: 'Дашборд и бронь', badge: '+42% ER', icon: ChartLine, chip: 'bg-rose-950/70 border-rose-400/30 text-rose-300' },
  { id: 'github-tz', title: 'Комната и GitHub', hint: 'Обсуждение команды', badge: 'Чат + ТЗ', icon: MessagesSquare, chip: 'bg-slate-800 border-gold/40 text-gold' },
]

export const RESTAURANTS = {
  kedr: { label: 'KEDR (kedr-res.ru) — Флагман', badge: 'Объект: Ресторан KEDR • kedr-res.ru', title: 'Дорога, зал и стол — без рутины в маркетинге' },
  taiga: { label: 'Тайга и Дым (Bistro Demo)', badge: 'Объект: Тайга и Дым • демо', title: 'Дым, дрова и короткая посадка — тот же контур для второго зала' },
  korner: { label: 'Korner Wine и Izakaya', badge: 'Объект: Korner • демо', title: 'Вино, огонь и короткие подачи — кабинет того же контура' },
}

export function TopBar({ restaurant, onRestaurant, onAudit, onAuth, account }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#14110e]/80 backdrop-blur-xl">
      <div className="relative mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <label className="flex max-w-[34%] items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
          <span className="sr-only">Выбрать ресторан</span>
          <select value={restaurant} onChange={(event) => onRestaurant(event.target.value)} className="w-full cursor-pointer bg-transparent text-white/80 focus:outline-none">
            {Object.entries(RESTAURANTS).map(([id, place]) => (
              <option key={id} value={id} className="bg-obsidian">{place.label}</option>
            ))}
          </select>
        </label>
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="font-fraunces text-3xl tracking-tight text-[#f4efe6] sm:text-4xl">RESTPRIME</div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#c4a574]">гипер натурал</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onAudit} className="nav-3d-btn hidden items-center gap-2 rounded-full px-3 py-2 text-xs text-[#c4a574] md:flex">
            <Sparkles size={14} />
            URL
          </button>
          <button type="button" onClick={onAuth} className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs text-[#f4efe6]">
            <UserRound size={14} />
            <span className="hidden sm:inline">{account ? account.name : 'Аккаунт'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export function HeroBoard({ place, day, onPillar, onOpenAi, onApprove, onReplace, onInstagram, onTelegram, onProject, onMatch, approved }) {
  return (
    <section className="grid items-stretch gap-5 lg:grid-cols-12">
      <div className="group relative flex min-h-[290px] flex-col justify-between overflow-hidden rounded-3xl border border-white/15 p-6 shadow-2xl sm:p-8 lg:col-span-7">
        <img src={`${import.meta.env.BASE_URL}hero.jpg`} alt="Сосновый лес у ресторана KEDR" className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-obsidian/25 to-obsidian/90" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-obsidian/75 px-3 py-1 text-xs text-goldLight backdrop-blur-md">
            {place.badge}
          </div>
          <span className="rounded-lg border border-emerald-500/40 bg-emerald-950/80 px-2.5 py-1 text-xs font-medium text-emerald-300">AI-агент на экране</span>
        </div>
        <motion.div className="relative z-10 my-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-gold/90">Операционная панель директора • Осень/Зима 2026</p>
          <h1 className="font-fraunces text-3xl leading-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.85)] sm:text-4xl lg:text-5xl">{place.title}</h1>
        </motion.div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-2">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <Portal onClick={() => onPillar('all')} icon="30" label="Все задания" />
            <Portal onClick={() => onPillar('Быт')} icon={<Coins size={14} />} label="Быт" />
            <Portal onClick={() => onPillar('Гости')} icon={<Flame size={14} />} label="Гости" />
            <Portal onClick={() => onPillar('Меню')} icon={<Film size={14} />} label="Из меню" />
            <Portal onClick={onOpenAi} icon={<Film size={14} />} label="Тренды" />
          </div>
          <span className="hidden text-xs italic text-slate-300 sm:inline">Наведите на карточку дня — откроются кнопки</span>
        </div>
      </div>

      <div className="metal-slide relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 lg:col-span-5">
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gold">Светофор директора • Сегодня</span>
            </div>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${approved ? 'border-emerald-400/30 bg-emerald-500/20 text-emerald-300' : 'border-amber-400/30 bg-amber-500/20 text-amber-300'}`}>
              {approved ? 'День утверждён' : 'Ждёт одного клика'}
            </span>
          </div>
          <h2 className="font-fraunces mb-1 text-2xl text-white sm:text-3xl">День {day.day}: {day.title}</h2>
          <p className="mb-4 text-sm leading-relaxed text-slate-200">{day.scene}. Опора: {day.dish}. {day.margin}.</p>
          <div className="space-y-2.5 rounded-2xl border border-white/10 bg-obsidian/55 p-3.5 text-xs backdrop-blur-md">
            <Row label="Пост (13:30)" value={day.postText} />
            <Row label="Reels (18:00)" value={day.reelHook} />
            <Row label="KPI дня" value={`${day.kpi} • охват ориентир ~8 400`} emerald />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/15 pt-3">
          <button type="button" onClick={onApprove} className="col-span-2 rounded-xl bg-gradient-to-r from-gold to-amber-500 px-4 py-3 text-sm font-bold text-obsidian shadow-lg hover:brightness-110">
            Утвердить день и отметить к публикации
          </button>
          <button type="button" onClick={onInstagram} className="rounded-xl bg-pink-500/20 px-3 py-2.5 text-xs font-semibold text-pink-100">В Instagram · 18:00</button>
          <button type="button" onClick={onTelegram} className="rounded-xl bg-sky-500/20 px-3 py-2.5 text-xs font-semibold text-sky-100">В Telegram · 13:30</button>
          <button type="button" onClick={onProject} className="rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold text-white">Новый проект</button>
          <button type="button" onClick={onMatch} className="rounded-xl border border-gold/40 bg-gold/15 px-3 py-2.5 text-xs font-semibold text-gold">Подобрать формат</button>
          <button type="button" onClick={onReplace} className="col-span-2 rounded-xl bg-[#f4efe6] px-3.5 py-2.5 text-xs font-semibold text-[#1c1915] hover:brightness-105">
            Переделать задание
          </button>
        </div>
      </div>
    </section>
  )
}

function Portal({ onClick, icon, label }) {
  return (
    <button type="button" onClick={onClick} className="flex shrink-0 items-center gap-2.5 rounded-full border border-white/20 bg-obsidian/75 py-1 pl-1.5 pr-3.5 text-xs text-white">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-kedr font-semibold text-gold">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function Row({ label, value, emerald }) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-white/5 pt-2 first:border-0 first:pt-0">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className={`line-clamp-1 text-right font-medium ${emerald ? 'text-emerald-300' : 'text-white'}`}>{value}</span>
    </div>
  )
}

export function ModuleNav({ tab, onTab }) {
  return (
    <nav aria-label="Модули RESTPRIME" className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Модули управления</span>
        <span className="hidden text-xs text-slate-400 md:inline">Переключение без перезагрузки</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
        {TABS.map((item) => {
          const Icon = item.icon
          return (
            <button key={item.id} type="button" onClick={() => onTab(item.id)} className={`nav-3d-btn flex h-24 flex-col justify-between rounded-2xl p-3 text-left ${tab === item.id ? 'active' : ''}`}>
              <span className="flex items-center justify-between">
                <span className={`grid h-8 w-8 place-items-center rounded-xl border ${item.chip}`}><Icon size={15} /></span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-300">{item.badge}</span>
              </span>
              <span>
                <span className="block text-xs font-bold leading-tight text-white">{item.title}</span>
                <span className="text-[10px] text-slate-400">{item.hint}</span>
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
