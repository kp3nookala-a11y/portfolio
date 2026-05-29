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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }

  const body: RequestBody = await context.request.json()
  const { grade, topic, difficulty, previousQuestions, checkAnswer } = body

  let prompt: string

  if (checkAnswer) {
    prompt = `A grade ${grade} student answered a math question.
Question: "${checkAnswer.question}"
Their answer: "${checkAnswer.userAnswer}"
Correct answer: "${checkAnswer.correctAnswer}"

Is the student's answer correct (allow equivalent forms, e.g. "1/2" and "0.5" are both correct)?
Reply with JSON only:
{"correct": true/false, "feedback": "encouraging 1-2 sentence explanation of why", "tip": "one helpful tip for next time"}`
  } else {
    const avoid = previousQuestions.length > 0
      ? `Do NOT repeat these questions: ${previousQuestions.slice(-5).join(' | ')}`
      : ''
    prompt = `Create a ${difficulty} math problem for a Grade ${grade} student on the topic: "${topic}".
${avoid}
The problem should be solvable with a short answer (number, fraction, or brief expression).
Reply with JSON only — no markdown, no extra text:
{"question": "clearly worded problem", "answer": "exact answer", "hint": "a helpful nudge without giving it away", "explanation": "step-by-step solution in 2-3 sentences"}`
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data: any = await response.json()
  const text: string = data?.content?.[0]?.text ?? '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to parse response' }

  return new Response(JSON.stringify(parsed), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
