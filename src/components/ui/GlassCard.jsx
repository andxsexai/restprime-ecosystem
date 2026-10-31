import { motion } from 'framer-motion'

export default function GlassCard({ className = '', children, as: Tag = 'article' }) {
  const MotionTag = motion.create(Tag)
  return (
    <MotionTag
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-3xl border border-[#C9A96A]/20 bg-[#121A14]/60 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md ${className}`}
    >
      {children}
    </MotionTag>
  )
}
