import { Bell, ListChecks, Menu, UserRound } from 'lucide-react'
import { roleLabel } from '../../lib/auth.js'

export default function TopBar({ title, dateLabel, onMenu, onAuth, onRegister, account, isDeveloper, pendingCount, onDesk, openTasks, onTasks }) {
  return (
    <header className="sticky top-0 z-[60] flex h-16 items-center justify-between gap-2 border-b border-[#C9A96A]/15 bg-[#0A0F0B]/80 px-3 backdrop-blur-md sm:gap-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button type="button" onClick={onMenu} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#C9A96A]/20 text-[#C9A96A] lg:hidden" aria-label="Открыть меню">
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <p className="truncate font-display text-2xl italic leading-none text-[#F4F0E6]">{title}</p>
          <p className="truncate text-[10px] uppercase tracking-[0.16em] text-[#7A8580]">KEDR · {dateLabel}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button type="button" onClick={onTasks} aria-label="Задачи команды" className="flex h-10 items-center gap-2 rounded-xl border border-[#C6FF5E]/40 px-3 text-sm text-[#C6FF5E]">
          <ListChecks size={16} />
          <span className="hidden sm:inline">Задачи</span>
          {openTasks > 0 && <span className="rounded-full bg-[#C6FF5E] px-1.5 text-[10px] font-bold text-[#0A0F0B]">{openTasks}</span>}
        </button>
        {isDeveloper && (
          <button type="button" onClick={onDesk} aria-label="Заявки" className="relative flex h-10 items-center gap-2 rounded-xl border border-[#C9A96A]/40 px-3 text-sm text-[#C9A96A]">
            <Bell size={15} />
            <span className="hidden sm:inline">Заявки</span>
            {pendingCount > 0 && <span className="rounded-full bg-[#C9A96A] px-1.5 text-[10px] font-bold text-[#0A0F0B]">{pendingCount}</span>}
          </button>
        )}
        {account ? (
          <button type="button" onClick={onAuth} aria-label="Профиль" className="flex h-10 items-center gap-2 rounded-xl border border-[#C9A96A]/20 px-3 text-sm text-[#F4F0E6]">
            <UserRound size={15} className="text-[#C9A96A]" />
            <span className="hidden sm:inline">{account.name} · {roleLabel(account.role)}</span>
          </button>
        ) : (
          <div className="flex gap-1.5 sm:gap-2">
            <button type="button" onClick={onAuth} className="h-10 rounded-xl px-3 text-sm text-[#C9A96A]">Войти</button>
            <button type="button" onClick={onRegister} className="hidden h-10 rounded-xl bg-[#C9A96A] px-3 text-sm font-semibold text-[#0A0F0B] sm:block">Регистрация</button>
          </div>
        )}
      </div>
    </header>
  )
}
