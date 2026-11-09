import { ADMIN_EMAIL, staffRecords } from './auth.js'

const KEY = 'restprime-access-v1'

function withStaff(saved) {
  const staff = staffRecords()
  const known = new Map((saved?.users || []).map((user) => [user.email, user]))
  for (const person of staff) {
    const prev = known.get(person.email)
    known.set(person.email, prev
      ? { ...prev, ...person, id: prev.id || person.id, secretHash: prev.secretHash }
      : person)
  }
  const users = staff.map((person) => known.get(person.email))
  for (const user of saved?.users || []) {
    if (!staff.some((person) => person.email === user.email)) users.push(user)
  }
  return {
    sessionEmail: saved?.sessionEmail || null,
    users,
    notices: saved?.notices || [],
  }
}

export function applyStaff(access) {
  return withStaff(access)
}

export function loadAccess() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    const next = withStaff(saved)
    if (!next.users.some((user) => user.email === ADMIN_EMAIL && user.role === 'developer')) return seed()
    return next
  } catch {
    return seed()
  }
}

export function saveAccess(access) {
  try {
    localStorage.setItem(KEY, JSON.stringify(access))
  } catch {
    /* память браузера закрыта: доступ живёт до закрытия вкладки */
  }
}

function seed() {
  return { sessionEmail: null, users: staffRecords(), notices: [] }
}
