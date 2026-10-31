import { roleLabel } from '../lib/auth.js'

export default function DeveloperDesk({ pending, notices, onClose, onConfirm, onReject }) {
  return (
    <aside className="fixed bottom-4 right-4 top-24 z-[90] flex w-[min(100%-2rem,400px)] flex-col overflow-hidden rounded-[28px] border border-ink/10 bg-[#fffcf8] shadow-2xl">
      <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
        <div>
          <p className="text-xs text-[#2f6b4f]">Окно разработчика</p>
          <h2 className="font-fraunces text-3xl text-ink">Заявки</h2>
        </div>
        <button type="button" onClick={onClose} className="rounded-full bg-paper px-3 py-1.5 text-sm text-ink/70">Закрыть</button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {pending.length === 0 && <p className="text-sm leading-relaxed text-ink/70">Новых регистраций нет. Когда кто-то оставит почту и пароль, заявка появится здесь.</p>}
        {pending.map((user) => (
          <article key={user.id} className="rounded-2xl border border-ink/10 bg-paper p-4">
            <p className="font-semibold text-ink">{user.name}</p>
            <p className="text-sm text-ink/70">{user.email}</p>
            <p className="mt-1 text-sm text-[#2f6b4f]">{roleLabel(user.role)} · {user.at}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => onConfirm(user.id)} className="rounded-full bg-[#2f6b4f] px-4 py-2 text-sm font-semibold text-white">Подтвердить</button>
              <button type="button" onClick={() => onReject(user.id)} className="rounded-full border border-ink/10 px-4 py-2 text-sm text-ink/80">Отклонить</button>
            </div>
          </article>
        ))}
        {notices.length > 0 && (
          <div className="border-t border-ink/10 pt-3">
            <p className="mb-2 text-xs text-ink/50">Недавние</p>
            {notices.slice(0, 6).map((notice) => (
              <p key={notice.id} className="mb-2 text-sm text-ink/80">{notice.text}</p>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
