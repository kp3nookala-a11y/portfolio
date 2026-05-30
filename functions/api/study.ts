/// <reference types="@cloudflare/workers-types" />

interface Env {
  ANTHROPIC_API_KEY: string
}

interface RequestBody {
  grade: number
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  previousQuestions: string[]
  checkAnswer?: { question: string; userAnswer: string; correctAnswer: string }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const apiKey = context.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return json({ error: 'ANTHROPIC_API_KEY is not set in Cloudflare environment variables.' }, 500)
    }

    let body: RequestBody
    try {
      body = await context.request.json()
    } catch {
      return json({ error: 'Invalid request body.' }, 400)
    }

    const { grade, topic, difficulty, previousQuestions, checkAnswer } = body

    let prompt: string

    if (checkAnswer) {
      prompt = `A grade ${grade} student answered a math question.
Question: "${checkAnswer.question}"
Their answer: "${checkAnswer.userAnswer}"
Correct answer: "${checkAnswer.correctAnswer}"

Is the student's answer correct? Be generous — accept any equivalent form. Examples of what counts as correct:
- "2/4", "4/8", "0.5" all equal "1/2"
- "6/4" equals "3/2" equals "1.5"
- decimals rounded to 2 places are fine
- do NOT require lowest common denominator or simplified form
Respond with valid JSON only, no markdown:
{"correct": true, "feedback": "one encouraging sentence", "tip": "one short tip"}`
    } else {
      const avoid = previousQuestions.length > 0
        ? `Do NOT use any of these questions: ${previousQuestions.slice(-5).join(' | ')}.`
        : ''
      prompt = `Generate a ${difficulty}-level math problem for a Grade ${grade} student on the topic "${topic}". ${avoid}
The answer must be a short value (a number, simple fraction, or brief expression — NOT a paragraph).
Respond with valid JSON only, no markdown, no code fences:
{"question": "the problem statement", "answer": "short exact answer", "hint": "a nudge without giving it away", "explanation": "brief 2-sentence step-by-step solution"}`
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text()
      return json({ error: `Anthropic API error: ${anthropicRes.status} — ${err}` }, 502)
    }

    const data: any = await anthropicRes.json()
    const text: string = data?.content?.[0]?.text ?? ''

    if (!text) {
      return json({ error: 'Empty response from AI.' }, 502)
    }

    // Strip any markdown code fences then extract JSON
    const cleaned = text.replace(/```json?/gi, '').replace(/```/g, '').trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) {
      return json({ error: 'AI response was not valid JSON.', raw: text }, 502)
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(match[0])
    } catch {
      return json({ error: 'Failed to parse AI JSON.', raw: text }, 502)
    }

    return json(parsed)
  } catch (err: any) {
    return json({ error: err?.message ?? 'Unexpected server error.' }, 500)
  }
}
