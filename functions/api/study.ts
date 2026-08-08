/// <reference types="@cloudflare/workers-types" />
import { Env, json, corsOptions } from './_shared'

interface StudyEnv extends Env {
  GEMINI_API_KEY: string
}

interface RequestBody {
  grade: number
  topic: string
  subject: string
  message: string
  history: { role: 'user' | 'model'; text: string }[]
}

export const onRequestOptions: PagesFunction = async () => corsOptions()

export const onRequestPost: PagesFunction<StudyEnv> = async (ctx) => {
  try {
    const apiKey = ctx.env.GEMINI_API_KEY
    if (!apiKey) return json({ error: 'AI Study Mode is not configured yet.' }, 500)

    const { grade, topic, subject, message, history } = await ctx.request.json<RequestBody>()

    const systemPrompt = `You are a friendly, encouraging tutor at Ace Academy for Grade ${grade} students.
You are helping with ${subject} — specifically the topic: "${topic}".
Keep responses short (2-4 sentences max), clear, and age-appropriate.
Use simple words. Never give the full answer directly — guide the student to figure it out.
Be warm and enthusiastic. Use occasional emojis.`

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: `Got it! I'm ready to help with ${subject} for Grade ${grade}. Let's do this! 🎉` }] },
      ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: message }] },
    ]

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 256, temperature: 0.7 } }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      return json({ error: `AI error: ${res.status}` }, 502)
    }

    const data: any = await res.json()
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    if (!text) return json({ error: 'Empty response from AI.' }, 502)

    return json({ reply: text })
  } catch (err: any) {
    return json({ error: err?.message ?? 'Unexpected error.' }, 500)
  }
}
