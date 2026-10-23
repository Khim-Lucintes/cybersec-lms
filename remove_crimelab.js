const fs = require('fs');
const file = 'app/dashboard/student/page.js';
let content = fs.readFileSync(file, 'utf8');

// Remove SECTION 2: CRIME LABS SUITE VIEW
// We know it starts with `{/* SECTION 2: CRIME LABS SUITE VIEW */}`
// and ends right before `{/* SECTION 3: CASE DEFENSE FORUM */}`
content = content.replace(/\s*\{\/\* SECTION 2: CRIME LABS SUITE VIEW \*\/\}.*?(?=\{\/\* SECTION 3: CASE DEFENSE FORUM \*\/\})/s, '\n\n          ');

// Remove TAB 3: Fully Dynamic Interactive Crime Labs for ALL 8 Units
// It starts with `{/* TAB 3: Fully Dynamic Interactive Crime Labs for ALL 8 Units */}`
// and ends right before `{/* TAB 4: Quiz with Timer & Instant Explanations */}`
content = content.replace(/\s*\{\/\* TAB 3: Fully Dynamic Interactive Crime Labs for ALL 8 Units \*\/\}.*?(?=\{\/\* TAB 4: Quiz with Timer & Instant Explanations \*\/\})/s, '\n\n                    ');

fs.writeFileSync(file, content);
console.log('Removed Crime Lab sections.');
