import { ADMIN_EMAIL, developerRecord } from './auth.js'

const KEY = 'restprime-access-v1'

export function loadAccess() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!saved?.users?.some((user) => user.email === ADMIN_EMAIL && user.role === 'developer')) return seed()
    return {
      sessionEmail: saved.sessionEmail || null,
      users: saved.users,
      notices: saved.notices || [],
    }
  } catch {
    return seed()
  }
}

export function saveAccess(access) {
  localStorage.setItem(KEY, JSON.stringify(access))
}

function seed() {
  return { sessionEmail: null, users: [developerRecord()], notices: [] }
}
