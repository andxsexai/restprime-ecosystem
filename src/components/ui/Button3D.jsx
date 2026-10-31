const tones = {
  gold: 'bg-gradient-to-r from-gold to-amber-500 text-obsidian font-bold hover:brightness-110',
  lime: 'bg-[#C9A96A] text-[#0A0F0B] font-semibold border border-gold/30',
  ghost: 'bg-white/10 text-white border border-white/15 hover:bg-white/20',
  kedr: 'bg-kedr/40 text-goldLight border border-gold/30 font-semibold',
}

export default function Button3D({ tone = 'gold', className = '', children, ...props }) {
  return (
    <button
      className={`press inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
