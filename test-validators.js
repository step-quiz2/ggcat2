#!/usr/bin/env node
// ════════════════════════════════════════════════════════════
// test-validators.js — Simulador d'humà per verificar validators
//
// Crea un mock de l'API GeoGebra amb la solució correcta de
// cada repte, executa el validador, i comprova que:
//   ✓  La solució correcta retorna true
//   ✗  Una escena buida retorna false
//   ✗  Una solució parcialment correcta retorna false
// ════════════════════════════════════════════════════════════

const vm  = require('vm');
const fs  = require('fs');
const path = require('path');

// ── 1. Carregar GV i VALIDATORS en un sandbox ─────────────

const cursDir = path.join(__dirname, 'curs');

const sandbox = {
  Math, console, isFinite, parseInt, parseFloat,
  NaN, Infinity, undefined, Array, Object, Error,
  ggbApplet: null          // serà assignat per cada test
};
const ctx = vm.createContext(sandbox);

// const no crea propietats al global del sandbox; cal usar this.X = X
var gvCode  = fs.readFileSync(path.join(cursDir, 'geovalidator.js'), 'utf8');
var valCode = fs.readFileSync(path.join(cursDir, 'validators.js'),   'utf8');
vm.runInContext(gvCode  + '\nthis.GV = GV;',              ctx);
vm.runInContext(valCode + '\nthis.VALIDATORS = VALIDATORS;', ctx);

const GV         = sandbox.GV;
const VALIDATORS = sandbox.VALIDATORS;

// ── 2. Fàbrica de mock GeoGebra API ──────────────────────

function createMockAPI(objects) {
  // objects: array de { name, type, x?, y?, value?, length?, midpoint?, center?, radius? }
  const byName = {};
  objects.forEach(function(o) { byName[o.name] = o; });

  const api = {
    getAllObjectNames: function(type) {
      return objects.filter(function(o) { return o.type === type; })
                    .map(function(o) { return o.name; });
    },

    getXcoord: function(label) {
      var o = byName[label];
      return o && o.x != null ? o.x : 0;
    },

    getYcoord: function(label) {
      var o = byName[label];
      return o && o.y != null ? o.y : 0;
    },

    getObjectNumber: function() { return objects.length; },

    getObjectName: function(i) {
      return i >= 0 && i < objects.length ? objects[i].name : null;
    },

    getObjectType: function(label) {
      var o = byName[label];
      return o ? o.type : '';
    },

    isDefined: function(label) { return !!byName[label]; },

    getXmax: function() { return 10; },
    getXmin: function() { return -10; },

    getValue: function(expr) {
      var m;

      // Length(name)
      m = expr.match(/^Length\((\w+)\)$/);
      if (m) {
        var o = byName[m[1]];
        return o && o.length != null ? o.length : NaN;
      }

      // x(Midpoint(name))
      m = expr.match(/^x\(Midpoint\((\w+)\)\)$/);
      if (m) {
        var o = byName[m[1]];
        return o && o.midpoint ? o.midpoint[0] : NaN;
      }

      // y(Midpoint(name))
      m = expr.match(/^y\(Midpoint\((\w+)\)\)$/);
      if (m) {
        var o = byName[m[1]];
        return o && o.midpoint ? o.midpoint[1] : NaN;
      }

      // x(Center(name))
      m = expr.match(/^x\(Center\((\w+)\)\)$/);
      if (m) {
        var o = byName[m[1]];
        return o && o.center ? o.center[0] : NaN;
      }

      // y(Center(name))
      m = expr.match(/^y\(Center\((\w+)\)\)$/);
      if (m) {
        var o = byName[m[1]];
        return o && o.center ? o.center[1] : NaN;
      }

      // Radius(name)
      m = expr.match(/^Radius\((\w+)\)$/);
      if (m) {
        var o = byName[m[1]];
        return o && o.radius != null ? o.radius : NaN;
      }

      // Distance(a,b)
      m = expr.match(/^Distance\((\w+),(\w+)\)$/);
      if (m) {
        var a = byName[m[1]], b = byName[m[2]];
        if (a && b && a.x != null && b.x != null) {
          return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
        }
        return NaN;
      }

      // ArePerpendicular / AreParallel / IsOnPath → retornem des de propietat
      // (no usat pels validators actuals, però preparat)
      m = expr.match(/^(ArePerpendicular|AreParallel|IsOnPath)\((\w+),(\w+)\)$/);
      if (m) return NaN;

      // Angle(a,b,c)
      m = expr.match(/^Angle\((\w+),(\w+),(\w+)\)$/);
      if (m) return NaN;

      // Literal name → value del objecte
      var o = byName[expr];
      if (o && o.value != null) return o.value;

      return NaN;
    }
  };

  return api;
}

