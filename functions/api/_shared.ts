/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database
  RESEND_API_KEY?: string
  ANTHROPIC_API_KEY?: string
}

export const CORS: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

export function corsOptions(): Response {
  return new Response(null, { headers: CORS })
}

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key, 256
  )
  const toHex = (b: Uint8Array) => Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('')
  return `${toHex(salt)}:${toHex(new Uint8Array(bits))}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)))
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key, 256
  )
  const hash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
  return hash === hashHex
}

export function randomHex(bytes: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map(b => b.toString(16).padStart(2, '0')).join('')
}

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

export function daysBetween(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

export async function getSessionUser(
  db: D1Database,
  request: Request
): Promise<{ id: string; email: string } | null> {
  const auth = request.headers.get('Authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const row = await db
    .prepare('SELECT u.id, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?')
    .bind(token, Date.now())
    .first<{ id: string; email: string }>()
  return row ?? null
}

export async function updateStreak(
  db: D1Database,
  userId: string
): Promise<number> {
  const today = todayUTC()
  const row = await db
    .prepare('SELECT last_active, current_streak FROM streaks WHERE user_id = ?')
    .bind(userId)
    .first<{ last_active: string; current_streak: number }>()

  if (!row) {
    await db.prepare('INSERT INTO streaks (user_id, last_active, current_streak) VALUES (?, ?, 1)').bind(userId, today).run()
    return 1
  }

  const diff = daysBetween(row.last_active, today)
  if (diff === 0) return row.current_streak
  const next = diff === 1 ? row.current_streak + 1 : 1
  await db.prepare('UPDATE streaks SET last_active = ?, current_streak = ? WHERE user_id = ?').bind(today, next, userId).run()
  return next
}
