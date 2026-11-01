import { BarChart3, Lightbulb, CalendarRange, Clapperboard, Compass, FolderUp, Instagram, LayoutDashboard, MessagesSquare, Newspaper, PenLine, ScanText, Send, Settings2, Sparkles, X } from 'lucide-react'

export const NAV = [
  { id: 'overview', title: 'Сегодня', note: 'Пост этого дня', icon: LayoutDashboard },
  { id: 'calendar-year', title: 'Календарь', note: '3 месяца', icon: CalendarRange },
  { id: 'agent', title: 'Агент', note: 'День и пересборка', icon: Sparkles },
  { id: 'three-days', title: '3 дня', note: '3 поста и 3 рилс в день', icon: Lightbulb },
  { id: 'rework', title: 'Переработка', note: 'Агент · каждый пост', icon: ScanText },
  { id: 'analytics', title: 'Аналитика', note: 'Тексты плана', icon: BarChart3 },
  { id: 'news-feed', title: 'Лента', note: 'Оригинал и KEDR', icon: Newspaper },
  { id: 'tg-channels', title: 'Каналы', note: 'Москва · Telegram', icon: Send },
  { id: 'plan-30', title: 'План', note: '30 дней меню', icon: CalendarRange },
  { id: 'posts-30', title: 'Посты', note: 'Короткий и широкий', icon: PenLine },
  { id: 'posts-edit', title: 'Правка', note: 'Ручная доработка', icon: PenLine },
  { id: 'site-desk', title: 'Сайт', note: 'Тексты кабинета', icon: Settings2, developer: true },
  { id: 'reels-30', title: 'Reels', note: 'Сценарии и тренды', icon: Clapperboard },
  { id: 'themes-30', title: 'Темы', note: '30 мероприятий и реклама', icon: Compass },
  { id: 'insta-analytics', title: 'Instagram', note: 'Профиль и разбор', icon: Instagram },
  { id: 'files-tg', title: 'Файлы', note: 'Документы', icon: FolderUp },
  { id: 'github-tz', title: 'Чат', note: 'Команда', icon: MessagesSquare },
]

export default function Sidebar({ tab, onTab, open, onClose, isDeveloper }) {
  return (
    <>
      {open && <button type="button" aria-label="Закрыть меню" className="fixed inset-0 z-[70] bg-black/50 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-[75] flex w-[248px] flex-col border-r border-[#C9A96A]/20 bg-[#0A0F0B]/95 px-3 py-4 backdrop-blur-md transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-4 flex items-start justify-between px-2">
          <div>
            <p className="font-display text-3xl italic leading-none text-[#F4F0E6]">RESTPRIME</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#7A8580]">Дашборд ресторатора</p>
          </div>
          <button type="button" className="text-[#7A8580] lg:hidden" onClick={onClose} aria-label="Закрыть">
            <X size={18} />
          </button>
        </div>
        <nav aria-label="Разделы" className="flex-1 space-y-1 overflow-y-auto pr-1">
          {NAV.filter((item) => !item.developer || isDeveloper).map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { onTab(item.id); onClose() }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left ${active ? 'bg-[#C9A96A]/15 text-[#C9A96A]' : 'text-[#F4F0E6]/80 hover:bg-white/5'}`}
              >
                <Icon size={16} />
                <span>
                  <span className="block text-sm font-medium">{item.title}</span>
                  <span className="block text-[10px] text-[#7A8580]">{item.note}</span>
                </span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
