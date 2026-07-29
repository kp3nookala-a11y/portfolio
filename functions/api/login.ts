/// <reference types="@cloudflare/workers-types" />
import { Env, json, corsOptions, verifyPassword, randomHex, updateStreak } from './_shared'

export const onRequestOptions: PagesFunction = async () => corsOptions()

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const { email, password } = await ctx.request.json<{ email: string; password: string }>()
    if (!email || !password) return json({ error: 'Email and password required' }, 400)

    const db = ctx.env.DB
    const user = await db
      .prepare('SELECT id, email, password_hash FROM users WHERE email = ?')
      .bind(email.toLowerCase())
      .first<{ id: string; email: string; password_hash: string }>()

    if (!user || !(await verifyPassword(password, user.password_hash)))
      return json({ error: 'Incorrect email or password' }, 401)

    const token = randomHex(32)
    const expires = Date.now() + 30 * 24 * 60 * 60 * 1000
    await db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').bind(token, user.id, expires).run()

    const streak = await updateStreak(db, user.id)
    return json({ token, email: user.email, streak })
  } catch (e: any) {
    return json({ error: e.message ?? 'Server error' }, 500)
  }
}
