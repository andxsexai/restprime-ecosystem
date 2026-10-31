const EMOJI = ['🌿', '🌲', '🍽', '🥂', '✨', '❤️', '🔥', '📍', '📞', '📩', '🎂', '🌙', '☕️', '🍋', '🙂', '🤍']

export default function EmojiBar({ onPick }) {
  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible" aria-label="Смайлики">
      {EMOJI.map((item) => (
        <button key={item} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => onPick(item)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#C9A96A]/25 bg-[#0A0F0B] text-lg">
          {item}
        </button>
      ))}
    </div>
  )
}
