// Random problem generators for each grade/lesson
// Each generator returns N unique randomised problems

type Problem = { q: string; a: string; explain: string }
const p = (q: string, a: string, explain: string): Problem => ({ q, a, explain })
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

// Returns shuffled copy — used to cycle through types evenly
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Dedup check: question already in list?
const has = (out: Problem[], q: string) => out.some(x => x.q === q)

// Cycle through types evenly instead of random pick (avoids clustering)
function cycleTypes<T>(types: T[]): { next: () => { value: T } } {
  let pool = shuffle([...types])
  let i = 0
  return {
    next() {
      const value = pool[i % pool.length]
      i++
      if (i % pool.length === 0) pool = shuffle([...types])
      return { value }
    }
  }
}

// ── Grade 1 ─────────────────────────────────────────────────────────────────
function genAddition100(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['standard','missingFirst','missingSecond','word','threeNums'])
  while (out.length < n) {
    const t = types.next().value
    if (t === 'standard') {
      const a = rnd(1, 60), b = rnd(1, 60)
      if (a + b > 100) continue
      const sum = a + b
      const q = `${a} + ${b} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(sum), `${a}+${b}=${sum}`))
    } else if (t === 'missingFirst') {
      const b = rnd(5, 40), sum = rnd(b + 5, 100)
      const a = sum - b
      const q = `? + ${b} = ${sum}`
      if (has(out, q)) continue
      out.push(p(q, String(a), `${sum}−${b}=${a}`))
    } else if (t === 'missingSecond') {
      const a = rnd(5, 40), sum = rnd(a + 5, 100)
      const b = sum - a
      const q = `${a} + ? = ${sum}`
      if (has(out, q)) continue
      out.push(p(q, String(b), `${sum}−${a}=${b}`))
    } else if (t === 'word') {
      const a = rnd(3, 30), b = rnd(3, 30)
      if (a + b > 100) continue
      const q = `${a} apples + ${b} more = ?`
      if (has(out, q)) continue
      out.push(p(q, String(a + b), `${a}+${b}=${a+b}`))
    } else {
      const a = rnd(1, 20), b = rnd(1, 20), c = rnd(1, 20)
      if (a + b + c > 100) continue
      const q = `${a} + ${b} + ${c} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(a + b + c), `${a}+${b}=${a+b}, then +${c}=${a+b+c}`))
    }
  }
  return out
}

function genSubtraction100(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['standard','missingSubtrahend','missingMinuend','word','doubleDigit'])
  while (out.length < n) {
    const t = types.next().value
    if (t === 'standard') {
      const b = rnd(5, 45), a = rnd(b + 5, 99)
      const q = `${a} − ${b} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(a - b), `${a}−${b}=${a-b}`))
    } else if (t === 'missingSubtrahend') {
      const b = rnd(5, 40), a = rnd(b + 5, 99)
      const q = `${a} − ? = ${a - b}`
      if (has(out, q)) continue
      out.push(p(q, String(b), `${a}−${a-b}=${b}`))
    } else if (t === 'missingMinuend') {
      const b = rnd(5, 30), diff = rnd(5, 60)
      const q = `? − ${b} = ${diff}`
      if (has(out, q)) continue
      out.push(p(q, String(diff + b), `${diff}+${b}=${diff+b}`))
    } else if (t === 'word') {
      const a = rnd(20, 80), b = rnd(5, a - 5)
      const q = `${a} cookies, eat ${b}. Left?`
      if (has(out, q)) continue
      out.push(p(q, String(a - b), `${a}−${b}=${a-b}`))
    } else {
      const a = rnd(50, 99), b = rnd(10, 49)
      if (a <= b) continue
      const q = `${a} − ${b} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(a - b), `${a}−${b}=${a-b}`))
    }
  }
  return out
}

function genSkipCounting(n: number): Problem[] {
  const steps = [2, 3, 4, 5, 10]
  const out: Problem[] = []
  const types = cycleTypes(['next2','whatStep','fillMissing','countBack'])
  while (out.length < n) {
    const t = types.next().value
    const step = pick(steps)
    if (t === 'next2') {
      const start = rnd(1, 8) * step
      const a = start + step, b = a + step
      const q = `Count by ${step}s: ${start},${a},${b},?,?`
      if (has(out, q)) continue
      out.push(p(q, `${b+step},${b+step*2}`, `Add ${step} each time: ${b}+${step}=${b+step}, then ${b+step*2}`))
    } else if (t === 'whatStep') {
      const a = rnd(2, 10) * step
      const q = `${a}, ${a+step}, ${a+step*2}, ... What's the step?`
      if (has(out, q)) continue
      out.push(p(q, String(step), `${a+step}−${a}=${step}`))
    } else if (t === 'fillMissing') {
      const a = rnd(1, 6) * step
      const q = `${a}, ?, ${a + step*2}. Missing?`
      if (has(out, q)) continue
      out.push(p(q, String(a + step), `Middle of ${a} and ${a+step*2}: ${a}+${step}=${a+step}`))
    } else {
      const start = rnd(6, 12) * step
      const q = `Count back by ${step}: ${start},?,${start-step*2},?`
      if (has(out, q)) continue
      out.push(p(q, `${start-step},${start-step*3}`, `Subtract ${step}: ${start}-${step}=${start-step}, then ${start-step*3}`))
    }
  }
  return out
}

// ── Grade 2 ─────────────────────────────────────────────────────────────────
function genMultiplication(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['standard','missingFactor','word','commutativity','product'])
  while (out.length < n) {
    const t = types.next().value
    const a = rnd(2, 9), b = rnd(2, 9)
    if (t === 'standard') {
      const q = `${a} × ${b} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(a * b), `${a} groups of ${b}: ${a*b}`))
    } else if (t === 'missingFactor') {
      const q = `? × ${b} = ${a * b}`
      if (has(out, q)) continue
      out.push(p(q, String(a), `${a*b}÷${b}=${a}`))
    } else if (t === 'word') {
      const q = `${a} bags, ${b} in each. Total?`
      if (has(out, q)) continue
      out.push(p(q, String(a * b), `${a}×${b}=${a*b}`))
    } else if (t === 'commutativity') {
      const q = `${b} × ${a} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(a * b), `Same as ${a}×${b}=${a*b} (order doesn't matter)`))
    } else {
      const prod = a * b
      const q = `${a} × ${b} = ${prod}. True or False?`
      if (has(out, q)) continue
      out.push(p(q, 'True', `${a}×${b}=${prod} ✓`))
    }
  }
  return out
}

function genFractionsIntro(n: number): Problem[] {
  const fracs: [number, number][] = [[1,2],[1,3],[1,4],[1,5],[1,6],[2,3],[3,4],[2,5],[3,5]]
  const out: Problem[] = []
  const types = cycleTypes(['ofWhole','equivalent','compare','shade'])
  while (out.length < n) {
    const t = types.next().value
    const [num, den] = pick(fracs)
    if (t === 'ofWhole') {
      const whole = rnd(2, 6) * den
      const ans = (whole * num) / den
      const q = `${num}/${den} of ${whole} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(ans), `${whole}÷${den}=${whole/den}${num>1?` ×${num}=${ans}`:''}`))
    } else if (t === 'equivalent') {
      const mult = rnd(2, 4)
      const q = `${num}/${den} = ?/${den*mult}`
      if (has(out, q)) continue
      out.push(p(q, String(num*mult), `${num}×${mult}=${num*mult}, ${den}×${mult}=${den*mult}`))
    } else if (t === 'compare') {
      const [n2, d2] = pick(fracs)
      if (num === n2 && den === d2) continue
      const bigger = num/den > n2/d2
      const q = `Which is bigger: ${num}/${den} or ${n2}/${d2}?`
      if (has(out, q)) continue
      out.push(p(q, bigger ? `${num}/${den}` : `${n2}/${d2}`,
        `${(num/den).toFixed(2)} vs ${(n2/d2).toFixed(2)}`))
    } else {
      const whole = den * rnd(1, 3)
      const q = `${whole} ÷ ${den} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(whole/den), `Split ${whole} into ${den} equal parts: ${whole/den} each`))
    }
  }
  return out
}

