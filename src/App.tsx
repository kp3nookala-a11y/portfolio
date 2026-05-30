import { useState, useMemo, useEffect, useRef } from 'react'
import './App.css'

const expressions = [
  '12 × 13 = 156', '√144 = 12', '∫x² dx', '7! = 5040', 'log₂(64) = 6',
  'sin(90°) = 1', 'd/dx[x³] = 3x²', 'π² ≈ 9.87', '2⁸ = 256', 'cos(0°) = 1',
  '15² - 14² = 29', '∑(1..10) = 55', 'tan(45°) = 1', '√(9+16) = 5',
  '99² = 9801', 'e⁰ = 1', '11³ = 1331', 'GCD(48,18) = 6', '0.1+0.2 ≈ 0.3',
  'lim sin(x)/x = 1', 'φ = 1.618...', 'i² = -1', 'e^iπ + 1 = 0',
  '∇²f = 0', 'n! / r!(n-r)!', 'a² + b² = c²', 'F = ma', 'E = mc²',
  'sin²θ + cos²θ = 1', 'ln(e) = 1', 'log(1) = 0', '13 mod 5 = 3',
  '2+2 = 4', '7×8 = 56', '144/12 = 12', '3³ = 27', '√81 = 9',
  '5! = 120', '∑n = n(n+1)/2', 'C(10,3) = 120', '17 is prime',
  'sin(30°) = 0.5', 'cos(60°) = 0.5', 'tan(45°) = 1', '2^10 = 1024',
  '∫cos(x) dx = sin(x) + C', 'd/dx[eˣ] = eˣ', 'x²-1 = (x+1)(x-1)',
]

type Lesson = { topic: string; description: string; problems: { q: string; a: string }[] }

