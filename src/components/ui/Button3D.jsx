const tones = {
  gold: 'bg-gradient-to-r from-gold to-amber-500 text-obsidian font-bold shadow-lg hover:brightness-110',
  lime: 'bg-[#C6FF5E] text-obsidian font-bold hover:brightness-110',
  ghost: 'bg-white/10 text-white border border-white/15 hover:bg-white/20',
  kedr: 'bg-emerald-600/25 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40 font-semibold',
}

export default function Button3D({ tone = 'gold', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition duration-300 hover:-translate-y-0.5 active:translate-y-0 ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