function genPlaceValue(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['hundreds','tens','ones','expand','roundTens','roundHundreds'])
  while (out.length < n) {
    const t = types.next().value
    const h = rnd(1, 9), ten = rnd(0, 9), o = rnd(0, 9)
    const num = h * 100 + ten * 10 + o
    if (t === 'hundreds') {
      const q = `Hundreds digit of ${num}?`
      if (has(out, q)) continue
      out.push(p(q, String(h), `${num} = ${h} hundreds, ${ten} tens, ${o} ones`))
    } else if (t === 'tens') {
      const q = `Tens digit of ${num}?`
      if (has(out, q)) continue
      out.push(p(q, String(ten), `${num} = ${h} hundreds, ${ten} tens, ${o} ones`))
    } else if (t === 'ones') {
      const q = `Ones digit of ${num}?`
      if (has(out, q)) continue
      out.push(p(q, String(o), `${num} = ${h} hundreds, ${ten} tens, ${o} ones`))
    } else if (t === 'expand') {
      const q = `${h*100}+${ten*10}+${o} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(num), `${h*100}+${ten*10}+${o}=${num}`))
    } else if (t === 'roundTens') {
      const rounded = o >= 5 ? num + (10 - o) : num - o
      const q = `Round ${num} to nearest ten?`
      if (has(out, q)) continue
      out.push(p(q, String(rounded), `Ones digit ${o} ${o>=5?'≥5, round up':'<5, round down'} → ${rounded}`))
    } else {
      const rounded = ten * 10 + o >= 50 ? (h + 1) * 100 : h * 100
      const q = `Round ${num} to nearest hundred?`
      if (has(out, q)) continue
      out.push(p(q, String(rounded), `Last two digits ${ten*10+o} ${ten*10+o>=50?'≥50, round up':'<50, round down'} → ${rounded}`))
    }
  }
  return out
}

// ── Grade 3 ─────────────────────────────────────────────────────────────────
function genLongMultiplication(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['standard','missingFactor','word','twoDigit','estimate'])
  while (out.length < n) {
    const t = types.next().value
    if (t === 'standard') {
      const a = rnd(11, 35), b = rnd(2, 9)
      const q = `${a} × ${b} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(a * b), `${Math.floor(a/10)*10}×${b}=${Math.floor(a/10)*b*10}, ${a%10}×${b}=${a%10*b}, total=${a*b}`))
    } else if (t === 'missingFactor') {
      const a = rnd(11, 30), b = rnd(2, 9)
      const q = `${a} × ? = ${a * b}`
      if (has(out, q)) continue
      out.push(p(q, String(b), `${a*b}÷${a}=${b}`))
    } else if (t === 'word') {
      const a = rnd(2, 9), b = rnd(11, 25)
      const q = `${a} boxes, ${b} items each. Total?`
      if (has(out, q)) continue
      out.push(p(q, String(a * b), `${a}×${b}=${a*b}`))
    } else if (t === 'twoDigit') {
      const a = rnd(10, 20), b = rnd(10, 15)
      const q = `${a} × ${b} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(a * b), `${a}×${Math.floor(b/10)*10}=${a*Math.floor(b/10)*10}, ${a}×${b%10}=${a*(b%10)}, sum=${a*b}`))
    } else {
      const a = rnd(15, 35), b = rnd(3, 9)
      const exact = a * b
      const estimate = Math.round(a / 10) * 10 * b
      const q = `Estimate: ${a}×${b}≈?`
      if (has(out, q)) continue
      out.push(p(q, String(estimate), `Round ${a}≈${Math.round(a/10)*10}, then ×${b}=${estimate} (exact=${exact})`))
    }
  }
  return out
}

function genDivision(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['standard','missingDivisor','missingDividend','word','remainder'])
  while (out.length < n) {
    const t = types.next().value
    if (t === 'standard') {
      const d = rnd(2, 9), q = rnd(2, 12)
      const question = `${d*q} ÷ ${d} = ?`
      if (has(out, question)) continue
      out.push(p(question, String(q), `${d}×${q}=${d*q}`))
    } else if (t === 'missingDivisor') {
      const d = rnd(2, 9), q = rnd(2, 10)
      const question = `${d*q} ÷ ? = ${q}`
      if (has(out, question)) continue
      out.push(p(question, String(d), `${d*q}÷${q}=${d}`))
    } else if (t === 'missingDividend') {
      const d = rnd(2, 9), q = rnd(2, 10)
      const question = `? ÷ ${d} = ${q}`
      if (has(out, question)) continue
      out.push(p(question, String(d * q), `${d}×${q}=${d*q}`))
    } else if (t === 'word') {
      const total = rnd(12, 72), groups = rnd(2, 9)
      if (total % groups !== 0) continue
      const question = `${total} items, ${groups} groups. Each?`
      if (has(out, question)) continue
      out.push(p(question, String(total / groups), `${total}÷${groups}=${total/groups}`))
    } else {
      const d = rnd(2, 7), q = rnd(2, 8), r = rnd(1, d - 1)
      const question = `${d*q+r} ÷ ${d} = ? remainder ?`
      if (has(out, question)) continue
      out.push(p(question, `${q} r${r}`, `${d}×${q}=${d*q}, ${d*q+r}−${d*q}=${r} left over`))
    }
  }
  return out
}

function genAreaPerimeter(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['area','perimeter','missingDim','triangle','compound'])
  while (out.length < n) {
    const t = types.next().value
    const l = rnd(2, 12), w = rnd(2, 12)
    if (t === 'area') {
      const q = `Area of ${l}×${w} rectangle?`
      if (has(out, q)) continue
      out.push(p(q, String(l * w), `A=${l}×${w}=${l*w} sq units`))
    } else if (t === 'perimeter') {
      const q = `Perimeter of ${l}×${w} rectangle?`
      if (has(out, q)) continue
      out.push(p(q, String(2*(l+w)), `P=2×(${l}+${w})=${2*(l+w)}`))
    } else if (t === 'missingDim') {
      const area = l * w
      const q = `Area=${area}, width=${w}. Length?`
      if (has(out, q)) continue
      out.push(p(q, String(l), `${area}÷${w}=${l}`))
    } else if (t === 'triangle') {
      const b = rnd(4, 12), h = rnd(3, 10)
      const q = `Area of triangle base=${b}, height=${h}?`
      if (has(out, q)) continue
      out.push(p(q, String(b * h / 2), `A=½×${b}×${h}=${b*h/2}`))
    } else {
      const s = rnd(3, 9)
      const q = `Area of ${s}×${s} square?`
      if (has(out, q)) continue
      out.push(p(q, String(s * s), `Side²=${s}²=${s*s}`))
    }
  }
  return out
}

// ── Grade 4 ─────────────────────────────────────────────────────────────────
const fracDecimals: [string, string, string][] = [
  ['1/2','0.5','1÷2=0.5'], ['1/4','0.25','1÷4=0.25'], ['3/4','0.75','3÷4=0.75'],
  ['1/5','0.2','1÷5=0.2'], ['2/5','0.4','2÷5=0.4'], ['3/5','0.6','3÷5=0.6'],
  ['4/5','0.8','4÷5=0.8'], ['1/10','0.1','1÷10=0.1'], ['3/10','0.3','3÷10=0.3'],
  ['7/10','0.7','7÷10=0.7'], ['9/10','0.9','9÷10=0.9'], ['1/8','0.125','1÷8=0.125'],
  ['3/8','0.375','3÷8=0.375'], ['5/8','0.625','5÷8=0.625'], ['1/3','0.33','1÷3≈0.33'],
]
function genFractionsDecimals(n: number): Problem[] {
  const out: Problem[] = []
  const pool = shuffle([...fracDecimals])
  let i = 0
  while (out.length < n) {
    const [frac, dec, exp] = pool[i % pool.length]
    i++
    const dir = pick(['toDecimal', 'toFraction'])
    const q = dir === 'toDecimal' ? `${frac} as decimal?` : `${dec} as fraction?`
    if (has(out, q)) continue
    if (dir === 'toDecimal') out.push(p(q, dec, exp))
    else out.push(p(q, frac, exp.split('=')[0] + ` → ${frac}`))
  }
  return out
}

function genAddingFractions(n: number): Problem[] {
  const addPairs: [string, string, string, string][] = [
    ['1/4','2/4','3/4','Same bottom: 1+2=3, keep /4'],
    ['1/3','1/6','1/2','2/6+1/6=3/6=1/2'],
    ['1/2','1/4','3/4','2/4+1/4=3/4'],
    ['1/6','1/3','1/2','1/6+2/6=3/6=1/2'],
    ['2/3','1/6','5/6','4/6+1/6=5/6'],
    ['1/4','1/4','1/2','1+1=2/4=1/2'],
    ['3/8','1/8','1/2','3+1=4/8=1/2'],
    ['3/10','1/5','1/2','3/10+2/10=5/10=1/2'],
    ['1/3','1/3','2/3','1+1=2, keep /3'],
    ['2/5','1/10','1/2','4/10+1/10=5/10=1/2'],
    ['1/2','1/6','2/3','3/6+1/6=4/6=2/3'],
    ['5/8','1/8','3/4','5+1=6/8=3/4'],
  ]
  const subPairs: [string, string, string, string][] = [
    ['3/4','1/4','1/2','3−1=2/4=1/2'],
    ['5/6','1/6','2/3','5−1=4/6=2/3'],
    ['7/8','3/8','1/2','7−3=4/8=1/2'],
    ['4/5','2/5','2/5','4−2=2/5'],
    ['9/10','4/10','1/2','9−4=5/10=1/2'],
    ['2/3','1/6','1/2','4/6−1/6=3/6=1/2'],
    ['3/4','1/2','1/4','3/4−2/4=1/4'],
    ['1/1','1/3','2/3','3/3−1/3=2/3'],
  ]
  const out: Problem[] = []
  const types = cycleTypes(['add', 'sub'])
  while (out.length < n) {
    const t = types.next().value
    if (t === 'add') {
      const [a, b, ans, exp] = pick(addPairs)
      const q = `${a} + ${b} = ?`
      if (has(out, q)) continue
      out.push(p(q, ans, exp))
    } else {
      const [a, b, ans, exp] = pick(subPairs)
      const q = `${a} − ${b} = ?`
      if (has(out, q)) continue
      out.push(p(q, ans, exp))
    }
  }
  return out
}

function genMultiDigitMult(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['standard','missingFactor','word','twoByTwo','estimate'])
  while (out.length < n) {
    const t = types.next().value
    if (t === 'standard') {
      const a = rnd(100, 400), b = rnd(2, 12)
      const q = `${a} × ${b} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(a * b), `${Math.floor(a/100)*100}×${b}=${Math.floor(a/100)*b*100}, rest×${b}=${a*b}`))
    } else if (t === 'missingFactor') {
      const a = rnd(100, 300), b = rnd(2, 9)
      const q = `${a} × ? = ${a * b}`
      if (has(out, q)) continue
      out.push(p(q, String(b), `${a*b}÷${a}=${b}`))
    } else if (t === 'word') {
      const a = rnd(2, 9), b = rnd(100, 250)
      const q = `${a} crates of ${b} items. Total?`
      if (has(out, q)) continue
      out.push(p(q, String(a * b), `${a}×${b}=${a*b}`))
    } else if (t === 'twoByTwo') {
      const a = rnd(12, 25), b = rnd(11, 20)
      const q = `${a} × ${b} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(a * b), `${a}×${Math.floor(b/10)*10}=${a*Math.floor(b/10)*10}, ${a}×${b%10}=${a*(b%10)}, total=${a*b}`))
    } else {
      const a = rnd(150, 450), b = rnd(3, 8)
      const estimate = Math.round(a / 100) * 100 * b
      const q = `Estimate: ${a}×${b}≈?`
      if (has(out, q)) continue
      out.push(p(q, String(estimate), `Round ${a}≈${Math.round(a/100)*100}, ×${b}=${estimate}`))
    }
  }
  return out
}

// ── Grade 5 ─────────────────────────────────────────────────────────────────
function genRatios(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['scale','simplify','percent','word','equivalent'])
  while (out.length < n) {
    const t = types.next().value
    if (t === 'scale') {
      const a = rnd(1, 6), b = rnd(2, 8), k = rnd(2, 5)
      const q = `${a}:${b} = ?:${b*k}`
      if (has(out, q)) continue
      out.push(p(q, String(a * k), `${b}×${k}=${b*k}, so ${a}×${k}=${a*k}`))
    } else if (t === 'simplify') {
      const g = pick([2, 3, 4, 5]), a = rnd(2, 6) * g, b = rnd(2, 6) * g
      if (a === b) continue
      const q = `Simplify ${a}:${b}`
      if (has(out, q)) continue
      out.push(p(q, `${a/g}:${b/g}`, `GCD=${g}. ${a}÷${g}=${a/g}, ${b}÷${g}=${b/g}`))
    } else if (t === 'percent') {
      const pct = pick([10, 20, 25, 50, 75]), whole = pick([20, 40, 60, 80, 100, 120, 200])
      const q = `${pct}% of ${whole} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(pct * whole / 100), `${whole}×${pct}/100=${pct*whole/100}`))
    } else if (t === 'word') {
      const a = rnd(2, 5), b = rnd(2, 5), k = rnd(3, 6)
      const q = `Ratio apples:oranges = ${a}:${b}. ${a*k} apples → ? oranges`
      if (has(out, q)) continue
      out.push(p(q, String(b * k), `Multiply both by ${k}: ${b}×${k}=${b*k}`))
    } else {
      const pct = pick([5, 15, 30, 40, 60, 70, 80, 90])
      const whole = pick([50, 80, 120, 150, 200])
      const q = `${pct}% of ${whole} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(pct * whole / 100), `${whole}×${pct}/100=${pct*whole/100}`))
    }
  }
  return out
}

function genNegativeNumbers(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['addNeg','subNeg','mulNeg','addPos','divNeg','order'])
  while (out.length < n) {
    const t = types.next().value
    if (t === 'addNeg') {
      const a = -rnd(1, 10), b = rnd(1, 15)
      const q = `${a} + ${b} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(a + b), `Start at ${a}, move ${b} right → ${a+b}`))
    } else if (t === 'subNeg') {
      const a = rnd(2, 10), b = rnd(1, 8)
      const q = `${a} − (−${b}) = ?`
      if (has(out, q)) continue
      out.push(p(q, String(a + b), `Subtracting negative = adding: ${a}+${b}=${a+b}`))
    } else if (t === 'mulNeg') {
      const a = rnd(2, 9), b = rnd(2, 9), bothNeg = pick([true, false])
      const q = bothNeg ? `-${a} × -${b} = ?` : `-${a} × ${b} = ?`
      if (has(out, q)) continue
      if (bothNeg) out.push(p(q, String(a * b), `Neg × neg = pos: ${a}×${b}=${a*b}`))
      else out.push(p(q, String(-a * b), `Neg × pos = neg: −${a*b}`))
    } else if (t === 'addPos') {
      const a = rnd(5, 15), b = rnd(a + 1, a + 10)
      const q = `${a} − ${b} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(a - b), `${a}−${b}=${a-b} (below zero)`))
    } else if (t === 'divNeg') {
      const a = rnd(2, 8), b = rnd(2, 6)
      const q = `-${a*b} ÷ ${b} = ?`
      if (has(out, q)) continue
      out.push(p(q, String(-a), `Neg ÷ pos = neg: ${a*b}÷${b}=${a} → −${a}`))
    } else {
      const vals = [rnd(-10,-1), rnd(-5,5), rnd(1,10)].sort(() => Math.random()-0.5)
      const q = `Order smallest first: ${vals.join(', ')}`
      if (has(out, q)) continue
      const sorted = [...vals].sort((a,b) => a-b)
      out.push(p(q, sorted.join(', '), `On number line: ${sorted.join(' < ')}`))
    }
  }
  return out
}

function genVariables(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['add','sub','mul','twoStep','sub2'])
  while (out.length < n) {
    const t = types.next().value
    const ans = rnd(2, 15)
    const vars = ['x', 'y', 'z', 'n', 'm', 'p', 'k', 'w']
    const v = pick(vars)
    if (t === 'add') {
      const b = rnd(1, 12)
      const q = `${v} + ${b} = ${ans+b}`
      if (has(out, q)) continue
      out.push(p(q, String(ans), `${v}=${ans+b}−${b}=${ans}`))
    } else if (t === 'sub') {
      const b = rnd(1, 12)
      const q = `${v} − ${b} = ${ans-b}`
      if (has(out, q)) continue
      out.push(p(q, String(ans), `${v}=${ans-b}+${b}=${ans}`))
    } else if (t === 'mul') {
      const b = rnd(2, 6)
      const q = `${b}${v} = ${b*ans}`
      if (has(out, q)) continue
      out.push(p(q, String(ans), `${v}=${b*ans}÷${b}=${ans}`))
    } else if (t === 'twoStep') {
      const a = rnd(2, 4), b = rnd(1, 8)
      const rhs = a * ans + b
      const q = `${a}${v} + ${b} = ${rhs}`
      if (has(out, q)) continue
      out.push(p(q, String(ans), `${a}${v}=${rhs}−${b}=${a*ans}, ${v}=${a*ans}÷${a}=${ans}`))
    } else {
      const a = rnd(2, 5), b = rnd(1, 6)
      const rhs = a * ans - b
      const q = `${a}${v} − ${b} = ${rhs}`
      if (has(out, q)) continue
      out.push(p(q, String(ans), `${a}${v}=${rhs}+${b}=${a*ans}, ${v}=${ans}`))
    }
  }
  return out
}

// ── Grade 6 ─────────────────────────────────────────────────────────────────
function genLinearEquations(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['add','sub','mul','twoStep','frac'])
  while (out.length < n) {
    const t = types.next().value
    const x = rnd(2, 10), a = rnd(2, 7), b = rnd(1, 10)
    if (t === 'add') {
      const rhs = a * x + b
      const q = `${a}x + ${b} = ${rhs}`
      if (has(out, q)) continue
      out.push(p(q, String(x), `Step1: ${a}x=${rhs}−${b}=${a*x}. Step2: x=${x}`))
    } else if (t === 'sub') {
      const rhs = a * x - b
      const q = `${a}x − ${b} = ${rhs}`
      if (has(out, q)) continue
      out.push(p(q, String(x), `Step1: ${a}x=${rhs}+${b}=${a*x}. Step2: x=${x}`))
    } else if (t === 'mul') {
      const q = `${a}x = ${a * x}`
      if (has(out, q)) continue
      out.push(p(q, String(x), `x=${a*x}÷${a}=${x}`))
    } else if (t === 'twoStep') {
      const c = rnd(2, 4)
      const rhs = a * x + b + c
      const q = `${a}x + ${b} + ${c} = ${rhs}`
      if (has(out, q)) continue
      out.push(p(q, String(x), `${a}x=${rhs}−${b+c}=${a*x}, x=${x}`))
    } else {
      const denom = rnd(2, 4)
      const q = `x/${denom} = ${x}`
      if (has(out, q)) continue
      out.push(p(q, String(x * denom), `x=${x}×${denom}=${x*denom}`))
    }
  }
  return out
}

function genAngles(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['comp','supp','triangle','vertical','straight'])
  while (out.length < n) {
    const t = types.next().value
    if (t === 'comp') {
      const a = rnd(10, 80)
      const q = `Complement of ${a}°?`
      if (has(out, q)) continue
      out.push(p(q, String(90 - a), `90−${a}=${90-a}°`))
    } else if (t === 'supp') {
      const a = rnd(10, 170)
      const q = `Supplement of ${a}°?`
      if (has(out, q)) continue
      out.push(p(q, String(180 - a), `180−${a}=${180-a}°`))
    } else if (t === 'triangle') {
      const a = rnd(20, 80), b = rnd(20, 160 - a)
      const q = `Third angle: ${a}° and ${b}°?`
      if (has(out, q)) continue
      out.push(p(q, String(180 - a - b), `180−${a}−${b}=${180-a-b}°`))
    } else if (t === 'vertical') {
      const a = rnd(15, 165)
      const q = `Vertical angle to ${a}°?`
      if (has(out, q)) continue
      out.push(p(q, String(a), `Vertical angles are equal: ${a}°`))
    } else {
      const a = rnd(30, 150)
      const q = `Angles on a straight line: ${a}° + ? = 180°`
      if (has(out, q)) continue
      out.push(p(q, String(180 - a), `180−${a}=${180-a}°`))
    }
  }
  return out
}

function genProbability(n: number): Problem[] {
  const probs: [string, string, string][] = [
    ['P(heads on fair coin)','1/2','1 out of 2 → 1/2'],
    ['P(rolling 3 on fair die)','1/6','1 out of 6 faces → 1/6'],
    ['P(rolling even on die)','1/2','2,4,6 = 3 out of 6 → 1/2'],
    ['P(rolling >4 on die)','1/3','5,6 = 2 out of 6 → 1/3'],
    ['P(rolling 1 on die)','1/6','1 out of 6 → 1/6'],
    ['P(rolling <3 on die)','1/3','1,2 = 2 out of 6 → 1/3'],
    ['P(rolling odd on die)','1/2','1,3,5 = 3 out of 6 → 1/2'],
    ['P(red card in deck)','1/2','26 red out of 52 → 1/2'],
    ['P(ace in deck)','1/13','4 out of 52 → 1/13'],
    ['P(impossible event)','0','Cannot happen → P=0'],
    ['P(certain event)','1','Always happens → P=1'],
    ['P(rolling 1 or 2)','1/3','2 out of 6 → 1/3'],
    ['P(rolling 5 or 6)','1/3','2 out of 6 → 1/3'],
    ['P(king in deck)','1/13','4 kings out of 52 → 1/13'],
    ['P(tails on fair coin)','1/2','1 out of 2 → 1/2'],
    ['P(rolling ≥3 on die)','2/3','3,4,5,6 = 4 out of 6 → 2/3'],
  ]
  const out: Problem[] = []
  const shuffled = shuffle(probs)
  let i = 0
  while (out.length < n) {
    const [q, a, e] = shuffled[i % shuffled.length]
    i++
    const question = `${q} = ?`
    if (!has(out, question)) out.push(p(question, a, e))
  }
  return out
}

// ── Grade 7 ─────────────────────────────────────────────────────────────────
function genSystems(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['addElim','subElim','substitution','wordProblem'])
  while (out.length < n) {
    const t = types.next().value
    if (t === 'addElim') {
      const x = rnd(2, 8), y = rnd(2, 8)
      const sum = x + y, diff = x - y
      const target = pick(['x', 'y'])
      if (target === 'x') {
        const q = `x+y=${sum}, x−y=${diff}. Find x`
        if (has(out, q)) continue
        out.push(p(q, String(x), `Add equations: 2x=${2*x} → x=${x}`))
      } else {
        const q = `x+y=${sum}, x−y=${diff}. Find y`
        if (has(out, q)) continue
        out.push(p(q, String(y), `x=${x}, then y=${sum}−${x}=${y}`))
      }
    } else if (t === 'subElim') {
      const x = rnd(2, 6), y = rnd(2, 6)
      const sum1 = 2*x + y, sum2 = x + y
      const q = `2x+y=${sum1}, x+y=${sum2}. Find x`
      if (has(out, q)) continue
      out.push(p(q, String(x), `Subtract eq2 from eq1: x=${sum1-sum2}=${x}`))
    } else if (t === 'substitution') {
      const x = rnd(1, 6), b = rnd(1, 5)
      const y = x + b
      const q = `y=x+${b}, x+y=${x+y}. Find x`
      if (has(out, q)) continue
      out.push(p(q, String(x), `Sub: x+(x+${b})=${x+y}, 2x=${x+y-b}, x=${x}`))
    } else {
      const tickets = rnd(2, 5), price = rnd(3, 8)
      const total = tickets * price
      const q = `${tickets} tickets cost $${total}. Price each?`
      if (has(out, q)) continue
      out.push(p(q, `$${price}`, `${total}÷${tickets}=${price}`))
    }
  }
  return out
}

function genExponentRules(n: number): Problem[] {
  const rules: Problem[] = [
    p('x³ × x⁴ = ?','x7','Same base: add exponents 3+4=7 → x⁷'),
    p('(x²)³ = ?','x6','Power of power: 2×3=6 → x⁶'),
    p('x⁵ ÷ x² = ?','x3','Divide: 5−2=3 → x³'),
    p('x⁰ = ?','1','Any nonzero base to power 0 = 1'),
    p('(x³)² = ?','x6','Multiply: 3×2=6 → x⁶'),
    p('x⁴ ÷ x⁴ = ?','1','x⁴÷x⁴=x⁰=1'),
    p('x² × x² = ?','x4','Add exponents: 2+2=4 → x⁴'),
    p('(x⁴)² = ?','x8','Multiply: 4×2=8 → x⁸'),
    p('x⁶ ÷ x³ = ?','x3','Subtract: 6−3=3 → x³'),
    p('(2x)² = ?','4x2','Square both: 2²=4 and x² → 4x²'),
    p('3² × 3³ = ?','243','Add: 3⁵=243'),
    p('2³ × 2² = ?','32','Add: 2⁵=32'),
    p('x⁷ ÷ x⁰ = ?','x7','x⁰=1, dividing by 1 → x⁷'),
    p('(3x²)² = ?','9x4','3²=9, (x²)²=x⁴ → 9x⁴'),
    p('2⁴ ÷ 2² = ?','4','2²=4'),
    p('5¹ = ?','5','Any number to power 1 = itself'),
  ]
  return shuffle(rules).slice(0, n)
}

function genPythagorean(n: number): Problem[] {
  const triples: [number, number, number][] = [
    [3,4,5],[5,12,13],[8,6,10],[9,12,15],[7,24,25],[20,21,29],[6,8,10],[10,24,26],[15,20,25]
  ]
  const out: Problem[] = []
  const types = cycleTypes(['findC','findA','findB','isPyth'])
  while (out.length < n) {
    const [a, b, c] = pick(triples)
    const t = types.next().value
    if (t === 'findC') {
      const q = `a=${a}, b=${b}, find c`
      if (has(out, q)) continue
      out.push(p(q, String(c), `${a}²+${b}²=${a*a+b*b}=c² → c=${c}`))
    } else if (t === 'findA') {
      const q = `b=${b}, c=${c}, find a`
      if (has(out, q)) continue
      out.push(p(q, String(a), `a²=${c}²−${b}²=${c*c-b*b} → a=${a}`))
    } else if (t === 'findB') {
      const q = `a=${a}, c=${c}, find b`
      if (has(out, q)) continue
      out.push(p(q, String(b), `b²=${c}²−${a}²=${c*c-a*a} → b=${b}`))
    } else {
      const isTriple = pick([true, false])
      const [ta, tb, tc] = isTriple ? pick(triples) : [rnd(2,8), rnd(2,8), rnd(5,15)]
      const q = `Is ${ta},${tb},${tc} a Pythagorean triple?`
      if (has(out, q)) continue
      const isPyth = ta*ta + tb*tb === tc*tc
      out.push(p(q, isPyth ? 'Yes' : 'No', `${ta}²+${tb}²=${ta*ta+tb*tb}, c²=${tc*tc}${isPyth?' ✓ match':' ✗ no match'}`))
    }
  }
  return out
}

// ── Grade 8 ─────────────────────────────────────────────────────────────────
function genQuadratics(n: number): Problem[] {
  const quads: Problem[] = [
    p('x²−5x+6=0','2,3','Factor: (x−2)(x−3)=0 → x=2 or 3'),
    p('x²−9=0','3,-3','Difference of squares: x=±3'),
    p('x²+4x+4=0','-2','Perfect square: (x+2)²=0 → x=−2'),
    p('x²−7x+12=0','3,4','Factor: (x−3)(x−4)=0'),
    p('x²+5x+6=0','-2,-3','Factor: (x+2)(x+3)=0'),
    p('x²−4=0','2,-2','Difference of squares: x=±2'),
    p('x²−6x+9=0','3','Perfect square: (x−3)²=0'),
    p('x²+2x−8=0','2,-4','Factor: (x+4)(x−2)=0'),
    p('x²−1=0','1,-1','Difference of squares: x=±1'),
    p('x²+6x+9=0','-3','Perfect square: (x+3)²=0'),
    p('x²−3x+2=0','1,2','Factor: (x−1)(x−2)=0'),
    p('x²+7x+10=0','-2,-5','Factor: (x+2)(x+5)=0'),
    p('x²−8x+15=0','3,5','Factor: (x−3)(x−5)=0'),
    p('x²+x−6=0','2,-3','Factor: (x+3)(x−2)=0'),
    p('x²−16=0','4,-4','Difference of squares: x=±4'),
    p('x²+3x−10=0','2,-5','Factor: (x+5)(x−2)=0'),
  ]
  return shuffle(quads).slice(0, n)
}

function genFunctions(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['linear','quad','const','inverse','domain'])
  while (out.length < n) {
    const t = types.next().value
    const x = rnd(1, 6)
    if (t === 'linear') {
      const a = rnd(2, 5), b = rnd(1, 8)
      const q = `f(x)=${a}x+${b}. f(${x})=?`
      if (has(out, q)) continue
      out.push(p(q, String(a*x+b), `${a}(${x})+${b}=${a*x}+${b}=${a*x+b}`))
    } else if (t === 'quad') {
      const q = `f(x)=x². f(${x})=?`
      if (has(out, q)) continue
      out.push(p(q, String(x*x), `${x}²=${x*x}`))
    } else if (t === 'const') {
      const a = rnd(2, 5)
      const q = `f(x)=${a}x. f(${x})=?`
      if (has(out, q)) continue
      out.push(p(q, String(a*x), `${a}×${x}=${a*x}`))
    } else if (t === 'inverse') {
      const a = rnd(2, 5), b = rnd(1, 8)
      const y = a * x + b
      const q = `f(x)=${a}x+${b}. f(x)=${y}, find x`
      if (has(out, q)) continue
      out.push(p(q, String(x), `${a}x=${y}−${b}=${a*x}, x=${x}`))
    } else {
      const a = rnd(2, 4), b = rnd(1, 5)
      const q = `f(x)=x²−${a}x+${b}. f(${x})=?`
      if (has(out, q)) continue
      out.push(p(q, String(x*x - a*x + b), `${x}²−${a}(${x})+${b}=${x*x}−${a*x}+${b}=${x*x-a*x+b}`))
    }
  }
  return out
}

function genInequalities(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['>','<','>=','<=','>neg','compound'])
  while (out.length < n) {
    const t = types.next().value
    const x = rnd(2, 10), a = rnd(2, 5), b = rnd(1, 8)
    if (t === '>') {
      const q = `${a}x + ${b} > ${a*x+b}`
      if (has(out, q)) continue
      out.push(p(q, `x > ${x}`, `${a}x>${a*x} → x>${x}`))
    } else if (t === '<') {
      const q = `${a}x + ${b} < ${a*(x+1)+b}`
      if (has(out, q)) continue
      out.push(p(q, `x < ${x+1}`, `${a}x<${a*(x+1)} → x<${x+1}`))
    } else if (t === '>=') {
      const q = `${a}x − ${b} ≥ ${a*x-b}`
      if (has(out, q)) continue
      out.push(p(q, `x ≥ ${x}`, `${a}x≥${a*x} → x≥${x}`))
    } else if (t === '<=') {
      const q = `${a}x ≤ ${a*x}`
      if (has(out, q)) continue
      out.push(p(q, `x ≤ ${x}`, `x≤${a*x}÷${a}=${x}`))
    } else if (t === '>neg') {
      const neg = rnd(2, 5)
      const q = `−${neg}x > ${neg*(x-1)}`
      if (has(out, q)) continue
      out.push(p(q, `x < ${-(x-1)}`, `FLIP sign dividing by −${neg}: x<${-(x-1)}`))
    } else {
      const lo = rnd(1, 4), hi = rnd(6, 12)
      const xval = rnd(lo, hi)
      const q2 = `${lo} < x < ${hi}. Is x=${xval} valid?`
      if (has(out, q2)) continue
      out.push(p(q2, 'Yes', `${lo} < ${xval} < ${hi} ✓`))
    }
  }
  return out
}

// ── Grade 9 ─────────────────────────────────────────────────────────────────
const trigVals: Problem[] = [
  p('sin(30°) = ?','0.5','sin(30°)=1/2'),
  p('cos(60°) = ?','0.5','cos(60°)=1/2'),
  p('tan(45°) = ?','1','tan(45°)=1'),
  p('sin(90°) = ?','1','sin(90°)=1'),
  p('cos(0°) = ?','1','cos(0°)=1'),
  p('sin(0°) = ?','0','sin(0°)=0'),
  p('cos(90°) = ?','0','cos(90°)=0'),
  p('tan(0°) = ?','0','tan(0°)=0'),
  p('sin(60°) = ?','0.87','sin(60°)=√3/2≈0.866'),
  p('cos(30°) = ?','0.87','cos(30°)=√3/2≈0.866'),
  p('sin(45°) = ?','0.71','sin(45°)=√2/2≈0.707'),
  p('cos(45°) = ?','0.71','cos(45°)=√2/2≈0.707'),
  p('tan(60°) = ?','1.73','tan(60°)=√3≈1.732'),
  p('tan(30°) = ?','0.58','tan(30°)=1/√3≈0.577'),
  p('sin(180°) = ?','0','sin(180°)=0'),
  p('cos(180°) = ?','-1','cos(180°)=−1'),
]

function genCircleTheorems(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['area','circ','diam','radius','arc','sector'])
  while (out.length < n) {
    const t = types.next().value
    const r = rnd(1, 10)
    if (t === 'area') {
      const q = `Area of circle r=${r}?`
      if (has(out, q)) continue
      out.push(p(q, String((Math.PI*r*r).toFixed(2)), `π×${r}²≈${(Math.PI*r*r).toFixed(2)}`))
    } else if (t === 'circ') {
      const q = `Circumference r=${r}?`
      if (has(out, q)) continue
      out.push(p(q, String((2*Math.PI*r).toFixed(2)), `2πr≈${(2*Math.PI*r).toFixed(2)}`))
    } else if (t === 'diam') {
      const q = `Diameter if r=${r}?`
      if (has(out, q)) continue
      out.push(p(q, String(2*r), `d=2r=2×${r}=${2*r}`))
    } else if (t === 'radius') {
      const d = r * 2
      const q = `Radius if diameter=${d}?`
      if (has(out, q)) continue
      out.push(p(q, String(r), `r=d÷2=${d}÷2=${r}`))
    } else if (t === 'arc') {
      const deg = pick([90, 120, 180, 60])
      const arc = 2 * Math.PI * r * deg / 360
      const q = `Arc length r=${r}, angle=${deg}°?`
      if (has(out, q)) continue
      out.push(p(q, arc.toFixed(2), `(${deg}/360)×2π×${r}≈${arc.toFixed(2)}`))
    } else {
      const deg = pick([90, 180, 60, 120])
      const sect = Math.PI * r * r * deg / 360
      const q = `Sector area r=${r}, angle=${deg}°?`
      if (has(out, q)) continue
      out.push(p(q, sect.toFixed(2), `(${deg}/360)×π×${r}²≈${sect.toFixed(2)}`))
    }
  }
  return out
}

// ── Grade 10 ────────────────────────────────────────────────────────────────
const logProblems: Problem[] = [
  p('log₂(32) = ?','5','2⁵=32'),
  p('log(100) = ?','2','10²=100'),
  p('ln(e³) = ?','3','ln(e³)=3'),
  p('log₂(8) = ?','3','2³=8'),
  p('log(1000) = ?','3','10³=1000'),
  p('log₃(9) = ?','2','3²=9'),
  p('ln(1) = ?','0','e⁰=1'),
  p('log₅(25) = ?','2','5²=25'),
  p('log(10) = ?','1','10¹=10'),
  p('log₂(16) = ?','4','2⁴=16'),
  p('log₃(27) = ?','3','3³=27'),
  p('log₄(16) = ?','2','4²=16'),
  p('log₂(64) = ?','6','2⁶=64'),
  p('log₁₀(1) = ?','0','10⁰=1'),
  p('log₂(1) = ?','0','2⁰=1'),
  p('log₅(125) = ?','3','5³=125'),
  p('log₆(36) = ?','2','6²=36'),
  p('ln(e) = ?','1','e¹=e'),
]

const complexProblems: Problem[] = [
  p('i² = ?','-1','i=√−1, so i²=−1'),
  p('|3+4i| = ?','5','√(9+16)=5'),
  p('(3+2i)+(1−4i) = ?','4-2i','3+1=4, 2−4=−2 → 4−2i'),
  p('i³ = ?','-i','i²×i=−i'),
  p('i⁴ = ?','1','(i²)²=1'),
  p('|5+12i| = ?','13','√(25+144)=13'),
  p('(1+i)² = ?','2i','1+2i+i²=2i'),
  p('i⁵ = ?','i','i⁴×i=i'),
  p('(4+3i)−(1+i) = ?','3+2i','4−1=3, 3−1=2'),
  p('(2+i)+(3+2i) = ?','5+3i','2+3=5, 1+2=3'),
  p('|0+3i| = ?','3','√9=3'),
  p('i⁶ = ?','-1','(i²)³=−1'),
  p('(1+i)(1−i) = ?','2','1−i²=1+1=2'),
  p('conjugate of (3+2i)','3-2i','Flip imaginary sign'),
  p('Re(4+7i) = ?','4','Real part = 4'),
  p('Im(3−5i) = ?','-5','Imaginary part = −5'),
]

function genSequences(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['arith','geo','sum','fibLike','arithTerm'])
  while (out.length < n) {
    const t = types.next().value
    if (t === 'arith') {
      const a = rnd(1, 5), d = rnd(2, 5), nth = rnd(4, 8)
      const val = a + (nth - 1) * d
      const seq = [a, a+d, a+2*d, a+3*d].join(',')
      const q = `${nth}th term: ${seq},...`
      if (has(out, q)) continue
      out.push(p(q, String(val), `d=${d}. Term ${nth}: ${a}+(${nth-1})×${d}=${val}`))
    } else if (t === 'geo') {
      const a = rnd(1, 4), r = rnd(2, 3), nth = rnd(4, 6)
      const val = a * Math.pow(r, nth - 1)
      const seq = [a, a*r, a*r*r, a*r*r*r].join(',')
      const q = `Geo ${nth}th term: ${seq},...`
      if (has(out, q)) continue
      out.push(p(q, String(val), `r=${r}. ${a}×${r}^${nth-1}=${val}`))
    } else if (t === 'sum') {
      const end = rnd(3, 8)
      const sum = (end * (end + 1)) / 2
      const q = `∑(1 to ${end}) = ?`
      if (has(out, q)) continue
      out.push(p(q, String(sum), `n(n+1)/2=${end}×${end+1}/2=${sum}`))
    } else if (t === 'fibLike') {
      const a = rnd(1, 4), b = rnd(1, 4)
      const c = a + b, d2 = b + c
      const q = `${a},${b},${c},${d2},?`
      if (has(out, q)) continue
      out.push(p(q, String(c + d2), `Add previous two: ${c}+${d2}=${c+d2}`))
    } else {
      const a = rnd(2, 6), d = rnd(3, 7)
      const nth = rnd(5, 10)
      const q = `Arith seq: first=${a}, diff=${d}. Sum of first ${nth} terms?`
      if (has(out, q)) continue
      const sum = nth * a + (nth * (nth - 1) / 2) * d
      out.push(p(q, String(sum), `S=n/2×(2a+(n-1)d)=${nth}/2×(${2*a}+${nth-1}×${d})=${sum}`))
    }
  }
  return out
}

// ── Grade 11 ────────────────────────────────────────────────────────────────
const limitProblems: Problem[] = [
  p('lim x→∞ 1/x = ?','0','As x→∞, 1/x→0'),
  p('lim x→0 sin(x)/x = ?','1','Famous limit=1'),
  p('lim x→2 x² = ?','4','2²=4'),
  p('lim x→∞ 5/x = ?','0','5/∞→0'),
  p('lim x→1 (x²−1)/(x−1) = ?','2','Factor: x+1 → 2'),
  p('lim x→0 x² = ?','0','0²=0'),
  p('lim x→4 √x = ?','2','√4=2'),
  p('lim x→∞ 2x/x = ?','2','Simplifies to 2'),
  p('lim x→2 (3x+1) = ?','7','3(2)+1=7'),
  p('lim x→3 x² = ?','9','3²=9'),
  p('lim x→∞ (x+1)/x = ?','1','→1+0=1'),
  p('lim x→0 5 = ?','5','Constant=constant'),
  p('lim x→∞ (3x²)/(x²+1) = ?','3','Leading coefficients ratio=3'),
  p('lim x→1 (x³−1)/(x−1) = ?','3','Factor: x²+x+1 at x=1 = 3'),
  p('lim x→0 (1−cos x)/x = ?','0','Standard limit=0'),
  p('lim x→∞ e^(-x) = ?','0','Exponential decay→0'),
]

function genVectors(n: number): Problem[] {
  const out: Problem[] = []
  const types = cycleTypes(['mag','dot','add','sub','scalar'])
  while (out.length < n) {
    const t = types.next().value
    const a1 = rnd(1, 6), a2 = rnd(1, 6), b1 = rnd(1, 6), b2 = rnd(1, 6)
    if (t === 'mag') {
      const mag = Math.sqrt(a1*a1 + a2*a2)
      const q = `|⟨${a1},${a2}⟩| = ?`
      if (has(out, q)) continue
      out.push(p(q, mag.toFixed(2), `√(${a1}²+${a2}²)=√${a1*a1+a2*a2}≈${mag.toFixed(2)}`))
    } else if (t === 'dot') {
      const q = `⟨${a1},${a2}⟩·⟨${b1},${b2}⟩ = ?`
      if (has(out, q)) continue
      out.push(p(q, String(a1*b1+a2*b2), `${a1}×${b1}+${a2}×${b2}=${a1*b1+a2*b2}`))
    } else if (t === 'add') {
      const q = `⟨${a1},${a2}⟩+⟨${b1},${b2}⟩ = ?`
      if (has(out, q)) continue
      out.push(p(q, `${a1+b1},${a2+b2}`, `${a1}+${b1}=${a1+b1}, ${a2}+${b2}=${a2+b2}`))
    } else if (t === 'sub') {
      const q = `⟨${a1},${a2}⟩−⟨${b1},${b2}⟩ = ?`
      if (has(out, q)) continue
      out.push(p(q, `${a1-b1},${a2-b2}`, `${a1}−${b1}=${a1-b1}, ${a2}−${b2}=${a2-b2}`))
    } else {
      const k = rnd(2, 5)
      const q = `${k}×⟨${a1},${a2}⟩ = ?`
      if (has(out, q)) continue
      out.push(p(q, `${k*a1},${k*a2}`, `Multiply each: ${k}×${a1}=${k*a1}, ${k}×${a2}=${k*a2}`))
    }
  }
  return out
}

// ── Grade 12 ────────────────────────────────────────────────────────────────
const derivativeProblems: Problem[] = [
  p('d/dx[x⁴] = ?','4x3','Power rule: 4x³'),
  p('d/dx[x²] = ?','2x','Power rule: 2x'),
  p('d/dx[x³] = ?','3x2','Power rule: 3x²'),
  p('d/dx[x⁵] = ?','5x4','Power rule: 5x⁴'),
  p('d/dx[x] = ?','1','x¹ → 1'),
  p('d/dx[7] = ?','0','Constant → 0'),
  p('d/dx[sin(x)] = ?','cos(x)','Derivative of sin=cos'),
  p('d/dx[cos(x)] = ?','-sin(x)','Derivative of cos=−sin'),
  p('d/dx[eˣ] = ?','ex','eˣ is its own derivative'),
  p('d/dx[ln(x)] = ?','1/x','d/dx[ln(x)]=1/x'),
  p('d/dx[3x] = ?','3','d/dx[3x]=3'),
  p('d/dx[x⁶] = ?','6x5','Power rule: 6x⁵'),
  p('d/dx[tan(x)] = ?','sec2(x)','d/dx[tan]=sec²(x)'),
  p('d/dx[x⁷] = ?','7x6','Power rule: 7x⁶'),
  p('d/dx[5x²] = ?','10x','Power rule+const: 10x'),
  p('d/dx[√x] = ?','1/(2√x)','½x^(−½)=1/(2√x)'),
]

const integralProblems: Problem[] = [
  p('∫x² dx = ?','x3/3+c','x³/3+C'),
  p('∫x dx = ?','x2/2+c','x²/2+C'),
  p('∫x³ dx = ?','x4/4+c','x⁴/4+C'),
  p('∫1 dx = ?','x+c','x+C'),
  p('∫eˣ dx = ?','ex+c','eˣ+C'),
  p('∫cos(x) dx = ?','sin(x)+c','sin+C'),
  p('∫sin(x) dx = ?','-cos(x)+c','−cos+C'),
  p('∫2x dx = ?','x2+c','x²+C'),
  p('∫₀¹ x dx = ?','0.5','[x²/2]₀¹=1/2'),
  p('∫₀¹ 1 dx = ?','1','[x]₀¹=1'),
  p('∫x⁴ dx = ?','x5/5+c','x⁵/5+C'),
  p('∫3x² dx = ?','x3+c','x³+C'),
  p('∫₀² x dx = ?','2','[x²/2]₀²=2'),
  p('∫₁² 2x dx = ?','3','[x²]₁²=4−1=3'),
  p('∫x⁻¹ dx = ?','ln|x|+c','ln|x|+C'),
  p('∫₀¹ x² dx = ?','1/3','[x³/3]₀¹=1/3'),
]

const chainRuleProblems: Problem[] = [
  p('d/dx[e^(3x)] = ?','3e3x','Outer e^u, inner 3 → 3e^(3x)'),
  p('d/dx[(x²+1)³] = ?','6x(x2+1)2','3u²×2x = 6x(x²+1)²'),
  p('d/dx[sin(x²)] = ?','2xcos(x2)','cos(x²)×2x'),
  p('d/dx[ln(2x)] = ?','1/x','1/(2x)×2=1/x'),
  p('d/dx[(x+1)⁵] = ?','5(x+1)4','5u⁴×1=5(x+1)⁴'),
  p('d/dx[e^(x²)] = ?','2xex2','e^(x²)×2x'),
  p('d/dx[cos(3x)] = ?','-3sin(3x)','−sin(3x)×3'),
  p('d/dx[(2x+1)²] = ?','4(2x+1)','2u×2=4(2x+1)'),
  p('d/dx[sin(5x)] = ?','5cos(5x)','cos(5x)×5'),
  p('d/dx[√(x+1)] = ?','1/(2√(x+1))','½u^(−½)×1'),
  p('d/dx[e^(-x)] = ?','-e-x','e^(−x)×(−1)'),
  p('d/dx[ln(x²)] = ?','2/x','1/x²×2x=2/x'),
  p('d/dx[(3x²+1)²] = ?','12x(3x2+1)','2u×6x=12x(3x²+1)'),
  p('d/dx[tan(2x)] = ?','2sec2(2x)','sec²(2x)×2'),
  p('d/dx[cos(x²)] = ?','-2xsin(x2)','−sin(x²)×2x'),
  p('d/dx[e^(x+1)] = ?','ex+1','e^(x+1)×1'),
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function fromPool(pool: Problem[], n: number): Problem[] {
  return shuffle(pool).slice(0, n)
}

// ── Main export ──────────────────────────────────────────────────────────────
export function generateLesson(grade: number, lessonIndex: number, count = 8): Problem[] {
  const gen: Record<number, Record<number, () => Problem[]>> = {
    1: {
      0: () => genAddition100(count),
      1: () => genSubtraction100(count),
      2: () => genSkipCounting(count),
    },
    2: {
      0: () => genMultiplication(count),
      1: () => genFractionsIntro(count),
      2: () => genPlaceValue(count),
    },
    3: {
      0: () => genLongMultiplication(count),
      1: () => genDivision(count),
      2: () => genAreaPerimeter(count),
    },
    4: {
      0: () => genFractionsDecimals(count),
      1: () => genAddingFractions(count),
      2: () => genMultiDigitMult(count),
    },
    5: {
      0: () => genRatios(count),
      1: () => genNegativeNumbers(count),
      2: () => genVariables(count),
    },
    6: {
      0: () => genLinearEquations(count),
      1: () => genAngles(count),
      2: () => genProbability(count),
    },
    7: {
      0: () => genSystems(count),
      1: () => genExponentRules(count),
      2: () => genPythagorean(count),
    },
    8: {
      0: () => genQuadratics(count),
      1: () => genFunctions(count),
      2: () => genInequalities(count),
    },
    9: {
      0: () => fromPool(trigVals, count),
      1: () => genCircleTheorems(count),
      2: () => fromPool(trigVals, count),
    },
    10: {
      0: () => fromPool(logProblems, count),
      1: () => fromPool(complexProblems, count),
      2: () => genSequences(count),
    },
    11: {
      0: () => fromPool(limitProblems, count),
      1: () => genVectors(count),
      2: () => fromPool(limitProblems, count),
    },
    12: {
      0: () => fromPool(derivativeProblems, count),
      1: () => fromPool(integralProblems, count),
      2: () => fromPool(chainRuleProblems, count),
    },
  }
  const gradeGen = gen[grade]
  if (!gradeGen) return []
  const lessonGen = gradeGen[lessonIndex]
  if (!lessonGen) return []
  return lessonGen()
}
