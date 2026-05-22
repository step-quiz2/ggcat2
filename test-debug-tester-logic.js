#!/usr/bin/env node
// ════════════════════════════════════════════════════════════
// test-debug-tester-logic.js — Comprovació LÒGICA de debug-tester.js
//
// No executa GeoGebra; només verifica que les solucions definides
// a TEST_SOLUTIONS (curs/debug-tester.js) tenen sentit:
//
//   1. Que hi ha entrada per a cada goalId que té validator
//      (10 capítols + 10 reptes).
//   2. Que totes les entrades tenen camps "correct" i "wrong"
//      amb almenys una comanda no buida (excepte si està buit
//      intencionadament, com en algun cas de wrong).
//   3. Mostra un resum visual.
//
// Per a la validació "end-to-end" real, cal obrir
// curs/index.html?debug=1 al navegador.
// ════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const COL = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', dim: '\x1b[2m', bold: '\x1b[1m'
};

// ── 1. Llegir el fitxer debug-tester.js i extreure TEST_SOLUTIONS ──

const srcPath = path.join(__dirname, 'curs', 'debug-tester.js');
const src = fs.readFileSync(srcPath, 'utf8');

// Cerquem l'inici de "var TEST_SOLUTIONS = {" i copiem el bloc
const startIdx = src.indexOf('var TEST_SOLUTIONS = {');
if (startIdx === -1) {
  console.error('No es troba TEST_SOLUTIONS a debug-tester.js');
  process.exit(1);
}

// Comptem claus per trobar la clau de tancament
let depth = 0, endIdx = -1, started = false;
for (let i = startIdx; i < src.length; i++) {
  const c = src[i];
  if (c === '{') { depth++; started = true; }
  else if (c === '}') {
    depth--;
    if (started && depth === 0) { endIdx = i; break; }
  }
}
if (endIdx === -1) {
  console.error('No s\'ha pogut delimitar l\'objecte TEST_SOLUTIONS');
  process.exit(1);
}

// Eval segur dins un mini context
const blockSrc = src.slice(startIdx, endIdx + 1);
// Convertim "var TEST_SOLUTIONS = {" → "({" perquè puguem fer-ne eval
const objSrc = '(' + blockSrc.replace(/^var\s+TEST_SOLUTIONS\s*=\s*/, '') + ')';
let TEST_SOLUTIONS;
try {
  TEST_SOLUTIONS = eval(objSrc);
} catch (e) {
  console.error('Error eval TEST_SOLUTIONS:', e.message);
  process.exit(1);
}

// ── 2. Llegim els goalIds esperats des de capitols.js ─────

const capitolsSrc = fs.readFileSync(path.join(__dirname, 'curs', 'capitols.js'), 'utf8');
function extractDataArray(name) {
  const m = capitolsSrc.match(new RegExp('var\\s+' + name + '\\s*=\\s*(\\[[\\s\\S]*?\\]);'));
  if (!m) return [];
  return eval(m[1]);
}
const CAPITOLS_DATA = extractDataArray('CAPITOLS_DATA');
const REPTES_DATA   = extractDataArray('REPTES_DATA');

// ── 3. Verificacions ──────────────────────────────────────

console.log('');
console.log(COL.bold + '═══════════════════════════════════════════════════' + COL.reset);
console.log(COL.bold + '  Comprovació lògica de debug-tester.js          ' + COL.reset);
console.log(COL.bold + '═══════════════════════════════════════════════════' + COL.reset);
console.log('');

let pass = 0, fail = 0;
function check(label, cond, msg) {
  if (cond) { pass++; console.log(COL.green + '  ✓ ' + COL.reset + label); }
  else { fail++; console.log(COL.red + '  ✗ ' + COL.reset + label + (msg ? COL.dim + ' — ' + msg + COL.reset : '')); }
}

// 3a. Tots els capítols tenen entrada
console.log(COL.cyan + COL.bold + '\n  ▸ Cobertura — Capítols' + COL.reset);
CAPITOLS_DATA.forEach(c => {
  if (!c.goalId) return;
  const entry = TEST_SOLUTIONS[c.goalId];
  check(
    `${c.goalId}  (${c.arxiu})`,
    !!entry && Array.isArray(entry.correct) && Array.isArray(entry.wrong),
    entry ? 'falta camp correct/wrong' : 'NO TROBAT a TEST_SOLUTIONS'
  );
});

// 3b. Tots els reptes tenen entrada
console.log(COL.cyan + COL.bold + '\n  ▸ Cobertura — Reptes' + COL.reset);
REPTES_DATA.forEach(r => {
  if (!r.goalId) return;
  const entry = TEST_SOLUTIONS[r.goalId];
  check(
    `${r.goalId}  (${r.arxiu})`,
    !!entry && Array.isArray(entry.correct) && Array.isArray(entry.wrong),
    entry ? 'falta camp correct/wrong' : 'NO TROBAT a TEST_SOLUTIONS'
  );
});

// 3c. Entrades han de tenir etiqueta i comandes
console.log(COL.cyan + COL.bold + '\n  ▸ Estructura de cada entrada' + COL.reset);
Object.keys(TEST_SOLUTIONS).forEach(goalId => {
  const e = TEST_SOLUTIONS[goalId];
  check(`${goalId}: label és string no buit`,
        typeof e.label === 'string' && e.label.length > 0);
  check(`${goalId}: correct té almenys 1 comanda`,
        e.correct && e.correct.length > 0);
  // El wrong pot tenir 0 comandes (cas vàlid: l'estat inicial ja és incorrecte),
  // però en aquest projecte sempre n'hi ha una.
  check(`${goalId}: wrong és array`,
        Array.isArray(e.wrong));
});

// 3d. Cap goalId orfe (sense pàgina corresponent)
console.log(COL.cyan + COL.bold + '\n  ▸ Cap goalId orfe' + COL.reset);
const allValidGoals = new Set([
  ...CAPITOLS_DATA.map(c => c.goalId),
  ...REPTES_DATA.map(r => r.goalId)
].filter(Boolean));
Object.keys(TEST_SOLUTIONS).forEach(g => {
  check(`${g}: existeix al curs`, allValidGoals.has(g),
        `no correspon a cap capítol o repte de capitols.js`);
});

// ── 4. Resum ──────────────────────────────────────────────

console.log('');
console.log(COL.bold + '═══════════════════════════════════════════════════' + COL.reset);
if (fail === 0) {
  console.log(COL.green + COL.bold +
    `  ✓ TOTES LES COMPROVACIONS LÒGIQUES PASSEN (${pass}/${pass})` + COL.reset);
} else {
  console.log(COL.red + COL.bold +
    `  ✗ FALLADES: ${fail}/${pass + fail}` + COL.reset);
}
console.log(COL.bold + '═══════════════════════════════════════════════════' + COL.reset);
console.log('');
console.log(COL.dim +
  '  Nota: aquesta comprovació només verifica l\'estructura.\n' +
  '  Per al test end-to-end, obre curs/index.html?debug=1 al navegador.' +
  COL.reset);
console.log('');

process.exit(fail > 0 ? 1 : 0);
