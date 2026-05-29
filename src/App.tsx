import { useState, useMemo } from 'react'
import './App.css'

const expressions = [
  '12 × 13 = 156', '√144 = 12', '∫x² dx', '7! = 5040', 'log₂(64) = 6',
  'sin(90°) = 1', 'd/dx[x³] = 3x²', 'π² ≈ 9.87', '2⁸ = 256', 'cos(0°) = 1',
  '15² - 14² = 29', '∑(1..10) = 55', 'tan(45°) = 1', '√(9+16) = 5',
  '99² = 9801', 'e⁰ = 1', '11³ = 1331', 'GCD(48,18) = 6', '0.1+0.2 ≈ 0.3',
  'lim sin(x)/x = 1', 'φ = 1.618...', 'i² = -1', 'e^iπ + 1 = 0',
  '∇²f = 0', 'P(A∪B)', 'n! / r!(n-r)!', 'a² + b² = c²', 'F = ma',
  'E = mc²', 'λ = h/p', '∮E·dA = Q/ε₀', 'PV = nRT', 'det(AB) = det(A)det(B)',
  'tr(A+B) = tr(A)+tr(B)', '||v|| = √(x²+y²+z²)', 'A⁻¹A = I',
  'sin²θ + cos²θ = 1', '1 + tan²θ = sec²θ', 'cot²θ + 1 = csc²θ',
  'ln(e) = 1', 'log(1) = 0', '∫₀^∞ e^-x dx = 1', "f'(x) = lim[f(x+h)-f(x)]/h",
  '13 mod 5 = 3', '2+2 = 4', '7×8 = 56', '144/12 = 12', '3³ = 27',
  '√81 = 9', '5! = 120', '64^(1/2) = 8', '∑n² = n(n+1)(2n+1)/6',
  '∑n = n(n+1)/2', 'C(10,3) = 120', 'P(5,2) = 20', '17 is prime',
  'lcm(4,6) = 12', 'gcd(100,75) = 25', '1000 = 10³', 'log₁₀(1000) = 3',
  'sin(30°) = 0.5', 'cos(60°) = 0.5', 'tan(0°) = 0', 'arcsin(1) = π/2',
  '∞ + 1 = ∞', '0! = 1', '(-1)² = 1', '√-1 = i', '|−5| = 5',
  'floor(3.9) = 3', 'ceil(3.1) = 4', '101 is prime', '2^10 = 1024',
  'hex FF = 255', 'bin 1010 = 10', '∫cos(x) dx = sin(x) + C',
  '∫sin(x) dx = -cos(x) + C', 'd/dx[eˣ] = eˣ', 'd/dx[ln x] = 1/x',
  'lim x→∞ 1/x = 0', 'x²-1 = (x+1)(x-1)', 'quadratic: (-b±√Δ)/2a',
]

type Lesson = {
  topic: string
  description: string
  problems: { q: string; a: string }[]
}