// ── 3. Definició de les solucions correctes ──────────────

const CORRECT_SOLUTIONS = {

  // ── Repte 1: Triangle A(-2,-1), B(4,-1), C(1,4) + 3 segments
  'repte-1': [
    { name: 'A', type: 'point', x: -2, y: -1 },
    { name: 'B', type: 'point', x:  4, y: -1 },
    { name: 'C', type: 'point', x:  1, y:  4 },
    { name: 'f', type: 'segment', length: 6 },
    { name: 'g', type: 'segment', length: 5.83 },
    { name: 'h', type: 'segment', length: 5.83 },
  ],

  // ── Repte 2: Segment longitud 5, punt mitjà a l'eix Y
  'repte-2': [
    { name: 'A', type: 'point', x: -2.5, y: 0 },
    { name: 'B', type: 'point', x:  2.5, y: 0 },
    { name: 'f', type: 'segment', length: 5, midpoint: [0, 0] },
  ],

  // ── Repte 3: Dues circumferències concèntriques a (0,0) r=2 i r=4
  'repte-3': [
    { name: 'O', type: 'point', x: 0, y: 0 },
    { name: 'c', type: 'circle', center: [0, 0], radius: 2 },
    { name: 'd', type: 'circle', center: [0, 0], radius: 4 },
  ],

  // ── Repte 4: Triangle A(0,0) B(6,0) C(3,4) + àrea 12 + angle 53.13°
  'repte-4': [
    { name: 'A',    type: 'point',   x: 0, y: 0 },
    { name: 'B',    type: 'point',   x: 6, y: 0 },
    { name: 'C',    type: 'point',   x: 3, y: 4 },
    { name: 'f',    type: 'segment', length: 6 },
    { name: 'g',    type: 'segment', length: 5 },
    { name: 'h',    type: 'segment', length: 5 },
    { name: 'area', type: 'numeric', value: 12 },
    { name: 'alfa', type: 'angle',   value: 53.13 * Math.PI / 180 },
  ],

  // ── Repte 5: Quadrat vèrtex a (0,0) i (3,0), 4 costats de longitud 3
  'repte-5': [
    { name: 'A', type: 'point', x: 0, y: 0 },
    { name: 'B', type: 'point', x: 3, y: 0 },
    { name: 'C', type: 'point', x: 3, y: 3 },
    { name: 'D', type: 'point', x: 0, y: 3 },
    { name: 'f', type: 'segment', length: 3 },
    { name: 'g', type: 'segment', length: 3 },
    { name: 'h', type: 'segment', length: 3 },
    { name: 'i', type: 'segment', length: 3 },
  ],

  // ── Repte 6: Mediatriu (recta) + punt d'intersecció amb eix Y
  'repte-6': [
    { name: 'A',  type: 'point', x: -3, y:  2 },
    { name: 'B',  type: 'point', x:  5, y: -1 },
    { name: 'l',  type: 'line' },
    { name: 'M',  type: 'point', x: 0,  y: 1.5 },   // intersecció eix Y
  ],

  // ── Repte 7: Triangle equilàter (polígon) + costats iguals + angle 60°
  'repte-7': [
    { name: 'A',    type: 'point',   x: 0,    y: 0 },
    { name: 'B',    type: 'point',   x: 4,    y: 0 },
    { name: 'C',    type: 'point',   x: 2,    y: 3.464 },
    { name: 'p1',   type: 'polygon' },
    { name: 'f',    type: 'segment', length: 4 },
    { name: 'g',    type: 'segment', length: 4 },
    { name: 'h',    type: 'segment', length: 4 },
    { name: 'alfa', type: 'angle',   value: 60 * Math.PI / 180 },
  ],

  // ── Repte 8: Perpendicular des de P a recta f, peu a (64/17, 16/17)
  'repte-8': [
    { name: 'P',    type: 'point', x: 2,      y: 5 },
    { name: 'f',    type: 'line' },                              // recta donada
    { name: 'perp', type: 'line' },                              // perpendicular
    { name: 'F',    type: 'point', x: 64 / 17, y: 16 / 17 },   // peu
  ],

  // ── Repte 9: Circumcentre de A(0,0) B(6,0) C(2,5) → (3, 1.7)
  'repte-9': [
    { name: 'A', type: 'point', x: 0, y: 0 },
    { name: 'B', type: 'point', x: 6, y: 0 },
    { name: 'C', type: 'point', x: 2, y: 5 },
    { name: 'D', type: 'point', x: 3, y: 1.7 },   // circumcentre
  ],

  // ── Repte 10: Rombus a l'origen, 4 costats iguals, cap angle de 90°
  //    Rombus amb costat=3, angle=60°:
  //    A(0,0) B(3,0) C(3+1.5, 2.598)=(4.5, 2.598) D(1.5, 2.598)
  'repte-10': [
    { name: 'A', type: 'point', x: 0,   y: 0 },
    { name: 'B', type: 'point', x: 3,   y: 0 },
    { name: 'C', type: 'point', x: 4.5, y: 2.598 },
    { name: 'D', type: 'point', x: 1.5, y: 2.598 },
    { name: 'f', type: 'segment', length: 3 },
    { name: 'g', type: 'segment', length: 3 },
    { name: 'h', type: 'segment', length: 3 },
    { name: 'i', type: 'segment', length: 3 },
    { name: 'alfa', type: 'angle', value: 60 * Math.PI / 180 },
    { name: 'beta', type: 'angle', value: 120 * Math.PI / 180 },
  ],
};

