import { motion } from 'framer-motion'

const TONES = {
  gold: 'bg-[#C9A96A] text-[#0A0F0B] font-semibold',
  signal: 'bg-[#C6FF5E] text-[#0A0F0B] font-semibold',
  ghost: 'border border-[#C9A96A]/30 bg-transparent text-[#F4F0E6]',
}

export default function PremiumButton({ tone = 'gold', className = '', children, ...props }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-xl px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${TONES[tone] || TONES.gold} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
