/// <reference types="@cloudflare/workers-types" />
import { Env, json, corsOptions, hashPassword, randomHex, updateStreak } from './_shared'

export const onRequestOptions: PagesFunction = async () => corsOptions()

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const { email, password, display_name } = await ctx.request.json<{ email: string; password: string; display_name?: string }>()
    if (!email || !password) return json({ error: 'Email and password required' }, 400)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Invalid email address' }, 400)
    if (password.length < 6) return json({ error: 'Password must be at least 6 characters' }, 400)

    const db = ctx.env.DB
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first()
    if (existing) return json({ error: 'Email already registered' }, 409)

    const id = randomHex(16)
    const hash = await hashPassword(password)
    await db.prepare('INSERT INTO users (id, email, password_hash, created_at, display_name) VALUES (?, ?, ?, ?, ?)')
      .bind(id, email.toLowerCase(), hash, Date.now(), display_name?.trim() || null).run()

    const token = randomHex(32)
    const expires = Date.now() + 30 * 24 * 60 * 60 * 1000
    await db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').bind(token, id, expires).run()

    const streak = await updateStreak(db, id)
    return json({ token, email: email.toLowerCase(), streak })
  } catch (e: any) {
    return json({ error: e.message ?? 'Server error' }, 500)
  }
}
