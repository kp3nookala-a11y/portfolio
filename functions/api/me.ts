/// <reference types="@cloudflare/workers-types" />
import { Env, json, corsOptions, getSessionUser } from './_shared'

export const onRequestOptions: PagesFunction = async () => corsOptions()

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const user = await getSessionUser(ctx.env.DB, ctx.request)
  if (!user) return json({ error: 'Not logged in' }, 401)

  const streak = await ctx.env.DB
    .prepare('SELECT current_streak, last_active FROM streaks WHERE user_id = ?')
    .bind(user.id)
    .first<{ current_streak: number; last_active: string }>()

  return json({ email: user.email, streak: streak?.current_streak ?? 0, lastActive: streak?.last_active ?? null })
}
