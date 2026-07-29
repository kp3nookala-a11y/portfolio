/// <reference types="@cloudflare/workers-types" />
import { Env, json, corsOptions } from './_shared'

export const onRequestOptions: PagesFunction = async () => corsOptions()

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const auth = ctx.request.headers.get('Authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (token) await ctx.env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
  return json({ ok: true })
}