const curriculum: Record<number, { label: string; lessons: Lesson[] }> = {
  1: { label: 'Grade 1 → Grade 2', lessons: [
    { topic: 'Addition up to 100', description: 'Adding two-digit numbers.', problems: [{ q: '34 + 21 = ?', a: '55' }, { q: '47 + 36 = ?', a: '83' }, { q: '52 + 29 = ?', a: '81' }] },
    { topic: 'Subtraction up to 100', description: 'Subtracting two-digit numbers.', problems: [{ q: '75 − 32 = ?', a: '43' }, { q: '90 − 47 = ?', a: '43' }, { q: '61 − 28 = ?', a: '33' }] },
    { topic: 'Skip Counting', description: 'Count by 2s, 5s, and 10s.', problems: [{ q: 'Count by 5s: 5,10,15,?,?', a: '20,25' }, { q: 'Count by 2s: 2,4,6,?,?', a: '8,10' }, { q: 'Count by 10s: 10,20,?,?', a: '30,40' }] },
  ]},
  2: { label: 'Grade 2 → Grade 3', lessons: [
    { topic: 'Multiplication Intro', description: 'Multiplication as repeated addition.', problems: [{ q: '3 × 4 = ?', a: '12' }, { q: '5 × 6 = ?', a: '30' }, { q: '7 × 2 = ?', a: '14' }] },
    { topic: 'Fractions Intro', description: 'Halves, thirds, and quarters.', problems: [{ q: '1/2 of 8 = ?', a: '4' }, { q: '1/4 of 12 = ?', a: '3' }, { q: '1/3 of 9 = ?', a: '3' }] },
    { topic: 'Place Value', description: 'Hundreds, tens, and ones.', problems: [{ q: 'Hundreds digit of 374?', a: '3' }, { q: '200+50+6 = ?', a: '256' }, { q: '400+30+7 = ?', a: '437' }] },
  ]},
  3: { label: 'Grade 3 → Grade 4', lessons: [
    { topic: 'Long Multiplication', description: 'Multiplying larger numbers.', problems: [{ q: '12 × 11 = ?', a: '132' }, { q: '14 × 6 = ?', a: '84' }, { q: '25 × 4 = ?', a: '100' }] },
    { topic: 'Division', description: 'Dividing with remainders.', problems: [{ q: '48 ÷ 6 = ?', a: '8' }, { q: '37 ÷ 5 = ?', a: '7r2' }, { q: '72 ÷ 8 = ?', a: '9' }] },
    { topic: 'Area & Perimeter', description: 'Rectangles and squares.', problems: [{ q: 'Perimeter of 4×6?', a: '20' }, { q: 'Area of 5×7?', a: '35' }, { q: 'Perimeter square side 9?', a: '36' }] },
  ]},
  4: { label: 'Grade 4 → Grade 5', lessons: [
    { topic: 'Fractions & Decimals', description: 'Converting between them.', problems: [{ q: '3/4 as decimal?', a: '0.75' }, { q: '0.5 as fraction?', a: '1/2' }, { q: '1/5 as decimal?', a: '0.2' }] },
    { topic: 'Adding Fractions', description: 'Like and unlike denominators.', problems: [{ q: '1/4 + 2/4 = ?', a: '3/4' }, { q: '1/3 + 1/6 = ?', a: '1/2' }, { q: '2/5 + 1/10 = ?', a: '1/2' }] },
    { topic: 'Multi-digit Multiplication', description: '3-digit by 2-digit.', problems: [{ q: '123 × 12 = ?', a: '1476' }, { q: '204 × 11 = ?', a: '2244' }, { q: '312 × 21 = ?', a: '6552' }] },
  ]},
  5: { label: 'Grade 5 → Grade 6', lessons: [
    { topic: 'Ratios & Proportions', description: 'Solving ratios.', problems: [{ q: '3:5 = ?:20', a: '12' }, { q: 'Simplify 12:16', a: '3:4' }, { q: '60% of 80 = ?', a: '48' }] },
    { topic: 'Negative Numbers', description: 'Operations with negatives.', problems: [{ q: '-4 + 7 = ?', a: '3' }, { q: '5 − (−3) = ?', a: '8' }, { q: '-6 × -2 = ?', a: '12' }] },
    { topic: 'Variables', description: 'One-step equations.', problems: [{ q: 'x + 5 = 12', a: '7' }, { q: '3y = 21', a: '7' }, { q: 'z − 4 = 9', a: '13' }] },
  ]},
  6: { label: 'Grade 6 → Grade 7', lessons: [
    { topic: 'Linear Equations', description: 'Two-step equations.', problems: [{ q: '2x + 3 = 11', a: '4' }, { q: '5y − 4 = 16', a: '4' }, { q: '3z + 7 = 22', a: '5' }] },
    { topic: 'Geometry: Angles', description: 'Complementary & supplementary.', problems: [{ q: 'Complement of 35°?', a: '55' }, { q: 'Supplement of 110°?', a: '70' }, { q: 'Angles in a triangle?', a: '180' }] },
    { topic: 'Probability', description: 'Basic probability.', problems: [{ q: 'P(heads) = ?', a: '1/2' }, { q: 'P(rolling 3) = ?', a: '1/6' }, { q: 'P(red card) = ?', a: '1/2' }] },
  ]},
  7: { label: 'Grade 7 → Grade 8', lessons: [
    { topic: 'Systems of Equations', description: 'Two equations, two unknowns.', problems: [{ q: 'x+y=10, x−y=2. x=?', a: '6' }, { q: '2x+y=9, x+y=5. x=?', a: '4' }, { q: 'x+2y=8, x−y=2. y=?', a: '2' }] },
    { topic: 'Exponent Rules', description: 'Laws of exponents.', problems: [{ q: 'x³ × x⁴ = ?', a: 'x7' }, { q: '(x²)³ = ?', a: 'x6' }, { q: '2^10 = ?', a: '1024' }] },
    { topic: 'Pythagorean Theorem', description: 'Right triangle sides.', problems: [{ q: 'a=3,b=4,c=?', a: '5' }, { q: 'a=5,c=13,b=?', a: '12' }, { q: 'a=8,b=6,c=?', a: '10' }] },
  ]},
  8: { label: 'Grade 8 → Algebra I', lessons: [
    { topic: 'Quadratic Equations', description: 'Solve by factoring.', problems: [{ q: 'x²−5x+6=0, x=?', a: '2,3' }, { q: 'x²−9=0, x=?', a: '3,-3' }, { q: 'x²+4x+4=0, x=?', a: '-2' }] },
    { topic: 'Functions', description: 'Function notation f(x).', problems: [{ q: 'f(x)=2x+1. f(3)=?', a: '7' }, { q: 'g(x)=x². g(−4)=?', a: '16' }, { q: 'h(x)=3x−5. h(0)=?', a: '-5' }] },
    { topic: 'Inequalities', description: 'Solve linear inequalities.', problems: [{ q: '2x+1>7', a: 'x>3' }, { q: '3x−4≤11', a: 'x≤5' }, { q: '−2x>8', a: 'x<-4' }] },
  ]},
  9: { label: 'Grade 9 → Geometry', lessons: [
    { topic: 'Trigonometry', description: 'SOH-CAH-TOA.', problems: [{ q: 'sin(30°) = ?', a: '0.5' }, { q: 'cos(60°) = ?', a: '0.5' }, { q: 'tan(45°) = ?', a: '1' }] },
    { topic: 'Circle Theorems', description: 'Area and circumference.', problems: [{ q: 'Area circle r=5?', a: '78.54' }, { q: 'Circumference r=7?', a: '43.98' }, { q: 'Diameter if r=6?', a: '12' }] },
    { topic: 'Proofs & Logic', description: 'If-then statements.', problems: [{ q: 'Converse of "If p then q"?', a: 'if q then p' }, { q: 'Vertical angles are?', a: 'equal' }, { q: 'Sum of angles in triangle?', a: '180' }] },
  ]},
  10: { label: 'Grade 10 → Algebra II', lessons: [
    { topic: 'Logarithms', description: 'Log properties and solving.', problems: [{ q: 'log₂(32) = ?', a: '5' }, { q: 'log(100) = ?', a: '2' }, { q: 'ln(e³) = ?', a: '3' }] },
    { topic: 'Complex Numbers', description: 'Imaginary numbers.', problems: [{ q: 'i² = ?', a: '-1' }, { q: '|3+4i| = ?', a: '5' }, { q: '(3+2i)+(1−4i) = ?', a: '4-2i' }] },
    { topic: 'Sequences', description: 'Arithmetic and geometric.', problems: [{ q: '5th term: 2,5,8,11,...', a: '14' }, { q: '∑(1 to 5) 2n = ?', a: '30' }, { q: 'Geo: 3,6,12,... 6th?', a: '96' }] },
  ]},
  11: { label: 'Grade 11 → Pre-Calc', lessons: [
    { topic: 'Limits', description: 'Introduction to limits.', problems: [{ q: 'lim x→∞ of 1/x = ?', a: '0' }, { q: 'lim x→0 sin(x)/x = ?', a: '1' }, { q: 'lim x→2 x² = ?', a: '4' }] },
    { topic: 'Vectors', description: 'Magnitude and dot product.', problems: [{ q: '|⟨3,4⟩| = ?', a: '5' }, { q: '⟨1,2⟩·⟨3,4⟩ = ?', a: '11' }, { q: '⟨2,3⟩+⟨-1,5⟩ = ?', a: '1,8' }] },
    { topic: 'Polar Coordinates', description: 'Polar vs Cartesian.', problems: [{ q: 'Polar(2,90°) to Cart y=?', a: '2' }, { q: 'Cart(1,1) r=?', a: '1.41' }, { q: 'r=2cos(θ) is a?', a: 'circle' }] },
  ]},
  12: { label: 'Grade 12 → Calculus', lessons: [
    { topic: 'Derivatives', description: 'Differentiation rules.', problems: [{ q: 'd/dx[x⁴] = ?', a: '4x3' }, { q: 'd/dx[sin(x)] = ?', a: 'cos(x)' }, { q: 'd/dx[eˣ] = ?', a: 'ex' }] },
    { topic: 'Integrals', description: 'Antiderivatives.', problems: [{ q: '∫x² dx = ?', a: 'x3/3+c' }, { q: '∫₀¹ x dx = ?', a: '0.5' }, { q: '∫cos(x) dx = ?', a: 'sin(x)+c' }] },
    { topic: 'Chain Rule', description: 'Composite functions.', problems: [{ q: 'd/dx[e^(3x)] = ?', a: '3e3x' }, { q: 'd/dx[(x²+1)³] = ?', a: '6x(x2+1)2' }, { q: 'd/dx[sin(x²)] = ?', a: '2xcos(x2)' }] },
  ]},
}

