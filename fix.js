const fs = require('fs');
const file = 'app/dashboard/MeetMario.jsx';
let c = fs.readFileSync(file, 'utf8');
const before = c;

c = c.replace('color=S.c3 label="Glucose"', 'color={S.c3} label="Glucose"');

if (c !== before) {
  fs.writeFileSync(file, c, 'utf8');
  console.log('Fixed!');
} else {
  console.log('Not found');
}
