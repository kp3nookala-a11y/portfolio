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

// ── Profile ────────────────────────────────────────────────
const AVATARS = ['🧑‍🎓','👦','👧','🧒','👨‍💻','👩‍💻','🦸','🧙','🐱','🦊','🐼','🚀']

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

type Profile = { name: string; grade: number; avatar: string }

function ProfileSetup({ onSave }: { onSave: (p: Profile) => void }) {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState(6)
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [nameError, setNameError] = useState('')
  const [photoMode, setPhotoMode] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  function save() {
    if (!name.trim()) return
    if (containsBadWord(name)) {
      setNameError('Please choose a appropriate name.')
      return
    }
    setNameError('')
    onSave({ name: name.trim(), grade, avatar })
  }

  async function openCamera() {
    setPhotoMode(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      alert('Could not access camera. Try uploading a photo instead.')
      setPhotoMode(false)
    }
  }

  function takePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = 200
    canvas.height = 200
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(videoRef.current, 0, 0, 200, 200)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
    setAvatar(dataUrl)
    stopCamera()
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setPhotoMode(false)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 200
        canvas.height = 200
        const ctx = canvas.getContext('2d')!
        const size = Math.min(img.width, img.height)
        const x = (img.width - size) / 2
        const y = (img.height - size) / 2
        ctx.drawImage(img, x, y, size, size, 0, 0, 200, 200)
        setAvatar(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const isPhoto = avatar.startsWith('data:')

  return (
    <div className="profile-setup">
      <div className="profile-setup-title">👋 Create Your Profile</div>
      <p className="profile-setup-sub">Tell us about yourself so we can personalise your learning!</p>

      <div className="profile-field">
        <label>Your Name</label>
        <input
          className="profile-input"
          value={name}
          onKeyDown={e => e.key === 'Enter' && save()}
          onChange={e => { setName(e.target.value); setNameError('') }}
          placeholder="Enter your name..."
          autoFocus
        />
        {nameError && <p style={{ color: '#e03', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>{nameError}</p>}
      </div>

      <div className="profile-field">
        <label>Your Current Grade</label>
        <select className="study-select" value={grade} onChange={e => setGrade(+e.target.value)}>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
      </div>

      <div className="profile-field">
        <label>Pick an Avatar</label>

        {/* Camera modal */}
        {photoMode && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '50%', border: '3px solid #4a7fff' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.6rem' }}>
              <button className="gen-btn" onClick={takePhoto} style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>📸 Take Photo</button>
              <button onClick={stopCamera} style={{ background: 'none', border: '1px solid #4a6fa5', color: '#4a6fa5', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Current photo preview */}
        {isPhoto && !photoMode && (
          <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
            <img src={avatar} alt="profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #4a7fff' }} />
            <div style={{ fontSize: '0.8rem', color: '#4a6fa5', marginTop: '0.3rem' }}>Photo selected ✓</div>
          </div>
        )}

        {/* Photo buttons */}
        {!photoMode && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
            <button onClick={openCamera} style={{ background: '#4a7fff', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.45rem 0.9rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
              📷 Take Photo
            </button>
            <label style={{ background: '#1a2a6e', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.45rem 0.9rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
              🖼 Upload Photo
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        )}

        {/* Emoji avatars */}
        {!photoMode && (
          <div className="avatar-grid">
            {AVATARS.map(av => (
              <button key={av} className={`avatar-btn ${avatar === av ? 'selected' : ''}`} onClick={() => setAvatar(av)}>
                {av}
              </button>
            ))}
          </div>
        )}
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
      {profile.avatar.startsWith('data:')
        ? <img src={profile.avatar} alt="avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #4a7fff' }} />
        : <div className="profile-avatar">{profile.avatar}</div>
      }
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
      .then(d => { if (d.email) setAuthUser({ email: d.email, streak: d.streak }) })
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

  const content = grade ? shuffledCurriculum[grade] : null
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

      {authUser?.email === ADMIN_EMAIL && !adminClosed && <AdminPanel onClose={() => setAdminClosed(true)} />}

      <div className="main">
        <div className="hero-card">
          <h1 style={{ borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '0.6rem', marginBottom: '0.8rem' }}>A+ Mathematics</h1>
          <p style={{ fontSize: '0.95rem', color: '#ffffff', lineHeight: 1.7, margin: 0 }}>
            Every kid has the potential to be great at math — they just need the right practice. A+ Mathematics turns daily math into something kids actually look forward to, with instant feedback, streaks, and games that make progress feel amazing. Start today and watch your child go from confused to confident, one problem at a time.
          </p>
        </div>


        {/* Profile */}
        {!isGuest && (!profile || editingProfile) && <ProfileSetup onSave={saveProfile} />}
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