function seededRandom(seed: number) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

// ── Mini Game ──────────────────────────────────────────────
type FallingProblem = { id: number; q: string; a: number; y: number; x: number; speed: number }

function MathGame({ onClose }: { onClose: () => void }) {
  const [problems, setProblems] = useState<FallingProblem[]>([])
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null)
  const nextId = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  function genProblem(): FallingProblem {
    const ops = [
      () => { const a = Math.floor(Math.random()*12)+1, b = Math.floor(Math.random()*12)+1; return { q: `${a} × ${b}`, a: a*b } },
      () => { const a = Math.floor(Math.random()*20)+1, b = Math.floor(Math.random()*20)+1; return { q: `${a} + ${b}`, a: a+b } },
      () => { const a = Math.floor(Math.random()*20)+10, b = Math.floor(Math.random()*10)+1; return { q: `${a} − ${b}`, a: a-b } },
      () => { const b = Math.floor(Math.random()*9)+2, a = b*(Math.floor(Math.random()*10)+1); return { q: `${a} ÷ ${b}`, a: a/b } },
    ]
    const op = ops[Math.floor(Math.random()*ops.length)]()
    return { id: nextId.current++, ...op, y: 0, x: 5 + Math.random() * 70, speed: 0.3 + Math.random() * 0.3 }
  }

  useEffect(() => {
    if (gameOver) return
    inputRef.current?.focus()
    const spawn = setInterval(() => {
      setProblems(p => [...p.slice(-6), genProblem()])
    }, 2000)
    return () => clearInterval(spawn)
  }, [gameOver])

  useEffect(() => {
    if (gameOver) return
    const tick = setInterval(() => {
      setProblems(prev => {
        const updated = prev.map(p => ({ ...p, y: p.y + p.speed }))
        const escaped = updated.filter(p => p.y >= 90)
        if (escaped.length > 0) {
          setLives(l => {
            const next = l - escaped.length
            if (next <= 0) setGameOver(true)
            return Math.max(0, next)
          })
          return updated.filter(p => p.y < 90)
        }
        return updated
      })
    }, 50)
    return () => clearInterval(tick)
  }, [gameOver])

  function submit() {
    const val = parseInt(input.trim())
    const match = problems.find(p => p.a === val)
    if (match) {
      setProblems(p => p.filter(x => x.id !== match.id))
      setScore(s => s + 10)
      setFlash('correct')
    } else {
      setFlash('wrong')
    }
    setInput('')
    setTimeout(() => setFlash(null), 400)
  }

  return (
    <div className={`game-overlay ${flash === 'correct' ? 'flash-correct' : flash === 'wrong' ? 'flash-wrong' : ''}`}>
      <div className="game-header">
        <span>🎮 Math Blaster</span>
        <span>Score: {score}</span>
        <span>{'❤️'.repeat(lives)}</span>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      {!gameOver && problems.length === 0 && (
        <div className="game-directions">
          <div className="gdir-title">🎮 How to Play Math Blaster</div>
          <div className="gdir-step">➊ Math problems fall from the top of the screen</div>
          <div className="gdir-step">➋ Type the answer in the box at the bottom</div>
          <div className="gdir-step">➌ Press <kbd>Enter</kbd> or <kbd>✓</kbd> to submit</div>
          <div className="gdir-step">➍ Don't let problems reach the bottom — you lose a ❤️ each time one escapes!</div>
          <div className="gdir-step">➎ Earn <strong>+10 pts</strong> for every correct answer</div>
          <div className="gdir-step">You have <strong>3 lives</strong>. Good luck! 🚀</div>
        </div>
      )}
      {gameOver ? (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Score: {score}</p>
          <button className="grade-btn active" onClick={() => { setGameOver(false); setProblems([]); setScore(0); setLives(3) }}>Play Again</button>
          <button className="grade-btn" onClick={onClose} style={{ marginLeft: '1rem' }}>Exit</button>
        </div>
      ) : (
        <div className="game-arena">
          {problems.map(p => (
            <div key={p.id} className="falling-problem" style={{ top: `${p.y}%`, left: `${p.x}%` }}>
              {p.q} = ?
            </div>
          ))}
          <div className="game-input-row">
            <input
              ref={inputRef}
              className="game-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Type answer + Enter"
              autoFocus
            />
            <button className="grade-btn active" onClick={submit}>✓</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── AI Study Mode ──────────────────────────────────────────
const topics: Record<number, string[]> = {
  1: ['Addition', 'Subtraction', 'Skip Counting'],
  2: ['Multiplication', 'Fractions', 'Place Value'],
  3: ['Long Multiplication', 'Division', 'Area & Perimeter'],
  4: ['Fractions & Decimals', 'Adding Fractions', 'Multi-digit Multiplication'],
  5: ['Ratios', 'Negative Numbers', 'Variables'],
  6: ['Linear Equations', 'Angles', 'Probability'],
  7: ['Systems of Equations', 'Exponent Rules', 'Pythagorean Theorem'],
  8: ['Quadratic Equations', 'Functions', 'Inequalities'],
  9: ['Trigonometry', 'Circle Theorems', 'Logic & Proofs'],
  10: ['Logarithms', 'Complex Numbers', 'Sequences & Series'],
  11: ['Limits', 'Vectors', 'Polar Coordinates'],
  12: ['Derivatives', 'Integrals', 'Chain Rule'],
}

type AIProblem = {
  question: string
  answer: string
  hint: string
  explanation: string
}

type AIFeedback = {
  correct: boolean
  feedback: string
  tip: string
}

function StudyMode({ onCorrect }: { onCorrect: () => void }) {
  const [grade, setGrade] = useState<number>(6)
  const [topic, setTopic] = useState<string>(topics[6][0])
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [problem, setProblem] = useState<AIProblem | null>(null)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<AIFeedback | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [checkingAnswer, setCheckingAnswer] = useState(false)
  const [streak, setStreak] = useState(0)
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  async function generateProblem() {
    setLoading(true)
    setError(null)
    setProblem(null)
    setFeedback(null)
    setInput('')
    setShowHint(false)
    try {
      const res = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade, topic, difficulty, previousQuestions }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setProblem(data)
      setPreviousQuestions(prev => [...prev, data.question])
    } catch (e: any) {
      setError(e.message || 'Failed to generate problem. Make sure ANTHROPIC_API_KEY is set.')
    }
    setLoading(false)
  }

  async function checkAnswer() {
    if (!problem || !input.trim()) return
    setCheckingAnswer(true)
    setFeedback(null)
    try {
      const res = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade, topic, difficulty, previousQuestions,
          checkAnswer: { question: problem.question, userAnswer: input, correctAnswer: problem.answer }
        }),
      })
      const data: AIFeedback = await res.json()
      setFeedback(data)
      if (data.correct) {
        onCorrect()
        setStreak(s => s + 1)
      } else {
        setStreak(0)
      }
    } catch {
      setFeedback({ correct: false, feedback: 'Could not check answer.', tip: '' })
    }
    setCheckingAnswer(false)
  }

  return (
    <div className="study-mode">
      <div className="study-controls">
        <div className="study-control-group">
          <label>Grade</label>
          <select className="study-select" value={grade} onChange={e => { setGrade(+e.target.value); setTopic(topics[+e.target.value][0]) }}>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
        </div>
        <div className="study-control-group">
          <label>Topic</label>
          <select className="study-select" value={topic} onChange={e => setTopic(e.target.value)}>
            {topics[grade].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="study-control-group">
          <label>Difficulty</label>
          <div className="diff-btns">
            {(['easy','medium','hard'] as const).map(d => (
              <button key={d} className={`diff-btn ${difficulty === d ? 'active-'+d : ''}`} onClick={() => setDifficulty(d)}>
                {d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'} {d}
              </button>
            ))}
          </div>
        </div>
        <button className="gen-btn" onClick={generateProblem} disabled={loading}>
          {loading ? '⏳ Generating...' : '🤖 Generate Problem'}
        </button>
      </div>

      {streak > 1 && <div className="streak-banner">🔥 {streak} in a row!</div>}

      {error && <div className="study-error">⚠️ {error}</div>}

      {problem && !loading && (
        <div className="study-card">
          <div className="study-meta">
            <span className="study-badge">Grade {grade}</span>
            <span className="study-badge">{topic}</span>
            <span className={`study-badge diff-${difficulty}`}>{difficulty}</span>
          </div>

          <div className="study-question">{problem.question}</div>

          {!feedback ? (
            <>
              <div className="study-input-row">
                <input
                  className="study-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && checkAnswer()}
                  placeholder="Type your answer..."
                  autoFocus
                />
                <button className="study-submit" onClick={checkAnswer} disabled={checkingAnswer || !input.trim()}>
                  {checkingAnswer ? '⏳' : 'Submit'}
                </button>
              </div>
              {!showHint
                ? <button className="hint-btn" onClick={() => setShowHint(true)}>💡 Show Hint</button>
                : <div className="hint-box">💡 {problem.hint}</div>
              }
            </>
          ) : (
            <div className={`feedback-box ${feedback.correct ? 'correct' : 'wrong'}`}>
              <div className="feedback-result">{feedback.correct ? '✅ Correct!' : '❌ Not quite'}</div>
              <div className="feedback-text">{feedback.feedback}</div>
              {!feedback.correct && (
                <div className="feedback-answer">Answer: <strong>{problem.answer}</strong></div>
              )}
              <div className="feedback-explanation">{problem.explanation}</div>
              {feedback.tip && <div className="feedback-tip">💡 {feedback.tip}</div>}
              <button className="gen-btn" onClick={generateProblem} style={{ marginTop: '1rem' }}>
                Next Problem →
              </button>
            </div>
          )}
        </div>
      )}

      {!problem && !loading && !error && (
        <div className="study-empty">
          <div className="study-empty-icon">🤖</div>
          <p>Pick a grade, topic, and difficulty — then hit <strong>Generate Problem</strong> to get an AI-powered math question!</p>
          <div className="study-directions">
            <div className="sdir"><span>🎯</span> <span><strong>Easy:</strong> straightforward problems to build confidence</span></div>
            <div className="sdir"><span>🔥</span> <span><strong>Medium:</strong> requires a couple of steps — great for practice</span></div>
            <div className="sdir"><span>💪</span> <span><strong>Hard:</strong> challenging problems that push your skills</span></div>
            <div className="sdir"><span>💡</span> <span>Stuck? Hit <strong>Show Hint</strong> before submitting</span></div>
            <div className="sdir"><span>⭐</span> <span>Get it right and earn <strong>+10 pts</strong> toward unlocking Math Blaster</span></div>
            <div className="sdir"><span>🔄</span> <span>AI never repeats the last 5 questions</span></div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Profile ────────────────────────────────────────────────
const AVATARS = ['🧑‍🎓','👦','👧','🧒','👨‍💻','👩‍💻','🦸','🧙','🐱','🦊','🐼','🚀']

type Profile = { name: string; grade: number; avatar: string }

function ProfileSetup({ onSave }: { onSave: (p: Profile) => void }) {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState(6)
  const [avatar, setAvatar] = useState(AVATARS[0])

  function save() {
    if (!name.trim()) return
    onSave({ name: name.trim(), grade, avatar })
  }

  return (
    <div className="profile-setup">
      <div className="profile-setup-title">👋 Create Your Profile</div>
      <p className="profile-setup-sub">Tell us about yourself so we can personalise your learning!</p>

      <div className="profile-field">
        <label>Your Name</label>
        <input
          className="profile-input"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          placeholder="Enter your name..."
          autoFocus
        />
      </div>

      <div className="profile-field">
        <label>Your Current Grade</label>
        <select className="study-select" value={grade} onChange={e => setGrade(+e.target.value)}>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
      </div>

      <div className="profile-field">
        <label>Pick an Avatar</label>
        <div className="avatar-grid">
          {AVATARS.map(av => (
            <button key={av} className={`avatar-btn ${avatar === av ? 'selected' : ''}`} onClick={() => setAvatar(av)}>
              {av}
            </button>
          ))}
        </div>
      </div>

      <button className="gen-btn" onClick={save} disabled={!name.trim()} style={{ marginTop: '0.5rem' }}>
        Let's Go! 🚀
      </button>
    </div>
  )
}

function ProfileCard({ profile, points, onEdit }: { profile: Profile; points: number; onEdit: () => void }) {
  return (
    <div className="profile-card">
      <div className="profile-avatar">{profile.avatar}</div>
      <div className="profile-info">
        <div className="profile-name">{profile.name}</div>
        <div className="profile-meta">Grade {profile.grade} · ⭐ {points} pts</div>
      </div>
      <button className="profile-edit-btn" onClick={onEdit} title="Edit profile">✏️</button>
    </div>
  )
}

// ── Problem Component ──────────────────────────────────────
function toDecimal(s: string): number | null {
  s = s.trim().replace(/\s+/g, '')
  // fraction like 3/4 or -1/2
  const fracMatch = s.match(/^(-?\d+)\/(-?\d+)$/)
  if (fracMatch) {
    const num = parseInt(fracMatch[1]), den = parseInt(fracMatch[2])
    if (den === 0) return null
    return num / den
  }
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

function answersMatch(userRaw: string, correctRaw: string): boolean {
  const user = userRaw.trim().toLowerCase().replace(/\s+/g, '')
  const correct = correctRaw.trim().toLowerCase().replace(/\s+/g, '')

  // exact match (after normalizing spaces/case)
  if (user === correct) return true

  // numeric / fraction equivalence
  const uVal = toDecimal(user)
  const cVal = toDecimal(correct)
  if (uVal !== null && cVal !== null) {
    return Math.abs(uVal - cVal) < 0.001
  }

  // strip trailing zeros on decimals: 0.50 == 0.5
  const uNum = parseFloat(user), cNum = parseFloat(correct)
  if (!isNaN(uNum) && !isNaN(cNum)) return Math.abs(uNum - cNum) < 0.001

  return false
}

// parse "34 + 21 = ?" or "75 − 32 = ?" into stacked parts
function parseStacked(q: string): { top: string; op: string; bottom: string } | null {
  const m = q.match(/^(-?\d+)\s*([+\-−])\s*(\d+)\s*=\s*\?$/)
  if (!m) return null
  return { top: m[1], op: m[2] === '-' || m[2] === '−' ? '−' : '+', bottom: m[3] }
}

function StackedProblem({ q, a, onCorrect }: { q: string; a: string; onCorrect: () => void }) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong' | 'revealed'>('idle')
  const parts = parseStacked(q)!
  const width = Math.max(parts.top.length, parts.bottom.length, 3)

  function check() {
    if (answersMatch(input, a)) { setStatus('correct'); onCorrect() }
    else setStatus('wrong')
  }

  return (
    <div className={`problem stacked-problem ${status}`}>
      <div className="stacked">
        <div className="stacked-row">
          <span className="stacked-op-space" />
          <span className="stacked-num" style={{ minWidth: `${width}ch` }}>{parts.top}</span>
        </div>
        <div className="stacked-row">
          <span className="stacked-op">{parts.op}</span>
          <span className="stacked-num" style={{ minWidth: `${width}ch` }}>{parts.bottom}</span>
        </div>
        <div className="stacked-line" style={{ width: `${width + 1.5}ch` }} />
        {status === 'idle' || status === 'wrong' ? (
          <div className="stacked-row stacked-answer-row">
            <span className="stacked-op-space" />
            <input
              className={`stacked-input ${status === 'wrong' ? 'wrong' : ''}`}
              style={{ width: `${width + 1}ch` }}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder={'?'.padStart(width)}
              autoComplete="off"
            />
          </div>
        ) : (
          <div className="stacked-row">
            <span className="stacked-op-space" />
            <span className={`stacked-num stacked-result ${status}`} style={{ minWidth: `${width}ch` }}>
              {status === 'correct' ? '✓ ' : '✗ '}{a}
            </span>
          </div>
        )}
      </div>
      <div className="stacked-btns">
        {(status === 'idle' || status === 'wrong') && (
          <>
            <button className="reveal-btn" onClick={check}>✓ Check</button>
            <button className="reveal-btn skip" onClick={() => setStatus('revealed')}>Skip</button>
          </>
        )}
        {status === 'wrong' && <span className="stacked-wrong-msg">Try again!</span>}
      </div>
    </div>
  )
}

function Problem({ q, a, onCorrect }: { q: string; a: string; onCorrect: () => void }) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong' | 'revealed'>('idle')

  // Use stacked algorithm for addition/subtraction
  if (parseStacked(q)) {
    return <StackedProblem q={q} a={a} onCorrect={onCorrect} />
  }

  function check() {
    if (answersMatch(input, a)) {
      setStatus('correct')
      onCorrect()
    } else {
      setStatus('wrong')
    }
  }

  function reveal() { setStatus('revealed') }

  return (
    <div className={`problem ${status}`}>
      <span className="problem-q">{q}</span>
      {status === 'idle' || status === 'wrong' ? (
        <div className="problem-input-row">
          <input
            className="problem-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && check()}
            placeholder="answer"
          />
          <button className="reveal-btn" onClick={check}>✓</button>
          <button className="reveal-btn skip" onClick={reveal}>Skip</button>
        </div>
      ) : (
        <span className={`problem-a ${status}`}>
          {status === 'correct' ? '✓ ' : status === ('wrong' as string) ? '✗ ' : ''}{a}
        </span>
      )}
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────
export default function App() {
  const [profile, setProfile] = useState<Profile | null>(() => {
    try { return JSON.parse(localStorage.getItem('aplus-profile') || 'null') } catch { return null }
  })
  const [editingProfile, setEditingProfile] = useState(false)
  const [grade, setGrade] = useState<number | null>(null)
  const [points, setPoints] = useState(() => {
    try { return parseInt(localStorage.getItem('aplus-points') || '0') } catch { return 0 }
  })
  const [showGame, setShowGame] = useState(false)
  const [popAnim, setPopAnim] = useState(false)
  const [tab, setTab] = useState<'lessons' | 'study'>('lessons')

  function saveProfile(p: Profile) {
    setProfile(p)
    setGrade(p.grade)
    setEditingProfile(false)
    localStorage.setItem('aplus-profile', JSON.stringify(p))
  }

  function addPoint() {
    setPoints(p => {
      const next = p + 10
      if (next >= 100 && p < 100) setPopAnim(true)
      localStorage.setItem('aplus-points', String(next))
      return next
    })
  }

  const floaters = useMemo(() => {
    const rand = seededRandom(42)
    return Array.from({ length: 200 }, (_, i) => ({
      text: expressions[i % expressions.length],
      top: rand() * 100, left: rand() * 100,
      opacity: 0.04 + rand() * 0.13,
      size: 0.65 + rand() * 0.7,
      rotate: -25 + rand() * 50,
    }))
  }, [])

  const content = grade ? curriculum[grade] : null
  const pct = Math.min(100, points)
  const unlocked = points >= 100

  return (
    <div className="page">
      {showGame && <MathGame onClose={() => setShowGame(false)} />}

      <div className="bg">
        {floaters.map((f, i) => (
          <span key={i} className="floater" style={{ top: `${f.top}%`, left: `${f.left}%`, opacity: f.opacity, fontSize: `${f.size}rem`, transform: `rotate(${f.rotate}deg)` }}>
            {f.text}
          </span>
        ))}
      </div>

      <div className="main">
        <div className="hero-card">
          <h1>A+ Mathematics</h1>
          <p>A website that helps you get ahead in Math!!!</p>
        </div>

        {/* Profile */}
        {!profile || editingProfile ? (
          <ProfileSetup onSave={saveProfile} />
        ) : (
          <ProfileCard profile={profile} points={points} onEdit={() => setEditingProfile(true)} />
        )}

        {/* How it works */}
        <div className="directions">
          <div className="dir-title">👋 How It Works</div>
          <div className="dir-steps">
            <div className="dir-step">
              <span className="dir-num">1</span>
              <div>
                <strong>Pick your grade</strong> in the Lessons tab — we'll teach you the <em>next</em> grade's math so you get ahead.
              </div>
            </div>
            <div className="dir-step">
              <span className="dir-num">2</span>
              <div>
                <strong>Answer problems</strong> by typing your answer and pressing ✓ or Enter. Any equivalent form is accepted (e.g. 2/4 = 1/2 = 0.5).
              </div>
            </div>
            <div className="dir-step">
              <span className="dir-num">3</span>
              <div>
                <strong>Earn ⭐ points</strong> for every correct answer. Reach <strong>100 pts</strong> to unlock the 🎮 Math Blaster game!
              </div>
            </div>
            <div className="dir-step">
              <span className="dir-num">4</span>
              <div>
                <strong>Try AI Study Mode</strong> for unlimited AI-generated problems with hints, explanations, and difficulty levels.
              </div>
            </div>
          </div>
        </div>

        {/* Points bar */}
        <div className="points-bar">
          <div className="points-info">
            <span className="points-label">⭐ {points} pts</span>
            <span className="points-sub">{unlocked ? '🎮 Game Unlocked!' : `${100 - pct} pts to unlock the game`}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
            {unlocked && <div className="progress-glow" />}
          </div>
          {unlocked && (
            <button className={`play-btn ${popAnim ? 'pop' : ''}`} onClick={() => setShowGame(true)} onAnimationEnd={() => setPopAnim(false)}>
              🎮 Play Math Blaster!
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${tab === 'lessons' ? 'active' : ''}`} onClick={() => setTab('lessons')}>
            📚 Lessons
          </button>
          <button className={`tab-btn ${tab === 'study' ? 'active' : ''}`} onClick={() => setTab('study')}>
            🤖 AI Study Mode
          </button>
        </div>

        {tab === 'lessons' && (
          <>
            <div className="grade-bar">
              <span className="grade-label">What grade are you in?</span>
              <div className="grade-buttons">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => (
                  <button key={g} className={`grade-btn ${grade === g ? 'active' : ''}`} onClick={() => setGrade(g === grade ? null : g)}>{g}</button>
                ))}
              </div>
            </div>
            {!grade && (
              <div className="pick-grade-hint">👆 Select your current grade above to load your lessons</div>
            )}
            {content && (
              <div className="lessons">
                <h2 className="lessons-title">{content.label}</h2>
                <p className="lessons-sub">Type your answer in each box and press <kbd>Enter</kbd> or <kbd>✓</kbd> to check it. Press <kbd>Skip</kbd> to reveal the answer without earning points.</p>
                <div className="lessons-grid">
                  {content.lessons.map((lesson, i) => (
                    <div className="lesson-card" key={i}>
                      <div className="lesson-topic">{lesson.topic}</div>
                      <div className="lesson-desc">{lesson.description}</div>
                      <div className="problems">
                        {lesson.problems.map((p, j) => (
                          <Problem key={`${grade}-${i}-${j}`} q={p.q} a={p.a} onCorrect={addPoint} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'study' && <StudyMode onCorrect={addPoint} />}
      </div>
    </div>
  )
}
