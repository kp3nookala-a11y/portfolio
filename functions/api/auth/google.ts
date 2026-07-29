/// <reference types="@cloudflare/workers-types" />

interface Env {
  GOOGLE_CLIENT_ID: string
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const clientId = ctx.env.GOOGLE_CLIENT_ID
  if (!clientId) return new Response('GOOGLE_CLIENT_ID not set', { status: 500 })

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', `https://kiannookala.com/api/auth/callback`)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('prompt', 'select_account')

  return Response.redirect(url.toString(), 302)
}
