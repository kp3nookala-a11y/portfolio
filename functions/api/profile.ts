/// <reference types="@cloudflare/workers-types" />
import { Env, json, corsOptions, getSessionUser } from './_shared'

export const onRequestOptions: PagesFunction = async () => corsOptions()

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const user = await getSessionUser(ctx.env.DB, ctx.request)
  if (!user) return json({ error: 'Not logged in' }, 401)

  const { display_name, char_type, fur_color, outfit_color } =
    await ctx.request.json<{ display_name?: string; char_type?: string; fur_color?: string; outfit_color?: string }>()

  await ctx.env.DB.prepare(
    'UPDATE users SET display_name = ?, char_type = ?, fur_color = ?, outfit_color = ? WHERE id = ?'
  ).bind(display_name?.trim() || null, char_type || null, fur_color || null, outfit_color || null, user.id).run()

  return json({ ok: true })
}
