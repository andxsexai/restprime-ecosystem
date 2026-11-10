export const ADMIN_EMAIL = 'andxstars@gmail.com'

export const STAFF_EMAILS = {
  developer: 'andxstars@gmail.com',
  admin: 'andxsex@gmail.com',
}

const STAFF_HASH = 'ef7c0e4343d362d378d170357254172c534f10b9d2234184dd0d1a4cc8ae956d'

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

export function normalizePhrase(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase()
}

export async function hashPassword(password) {
  const data = new TextEncoder().encode(String(password || ''))
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function staffRecords() {
  return [
    {
      id: 'developer',
      name: 'Разработчик',
      email: STAFF_EMAILS.developer,
      passwordHash: STAFF_HASH,
      role: 'developer',
      status: 'active',
      at: '31 окт 2026',
    },
    {
      id: 'admin-owner',
      name: 'Админ',
      email: STAFF_EMAILS.admin,
      passwordHash: STAFF_HASH,
      role: 'admin',
      status: 'active',
      at: '9 ноя 2026',
    },
  ]
}

export function developerRecord() {
  return staffRecords()[0]
}

export function isStaffEmail(email) {
  return Object.values(STAFF_EMAILS).includes(String(email || '').trim().toLowerCase())
}