const curriculum: Record<number, { label: string; lessons: Lesson[] }> = {
  1: {
    label: 'Grade 1 → Grade 2',
    lessons: [
      {
        topic: 'Addition up to 100',
        description: 'Adding two-digit numbers together.',
        problems: [
          { q: '34 + 21 = ?', a: '55' },
          { q: '47 + 36 = ?', a: '83' },
          { q: '52 + 29 = ?', a: '81' },
        ],
      },
      {
        topic: 'Subtraction up to 100',
        description: 'Subtracting two-digit numbers.',
        problems: [
          { q: '75 − 32 = ?', a: '43' },
          { q: '90 − 47 = ?', a: '43' },
          { q: '61 − 28 = ?', a: '33' },
        ],
      },
      {
        topic: 'Skip Counting',
        description: 'Count by 2s, 5s, and 10s.',
        problems: [
          { q: 'Count by 5s: 5, 10, 15, ?, ?', a: '20, 25' },
          { q: 'Count by 2s: 2, 4, 6, ?, ?', a: '8, 10' },
          { q: 'Count by 10s: 10, 20, ?, ?', a: '30, 40' },
        ],
      },
    ],
  },
  2: {
    label: 'Grade 2 → Grade 3',
    lessons: [
      {
        topic: 'Multiplication Intro',
        description: 'Understanding multiplication as repeated addition.',
        problems: [
          { q: '3 × 4 = ?', a: '12' },
          { q: '5 × 6 = ?', a: '30' },
          { q: '7 × 2 = ?', a: '14' },
        ],
      },
      {
        topic: 'Fractions Intro',
        description: 'Understanding halves, thirds, and quarters.',
        problems: [
          { q: '1/2 of 8 = ?', a: '4' },
          { q: '1/4 of 12 = ?', a: '3' },
          { q: '1/3 of 9 = ?', a: '3' },
        ],
      },
      {
        topic: 'Place Value',
        description: 'Hundreds, tens, and ones.',
        problems: [
          { q: 'What is the hundreds digit in 374?', a: '3' },
          { q: '200 + 50 + 6 = ?', a: '256' },
          { q: 'What is 400 + 30 + 7?', a: '437' },
        ],
      },
    ],
  },
  3: {
    label: 'Grade 3 → Grade 4',
    lessons: [
      {
        topic: 'Long Multiplication',
        description: 'Multiplying larger numbers.',
        problems: [
          { q: '12 × 11 = ?', a: '132' },
          { q: '14 × 6 = ?', a: '84' },
          { q: '25 × 4 = ?', a: '100' },
        ],
      },
      {
        topic: 'Division',
        description: 'Dividing numbers and understanding remainders.',
        problems: [
          { q: '48 ÷ 6 = ?', a: '8' },
          { q: '37 ÷ 5 = ?', a: '7 R2' },
          { q: '72 ÷ 8 = ?', a: '9' },
        ],
      },
      {
        topic: 'Area & Perimeter',
        description: 'Calculate area and perimeter of rectangles.',
        problems: [
          { q: 'Perimeter of a 4×6 rectangle?', a: '20' },
          { q: 'Area of a 5×7 rectangle?', a: '35' },
          { q: 'Perimeter of a square with side 9?', a: '36' },
        ],
      },
    ],
  },
  4: {
    label: 'Grade 4 → Grade 5',
    lessons: [
      {
        topic: 'Fractions & Decimals',
        description: 'Converting between fractions and decimals.',
        problems: [
          { q: '3/4 as a decimal?', a: '0.75' },
          { q: '0.5 as a fraction?', a: '1/2' },
          { q: '1/5 as a decimal?', a: '0.2' },
        ],
      },
      {
        topic: 'Adding Fractions',
        description: 'Add fractions with like and unlike denominators.',
        problems: [
          { q: '1/4 + 2/4 = ?', a: '3/4' },
          { q: '1/3 + 1/6 = ?', a: '1/2' },
          { q: '2/5 + 1/10 = ?', a: '1/2' },
        ],
      },
      {
        topic: 'Multi-digit Multiplication',
        description: 'Multiply 3-digit by 2-digit numbers.',
        problems: [
          { q: '123 × 12 = ?', a: '1,476' },
          { q: '204 × 11 = ?', a: '2,244' },
          { q: '312 × 21 = ?', a: '6,552' },
        ],
      },
    ],
  },
  5: {
    label: 'Grade 5 → Grade 6',
    lessons: [
      {
        topic: 'Ratios & Proportions',
        description: 'Understanding and solving ratios.',
        problems: [
          { q: 'If 3:5 = ?:20', a: '12' },
          { q: 'Simplify ratio 12:16', a: '3:4' },
          { q: '60% of 80 = ?', a: '48' },
        ],
      },
      {
        topic: 'Negative Numbers',
        description: 'Operations with negative numbers.',
        problems: [
          { q: '-4 + 7 = ?', a: '3' },
          { q: '5 − (−3) = ?', a: '8' },
          { q: '-6 × -2 = ?', a: '12' },
        ],
      },
      {
        topic: 'Introduction to Variables',
        description: 'Solving simple one-step equations.',
        problems: [
          { q: 'x + 5 = 12, x = ?', a: '7' },
          { q: '3y = 21, y = ?', a: '7' },
          { q: 'z − 4 = 9, z = ?', a: '13' },
        ],
      },
    ],
  },
  6: {
    label: 'Grade 6 → Grade 7',
    lessons: [
      {
        topic: 'Linear Equations',
        description: 'Solving two-step linear equations.',
        problems: [
          { q: '2x + 3 = 11, x = ?', a: '4' },
          { q: '5y − 4 = 16, y = ?', a: '4' },
          { q: '3z + 7 = 22, z = ?', a: '5' },
        ],
      },
      {
        topic: 'Geometry: Angles',
        description: 'Complementary, supplementary, and vertical angles.',
        problems: [
          { q: 'Complement of 35°?', a: '55°' },
          { q: 'Supplement of 110°?', a: '70°' },
          { q: 'Sum of angles in a triangle?', a: '180°' },
        ],
      },
      {
        topic: 'Probability',
        description: 'Basic probability calculations.',
        problems: [
          { q: 'P(heads on a coin flip)?', a: '1/2' },
          { q: 'P(rolling a 3 on a die)?', a: '1/6' },
          { q: 'P(red card from deck)?', a: '1/2' },
        ],
      },
    ],
  },
  7: {
    label: 'Grade 7 → Grade 8',
    lessons: [
      {
        topic: 'Systems of Equations',
        description: 'Solve two equations with two unknowns.',
        problems: [
          { q: 'x + y = 10, x − y = 2. Find x.', a: 'x = 6' },
          { q: '2x + y = 9, x + y = 5. Find x.', a: 'x = 4' },
          { q: 'x + 2y = 8, x − y = 2. Find y.', a: 'y = 2' },
        ],
      },
      {
        topic: 'Exponent Rules',
        description: 'Laws of exponents and scientific notation.',
        problems: [
          { q: 'x³ × x⁴ = ?', a: 'x⁷' },
          { q: '(x²)³ = ?', a: 'x⁶' },
          { q: '5.2 × 10³ in standard form?', a: '5,200' },
        ],
      },
      {
        topic: 'Pythagorean Theorem',
        description: 'Find missing sides of right triangles.',
        problems: [
          { q: 'a=3, b=4, c=?', a: '5' },
          { q: 'a=5, c=13, b=?', a: '12' },
          { q: 'a=8, b=6, c=?', a: '10' },
        ],
      },
    ],
  },
  8: {
    label: 'Grade 8 → Grade 9 (Algebra I)',
    lessons: [
      {
        topic: 'Quadratic Equations',
        description: 'Solve quadratics by factoring and the quadratic formula.',
        problems: [
          { q: 'x² − 5x + 6 = 0', a: 'x = 2, 3' },
          { q: 'x² − 9 = 0', a: 'x = ±3' },
          { q: 'x² + 4x + 4 = 0', a: 'x = −2' },
        ],
      },
      {
        topic: 'Functions',
        description: 'Understanding function notation and graphs.',
        problems: [
          { q: 'f(x) = 2x+1. Find f(3).', a: '7' },
          { q: 'g(x) = x². Find g(−4).', a: '16' },
          { q: 'h(x) = 3x−5. Find h(0).', a: '−5' },
        ],
      },
      {
        topic: 'Inequalities',
        description: 'Solve and graph linear inequalities.',
        problems: [
          { q: '2x + 1 > 7, x = ?', a: 'x > 3' },
          { q: '3x − 4 ≤ 11, x = ?', a: 'x ≤ 5' },
          { q: '−2x > 8, x = ?', a: 'x < −4' },
        ],
      },
    ],
  },
  9: {
    label: 'Grade 9 → Grade 10 (Geometry)',
    lessons: [
      {
        topic: 'Trigonometry Basics',
        description: 'SOH-CAH-TOA and right triangle trig.',
        problems: [
          { q: 'sin(30°) = ?', a: '0.5' },
          { q: 'cos(60°) = ?', a: '0.5' },
          { q: 'tan(45°) = ?', a: '1' },
        ],
      },
      {
        topic: 'Circle Theorems',
        description: 'Arc length, sector area, and inscribed angles.',
        problems: [
          { q: 'Area of circle r=5?', a: '78.54' },
          { q: 'Circumference r=7?', a: '43.98' },
          { q: 'Arc length, r=4, θ=90°?', a: '6.28' },
        ],
      },
      {
        topic: 'Proofs & Logic',
        description: 'If-then statements and geometric proofs.',
        problems: [
          { q: 'Converse of "If p then q"?', a: 'If q then p' },
          { q: 'Contrapositive of "If p then q"?', a: 'If ¬q then ¬p' },
          { q: 'Vertical angles are always?', a: 'Equal' },
        ],
      },
    ],
  },
  10: {
    label: 'Grade 10 → Grade 11 (Algebra II)',
    lessons: [
      {
        topic: 'Logarithms',
        description: 'Properties and solving log equations.',
        problems: [
          { q: 'log₂(32) = ?', a: '5' },
          { q: 'log(100) = ?', a: '2' },
          { q: 'ln(e³) = ?', a: '3' },
        ],
      },
      {
        topic: 'Complex Numbers',
        description: 'Operations with imaginary numbers.',
        problems: [
          { q: '(3+2i) + (1−4i) = ?', a: '4 − 2i' },
          { q: 'i² = ?', a: '−1' },
          { q: '|3 + 4i| = ?', a: '5' },
        ],
      },
      {
        topic: 'Sequences & Series',
        description: 'Arithmetic and geometric sequences.',
        problems: [
          { q: '5th term: 2, 5, 8, 11, ...', a: '14' },
          { q: '∑(1 to 5) of 2n = ?', a: '30' },
          { q: 'Geometric: 3, 6, 12, ... 6th term?', a: '96' },
        ],
      },
    ],
  },
  11: {
    label: 'Grade 11 → Grade 12 (Pre-Calc)',
    lessons: [
      {
        topic: 'Limits',
        description: 'Introduction to limits and continuity.',
        problems: [
          { q: 'lim x→2 of (x²−4)/(x−2) = ?', a: '4' },
          { q: 'lim x→∞ of 1/x = ?', a: '0' },
          { q: 'lim x→0 of sin(x)/x = ?', a: '1' },
        ],
      },
      {
        topic: 'Vectors',
        description: 'Vector addition, magnitude, and dot product.',
        problems: [
          { q: '|⟨3, 4⟩| = ?', a: '5' },
          { q: '⟨1,2⟩ · ⟨3,4⟩ = ?', a: '11' },
          { q: '⟨2,3⟩ + ⟨−1,5⟩ = ?', a: '⟨1, 8⟩' },
        ],
      },
      {
        topic: 'Polar Coordinates',
        description: 'Converting between polar and Cartesian.',
        problems: [
          { q: 'Polar (2, 90°) to Cartesian?', a: '(0, 2)' },
          { q: 'Cartesian (1,1) to polar r=?', a: '√2' },
          { q: 'r = 2cos(θ) is what shape?', a: 'Circle' },
        ],
      },
    ],
  },
  12: {
    label: 'Grade 12 → College (Calculus)',
    lessons: [
      {
        topic: 'Derivatives',
        description: 'Differentiation rules and applications.',
        problems: [
          { q: "d/dx [x⁴] = ?", a: '4x³' },
          { q: "d/dx [sin(x)] = ?", a: 'cos(x)' },
          { q: "d/dx [eˣ] = ?", a: 'eˣ' },
        ],
      },
      {
        topic: 'Integrals',
        description: 'Antiderivatives and definite integrals.',
        problems: [
          { q: '∫x² dx = ?', a: 'x³/3 + C' },
          { q: '∫₀¹ x dx = ?', a: '1/2' },
          { q: '∫cos(x) dx = ?', a: 'sin(x) + C' },
        ],
      },
      {
        topic: 'Chain Rule',
        description: 'Differentiating composite functions.',
        problems: [
          { q: "d/dx [sin(x²)] = ?", a: '2x·cos(x²)' },
          { q: "d/dx [(x²+1)³] = ?", a: '6x(x²+1)²' },
          { q: "d/dx [e^(3x)] = ?", a: '3e^(3x)' },
        ],
      },
    ],
  },
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export default function App() {
  const [grade, setGrade] = useState<number | null>(null)

  const floaters = useMemo(() => {
    const rand = seededRandom(42)
    return Array.from({ length: 200 }, (_, i) => ({
      text: expressions[i % expressions.length],
      top: rand() * 100,
      left: rand() * 100,
      opacity: 0.04 + rand() * 0.13,
      size: 0.65 + rand() * 0.7,
      rotate: -25 + rand() * 50,
    }))
  }, [])

  const content = grade ? curriculum[grade] : null

  return (
    <div className="page">
      <div className="bg">
        {floaters.map((f, i) => (
          <span key={i} className="floater" style={{
            top: `${f.top}%`, left: `${f.left}%`,
            opacity: f.opacity, fontSize: `${f.size}rem`,
            transform: `rotate(${f.rotate}deg)`,
          }}>
            {f.text}
          </span>
        ))}
      </div>

      <div className="main">
        <div className="hero-card">
          <h1>A+ Mathematics</h1>
          <p>A website that helps you get ahead in Math!!!</p>
        </div>

        <div className="grade-bar">
          <span className="grade-label">What grade are you in?</span>
          <div className="grade-buttons">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => (
              <button
                key={g}
                className={`grade-btn ${grade === g ? 'active' : ''}`}
                onClick={() => setGrade(g === grade ? null : g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {content && (
          <div className="lessons">
            <h2 className="lessons-title">{content.label}</h2>
            <div className="lessons-grid">
              {content.lessons.map((lesson, i) => (
                <div className="lesson-card" key={i}>
                  <div className="lesson-topic">{lesson.topic}</div>
                  <div className="lesson-desc">{lesson.description}</div>
                  <div className="problems">
                    {lesson.problems.map((p, j) => (
                      <Problem key={j} q={p.q} a={p.a} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Problem({ q, a }: { q: string; a: string }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="problem">
      <span className="problem-q">{q}</span>
      {revealed
        ? <span className="problem-a">{a}</span>
        : <button className="reveal-btn" onClick={() => setRevealed(true)}>Show Answer</button>
      }
    </div>
  )
}
