import { Menu, UserRound } from 'lucide-react'
import { roleLabel } from '../../lib/auth.js'

export default function TopBar({ title, dateLabel, onMenu, onAuth, onRegister, account }) {
  return (
    <header className="sticky top-0 z-[60] flex h-16 items-center justify-between gap-3 border-b border-[#C9A96A]/15 bg-[#0A0F0B]/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenu} className="grid h-10 w-10 place-items-center rounded-xl border border-[#C9A96A]/20 text-[#C9A96A] lg:hidden" aria-label="Открыть меню">
          <Menu size={18} />
        </button>
        <div>
          <p className="font-display text-2xl italic leading-none text-[#F4F0E6]">{title}</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A8580]">KEDR · {dateLabel}</p>
        </div>
      </div>
      {account ? (
        <button type="button" onClick={onAuth} className="flex items-center gap-2 rounded-xl border border-[#C9A96A]/20 px-3 py-2 text-sm text-[#F4F0E6]">
          <UserRound size={15} className="text-[#C9A96A]" />
          <span className="hidden sm:inline">{account.name} · {roleLabel(account.role)}</span>
        </button>
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={onAuth} className="rounded-xl px-3 py-2 text-sm text-[#C9A96A]">Войти</button>
          <button type="button" onClick={onRegister} className="rounded-xl bg-[#C9A96A] px-3 py-2 text-sm font-semibold text-[#0A0F0B]">Регистрация</button>
        </div>
      )}
    </header>
  )
}
