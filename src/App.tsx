import { useState, useMemo, useEffect, useRef } from 'react'
import './App.css'
import { generateLesson } from './generators'

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

type Problem = { q: string; a: string; explain: string }
type Lesson = { topic: string; description: string; problems: Problem[] }

const p = (q: string, a: string, explain: string): Problem => ({ q, a, explain })

const curriculum: Record<number, { label: string; lessons: Lesson[] }> = {
  1: { label: 'Grade 1 → Grade 2', lessons: [
    { topic: 'Addition up to 100', description: 'Add two-digit numbers by lining up the ones and tens columns.', problems: [
      p('34 + 21 = ?','55','Line up: 4+1=5 ones, 3+2=5 tens → 55'),
      p('47 + 36 = ?','83','7+6=13, write 3 carry 1. 4+3+1=8 → 83'),
      p('52 + 29 = ?','81','2+9=11, write 1 carry 1. 5+2+1=8 → 81'),
      p('63 + 18 = ?','81','3+8=11, write 1 carry 1. 6+1+1=8 → 81'),
      p('45 + 45 = ?','90','5+5=10, write 0 carry 1. 4+4+1=9 → 90'),
      p('27 + 54 = ?','81','7+4=11, write 1 carry 1. 2+5+1=8 → 81'),
      p('38 + 43 = ?','81','8+3=11, write 1 carry 1. 3+4+1=8 → 81'),
      p('16 + 75 = ?','91','6+5=11, write 1 carry 1. 1+7+1=9 → 91'),
      p('59 + 33 = ?','92','9+3=12, write 2 carry 1. 5+3+1=9 → 92'),
      p('74 + 18 = ?','92','4+8=12, write 2 carry 1. 7+1+1=9 → 92'),
    ]},
    { topic: 'Subtraction up to 100', description: 'Subtract by borrowing from the tens column when needed.', problems: [
      p('75 − 32 = ?','43','5−2=3 ones, 7−3=4 tens → 43'),
      p('90 − 47 = ?','43','0−7 borrow: 10−7=3, 8−4=4 → 43'),
      p('61 − 28 = ?','33','1−8 borrow: 11−8=3, 5−2=3 → 33'),
      p('84 − 36 = ?','48','4−6 borrow: 14−6=8, 7−3=4 → 48'),
      p('72 − 45 = ?','27','2−5 borrow: 12−5=7, 6−4=2 → 27'),
      p('50 − 19 = ?','31','0−9 borrow: 10−9=1, 4−1=3 → 31'),
      p('93 − 57 = ?','36','3−7 borrow: 13−7=6, 8−5=3 → 36'),
      p('66 − 28 = ?','38','6−8 borrow: 16−8=8, 5−2=3 → 38'),
      p('41 − 16 = ?','25','1−6 borrow: 11−6=5, 3−1=2 → 25'),
      p('80 − 35 = ?','45','0−5 borrow: 10−5=5, 7−3=4 → 45'),
    ]},
    { topic: 'Skip Counting', description: 'Skip counting means jumping by the same number each time.', problems: [
      p('Count by 5s: 5,10,15,?,?','20,25','Add 5 each time: 15+5=20, 20+5=25'),
      p('Count by 2s: 2,4,6,?,?','8,10','Add 2 each time: 6+2=8, 8+2=10'),
      p('Count by 10s: 10,20,?,?','30,40','Add 10 each time: 20+10=30, 30+10=40'),
      p('Count by 3s: 3,6,9,?,?','12,15','Add 3 each time: 9+3=12, 12+3=15'),
      p('Count by 4s: 4,8,12,?,?','16,20','Add 4 each time: 12+4=16, 16+4=20'),
      p('Count by 5s: 25,30,35,?,?','40,45','Add 5 each time: 35+5=40, 40+5=45'),
      p('Count by 2s: 14,16,18,?,?','20,22','Add 2 each time: 18+2=20, 20+2=22'),
      p('Count by 10s: 40,50,?,?','60,70','Add 10 each time: 50+10=60, 60+10=70'),
      p('Count by 3s: 15,18,21,?,?','24,27','Add 3 each time: 21+3=24, 24+3=27'),
      p('Count by 4s: 20,24,28,?,?','32,36','Add 4 each time: 28+4=32, 32+4=36'),
    ]},
  ]},
  2: { label: 'Grade 2 → Grade 3', lessons: [
    { topic: 'Multiplication', description: 'Multiplication is repeated addition. 3×4 means 3 groups of 4.', problems: [
      p('3 × 4 = ?','12','3 groups of 4: 4+4+4=12'),
      p('5 × 6 = ?','30','5 groups of 6: 6+6+6+6+6=30'),
      p('7 × 2 = ?','14','7 groups of 2: 2×7=14'),
      p('6 × 8 = ?','48','6×8: think 6×8=48 (memorise this one!)'),
      p('9 × 3 = ?','27','9×3: 9+9+9=27'),
      p('4 × 7 = ?','28','4×7: 4+4+4+4+4+4+4=28'),
      p('8 × 5 = ?','40','8×5: count by 5s eight times → 40'),
      p('2 × 9 = ?','18','2×9=18 (same as 9×2)'),
      p('6 × 6 = ?','36','6×6=36 (square number)'),
      p('7 × 7 = ?','49','7×7=49 (square number)'),
    ]},
    { topic: 'Fractions Intro', description: 'A fraction shows part of a whole. 1/2 of a number means divide by 2.', problems: [
      p('1/2 of 8 = ?','4','Divide 8 by 2: 8÷2=4'),
      p('1/4 of 12 = ?','3','Divide 12 by 4: 12÷4=3'),
      p('1/3 of 9 = ?','3','Divide 9 by 3: 9÷3=3'),
      p('1/2 of 14 = ?','7','Divide 14 by 2: 14÷2=7'),
      p('1/4 of 20 = ?','5','Divide 20 by 4: 20÷4=5'),
      p('1/5 of 25 = ?','5','Divide 25 by 5: 25÷5=5'),
      p('1/3 of 21 = ?','7','Divide 21 by 3: 21÷3=7'),
      p('1/2 of 30 = ?','15','Divide 30 by 2: 30÷2=15'),
      p('1/4 of 40 = ?','10','Divide 40 by 4: 40÷4=10'),
      p('1/6 of 18 = ?','3','Divide 18 by 6: 18÷6=3'),
    ]},
    { topic: 'Place Value', description: 'Every digit has a place: hundreds, tens, ones. 374 = 300+70+4.', problems: [
      p('Hundreds digit of 374?','3','374 = 3 hundreds, 7 tens, 4 ones → hundreds digit is 3'),
      p('200+50+6 = ?','256','200+50+6 = 256'),
      p('400+30+7 = ?','437','400+30+7 = 437'),
      p('Tens digit of 582?','8','582 = 5 hundreds, 8 tens, 2 ones → tens digit is 8'),
      p('Ones digit of 749?','9','749 = 7 hundreds, 4 tens, 9 ones → ones digit is 9'),
      p('100+20+3 = ?','123','100+20+3 = 123'),
      p('600+5 = ?','605','600+0+5 = 605 (zero tens)'),
      p('Hundreds digit of 809?','8','809 = 8 hundreds, 0 tens, 9 ones → 8'),
      p('300+70 = ?','370','300+70+0 = 370'),
      p('What is the value of 5 in 523?','500','The 5 is in the hundreds place, so its value is 500'),
    ]},
  ]},
  3: { label: 'Grade 3 → Grade 4', lessons: [
    { topic: 'Long Multiplication', description: 'Multiply the ones, then the tens. Add the results together.', problems: [
      p('12 × 11 = ?','132','12×10=120, 12×1=12, 120+12=132'),
      p('14 × 6 = ?','84','14×6: 10×6=60, 4×6=24, 60+24=84'),
      p('25 × 4 = ?','100','25×4: 20×4=80, 5×4=20, 80+20=100'),
      p('13 × 7 = ?','91','13×7: 10×7=70, 3×7=21, 70+21=91'),
      p('16 × 5 = ?','80','16×5: 10×5=50, 6×5=30, 50+30=80'),
      p('21 × 8 = ?','168','21×8: 20×8=160, 1×8=8, 160+8=168'),
      p('15 × 9 = ?','135','15×9: 10×9=90, 5×9=45, 90+45=135'),
      p('32 × 3 = ?','96','32×3: 30×3=90, 2×3=6, 90+6=96'),
      p('24 × 4 = ?','96','24×4: 20×4=80, 4×4=16, 80+16=96'),
      p('11 × 11 = ?','121','11×11: 11×10=110, 11×1=11, 110+11=121'),
    ]},
    { topic: 'Division', description: 'Division splits into equal groups. Ask: "how many times does the divisor fit?"', problems: [
      p('48 ÷ 6 = ?','8','6×8=48, so 48÷6=8'),
      p('37 ÷ 5 = ?','7r2','5×7=35, 37−35=2 remainder → 7r2'),
      p('72 ÷ 8 = ?','9','8×9=72, so 72÷8=9'),
      p('56 ÷ 7 = ?','8','7×8=56, so 56÷7=8'),
      p('45 ÷ 9 = ?','5','9×5=45, so 45÷9=5'),
      p('33 ÷ 4 = ?','8r1','4×8=32, 33−32=1 remainder → 8r1'),
      p('64 ÷ 8 = ?','8','8×8=64, so 64÷8=8'),
      p('29 ÷ 6 = ?','4r5','6×4=24, 29−24=5 remainder → 4r5'),
      p('81 ÷ 9 = ?','9','9×9=81, so 81÷9=9'),
      p('50 ÷ 7 = ?','7r1','7×7=49, 50−49=1 remainder → 7r1'),
    ]},
    { topic: 'Area & Perimeter', description: 'Perimeter = add all sides. Area = length × width for rectangles.', problems: [
      p('Perimeter of 4×6?','20','Add all sides: 4+6+4+6=20'),
      p('Area of 5×7?','35','Area = 5×7=35 square units'),
      p('Perimeter square side 9?','36','Square has 4 equal sides: 9×4=36'),
      p('Area of 3×8?','24','Area = 3×8=24 square units'),
      p('Perimeter of 5×5?','20','5+5+5+5=20'),
      p('Area of 6×6?','36','Area = 6×6=36 (it\'s a square!)'),
      p('Perimeter of 2×9?','22','2+9+2+9=22'),
      p('Area of 10×4?','40','Area = 10×4=40 square units'),
      p('Perimeter of 7×3?','20','7+3+7+3=20'),
      p('Area of 8×8?','64','Area = 8×8=64 (square number!)'),
    ]},
  ]},
  4: { label: 'Grade 4 → Grade 5', lessons: [
    { topic: 'Fractions & Decimals', description: 'To convert a fraction to decimal, divide the top by the bottom.', problems: [
      p('3/4 as decimal?','0.75','3÷4=0.75 (think: 3/4 of a dollar = 75 cents)'),
      p('0.5 as fraction?','1/2','0.5 = 5/10 = 1/2'),
      p('1/5 as decimal?','0.2','1÷5=0.2'),
      p('1/4 as decimal?','0.25','1÷4=0.25 (quarter dollar!)'),
      p('0.75 as fraction?','3/4','0.75 = 75/100 = 3/4'),
      p('2/5 as decimal?','0.4','2÷5=0.4'),
      p('0.1 as fraction?','1/10','0.1 = 1/10'),
      p('3/10 as decimal?','0.3','3÷10=0.3'),
      p('1/2 as decimal?','0.5','1÷2=0.5'),
      p('0.25 as fraction?','1/4','0.25 = 25/100 = 1/4'),
    ]},
    { topic: 'Adding Fractions', description: 'Same denominator: add tops. Different: find a common denominator first.', problems: [
      p('1/4 + 2/4 = ?','3/4','Same bottom: 1+2=3, keep /4 → 3/4'),
      p('1/3 + 1/6 = ?','1/2','Make same: 2/6+1/6=3/6=1/2'),
      p('2/5 + 1/10 = ?','1/2','Make same: 4/10+1/10=5/10=1/2'),
      p('1/2 + 1/4 = ?','3/4','Make same: 2/4+1/4=3/4'),
      p('1/3 + 1/3 = ?','2/3','Same bottom: 1+1=2, keep /3 → 2/3'),
      p('3/8 + 1/8 = ?','1/2','Same bottom: 3+1=4/8=1/2'),
      p('1/6 + 1/3 = ?','1/2','Make same: 1/6+2/6=3/6=1/2'),
      p('2/3 + 1/6 = ?','5/6','Make same: 4/6+1/6=5/6'),
      p('1/4 + 1/4 = ?','1/2','Same bottom: 1+1=2/4=1/2'),
      p('3/10 + 1/5 = ?','1/2','Make same: 3/10+2/10=5/10=1/2'),
    ]},
    { topic: 'Multi-digit Multiplication', description: 'Multiply by ones digit, then tens digit (×10), then add.', problems: [
      p('123 × 12 = ?','1476','123×2=246, 123×10=1230, 246+1230=1476'),
      p('204 × 11 = ?','2244','204×1=204, 204×10=2040, 204+2040=2244'),
      p('312 × 21 = ?','6552','312×1=312, 312×20=6240, 312+6240=6552'),
      p('111 × 11 = ?','1221','111×1=111, 111×10=1110, 111+1110=1221'),
      p('200 × 15 = ?','3000','200×5=1000, 200×10=2000, 1000+2000=3000'),
      p('132 × 10 = ?','1320','Multiply by 10: add a zero → 1320'),
      p('150 × 4 = ?','600','150×4: 100×4=400, 50×4=200, 400+200=600'),
      p('221 × 3 = ?','663','221×3: 200×3=600, 21×3=63, 600+63=663'),
      p('120 × 5 = ?','600','120×5: 100×5=500, 20×5=100, 500+100=600'),
      p('302 × 3 = ?','906','302×3: 300×3=900, 2×3=6, 900+6=906'),
    ]},
  ]},
  5: { label: 'Grade 5 → Grade 6', lessons: [
    { topic: 'Ratios & Proportions', description: 'A ratio compares two quantities. Scale both sides by the same number.', problems: [
      p('3:5 = ?:20','12','5×4=20, so 3×4=12'),
      p('Simplify 12:16','3:4','GCD of 12 and 16 is 4. 12÷4=3, 16÷4=4 → 3:4'),
      p('60% of 80 = ?','48','60% = 60/100 = 0.6. 0.6×80=48'),
      p('2:3 = 8:?','12','2×4=8, so 3×4=12'),
      p('Simplify 9:12','3:4','GCD=3. 9÷3=3, 12÷3=4 → 3:4'),
      p('50% of 60 = ?','30','50% = half. 60÷2=30'),
      p('1:4 = 5:?','20','1×5=5, so 4×5=20'),
      p('25% of 40 = ?','10','25% = 1/4. 40÷4=10'),
      p('Simplify 10:15','2:3','GCD=5. 10÷5=2, 15÷5=3 → 2:3'),
      p('75% of 20 = ?','15','75% = 3/4. 20×3÷4=15'),
    ]},
    { topic: 'Negative Numbers', description: 'On a number line, negatives are left of zero. Subtracting a negative = adding.', problems: [
      p('-4 + 7 = ?','3','Start at -4, move 7 right → 3'),
      p('5 − (−3) = ?','8','Subtracting negative = adding: 5+3=8'),
      p('-6 × -2 = ?','12','Negative × negative = positive: 6×2=12'),
      p('-3 + (-5) = ?','-8','Both negative: −3−5=−8'),
      p('10 − 14 = ?','-4','10−14=−4 (went below zero)'),
      p('-7 + 7 = ?','0','Opposites cancel: −7+7=0'),
      p('-2 × 5 = ?','-10','Negative × positive = negative: 2×5=10 → −10'),
      p('-8 − 2 = ?','-10','Both going left: −8−2=−10'),
      p('3 + (-9) = ?','-6','3−9=−6'),
      p('-4 × -4 = ?','16','Negative × negative = positive: 4×4=16'),
    ]},
    { topic: 'Variables', description: 'To solve for x, do the opposite operation to both sides.', problems: [
      p('x + 5 = 12','7','Subtract 5 from both sides: x=12−5=7'),
      p('3y = 21','7','Divide both sides by 3: y=21÷3=7'),
      p('z − 4 = 9','13','Add 4 to both sides: z=9+4=13'),
      p('x + 8 = 15','7','Subtract 8 from both sides: x=15−8=7'),
      p('4m = 28','7','Divide both sides by 4: m=28÷4=7'),
      p('n − 6 = 10','16','Add 6 to both sides: n=10+6=16'),
      p('2p = 18','9','Divide both sides by 2: p=18÷2=9'),
      p('x + 12 = 20','8','Subtract 12 from both sides: x=20−12=8'),
      p('5k = 45','9','Divide both sides by 5: k=45÷5=9'),
      p('w − 9 = 3','12','Add 9 to both sides: w=3+9=12'),
    ]},
  ]},
  6: { label: 'Grade 6 → Grade 7', lessons: [
    { topic: 'Linear Equations', description: 'Two-step: first undo addition/subtraction, then undo multiplication.', problems: [
      p('2x + 3 = 11','4','Step 1: 2x=11−3=8. Step 2: x=8÷2=4'),
      p('5y − 4 = 16','4','Step 1: 5y=16+4=20. Step 2: y=20÷5=4'),
      p('3z + 7 = 22','5','Step 1: 3z=22−7=15. Step 2: z=15÷3=5'),
      p('4x − 1 = 19','5','Step 1: 4x=19+1=20. Step 2: x=20÷4=5'),
      p('6m + 2 = 26','4','Step 1: 6m=26−2=24. Step 2: m=24÷6=4'),
      p('2n − 5 = 9','7','Step 1: 2n=9+5=14. Step 2: n=14÷2=7'),
      p('3x + 4 = 19','5','Step 1: 3x=19−4=15. Step 2: x=15÷3=5'),
      p('7y − 3 = 25','4','Step 1: 7y=25+3=28. Step 2: y=28÷7=4'),
      p('5p + 5 = 30','5','Step 1: 5p=30−5=25. Step 2: p=25÷5=5'),
      p('4w − 8 = 16','6','Step 1: 4w=16+8=24. Step 2: w=24÷4=6'),
    ]},
    { topic: 'Geometry: Angles', description: 'Complementary angles add to 90°. Supplementary add to 180°. Triangle = 180°.', problems: [
      p('Complement of 35°?','55','90−35=55°'),
      p('Supplement of 110°?','70','180−110=70°'),
      p('Angles in a triangle?','180','All triangles always add to 180°'),
      p('Complement of 60°?','30','90−60=30°'),
      p('Supplement of 45°?','135','180−45=135°'),
      p('Third angle: 50° and 70°?','60','180−50−70=60°'),
      p('Complement of 15°?','75','90−15=75°'),
      p('Supplement of 90°?','90','180−90=90°'),
      p('Third angle: 80° and 40°?','60','180−80−40=60°'),
      p('Complement of 43°?','47','90−43=47°'),
    ]},
    { topic: 'Probability', description: 'Probability = favourable outcomes ÷ total outcomes. Always between 0 and 1.', problems: [
      p('P(heads) = ?','1/2','1 heads out of 2 sides → 1/2'),
      p('P(rolling 3) = ?','1/6','1 three out of 6 faces → 1/6'),
      p('P(red card) = ?','1/2','26 red out of 52 cards → 26/52=1/2'),
      p('P(rolling even) = ?','1/2','Even: 2,4,6 = 3 out of 6 → 3/6=1/2'),
      p('P(rolling >4) = ?','1/3','5,6 = 2 out of 6 → 2/6=1/3'),
      p('P(ace from deck) = ?','1/13','4 aces out of 52 → 4/52=1/13'),
      p('P(tails) = ?','1/2','1 tails out of 2 sides → 1/2'),
      p('P(rolling 1 or 2) = ?','1/3','2 outcomes out of 6 → 2/6=1/3'),
      p('P(impossible event) = ?','0','Impossible = 0 probability'),
      p('P(certain event) = ?','1','Certain = probability of 1'),
    ]},
  ]},
  7: { label: 'Grade 7 → Grade 8', lessons: [
    { topic: 'Systems of Equations', description: 'Add or subtract the equations to cancel one variable, then solve.', problems: [
      p('x+y=10, x−y=2. x=?','6','Add both: 2x=12 → x=6'),
      p('2x+y=9, x+y=5. x=?','4','Subtract: x=4'),
      p('x+2y=8, x−y=2. y=?','2','Subtract: 3y=6 → y=2'),
      p('x+y=7, x−y=3. x=?','5','Add: 2x=10 → x=5'),
      p('3x+y=11, x+y=5. x=?','3','Subtract: 2x=6 → x=3'),
      p('x+y=6, x−y=2. y=?','2','Add: 2x=8→x=4, then y=6−4=2'),
      p('2x+3y=12, 2x+y=8. y=?','2','Subtract: 2y=4 → y=2'),
      p('x+y=9, x−y=1. x=?','5','Add: 2x=10 → x=5'),
      p('4x+y=13, 2x+y=7. x=?','3','Subtract: 2x=6 → x=3'),
      p('x+y=8, 2x−y=4. x=?','4','Add: 3x=12 → x=4'),
    ]},
    { topic: 'Exponent Rules', description: 'Multiply: add exponents. Power of power: multiply. x⁰=1.', problems: [
      p('x³ × x⁴ = ?','x7','Same base: add exponents 3+4=7 → x⁷'),
      p('(x²)³ = ?','x6','Power of power: multiply 2×3=6 → x⁶'),
      p('2^10 = ?','1024','2¹⁰=1024 (double 10 times from 1)'),
      p('x⁵ ÷ x² = ?','x3','Same base divide: subtract 5−2=3 → x³'),
      p('(2x)² = ?','4x2','Square both: 2²=4 and x² → 4x²'),
      p('x⁰ = ?','1','Any number to the power 0 = 1'),
      p('3² × 3³ = ?','243','Add exponents: 3⁵=243'),
      p('(x³)² = ?','x6','Multiply: 3×2=6 → x⁶'),
      p('2³ × 2² = ?','32','Add exponents: 2⁵=32'),
      p('x⁴ ÷ x⁴ = ?','1','x⁴÷x⁴=x⁰=1'),
    ]},
    { topic: 'Pythagorean Theorem', description: 'a²+b²=c² where c is the hypotenuse (longest side).', problems: [
      p('a=3,b=4,c=?','5','3²+4²=9+16=25=5²  → c=5'),
      p('a=5,c=13,b=?','12','5²+b²=13²: 25+b²=169 → b²=144 → b=12'),
      p('a=8,b=6,c=?','10','8²+6²=64+36=100=10² → c=10'),
      p('a=6,b=8,c=?','10','6²+8²=36+64=100 → c=10'),
      p('a=9,b=12,c=?','15','9²+12²=81+144=225=15² → c=15'),
      p('b=7,c=25,a=?','24','a²+49=625 → a²=576 → a=24'),
      p('a=5,b=12,c=?','13','25+144=169=13² → c=13'),
      p('a=1,b=1,c=?','1.41','1+1=2 → c=√2≈1.41'),
      p('a=10,b=24,c=?','26','100+576=676=26² → c=26'),
      p('a=7,b=24,c=?','25','49+576=625=25² → c=25'),
    ]},
  ]},
  8: { label: 'Grade 8 → Algebra I', lessons: [
    { topic: 'Quadratic Equations', description: 'Factor into (x−a)(x−b)=0. Each factor gives a solution.', problems: [
      p('x²−5x+6=0, x=?','2,3','Factor: (x−2)(x−3)=0 → x=2 or x=3'),
      p('x²−9=0, x=?','3,-3','Difference of squares: (x−3)(x+3)=0 → x=±3'),
      p('x²+4x+4=0, x=?','-2','Perfect square: (x+2)²=0 → x=−2'),
      p('x²−7x+12=0, x=?','3,4','Factor: (x−3)(x−4)=0 → x=3 or 4'),
      p('x²+5x+6=0, x=?','-2,-3','Factor: (x+2)(x+3)=0 → x=−2 or −3'),
      p('x²−4=0, x=?','2,-2','Difference of squares: x=±2'),
      p('x²−6x+9=0, x=?','3','Perfect square: (x−3)²=0 → x=3'),
      p('x²+2x−8=0, x=?','2,-4','Factor: (x+4)(x−2)=0 → x=2 or −4'),
      p('x²−1=0, x=?','1,-1','Difference of squares: x=±1'),
      p('x²+6x+9=0, x=?','-3','Perfect square: (x+3)²=0 → x=−3'),
    ]},
    { topic: 'Functions', description: 'f(x) means substitute x into the formula. Replace x with the given number.', problems: [
      p('f(x)=2x+1. f(3)=?','7','Replace x with 3: 2(3)+1=6+1=7'),
      p('g(x)=x². g(−4)=?','16','(−4)²=16 (negative squared = positive)'),
      p('h(x)=3x−5. h(0)=?','-5','3(0)−5=0−5=−5'),
      p('f(x)=x+10. f(5)=?','15','5+10=15'),
      p('g(x)=4x. g(3)=?','12','4×3=12'),
      p('h(x)=x²+1. h(2)=?','5','2²+1=4+1=5'),
      p('f(x)=5x−2. f(4)=?','18','5(4)−2=20−2=18'),
      p('g(x)=2x². g(3)=?','18','2×3²=2×9=18'),
      p('h(x)=x+x². h(3)=?','12','3+3²=3+9=12'),
      p('f(x)=10−x. f(6)=?','4','10−6=4'),
    ]},
    { topic: 'Inequalities', description: 'Solve like equations BUT flip the sign when dividing by a negative!', problems: [
      p('2x+1>7','x>3','2x>6 → x>3 (divide by positive, keep >)'),
      p('3x−4≤11','x≤5','3x≤15 → x≤5'),
      p('−2x>8','x<-4','x<−4 (FLIP sign! dividing by −2)'),
      p('4x+2≥18','x≥4','4x≥16 → x≥4'),
      p('x+5<12','x<7','x<12−5=7'),
      p('−3x≤9','x≥-3','x≥−3 (FLIP sign! dividing by −3)'),
      p('5x−10>0','x>2','5x>10 → x>2'),
      p('2x≤14','x≤7','x≤14÷2=7'),
      p('−x>4','x<-4','Multiply both sides by −1, flip sign: x<−4'),
      p('3x+6<21','x<5','3x<15 → x<5'),
    ]},
  ]},
  9: { label: 'Grade 9 → Geometry', lessons: [
    { topic: 'Trigonometry', description: 'SOH: sin=opp/hyp. CAH: cos=adj/hyp. TOA: tan=opp/adj.', problems: [
      p('sin(30°) = ?','0.5','sin(30°)=1/2=0.5 — memorise this!'),
      p('cos(60°) = ?','0.5','cos(60°)=1/2=0.5 — memorise this!'),
      p('tan(45°) = ?','1','tan(45°)=1 — memorise this!'),
      p('sin(90°) = ?','1','sin(90°)=1 — the max value of sin'),
      p('cos(0°) = ?','1','cos(0°)=1 — the max value of cos'),
      p('sin(0°) = ?','0','sin(0°)=0'),
      p('cos(90°) = ?','0','cos(90°)=0'),
      p('tan(0°) = ?','0','tan(0°)=0'),
      p('sin(60°) = ?','0.87','sin(60°)=√3/2≈0.866'),
      p('cos(30°) = ?','0.87','cos(30°)=√3/2≈0.866'),
    ]},
    { topic: 'Circle Theorems', description: 'Area=πr². Circumference=2πr. Diameter=2r.', problems: [
      p('Area circle r=5?','78.54','π×5²=π×25≈78.54'),
      p('Circumference r=7?','43.98','2×π×7≈43.98'),
      p('Diameter if r=6?','12','Diameter = 2×radius = 2×6=12'),
      p('Area circle r=3?','28.27','π×3²=π×9≈28.27'),
      p('Circumference r=10?','62.83','2×π×10≈62.83'),
      p('Radius if diameter=20?','10','Radius = diameter÷2 = 20÷2=10'),
      p('Area circle r=1?','3.14','π×1²=π≈3.14'),
      p('Circumference r=5?','31.42','2×π×5≈31.42'),
      p('Area circle r=4?','50.27','π×4²=π×16≈50.27'),
      p('Circumference diameter=14?','43.98','C=π×d=π×14≈43.98'),
    ]},
    { topic: 'Proofs & Logic', description: 'Converse swaps the if/then. Contrapositive negates and swaps both.', problems: [
      p('Converse of "If p then q"?','if q then p','Swap the two parts'),
      p('Vertical angles are?','equal','Vertical angles are always equal'),
      p('Sum of angles in triangle?','180','All triangles sum to 180°'),
      p('Sum of angles in quadrilateral?','360','Any 4-sided shape: 360°'),
      p('Contrapositive of "If p then q"?','if not q then not p','Negate and swap both parts'),
      p('Supplementary angles sum to?','180','Two angles adding to 180° are supplementary'),
      p('Complementary angles sum to?','90','Two angles adding to 90° are complementary'),
      p('Angles in a straight line sum to?','180','A straight line = 180°'),
      p('Is this valid: "All squares are rectangles"?','true','Squares meet all rectangle criteria'),
      p('Angles around a point sum to?','360','Full rotation = 360°'),
    ]},
  ]},
  10: { label: 'Grade 10 → Algebra II', lessons: [
    { topic: 'Logarithms', description: 'log_b(x)=y means b^y=x. ln is log base e.', problems: [
      p('log₂(32) = ?','5','2⁵=32, so log₂(32)=5'),
      p('log(100) = ?','2','10²=100, so log₁₀(100)=2'),
      p('ln(e³) = ?','3','ln undoes e: ln(e³)=3'),
      p('log₂(8) = ?','3','2³=8, so log₂(8)=3'),
      p('log(1000) = ?','3','10³=1000, so log(1000)=3'),
      p('log₃(9) = ?','2','3²=9, so log₃(9)=2'),
      p('ln(1) = ?','0','e⁰=1, so ln(1)=0'),
      p('log₂(1) = ?','0','2⁰=1, so log₂(1)=0'),
      p('log₅(25) = ?','2','5²=25, so log₅(25)=2'),
      p('log(10) = ?','1','10¹=10, so log(10)=1'),
    ]},
    { topic: 'Complex Numbers', description: 'i=√−1, i²=−1. Modulus |a+bi|=√(a²+b²).', problems: [
      p('i² = ?','-1','By definition: i=√−1, so i²=−1'),
      p('|3+4i| = ?','5','√(3²+4²)=√(9+16)=√25=5'),
      p('(3+2i)+(1−4i) = ?','4-2i','Add real parts: 3+1=4. Add imaginary: 2−4=−2 → 4−2i'),
      p('i³ = ?','-i','i³=i²×i=−1×i=−i'),
      p('i⁴ = ?','1','i⁴=(i²)²=(−1)²=1'),
      p('(2+i)+(3+2i) = ?','5+3i','Add real: 2+3=5. Add imaginary: 1+2=3 → 5+3i'),
      p('|5+12i| = ?','13','√(25+144)=√169=13'),
      p('(1+i)²= ?','2i','1+2i+i²=1+2i−1=2i'),
      p('i⁵ = ?','i','i⁵=i⁴×i=1×i=i'),
      p('(4+3i)−(1+i) = ?','3+2i','Subtract: 4−1=3, 3−1=2 → 3+2i'),
    ]},
    { topic: 'Sequences & Series', description: 'Arithmetic: add same value. Geometric: multiply same value. nth term = a+(n−1)d.', problems: [
      p('5th term: 2,5,8,11,...','14','Difference=3. 5th: 2+(5−1)×3=2+12=14'),
      p('∑(1 to 5) of 2n = ?','30','2+4+6+8+10=30'),
      p('Geo: 3,6,12,... 6th term?','96','Ratio=2. 6th: 3×2⁵=3×32=96'),
      p('4th term: 1,4,7,10,...','10','Difference=3. 4th: 1+(3)×3=10'),
      p('∑(1 to 4) of n = ?','10','1+2+3+4=10'),
      p('Geo: 2,6,18,... 4th term?','54','Ratio=3. 4th: 2×3³=2×27=54'),
      p('6th term: 5,8,11,14,...','20','Difference=3. 6th: 5+(5)×3=20'),
      p('Geo: 100,50,25,... 4th term?','12.5','Ratio=0.5. 4th: 100×0.5³=12.5'),
      p('∑(1 to 4) of n² = ?','30','1+4+9+16=30'),
      p('8th term: 3,7,11,15,...','31','Difference=4. 8th: 3+(7)×4=31'),
    ]},
  ]},
  11: { label: 'Grade 11 → Pre-Calc', lessons: [
    { topic: 'Limits', description: 'A limit is the value a function approaches. Sub in the value or use limit laws.', problems: [
      p('lim x→∞ of 1/x = ?','0','As x gets huge, 1/x gets tiny → 0'),
      p('lim x→0 sin(x)/x = ?','1','Famous limit: always equals 1'),
      p('lim x→2 x² = ?','4','Just substitute: 2²=4'),
      p('lim x→3 (x−3)/(x−3) = ?','1','Simplify: the fraction = 1 for all x≠3'),
      p('lim x→∞ of 5/x = ?','0','5/∞→0'),
      p('lim x→1 (x²−1)/(x−1) = ?','2','Factor: (x+1)(x−1)/(x−1)=x+1 → 1+1=2'),
      p('lim x→0 x² = ?','0','0²=0'),
      p('lim x→4 √x = ?','2','√4=2'),
      p('lim x→∞ of (2x)/(x) = ?','2','2x/x=2 for all x'),
      p('lim x→2 (3x+1) = ?','7','3(2)+1=7'),
    ]},
    { topic: 'Vectors', description: 'Magnitude: |⟨a,b⟩|=√(a²+b²). Dot product: ⟨a,b⟩·⟨c,d⟩=ac+bd.', problems: [
      p('|⟨3,4⟩| = ?','5','√(3²+4²)=√(9+16)=√25=5'),
      p('⟨1,2⟩·⟨3,4⟩ = ?','11','1×3+2×4=3+8=11'),
      p('⟨2,3⟩+⟨-1,5⟩ = ?','1,8','Add component by component: 2+(−1)=1, 3+5=8'),
      p('|⟨0,5⟩| = ?','5','√(0+25)=5'),
      p('⟨2,4⟩·⟨1,3⟩ = ?','14','2×1+4×3=2+12=14'),
      p('⟨5,0⟩+⟨0,3⟩ = ?','5,3','5+0=5, 0+3=3 → ⟨5,3⟩'),
      p('|⟨6,8⟩| = ?','10','√(36+64)=√100=10'),
      p('⟨3,1⟩·⟨2,4⟩ = ?','10','3×2+1×4=6+4=10'),
      p('⟨1,1⟩+⟨2,2⟩ = ?','3,3','1+2=3, 1+2=3 → ⟨3,3⟩'),
      p('|⟨5,12⟩| = ?','13','√(25+144)=√169=13'),
    ]},
    { topic: 'Polar Coordinates', description: 'Polar (r,θ): x=r·cos(θ), y=r·sin(θ). Cartesian to polar: r=√(x²+y²).', problems: [
      p('Polar(2,90°) to Cart y=?','2','y=r·sin(90°)=2×1=2'),
      p('Cart(1,1) r=?','1.41','r=√(1+1)=√2≈1.41'),
      p('r=2cos(θ) is a?','circle','r=2cos(θ) is a circle'),
      p('Polar(4,0°) x=?','4','x=4×cos(0°)=4×1=4'),
      p('Polar(3,90°) x=?','0','x=3×cos(90°)=3×0=0'),
      p('Cart(3,4) r=?','5','r=√(9+16)=5'),
      p('Polar(1,180°) x=?','-1','x=1×cos(180°)=−1'),
      p('Cart(0,6) θ=?','90','Point is on y-axis → θ=90°'),
      p('Polar(5,0°) y=?','0','y=5×sin(0°)=0'),
      p('Cart(5,0) θ=?','0','Point is on positive x-axis → θ=0°'),
    ]},
  ]},
  12: { label: 'Grade 12 → Calculus', lessons: [
    { topic: 'Derivatives', description: 'Power rule: d/dx[xⁿ]=nxⁿ⁻¹. d/dx[eˣ]=eˣ. d/dx[sin]=cos.', problems: [
      p('d/dx[x⁴] = ?','4x3','Power rule: bring down 4, reduce power → 4x³'),
      p('d/dx[sin(x)] = ?','cos(x)','Standard rule: derivative of sin is cos'),
      p('d/dx[eˣ] = ?','ex','eˣ is its own derivative!'),
      p('d/dx[x²] = ?','2x','Power rule: 2x²⁻¹=2x'),
      p('d/dx[3x] = ?','3','Derivative of linear term = coefficient'),
      p('d/dx[x⁵] = ?','5x4','Power rule: 5x⁴'),
      p('d/dx[cos(x)] = ?','-sin(x)','Standard rule: derivative of cos = −sin'),
      p('d/dx[7] = ?','0','Constant rule: derivative of any constant = 0'),
      p('d/dx[x] = ?','1','x¹: power rule → 1x⁰=1'),
      p('d/dx[ln(x)] = ?','1/x','Standard rule: d/dx[ln(x)]=1/x'),
    ]},
    { topic: 'Integrals', description: 'Power rule: ∫xⁿdx=xⁿ⁺¹/(n+1)+C. ∫eˣdx=eˣ+C.', problems: [
      p('∫x² dx = ?','x3/3+c','Add 1 to power, divide: x³/3+C'),
      p('∫₀¹ x dx = ?','0.5','∫x dx=x²/2. Evaluate: 1/2−0=0.5'),
      p('∫cos(x) dx = ?','sin(x)+c','Standard: ∫cos=sin+C'),
      p('∫1 dx = ?','x+c','∫1=x+C'),
      p('∫x dx = ?','x2/2+c','Power rule: x²/2+C'),
      p('∫eˣ dx = ?','ex+c','eˣ integrates to itself: eˣ+C'),
      p('∫x³ dx = ?','x4/4+c','Add 1 to power, divide: x⁴/4+C'),
      p('∫sin(x) dx = ?','-cos(x)+c','Standard: ∫sin=−cos+C'),
      p('∫₀¹ 1 dx = ?','1','∫₀¹ 1 dx=[x]₀¹=1−0=1'),
      p('∫2x dx = ?','x2+c','∫2x=2×x²/2=x²+C'),
    ]},
    { topic: 'Chain Rule', description: 'Derivative of f(g(x)) = f′(g(x)) × g′(x). Outer × derivative of inner.', problems: [
      p('d/dx[e^(3x)] = ?','3e3x','Outer e^u → e^u. Inner 3x → 3. Answer: 3e^(3x)'),
      p('d/dx[(x²+1)³] = ?','6x(x2+1)2','Outer 3u² → 3(x²+1)². Inner x²+1 → 2x. Multiply: 6x(x²+1)²'),
      p('d/dx[sin(x²)] = ?','2xcos(x2)','Outer sin→cos. Inner x²→2x. Answer: 2x·cos(x²)'),
      p('d/dx[(3x)⁴] = ?','324x3','Outer 4u³→4(3x)³=4×27x³. Inner 3x→3. 4×27×3=324? No: 4(3x)³×3=4×27x³×3=324x³... actually 4×(3x)³×3=4×27x³×3/3... Let\'s see: 4(3x)³×3=4×27x³×3=324x³'),
      p('d/dx[ln(2x)] = ?','1/x','1/(2x)×2=1/x'),
      p('d/dx[(x+1)⁵] = ?','5(x+1)4','Outer 5u⁴. Inner x+1→1. Answer: 5(x+1)⁴'),
      p('d/dx[e^(x²)] = ?','2xex2','Outer e^u→e^(x²). Inner x²→2x. Answer: 2x·e^(x²)'),
      p('d/dx[cos(3x)] = ?','-3sin(3x)','Outer cos→−sin. Inner 3x→3. Answer: −3sin(3x)'),
      p('d/dx[(2x+1)²] = ?','4(2x+1)','Outer 2u. Inner 2x+1→2. Answer: 4(2x+1)'),
      p('d/dx[sin(5x)] = ?','5cos(5x)','Outer sin→cos. Inner 5x→5. Answer: 5cos(5x)'),
    ]},
  ]},
}

