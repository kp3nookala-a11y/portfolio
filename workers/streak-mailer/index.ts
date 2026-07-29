/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database
  RESEND_API_KEY: string
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    const today = new Date().toISOString().slice(0, 10)

    // Find users who haven't visited today and have a streak worth saving
    const { results } = await env.DB.prepare(`
      SELECT u.email, s.current_streak, s.last_active
      FROM streaks s
      JOIN users u ON s.user_id = u.id
      WHERE s.last_active < ?
      AND s.current_streak >= 2
    `).bind(today).all<{ email: string; current_streak: number; last_active: string }>()

    for (const user of results) {
      await sendStreakEmail(env.RESEND_API_KEY, user.email, user.current_streak)
      await new Promise(r => setTimeout(r, 100)) // avoid rate limits
    }
  },
}

async function sendStreakEmail(apiKey: string, email: string, streak: number) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'A+ Mathematics <noreply@kiannookala.com>',
      to: email,
      subject: `🔥 Don't lose your ${streak}-day streak!`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0a1630;color:#fff;padding:2rem;border-radius:16px">
          <h1 style="color:#4a7fff;margin:0 0 0.5rem">🔥 ${streak}-Day Streak at Risk!</h1>
          <p style="color:#a0b4ff;font-size:1.05rem;margin:0 0 1.5rem">
            You haven't practiced math today yet. Log in to keep your ${streak}-day streak alive before midnight!
          </p>
          <a href="https://kiannookala.com" style="display:inline-block;background:#4a7fff;color:#fff;text-decoration:none;padding:0.8rem 1.6rem;border-radius:8px;font-weight:700;font-size:1rem">
            Practice Now →
          </a>
          <p style="color:#4a6080;font-size:0.8rem;margin-top:2rem">
            You're receiving this because you have an account at A+ Mathematics.<br>
            Visit kiannookala.com to log in.
          </p>
        </div>
      `,
    }),
  })
}
