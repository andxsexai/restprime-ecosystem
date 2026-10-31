export const ADMIN_EMAIL = 'andxstars@gmail.com'

const ADMIN_HASH = '9a63af9bbed43be5e9a6332ea21380f96192ded15112d643bee6cb491c2dfae5'

export const ROLES = [
  { id: 'admin', label: 'Админ' },
  { id: 'director', label: 'Директор' },
  { id: 'chef', label: 'Повар' },
  { id: 'developer', label: 'Разработчик' },
]

export const SIGNUP_ROLES = ROLES.filter((role) => role.id !== 'developer')

export function roleLabel(id) {
  return ROLES.find((role) => role.id === id)?.label || 'Сотрудник'
}

export async function hashPassword(password) {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function developerRecord() {
  return {
    id: 'developer',
    name: 'Разработчик',
    email: ADMIN_EMAIL,
    passwordHash: ADMIN_HASH,
    role: 'developer',
    status: 'active',
    at: '31 окт 2026',
  }
}
