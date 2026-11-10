import seedVault from '../data/teamVault.json'
import { RELAY_TEST } from './relay.js'
import { absorbDesk, emptyPurged } from './deskSync.js'

const RAW = 'https://raw.githubusercontent.com/andxsexai/restprime-ecosystem/main/src/data/teamVault.json'

function compactSignup(item) {
  const email = String(item?.email || '').trim().toLowerCase()
  if (!email) return null
  return {
    id: item.id || '',
    name: String(item.name || 'Сотрудник').slice(0, 80),
    email,
    role: item.role || 'director',
    at: item.at || '',
    status: item.status === 'rejected' ? 'rejected' : item.status === 'active' ? 'active' : 'pending',
  }
}

function emptyVault() {
  return { at: 0, tasks: [], notes: [], taskLog: [], days: [], purged: emptyPurged(), signups: [] }
}

export function seedTeamVault() {
  return normalizeVault(seedVault)
}

function normalizeVault(raw) {
  if (!raw || typeof raw !== 'object') return emptyVault()
  return {
    at: Number(raw.at) || 0,
    tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
    notes: Array.isArray(raw.notes) ? raw.notes : [],
    taskLog: Array.isArray(raw.taskLog) ? raw.taskLog : [],
    days: Array.isArray(raw.days) ? raw.days : [],
    purged: {
      tasks: Array.isArray(raw.purged?.tasks) ? raw.purged.tasks : [],
      notes: Array.isArray(raw.purged?.notes) ? raw.purged.notes : [],
    },
    signups: Array.isArray(raw.signups) ? raw.signups.map(compactSignup).filter(Boolean) : [],
  }
}

export function mergeVault(local, vault) {
  const snap = normalizeVault(vault)
  const owner = local.owner || ''
  const base = {
    tasks: local.tasks || [],
    taskLog: local.taskLog || [],
    notes: local.notes || [],
    purged: local.purged || emptyPurged(),
    days: local.days || [],
  }
  const next = absorbDesk(base, snap, owner)
  return next
}

export async function pullTeamVault() {
  if (RELAY_TEST) return seedTeamVault()
  const urls = [
    `${import.meta.env.BASE_URL}teamVault.json`,
    RAW,
  ]
  for (const url of urls) {
    try {
      const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`, { cache: 'no-store' })
      if (!response.ok) continue
      const raw = await response.json()
      const vault = normalizeVault(raw)
      if (vault.tasks.length || vault.notes.length || vault.days.length || vault.signups.length) return vault
    } catch {
      /* сейф ещё не доступен по этой ссылке — пробуем следующую */
    }
  }
  return seedTeamVault()
}
