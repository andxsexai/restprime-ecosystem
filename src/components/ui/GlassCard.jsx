export default function GlassCard({ className = '', children, as: Tag = 'article' }) {
  return <Tag className={`spatial-card ${className}`}>{children}</Tag>
}
