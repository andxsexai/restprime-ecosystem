import { Bell, UserRound } from 'lucide-react'
import { roleLabel } from '../lib/auth.js'

const TABS = [
  { id: 'news-feed', title: 'Лента' },
  { id: 'plan-30', title: 'План' },
  { id: 'posts-30', title: 'Посты' },
  { id: 'reels-30', title: 'Reels' },
  { id: 'themes-30', title: 'Темы' },
  { id: 'insta-analytics', title: 'Instagram' },
  { id: 'files-tg', title: 'Файлы' },
  { id: 'github-tz', title: 'Чат команды' },
]

export function TopBar({ onAuth, onRegister, account, isDeveloper, pendingCount, onDesk }) {
  return (
    <header className="liquid-bar sticky top-0 z-50 rounded-none border-x-0 border-t-0">
      <div className="mx-auto grid min-h-[76px] max-w-[1100px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 text-sm text-ink/70">
          <div>
            <p className="text-[11px] text-[#9dccb0]">Флагман</p>
            <p className="font-semibold text-ink">KEDR</p>
          </div>
        </div>
        <div className="text-center">
          <div className="wordmark text-3xl text-ink sm:text-4xl">RESTPRIME</div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#9dccb0]">Дашборд ресторатора</p>
        </div>
        <div className="flex items-center justify-end gap-2">
          {isDeveloper && (
            <button type="button" onClick={onDesk} className="press relative flex items-center gap-2 rounded-full border border-[#9dccb0]/30 bg-card px-3 py-2 text-sm text-[#c5e0d2]">
              <Bell size={15} />
              <span className="hidden sm:inline">Заявки</span>
              {pendingCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#2f6b4f] px-1 text-[10px] font-bold text-white">{pendingCount}</span>}
            </button>
          )}
          {account ? (
            <button type="button" onClick={onAuth} className="press flex items-center gap-2 rounded-full bg-card px-3 py-2 text-sm text-ink">
              <UserRound size={15} />
              <span className="hidden sm:inline">{account.name} · {roleLabel(account.role)}</span>
            </button>
          ) : (
            <>
              <button type="button" onClick={onAuth} className="press rounded-full px-3 py-2 text-sm text-ink/80">Войти</button>
              <button type="button" onClick={onRegister} className="press rounded-full bg-[#2f6b4f] px-4 py-2 text-sm font-semibold text-white">Регистрация</button>
            </>
          )}
        </div>
      </div>
    </header>
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
          className={`press shrink-0 rounded-full px-4 py-2 text-sm ${tab === item.id ? 'bg-[#2f6b4f] font-semibold text-white' : 'bg-card text-ink/70'}`}
        >
          {item.title}
        </button>
      ))}
    </nav>
  )
}
