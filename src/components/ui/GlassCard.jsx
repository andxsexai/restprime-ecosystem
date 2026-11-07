import { motion } from 'framer-motion'

export default function GlassCard({ className = '', children, as: Tag = 'article', sticky = false }) {
  const skin = `group rounded-3xl border border-[#C9A96A]/20 bg-[#121A14]/60 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md ${className}`
  if (sticky) return <Tag className={skin}>{children}</Tag>
  const MotionTag = motion.create(Tag)
  return (
    <MotionTag
      whileHover={{ y: -4, scale: 1.012 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={skin}
    >
      {children}
    </MotionTag>
  )
}
