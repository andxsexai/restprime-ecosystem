export const ADMIN_EMAIL = 'andxstars@gmail.com'

const ADMIN_HASH = '9a63af9bbed43be5e9a6332ea21380f96192ded15112d643bee6cb491c2dfae5'

export async function passwordMatches(password) {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return hex === ADMIN_HASH
}
