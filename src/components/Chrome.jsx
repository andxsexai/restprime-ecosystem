import { Bell, CalendarCheck, Clapperboard, Compass, FolderUp, Instagram, MessagesSquare, Newspaper, PenLine, Send, UserRound } from 'lucide-react'
import { roleLabel } from '../lib/auth.js'

const TABS = [
  { id: 'news-feed', title: 'Лента', note: 'Новости до сегодня', icon: Newspaper },
  { id: 'tg-channels', title: 'Каналы', note: 'Москва · Telegram', icon: Send },
  { id: 'plan-30', title: 'План на 30 дней', note: 'Задания', icon: CalendarCheck },
  { id: 'posts-30', title: 'Посты', note: 'Короткий и широкий', icon: PenLine },
  { id: 'reels-30', title: 'Reels', note: 'Сценарии', icon: Clapperboard },
  { id: 'themes-30', title: 'Темы', note: 'Прогрев', icon: Compass },
  { id: 'insta-analytics', title: 'Instagram', note: 'Профиль и разбор', icon: Instagram },
  { id: 'files-tg', title: 'Файлы', note: 'Документы', icon: FolderUp },
  { id: 'github-tz', title: 'Чат команды', note: 'Посты и темы', icon: MessagesSquare },
]

export function TopBar({ onAuth, onRegister, account, isDeveloper, pendingCount, onDesk }) {
  return (
    <header className="sticky top-0 z-[80] border-b border-white/10 bg-obsidian/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-fraunces text-3xl text-white">RESTPRIME</span>
            <span className="rounded-full border border-gold/30 bg-gold/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-gold">2026</span>
          </div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Дашборд ресторатора</p>
        </div>
        <div className="flex items-center gap-2">
          {isDeveloper && (
            <button type="button" onClick={onDesk} className="nav-3d-btn relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gold">
              <Bell size={15} />
              <span className="hidden sm:inline">Заявки</span>
              {pendingCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-obsidian">{pendingCount}</span>}
            </button>
          )}
          {account ? (
            <button type="button" onClick={onAuth} className="nav-3d-btn flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white">
              <UserRound size={15} className="text-gold" />
              <span className="hidden sm:inline">{account.name} · {roleLabel(account.role)}</span>
            </button>
          ) : (
            <>
              <button type="button" onClick={onAuth} className="nav-3d-btn rounded-xl px-3 py-2 text-sm text-gold">Войти</button>
              <button type="button" onClick={onRegister} className="rounded-xl border border-gold/40 bg-gradient-to-r from-kedr to-emerald-800 px-3.5 py-2 text-sm font-semibold text-white">Регистрация</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function ModuleNav({ tab, onTab }) {
  return (
    <nav aria-label="Разделы кабинета" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
      {TABS.map((item) => {
        const Icon = item.icon
        const active = tab === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTab(item.id)}
            className={`nav-3d-btn flex h-24 flex-col justify-between rounded-2xl p-3 text-left ${active ? 'active' : ''}`}
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl border border-gold/30 bg-kedr/60 text-gold">
              <Icon size={15} />
            </span>
            <span>
              <span className="block text-xs font-bold leading-tight text-white">{item.title}</span>
              <span className="text-[10px] text-slate-400">{item.note}</span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}
