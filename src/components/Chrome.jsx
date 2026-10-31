import { Bell, UserRound } from 'lucide-react'
import { roleLabel } from '../lib/auth.js'

const TABS = [
  { id: 'plan-30', title: 'План' },
  { id: 'posts-30', title: 'Посты' },
  { id: 'reels-30', title: 'Reels' },
  { id: 'themes-30', title: 'Темы' },
  { id: 'video-ai', title: 'Разбор' },
  { id: 'files-tg', title: 'Файлы' },
  { id: 'insta-analytics', title: 'Instagram' },
  { id: 'github-tz', title: 'Чат команды' },
]

export function TopBar({ onAuth, onRegister, account, isDeveloper, pendingCount, onDesk }) {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-[#f3efe6]/90 backdrop-blur-xl">
      <div className="relative mx-auto flex min-h-[76px] max-w-[1100px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="text-sm text-ink/70">
          <p className="text-[11px] text-[#2f6b4f]">Флагман</p>
          <p className="font-semibold text-ink">KEDR</p>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="wordmark text-3xl text-ink sm:text-4xl">RESTPRIME</div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#2f6b4f]">Дашборд ресторатора</p>
        </div>
        <div className="flex items-center gap-2">
          {isDeveloper && (
            <button type="button" onClick={onDesk} className="relative flex items-center gap-2 rounded-full border border-[#2f6b4f]/30 bg-white px-3 py-2 text-sm text-kedr">
              <Bell size={15} />
              <span className="hidden sm:inline">Заявки</span>
              {pendingCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#2f6b4f] px-1 text-[10px] font-bold text-white">{pendingCount}</span>}
            </button>
          )}
          {account ? (
            <button type="button" onClick={onAuth} className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-ink">
              <UserRound size={15} />
              <span className="hidden sm:inline">{account.name} · {roleLabel(account.role)}</span>
            </button>
          ) : (
            <>
              <button type="button" onClick={onAuth} className="rounded-full px-3 py-2 text-sm text-ink/80">Войти</button>
              <button type="button" onClick={onRegister} className="rounded-full bg-[#2f6b4f] px-4 py-2 text-sm font-semibold text-white">Регистрация</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function HeroBoard({ place, day, onPillar, approved, canAct, onApprove, onReplace, onChat }) {
  return (
    <section className="grid items-stretch gap-4 lg:grid-cols-12">
      <div className="relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-[28px] lg:col-span-5">
        <img src={`${import.meta.env.BASE_URL}hero.jpg`} alt="Сосновый лес у ресторана KEDR" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e3328]/80 via-[#1e3328]/15 to-transparent" />
        <div className="relative z-10 p-6 text-white sm:p-8">
          <p className="text-xs text-white/80">{place.badge}</p>
          <h1 className="font-fraunces mt-2 text-4xl leading-tight">{place.title}</h1>
        </div>
      </div>
      <div className="flex flex-col justify-between rounded-[28px] border border-ink/10 bg-[#fffcf8] p-6 sm:p-8 lg:col-span-7">
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-[#2f6b4f]">День {day.day} · {day.pillar}</p>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${approved ? 'bg-[#e7f0ea] text-kedr' : 'bg-paper text-ink/60'}`}>
              {approved ? 'Утверждено' : 'Черновик'}
            </span>
          </div>
          <h2 className="font-fraunces text-3xl text-ink sm:text-4xl">{day.title}</h2>
          <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-ink/80">{day.postText}</p>
          <p className="mt-3 text-sm text-ink/50">{day.dish} · {day.margin}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {['all', 'Быт', 'Гости', 'Меню'].map((pill) => (
            <button key={pill} type="button" onClick={() => onPillar(pill)} className="rounded-full bg-paper px-3 py-1.5 text-sm text-ink/80">
              {pill === 'all' ? 'Все' : pill}
            </button>
          ))}
          <div className="ml-auto flex flex-wrap gap-2">
            <button type="button" disabled={!canAct} onClick={onReplace} className="rounded-full border border-ink/10 px-4 py-2.5 text-sm text-ink disabled:opacity-40">Переделать</button>
            <button type="button" disabled={!canAct} onClick={onChat} className="rounded-full border border-ink/10 px-4 py-2.5 text-sm text-ink disabled:opacity-40">В чат</button>
            <button type="button" disabled={!canAct} onClick={onApprove} className="rounded-full bg-[#2f6b4f] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Утвердить</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ModuleNav({ tab, onTab }) {
  return (
    <nav aria-label="Разделы кабинета" className="flex gap-2 overflow-x-auto pb-1">
      {TABS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onTab(item.id)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm ${tab === item.id ? 'bg-[#2f6b4f] font-semibold text-white' : 'bg-white text-ink/70'}`}
        >
          {item.title}
        </button>
      ))}
    </nav>
  )
}
