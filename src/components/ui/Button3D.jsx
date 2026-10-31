const tones = {
  gold: 'bg-[#2f6b4f] text-white font-semibold hover:bg-[#275c43]',
  lime: 'bg-[#2f6b4f] text-white font-semibold hover:bg-[#275c43]',
  ghost: 'bg-white text-ink border border-ink/10 hover:border-[#2f6b4f]/40',
  kedr: 'bg-[#e7f0ea] text-kedr border border-[#2f6b4f]/20 font-semibold hover:bg-[#dce8e1]',
}

export default function Button3D({ tone = 'gold', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
