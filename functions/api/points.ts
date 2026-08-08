/// <reference types="@cloudflare/workers-types" />
import { Env, json, corsOptions, getSessionUser } from './_shared'

export const onRequestOptions: PagesFunction = async () => corsOptions()

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const user = await getSessionUser(ctx.env.DB, ctx.request)
  if (!user) return json({ error: 'Not logged in' }, 401)

  const { amount } = await ctx.request.json<{ amount: number }>()
  if (!amount || amount < 0) return json({ error: 'Invalid amount' }, 400)

  await ctx.env.DB.prepare(
    'UPDATE users SET total_points = total_points + ? WHERE id = ?'
  ).bind(amount, user.id).run()

  const row = await ctx.env.DB.prepare('SELECT total_points FROM users WHERE id = ?')
    .bind(user.id).first<{ total_points: number }>()

  return json({ total_points: row?.total_points ?? 0 })
}
