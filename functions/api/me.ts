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

  const profile = await ctx.env.DB.prepare(
    'SELECT display_name, char_type, fur_color, outfit_color, total_points FROM users WHERE id = ?'
  ).bind(user.id).first<{ display_name: string; char_type: string; fur_color: string; outfit_color: string; total_points: number }>()

  return json({
    email: user.email,
    streak: streak?.current_streak ?? 0,
    lastActive: streak?.last_active ?? null,
    displayName: profile?.display_name ?? null,
    charType: profile?.char_type ?? null,
    furColor: profile?.fur_color ?? null,
    outfitColor: profile?.outfit_color ?? null,
    totalPoints: profile?.total_points ?? 0,
  })
}
