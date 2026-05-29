import './App.css'

const problems = [
  { q: '12 × 13', a: '156' },
  { q: '√144', a: '12' },
  { q: '∫x² dx', a: 'x³/3 + C' },
  { q: '7! / 5!', a: '42' },
  { q: 'log₂(64)', a: '6' },
  { q: 'sin(90°)', a: '1' },
  { q: 'd/dx [x³]', a: '3x²' },
  { q: 'π²', a: '9.87' },
  { q: '2⁸', a: '256' },
  { q: 'cos(0°)', a: '1' },
  { q: '15² - 14²', a: '29' },
  { q: '∑(1 to 10)', a: '55' },
  { q: 'tan(45°)', a: '1' },
  { q: '√(3² + 4²)', a: '5' },
  { q: '99 × 99', a: '9801' },
  { q: 'e⁰', a: '1' },
  { q: '11³', a: '1331' },
  { q: 'GCD(48, 18)', a: '6' },
  { q: '0.1 + 0.2', a: '≈0.3' },
  { q: '∞ / ∞', a: 'indeterminate' },
  { q: 'φ (golden ratio)', a: '1.618...' },
  { q: '100!', a: 'very big' },
  { q: 'lim x→0 sin(x)/x', a: '1' },
  { q: '13 mod 5', a: '3' },
]

function App() {
  return (
    <div className="page">
      <header>
        <h1>Hello World</h1>
        <p>Welcome to my portfolio</p>
      </header>
      <div className="grid">
        {problems.map((p, i) => (
          <div className="card" key={i}>
            <div className="question">{p.q}</div>
            <div className="equals">=</div>
            <div className="answer">{p.a}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
