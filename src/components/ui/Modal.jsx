import { X } from 'lucide-react'

export default function Modal({ title, icon, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-obsidian/80 p-4 backdrop-blur-md" onClick={onClose}>
      <div className="spatial-card max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-gold/40 p-6 sm:p-7" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {icon}
            <h3 className="font-fraunces text-2xl text-white">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-slate-300 hover:text-white" aria-label="Закрыть">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