// ── 4. Solucions incorrectes: parcials o mal fetes ───────

const WRONG_SOLUTIONS = {

  // Repte 1: Punts correctes però sense segments
  'repte-1': [
    { name: 'A', type: 'point', x: -2, y: -1 },
    { name: 'B', type: 'point', x:  4, y: -1 },
    { name: 'C', type: 'point', x:  1, y:  4 },
  ],

  // Repte 2: Segment de longitud 5 però punt mitjà fora de l'eix Y
  'repte-2': [
    { name: 'A', type: 'point', x: 0,   y: 0 },
    { name: 'B', type: 'point', x: 5,   y: 0 },
    { name: 'f', type: 'segment', length: 5, midpoint: [2.5, 0] },
  ],

  // Repte 3: Només una circumferència
  'repte-3': [
    { name: 'O', type: 'point', x: 0, y: 0 },
    { name: 'c', type: 'circle', center: [0, 0], radius: 2 },
  ],

  // Repte 4: Triangle correcte però sense àrea ni angle
  'repte-4': [
    { name: 'A', type: 'point',   x: 0, y: 0 },
    { name: 'B', type: 'point',   x: 6, y: 0 },
    { name: 'C', type: 'point',   x: 3, y: 4 },
    { name: 'f', type: 'segment', length: 6 },
    { name: 'g', type: 'segment', length: 5 },
    { name: 'h', type: 'segment', length: 5 },
  ],

  // Repte 5: Quadrat amb costats de longitud 2 (no 3)
  'repte-5': [
    { name: 'A', type: 'point', x: 0, y: 0 },
    { name: 'B', type: 'point', x: 2, y: 0 },
    { name: 'C', type: 'point', x: 2, y: 2 },
    { name: 'D', type: 'point', x: 0, y: 2 },
    { name: 'f', type: 'segment', length: 2 },
    { name: 'g', type: 'segment', length: 2 },
    { name: 'h', type: 'segment', length: 2 },
    { name: 'i', type: 'segment', length: 2 },
  ],

  // Repte 6: Recta però cap punt sobre l'eix Y (excepte A i B)
  'repte-6': [
    { name: 'A', type: 'point', x: -3, y: 2 },
    { name: 'B', type: 'point', x:  5, y: -1 },
    { name: 'l', type: 'line' },
  ],

  // Repte 7: Polígon amb costats desiguals (no equilàter)
  'repte-7': [
    { name: 'A',  type: 'point',   x: 0, y: 0 },
    { name: 'B',  type: 'point',   x: 5, y: 0 },
    { name: 'C',  type: 'point',   x: 2, y: 3 },
    { name: 'p1', type: 'polygon' },
    { name: 'f',  type: 'segment', length: 5 },
    { name: 'g',  type: 'segment', length: 3.6 },
    { name: 'h',  type: 'segment', length: 3.6 },
    { name: 'alfa', type: 'angle', value: 45 * Math.PI / 180 },
  ],

  // Repte 8: Perpendicular però peu al lloc incorrecte
  'repte-8': [
    { name: 'P',    type: 'point', x: 2, y: 5 },
    { name: 'f',    type: 'line' },
    { name: 'perp', type: 'line' },
    { name: 'F',    type: 'point', x: 3, y: 2 },   // lloc incorrecte
  ],

  // Repte 9: Punt equidistant de A i B però no de C
  'repte-9': [
    { name: 'A', type: 'point', x: 0, y: 0 },
    { name: 'B', type: 'point', x: 6, y: 0 },
    { name: 'C', type: 'point', x: 2, y: 5 },
    { name: 'D', type: 'point', x: 3, y: 0 },   // equidist de A,B però no C
  ],

  // Repte 10: Quadrat (angle 90°) en lloc de rombus
  'repte-10': [
    { name: 'A', type: 'point', x: 0, y: 0 },
    { name: 'B', type: 'point', x: 3, y: 0 },
    { name: 'C', type: 'point', x: 3, y: 3 },
    { name: 'D', type: 'point', x: 0, y: 3 },
    { name: 'f', type: 'segment', length: 3 },
    { name: 'g', type: 'segment', length: 3 },
    { name: 'h', type: 'segment', length: 3 },
    { name: 'i', type: 'segment', length: 3 },
    { name: 'alfa', type: 'angle', value: 90 * Math.PI / 180 },
  ],
};

