/// <reference types="@cloudflare/workers-types" />
import { Env, json, corsOptions } from './_shared'

export const onRequestOptions: PagesFunction = async () => corsOptions()

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { results } = await ctx.env.DB.prepare(`
    SELECT display_name, total_points, s.current_streak,
           u.char_type, u.fur_color, u.outfit_color
    FROM users u
    LEFT JOIN streaks s ON s.user_id = u.id
    WHERE display_name IS NOT NULL AND display_name != ''
    ORDER BY total_points DESC
    LIMIT 20
  `).all<{
    display_name: string
    total_points: number
    current_streak: number
    char_type: string
    fur_color: string
    outfit_color: string
  }>()

  return json(results)
}
