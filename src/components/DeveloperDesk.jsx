import { Bell, BellRing, RefreshCw, X } from 'lucide-react'
import { roleLabel } from '../lib/auth.js'
import { PUSH_URL } from '../lib/relay.js'

const RELAY = {
  online: { text: 'Канал заявок на связи, проверка каждые 20 секунд', tone: 'text-[#C6FF5E]' },
  offline: { text: 'Нет связи с каналом заявок. Проверьте интернет', tone: 'text-red-300' },
  '': { text: 'Подключаемся к каналу заявок…', tone: 'text-[#7A8580]' },
}

export default function DeveloperDesk({ pending, notices, relayState, onClose, onConfirm, onReject, onRefresh, onEnableNotices, onDismissNotice }) {
  const relay = RELAY[relayState] || RELAY['']
  return (
    <aside className="fixed inset-0 z-[90] flex flex-col overflow-hidden bg-card sm:inset-auto sm:bottom-4 sm:right-4 sm:top-24 sm:w-[420px] sm:rounded-[28px] sm:border sm:border-ink/10 sm:shadow-2xl">
      <div className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
        <div>
          <p className="text-xs text-gold">Окно разработчика</p>
          <h2 className="font-fraunces text-3xl text-ink">Заявки</h2>
          <p className={`mt-1 text-xs ${relay.tone}`}>{relay.text}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Закрыть" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper text-ink/70"><X size={18} /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        <div className="space-y-2 rounded-2xl border border-[#C6FF5E]/25 p-3">
          <p className="text-sm text-ink">Чтобы заявка приходила пушем на телефон, один раз подпишитесь на канал в бесплатном приложении ntfy. Письмо с заявкой дублируется на почту разработчика.</p>
          <div className="flex flex-wrap gap-2">
            <a href={PUSH_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#C6FF5E] px-4 text-sm font-semibold text-[#0A0F0B]"><BellRing size={15} />Подписаться в ntfy</a>
            <button type="button" onClick={onEnableNotices} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-ink"><Bell size={15} />Уведомления браузера</button>
            <button type="button" onClick={onRefresh} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-ink"><RefreshCw size={15} />Проверить сейчас</button>
          </div>
        </div>
        {pending.length === 0 && <p className="text-sm leading-relaxed text-ink/70">Новых регистраций нет. Заявка с любого устройства появится здесь в течение 20 секунд.</p>}
        {pending.map((user) => (
          <article key={user.id} className="rounded-2xl border border-ink/10 bg-paper p-4">
            <p className="font-semibold text-ink">{user.name}</p>
            <p className="break-all text-sm text-ink/70">{user.email}</p>
            <p className="mt-1 text-sm text-gold">{roleLabel(user.role)} · {user.at}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => onConfirm(user.id)} className="min-h-10 flex-1 rounded-full bg-[#C9A96A] px-4 text-sm font-semibold text-[#0A0F0B]">Подтвердить</button>
              <button type="button" onClick={() => onReject(user.id)} className="min-h-10 flex-1 rounded-full border border-ink/10 px-4 text-sm text-ink/80">Отклонить</button>
            </div>
          </article>
        ))}
        {notices.length > 0 && (
          <div className="border-t border-ink/10 pt-3">
            <p className="mb-2 text-xs text-ink/50">Недавние</p>
            {notices.slice(0, 8).map((notice) => (
              <div key={notice.id} className="mb-2 flex items-start justify-between gap-2 rounded-xl bg-paper px-3 py-2">
                <p className="min-w-0 text-sm text-ink/80">{notice.text}<span className="block text-xs text-ink/45">{notice.at}</span></p>
                <button type="button" aria-label="Убрать уведомление" onClick={() => onDismissNotice(notice.id)} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink/50 hover:bg-white/10"><X size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