// ── 5. Execució dels tests ──────────────────────────────

function runValidator(goalId, objects) {
  var api = createMockAPI(objects);
  sandbox.ggbApplet = api;        // GV usa ggbApplet global
  var fn = VALIDATORS[goalId];
  if (!fn) throw new Error('Validator no trobat: ' + goalId);
  try {
    return !!fn(api, GV);
  } catch (e) {
    return { error: e.message };
  }
}

// ── Formatatge ──────────────────────────────────────────

var COL = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  dim:    '\x1b[2m',
  bold:   '\x1b[1m',
};

var totalPass = 0, totalFail = 0;

function test(label, actual, expected) {
  var ok = actual === expected;
  if (ok) {
    totalPass++;
    process.stdout.write(COL.green + '    ✓ ' + COL.reset + label + '\n');
  } else {
    totalFail++;
    process.stdout.write(COL.red + '    ✗ ' + COL.reset + label +
      COL.dim + '  (esperava ' + expected + ', obtingut ' + JSON.stringify(actual) + ')' +
      COL.reset + '\n');
  }
}

// ── Llançar ─────────────────────────────────────────────

console.log('');
console.log(COL.bold + '═══════════════════════════════════════════════════' + COL.reset);
console.log(COL.bold + '  Test de validators — Simulador d\'humà          ' + COL.reset);
console.log(COL.bold + '═══════════════════════════════════════════════════' + COL.reset);
console.log('');

for (var n = 1; n <= 10; n++) {
  var id = 'repte-' + n;
  console.log(COL.cyan + COL.bold + '  ▸ ' + id + COL.reset);

  // Test 1: Solució correcta → true
  var correct = CORRECT_SOLUTIONS[id];
  test('Solució correcta → true',  runValidator(id, correct), true);

  // Test 2: Escena buida → false
  test('Escena buida → false',     runValidator(id, []),       false);

  // Test 3: Solució parcial/incorrecta → false
  var wrong = WRONG_SOLUTIONS[id];
  test('Solució incorrecta → false', runValidator(id, wrong),  false);

  console.log('');
}

// ── Resum ───────────────────────────────────────────────

console.log(COL.bold + '═══════════════════════════════════════════════════' + COL.reset);
if (totalFail === 0) {
  console.log(COL.green + COL.bold +
    '  ✓ TOTS ELS TESTS PASSEN  (' + totalPass + '/' + totalPass + ')' +
    COL.reset);
} else {
  console.log(COL.red + COL.bold +
    '  ✗ FALLADES: ' + totalFail + '/' + (totalPass + totalFail) +
    COL.reset);
}
console.log(COL.bold + '═══════════════════════════════════════════════════' + COL.reset);
console.log('');

process.exit(totalFail > 0 ? 1 : 0);
