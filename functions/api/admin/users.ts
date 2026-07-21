/// <reference types="@cloudflare/workers-types" />
import { Env, json, corsOptions, getSessionUser } from '../_shared'

const ADMIN_EMAIL = 'kiannookala@gmail.com'

export const onRequestOptions: PagesFunction = async () => corsOptions()

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const user = await getSessionUser(ctx.env.DB, ctx.request)
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) return json({ error: 'Unauthorized' }, 403)

  const { results } = await ctx.env.DB.prepare(`
    SELECT u.email, u.created_at, s.current_streak, s.last_active
    FROM users u
    LEFT JOIN streaks s ON s.user_id = u.id
    ORDER BY u.created_at DESC
  `).all<{ email: string; created_at: number; current_streak: number; last_active: string }>()

  return json(results)
}