// ── Reading Curriculum ─────────────────────────────────────
const readingCurriculum: Record<number, { label: string; lessons: Lesson[] }> = {
  1: { label: 'Grade 1 Reading', lessons: [
    { topic: 'Sight Words', description: 'Sight words are common words you should know by sight without sounding out.', problems: [
      p('What word completes: "I ___ to school"?','go','Common sight word: "go"'),
      p('Spell the sight word for the opposite of "stop"?','go','Go is a common Grade 1 sight word'),
      p('What sight word means "not here"?','away','Away means not present or not here'),
      p('Which is a sight word: "cat" or "the"?','the','"The" is a sight word - you see it everywhere'),
      p('What word means "also"?','too','"Too" means also or as well'),
      p('Spell the word: wanting to know something is called ___?','want','Want is a common sight word'),
      p('What sight word means "not in"?','out','"Out" means not inside'),
      p('Which sight word means a large number: "many" or "big"?','many','"Many" is a sight word meaning lots of something'),
    ]},
    { topic: 'Rhyming Words', description: 'Rhyming words end with the same sound. Cat and hat rhyme!', problems: [
      p('What rhymes with "cat"?','hat','Cat and hat both end in -at'),
      p('What rhymes with "dog"?','log','Dog and log both end in -og'),
      p('Name a word that rhymes with "blue"?','true','Blue and true rhyme - they both end in -oo sound'),
      p('What rhymes with "sun"?','run','Sun and run both end in the -un sound'),
      p('Find a rhyme for "cake"?','lake','Cake and lake both end in -ake'),
      p('What word rhymes with "sing"?','ring','Sing and ring both end in -ing'),
      p('Name a rhyme for "snow"?','grow','Snow and grow both have the -ow sound'),
      p('What rhymes with "night"?','light','Night and light both end in -ight'),
    ]},
    { topic: 'Story Elements', description: 'Every story has a who (character), where (setting), and what happens (plot).', problems: [
      p('The "who" of a story is called the ___?','character','A character is a person or animal in the story'),
      p('The "where and when" of a story is called the ___?','setting','The setting is the time and place of the story'),
      p('What do we call the events that happen in a story?','plot','The plot is what happens in the story'),
      p('The lesson a story teaches is called the ___?','moral','The moral or theme is the lesson'),
      p('If a story begins "Once upon a time in a forest"— what is the setting?','forest','The forest is where and when the story takes place'),
      p('A character who helps the hero is called a ___?','friend','In stories, helpers are called friends or sidekicks'),
      p('The beginning, middle, and ___ are parts of a story?','end','All stories have a beginning, middle, and end'),
      p('When a problem gets solved in a story, that is the ___?','resolution','Resolution means the problem is fixed'),
    ]},
  ]},
  2: { label: 'Grade 2 Reading', lessons: [
    { topic: 'Compound Words', description: 'Compound words are two words joined together to make a new word.', problems: [
      p('Sun + flower = ?','sunflower','Sunflower is a compound word made of sun + flower'),
      p('Rain + bow = ?','rainbow','Rainbow = rain + bow'),
      p('Back + pack = ?','backpack','Backpack is back + pack joined together'),
      p('Fire + place = ?','fireplace','Fireplace = fire + place'),
      p('Snow + flake = ?','snowflake','Snowflake = snow + flake'),
      p('Butter + fly = ?','butterfly','Butterfly = butter + fly'),
      p('Play + ground = ?','playground','Playground = play + ground'),
      p('Air + port = ?','airport','Airport = air + port'),
    ]},
    { topic: 'Antonyms', description: 'Antonyms are words with opposite meanings. Hot and cold are antonyms.', problems: [
      p('Antonym of "hot"?','cold','Hot and cold are opposites'),
      p('Antonym of "happy"?','sad','Happy and sad are antonyms'),
      p('Antonym of "big"?','small','Big and small mean opposite sizes'),
      p('Antonym of "fast"?','slow','Fast and slow are antonyms'),
      p('Antonym of "up"?','down','Up and down are opposites'),
      p('Antonym of "dark"?','light','Dark and light are antonyms'),
      p('Antonym of "old"?','new','Old and new are opposites'),
      p('Antonym of "empty"?','full','Empty and full are antonyms'),
    ]},
    { topic: 'Main Idea', description: 'The main idea is what a passage is mostly about. Details support the main idea.', problems: [
      p('A passage about a dog fetching balls is mostly about a dog doing what?','playing fetch','Fetching is the main activity described'),
      p('What do we call the small facts that support the main idea?','details','Supporting details back up the main idea'),
      p('A story about a girl learning to ride a bike is mostly about ___?','learning','Learning a new skill is the main idea'),
      p('Is the title usually related to the main idea?','yes','Titles almost always hint at the main idea'),
      p('A summary should include the main idea plus key ___?','details','A summary has main idea and most important details'),
      p('If a paragraph talks about lions, tigers, and bears - the main idea might be ___?','wild animals','All three are wild animals - that is the connecting idea'),
      p('Details that are NOT needed in a summary are called ___?','unimportant','Unimportant or minor details can be left out'),
      p('The topic sentence usually states the ___?','main idea','A topic sentence tells you what the paragraph is about'),
    ]},
  ]},
  3: { label: 'Grade 3 Reading', lessons: [
    { topic: 'Context Clues', description: 'Context clues are hints in the text that help you figure out an unfamiliar word.', problems: [
      p('"She was famished, so she ate the whole sandwich." Famished means?','very hungry','Eating a whole sandwich is a clue she was very hungry'),
      p('"The puppy was tiny, no bigger than my hand." Tiny means?','small','No bigger than a hand means very small'),
      p('"He sprinted down the track, faster than anyone." Sprinted means?','ran fast','Sprinting on a track means running very fast'),
      p('"The ancient ruins were thousands of years old." Ancient means?','very old','Thousands of years old = ancient'),
      p('"She was furious - her face turned red with anger." Furious means?','very angry','Turning red with anger shows she was furious'),
      p('"The dog was timid around strangers and hid behind the couch." Timid means?','shy','Hiding is a clue the dog was shy'),
      p('"The aroma of fresh bread drifted through the kitchen." Aroma means?','smell','Drifting through the kitchen, an aroma is a smell'),
      p('"The enormous elephant was the biggest animal in the zoo." Enormous means?','very large','Biggest animal in the zoo = enormous'),
    ]},
    { topic: 'Synonyms', description: 'Synonyms are words with similar meanings. Happy and joyful are synonyms.', problems: [
      p('Synonym for "happy"?','joyful','Joyful is another word for happy'),
      p('Synonym for "big"?','large','Large and big mean the same thing'),
      p('Synonym for "fast"?','quick','Quick and fast are synonyms'),
      p('Synonym for "sad"?','unhappy','Unhappy means the same as sad'),
      p('Synonym for "smart"?','intelligent','Intelligent is a synonym for smart'),
      p('Synonym for "begin"?','start','Begin and start are synonyms'),
      p('Synonym for "tired"?','exhausted','Exhausted is a strong synonym for tired'),
      p('Synonym for "scared"?','afraid','Scared and afraid mean the same thing'),
    ]},
    { topic: 'Figurative Language', description: 'Figurative language uses comparisons and exaggerations to create vivid images.', problems: [
      p('A simile compares using "like" or "as." Example: "She runs like ___"?','the wind','Similes use like or as to compare'),
      p('"He is a lion in battle" is a ___?','metaphor','A metaphor directly says someone IS something else'),
      p('"It was raining cats and dogs" is an ___?','idiom','Idioms are expressions that don\'t mean literally'),
      p('"The biggest pizza in the universe" is an ___?','exaggeration','Overstating something is called exaggeration or hyperbole'),
      p('Giving human qualities to an object is called ___?','personification','Personification: "the wind whispered"'),
      p('"Buzz, splash, hiss" — words that sound like the noise are called ___?','onomatopoeia','Onomatopoeia means words that sound like what they describe'),
      p('"Fast as lightning" is a ___?','simile','Uses "as" to compare - it\'s a simile'),
      p('"I\'ve told you a million times!" is an example of ___?','exaggeration','A million times is an exaggeration (hyperbole)'),
    ]},
  ]},
  4: { label: 'Grade 4 Reading', lessons: [
    { topic: 'Making Inferences', description: 'An inference is a guess based on clues from the text plus what you already know.', problems: [
      p('"He looked at the clock and ran to school." We can infer he was ___?','late','Running to school after checking the time suggests he is late'),
      p('"She put on a coat and grabbed an umbrella." What is the weather like?','cold and rainy','A coat and umbrella suggest cold, rainy weather'),
      p('"The dog wagged its tail when it saw the leash." The dog is likely ___?','excited','Tail wagging means the dog is excited'),
      p('"The whole class laughed except for Maya." Maya was probably ___?','sad','Not laughing when everyone else is suggests she was upset'),
      p('"He studied every night for a week." He probably ___?','passed the test','Lots of studying suggests he was prepared'),
      p('"The crowd went silent as she walked on stage." The crowd was ___?','paying attention','Going silent shows they were focused on her'),
      p('"She checked the map three times." She was probably ___?','lost','Checking a map repeatedly suggests confusion about direction'),
      p('"He saved every penny for a year." He wanted to ___?','buy something expensive','Saving for a long time suggests a big purchase'),
    ]},
    { topic: 'Text Structures', description: 'Authors organize texts in different ways: cause/effect, compare/contrast, sequence, and more.', problems: [
      p('A text that shows what happened and why uses ___ structure?','cause and effect','Cause and effect shows events and their results'),
      p('Signal words "first, then, next, finally" show ___ structure?','sequence','Sequence is the order of events'),
      p('"Both...however...similarly...on the other hand" signal ___ structure?','compare and contrast','These words compare two things'),
      p('What structure presents a problem and how it was solved?','problem and solution','Problem/solution is a common non-fiction structure'),
      p('An author who writes "Because of the rain, the game was cancelled" uses ___?','cause and effect','Because shows cause; the cancelled game is the effect'),
      p('A recipe uses which structure?','sequence','Steps in order = sequence structure'),
      p('A paragraph about city vs. country living uses which structure?','compare and contrast','Comparing two different settings'),
      p('"The road was slippery therefore many cars crashed" shows ___?','cause and effect','"Therefore" signals cause and effect'),
    ]},
    { topic: 'Point of View', description: 'Point of view tells us who is narrating the story and how they see events.', problems: [
      p('"I walked to school" — what point of view is this?','first person','I/me/we = first person point of view'),
      p('"She walked to school" — what point of view?','third person','He/she/they = third person point of view'),
      p('"You walk to school" — what point of view?','second person','You = second person point of view'),
      p('A character tells the story in their own words. This is ___?','first person','Using I makes it first person'),
      p('An outside narrator who knows everyone\'s thoughts is ___?','third person omniscient','Omniscient means all-knowing'),
      p('How might a story change if told by the villain instead of the hero?','it would have a different perspective','The same events would seem different to a villain'),
      p('Bias in writing means the author has a ___ view?','one-sided','A biased author presents only one side'),
      p('A reliable narrator always tells ___?','the truth','Reliable means you can trust what they say'),
    ]},
  ]},
  5: { label: 'Grade 5 Reading', lessons: [
    { topic: 'Theme', description: 'The theme is the central message or life lesson the author wants you to take away.', problems: [
      p('A story where a greedy king loses everything teaches ___?','greed is harmful','The theme is about the dangers of greed'),
      p('Theme is different from plot because theme is the ___?','message','Plot = what happened; Theme = life lesson'),
      p('A common theme in fables is: "Slow and steady wins the ___"?','race','This is the theme of The Tortoise and the Hare'),
      p('"Never give up" is an example of a ___?','theme','This is a message or life lesson = theme'),
      p('Multiple books can share the same ___?','theme','Theme is a universal message found in many stories'),
      p('Theme is usually stated (explicitly) or ___?','implied','Often the theme is implied, not directly stated'),
      p('A story where a bully learns kindness has the theme ___?','be kind','The lesson is about kindness'),
      p('We discover theme by looking at what the characters ___?','learn','What characters learn helps us find the theme'),
    ]},
    { topic: 'Author\'s Purpose', description: 'Authors write to persuade, inform, or entertain — often called PIE.', problems: [
      p('An ad trying to get you to buy a product has what purpose?','persuade','Advertisements try to persuade you'),
      p('A science article about volcanoes has what purpose?','inform','Its purpose is to teach you about volcanoes'),
      p('A funny story about a talking dog has what purpose?','entertain','The main goal is to make you enjoy the story'),
      p('P.I.E. stands for Persuade, Inform, and ___?','Entertain','P=Persuade, I=Inform, E=Entertain'),
      p('A newspaper editorial trying to change a law has what purpose?','persuade','Editorials try to persuade readers'),
      p('A how-to guide explaining how to bake cookies has what purpose?','inform','How-to guides inform and explain'),
      p('A scary story at a campfire has what purpose?','entertain','Campfire stories are told to entertain'),
      p('A book that both teaches facts AND tells a fun story has ___ purposes?','two','It can both inform and entertain'),
    ]},
    { topic: 'Textual Evidence', description: 'Textual evidence means using exact quotes or details from the text to support your ideas.', problems: [
      p('When asked why a character was brave, you should quote from the ___?','text','Textual evidence comes directly from the text'),
      p('Signal phrases like "According to the text..." introduce ___?','evidence','These phrases signal that a quote or evidence follows'),
      p('Using "The text states..." is a way to ___?','cite evidence','Citing means referencing your source'),
      p('Copying a few words directly from a text is called a ___?','quote','A direct quote uses the exact words'),
      p('Explaining a quote in your own words is called ___?','paraphrasing','Paraphrasing restates the idea differently'),
      p('Good textual evidence is both relevant and ___?','specific','Evidence should be specific and to the point'),
      p('What punctuation surrounds a direct quote?','quotation marks','"Quotes" go inside quotation marks'),
      p('Evidence that directly answers the question is called ___?','relevant','Relevant means it relates to and supports your answer'),
    ]},
  ]},
  6: { label: 'Grade 6 Reading', lessons: [
    { topic: 'Literary Devices', description: 'Literary devices are tools authors use to make writing more powerful and interesting.', problems: [
      p('Repeating a consonant sound: "Peter Piper picked..." is called ___?','alliteration','Alliteration repeats the same starting consonant sound'),
      p('"The classroom was a zoo" is an example of a ___?','metaphor','Directly calling one thing another is a metaphor'),
      p('An object that represents a bigger idea is a ___?','symbol','A dove symbolizing peace is an example'),
      p('"She had butterflies in her stomach" is an ___?','idiom','Idioms can\'t be taken literally'),
      p('The main conflict in a story usually involves a character vs. ___?','another character, nature, or themselves','Conflicts can be external or internal'),
      p('Suspense is created by making the reader feel ___?','anxious or uncertain','Suspense makes you wonder what happens next'),
      p('A flashback interrupts the present story to show the ___?','past','Flashbacks take you to an earlier event'),
      p('Foreshadowing gives hints about what will happen ___?','later','Foreshadowing previews future events'),
    ]},
    { topic: 'Comparing Texts', description: 'When you compare two texts, you look at what is similar and what is different between them.', problems: [
      p('What do you look for when comparing two texts on the same topic?','similarities and differences','Comparing means finding what\'s alike and different'),
      p('A Venn diagram helps compare two texts using ___?','overlapping circles','The overlapping part shows what\'s the same'),
      p('Two texts might have different authors with different ___?','points of view','Different authors see things differently'),
      p('Comparing a biography and a fiction story set in the same era involves ___?','genre','Genre affects how the same topic is presented'),
      p('If two texts agree on a fact, that fact is more likely ___?','accurate','Agreement between sources increases reliability'),
      p('A primary source is written by ___?','someone who was there','Primary sources come from direct experience'),
      p('A secondary source describes events the author did not ___?','witness','Secondary sources are written by those not present'),
      p('When two texts disagree, you should check other ___?','sources','Look for additional sources to figure out the truth'),
    ]},
    { topic: 'Informational Text Features', description: 'Non-fiction texts use special features like headings, captions, and graphs to help readers.', problems: [
      p('A title at the top of a section is called a ___?','heading','Headings organize and label sections'),
      p('Text that explains a photo or illustration is called a ___?','caption','Captions provide context for images'),
      p('An alphabetical list of topics and page numbers is called an ___?','index','The index is at the back of a book'),
      p('The front section listing chapters and page numbers is the ___?','table of contents','Table of contents helps you navigate the book'),
      p('Bold or italic words usually indicate they are ___?','important','Text formatting highlights key terms'),
      p('A visual showing data or comparisons is a ___?','graph or chart','Graphs display data visually'),
      p('A map in a non-fiction book helps with understanding ___?','geography','Maps show locations and spatial relationships'),
      p('Words listed with definitions at the back of a book form the ___?','glossary','A glossary is like a mini-dictionary for the book'),
    ]},
  ]},
  7: { label: 'Grade 7 Reading', lessons: [
    { topic: 'Rhetoric', description: 'Rhetoric is the art of persuasion. Authors use ethos, pathos, and logos to persuade.', problems: [
      p('Appealing to emotions is called ___?','pathos','Pathos stirs feelings to persuade'),
      p('Using facts and logic to persuade is called ___?','logos','Logos uses evidence and reasoning'),
      p('Appealing to authority or credibility is called ___?','ethos','Ethos builds trust using expertise'),
      p('"9 out of 10 dentists recommend..." uses which appeal?','logos','Statistics and expert opinion = logos'),
      p('"Think of the starving children..." uses which appeal?','pathos','Emotional appeal to sympathy = pathos'),
      p('"As a 20-year doctor, I recommend..." uses which appeal?','ethos','A doctor\'s authority = ethos'),
      p('A speech that makes you cry is using ___?','pathos','Emotional response = pathos'),
      p('Advertisers use all three appeals: ethos, pathos, and ___?','logos','E, P, and L are the three rhetorical appeals'),
    ]},
    { topic: 'Analyzing Character', description: 'Analyzing a character means looking at what they say, do, think, and how others react to them.', problems: [
      p('The method of revealing character through actions and words is called ___?','characterization','Characterization develops who a character is'),
      p('A character who changes throughout the story is called ___?','dynamic','Dynamic characters grow or change'),
      p('A character who stays the same is called ___?','static','Static characters don\'t significantly change'),
      p('A character with one main trait and little depth is ___?','flat','Flat characters are simple and one-dimensional'),
      p('A complex, realistic, fully developed character is ___?','round','Round characters feel like real people'),
      p('The main character of a story is the ___?','protagonist','The protagonist is the central character'),
      p('The character opposing the main character is the ___?','antagonist','The antagonist creates conflict for the protagonist'),
      p('Character motivation is the reason a character does ___?','something','Motivation explains why characters act as they do'),
    ]},
    { topic: 'Argumentative Reading', description: 'When reading an argument, identify the claim, evidence, and reasoning.', problems: [
      p('The main point an author is arguing is the ___?','claim','The claim is the author\'s position or argument'),
      p('Facts and data used to support a claim are called ___?','evidence','Evidence backs up the claim'),
      p('The explanation of how evidence supports the claim is ___?','reasoning','Reasoning connects evidence to the claim'),
      p('A counterargument is the ___?','opposing view','The other side\'s argument'),
      p('Addressing the other side\'s argument makes your own argument ___?','stronger','Refuting counterarguments strengthens your position'),
      p('A claim without evidence is just a(n) ___?','opinion','Unsupported claims are opinions, not arguments'),
      p('Loaded language uses emotionally charged words to ___?','persuade','Loaded language creates strong emotional responses'),
      p('An author\'s bias can affect how ___?','fair','Bias makes an argument one-sided or unfair'),
    ]},
  ]},
  8: { label: 'Grade 8 Reading', lessons: [
    { topic: 'Satire & Irony', description: 'Satire uses humor to criticize. Irony is when the opposite of what\'s expected occurs.', problems: [
      p('Saying "Great job!" when someone fails is an example of ___?','sarcasm','Sarcasm says the opposite of what you mean'),
      p('When an audience knows something a character doesn\'t, it\'s ___?','dramatic irony','Dramatic irony creates suspense or humor'),
      p('Situational irony occurs when the opposite of what\'s expected ___?','happens','The twist is the opposite of the expected outcome'),
      p('A cartoon making fun of a politician through exaggeration is ___?','satire','Satire uses humor to critique'),
      p('"The Onion" publishes fake news stories as ___?','satire','Satirical news exaggerates reality to make a point'),
      p('Verbal irony means saying one thing but meaning ___?','another','Verbal irony = words mean the opposite of intention'),
      p('When a fire station burns down, this is ___?','situational irony','The irony is a fire station being destroyed by fire'),
      p('Satire often targets things like politics, society, and ___?','culture','Satire critiques society and cultural norms'),
    ]},
    { topic: 'Tone & Mood', description: 'Tone is the author\'s attitude toward the subject. Mood is how the reader feels.', problems: [
      p('The author\'s attitude toward the subject is called ___?','tone','Tone reflects the author\'s feelings'),
      p('How the reader feels while reading is called ___?','mood','Mood is the emotional atmosphere of the text'),
      p('A story set in a dark, stormy night creates what mood?','suspenseful','Dark and stormy settings create suspense'),
      p('Word choice that creates a feeling is called ___?','diction','Diction (word choice) sets tone and mood'),
      p('"The sun smiled down on the happy village" has a ___ tone?','cheerful','Positive imagery creates a cheerful tone'),
      p('"Shadows crept along the crumbling walls" has a ___ mood?','eerie','Dark imagery creates an eerie mood'),
      p('If an author is mocking their subject, the tone is ___?','sarcastic','Mocking shows a sarcastic tone'),
      p('Tone and mood both depend heavily on the author\'s choice of ___?','words','Word choice creates both tone and mood'),
    ]},
    { topic: 'Analyzing Arguments', description: 'Strong arguments have clear claims, strong evidence, and sound reasoning without logical fallacies.', problems: [
      p('An argument that attacks the person instead of their idea is called ___?','ad hominem','Ad hominem is a logical fallacy attacking the arguer'),
      p('"Everyone believes X, so X must be true" is called ___?','bandwagon','Bandwagon argues popularity = truth'),
      p('A slippery slope fallacy claims one event will lead to ___?','a chain of bad events','Slippery slope exaggerates consequences'),
      p('Using only two options when more exist is a ___?','false dilemma','False dilemma ignores other possibilities'),
      p('When evidence actually does not support the claim, it\'s a ___?','weak argument','Evidence must actually back up the claim'),
      p('A strong argument acknowledges and refutes ___?','counterarguments','Addressing the other side strengthens arguments'),
      p('Circular reasoning repeats the claim as if it\'s ___?','proof','Going in circles doesn\'t actually prove anything'),
      p('A hasty generalization draws conclusions from ___?','too few examples','You need enough evidence before concluding'),
    ]},
  ]},
  9: { label: 'Grade 9 Reading', lessons: [
    { topic: 'Shakespeare & Drama', description: 'Shakespeare wrote in Early Modern English. Drama uses dialogue, stage directions, and acts to tell stories.', problems: [
      p('A play is divided into ___?','acts and scenes','Acts contain scenes in drama'),
      p('The written instructions for actors in a script are called ___?','stage directions','Stage directions tell actors how to move and speak'),
      p('A speech by one character alone on stage is a ___?','soliloquy','A soliloquy reveals inner thoughts to the audience'),
      p('"To be or not to be" is from Shakespeare\'s ___?','Hamlet','This famous soliloquy is from Hamlet'),
      p('A play with a tragic ending is called a ___?','tragedy','Tragedy ends in suffering or death'),
      p('A play with a happy ending, often with marriage, is a ___?','comedy','Comedy ends happily, often with romance'),
      p('Iambic pentameter has ___ syllables per line?','10','5 iambs × 2 syllables each = 10 syllables'),
      p('When two characters talk to each other in a play, it\'s called ___?','dialogue','Dialogue is conversation between characters'),
    ]},
    { topic: 'Epic & Mythology', description: 'An epic is a long narrative poem about a hero on a grand journey or quest.', problems: [
      p('An epic hero usually has ___?','superhuman strength or abilities','Epic heroes are extraordinary beings'),
      p('The "call to adventure" starts the hero\'s ___?','journey','The hero\'s journey begins with a call to adventure'),
      p('The Odyssey is about the journey of ___?','Odysseus','Odysseus (Ulysses) tries to return home after the Trojan War'),
      p('A long narrative poem about a legendary hero is called an ___?','epic','The Iliad and Odyssey are famous epics'),
      p('The gods interfering in human affairs is called ___?','divine intervention','Gods intervening is common in mythology'),
      p('A universal story pattern found across cultures is a ___?','myth','Myths explain the world and human experience'),
      p('Hubris means excessive ___?','pride','Hubris (overconfidence) often leads to a hero\'s downfall'),
      p('An archetypal hero usually faces a ___ before returning home?','challenge','Trials and challenges are part of every hero\'s journey'),
    ]},
    { topic: 'Poetry Analysis', description: 'When analyzing poetry, look at form, sound devices, imagery, and meaning.', problems: [
      p('The repetition of vowel sounds is called ___?','assonance','Assonance: "fleet feet sweep by sleeping geese"'),
      p('The repetition of consonant sounds (not at start) is ___?','consonance','Consonance focuses on middle/end consonant sounds'),
      p('A 14-line poem is called a ___?','sonnet','Sonnets have 14 lines in iambic pentameter'),
      p('A poem without rhyme or regular meter is called ___?','free verse','Free verse has no set rhyme scheme or meter'),
      p('A haiku has 5, 7, and ___ syllables?','5','Haiku: 5-7-5 syllables across three lines'),
      p('The pattern of rhymes at the end of lines is the ___?','rhyme scheme','Labeled ABAB, AABB, etc.'),
      p('The speaker in a poem is called the ___?','speaker or narrator','The speaker is the voice of the poem'),
      p('A line break in the middle of a sentence in poetry is ___?','enjambment','Enjambment runs a thought across two lines'),
    ]},
  ]},
  10: { label: 'Grade 10 Reading', lessons: [
    { topic: 'Modernism in Literature', description: 'Modernist literature (early 1900s) experimented with form and explored themes of alienation and identity.', problems: [
      p('"The Great Gatsby" is set in which decade?','1920s','Gatsby is set during the Roaring Twenties'),
      p('A literary technique showing a character\'s thoughts directly is ___?','stream of consciousness','Stream of consciousness mimics the flow of thought'),
      p('Modernist writers often felt ___ from society?','alienated','Alienation is a key modernist theme'),
      p('An unreliable narrator tells a story that readers can\'t fully ___?','trust','Unreliable narrators distort or hide the truth'),
      p('The "American Dream" in literature refers to the belief that ___ is possible for anyone?','success','The American Dream promises opportunity and upward mobility'),
      p('A symbol for corruption of the American Dream in Gatsby is the ___?','green light','The green light represents Gatsby\'s unattainable dreams'),
      p('Dystopian fiction imagines a dark, oppressive ___?','future society','Dystopias show nightmarish future worlds'),
      p('George Orwell\'s "1984" warns about ___?','totalitarianism','1984 depicts government total control over citizens'),
    ]},
    { topic: 'Critical Lenses', description: 'Critical lenses are different ways of reading and analyzing a text, such as feminist, historical, or psychological.', problems: [
      p('Reading a text to understand how women are portrayed uses a ___ lens?','feminist','Feminist criticism examines gender representations'),
      p('Analyzing a text through history of when it was written is a ___ approach?','historical','Historical criticism uses context to understand the text'),
      p('Analyzing characters using Freud\'s theories uses a ___ lens?','psychological','Psychological criticism examines the mind'),
      p('A Marxist lens looks at how ___ affects characters?','class and economics','Marxist criticism examines wealth and power'),
      p('Looking at an author\'s life to interpret their work is a ___ approach?','biographical','Biographical criticism links life and work'),
      p('Examining race and ethnicity in texts uses a ___ lens?','multicultural','Multicultural criticism explores race and identity'),
      p('Eco-criticism examines the relationship between literature and ___?','nature/environment','Eco-criticism focuses on ecology in literature'),
      p('Reading "Frankenstein" as a commentary on science uses which lens?','historical or scientific','Historical and thematic lenses both work here'),
    ]},
    { topic: 'Research & Citation', description: 'Citing sources correctly gives credit to authors and allows readers to find the original work.', problems: [
      p('Taking someone\'s words without credit is called ___?','plagiarism','Plagiarism is academic dishonesty'),
      p('MLA, APA, and Chicago are different ___?','citation styles','Different fields use different citation formats'),
      p('A list of all sources used in a paper is called ___?','works cited or bibliography','Works Cited lists your sources'),
      p('An in-text citation appears in ___?','parentheses','(Author, Year) is an APA in-text citation'),
      p('A reliable source is usually peer-reviewed, meaning other ___ checked it?','experts','Peer review means other experts approved the content'),
      p('The .edu domain usually belongs to ___?','schools and universities','Educational institutions use .edu'),
      p('Quoting too much without analysis is called ___?','over-quoting','Your analysis should be more than the quotes'),
      p('Changing the structure of a sentence from a source is called ___?','paraphrasing','Paraphrasing restates ideas in your own words'),
    ]},
  ]},
  11: { label: 'Grade 11 Reading', lessons: [
    { topic: 'American Literature', description: 'American literature reflects the history, values, and conflicts of the United States.', problems: [
      p('Who wrote "The Scarlet Letter"?','Nathaniel Hawthorne','Hawthorne wrote this story about Puritan society'),
      p('"The Adventures of Huckleberry Finn" was written by ___?','Mark Twain','Twain wrote this classic American novel'),
      p('Transcendentalism believed in the power of ___ over society?','nature and the individual','Thoreau and Emerson were key Transcendentalists'),
      p('Thoreau\'s "Walden" is about living simply in ___?','nature','Thoreau lived two years in the woods at Walden Pond'),
      p('The Harlem Renaissance was a cultural movement of ___ artists?','Black American','The Harlem Renaissance celebrated Black art and culture'),
      p('Langston Hughes was known for writing what type of poetry?','jazz-influenced','Hughes incorporated jazz rhythms into his poetry'),
      p('Arthur Miller\'s "The Crucible" is an allegory for ___?','McCarthyism','The witch trials represent anti-communist hysteria'),
      p('The "Lost Generation" of writers lived after ___?','World War I','Hemingway and Fitzgerald were part of this group'),
    ]},
    { topic: 'Craft & Style', description: 'Understanding an author\'s craft means analyzing how their choices affect meaning and impact.', problems: [
      p('Short, simple sentences create a ___ pace?','fast','Short sentences speed up the narrative'),
      p('Long, complex sentences often slow down the ___?','narrative','Complex sentences create a slower, reflective pace'),
      p('Repetition of a phrase for emphasis is called ___?','anaphora','Anaphora: "I have a dream...I have a dream..."'),
      p('Reversing normal word order for effect is called ___?','anastrophe','Yoda speech is a famous example of anastrophe'),
      p('An author\'s unique way of writing is their ___?','style','Style is the combination of all craft choices'),
      p('The time and place of a story is the ___?','setting','Setting helps establish mood and context'),
      p('Choosing unusual or rare words is called using elevated ___?','diction','Elevated diction uses sophisticated vocabulary'),
      p('A sudden shift in tone signals a change in the author\'s ___?','attitude','Tone shift reflects how the author\'s view changes'),
    ]},
    { topic: 'Synthesis Writing', description: 'Synthesis means combining ideas from multiple sources into a cohesive argument.', problems: [
      p('Synthesis requires reading ___ sources and combining their ideas?','multiple','You must read more than one source to synthesize'),
      p('A synthesis essay is organized around ___?','your argument','Not each source, but your own central claim'),
      p('Transitions between source ideas help writing feel ___?','connected','Smooth transitions make synthesis clear'),
      p('You should ___ quotes rather than just list them?','analyze','Explain what each quote means and why it matters'),
      p('When two sources disagree, your essay can discuss the ___?','debate','Disagreement between sources shows complexity'),
      p('Synthesis is different from summary because it involves your own ___?','analysis','Summary = what it says; synthesis = what it means'),
      p('Strong thesis in a synthesis essay makes a ___ claim?','arguable','A good thesis takes a stance, not just a fact'),
      p('Giving each source its own paragraph is called ___?','poor synthesis','Good synthesis weaves sources together'),
    ]},
  ]},
  12: { label: 'Grade 12 Reading', lessons: [
    { topic: 'World Literature', description: 'World literature includes great works from cultures across the globe.', problems: [
      p('"Don Quixote" by Miguel de Cervantes is considered the first modern ___?','novel','Don Quixote (1605) is a landmark in literary history'),
      p('"One Hundred Years of Solitude" by Gabriel García Márquez is a famous example of ___?','magical realism','Magical realism blends realistic and fantastical elements'),
      p('Franz Kafka\'s writing often features characters trapped in absurd, ___ situations?','bureaucratic','Kafka is known for nightmarish, absurd scenarios'),
      p('Homer\'s Iliad is set during the ___?','Trojan War','The Iliad depicts events of the legendary Trojan War'),
      p('"Things Fall Apart" by Chinua Achebe is set in ___?','Nigeria','Achebe wrote about Igbo society and colonialism'),
      p('Existentialism says individuals create their own ___?','meaning','Existentialists like Camus say life has no inherent meaning'),
      p('"Crime and Punishment" was written by ___?','Dostoevsky','Dostoevsky was a Russian novelist'),
      p('Postcolonial literature examines the effects of ___?','colonialism','It explores how colonialism shaped cultures'),
    ]},
    { topic: 'Independent Reading Analysis', description: 'Advanced literary analysis connects form, theme, context, and cultural significance.', problems: [
      p('A text\'s deeper cultural or historical significance is its ___?','significance','We study how texts reflect and shape culture'),
      p('Close reading means analyzing ___ rather than rushing through?','carefully word by word','Close reading focuses on every detail'),
      p('A work that remains important over many years is called ___?','a classic','Classics endure because of universal themes'),
      p('The cultural moment a text was written in is its ___?','context','Historical and cultural context shapes meaning'),
      p('A text that challenges society\'s norms is called ___?','subversive','Subversive texts question established power'),
      p('A comparison of two works from different cultures is called ___?','comparative literature','Comparative literature crosses cultural boundaries'),
      p('Intertextuality means a text references or responds to ___?','other texts','Texts often allude to or build on other works'),
      p('The lasting impact a work has on future writing is its ___?','legacy','Literary legacy shows long-term influence'),
    ]},
    { topic: 'College-Level Critical Essays', description: 'A strong literary essay has a thesis, organized body paragraphs, evidence, and analysis.', problems: [
      p('The controlling idea of an essay is the ___?','thesis','Every part of your essay should support the thesis'),
      p('Each body paragraph should focus on ___ main idea?','one','One idea per paragraph keeps essays organized'),
      p('A paragraph\'s first sentence introducing its idea is the ___?','topic sentence','Topic sentence states what the paragraph is about'),
      p('After quoting a source you must ___ the quote?','analyze','Explain what the quote means and why it matters'),
      p('Your essay should end with a ___ that restates the thesis?','conclusion','Conclusions synthesize and close the argument'),
      p('Transitions between paragraphs should show ___?','connection','Transitions show how ideas link together'),
      p('Hedging language like "perhaps" softens ___?','claims','Hedging acknowledges your argument might not be absolute'),
      p('A works cited page appears at the ___ of your essay?','end','Works cited/bibliography goes at the end'),
    ]},
  ]},
}

