import { useMemo } from 'react'
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

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function App() {
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

  return (
    <div className="page">
      <div className="bg">
        {floaters.map((f, i) => (
          <span
            key={i}
            className="floater"
            style={{
              top: `${f.top}%`,
              left: `${f.left}%`,
              opacity: f.opacity,
              fontSize: `${f.size}rem`,
              transform: `rotate(${f.rotate}deg)`,
            }}
          >
            {f.text}
          </span>
        ))}
      </div>
      <div className="content">
        <h1>Hello World</h1>
        <p>Welcome to my portfolio</p>
      </div>
    </div>
  )
}

export default App
