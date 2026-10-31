const EMOJI = ['🌿', '🌲', '🍽', '🥂', '✨', '❤️', '🔥', '📍', '📞', '📩', '🎂', '🌙', '☕️', '🍋', '🙂', '🤍']

export default function EmojiBar({ onPick }) {
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Смайлики">
      {EMOJI.map((item) => (
        <button key={item} type="button" onClick={() => onPick(item)} className="grid h-9 w-9 place-items-center rounded-xl border border-[#C9A96A]/25 bg-[#0A0F0B] text-lg">
          {item}
        </button>
      ))}
    </div>
  )
}