// ── Writing Curriculum ─────────────────────────────────────
const writingCurriculum: Record<number, { label: string; lessons: Lesson[] }> = {
  1: { label: 'Grade 1 Writing', lessons: [
    { topic: 'Capitalization', description: 'We capitalize the first word of a sentence and all proper nouns (names of people and places).', problems: [
      p('Should "monday" be capitalized?','yes','Days of the week are always capitalized: Monday'),
      p('Does every sentence start with a capital letter?','yes','The first word of every sentence is capitalized'),
      p('Should names like "john" be capitalized?','yes','Names of people are proper nouns: John'),
      p('Fix this: "my dog is fluffy."','My dog is fluffy.','Sentences start with a capital letter'),
      p('Should "january" be capitalized?','yes','Months are always capitalized: January'),
      p('Are city names like "paris" capitalized?','yes','Paris is a proper noun and must be capitalized'),
      p('Fix this: "she lives in london."','She lives in London.','Both the sentence start and city name are capitalized'),
      p('Should "pencil" be capitalized?','no','Pencil is a common noun, not a proper noun'),
    ]},
    { topic: 'Punctuation Basics', description: 'A period ends a statement. A question mark ends a question. An exclamation mark shows strong feeling.', problems: [
      p('What punctuation ends "I like pizza"?','period','"I like pizza." ends with a period'),
      p('What punctuation ends "Do you like pizza"?','question mark','A question ends with a question mark: ?'),
      p('What punctuation ends "Wow, that is amazing"?','exclamation mark','Strong feelings use an exclamation mark: !'),
      p('Does a comma (,) end a sentence?','no','A comma pauses but does not end a sentence'),
      p('What punctuation goes after "Hello" in a greeting letter?','comma','Dear John, — a comma follows the greeting'),
      p('A sentence that tells someone to do something ends with a ___?','period or exclamation mark','Commands end with . or !'),
      p('What do quotation marks show?','someone is speaking','Quotation marks surround spoken words'),
      p('What punctuation goes between the city and state: "Austin_Texas"?','comma','Austin, Texas — comma between city and state'),
    ]},
    { topic: 'Nouns & Verbs', description: 'A noun names a person, place, or thing. A verb shows action or state of being.', problems: [
      p('In "The dog runs." what is the noun?','dog','Dog is a person/place/thing — a noun'),
      p('In "She sings." what is the verb?','sings','Sings shows action — it\'s a verb'),
      p('Is "school" a noun or a verb?','noun','School is a place — a noun'),
      p('Is "jump" a noun or a verb?','verb','Jump is an action word — a verb'),
      p('Name one noun in the room?','desk','Any object (desk, chair, board) is a noun'),
      p('What is the verb in "Birds fly south"?','fly','Fly is the action — a verb'),
      p('Is "happy" a noun, verb, or adjective?','adjective','Happy describes something — it\'s an adjective'),
      p('What type of word is "run, jump, eat, sleep"?','verb','All of these are action words — verbs'),
    ]},
  ]},
  2: { label: 'Grade 2 Writing', lessons: [
    { topic: 'Adjectives & Adverbs', description: 'Adjectives describe nouns. Adverbs describe verbs, adjectives, or other adverbs.', problems: [
      p('In "the big red ball," which words are adjectives?','big, red','Big and red describe the ball'),
      p('What does an adjective describe?','a noun','Adjectives tell us more about nouns'),
      p('In "she runs quickly," what is the adverb?','quickly','Quickly describes how she runs'),
      p('Adverbs often end in which two letters?','ly','Quickly, slowly, loudly — most adverbs end in -ly'),
      p('Which is the adjective: "pretty flower" or "ran fast"?','pretty','"Pretty" describes the noun flower'),
      p('In "the tiny blue bird sang beautifully," how many adjectives are there?','2','Tiny and blue are adjectives; beautifully is an adverb'),
      p('What does an adverb describe?','a verb, adjective, or adverb','Adverbs modify verbs and other descriptive words'),
      p('Improve "the dog ran" by adding an adverb?','the dog ran quickly','Adverbs add detail to how the action happened'),
    ]},
    { topic: 'Complete Sentences', description: 'A complete sentence has a subject (who/what) and a predicate (what they do or are).', problems: [
      p('Does "The cat sleeps." have a subject and predicate?','yes','"The cat" is the subject; "sleeps" is the predicate'),
      p('Is "Running fast." a complete sentence?','no','It has no subject — who is running?'),
      p('Is "The girl" a complete sentence?','no','It has a subject but no predicate — what does the girl do?'),
      p('Fix this fragment: "Jumped over the fence."?','The dog jumped over the fence.','Add a subject to make it complete'),
      p('What is the subject of "My brother cooks dinner"?','my brother','The subject is who does the action'),
      p('What is the predicate of "Birds sing in the morning"?','sing in the morning','The predicate tells what the subject does'),
      p('A run-on sentence is two sentences joined without ___?','punctuation','Run-ons need a period or conjunction between them'),
      p('Can you fix "I love ice cream I eat it every day"?','I love ice cream. I eat it every day.','Add a period between the two ideas'),
    ]},
    { topic: 'Types of Sentences', description: 'There are four types: declarative (tells), interrogative (asks), exclamatory (exclaims), and imperative (commands).', problems: [
      p('"I like soccer." is what type of sentence?','declarative','It makes a statement — declarative'),
      p('"Do you like soccer?" is what type?','interrogative','It asks a question — interrogative'),
      p('"What an amazing goal!" is what type?','exclamatory','It expresses strong feeling — exclamatory'),
      p('"Kick the ball!" is what type?','imperative','It gives a command — imperative'),
      p('Which type ends with a question mark?','interrogative','Questions (interrogative) end with ?'),
      p('Which type can end with ! or .?','exclamatory or imperative','Both exclamatory and imperative can use !'),
      p('"Please sit down." is what type?','imperative','A polite command is still imperative'),
      p('An exclamatory sentence always ends with ___?','exclamation mark','Exclamatory sentences use !'),
    ]},
  ]},
  3: { label: 'Grade 3 Writing', lessons: [
    { topic: 'Paragraph Structure', description: 'A paragraph has a topic sentence, supporting details, and a concluding sentence.', problems: [
      p('The first sentence of a paragraph that states the main idea is the ___?','topic sentence','The topic sentence introduces what the paragraph is about'),
      p('What goes after the topic sentence in a paragraph?','supporting details','Details support and explain the main idea'),
      p('The last sentence that wraps up the paragraph is the ___?','concluding sentence','A concluding sentence closes the paragraph'),
      p('How many main ideas should a paragraph have?','one','Each paragraph focuses on one main idea'),
      p('Transition words like "first, then, finally" help ideas ___?','flow','Transitions connect ideas smoothly'),
      p('Should all sentences in a paragraph relate to the topic?','yes','All sentences must support the main idea'),
      p('A good paragraph has at least ___ sentences?','3','Topic + details + conclusion = at least 3'),
      p('The purpose of the concluding sentence is to ___?','wrap up the paragraph','It signals the end and restates the point'),
    ]},
    { topic: 'Descriptive Writing', description: 'Descriptive writing uses the five senses to paint a picture with words.', problems: [
      p('What are the five senses used in descriptive writing?','sight, sound, smell, taste, touch','Sensory details make writing vivid'),
      p('Adding sensory details makes writing more ___?','vivid and interesting','Details help readers imagine the scene'),
      p('"The sizzling bacon smelled amazing" appeals to which senses?','sound and smell','"Sizzling" = sound; "smelled" = smell'),
      p('Which is more descriptive: "a big dog" or "a shaggy, golden dog"?','a shaggy, golden dog','Specific adjectives are more descriptive'),
      p('A precise, exact word is better than a ___?','vague word','Specific words like "scarlet" beat vague words like "red"'),
      p('Using exact verbs like "sprinted" instead of "ran" improves ___?','word choice','Precise verbs make writing more vivid'),
      p('Which paints a better picture: "nice" or "warm and cozy"?','warm and cozy','Specific descriptions create better mental images'),
      p('"Crunchy, sweet apples" appeals to which senses?','taste and sound','Crunchy = sound; sweet = taste'),
    ]},
    { topic: 'Narrative Writing', description: 'Narrative writing tells a story with characters, a setting, and a plot.', problems: [
      p('A narrative story has characters, a setting, and a ___?','plot','Plot is the sequence of events'),
      p('Where and when a story takes place is called the ___?','setting','Setting = time + place'),
      p('The problem in a story is called the ___?','conflict','Conflict drives the plot forward'),
      p('The high point of tension in a story is the ___?','climax','The climax is the most exciting moment'),
      p('Good dialogue includes what punctuation around spoken words?','quotation marks','"Hello," she said — quotation marks surround speech'),
      p('Showing what happens rather than just telling about it is called ___?','show, don\'t tell','Good writers show action through detail'),
      p('A story told from "I" perspective is in ___ person?','first','First person uses I, me, my'),
      p('The beginning of a story that introduces characters is the ___?','introduction','The introduction sets up the story'),
    ]},
  ]},
  4: { label: 'Grade 4 Writing', lessons: [
    { topic: 'Opinion Writing', description: 'Opinion writing states your view and supports it with reasons and evidence.', problems: [
      p('In opinion writing, you state your ___ and support it with reasons?','opinion','Opinion = your view + supporting reasons'),
      p('What do you call the reasons that support your opinion?','evidence or reasons','Evidence backs up your opinion'),
      p('A good opinion essay considers and addresses the other ___?','side','Acknowledging the opposing view strengthens your argument'),
      p('Your main opinion stated at the start of your essay is the ___?','thesis statement','The thesis clearly states your position'),
      p('Should you use "I think" in formal opinion writing?','sparingly','Formal writing minimizes first-person phrases'),
      p('Transition phrases like "for example" and "in addition" connect ___?','ideas','Transitions help evidence flow smoothly'),
      p('An opinion essay ends with a ___ that restates your position?','conclusion','The conclusion wraps up your argument'),
      p('Using facts and statistics makes your opinion more ___?','convincing','Facts strengthen any opinion'),
    ]},
    { topic: 'Grammar: Subject-Verb Agreement', description: 'Singular subjects take singular verbs; plural subjects take plural verbs.', problems: [
      p('"She ___ to school." — run or runs?','runs','She is singular, so use runs (singular verb)'),
      p('"They ___ to school." — run or runs?','run','They is plural, so use run (plural verb)'),
      p('"The dogs ___ loudly." — bark or barks?','bark','Dogs is plural: they bark'),
      p('"He ___ his homework." — do or does?','does','He is singular: does'),
      p('"The team ___ practice every day." — have or has?','has','Team is singular (one group): has'),
      p('"My friends ___ coming over." — is or are?','are','Friends is plural: are'),
      p('"Everyone ___ ready." — is or are?','is','"Everyone" is singular: is'),
      p('"Neither the cat nor the dog ___ here." — is or are?','is','When neither/nor uses two singulars, verb is singular'),
    ]},
    { topic: 'Revising & Editing', description: 'Revising improves content and organization. Editing fixes spelling, grammar, and punctuation.', problems: [
      p('Which comes first: revising or editing?','revising','Fix content before fixing mechanics'),
      p('Revising focuses on ___?','content and organization','Revising improves ideas and structure'),
      p('Editing focuses on ___?','grammar, spelling, punctuation','Editing fixes mechanical errors'),
      p('Adding more details to a weak paragraph is part of ___?','revising','Adding content is a revision strategy'),
      p('Fixing "their" to "they\'re" is part of ___?','editing','Correcting word usage is editing'),
      p('Reading your work aloud helps you catch ___?','errors','Reading aloud reveals awkward sentences'),
      p('Proofreading is the final check before ___?','submitting','Always proofread before turning in work'),
      p('A peer review means having a ___ read your work?','classmate or friend','Peer review = another person reads and gives feedback'),
    ]},
  ]},
  5: { label: 'Grade 5 Writing', lessons: [
    { topic: 'Expository Writing', description: 'Expository writing explains or informs using facts, definitions, and examples.', problems: [
      p('Expository writing is meant to ___ the reader?','inform','Expository = explain and inform'),
      p('An expository essay uses ___ not opinions?','facts','Expository writing relies on factual information'),
      p('What is another name for expository writing?','informational','Expository and informational writing are the same'),
      p('The introduction of an expository essay ends with the ___?','thesis statement','The thesis states what the essay will explain'),
      p('Each body paragraph in an expository essay covers one ___?','main point','One idea per paragraph keeps it organized'),
      p('Transition words like "furthermore" and "in contrast" help ideas ___?','connect','Transitions signal relationships between ideas'),
      p('An expository essay about dogs would use ___ about dogs?','facts','Facts about breeds, care, behavior, etc.'),
      p('Definitions help make ___ terms clear?','technical','Defining terms helps readers understand complex topics'),
    ]},
    { topic: 'Pronoun Usage', description: 'Pronouns replace nouns. They must agree in number and gender with the noun they replace.', problems: [
      p('"Maria likes cake. ___ eats it every day." — he or she?','she','Maria is female, so use she'),
      p('"The students ___ homework." — do their or does their?','do their','Students is plural: they do their homework'),
      p('Which is correct: "between you and I" or "between you and me"?','between you and me','"Me" is the object of "between"'),
      p('"Each student must bring ___ own pencil." — their or his or her?','their','Modern English accepts "their" for singular unknown gender'),
      p('"The team won ___ game." — its or their?','its','Team is singular (one group): its'),
      p('Replace "The dog" in "The dog ran away" with a pronoun?','it','A dog that ran away: it ran away'),
      p('What pronoun replaces plural people?','they','They, them, their replace plural nouns'),
      p('"The book lost ___ cover." — it\'s or its?','its','"Its" shows possession; "it\'s" = "it is"'),
    ]},
    { topic: 'Persuasive Writing', description: 'Persuasive writing tries to convince the reader to agree with your point of view.', problems: [
      p('Persuasive writing tries to change the reader\'s ___?','mind or opinion','Persuasive writing is meant to convince'),
      p('What is the first thing in a persuasive essay?','a strong thesis','State your position clearly from the start'),
      p('Giving the reader specific reasons is part of building your ___?','argument','Reasons support your persuasive argument'),
      p('Appealing to emotions is called using ___?','pathos','Emotional appeals are a persuasive technique'),
      p('Acknowledging the other side shows your argument is ___?','balanced','A balanced argument is more persuasive'),
      p('Using words like "clearly" and "obviously" strengthens your ___?','claim','Strong language signals confidence in your argument'),
      p('A call to action at the end tells the reader what to ___?','do','Calls to action urge the reader to act'),
      p('Is "I feel dogs are better" a strong persuasive argument?','no','Opinion without evidence is not persuasive'),
    ]},
  ]},
  6: { label: 'Grade 6 Writing', lessons: [
    { topic: 'Thesis Statements', description: 'A thesis statement is one or two sentences that state the main argument of your essay.', problems: [
      p('A thesis statement should be ___?','specific and arguable','Vague or obvious statements make weak theses'),
      p('Where does the thesis appear in an essay?','at the end of the introduction','The introduction ends with the thesis'),
      p('Is "Dogs are nice pets." a good thesis?','no','This is too vague and not arguable'),
      p('Is "Dogs make better pets than cats because..." a better thesis?','yes','This is specific and arguable'),
      p('A thesis statement tells the reader what you will ___?','argue or explain','The thesis previews your essay\'s main point'),
      p('Should your thesis take a side or be neutral?','take a side','A thesis should make a clear, arguable claim'),
      p('Can you change your thesis after writing the body?','yes','Your thesis may evolve as you write'),
      p('A thesis that lists three reasons is called a ___?','multi-point thesis','Lists three main arguments to develop in body paragraphs'),
    ]},
    { topic: 'Combining Sentences', description: 'Short, choppy sentences can be combined to create smooth, flowing prose.', problems: [
      p('Combine: "She ran. She was tired." using "although"?','Although she was tired, she ran.','Subordinating conjunctions combine ideas'),
      p('What conjunction can combine: "I like cats. I like dogs."?','and','I like cats and dogs — use "and"'),
      p('What is a coordinating conjunction? Give one example?','FANBOYS: for, and, nor, but, or, yet, so','FANBOYS are the 7 coordinating conjunctions'),
      p('Combine: "He studied hard. He passed." using "so"?','He studied hard, so he passed.','A comma + FANBOYS joins two sentences'),
      p('A subordinating conjunction makes one clause ___?','dependent','Because, although, when = subordinating conjunctions'),
      p('Combine: "She was hungry. She ate." into one sentence?','She was hungry, so she ate.','Many ways to combine these two ideas'),
      p('What punctuation goes before a coordinating conjunction joining two sentences?','comma','Use a comma before FANBOYS between two sentences'),
      p('Combine: "The dog barked. It was loud." using a relative clause?','The dog, which barked loudly, startled me.','Relative clauses add detail'),
    ]},
    { topic: 'Vivid Language & Word Choice', description: 'Strong word choice makes your writing more precise, interesting, and memorable.', problems: [
      p('Replace the weak verb "went" with a stronger option?','sprinted, wandered, rushed','Specific verbs paint a clearer picture'),
      p('Which is stronger: "said" or "whispered"?','whispered','Whispered is more specific and vivid'),
      p('Replace "nice" with a more precise adjective?','generous, cheerful, kind','More specific adjectives say more'),
      p('Using too many of the same adjective makes writing ___?','repetitive','Varied vocabulary keeps writing fresh'),
      p('What are words that have the same meaning called?','synonyms','Use a thesaurus to find vivid synonyms'),
      p('Clichés are phrases that are overused and therefore ___?','boring','Avoid clichés like "once in a blue moon"'),
      p('Precise nouns replace vague ones. Replace "animal" with a precise noun?','elephant, tiger, sparrow','Specific nouns create clearer images'),
      p('A strong action verb eliminates the need for an ___?','adverb','"Sprinted" is better than "ran very fast"'),
    ]},
  ]},
  7: { label: 'Grade 7 Writing', lessons: [
    { topic: 'Argumentative Essay Structure', description: 'An argumentative essay has an introduction, body paragraphs with evidence, counterargument, and conclusion.', problems: [
      p('The purpose of an argumentative essay is to ___?','convince or persuade','Argumentative essays argue a position'),
      p('What goes in the introduction of an argument essay?','hook, context, thesis','Introduction: hook readers → give context → state thesis'),
      p('A counterargument paragraph addresses the ___?','opposing view','You acknowledge and then refute the other side'),
      p('Refuting a counterargument means showing why the other side is ___?','wrong or less convincing','Refutation strengthens your own argument'),
      p('Each body paragraph should have one ___ with evidence?','claim or point','One point + evidence + analysis per paragraph'),
      p('The PEEL structure stands for Point, Evidence, Explanation, ___?','Link','PEEL helps structure body paragraphs'),
      p('What makes evidence strong in an argument?','it is relevant and credible','Good evidence is specific and from reliable sources'),
      p('The conclusion should restate the thesis and provide a ___?','final thought','End with a memorable statement or call to action'),
    ]},
    { topic: 'Grammar: Comma Rules', description: 'Commas signal pauses and separate elements to make sentences clear.', problems: [
      p('Use a comma before a coordinating conjunction joining two sentences. Fix: "I studied but I failed."?','I studied, but I failed.','Comma before "but" joining two independent clauses'),
      p('Use a comma after an introductory clause. Fix: "After the game we celebrated."?','After the game, we celebrated.','Comma after introductory phrase'),
      p('Items in a list need commas. Fix: "I bought apples oranges and grapes."?','I bought apples, oranges, and grapes.','Oxford comma separates list items'),
      p('The final comma before "and" in a list is called the ___?','Oxford comma','The Oxford comma avoids confusion'),
      p('Use commas around a non-essential clause. Fix: "My brother who is 12 is tall."?','My brother, who is 12, is tall.','Non-essential info is set off by commas'),
      p('Use a comma in a date: "March 15 2024"?','March 15, 2024','Comma between date and year'),
      p('Use a comma between city and state: "Austin Texas"?','Austin, Texas','Comma separates city from state'),
      p('Should you put a comma before "because"?','usually not','Because introduces essential information — no comma'),
    ]},
    { topic: 'Research Writing', description: 'Research writing requires finding reliable sources, taking notes, and integrating evidence ethically.', problems: [
      p('What is the first step in writing a research paper?','choosing a topic','Start with a topic or research question'),
      p('Where can you find reliable information for research?','books, academic articles, reputable websites','Scholarly sources are most reliable'),
      p('Taking another person\'s ideas without credit is called ___?','plagiarism','Always cite your sources'),
      p('A ___ page lists all your sources at the end of your paper?','works cited / bibliography','Bibliography or works cited = source list'),
      p('A direct quote uses the author\'s ___?','exact words','Direct quotes are word-for-word from the source'),
      p('Putting an author\'s ideas in your own words is called ___?','paraphrasing','Paraphrasing still requires a citation'),
      p('Keyword searches help you find information on a ___?','database or search engine','Keywords narrow your search results'),
      p('A primary source is original; a secondary source ___?','analyzes or describes the primary source','Secondary sources interpret primary sources'),
    ]},
  ]},
  8: { label: 'Grade 8 Writing', lessons: [
    { topic: 'Rhetorical Devices', description: 'Rhetorical devices are techniques writers use to make arguments more persuasive and memorable.', problems: [
      p('"Ask not what your country can do for you" reverses normal order. This is ___?','anastrophe or chiasmus','Kennedy\'s famous reversal is a rhetorical device'),
      p('Repeating a structure at the start of sentences: "We shall fight..." is ___?','anaphora','Anaphora creates rhythm and emphasis'),
      p('Asking a question you don\'t expect an answer to is a ___?','rhetorical question','Rhetorical questions engage the reader'),
      p('Understatement makes something seem ___ than it is?','less important','Understatement downplays for effect'),
      p('Exaggerating for emphasis is called ___?','hyperbole','Hyperbole: "I\'ve told you a million times!"'),
      p('Ethos, pathos, and logos are the three ___?','rhetorical appeals','Aristotle\'s three means of persuasion'),
      p('Parallelism means using ___?','similar grammatical structures','Parallel structure: "I came, I saw, I conquered"'),
      p('"The world is a stage" is a ___?','metaphor','This is a direct comparison without like or as'),
    ]},
    { topic: 'Citing Sources in MLA', description: 'MLA (Modern Language Association) format is used for humanities papers.', problems: [
      p('In MLA, in-text citations use the ___?','author\'s last name and page number','(Smith 42) is a typical MLA in-text citation'),
      p('The last page of an MLA paper is the ___?','Works Cited','Works Cited lists all sources alphabetically'),
      p('MLA format uses ___ indentation for Works Cited entries?','hanging indent','The first line is at margin; rest are indented'),
      p('The title of a book in MLA is ___?','italicized','Book titles are italicized in MLA'),
      p('An article title in MLA uses ___?','quotation marks','Article titles go in "quotation marks" in MLA'),
      p('MLA format double-spaces ___?','the entire paper','MLA requires double-spacing throughout'),
      p('The header in MLA includes last name and ___?','page number','Header: Smith 1, Smith 2, etc.'),
      p('An MLA Works Cited entry for a book lists Author, Title, Publisher, and ___?','year','Year of publication is required'),
    ]},
    { topic: 'Advanced Sentence Variety', description: 'Varying sentence structure makes writing more engaging and shows writing maturity.', problems: [
      p('A sentence with one independent clause is called ___?','simple','Simple sentences have one main clause'),
      p('A sentence with two independent clauses joined by a conjunction is ___?','compound','Two main clauses joined = compound sentence'),
      p('A sentence with an independent and dependent clause is ___?','complex','Complex sentences use subordinating conjunctions'),
      p('A sentence with two independent clauses AND a dependent clause is ___?','compound-complex','The most complex sentence type'),
      p('Starting too many sentences the same way makes writing ___?','monotonous','Vary how sentences start for better flow'),
      p('A very short sentence after long ones creates ___?','emphasis','The short sentence stands out'),
      p('Inverting subject and verb for effect: "Gone was the sun" is called ___?','inverted syntax','Inverted syntax creates dramatic emphasis'),
      p('Sentence variety means changing sentence ___ and ___?','length and structure','Mix short, long, simple, and complex sentences'),
    ]},
  ]},
  9: { label: 'Grade 9 Writing', lessons: [
    { topic: 'Literary Analysis Essay', description: 'A literary analysis essay closely examines a text\'s elements like theme, character, and imagery.', problems: [
      p('A literary analysis is about explaining HOW and WHY, not just ___?','what happened','Don\'t just summarize — analyze the choices'),
      p('In a literary analysis, you interpret the meaning of a ___?','text element','You explain what a symbol, theme, or device means'),
      p('Each body paragraph should analyze one specific ___ of the text?','element or device','Focus on one technique per paragraph'),
      p('After quoting the text, you must ___ the quote?','analyze','Explain what the quote shows about your argument'),
      p('The analysis in a literary essay is always connected to the ___?','thesis','Every point must support your central argument'),
      p('Summarizing the plot instead of analyzing it is called ___?','plot summary','Analysis goes beyond summary'),
      p('Using present tense to discuss literary events is standard ___?','literary present','"Hamlet says" not "Hamlet said"'),
      p('An effective introduction creates interest with a ___ then ends with a thesis?','hook','Start with something interesting to draw readers in'),
    ]},
    { topic: 'Grammar: Semicolons & Colons', description: 'Semicolons join related independent clauses. Colons introduce lists or explanations.', problems: [
      p('A semicolon joins two ___ clauses?','independent','She studied; she passed. — both are complete'),
      p('Fix: "I love cats however I am allergic."?','I love cats; however, I am allergic.','Semicolon + conjunctive adverb + comma'),
      p('A colon introduces a ___ or explanation?','list','Use a colon: item 1, item 2, item 3.'),
      p('Can a semicolon replace a period?','yes','A semicolon can join two complete sentences'),
      p('After a colon, should you capitalize the next word?','only if it\'s a complete sentence','Capitalize if a full sentence follows the colon'),
      p('Fix: "He needed three things milk, eggs, and bread."?','He needed three things: milk, eggs, and bread.','Colon introduces the list'),
      p('A semicolon should NOT follow a ___?','fragment','Never use a semicolon after an incomplete thought'),
      p('Conjunctive adverbs (however, therefore, moreover) follow a ___?','semicolon','Semicolon; however, comma is the correct pattern'),
    ]},
    { topic: 'Tone & Voice in Writing', description: 'Tone is the writer\'s attitude. Voice is the unique personality that comes through in writing.', problems: [
      p('A formal tone avoids ___?','contractions and slang','Formal writing is professional and precise'),
      p('Your unique writing personality that comes through is called your ___?','voice','Voice makes your writing distinct'),
      p('Should you use the same tone in a lab report as a personal narrative?','no','Different writing tasks require different tones'),
      p('A sarcastic tone uses words that mean the ___?','opposite of what you intend','Sarcasm says one thing but means another'),
      p('An academic essay should have what kind of tone?','formal and objective','Academic writing is professional and neutral'),
      p('Reading your work aloud helps you check your ___?','tone and flow','You can hear if the tone sounds right'),
      p('A personal essay allows more casual and personal ___?','voice','Personal essays can show your unique personality'),
      p('Passive voice says "mistakes were made." Active voice says ___?','we made mistakes','Active voice names the actor directly'),
    ]},
  ]},
  10: { label: 'Grade 10 Writing', lessons: [
    { topic: 'Writing Across Disciplines', description: 'Different subjects require different types of writing — from lab reports to history essays.', problems: [
      p('A science lab report includes hypothesis, method, results, and ___?','conclusion','Lab reports follow a scientific format'),
      p('A history essay requires ___?','analyzing primary and secondary sources','History writing uses historical evidence'),
      p('A math proof uses ___?','logical reasoning and evidence','Proofs argue step by step'),
      p('Formal academic writing avoids using the word ___?','I (in most cases)','Academic writing often avoids first person'),
      p('A compare and contrast essay uses a ___ structure?','point-by-point or block','Either discuss each point across both, or cover one fully then the other'),
      p('Technical writing should be ___?','clear, precise, and direct','Technical writing prioritizes clarity'),
      p('An annotation is a brief summary + ___ of a source?','evaluation','Annotations summarize and assess sources'),
      p('An abstract summarizes a paper in ___ paragraph?','one','Abstracts are brief overviews at the start of academic papers'),
    ]},
    { topic: 'Parallel Structure', description: 'Parallel structure means using the same grammatical form for items in a list or comparison.', problems: [
      p('Fix: "She likes swimming, hiking, and to dance."?','She likes swimming, hiking, and dancing.','All items should be in the same form (-ing)'),
      p('Fix: "He is smart, creative, and works hard."?','He is smart, creative, and hardworking.','All adjectives: smart, creative, hardworking'),
      p('Is this parallel? "I came, I saw, I conquered."?','yes','All three phrases use the same subject-verb structure'),
      p('Fix: "Either study or sleeping is fine."?','Either studying or sleeping is fine.','"Studying or sleeping" — both gerunds'),
      p('Parallel structure applies to ___?','lists, pairs, and comparisons','Use parallel form whenever comparing items'),
      p('Fix: "The essay was long, hard, and took too much time."?','The essay was long, hard, and time-consuming.','Three adjectives = parallel structure'),
      p('Correlative conjunctions need parallel structure: "both ___ and ___"?','the same form','Both...and, either...or, neither...nor need parallel forms'),
      p('Parallel structure makes writing ___?','clear and balanced','Consistency in form improves readability'),
    ]},
    { topic: 'Stylistic Devices', description: 'Stylistic devices are deliberate choices authors make about language to create effects.', problems: [
      p('The repetition of "i" sounds is called ___?','assonance','Assonance focuses on vowel sounds'),
      p('Repeating consonant sounds (not just at the start) is ___?','consonance','Consonance: "blank and think and drink"'),
      p('When the rhythm of the sentence matches its meaning, it\'s called ___?','mimesis','Mimesis: short choppy sentences for quick action'),
      p('Juxtaposition places two contrasting ideas ___?','side by side','Juxtaposition highlights the contrast between two things'),
      p('"He was a giant of a man, yet spoke in a whisper" uses ___?','juxtaposition','Contrast of size and quiet voice'),
      p('Using a part to represent the whole: "All hands on deck" is ___?','synecdoche','Hands = the whole crew'),
      p('"The White House announced..." uses what device?','metonymy','White House = the President — substituting a related term'),
      p('Apostrophe in literature means addressing an absent or imaginary ___?','person or thing','"O Death, where is thy sting?" = apostrophe'),
    ]},
  ]},
  11: { label: 'Grade 11 Writing', lessons: [
    { topic: 'Advanced Argumentation', description: 'Advanced argumentative writing uses sophisticated structure, nuanced claims, and strong rhetorical strategies.', problems: [
      p('A nuanced thesis acknowledges ___ while still taking a stance?','complexity','A nuanced argument isn\'t black and white'),
      p('What is a logical fallacy?','a flaw in reasoning','Fallacies make arguments seem valid but are actually flawed'),
      p('Straw man fallacy misrepresents the opposing argument to ___?','attack it more easily','Straw man is a dishonest debate technique'),
      p('A concession acknowledges a ___ point?','valid opposing','Conceding a point shows intellectual honesty'),
      p('After a concession, you provide a ___?','rebuttal','Acknowledge then argue against the concession'),
      p('Rogerian argument seeks ___ between opposing views?','common ground','Rogerian approach finds middle ground'),
      p('The strongest evidence is ___?','specific, relevant, and from credible sources','Evidence must be current, credible, and specific'),
      p('Using three strong pieces of evidence is better than ___?','using ten weak ones','Quality beats quantity in evidence'),
    ]},
    { topic: 'Grammar: Advanced Usage', description: 'Advanced grammar covers misplaced modifiers, dangling participles, and complex syntax.', problems: [
      p('Fix: "Running down the street, the tree fell on her."?','Running down the street, she was hit by a falling tree.','The participial phrase must be next to its noun'),
      p('A misplaced modifier is a phrase that is too far from the word it ___?','modifies','Modifiers must be near the words they describe'),
      p('Fix: "She almost drove her kids to school every day."?','She drove her kids to school almost every day.','Almost modifies "every day" not "drove"'),
      p('Fix: "Only I love you." vs "I love only you." — which says I love no one else?','I love only you.','Only must be placed next to what it limits'),
      p('An absolute phrase modifies the ___ sentence?','entire','Absolute phrases add detail about the whole clause'),
      p('A dangling modifier has no ___ in the sentence?','noun to modify','The noun the modifier describes is missing'),
      p('Fix: "As a child, my mother read to me."?','As a child, I was read to by my mother.','The modifier "as a child" must modify "I"'),
      p('"Despite the rain, ___ the game continued." — What is "despite the rain"?','a prepositional phrase / modifier','It modifies the whole main clause'),
    ]},
    { topic: 'Personal Essay & College Writing', description: 'College application essays require authentic voice, specific stories, and clear reflection.', problems: [
      p('A college essay should show who you are through ___?','a specific story','Use a real, specific experience — not generalities'),
      p('The most common college essay mistake is being too ___?','vague or generic','Be specific about your unique experiences'),
      p('Starting with dialogue or action is called a ___?','in medias res opening','Dropping into action creates immediate interest'),
      p('College essays should show growth, not just ___?','listing achievements','Reflect on what you learned, not just what you did'),
      p('The Common App essay has a maximum of ___ words?','650','CommonApp essays are 250–650 words'),
      p('Should you use a thesaurus to make your essay sound smarter?','no','Write in your natural voice'),
      p('Showing vulnerability in a college essay makes it ___?','authentic and relatable','Honesty creates connection'),
      p('The conclusion of a college essay should ___?','reflect on the experience\'s meaning','End with insight about who you are'),
    ]},
  ]},
  12: { label: 'Grade 12 Writing', lessons: [
    { topic: 'Advanced Literary Analysis', description: 'Graduate-level literary analysis considers form, ideology, and cultural context.', problems: [
      p('Deconstruction examines how a text contradicts ___?','itself','Deconstruction finds internal contradictions in texts'),
      p('New Criticism focuses on the text ___?','itself, ignoring author intent','New Critics avoid biographical context'),
      p('Reader-response criticism says meaning is created by ___?','the reader','Meaning depends on the reader\'s experience'),
      p('Ideology in a text refers to embedded ___ values?','social, political, or cultural','Texts often contain unstated assumptions'),
      p('Hegemony means dominant cultural ideas that seem ___?','natural or normal','Hegemonic ideas go unquestioned'),
      p('A text\'s absence — what it doesn\'t say — is sometimes as important as ___?','what it says','Silences in texts reveal ideology'),
      p('The author\'s intended meaning is called ___?','authorial intent','Though contested, authorial intent matters to some critics'),
      p('Structuralism finds universal ___ underlying all texts?','patterns or structures','Structuralists look for deep patterns in stories'),
    ]},
    { topic: 'Capstone Research Writing', description: 'A capstone research paper synthesizes multiple sources into an original argument.', problems: [
      p('An original research argument called a ___?','thesis','Your thesis should be something new or argued'),
      p('A literature review summarizes what others have written about ___?','your topic','Literature reviews map existing scholarship'),
      p('Synthesis means weaving multiple sources into ___?','your own argument','Not just summarizing — connecting ideas'),
      p('A research gap is a topic that has not been ___?','studied enough','Identifying a gap shows your research is needed'),
      p('Peer-reviewed articles are checked by ___?','other experts in the field','Peer review = expert quality control'),
      p('Academic integrity means doing your own work and ___?','citing all sources','Honesty and attribution are core values'),
      p('Footnotes are used for citations in ___ style?','Chicago','Chicago/Turabian uses footnotes for citations'),
      p('An annotated bibliography includes a citation plus ___?','a brief analysis of the source','Annotations evaluate the source\'s usefulness'),
    ]},
    { topic: 'Portfolio & Reflective Writing', description: 'Reflective writing shows growth by looking back at your work and thinking critically about it.', problems: [
      p('Reflective writing is about looking back at your own ___?','work or experience','Reflection analyzes your own growth'),
      p('A portfolio collects your best ___ over time?','work samples','Portfolios show progress and achievement'),
      p('A reflective statement explains what you ___?','learned and how you grew','Reflection shows insight about development'),
      p('Metacognition means thinking about ___?','your own thinking','Metacognition = awareness of your thought process'),
      p('Comparing an early draft to a final version shows ___?','growth','Revision history documents improvement'),
      p('A good reflection is honest about both strengths and ___?','weaknesses','Acknowledging weaknesses shows maturity'),
      p('Reflective writing uses ___ person?','first','I, me, my are appropriate in reflective writing'),
      p('The most important element of strong reflection is ___?','specificity','Specific examples make reflections believable'),
    ]},
  ]},
}

