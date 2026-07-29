/// <reference types="@cloudflare/workers-types" />
import { randomHex, updateStreak } from '../_shared'

interface Env {
  DB: D1Database
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const code = new URL(ctx.request.url).searchParams.get('code')
  if (!code) return Response.redirect('https://kiannookala.com/?auth_error=no_code', 302)

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: ctx.env.GOOGLE_CLIENT_ID,
      client_secret: ctx.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'https://kiannookala.com/api/auth/callback',
      grant_type: 'authorization_code',
    }),
  })

  const tokenData = await tokenRes.json() as any
  if (!tokenData.access_token) return Response.redirect('https://kiannookala.com/?auth_error=token_failed', 302)

  // Get user info from Google
  const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  const info = await infoRes.json() as any
  const email: string = info.email?.toLowerCase()
  if (!email) return Response.redirect('https://kiannookala.com/?auth_error=no_email', 302)

  const db = ctx.env.DB

  // Find or create user
  let user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: string }>()
  if (!user) {
    const id = randomHex(16)
    await db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)')
      .bind(id, email, 'google', Date.now()).run()
    user = { id }
  }

  // Create session
  const token = randomHex(32)
  const expires = Date.now() + 30 * 24 * 60 * 60 * 1000
  await db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').bind(token, user.id, expires).run()

  await updateStreak(db, user.id)

  return Response.redirect(`https://kiannookala.com/?token=${token}`, 302)
}