// ── Geography Curriculum ───────────────────────────────────
const geographyCurriculum: Record<number, { label: string; lessons: Lesson[] }> = {
  1: { label: 'Grade 1 Geography', lessons: [
    { topic: 'The Seven Continents', description: 'Earth has seven continents: Africa, Antarctica, Asia, Australia, Europe, North America, and South America.', problems: [
      p('How many continents are there on Earth?','7','Africa, Antarctica, Asia, Australia, Europe, North America, South America'),
      p('Which continent is also a country?','Australia','Australia is both a continent and a country'),
      p('The largest continent is ___?','Asia','Asia is the biggest continent by land and population'),
      p('The smallest continent is ___?','Australia','Australia (Oceania) is the smallest continent'),
      p('Which continent has no permanent human residents?','Antarctica','Antarctica is too cold for permanent human habitation'),
      p('The continent you live on is ___?','North America','The US, Canada, and Mexico are in North America'),
      p('Which continent is known as the "Dark Continent"?','Africa','Africa was called this by early European explorers'),
      p('How many continents start with the letter "A"?','4','Africa, Antarctica, Asia, Australia'),
    ]},
    { topic: 'The Five Oceans', description: 'Earth has five oceans: Pacific, Atlantic, Indian, Arctic, and Southern.', problems: [
      p('How many oceans are there on Earth?','5','Pacific, Atlantic, Indian, Arctic, Southern'),
      p('The largest ocean is the ___?','Pacific','The Pacific is the biggest and deepest ocean'),
      p('The ocean between North America and Europe is the ___?','Atlantic','The Atlantic Ocean separates the Americas from Europe/Africa'),
      p('The ocean surrounding Antarctica is the ___?','Southern','The Southern Ocean circles Antarctica'),
      p('The smallest ocean is the ___?','Arctic','The Arctic Ocean is in the far north'),
      p('The ocean near India and Australia is the ___?','Indian','The Indian Ocean is between Africa, Asia, and Australia'),
      p('Oceans are made of ___ water?','salt','Oceans contain salt water, unlike rivers and lakes'),
      p('Which ocean is the deepest?','Pacific','The Mariana Trench in the Pacific is the deepest point on Earth'),
    ]},
    { topic: 'Maps & Directions', description: 'A map is a drawing of the Earth. The four cardinal directions are North, South, East, and West.', problems: [
      p('What are the four cardinal directions?','North, South, East, West','N, S, E, W are the main directions'),
      p('On a map, North is usually ___?','up','By convention, north is at the top of most maps'),
      p('What is the tool on a map that shows which direction is North?','compass rose','A compass rose shows all four directions'),
      p('A ___ shows the scale of distances on a map?','legend or scale bar','The scale tells you how far real distances are on the map'),
      p('The imaginary line around Earth\'s middle is the ___?','equator','The equator divides Earth into Northern and Southern Hemispheres'),
      p('The opposite of North is ___?','South','North and South are opposites'),
      p('If you face North, East is to your ___?','right','North, East, South, West clockwise from the top'),
      p('A map of the whole Earth on a flat surface is called a ___?','world map','World maps show all continents and oceans'),
    ]},
  ]},
  2: { label: 'Grade 2 Geography', lessons: [
    { topic: 'US States & Regions', description: 'The United States has 50 states divided into five main regions.', problems: [
      p('How many states are in the United States?','50','The USA has 50 states'),
      p('What is the capital of the United States?','Washington D.C.','Washington D.C. is the nation\'s capital'),
      p('What is the largest US state by area?','Alaska','Alaska is by far the biggest state'),
      p('What is the smallest US state?','Rhode Island','Rhode Island is the smallest state'),
      p('The state of Hawaii is located in which ocean?','Pacific','Hawaii is a group of islands in the Pacific Ocean'),
      p('Texas, California, and New York are examples of ___?','US states','All three are states in the USA'),
      p('What are the five Great Lakes?','Superior, Michigan, Huron, Erie, Ontario','HOMES helps remember them'),
      p('The Mississippi River flows into which body of water?','Gulf of Mexico','The Mississippi drains into the Gulf of Mexico'),
    ]},
    { topic: 'World Landmarks', description: 'Famous landmarks help us identify places around the world.', problems: [
      p('The Eiffel Tower is in which city?','Paris','The Eiffel Tower is in Paris, France'),
      p('The Great Wall is in which country?','China','The Great Wall of China stretches thousands of miles'),
      p('The Pyramids of Giza are in which country?','Egypt','The ancient pyramids are near Cairo, Egypt'),
      p('The Statue of Liberty is in which city?','New York City','Lady Liberty stands in New York Harbor'),
      p('The Colosseum is in which city?','Rome','The ancient Colosseum is in Rome, Italy'),
      p('The Taj Mahal is in which country?','India','The Taj Mahal is in Agra, India'),
      p('Big Ben is a famous clock in which city?','London','Big Ben is part of the Houses of Parliament in London'),
      p('The Sydney Opera House is in which country?','Australia','The Sydney Opera House is one of Australia\'s most famous buildings'),
    ]},
    { topic: 'Countries & Capitals', description: 'Every country has a capital city where the government is located.', problems: [
      p('Capital of France?','Paris','Paris has been the capital of France for centuries'),
      p('Capital of Japan?','Tokyo','Tokyo is the largest city and capital of Japan'),
      p('Capital of Canada?','Ottawa','Ottawa, not Toronto, is the capital of Canada'),
      p('Capital of Brazil?','Brasilia','Brasilia is Brazil\'s planned capital city'),
      p('Capital of Australia?','Canberra','Canberra, not Sydney, is Australia\'s capital'),
      p('Capital of Germany?','Berlin','Berlin became Germany\'s capital after reunification'),
      p('Capital of Russia?','Moscow','Moscow is the capital and largest city of Russia'),
      p('Capital of China?','Beijing','Beijing (Peking) is the capital of China'),
    ]},
  ]},
  3: { label: 'Grade 3 Geography', lessons: [
    { topic: 'North America', description: 'North America includes the United States, Canada, Mexico, Central America, and the Caribbean.', problems: [
      p('What are the three largest countries in North America?','USA, Canada, Mexico','Together they make up most of North America'),
      p('The capital of Mexico is ___?','Mexico City','Mexico City is one of the largest cities in the world'),
      p('The capital of Canada is ___?','Ottawa','Ottawa is in Ontario, Canada'),
      p('North America is bordered by the Pacific and ___ oceans?','Atlantic','The Atlantic is to the east, Pacific to the west'),
      p('The Rocky Mountains run through which continent?','North America','The Rockies run from Canada to New Mexico'),
      p('What is the longest river in the US?','Missouri River','The Missouri River is slightly longer than the Mississippi'),
      p('What country is north of the United States?','Canada','Canada shares the longest border with the US'),
      p('What is the southernmost country in North America?','Panama','Panama connects North and South America'),
    ]},
    { topic: 'South America', description: 'South America is home to the Amazon rainforest, the Andes mountains, and 12 countries.', problems: [
      p('The capital of Brazil is ___?','Brasilia','Brazil is the largest country in South America'),
      p('The capital of Argentina is ___?','Buenos Aires','Buenos Aires is the largest city in Argentina'),
      p('The Amazon River flows through which continent?','South America','The Amazon is the world\'s largest river by volume'),
      p('The longest mountain range in the world is the ___?','Andes','The Andes run along the west coast of South America'),
      p('How many countries are in South America?','12','Brazil, Argentina, Chile, Colombia, etc.'),
      p('The capital of Peru is ___?','Lima','Lima is Peru\'s capital and largest city'),
      p('Angel Falls, the world\'s highest waterfall, is in ___?','Venezuela','Angel Falls is in Canaima National Park, Venezuela'),
      p('The Galapagos Islands belong to which country?','Ecuador','The Galapagos are an Ecuadorian territory'),
    ]},
    { topic: 'Europe', description: 'Europe is a continent of over 44 countries with a rich history and diverse cultures.', problems: [
      p('Capital of the United Kingdom?','London','London has been England\'s capital since Roman times'),
      p('Capital of Italy?','Rome','Rome is one of the oldest capital cities in the world'),
      p('Capital of Spain?','Madrid','Madrid is in the center of Spain'),
      p('Capital of Germany?','Berlin','Berlin is Germany\'s largest city and capital'),
      p('Which European country has the most land?','Russia','Russia spans both Europe and Asia'),
      p('What sea lies between Europe and Africa?','Mediterranean','The Mediterranean Sea separates Europe from Africa'),
      p('The Alps mountain range is in which part of Europe?','Central/Southern','The Alps span France, Switzerland, Italy, and Austria'),
      p('Capital of Greece?','Athens','Athens is one of the oldest cities in the world'),
    ]},
  ]},
  4: { label: 'Grade 4 Geography', lessons: [
    { topic: 'Africa', description: 'Africa is the second-largest continent with 54 countries and incredible biodiversity.', problems: [
      p('How many countries are in Africa?','54','Africa has the most countries of any continent'),
      p('Capital of Egypt?','Cairo','Cairo is the largest city in Africa'),
      p('The Sahara is the world\'s largest ___?','desert','The Sahara covers most of North Africa'),
      p('The Nile River is the ___?','longest river in the world','The Nile flows north through Africa into the Mediterranean'),
      p('Capital of South Africa?','Cape Town / Pretoria / Bloemfontein','South Africa has three capitals!'),
      p('Africa\'s highest mountain is ___?','Kilimanjaro','Mt. Kilimanjaro is in Tanzania'),
      p('Capital of Nigeria?','Abuja','Abuja replaced Lagos as Nigeria\'s capital'),
      p('Capital of Kenya?','Nairobi','Nairobi is also Kenya\'s largest city'),
    ]},
    { topic: 'Asia', description: 'Asia is the largest and most populous continent, home to over 4 billion people.', problems: [
      p('Capital of India?','New Delhi','New Delhi is India\'s capital, not Mumbai'),
      p('Capital of Japan?','Tokyo','Tokyo is one of the world\'s most populous cities'),
      p('Capital of China?','Beijing','Beijing has been China\'s capital for centuries'),
      p('The Himalayas are the world\'s ___?','tallest mountain range','The Himalayas include Mt. Everest'),
      p('Mt. Everest is on the border of Nepal and ___?','China (Tibet)','Everest sits on the Nepal-Tibet border'),
      p('Capital of South Korea?','Seoul','Seoul is a mega-city with over 10 million people'),
      p('Capital of Saudi Arabia?','Riyadh','Riyadh is in the center of the Arabian Peninsula'),
      p('The world\'s most populous country is ___?','India','India surpassed China in 2023'),
    ]},
    { topic: 'Physical Geography', description: 'Physical geography studies Earth\'s natural features like mountains, rivers, and deserts.', problems: [
      p('A large, flat area of land is called a ___?','plain or plateau','Plains are flat lowlands; plateaus are elevated flat areas'),
      p('The mouth of a river is where it ___?','meets the sea','Rivers flow from source (headwaters) to mouth'),
      p('An island surrounded entirely by water is ___?','land surrounded by water','An island is land with water on all sides'),
      p('A narrow strip of land connecting two larger pieces is an ___?','isthmus','Panama is an isthmus connecting the Americas'),
      p('A narrow body of water connecting two larger bodies is a ___?','strait','The Strait of Gibraltar connects the Atlantic and Mediterranean'),
      p('A large body of ice that moves slowly is a ___?','glacier','Glaciers cover about 10% of Earth\'s land'),
      p('The highest point on Earth is ___?','Mt. Everest','Everest is 8,849 meters (29,032 feet) tall'),
      p('A funnel-shaped landmass where a river meets the sea is a ___?','delta','The Nile Delta and Mississippi Delta are famous examples'),
    ]},
  ]},
  5: { label: 'Grade 5 Geography', lessons: [
    { topic: 'World Capitals', description: 'Learn the capital cities of major countries around the world.', problems: [
      p('Capital of Argentina?','Buenos Aires','Buenos Aires is the largest city in Argentina'),
      p('Capital of Australia?','Canberra','Many think it\'s Sydney, but Canberra is the capital'),
      p('Capital of Canada?','Ottawa','Ottawa is in Ontario, Canada'),
      p('Capital of Mexico?','Mexico City','Mexico City is one of the world\'s largest cities'),
      p('Capital of Russia?','Moscow','Moscow is Russia\'s political and cultural center'),
      p('Capital of Nigeria?','Abuja','Abuja replaced Lagos in 1991 as Nigeria\'s capital'),
      p('Capital of Pakistan?','Islamabad','Islamabad replaced Karachi as capital in 1958'),
      p('Capital of Indonesia?','Jakarta','Jakarta (being moved to Nusantara)'),
    ]},
    { topic: 'Climate Zones', description: 'Earth has five main climate zones: tropical, dry, temperate, continental, and polar.', problems: [
      p('The climate zone near the equator with year-round heat is ___?','tropical','Tropical climates are hot and often rainy year-round'),
      p('The climate zone with hot summers and cold winters is ___?','continental','Continental climates have extreme seasonal changes'),
      p('The coldest climate zones are found near the ___?','poles','Polar climates are near the North and South Poles'),
      p('The driest climate zone is called ___?','arid or dry','Desert regions have arid climates'),
      p('The Mediterranean climate is known for hot, dry ___ and mild, wet ___?','summers and winters','Mediterranean: dry summers, rainy winters'),
      p('Which climate zone has the most biodiversity?','tropical','Tropical rainforests have the highest biodiversity'),
      p('The tundra is a type of ___ climate?','polar/arctic','Tundra = cold, treeless landscape'),
      p('A place with four distinct seasons likely has a ___ climate?','temperate or continental','Both have four seasons'),
    ]},
    { topic: 'Population & Density', description: 'Population density measures how many people live per square kilometer in an area.', problems: [
      p('The world\'s most populous country is ___?','India','India has over 1.4 billion people'),
      p('The second most populous country is ___?','China','China also has over 1.4 billion people'),
      p('A densely populated area has ___ people per square km?','many','Dense = lots of people in a small area'),
      p('Which continent has the most people?','Asia','Over 4 billion people live in Asia'),
      p('Which continent is least populated?','Antarctica','Almost no one permanently lives in Antarctica'),
      p('The world\'s most densely populated city is ___?','Dhaka (Bangladesh)','Dhaka has one of the highest population densities'),
      p('Population density = total population ÷ ___?','land area','Density = people per square kilometer'),
      p('A country with a high birth rate usually has a ___?','growing population','Birth rate = number of births per 1000 people'),
    ]},
  ]},
  6: { label: 'Grade 6 Geography', lessons: [
    { topic: 'Latitude & Longitude', description: 'Latitude measures distance north/south of the equator. Longitude measures east/west of the prime meridian.', problems: [
      p('The equator is at ___ degrees latitude?','0','The equator is the starting line for latitude'),
      p('The North Pole is at ___ degrees North?','90','90°N is the North Pole'),
      p('The prime meridian is at ___ degrees longitude?','0','The prime meridian is the starting line for longitude'),
      p('Lines of latitude run ___?','east to west','Latitude lines circle the Earth horizontally'),
      p('Lines of longitude run ___?','north to south','Longitude lines run from pole to pole'),
      p('The Tropic of Cancer is at approximately ___ N?','23.5','The Tropic of Cancer marks the sun\'s northernmost point'),
      p('Together, latitude and longitude give a location\'s ___?','coordinates','Coordinates identify any spot on Earth'),
      p('The International Date Line is at approximately ___ degrees longitude?','180','The Date Line is opposite the prime meridian'),
    ]},
    { topic: 'Middle East & Central Asia', description: 'The Middle East connects three continents and has played a major role in world history.', problems: [
      p('Capital of Iran?','Tehran','Tehran is Iran\'s largest city and capital'),
      p('Capital of Turkey?','Ankara','Ankara, not Istanbul, is Turkey\'s capital'),
      p('Capital of Israel?','Jerusalem','Jerusalem is Israel\'s declared capital (disputed internationally)'),
      p('Capital of Iraq?','Baghdad','Baghdad was the center of the Islamic Golden Age'),
      p('Which desert covers most of the Arabian Peninsula?','Arabian Desert','The Arabian Desert is one of Earth\'s largest deserts'),
      p('The Suez Canal connects the Mediterranean to the ___?','Red Sea','The Suez Canal allows ships to avoid going around Africa'),
      p('Capital of Afghanistan?','Kabul','Kabul is Afghanistan\'s largest city'),
      p('Capital of Kazakhstan?','Astana','Astana (formerly Nur-Sultan) is Kazakhstan\'s capital'),
    ]},
    { topic: 'Geographic Terms', description: 'Geographers use specific terms to describe landforms and water features.', problems: [
      p('A body of water almost completely surrounded by land is a ___?','bay','A bay is smaller than a gulf'),
      p('A large inlet of the ocean that is largely surrounded by land is a ___?','gulf','The Gulf of Mexico is a famous example'),
      p('Land that juts into water on three sides is a ___?','peninsula','Florida and Italy are peninsulas'),
      p('A mountain with an opening where lava erupts is a ___?','volcano','Volcanoes can be active, dormant, or extinct'),
      p('A valley with steep sides carved by a river is a ___?','canyon','The Grand Canyon is the most famous canyon in the US'),
      p('A large area of land that is mostly flat and often at a high elevation is a ___?','plateau','The Tibetan Plateau is called the "Roof of the World"'),
      p('The line where the ocean meets the land is called the ___?','coastline','Coastlines vary from rocky cliffs to sandy beaches'),
      p('A place where two rivers meet is called a ___?','confluence','Many cities are built at river confluences'),
    ]},
  ]},
  7: { label: 'Grade 7 Geography', lessons: [
    { topic: 'Europe & the EU', description: 'The European Union (EU) is an economic and political alliance of European countries.', problems: [
      p('Capital of France?','Paris','Paris has been France\'s capital for over 1,000 years'),
      p('Capital of the Netherlands?','Amsterdam','Amsterdam is the constitutional capital; The Hague is governmental'),
      p('Capital of Sweden?','Stockholm','Stockholm is Scandinavia\'s largest city'),
      p('The EU\'s main currency is the ___?','Euro','Not all EU countries use the Euro'),
      p('Which European country is NOT in the EU?','Norway / Switzerland','Many countries bordering EU are not members'),
      p('Capital of Poland?','Warsaw','Warsaw is rebuilt after WWII destruction'),
      p('The Alps span between France and ___?','Italy and Switzerland','The Alps are a central European mountain range'),
      p('Capital of Ukraine?','Kyiv','Kyiv is Ukraine\'s capital and largest city'),
    ]},
    { topic: 'East & Southeast Asia', description: 'East and Southeast Asia are among the most economically dynamic regions in the world.', problems: [
      p('Capital of South Korea?','Seoul','Seoul is one of the world\'s most tech-advanced cities'),
      p('Capital of North Korea?','Pyongyang','Pyongyang is a closed city with limited foreign access'),
      p('Capital of Vietnam?','Hanoi','Hanoi is Vietnam\'s political capital; Ho Chi Minh City is the commercial capital'),
      p('Capital of Thailand?','Bangkok','Bangkok\'s full ceremonial name is among the world\'s longest'),
      p('Capital of the Philippines?','Manila','Manila is in Luzon, the largest Philippine island'),
      p('Capital of Indonesia?','Jakarta','Indonesia is being moved its capital to Nusantara'),
      p('The Mekong River flows through which countries?','China, Laos, Thailand, Cambodia, Vietnam','The Mekong is Southeast Asia\'s largest river'),
      p('Capital of Malaysia?','Kuala Lumpur','KL is famous for the Petronas Twin Towers'),
    ]},
    { topic: 'Natural Resources', description: 'Natural resources are materials from Earth that humans use. They can be renewable or non-renewable.', problems: [
      p('Is oil a renewable or non-renewable resource?','non-renewable','Oil takes millions of years to form and is finite'),
      p('Is sunlight a renewable or non-renewable resource?','renewable','Solar energy is unlimited and renewable'),
      p('The Middle East is rich in which natural resource?','oil/petroleum','The Persian Gulf region has massive oil reserves'),
      p('Which continent has the most freshwater?','South America','The Amazon basin holds huge amounts of freshwater'),
      p('Deforestation in the Amazon affects global ___?','climate','The Amazon produces oxygen and affects weather worldwide'),
      p('Coal, oil, and natural gas are called ___?','fossil fuels','Fossil fuels formed from ancient organisms'),
      p('A country with rich natural resources can have a strong ___?','economy','Natural resources drive economic development'),
      p('Conservation means ___?','protecting and saving resources','Conservation reduces waste and preserves nature'),
    ]},
  ]},
  8: { label: 'Grade 8 Geography', lessons: [
    { topic: 'Sub-Saharan Africa', description: 'Sub-Saharan Africa is the region south of the Sahara Desert, with 46 countries.', problems: [
      p('Capital of Ethiopia?','Addis Ababa','Addis Ababa is also headquarters of the African Union'),
      p('Capital of Ghana?','Accra','Accra is on Ghana\'s Atlantic coast'),
      p('Capital of Tanzania?','Dodoma','Dar es Salaam is the largest city but Dodoma is capital'),
      p('Victoria Lake is shared by Uganda, Tanzania, and ___?','Kenya','Lake Victoria is Africa\'s largest lake'),
      p('The Congo River is in which country?','Democratic Republic of Congo','The Congo River is Africa\'s second-longest river'),
      p('Which is Africa\'s most populous country?','Nigeria','Nigeria has over 200 million people'),
      p('Capital of Zimbabwe?','Harare','Harare is formerly known as Salisbury'),
      p('Which country has the Cape of Good Hope?','South Africa','The Cape of Good Hope is at South Africa\'s southern tip'),
    ]},
    { topic: 'Oceania & Pacific Islands', description: 'Oceania includes Australia, New Zealand, Melanesia, Micronesia, and Polynesia.', problems: [
      p('Capital of New Zealand?','Wellington','Wellington, not Auckland, is New Zealand\'s capital'),
      p('Oceania is another name for the region including Australia and the ___?','Pacific Islands','Oceania covers the Pacific island nations'),
      p('The Maori are indigenous people of ___?','New Zealand','Maori culture is central to New Zealand\'s identity'),
      p('Papua New Guinea shares an island with which country?','Indonesia','They share the island of New Guinea'),
      p('What is the largest Pacific island country by area?','Papua New Guinea','PNG is the largest Melanesian nation'),
      p('Hawaii is the ___ most recent US state?','50th','Hawaii became a state in 1959'),
      p('The Great Barrier Reef is off the coast of ___?','Australia','The Great Barrier Reef is in the Coral Sea'),
      p('Fiji, Tonga, and Samoa are part of ___?','Polynesia','These islands are in the Polynesian triangle'),
    ]},
    { topic: 'Geopolitics', description: 'Geopolitics studies how geography affects politics, power, and international relations.', problems: [
      p('A country that has no coast is called ___?','landlocked','Switzerland and Bolivia are landlocked'),
      p('Control of a strategic waterway is important for ___?','trade and military power','Straits and canals are geopolitically important'),
      p('NATO is a military alliance of ___ countries?','North American and European','NATO = North Atlantic Treaty Organization'),
      p('The UN headquarters is in ___?','New York City','The United Nations was founded in San Francisco in 1945'),
      p('A buffer state is a neutral country between two ___?','larger rival countries','Buffer states reduce direct conflict between rivals'),
      p('Economic sanctions restrict ___?','trade with a country','Sanctions are used to pressure governments'),
      p('A disputed territory is land that two or more countries ___?','claim','Kashmir and Kosovo are disputed territories'),
      p('The Strait of Hormuz controls oil shipping from the ___?','Persian Gulf','About 20% of world oil passes through this strait'),
    ]},
  ]},
  9: { label: 'Grade 9 Geography', lessons: [
    { topic: 'Advanced World Capitals', description: 'Test your knowledge of less commonly known world capitals.', problems: [
      p('Capital of Bolivia?','Sucre (constitutional) / La Paz (seat of government)','Bolivia has two capitals'),
      p('Capital of Myanmar (Burma)?','Naypyidaw','Myanmar moved its capital from Yangon to Naypyidaw in 2006'),
      p('Capital of Ivory Coast (Côte d\'Ivoire)?','Yamoussoukro','Abidjan is the largest city but Yamoussoukro is the capital'),
      p('Capital of Kazakhstan?','Astana','Astana (formerly Nur-Sultan) is Kazakhstan\'s modern capital'),
      p('Capital of Sri Lanka?','Sri Jayawardenepura Kotte','Colombo is the commercial capital'),
      p('Capital of Tanzania?','Dodoma','Dar es Salaam is larger but Dodoma is the political capital'),
      p('Capital of Bhutan?','Thimphu','Thimphu is the highest-altitude capital in Asia'),
      p('Capital of Papua New Guinea?','Port Moresby','Port Moresby is on the southern coast of PNG'),
    ]},
    { topic: 'World Trade & Economics', description: 'Geography shapes trade routes, economic development, and global inequality.', problems: [
      p('The Silk Road connected China to ___?','Europe and the Middle East','The ancient Silk Road was a trade network'),
      p('A free trade zone has low or no ___?','tariffs','Free trade reduces barriers between countries'),
      p('GDP stands for Gross Domestic ___?','Product','GDP measures the total value of a country\'s economy'),
      p('A country that exports more than it imports has a trade ___?','surplus','More exports than imports = trade surplus'),
      p('The World Trade Organization (WTO) oversees ___?','international trade rules','WTO manages rules for global trade'),
      p('Colonialism allowed European powers to extract resources from ___?','colonies','Colonialism exploited global resources for European benefit'),
      p('The Global South refers to ___?','developing nations','Generally countries in Asia, Africa, and Latin America'),
      p('An embargo is a complete ban on ___?','trade with a country','Embargoes stop all economic exchange'),
    ]},
    { topic: 'Environmental Geography', description: 'Environmental geography studies how humans affect the natural world and vice versa.', problems: [
      p('The greenhouse effect traps ___ in Earth\'s atmosphere?','heat','Greenhouse gases trap solar heat'),
      p('Rising CO2 is causing global ___?','warming','Carbon dioxide from fossil fuels causes climate change'),
      p('Deforestation increases CO2 because trees ___?','absorb CO2','Without trees, more CO2 stays in the atmosphere'),
      p('The ozone layer protects Earth from harmful ___ radiation?','UV','The ozone layer blocks ultraviolet rays'),
      p('Desertification is the process of land becoming ___?','desert','Overgrazing and drought can turn land to desert'),
      p('The IPCC is the international body that studies ___?','climate change','The Intergovernmental Panel on Climate Change'),
      p('An ecological footprint measures how much nature a person ___?','uses or impacts','It measures your impact on the planet'),
      p('Biodiversity hotspots are areas with many unique ___?','species','These regions need special conservation efforts'),
    ]},
  ]},
  10: { label: 'Grade 10 Geography', lessons: [
    { topic: 'Geomorphology', description: 'Geomorphology is the study of how Earth\'s surface is shaped by natural processes.', problems: [
      p('The movement of tectonic plates causes ___?','earthquakes and volcanoes','Plate tectonics shapes Earth\'s surface'),
      p('When two plates collide, they can form ___?','mountains','The Himalayas formed from the India-Asia collision'),
      p('The Ring of Fire is a zone of frequent earthquakes in the ___?','Pacific','Most of Earth\'s volcanoes are in the Ring of Fire'),
      p('Erosion is caused by ___?','water, wind, and ice','Rivers, wind, and glaciers all erode rock'),
      p('Weathering breaks rock down into ___?','smaller pieces / soil','Weathering prepares rock for erosion'),
      p('A river\'s sediment deposits at its mouth forming a ___?','delta','Deltas are fertile agricultural regions'),
      p('The process of sea floor spreading creates new ___?','oceanic crust','Mid-ocean ridges are where new crust forms'),
      p('Karst topography is formed by dissolving ___?','limestone','Caves and sinkholes form in karst landscapes'),
    ]},
    { topic: 'Cultural Geography', description: 'Cultural geography studies how culture is reflected in and shaped by the landscape.', problems: [
      p('Cultural diffusion is the spreading of ___?','ideas, customs, and practices','Culture spreads through trade, migration, and media'),
      p('A lingua franca is a ___ used between speakers of different native languages?','common language','English is the world\'s most common lingua franca'),
      p('Cultural hearths are places where ___?','civilizations first developed','Mesopotamia and the Nile Valley are cultural hearths'),
      p('Ethnocentrism is judging another culture by your own ___?','standards','Ethnocentrism often leads to misunderstanding'),
      p('Cultural relativism means judging a culture by its own ___?','standards','Understanding a culture on its own terms'),
      p('The spread of American pop culture globally is called ___?','Americanization or cultural imperialism','American media, food, and brands spread worldwide'),
      p('A boundary drawn without respect for local populations is called ___?','arbitrary','Africa\'s borders were often drawn arbitrarily by European colonizers'),
      p('Diaspora refers to a population that has scattered ___?','from their homeland','The Jewish and African diasporas are famous examples'),
    ]},
    { topic: 'Urbanization', description: 'Urbanization is the process by which people move from rural areas to cities.', problems: [
      p('The world\'s largest city by population is ___?','Tokyo','Tokyo has over 37 million people in its metro area'),
      p('A megacity has a population of over ___ million?','10','Cities over 10 million are called megacities'),
      p('Urbanization is generally caused by ___?','economic opportunity','People move to cities for jobs and services'),
      p('Urban sprawl is the uncontrolled outward growth of a ___?','city','Sprawl leads to traffic, pollution, and land use problems'),
      p('A slum or shanty town is an informal settlement with poor ___?','housing and services','Slums lack clean water, sanitation, and stable housing'),
      p('Which continent is urbanizing fastest?','Africa','African cities are growing at the fastest rate'),
      p('Gentrification is when wealthy people move into ___?','poorer urban neighborhoods','Gentrification often displaces original residents'),
      p('A smart city uses ___ to manage infrastructure?','technology','Smart cities use data to improve services'),
    ]},
  ]},
  11: { label: 'Grade 11 Geography', lessons: [
    { topic: 'Political Geography', description: 'Political geography studies how borders, territories, and political systems shape the world.', problems: [
      p('A nation-state is a country where one ___ dominates?','ethnic group / nation','Ideal nation-states match ethnicity with political borders'),
      p('Sovereignty means a country has control over its ___?','territory and government','Sovereignty = the right to self-govern'),
      p('A federal system divides power between national and ___ governments?','state or regional','The USA is a federal system'),
      p('A unitary state concentrates power in the ___?','central government','France is a unitary state'),
      p('The process of a colony becoming independent is ___?','decolonization','Most African nations decolonized in the 1950s-70s'),
      p('A stateless nation is an ethnic group without its own ___?','country','The Kurds and Palestinians are stateless nations'),
      p('Irredentism means wanting to reclaim territory populated by your ___?','ethnic group','Russia claimed Crimea partly on this basis'),
      p('A confederation is a loose alliance of ___?','independent states','The EU and the original US Articles of Confederation'),
    ]},
    { topic: 'Development Geography', description: 'Development geography studies why some countries are wealthy and others are not.', problems: [
      p('The Human Development Index (HDI) measures ___?','life expectancy, education, and income','HDI combines three measures of human development'),
      p('A developed country is also called a ___ country?','high-income or Global North','Wealthy nations are called developed or first world'),
      p('Less developed countries are called ___?','developing or Global South','Lower-income nations are developing countries'),
      p('Foreign aid is money given by rich countries to ___?','poorer countries','Aid helps fund development projects'),
      p('Microfinance gives small loans to ___?','people in poverty','Microloans help small entrepreneurs in developing countries'),
      p('The resource curse means having too many natural resources can ___?','slow development','Oil-rich nations sometimes have poor governance'),
      p('Brain drain means skilled workers leaving ___?','their home country','Brain drain deprives developing countries of talent'),
      p('Sustainable development meets present needs without harming ___?','future generations','Sustainability balances growth with environmental protection'),
    ]},
    { topic: 'Migration', description: 'Migration is the movement of people from one place to another.', problems: [
      p('Push factors drive people ___ their home country?','out of','Poverty, conflict, and drought are push factors'),
      p('Pull factors attract people ___ a new country?','to','Jobs, safety, and education are pull factors'),
      p('A refugee has fled their country due to ___?','persecution or conflict','Refugees are protected by international law'),
      p('An immigrant who moves for economic reasons is an ___?','economic migrant','Economic migrants seek better jobs or wages'),
      p('Internal migration is movement within ___?','one country','Rural to urban migration is a common internal pattern'),
      p('Remittances are money sent by migrants back to their ___?','home country','Remittances are a major income source for many developing nations'),
      p('The UN agency that protects refugees is the ___?','UNHCR','United Nations High Commissioner for Refugees'),
      p('Displacement occurs when people are forced to leave their ___?','homes','Natural disasters and conflict cause displacement'),
    ]},
  ]},
  12: { label: 'Grade 12 Geography', lessons: [
    { topic: 'Globalization', description: 'Globalization is the increased interconnection of the world\'s economies, cultures, and populations.', problems: [
      p('The internet has accelerated ___?','globalization','Digital connectivity speeds up global exchange'),
      p('A multinational corporation operates in ___?','more than one country','Companies like Apple and Toyota are multinationals'),
      p('Outsourcing means moving jobs to countries with ___?','lower labor costs','Companies outsource to save money'),
      p('The WTO, IMF, and World Bank are ___?','international financial organizations','These institutions regulate global economics'),
      p('Anti-globalization movements oppose ___?','economic inequality and cultural homogenization','Critics say globalization harms local cultures'),
      p('A global city is a financial and cultural hub connected to ___?','the global economy','New York, London, Tokyo are global cities'),
      p('Supply chains connect producers and consumers across ___?','the world','Global supply chains make products from many countries'),
      p('The COVID pandemic showed that globalization can quickly spread ___?','disease','Pandemics travel along global trade and travel routes'),
    ]},
    { topic: 'Climate Change Geography', description: 'Climate change is affecting geography in ways that have major consequences for humans and ecosystems.', problems: [
      p('Sea level rise threatens low-lying countries like ___?','Bangladesh and the Maldives','Island nations face existential threats from rising seas'),
      p('The Arctic is warming ___ times faster than the global average?','4','Arctic amplification makes the north heat faster'),
      p('Melting permafrost releases ___?','methane','Thawing permafrost is a major climate feedback loop'),
      p('Climate refugees are people displaced by ___?','climate change effects','Flooding, drought, and storms create climate migrants'),
      p('The Paris Agreement aims to limit warming to ___ degrees Celsius?','1.5 to 2','Nations agreed to keep warming below these thresholds'),
      p('Carbon sequestration means capturing ___ from the atmosphere?','CO2','Trees, soil, and technology can sequester carbon'),
      p('Coral bleaching is caused by ___?','warmer ocean temperatures','Warming oceans stress and kill coral reefs'),
      p('Climate justice argues that those who pollute most should ___?','bear the greatest responsibility','Rich nations produced most historical emissions'),
    ]},
    { topic: 'AP Human Geography Review', description: 'Advanced concepts that tie together human and physical geography.', problems: [
      p('Von Thünen\'s model explains ___?','agricultural land use around cities','Different crops grown at different distances from market'),
      p('Weber\'s least-cost theory explains where ___?','industries locate','Industries minimize transportation and labor costs'),
      p('The demographic transition model shows how ___?','population changes with development','Birth/death rates change as countries develop'),
      p('The core-periphery model shows the relationship between ___?','rich and poor regions','Cores dominate and exploit periphery regions'),
      p('Rostow\'s stages of economic growth predict ___?','development pathways','Countries move through stages from traditional to post-industrial'),
      p('A primate city is much larger than ___?','the next-largest city','Mexico City and Bangkok are primate cities'),
      p('The gravity model predicts ___?','interaction between places','Larger, closer cities interact more'),
      p('Sequent occupance shows how different cultures have ___?','shaped the same place over time','Layers of history are visible in the landscape'),
    ]},
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

// @ts-ignore
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

// ── Character System ───────────────────────────────────────
type CharType = 'bunny' | 'fox' | 'bear' | 'cat' | 'panda' | 'raccoon' | 'frog' | 'otter'

const FUR_COLORS = [
  { label: 'cream',  hex: '#f5deb3' },
  { label: 'tan',    hex: '#c49a6a' },
  { label: 'gray',   hex: '#9e9e9e' },
  { label: 'black',  hex: '#2d2d2d' },
  { label: 'white',  hex: '#f0f0f0' },
  { label: 'orange', hex: '#e08030' },
  { label: 'brown',  hex: '#7b4f2e' },
  { label: 'blue',   hex: '#6fa8dc' },
]

const OUTFIT_COLORS = [
  { label: 'red',    hex: '#e53935' },
  { label: 'blue',   hex: '#1e88e5' },
  { label: 'yellow', hex: '#fdd835' },
  { label: 'green',  hex: '#43a047' },
  { label: 'purple', hex: '#8e24aa' },
  { label: 'pink',   hex: '#e91e8c' },
  { label: 'teal',   hex: '#00897b' },
  { label: 'orange', hex: '#fb8c00' },
]

function CharacterBody({ type, furColor, outfitColor, size = 120 }: {
  type: CharType; furColor: string; outfitColor: string; size?: number
}) {
  const cx = size / 2
  const scale = size / 100
  const s = (n: number) => n * scale

  // darkened shoe color
  const shoe = '#444'
  // inner ear / muzzle accent
  const accent = furColor === '#f0f0f0' ? '#ffc0cb' : '#fff0f0'

  const ears = () => {
    if (type === 'bunny') return (
      <>
        <ellipse cx={cx - s(14)} cy={s(10)} rx={s(7)} ry={s(18)} fill={furColor} />
        <ellipse cx={cx - s(14)} cy={s(10)} rx={s(4)} ry={s(13)} fill="#ffb3c8" />
        <ellipse cx={cx + s(14)} cy={s(10)} rx={s(7)} ry={s(18)} fill={furColor} />
        <ellipse cx={cx + s(14)} cy={s(10)} rx={s(4)} ry={s(13)} fill="#ffb3c8" />
      </>
    )
    if (type === 'fox') return (
      <>
        <polygon points={`${cx-s(20)},${s(30)} ${cx-s(10)},${s(5)} ${cx-s(2)},${s(22)}`} fill={furColor} />
        <polygon points={`${cx-s(18)},${s(28)} ${cx-s(10)},${s(9)} ${cx-s(4)},${s(22)}`} fill="#fff0e0" />
        <polygon points={`${cx+s(20)},${s(30)} ${cx+s(10)},${s(5)} ${cx+s(2)},${s(22)}`} fill={furColor} />
        <polygon points={`${cx+s(18)},${s(28)} ${cx+s(10)},${s(9)} ${cx+s(4)},${s(22)}`} fill="#fff0e0" />
      </>
    )
    if (type === 'bear') return (
      <>
        <circle cx={cx - s(18)} cy={s(20)} r={s(10)} fill={furColor} />
        <circle cx={cx - s(18)} cy={s(20)} r={s(6)} fill={accent} />
        <circle cx={cx + s(18)} cy={s(20)} r={s(10)} fill={furColor} />
        <circle cx={cx + s(18)} cy={s(20)} r={s(6)} fill={accent} />
      </>
    )
    if (type === 'cat') return (
      <>
        <polygon points={`${cx-s(22)},${s(26)} ${cx-s(14)},${s(4)} ${cx-s(4)},${s(20)}`} fill={furColor} />
        <polygon points={`${cx-s(20)},${s(25)} ${cx-s(14)},${s(8)} ${cx-s(6)},${s(20)}`} fill="#ffb3c8" />
        <polygon points={`${cx+s(22)},${s(26)} ${cx+s(14)},${s(4)} ${cx+s(4)},${s(20)}`} fill={furColor} />
        <polygon points={`${cx+s(20)},${s(25)} ${cx+s(14)},${s(8)} ${cx+s(6)},${s(20)}`} fill="#ffb3c8" />
      </>
    )
    if (type === 'panda') return (
      <>
        <circle cx={cx - s(18)} cy={s(18)} r={s(11)} fill="#222" />
        <circle cx={cx + s(18)} cy={s(18)} r={s(11)} fill="#222" />
      </>
    )
    if (type === 'raccoon') return (
      <>
        <ellipse cx={cx - s(16)} cy={s(14)} rx={s(8)} ry={s(11)} fill={furColor} />
        <ellipse cx={cx - s(16)} cy={s(14)} rx={s(5)} ry={s(7)} fill="#555" />
        <ellipse cx={cx + s(16)} cy={s(14)} rx={s(8)} ry={s(11)} fill={furColor} />
        <ellipse cx={cx + s(16)} cy={s(14)} rx={s(5)} ry={s(7)} fill="#555" />
      </>
    )
    if (type === 'frog') return (
      <>
        <circle cx={cx - s(18)} cy={s(22)} r={s(10)} fill={furColor} />
        <circle cx={cx + s(18)} cy={s(22)} r={s(10)} fill={furColor} />
        <circle cx={cx - s(18)} cy={s(22)} r={s(5)} fill="#c0e878" />
        <circle cx={cx + s(18)} cy={s(22)} r={s(5)} fill="#c0e878" />
      </>
    )
    if (type === 'otter') return (
      <>
        <ellipse cx={cx - s(16)} cy={s(16)} rx={s(9)} ry={s(12)} fill={furColor} />
        <ellipse cx={cx - s(16)} cy={s(16)} rx={s(5)} ry={s(8)} fill="#c49a6a" />
        <ellipse cx={cx + s(16)} cy={s(16)} rx={s(9)} ry={s(12)} fill={furColor} />
        <ellipse cx={cx + s(16)} cy={s(16)} rx={s(5)} ry={s(8)} fill="#c49a6a" />
      </>
    )
    return null
  }

  const facialDetails = () => {
    if (type === 'fox') return (
      <>
        <ellipse cx={cx} cy={s(50)} rx={s(12)} ry={s(9)} fill="#fff0e0" />
        <ellipse cx={cx} cy={s(45)} rx={s(4)} ry={s(3)} fill="#d4705a" />
      </>
    )
    if (type === 'bear') return (
      <ellipse cx={cx} cy={s(52)} rx={s(11)} ry={s(8)} fill={accent} />
    )
    if (type === 'cat') return (
      <>
        <line x1={cx-s(18)} y1={s(50)} x2={cx-s(6)} y2={s(47)} stroke={furColor === '#f0f0f0' ? '#aaa' : '#fff'} strokeWidth={s(1.2)} />
        <line x1={cx-s(18)} y1={s(52)} x2={cx-s(6)} y2={s(52)} stroke={furColor === '#f0f0f0' ? '#aaa' : '#fff'} strokeWidth={s(1.2)} />
        <line x1={cx+s(18)} y1={s(50)} x2={cx+s(6)} y2={s(47)} stroke={furColor === '#f0f0f0' ? '#aaa' : '#fff'} strokeWidth={s(1.2)} />
        <line x1={cx+s(18)} y1={s(52)} x2={cx+s(6)} y2={s(52)} stroke={furColor === '#f0f0f0' ? '#aaa' : '#fff'} strokeWidth={s(1.2)} />
      </>
    )
    if (type === 'panda') return (
      <>
        <ellipse cx={cx} cy={s(52)} rx={s(11)} ry={s(8)} fill="#fff" />
      </>
    )
    if (type === 'raccoon') return (
      <>
        <ellipse cx={cx-s(11)} cy={s(44)} rx={s(7)} ry={s(5)} fill="#555" />
        <ellipse cx={cx+s(11)} cy={s(44)} rx={s(7)} ry={s(5)} fill="#555" />
      </>
    )
    return null
  }

  const tail = () => {
    if (type === 'bunny') return <circle cx={cx + s(26)} cy={s(95)} r={s(8)} fill="#fff" />
    if (type === 'fox') return (
      <path d={`M ${cx+s(26)} ${s(85)} Q ${cx+s(40)} ${s(110)} ${cx+s(30)} ${s(125)}`}
        stroke={furColor} strokeWidth={s(10)} fill="none" strokeLinecap="round" />
    )
    if (type === 'cat') return (
      <path d={`M ${cx+s(24)} ${s(90)} Q ${cx+s(50)} ${s(105)} ${cx+s(38)} ${s(130)}`}
        stroke={furColor} strokeWidth={s(7)} fill="none" strokeLinecap="round" />
    )
    if (type === 'raccoon') return (
      <path d={`M ${cx+s(24)} ${s(90)} Q ${cx+s(50)} ${s(110)} ${cx+s(36)} ${s(132)}`}
        stroke={furColor} strokeWidth={s(8)} fill="none" strokeLinecap="round"
        strokeDasharray={`${s(10)} ${s(6)}`} />
    )
    return null
  }

  const totalH = size * 1.55

  return (
    <svg width={size} height={totalH} viewBox={`0 0 ${size} ${totalH}`} style={{ display: 'block' }}>
      {/* tail (behind body) */}
      {tail()}
      {/* legs */}
      <rect x={cx-s(20)} y={s(100)} width={s(16)} height={s(32)} rx={s(8)} fill={furColor} />
      <rect x={cx+s(4)} y={s(100)} width={s(16)} height={s(32)} rx={s(8)} fill={furColor} />
      {/* shoes */}
      <ellipse cx={cx-s(12)} cy={s(133)} rx={s(12)} ry={s(7)} fill={shoe} />
      <ellipse cx={cx+s(12)} cy={s(133)} rx={s(12)} ry={s(7)} fill={shoe} />
      {/* body/outfit */}
      <rect x={cx-s(24)} y={s(62)} width={s(48)} height={s(44)} rx={s(14)} fill={outfitColor} />
      {/* outfit collar highlight */}
      <ellipse cx={cx} cy={s(63)} rx={s(12)} ry={s(5)} fill="rgba(255,255,255,0.25)" />
      {/* left arm */}
      <rect x={cx-s(40)} y={s(65)} width={s(16)} height={s(28)} rx={s(8)} fill={furColor} />
      <circle cx={cx-s(32)} cy={s(93)} r={s(9)} fill={furColor} />
      {/* right arm */}
      <rect x={cx+s(24)} y={s(65)} width={s(16)} height={s(28)} rx={s(8)} fill={furColor} />
      <circle cx={cx+s(32)} cy={s(93)} r={s(9)} fill={furColor} />
      {/* ears (drawn before head so head overlaps) */}
      {ears()}
      {/* head */}
      <circle cx={cx} cy={s(44)} r={s(26)} fill={furColor} />
      {/* facial details (muzzle, mask, etc.) */}
      {facialDetails()}
      {/* eyes */}
      <circle cx={cx-s(9)} cy={s(41)} r={s(5)} fill="#222" />
      <circle cx={cx+s(9)} cy={s(41)} r={s(5)} fill="#222" />
      <circle cx={cx-s(7)} cy={s(39)} r={s(2)} fill="white" />
      <circle cx={cx+s(11)} cy={s(39)} r={s(2)} fill="white" />
      {/* nose */}
      <ellipse cx={cx} cy={s(49)} rx={s(4)} ry={s(2.5)} fill="#e88" />
      {/* smile */}
      <path d={`M ${cx-s(6)} ${s(53)} Q ${cx} ${s(58)} ${cx+s(6)} ${s(53)}`}
        stroke="#555" strokeWidth={s(1.5)} fill="none" strokeLinecap="round" />
      {/* cheeks */}
      <ellipse cx={cx-s(17)} cy={s(51)} rx={s(6)} ry={s(4)} fill="#ffb3c8" opacity="0.45" />
      <ellipse cx={cx+s(17)} cy={s(51)} rx={s(6)} ry={s(4)} fill="#ffb3c8" opacity="0.45" />
    </svg>
  )
}

const CHAR_TYPES: { id: CharType; label: string; emoji: string }[] = [
  { id: 'bunny',   label: 'Bunny',   emoji: '🐰' },
  { id: 'fox',     label: 'Fox',     emoji: '🦊' },
  { id: 'bear',    label: 'Bear',    emoji: '🐻' },
  { id: 'cat',     label: 'Cat',     emoji: '🐱' },
  { id: 'panda',   label: 'Panda',   emoji: '🐼' },
  { id: 'raccoon', label: 'Raccoon', emoji: '🦝' },
  { id: 'frog',    label: 'Frog',    emoji: '🐸' },
  { id: 'otter',   label: 'Otter',   emoji: '🦦' },
]

// ── Profile ────────────────────────────────────────────────

const BAD_WORDS = [
  'fuck','shit','ass','bitch','cunt','dick','cock','pussy','bastard','damn','hell',
  'piss','crap','slut','whore','nigger','nigga','fag','faggot','retard','rape',
  'sex','porn','nude','naked','kill','die','hate','stupid','idiot','loser',
  'boob','butt','penis','vagina','asshole','motherfucker','fucker','bullshit',
]

function containsBadWord(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-z]/g, '')
  return BAD_WORDS.some(word => lower.includes(word))
}

type Profile = { name: string; grade: number; avatar: string; charType?: CharType; furColor?: string; outfitColor?: string }

function ProfileSetup({ onSave, initial }: { onSave: (p: Profile) => void; initial?: Profile | null }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [grade, setGrade] = useState(initial?.grade ?? 6)
  const [charType, setCharType] = useState<CharType>(initial?.charType ?? 'bunny')
  const [furColor, setFurColor] = useState(initial?.furColor ?? FUR_COLORS[0].hex)
  const [outfitColor, setOutfitColor] = useState(initial?.outfitColor ?? OUTFIT_COLORS[0].hex)
  const [nameError, setNameError] = useState('')

  function save() {
    if (!name.trim()) return
    if (containsBadWord(name)) { setNameError('Please choose an appropriate name.'); return }
    setNameError('')
    onSave({ name: name.trim(), grade, avatar: charType, charType, furColor, outfitColor })
  }

  return (
    <div className="profile-setup">
      <div className="profile-setup-title">🐾 Create Your Character</div>
      <p className="profile-setup-sub">Pick your character and make them your own!</p>

      {/* Name & Grade */}
      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div className="profile-field" style={{ flex: '1 1 160px' }}>
          <label>Your Name</label>
          <input
            className="profile-input"
            value={name}
            onKeyDown={e => e.key === 'Enter' && save()}
            onChange={e => { setName(e.target.value); setNameError('') }}
            placeholder="Enter your name..."
            autoFocus
          />
          {nameError && <p style={{ color: '#e03', fontSize: '0.82rem', margin: '0.3rem 0 0' }}>{nameError}</p>}
        </div>
        <div className="profile-field" style={{ flex: '0 0 130px' }}>
          <label>Grade</label>
          <select className="study-select" value={grade} onChange={e => setGrade(+e.target.value)}>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
        </div>
      </div>

      {/* Character preview */}
      <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Live preview */}
        <div style={{ background: 'linear-gradient(160deg,#a9cce3,#d4eaf7)', borderRadius: '16px', padding: '1rem 1.2rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '130px' }}>
          <CharacterBody type={charType} furColor={furColor} outfitColor={outfitColor} size={100} />
          {name && <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1a3a6b', marginTop: '0.4rem' }}>{name}</div>}
        </div>

        {/* Controls */}
        <div style={{ flex: 1, minWidth: '180px' }}>
          {/* Character type */}
          <div style={{ marginBottom: '0.8rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4a6fa5', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Character</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
              {CHAR_TYPES.map(ct => (
                <button
                  key={ct.id}
                  onClick={() => setCharType(ct.id)}
                  style={{
                    background: charType === ct.id ? '#4a7fff' : 'rgba(255,255,255,0.6)',
                    border: charType === ct.id ? '2px solid #4a7fff' : '1.5px solid #c8d8f0',
                    borderRadius: '10px', padding: '0.35rem 0.2rem',
                    cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.3rem' }}>{ct.emoji}</div>
                  <div style={{ fontSize: '0.55rem', color: charType === ct.id ? '#fff' : '#555', marginTop: '2px' }}>{ct.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Fur color */}
          <div style={{ marginBottom: '0.8rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4a6fa5', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fur Color</div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {FUR_COLORS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setFurColor(c.hex)}
                  title={c.label}
                  style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: c.hex,
                    border: furColor === c.hex ? '3px solid #4a7fff' : '2px solid #ccc',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Outfit color */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4a6fa5', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Outfit Color</div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {OUTFIT_COLORS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setOutfitColor(c.hex)}
                  title={c.label}
                  style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: c.hex,
                    border: outfitColor === c.hex ? '3px solid #4a7fff' : '2px solid #ccc',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <button className="gen-btn" onClick={save} disabled={!name.trim()} style={{ marginTop: '1rem' }}>
        Let's Go! 🚀
      </button>
    </div>
  )
}

function ProfileCard({ profile, points, onEdit }: { profile: Profile; points: number; onEdit: () => void }) {
  return (
    <div className="profile-card">
      <div style={{ width: '48px', height: '48px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {profile.charType
          ? <CharacterBody type={profile.charType} furColor={profile.furColor ?? '#f5deb3'} outfitColor={profile.outfitColor ?? '#e53935'} size={48} />
          : <div className="profile-avatar">{profile.avatar}</div>
        }
      </div>
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

type StackedParts = { top: string; op: string; bottom: string; kind: 'arith' | 'division' }

function parseStacked(q: string): StackedParts | null {
  // addition / subtraction: "34 + 21 = ?" or "75 − 32 = ?"
  const arith = q.match(/^(-?\d[\d,]*)\s*([+\-−])\s*(\d[\d,]*)\s*=\s*\?$/)
  if (arith) {
    const op = arith[2] === '+' ? '+' : '−'
    return { top: arith[1], op, bottom: arith[3], kind: 'arith' }
  }
  // multiplication: "3 × 4 = ?" or "12 × 11 = ?"
  const mult = q.match(/^(-?\d[\d,]*)\s*[×x\*]\s*(\d[\d,]*)\s*=\s*\?$/)
  if (mult) return { top: mult[1], op: '×', bottom: mult[2], kind: 'arith' }

  // division: "48 ÷ 6 = ?"
  const div = q.match(/^(\d[\d,]*)\s*÷\s*(\d+)\s*=\s*\?$/)
  if (div) return { top: div[1], op: '÷', bottom: div[2], kind: 'division' }

  return null
}

function StackedProblem({ q, a, explain, onCorrect }: { q: string; a: string; explain: string; onCorrect: () => void }) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong' | 'revealed'>('idle')
  const parts = parseStacked(q)!

  function check() {
    if (answersMatch(input, a)) { setStatus('correct'); onCorrect() }
    else setStatus('wrong')
  }

  const answerField = (
    status === 'idle' || status === 'wrong' ? (
      <input
        className={`stacked-input ${status === 'wrong' ? 'wrong' : ''}`}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && check()}
        placeholder="?"
        autoComplete="off"
      />
    ) : (
      <span className={`stacked-result ${status}`}>
        {status === 'correct' ? '✓ ' : '✗ '}{a}
      </span>
    )
  )

  const btns = (
    <div className="stacked-btns-wrap">
      {(status === 'idle' || status === 'wrong') && (
        <div className="stacked-btns">
          <button className="reveal-btn" onClick={check}>✓ Check</button>
          {status === 'idle'
            ? <button className="reveal-btn skip" onClick={() => { setStatus('wrong') }}>Skip</button>
            : <button className="reveal-btn skip" onClick={() => setStatus('revealed')}>Give up</button>
          }
        </div>
      )}
      {(status === 'wrong' || status === 'revealed') && (
        <div className="problem-feedback wrong" style={{ marginTop: '0.5rem' }}>
          <span className="fb-result">{status === 'revealed' ? '💡 Answer:' : '❌ Not quite —'} <strong>{a}</strong></span>
          <span className="fb-explain">{explain}</span>
        </div>
      )}
      {status === 'correct' && (
        <div className="problem-feedback correct" style={{ marginTop: '0.5rem' }}>
          <span className="fb-result">✅ Correct!</span>
          <span className="fb-explain">{explain}</span>
        </div>
      )}
    </div>
  )

  if (parts.kind === 'division') {
    // Long division: divisor ) dividend
    return (
      <div className={`problem stacked-problem ${status}`}>
        <div className="long-div">
          <span className="long-div-divisor">{parts.bottom}</span>
          <div className="long-div-bracket">
            <div className="long-div-top-line" />
            <div className="long-div-dividend">{parts.top}</div>
          </div>
          <div className="long-div-answer">{answerField}</div>
        </div>
        {btns}
      </div>
    )
  }

  // Standard stacked (add / subtract / multiply)
  const width = Math.max(parts.top.length, parts.bottom.length, 3)
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
        <div className="stacked-row stacked-answer-row">
          <span className="stacked-op-space" />
          <span style={{ minWidth: `${width}ch`, textAlign: 'right', display: 'inline-block' }}>
            {answerField}
          </span>
        </div>
      </div>
      {btns}
    </div>
  )
}

function Problem({ q, a, explain, onCorrect }: { q: string; a: string; explain: string; onCorrect: () => void }) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong' | 'revealed'>('idle')
  const [attempts, setAttempts] = useState(0)

  if (parseStacked(q)) {
    return <StackedProblem q={q} a={a} explain={explain} onCorrect={onCorrect} />
  }

  function check() {
    if (answersMatch(input, a)) {
      setStatus('correct')
      onCorrect()
    } else {
      setStatus('wrong')
      setAttempts(n => n + 1)
    }
  }

  return (
    <div className={`problem ${status}`}>
      <span className="problem-q">{q}</span>
      {status === 'correct' ? (
        <div className="problem-feedback correct">
          <span className="fb-result">✅ Correct!</span>
          <span className="fb-explain">{explain}</span>
        </div>
      ) : status === 'wrong' || status === 'revealed' ? (
        <div className="problem-feedback wrong">
          <span className="fb-result">{status === 'revealed' ? '💡 Answer:' : '❌ Not quite —'} <strong>{a}</strong></span>
          <span className="fb-explain">{explain}</span>
          {status === 'wrong' && (
            <div className="problem-input-row" style={{ marginTop: '0.4rem' }}>
              <input className="problem-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} placeholder="try again" autoFocus />
              <button className="reveal-btn" onClick={check}>✓</button>
              <button className="reveal-btn skip" onClick={() => setStatus('revealed')}>Give up</button>
            </div>
          )}
        </div>
      ) : (
        <div className="problem-input-row">
          <input className="problem-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} placeholder="your answer" />
          <button className="reveal-btn" onClick={check}>✓</button>
          {attempts === 0
            ? <button className="reveal-btn skip" onClick={() => { setStatus('wrong'); setAttempts(1) }}>Skip</button>
            : <button className="reveal-btn skip" onClick={() => setStatus('revealed')}>Give up</button>
          }
        </div>
      )}
    </div>
  )
}

// ── Shared game problem generator ──────────────────────────
function makeGameProblem(): { q: string; a: number } {
  const ops = [
    () => { const a=Math.floor(Math.random()*12)+1,b=Math.floor(Math.random()*12)+1; return {q:`${a} × ${b}`,a:a*b} },
    () => { const a=Math.floor(Math.random()*30)+10,b=Math.floor(Math.random()*30)+10; return {q:`${a} + ${b}`,a:a+b} },
    () => { const a=Math.floor(Math.random()*30)+20,b=Math.floor(Math.random()*20)+1; return {q:`${a} − ${b}`,a:a-b} },
    () => { const b=Math.floor(Math.random()*9)+2,a=b*(Math.floor(Math.random()*10)+1); return {q:`${a} ÷ ${b}`,a:a/b} },
  ]
  return ops[Math.floor(Math.random()*ops.length)]()
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Game 2: Speed Round ─────────────────────────────────────
function SpeedRound({ onClose }: { onClose: () => void }) {
  const TOTAL = 10
  const [problems] = useState(() => Array.from({length:TOTAL}, makeGameProblem))
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [wrong, setWrong] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [done, setDone] = useState(false)
  const [best, setBest] = useState(() => { try { return parseFloat(localStorage.getItem('speed-best') || '0') || null } catch { return null } })
  const startRef = useRef(Date.now())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (done) return; const t = setInterval(() => setElapsed(Date.now()-startRef.current), 100); return () => clearInterval(t) }, [done])
  useEffect(() => { inputRef.current?.focus() }, [idx])

  function submit() {
    const val = parseFloat(input.trim())
    if (Math.abs(val - problems[idx].a) < 0.01) {
      setWrong(false); setInput('')
      const next = idx + 1
      if (next >= TOTAL) {
        const secs = (Date.now()-startRef.current)/1000
        setDone(true); setElapsed(Date.now()-startRef.current)
        if (!best || secs < best) { setBest(secs); localStorage.setItem('speed-best', String(secs)) }
      } else setIdx(next)
    } else { setWrong(true) }
  }

  const secs = (elapsed/1000).toFixed(1)
  const bestStr = best ? `${best.toFixed(1)}s` : '—'

  return (
    <div className="game-overlay">
      <div className="game-header">
        <span>⚡ Speed Round</span>
        <span>{idx}/{TOTAL} done</span>
        <span>⏱ {secs}s</span>
        <span>🏆 Best: {bestStr}</span>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      {done ? (
        <div className="game-over">
          <h2>🎉 Done!</h2>
          <p>Time: <strong>{secs}s</strong></p>
          {best && parseFloat(secs) <= best && <p style={{color:'#fbbf24'}}>🏆 New best time!</p>}
          <div style={{display:'flex',gap:'1rem',marginTop:'1rem'}}>
            <button className="grade-btn active" onClick={() => { setIdx(0); setInput(''); setWrong(false); setDone(false); startRef.current=Date.now() }}>Play Again</button>
            <button className="grade-btn" onClick={onClose}>Exit</button>
          </div>
        </div>
      ) : (
        <div className="game-arena" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'2rem'}}>
          <div className="speed-progress">
            {problems.map((_,i) => <div key={i} className={`speed-dot ${i<idx?'done':i===idx?'active':''}`} />)}
          </div>
          <div className="speed-question">{problems[idx].q} = ?</div>
          <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
            <input ref={inputRef} className={`game-input ${wrong?'wrong':''}`} value={input} onChange={e=>{setInput(e.target.value);setWrong(false)}} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="Answer" autoFocus />
            <button className="grade-btn active" onClick={submit}>✓</button>
          </div>
          {wrong && <div style={{color:'#ff6b6b',fontWeight:700}}>❌ Try again!</div>}
        </div>
      )}
    </div>
  )
}

// ── Game 3: Quiz Show ───────────────────────────────────────
function QuizShow({ onClose }: { onClose: () => void }) {
  const TOTAL = 10, TIME = 20
  const [score, setScore] = useState(0)
  const [qNum, setQNum] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME)
  const [chosen, setChosen] = useState<number|null>(null)
  const [done, setDone] = useState(false)
  const [current, setCurrent] = useState(() => genQuizQ())

  function genQuizQ() {
    const {q,a} = makeGameProblem()
    const wrongs = new Set<number>()
    while(wrongs.size < 3) {
      const w = a + Math.floor(Math.random()*10)-5
      if (w !== a) wrongs.add(w)
    }
    return { q, a, choices: shuffle([a,...Array.from(wrongs)]) }
  }

  useEffect(() => {
    if (done || chosen !== null) return
    if (timeLeft <= 0) { nextQ(false); return }
    const t = setTimeout(() => setTimeLeft(s=>s-1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, done, chosen])

  function pick(c: number) {
    if (chosen !== null) return
    setChosen(c)
    if (c === current.a) setScore(s=>s+1)
    setTimeout(() => nextQ(true), 900)
  }

  function nextQ(_answered: boolean) {
    const next = qNum + 1
    if (next >= TOTAL) { setDone(true); return }
    setQNum(next); setChosen(null); setTimeLeft(TIME); setCurrent(genQuizQ())
  }

  const pct = (timeLeft/TIME)*100

  return (
    <div className="game-overlay">
      <div className="game-header">
        <span>🎯 Quiz Show</span>
        <span>Q {qNum+1}/{TOTAL}</span>
        <span>⭐ {score}</span>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      {done ? (
        <div className="game-over">
          <h2>{score>=8?'🏆 Amazing!':score>=5?'👍 Good job!':'📚 Keep practicing!'}</h2>
          <p>{score} / {TOTAL} correct</p>
          <div style={{display:'flex',gap:'1rem',marginTop:'1rem'}}>
            <button className="grade-btn active" onClick={() => { setScore(0);setQNum(0);setChosen(null);setTimeLeft(TIME);setDone(false);setCurrent(genQuizQ()) }}>Play Again</button>
            <button className="grade-btn" onClick={onClose}>Exit</button>
          </div>
        </div>
      ) : (
        <div className="quiz-arena">
          <div className="quiz-timer-bar"><div className="quiz-timer-fill" style={{width:`${pct}%`,background:pct>50?'#64ffb4':pct>25?'#fbbf24':'#ff6b6b'}} /></div>
          <div className="quiz-question">{current.q} = ?</div>
          <div className="quiz-choices">
            {current.choices.map((c,i) => (
              <button key={i}
                className={`quiz-choice ${chosen!==null?(c===current.a?'correct':c===chosen?'wrong':'dim'):''}`}
                onClick={() => pick(c)}
                disabled={chosen !== null}
              >{c}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Game 4: Number Ninja ────────────────────────────────────
function NumberNinja({ onClose }: { onClose: () => void }) {
  const TIME_PER_Q = 8
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q)
  const [flash, setFlash] = useState<'correct'|'wrong'|null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [current, setCurrent] = useState(() => genNinjaQ())

  function genNinjaQ() {
    const {q,a} = makeGameProblem()
    const wrongs = new Set<number>()
    while(wrongs.size < 2) {
      const off = Math.floor(Math.random()*8)+1
      const w = Math.random()<0.5 ? a+off : a-off
      if (w !== a && w > 0) wrongs.add(w)
    }
    return { q, a, choices: shuffle([a,...Array.from(wrongs)]) }
  }

  function next() { setCurrent(genNinjaQ()); setTimeLeft(TIME_PER_Q) }

  useEffect(() => {
    if (gameOver || flash) return
    if (timeLeft <= 0) { miss(); return }
    const t = setTimeout(() => setTimeLeft(s=>s-1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, gameOver, flash])

  function pick(c: number) {
    if (flash) return
    if (c === current.a) {
      const mult = streak >= 4 ? 3 : streak >= 2 ? 2 : 1
      setScore(s=>s+10*mult); setStreak(s=>s+1)
      setFlash('correct'); setTimeout(() => { setFlash(null); next() }, 600)
    } else {
      miss()
    }
  }

  function miss() {
    setStreak(0); setFlash('wrong')
    setLives(l => { const n=l-1; if(n<=0) setGameOver(true); return Math.max(0,n) })
    setTimeout(() => { setFlash(null); if(!gameOver) next() }, 800)
  }

  const pct = (timeLeft/TIME_PER_Q)*100

  return (
    <div className={`game-overlay ${flash==='correct'?'flash-correct':flash==='wrong'?'flash-wrong':''}`}>
      <div className="game-header">
        <span>🥷 Number Ninja</span>
        <span>⭐ {score}</span>
        <span>{streak>=2?`🔥×${streak>=4?3:2} combo!`:''}</span>
        <span>{'❤️'.repeat(lives)}</span>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      {gameOver ? (
        <div className="game-over">
          <h2>🥷 {score>=100?'Ninja Master!':score>=50?'Ninja!':'Trainee'}</h2>
          <p>Score: {score}</p>
          <div style={{display:'flex',gap:'1rem',marginTop:'1rem'}}>
            <button className="grade-btn active" onClick={() => { setScore(0);setStreak(0);setLives(3);setTimeLeft(TIME_PER_Q);setFlash(null);setGameOver(false);setCurrent(genNinjaQ()) }}>Play Again</button>
            <button className="grade-btn" onClick={onClose}>Exit</button>
          </div>
        </div>
      ) : (
        <div className="ninja-arena">
          <div className="quiz-timer-bar"><div className="quiz-timer-fill" style={{width:`${pct}%`,background:pct>60?'#64ffb4':pct>30?'#fbbf24':'#ff6b6b'}} /></div>
          <div className="ninja-question">{current.q} = ?</div>
          <div className="ninja-choices">
            {current.choices.map((c,i) => (
              <button key={i} className="ninja-choice" onClick={() => pick(c)} disabled={!!flash}>{c}</button>
            ))}
          </div>
          {streak >= 2 && <div className="ninja-combo">🔥 {streak} combo! ×{streak>=4?3:2}</div>}
        </div>
      )}
    </div>
  )
}

// ── Game Arcade ─────────────────────────────────────────────
type GameId = 'blaster' | 'speed' | 'quiz' | 'ninja'
function GameArcade({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<GameId|null>(null)

  if (active === 'blaster') return <MathGame onClose={() => setActive(null)} />
  if (active === 'speed')   return <SpeedRound onClose={() => setActive(null)} />
  if (active === 'quiz')    return <QuizShow onClose={() => setActive(null)} />
  if (active === 'ninja')   return <NumberNinja onClose={() => setActive(null)} />

  const games = [
    { id:'blaster' as GameId, icon:'💥', name:'Math Blaster', desc:'Blast falling equations before they hit the ground. 3 lives.' },
    { id:'speed'   as GameId, icon:'⚡', name:'Speed Round',  desc:'Answer 10 problems as fast as possible. Beat your best time!' },
    { id:'quiz'    as GameId, icon:'🎯', name:'Quiz Show',    desc:'10 multiple-choice questions. 20 seconds per question.' },
    { id:'ninja'   as GameId, icon:'🥷', name:'Number Ninja', desc:'3 choices, 8 seconds each. Build combos for bonus points!' },
  ]

  return (
    <div className="game-overlay">
      <div className="game-header">
        <span>🎮 Game Arcade</span>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="arcade-grid">
        {games.map(g => (
          <button key={g.id} className="arcade-card" onClick={() => setActive(g.id)}>
            <div className="arcade-icon">{g.icon}</div>
            <div className="arcade-name">{g.name}</div>
            <div className="arcade-desc">{g.desc}</div>
            <div className="arcade-play">Play →</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────
// ── Auth screen ──────────────────────────────────────────────────────────────
type AuthUser = { email: string; streak: number }

const SAMPLE_PROBLEMS = [
  { q: '34 + 47 = ?', a: '81', hint: 'Add ones: 4+7=11, carry the 1' },
  { q: '7 × 8 = ?', a: '56', hint: 'Try counting by 7s: 7,14,21...' },
  { q: '? + 15 = 40', a: '25', hint: 'Subtract: 40 − 15 = ?' },
  { q: '144 ÷ 12 = ?', a: '12', hint: '12 × 12 = 144' },
  { q: '3² + 4² = ?', a: '25', hint: '9 + 16 = ?' },
  { q: '50% of 80 = ?', a: '40', hint: 'Half of 80' },
  { q: '15 − 28 = ?', a: '-13', hint: 'Goes below zero!' },
  { q: 'x + 9 = 17, x = ?', a: '8', hint: '17 − 9 = ?' },
]

function TryItBox() {
  const [idx] = useState(() => Math.floor(Math.random() * SAMPLE_PROBLEMS.length))
  const prob = SAMPLE_PROBLEMS[idx]
  const [val, setVal] = useState('')
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [showHint, setShowHint] = useState(false)

  function check() {
    if (val.trim() === prob.a) setStatus('correct')
    else setStatus('wrong')
  }

  return (
    <div style={{ marginTop: '1.5rem', background: '#f0f5ff', borderRadius: '14px', padding: '1.1rem 1.2rem', border: '1.5px solid #c8d8f0' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4a7fff', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        ✨ Try a problem — no account needed
      </div>
      <div style={{ fontWeight: 700, color: '#1a2a6e', fontSize: '1.05rem', marginBottom: '0.7rem' }}>{prob.q}</div>

      {status === 'correct' ? (
        <div style={{ color: '#0a0', fontWeight: 700, fontSize: '1rem' }}>✅ Correct! Sign up to track your progress →</div>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={val} onChange={e => { setVal(e.target.value); setStatus('idle') }}
            onKeyDown={e => e.key === 'Enter' && check()}
            placeholder="Your answer"
            style={{ flex: 1, padding: '0.55rem 0.8rem', borderRadius: '8px', border: `1.5px solid ${status === 'wrong' ? '#e03' : '#c8d8f0'}`, fontSize: '0.95rem', outline: 'none', color: '#1a2a6e' }}
          />
          <button onClick={check} style={{ background: '#4a7fff', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.55rem 1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
            ✓
          </button>
        </div>
      )}

      {status === 'wrong' && (
        <p style={{ color: '#c00', fontSize: '0.82rem', margin: '0.4rem 0 0' }}>Not quite — try again!</p>
      )}

      {status !== 'correct' && (
        <button onClick={() => setShowHint(h => !h)} style={{ background: 'none', border: 'none', color: '#4a7fff', fontSize: '0.8rem', cursor: 'pointer', padding: '0.3rem 0 0', display: 'block' }}>
          {showHint ? '▲ Hide hint' : '💡 Show hint'}
        </button>
      )}
      {showHint && status !== 'correct' && (
        <p style={{ color: '#4a6fa5', fontSize: '0.82rem', margin: '0.3rem 0 0', fontStyle: 'italic' }}>{prob.hint}</p>
      )}
    </div>
  )
}

function AuthScreen({ onAuth }: { onAuth: (user: AuthUser, token: string) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json() as any
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      localStorage.setItem('aplus-token', data.token)
      onAuth({ email: data.email, streak: data.streak }, data.token)
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: '20px', padding: '2.5rem 2rem', width: '100%', maxWidth: '400px', boxShadow: '0 8px 40px rgba(74,127,255,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.3rem' }}>📐</div>
          <h1 style={{ color: '#1a2a6e', margin: 0, fontSize: '1.6rem' }}>A+ Mathematics</h1>
          <p style={{ color: '#4a6fa5', margin: '0.4rem 0 0', fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Welcome back! Log in to continue.' : 'Create your free account.'}
          </p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <input
            type="email" placeholder="Email address" required value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #c8d8f0', fontSize: '1rem', outline: 'none', color: '#1a2a6e' }}
          />
          <input
            type="password" placeholder="Password (6+ characters)" required value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #c8d8f0', fontSize: '1rem', outline: 'none', color: '#1a2a6e' }}
          />
          {error && <p style={{ color: '#e03', margin: 0, fontSize: '0.88rem', textAlign: 'center' }}>{error}</p>}
          <button
            type="submit" disabled={loading}
            style={{ background: '#4a7fff', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.8rem', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '1.1rem 0 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#d0dff0' }} />
          <span style={{ color: '#8aa0c0', fontSize: '0.8rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#d0dff0' }} />
        </div>

        <a href="/api/auth/google" style={{ textDecoration: 'none', display: 'block', marginTop: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', border: '1.5px solid #d0dff0', borderRadius: '10px', padding: '0.7rem', cursor: 'pointer', background: '#fff', transition: 'box-shadow 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            <span style={{ color: '#1a2a6e', fontWeight: 600, fontSize: '0.95rem' }}>Continue with Google</span>
          </div>
        </a>

        <p style={{ textAlign: 'center', margin: '1rem 0 0', fontSize: '0.9rem', color: '#4a6fa5' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            style={{ background: 'none', border: 'none', color: '#4a7fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>

        <TryItBox />
      </div>
    </div>
  )
}

const ADMIN_EMAIL = 'kiannookala@gmail.com'

function AdminPanel({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<{ email: string; created_at: number; current_streak: number; last_active: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('aplus-token')
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json() as Promise<any>)
      .then(d => { if (Array.isArray(d)) setUsers(d); else setError('Could not load users.') })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '780px', width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h2 style={{ margin: 0, color: '#1a3a6b', fontSize: '1.4rem' }}>🛡️ Admin — All Users ({users.length})</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#888' }}>✕</button>
        </div>
        {loading && <p style={{ color: '#888' }}>Loading…</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#e8f0fe', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem 0.8rem', borderRadius: '8px 0 0 8px' }}>Email</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Signed Up</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Streak</th>
                <th style={{ padding: '0.6rem 0.8rem', borderRadius: '0 8px 8px 0' }}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.email} style={{ background: i % 2 === 0 ? '#f8faff' : '#fff', borderBottom: '1px solid #e0e8f0' }}>
                  <td style={{ padding: '0.55rem 0.8rem', fontWeight: 600, color: '#2d5be3' }}>{u.email}</td>
                  <td style={{ padding: '0.55rem 0.8rem', color: '#555' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: '0.55rem 0.8rem' }}>🔥 {u.current_streak ?? 0} days</td>
                  <td style={{ padding: '0.55rem 0.8rem', color: '#555' }}>{u.last_active ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [adminClosed, setAdminClosed] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [showAuthPanel, setShowAuthPanel] = useState(false)

  useEffect(() => {
    if (!authLoading && !authUser) {
      const t = setTimeout(() => setShowAuthPanel(true), 10 * 60 * 1000)
      return () => clearTimeout(t)
    }
  }, [authLoading, authUser])

  useEffect(() => {
    // Handle Google OAuth redirect (?token=xxx)
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    if (urlToken) {
      localStorage.setItem('aplus-token', urlToken)
      window.history.replaceState({}, '', '/')
    }

    const token = urlToken || localStorage.getItem('aplus-token')
    if (!token) { setAuthLoading(false); return }
    fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json() as Promise<any>)
      .then(d => { if (d.email) { console.log('APLUS email:', d.email, '| match:', d.email === ADMIN_EMAIL); setAuthUser({ email: d.email, streak: d.streak }) } })
      .catch(() => {})
      .finally(() => setAuthLoading(false))
  }, [])

  function handleAuth(user: AuthUser, _token: string) { setAuthUser(user) }

  function handleLogout() {
    const token = localStorage.getItem('aplus-token')
    if (token) fetch('/api/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
    localStorage.removeItem('aplus-token')
    setAuthUser(null)
  }

  const [profile, setProfile] = useState<Profile | null>(() => {
    try { return JSON.parse(localStorage.getItem('aplus-profile') || 'null') } catch { return null }
  })
  const [editingProfile, setEditingProfile] = useState(false)
  const [grade, setGrade] = useState<number | null>(null)
  const [points, setPoints] = useState(() => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const saved = localStorage.getItem('aplus-points-date')
      if (saved !== today) {
        localStorage.setItem('aplus-points', '0')
        localStorage.setItem('aplus-points-date', today)
        return 0
      }
      return parseInt(localStorage.getItem('aplus-points') || '0')
    } catch { return 0 }
  })
  const [showGame, setShowGame] = useState(false)
  const [popAnim, setPopAnim] = useState(false)
  const [tab, setTab] = useState<'lessons' | 'study'>('lessons')
  const [subject, setSubject] = useState<'math' | 'reading' | 'writing' | 'geography'>('math')

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
      localStorage.setItem('aplus-points-date', new Date().toISOString().slice(0, 10))
      return next
    })
  }

  const shuffledCurriculum = useMemo(() => {
    const result: typeof curriculum = {}
    for (const gradeKey in curriculum) {
      const g = Number(gradeKey)
      result[g] = {
        ...curriculum[g],
        lessons: curriculum[g].lessons.map((lesson, i) => ({
          ...lesson,
          problems: generateLesson(g, i, 8),
        })),
      }
    }
    return result
  }, [])

  const floaters = useMemo(() => {
    const rand = seededRandom(Math.floor(Math.random() * 0xffffffff))
    const shuffled = [...expressions].sort(() => rand() - 0.5)
    return Array.from({ length: 200 }, (_, i) => ({
      text: shuffled[i % shuffled.length],
      top: rand() * 100, left: rand() * 100,
      opacity: 0.35 + rand() * 0.3,
      size: 0.65 + rand() * 0.7,
      rotate: -25 + rand() * 50,
    }))
  }, [])

  const subjectCurriculum = subject === 'math' ? shuffledCurriculum : subject === 'reading' ? readingCurriculum : subject === 'writing' ? writingCurriculum : geographyCurriculum
  const content = grade ? subjectCurriculum[grade] : null
  const pct = Math.min(100, points)
  const unlocked = points >= 100

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a7fff', fontSize: '1.2rem' }}>
        Loading...
      </div>
    )
  }

  const isGuest = !authUser

  return (
    <div className="page">
      {showGame && <GameArcade onClose={() => setShowGame(false)} />}

      {/* Auth slide-in panel */}
      {showAuthPanel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,0.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAuthPanel(false) }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <button onClick={() => setShowAuthPanel(false)} style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', background: '#fff', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', fontSize: '1rem', cursor: 'pointer', zIndex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>✕</button>
            <AuthScreen onAuth={(user, token) => { handleAuth(user, token); setShowAuthPanel(false) }} />
          </div>
        </div>
      )}

      <div className="bg">
        {floaters.map((f, i) => (
          <span key={i} className="floater" style={{ top: `${f.top}%`, left: `${f.left}%`, opacity: f.opacity, fontSize: `${f.size}rem`, transform: `rotate(${f.rotate}deg)` }}>
            {f.text}
          </span>
        ))}
      </div>

      <div className="corner-credit">Made by Kian Nookala</div>

      {/* Top bar */}
      <div style={{ position: 'fixed', top: '0.7rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.7rem', zIndex: 200 }}>
        {isGuest ? (
          <>
            <div style={{ background: 'rgba(255,255,255,0.92)', border: '1.5px solid #ffb300', borderRadius: '20px', padding: '0.35rem 0.9rem', fontSize: '0.8rem', fontWeight: 600, color: '#7a5000' }}>
              👀 Guest mode — limited access
            </div>
            <button onClick={() => setShowAuthPanel(true)} style={{ background: '#4a7fff', color: '#fff', border: 'none', borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
              Sign Up / Log In
            </button>
          </>
        ) : (
          <>
            <div style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid #ffd700', borderRadius: '20px', padding: '0.35rem 0.8rem', fontSize: '0.85rem', fontWeight: 700, color: '#b07800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              🔥 {authUser.streak}-day streak
            </div>
            <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '20px', padding: '0.35rem 0.8rem', fontSize: '0.8rem', color: '#4a6fa5' }}>
              {authUser.email}
            </div>
            <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid #c8d8f0', borderRadius: '20px', padding: '0.35rem 0.8rem', fontSize: '0.8rem', color: '#4a6fa5', cursor: 'pointer', fontWeight: 600 }}>
              Log Out
            </button>
          </>
        )}
      </div>

      {authUser?.email?.toLowerCase().includes('kiannookala') && (
        <>
          {!adminClosed && <AdminPanel onClose={() => setAdminClosed(true)} />}
          {adminClosed && (
            <div
              onClick={() => setAdminClosed(false)}
              style={{ position: 'fixed', bottom: '1rem', left: '1rem', zIndex: 300, background: 'rgba(26,58,107,0.85)', color: '#fff', borderRadius: '12px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
            >
              🛡️ Admin
            </div>
          )}
        </>
      )}

      <div className="main">
        <div className="hero-card">
          <h1 style={{ borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '0.6rem', marginBottom: '0.8rem' }}>A+ Mathematics</h1>
          <p style={{ fontSize: '0.95rem', color: '#ffffff', lineHeight: 1.7, margin: 0 }}>
            Every kid has the potential to be great at math — they just need the right practice. A+ Mathematics turns daily math into something kids actually look forward to, with instant feedback, streaks, and games that make progress feel amazing. Start today and watch your child go from confused to confident, one problem at a time.
          </p>
        </div>


        {/* Profile */}
        {!isGuest && (!profile || editingProfile) && <ProfileSetup onSave={saveProfile} initial={editingProfile ? profile : null} />}
        {!isGuest && profile && !editingProfile && <ProfileCard profile={profile} points={points} onEdit={() => setEditingProfile(true)} />}

        {/* Gate everything behind profile completion (logged-in users only) */}
        {!isGuest && (!profile || editingProfile) && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#4a6fa5', fontSize: '0.95rem' }}>
            👆 Complete your profile above to start learning!
          </div>
        )}

        {(isGuest || (profile && !editingProfile)) && (<>

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
          {!isGuest && (
            <button className={`tab-btn ${tab === 'study' ? 'active' : ''}`} onClick={() => setTab('study')}>
              🤖 AI Study Mode
            </button>
          )}
        </div>

        {tab === 'lessons' && (
          <>
            {/* Subject selector */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {[
                { id: 'math',      label: '➕ Math',      color: '#ff6b6b' },
                { id: 'reading',   label: '📖 Reading',   color: '#48dbfb' },
                { id: 'writing',   label: '✏️ Writing',   color: '#feca57' },
                { id: 'geography', label: '🌍 Geography', color: '#a29bfe' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setSubject(s.id as any)}
                  style={{
                    background: subject === s.id ? s.color : 'rgba(255,255,255,0.7)',
                    color: subject === s.id ? (s.id === 'writing' ? '#4a3200' : '#fff') : '#555',
                    border: subject === s.id ? 'none' : '1.5px solid #d0dff0',
                    borderRadius: '20px',
                    padding: '0.4rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: subject === s.id ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >{s.label}</button>
              ))}
            </div>
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
                  {(isGuest ? content.lessons.slice(0, 1) : content.lessons).map((lesson, i) => (
                    <div className="lesson-card" key={i}>
                      <div className="lesson-topic">{lesson.topic}</div>
                      <div className="lesson-desc">{lesson.description}</div>
                      <div className="problems">
                        {lesson.problems.map((p, j) => (
                          <Problem key={`${grade}-${i}-${j}`} q={p.q} a={p.a} explain={p.explain} onCorrect={addPoint} />
                        ))}
                      </div>
                    </div>
                  ))}
                  {isGuest && (
                    <div className="lesson-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', minHeight: '180px', background: 'rgba(74,127,255,0.05)', border: '2px dashed #c8d8f0' }}>
                      <div style={{ fontSize: '1.8rem' }}>🔒</div>
                      <div style={{ fontWeight: 700, color: '#1a2a6e', fontSize: '1rem' }}>2 more lessons locked</div>
                      <div style={{ color: '#4a6fa5', fontSize: '0.85rem', textAlign: 'center' }}>Sign up free to unlock all 3 lessons per grade</div>
                      <button onClick={() => setShowAuthPanel(true)} style={{ background: '#4a7fff', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.5rem 1.2rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                        Sign Up Free →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'study' && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
            <h2 style={{ color: '#4a7fff', marginBottom: '0.5rem' }}>AI Study Mode</h2>
            <p style={{ color: '#4a6fa5', fontSize: '1.1rem' }}>Coming Soon!</p>
          </div>
        )}
        </>)}

        {/* Ad card — bottom of page */}
        <a href="https://motionedu.org" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginTop: '3rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a2a6e, #2a4fff)',
            border: '1px solid #4a7fff',
            borderRadius: '16px',
            padding: '1.2rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s',
            boxShadow: '0 4px 15px rgba(74,127,255,0.3)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 25px rgba(74,127,255,0.5)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 15px rgba(74,127,255,0.3)' }}
          >
            <div style={{ fontSize: '2rem' }}>🎬</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.7rem', color: '#64ffb4', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Sponsored</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>MotionEdu</div>
              <div style={{ fontSize: '0.85rem', color: '#a0b4ff' }}>A great website to generate videos and content for your learning needs!</div>
            </div>
            <div style={{ marginLeft: 'auto', color: '#64ffb4', fontSize: '1.2rem' }}>→</div>
          </div>
        </a>
      </div>
    </div>
  )
}
