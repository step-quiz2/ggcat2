# GeoCat — Challenge Redesign: 30 Candidate Challenges

## Purpose of this document

This document is a **technical specification for an AI implementor**. The AI reading this will already have the full GeoCat project (the `ggcat-main.zip` archive) loaded in context.

The project implements all **30 challenges** listed below, distributed as **10 Fàcil + 10 Mitjà + 10 Difícil**. Challenges 1–10 are already implemented. The implementor must:

1. Create the remaining `repte-N.html` files (11–30).
2. Update the `REPTES_DATA` array in `curs/capitols.js`.
3. Ensure all validators work correctly with the GeoGebra API.

### Difficulty recalibration

The original spec had 5 Fàcil + 11 Mitjà + 14 Difícil. To reach 10+10+10:
- **Promoted to Fàcil** (from Mitjà): CH 11, 12, 13, 15, 16 — these require combining 2 chapters (Fàcil criterion) and don't chain 3+ steps.
- **Demoted to Mitjà** (from Difícil): CH 19, 20, 21, 27 — these are multi-step but don't integrate 3+ chapter concepts.
- The difficulty labels in each challenge description below reflect the **original** classification. Apply the recalibration above when setting `dificultat` in `REPTES_DATA`.

---

## Architecture Reference

### File template

Every challenge lives in `curs/repte-N.html`. Use the exact HTML skeleton from any existing repte file (e.g. `repte-7.html`). The only parts that change per challenge are:

| Slot | Where | Example |
|---|---|---|
| `<title>` | `<head>` | `Repte 3 — Triangle amb mesures \| GeoCat` |
| Header badge | `.chapter-badge` span | See Difficulty Badge Styles below |
| `<h1>` | `.chapter-header` | `Triangle amb mesures` |
| Objectiu `<p>` | First `<p>` inside `.chapter-section` | The Catalan task description |
| `data-commands` | `.geogebra` div attribute | Newline-separated GeoGebra commands for initial objects |
| `data-fixed` | `.geogebra` div attribute | Comma-separated labels to lock |
| `data-goal-id` | `.geogebra` div attribute | `repte-N` |
| `data-app` | `.geogebra` div attribute | Omit for `classic`; use `graphing` for function challenges |
| `data-height` | `.geogebra` div attribute | Always `440` |
| Hint `<details>` | After the geogebra section | Catalan hint with `<code>` for GeoGebra commands |
| Nav links | `.chapter-nav` | Previous/next repte links |
| `renderReptesSidebar(N)` | Bottom `<script>` | The 1-based challenge number |

> **Note — validators are NOT inline in the HTML.** The `.geogebra` div does **not** use a `data-check` attribute. All validator logic lives in `curs/validators.js` inside the `VALIDATORS` map (keyed by `goalId`). When adding a new challenge, add its entry to that map; do not touch the HTML for the validator.

### Difficulty badge styles

```html
<!-- Fàcil (green) -->
<span class="chapter-badge" style="background: #d1fae5; color: #065f46;">⚡ Repte N — Fàcil</span>

<!-- Mitjà (amber) -->
<span class="chapter-badge" style="background: #fef3c7; color: #92400e;">⚡ Repte N — Mitjà</span>

<!-- Difícil (red) -->
<span class="chapter-badge" style="background: #fee2e2; color: #991b1b;">⚡ Repte N — Difícil</span>
```

### REPTES_DATA entry format (in `curs/capitols.js`)

```js
{ num: N, titol: 'Short title', arxiu: 'repte-N.html', goalId: 'repte-N', dificultat: 'facil' | 'mitja' | 'dificil' }
```

### Validator constraints

Validators live in `curs/validators.js` as entries of the `VALIDATORS` object. Each entry is a named `function(api, GV)` keyed by the challenge's `goalId`:

```js
// curs/validators.js
const VALIDATORS = {
  // …existing entries…

  'repte-N': function(api, GV) {
    // return true (pass) or false (fail)
  },
};
```

Rules:

- The function signature is **`function(api, GV)`**. Both arguments are always available:
  - `api` — the live GeoGebra applet object (`window.ggbApplet`).
  - `GV` — the helper library from `geovalidator.js` (object `GV`, always present as a global).
- **Use `GV` helpers whenever possible.** They centralise tolerance logic and reduce boilerplate. Key helpers: `GV.coordsEqual(label, x, y)`, `GV.anyOfType(type, fn)`, `GV.eps` (= `0.001`, for exact float equality).
- The function must return `true` (pass) or `false` (fail).
- Never check specific user-created labels. Iterate with `api.getAllObjectNames(type)` and test properties.
- **Tolerances:**
  - For coordinate / length comparisons where `GV.coordsEqual` is not used, apply an explicit `var tol = 0.15` and compare with `Math.abs(…) < tol`.
  - For angle comparisons in degrees, use `Math.abs(deg - expected) < 1.0`.
  - `GV.eps` (0.001) is reserved for cases requiring near-exact equality (e.g. checking that a midpoint x-coordinate is exactly 0). Do **not** use `GV.eps` as the default tolerance for student constructions.
- For `api.getValue(expr)`, the expression must be a valid GeoGebra expression string.

### Key GeoGebra API methods used in validators

```
api.getAllObjectNames(type)      — returns string[] of labels; type: 'point','line','segment','conic','polygon','function','angle','vector'
api.getXcoord(label)             — x-coordinate of a point
api.getYcoord(label)             — y-coordinate of a point
api.getValue(expr)               — evaluates a GeoGebra expression (returns number)
api.isDefined(label)             — true if the object exists
api.getObjectType(label)         — returns type string
```

### Useful GeoGebra expressions for `api.getValue()`

```
Distance(A, B)                   — distance between two points
Length(s)                        — length of segment s
Angle(A, B, C)                  — angle at vertex B (radians)
Area(p)                          — area of polygon p
IsOnPath(P, obj)                 — 1 if point P lies on obj, else 0
ArePerpendicular(l1, l2)         — 1 if perpendicular
AreParallel(l1, l2)              — 1 if parallel
Midpoint(A, B)                   — midpoint (usable in expressions)
Radius(c)                        — radius of conic c
x(Center(c))                     — x-coord of center of conic c
y(Center(c))                     — y-coord of center of conic c
```

---

## The 30 Candidate Challenges

> **Note on `data-check` blocks below.** Each challenge description includes a `data-check` block showing the validator logic. This is the logic that must be placed in `curs/validators.js` as a named entry of the `VALIDATORS` object — it does **not** go into the HTML file. When implementing, translate each block from the arrow-function shorthand shown here to the `function(api, GV)` form required by `validators.js`:
>
> ```js
> // data-check block in spec (reference format):
> (api) => { … }
>
> // Actual entry in curs/validators.js:
> 'repte-N': function(api, GV) { … },
> ```
>
> The `GV` argument is always available; use its helpers (`GV.coordsEqual`, `GV.anyOfType`, `GV.eps`) to replace inline tolerance comparisons wherever practical.

### Difficulty scale rationale

- **Fàcil**: Requires combining 2 concepts from different chapters, but each step is a single command. The student must *plan* which tools to use, not just execute one command.
- **Mitjà**: Requires 3+ steps that chain together, or a concept that the chapters only taught individually but must now be applied in a new geometric context.
- **Difícil**: Requires integrating 3+ chapter concepts into a multi-step construction, discovering a geometric property, or composing transformations.

---

### CHALLENGE 1 — Triangle from scratch

**Difficulty:** Fàcil  
**Chapters used:** 1 (points) + 7 (polygons)  
**Why harder than any single chapter:** Chapter 1 only asks for one point; Chapter 7 gives pre-built points. Here the student must create 3 specific points AND build the polygon.

**Title (Catalan):** `Triangle des de zero`

**Objectiu (Catalan):**
> Crea els punts A = (−2, −1), B = (4, −1) i C = (1, 4) al pla. Després, crea el triangle (polígon tancat) format per aquests tres punts.

**data-commands:** *(empty — no pre-built objects)*  
**data-fixed:** *(empty)*

**data-check:**
```
(api) => { var pts = api.getAllObjectNames('point'); var hasA = pts.some(function(p) { return Math.abs(api.getXcoord(p) - (-2)) < 0.15 && Math.abs(api.getYcoord(p) - (-1)) < 0.15; }); var hasB = pts.some(function(p) { return Math.abs(api.getXcoord(p) - 4) < 0.15 && Math.abs(api.getYcoord(p) - (-1)) < 0.15; }); var hasC = pts.some(function(p) { return Math.abs(api.getXcoord(p) - 1) < 0.15 && Math.abs(api.getYcoord(p) - 4) < 0.15; }); var polys = api.getAllObjectNames('polygon'); return hasA && hasB && hasC && polys.length >= 1; }
```

**Hint (Catalan):**
> Escriu `A=(-2,-1)`, `B=(4,-1)` i `C=(1,4)` a la barra d'entrada (un per un). Després escriu `Polígon(A,B,C)` per crear el triangle.

---

### CHALLENGE 2 — Horizontal segment of exact length

**Difficulty:** Fàcil  
**Chapters used:** 1 (points) + 2 (segments) + 4 (length concept)  
**Why harder than any single chapter:** The student must compute the coordinates themselves to produce a segment of length exactly 5, centered at the origin.

**Title:** `Segment de longitud exacta`

**Objectiu:**
> Crea un segment horitzontal de longitud exactament 5 unitats, centrat a l'origen. Els extrems han d'estar sobre l'eix X, simètrics respecte (0, 0).

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*

**data-check:**
```
(api) => { var segs = api.getAllObjectNames('segment'); return segs.some(function(s) { var len = api.getValue('Length(' + s + ')'); return Math.abs(len - 5) < 0.15; }); }
```

**Hint:**
> Si el segment ha de tenir longitud 5 i estar centrat a l'origen, els extrems són A = (−2.5, 0) i B = (2.5, 0). Crea'ls i escriu `Segment(A,B)`.

---

### CHALLENGE 3 — Concentric circles

**Difficulty:** Fàcil  
**Chapters used:** 3 (circles, repeated with a conceptual twist)  
**Why harder than any single chapter:** Chapter 3 asks for one circle. Here the student creates two with a specific geometric relationship (same center, different radii).

**Title:** `Circumferències concèntriques`

**Objectiu:**
> Crea dues circumferències concèntriques (amb el mateix centre) a l'origen (0, 0), de radi 2 i radi 4 respectivament.

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*

**data-check:**
```
(api) => { var cs = api.getAllObjectNames('conic'); if (cs.length < 2) return false; var found2 = false; var found4 = false; for (var i = 0; i < cs.length; i++) { var cx = api.getValue('x(Center(' + cs[i] + '))'); var cy = api.getValue('y(Center(' + cs[i] + '))'); var r = api.getValue('Radius(' + cs[i] + ')'); if (Math.abs(cx) < 0.15 && Math.abs(cy) < 0.15) { if (Math.abs(r - 2) < 0.15) found2 = true; if (Math.abs(r - 4) < 0.15) found4 = true; } } return found2 && found4; }
```

**Hint:**
> Escriu `Circumferència((0,0), 2)` i després `Circumferència((0,0), 4)`. Ambdues tenen el centre a l'origen però radis diferents.

---

### CHALLENGE 4 — Triangle with area measurement

**Difficulty:** Fàcil  
**Chapters used:** 1 (points) + 7 (polygon) + 4 (measurement)  
**Why harder than any single chapter:** Two-step task: build the triangle AND measure its area. Chapter 4 measures an angle, not an area; Chapter 7 builds polygons but doesn't measure.

**Title:** `Triangle amb mesures`

**Objectiu:**
> Crea el triangle amb vèrtexs A = (0, 0), B = (6, 0) i C = (3, 4). Mesura l'àrea del triangle. L'àrea ha de ser visible com a objecte a la construcció.

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length === 0) return false; var hasArea = false; var nums = api.getAllObjectNames('numeric'); for (var i = 0; i < nums.length; i++) { var v = api.getValue(nums[i]); if (Math.abs(v - 12) < 0.3) hasArea = true; } if (!hasArea) { for (var j = 0; j < polys.length; j++) { var a = api.getValue('Area(' + polys[j] + ')'); if (Math.abs(a - 12) < 0.3) hasArea = true; } } return polys.length >= 1 && hasArea; }
```

**Hint:**
> Crea els punts i escriu `Polígon(A,B,C)`. Després escriu `Àrea(t)` (on `t` és el nom del polígon) per mesurar l'àrea. El resultat ha de ser 12.

---

### CHALLENGE 5 — Square with specific vertex and side

**Difficulty:** Fàcil  
**Chapters used:** 7 (regular polygons, with positional constraint)  
**Why harder than any single chapter:** Chapter 7 asks for a hexagon with no positional constraint. Here the student must produce a square anchored at the origin with a specific side length — requiring understanding of `PolígonRegular` parameters.

**Title:** `Quadrat a l'origen`

**Objectiu:**
> Crea un quadrat de costat 3 amb un vèrtex a l'origen (0, 0) i un altre vèrtex a (3, 0). El quadrat ha de tenir exactament 4 costats iguals.

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length === 0) return false; var pts = api.getAllObjectNames('point'); var hasOrigin = pts.some(function(p) { return Math.abs(api.getXcoord(p)) < 0.15 && Math.abs(api.getYcoord(p)) < 0.15; }); var has30 = pts.some(function(p) { return Math.abs(api.getXcoord(p) - 3) < 0.15 && Math.abs(api.getYcoord(p)) < 0.15; }); var segs = api.getAllObjectNames('segment'); var sides3 = segs.filter(function(s) { return Math.abs(api.getValue('Length(' + s + ')') - 3) < 0.15; }); return hasOrigin && has30 && sides3.length >= 4; }
```

**Hint:**
> Crea A = (0,0) i B = (3,0). Escriu `PolígonRegular(A, B, 4)` per crear un quadrat de costat 3 sobre el segment AB.

---

### CHALLENGE 6 — Midpoint and perpendicular bisector intersection

**Difficulty:** Mitjà  
**Chapters used:** 2 (midpoint) + 5 (perpendicular bisector) + intersection  
**Why harder than any single chapter:** Chapter 5 asks for a perpendicular bisector alone. Here the student must also mark the intersection with the Y-axis — a two-step construction requiring the `Intersecció` command.

**Title:** `Mediatriu i intersecció`

**Objectiu:**
> El segment AB amb A = (−4, −1) i B = (4, 3) ja està construït. Construeix la mediatriu del segment AB i marca el punt on la mediatriu talla l'eix Y.

**data-commands:**
```
A=(-4,-1)
B=(4,3)
s=Segment(A,B)
```

**data-fixed:** `A,B,s`

**data-check:**
```
(api) => { var lines = api.getAllObjectNames('line'); var hasMedb = lines.some(function(l) { var onMid = api.getValue('IsOnPath(Midpoint(A,B),' + l + ')') === 1; var perp = api.getValue('ArePerpendicular(Segment(A,B),' + l + ')') === 1; return onMid && perp; }); var pts = api.getAllObjectNames('point'); var hasYint = pts.some(function(p) { if (p === 'A' || p === 'B') return false; return Math.abs(api.getXcoord(p)) < 0.15; }); return hasMedb && hasYint; }
```

**Hint:**
> Escriu `Mediatriu(A,B)` per crear la mediatriu. Després escriu `Intersecció(mediatriu, EixY)` o `Intersecció(mediatriu, x=0)` per trobar el punt on talla l'eix Y. Alternativament, `Intersecció` amb l'eix Y.

---

### CHALLENGE 7 — Equilateral triangle with angle verification

**Difficulty:** Mitjà  
**Chapters used:** 7 (regular polygon) + 4 (angle measurement)  
**Why harder than any single chapter:** The student builds an equilateral triangle AND must verify it by measuring the three interior angles — combining construction with proof-by-measurement.

**Title:** `Equilàter comprovat`

**Objectiu:**
> Crea un triangle equilàter amb `PolígonRegular`. Després, mesura els tres angles interiors del triangle. Els tres han de ser exactament 60°.

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length === 0) return false; var angles = api.getAllObjectNames('angle'); if (angles.length < 3) return false; var count60 = 0; for (var i = 0; i < angles.length; i++) { var deg = api.getValue(angles[i]) * 180 / Math.PI; if (Math.abs(deg - 60) < 1) count60++; } return count60 >= 3; }
```

**Hint:**
> Crea dos punts A i B, i escriu `PolígonRegular(A, B, 3)`. Això crea un triangle equilàter. Després, mesura els angles interiors amb `Angle(A,B,C)`, `Angle(B,C,A)` i `Angle(C,A,B)`. Fixa't que GeoGebra mesura l'angle en el segon punt (el vèrtex).

---

### CHALLENGE 8 — Perpendicular through a point + intersection

**Difficulty:** Mitjà  
**Chapters used:** 5 (perpendicular) + intersection  
**Why harder than any single chapter:** Three-step chain: draw a line, construct the perpendicular through an external point, and mark where they meet.

**Title:** `Perpendicular i peu`

**Objectiu:**
> La recta f i el punt P = (3, 4) ja estan construïts. Crea la recta perpendicular a f que passi per P. Marca el punt d'intersecció entre f i la perpendicular (el "peu" de la perpendicular).

**data-commands:**
```
f=Line((0,0),(4,1))
P=(3,4)
```

**data-fixed:** `f,P`

**data-check:**
```
(api) => { var lines = api.getAllObjectNames('line'); var hasPerp = lines.some(function(l) { if (l === 'f') return false; var onP = api.getValue('IsOnPath(P,' + l + ')') === 1; var perp = api.getValue('ArePerpendicular(f,' + l + ')') === 1; return onP && perp; }); var pts = api.getAllObjectNames('point'); var hasFoot = pts.some(function(p) { if (p === 'P') return false; var onF = api.getValue('IsOnPath(' + p + ',f)') === 1; return onF; }); return hasPerp && hasFoot; }
```

**Hint:**
> Escriu `Perpendicular(P, f)` per crear la recta perpendicular. Després escriu `Intersecció(f, perpendicular)` per marcar el peu. El punt d'intersecció apareixerà sobre f.

---

### CHALLENGE 9 — Circumcenter (intersection of 3 perpendicular bisectors)

**Difficulty:** Mitjà  
**Chapters used:** 5 (perpendicular bisector ×3) + intersection  
**Why harder than any single chapter:** The student repeats the perpendicular bisector construction three times and discovers that all three meet at a single point. This is a genuine geometric exploration, not a single-command task.

**Title:** `El circumcentre`

**Objectiu:**
> El triangle ABC amb A = (0, 0), B = (6, 0) i C = (2, 5) ja està construït. Construeix les mediatrius dels tres costats del triangle. Marca el punt on es tallen les tres mediatrius (el circumcentre).

**data-commands:**
```
A=(0,0)
B=(6,0)
C=(2,5)
t=Polygon(A,B,C)
```

**data-fixed:** `A,B,C,t`

**data-check:**
```
(api) => { var lines = api.getAllObjectNames('line'); if (lines.length < 2) return false; var medCount = 0; for (var i = 0; i < lines.length; i++) { var l = lines[i]; var onAB = api.getValue('IsOnPath(Midpoint(A,B),' + l + ')') === 1 && api.getValue('ArePerpendicular(Segment(A,B),' + l + ')') === 1; var onBC = api.getValue('IsOnPath(Midpoint(B,C),' + l + ')') === 1 && api.getValue('ArePerpendicular(Segment(B,C),' + l + ')') === 1; var onAC = api.getValue('IsOnPath(Midpoint(A,C),' + l + ')') === 1 && api.getValue('ArePerpendicular(Segment(A,C),' + l + ')') === 1; if (onAB || onBC || onAC) medCount++; } var pts = api.getAllObjectNames('point'); var hasCenter = pts.some(function(p) { if (p==='A'||p==='B'||p==='C') return false; var x = api.getXcoord(p); var y = api.getYcoord(p); var dA = Math.sqrt(x*x + y*y); var dB = Math.sqrt((x-6)*(x-6) + y*y); var dC = Math.sqrt((x-2)*(x-2) + (y-5)*(y-5)); return Math.abs(dA - dB) < 0.2 && Math.abs(dB - dC) < 0.2; }); return medCount >= 2 && hasCenter; }
```

**Hint:**
> Construeix les mediatrius: `Mediatriu(A,B)`, `Mediatriu(B,C)` i `Mediatriu(A,C)`. Veuràs que les tres rectes es tallen en un únic punt. Marca'l amb `Intersecció(mediatriu1, mediatriu2)`. Aquest punt és equidistant dels tres vèrtexs.

---

### CHALLENGE 10 — Rhombus (not a square)

**Difficulty:** Mitjà  
**Chapters used:** 1 (points with calculation) + 7 (polygon) + 4 (distance concept)  
**Why harder than any single chapter:** The student cannot use `PolígonRegular` directly. They must plan coordinates for 4 points that give equal sides but non-right angles.

**Title:** `El rombus`

**Objectiu:**
> Crea un rombus: un quadrilàter amb els quatre costats de la mateixa longitud, però que NO sigui un quadrat (els angles no han de ser de 90°). El rombus ha de tenir almenys un vèrtex a l'origen.

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length === 0) return false; var segs = api.getAllObjectNames('segment'); if (segs.length < 4) return false; var lens = segs.map(function(s) { return api.getValue('Length(' + s + ')'); }).filter(function(l) { return l > 0.1; }); if (lens.length < 4) return false; lens.sort(function(a,b) { return a-b; }); for (var i = 0; i <= lens.length - 4; i++) { var allEq = Math.abs(lens[i] - lens[i+3]) < 0.15; if (!allEq) continue; var angles = api.getAllObjectNames('angle'); var has90 = false; for (var j = 0; j < angles.length; j++) { var deg = api.getValue(angles[j]) * 180 / Math.PI; if (Math.abs(deg - 90) < 1) has90 = true; } if (!has90) return true; } return false; }
```

**Hint:**
> Un rombus fàcil: pensa en un "diamant" allargat. Per exemple: A = (0,0), B = (3,1), C = (4,4), D = (1,3). Comprova que les distàncies AB, BC, CD i DA siguin iguals. Crea'ls i escriu `Polígon(A,B,C,D)`.

---

### CHALLENGE 11 — Two parallel lines with measured distance

**Difficulty:** Mitjà  
**Chapters used:** 6 (parallel) + 4 (distance measurement)  
**Why harder than any single chapter:** The chapter asks for one parallel. Here: two parallels at specific distances, plus a measurement step.

**Title:** `Paral·leles a distància`

**Objectiu:**
> La recta f (que passa per l'origen amb pendent 1) ja està construïda. Crea dues rectes paral·leles a f que passin pels punts P = (0, 2) i Q = (0, −3) respectivament.

**data-commands:**
```
f=Line((0,0),(1,1))
P=(0,2)
Q=(0,-3)
```

**data-fixed:** `f,P,Q`

**data-check:**
```
(api) => { var lines = api.getAllObjectNames('line'); var parP = false; var parQ = false; for (var i = 0; i < lines.length; i++) { var l = lines[i]; if (l === 'f') continue; var par = api.getValue('AreParallel(f,' + l + ')') === 1; if (!par) continue; var onP = api.getValue('IsOnPath(P,' + l + ')') === 1; var onQ = api.getValue('IsOnPath(Q,' + l + ')') === 1; if (onP) parP = true; if (onQ) parQ = true; } return parP && parQ; }
```

**Hint:**
> Escriu `Recta(P, f)` per crear una recta paral·lela a f passant per P (la comanda `Recta` amb un punt i una recta crea la paral·lela). Repeteix amb Q: `Recta(Q, f)`.

---

### CHALLENGE 12 — Right triangle + Pythagorean check

**Difficulty:** Mitjà  
**Chapters used:** 1 (points) + 7 (polygon) + 4 (measurement) + Pythagoras  
**Why harder than any single chapter:** Build a right triangle on the axes and verify the Pythagorean theorem — the measurement serves as a mathematical proof, not just a number.

**Title:** `Pitàgores visual`

**Objectiu:**
> Crea un triangle rectangle amb els catets sobre els eixos: vèrtexs A = (0, 0), B = (4, 0) i C = (0, 3). Mesura les longituds dels tres costats. La hipotenusa ha de mesurar 5.

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length === 0) return false; var pts = api.getAllObjectNames('point'); var hasA = pts.some(function(p) { return Math.abs(api.getXcoord(p)) < 0.15 && Math.abs(api.getYcoord(p)) < 0.15; }); var hasB = pts.some(function(p) { return Math.abs(api.getXcoord(p)-4) < 0.15 && Math.abs(api.getYcoord(p)) < 0.15; }); var hasC = pts.some(function(p) { return Math.abs(api.getXcoord(p)) < 0.15 && Math.abs(api.getYcoord(p)-3) < 0.15; }); var segs = api.getAllObjectNames('segment'); var has5 = segs.some(function(s) { return Math.abs(api.getValue('Length(' + s + ')') - 5) < 0.15; }); return hasA && hasB && hasC && has5; }
```

**Hint:**
> Crea els punts A=(0,0), B=(4,0) i C=(0,3). Escriu `Polígon(A,B,C)`. Mesura els costats amb `Distància(A,B)`, `Distància(B,C)` i `Distància(A,C)`. Hauries d'obtenir 4, 3 i 5. Comprova: 3² + 4² = 9 + 16 = 25 = 5².

---

### CHALLENGE 13 — Translation + length verification

**Difficulty:** Mitjà  
**Chapters used:** 8 (translation) + 4 (length measurement)  
**Why harder than any single chapter:** Chapter 8 only asks for the transformation. Here the student must also verify a geometric property (lengths preserved) — connecting transformation with measurement.

**Title:** `Translació verificada`

**Objectiu:**
> El triangle t i el vector v = (4, 2) ja estan construïts. Crea la imatge del triangle per la translació de vector v. El triangle resultant ha de tenir la mateixa àrea que l'original.

**data-commands:**
```
A=(0,0)
B=(3,0)
C=(1,3)
t=Polygon(A,B,C)
v=Vector((0,0),(4,2))
```

**data-fixed:** `A,B,C,t,v`

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length < 2) return false; var origArea = api.getValue('Area(t)'); var found = false; for (var i = 0; i < polys.length; i++) { if (polys[i] === 't') continue; var a = api.getValue('Area(' + polys[i] + ')'); if (Math.abs(a - origArea) < 0.3) found = true; } var pts = api.getAllObjectNames('point'); var hasTransA = pts.some(function(p) { if (p==='A'||p==='B'||p==='C') return false; return Math.abs(api.getXcoord(p)-4) < 0.2 && Math.abs(api.getYcoord(p)-2) < 0.2; }); return found && hasTransA; }
```

**Hint:**
> Escriu `Translació(t, v)` per crear la imatge del triangle. GeoGebra generarà automàticament el triangle traslladat. Pots comprovar les àrees amb `Àrea(t)` i `Àrea(t')` (on t' és el nom del nou polígon).

---

### CHALLENGE 14 — Pentagon + diagonals

**Difficulty:** Mitjà  
**Chapters used:** 7 (regular polygon) + 2 (segments)  
**Why harder than any single chapter:** Builds a regular polygon and then requires manual construction of all diagonals — connecting vertices in a systematic way.

**Title:** `Estrelles del pentàgon`

**Objectiu:**
> Crea un pentàgon regular. Dibuixa totes les diagonals del pentàgon (segments que uneixen vèrtexs no adjacents). Un pentàgon té exactament 5 diagonals.

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length === 0) return false; var pts = api.getAllObjectNames('point'); if (pts.length < 5) return false; var segs = api.getAllObjectNames('segment'); return segs.length >= 10; }
```

**Hint:**
> Crea dos punts A i B i escriu `PolígonRegular(A,B,5)`. Apareixeran 5 vèrtexs (A, B, C, D, E). Les diagonals són: Segment(A,C), Segment(A,D), Segment(B,D), Segment(B,E), Segment(C,E). Un pentàgon regular té 5 costats + 5 diagonals = 10 segments en total.

---

### CHALLENGE 15 — Parabola + X-axis intersections

**Difficulty:** Mitjà  
**Chapters used:** 9 (functions) + intersection concept  
**Why harder than any single chapter:** Chapter 9 gives the function formula. Here the student must define a quadratic AND find both roots — one more step and one more concept.

**Title:** `Arrels de la paràbola`

**Objectiu:**
> Defineix la funció f(x) = x² − 4. Marca els dos punts on la paràbola talla l'eix X (les arrels de l'equació x² − 4 = 0).

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*  
**data-app:** `graphing`

**data-check:**
```
(api) => { var fns = api.getAllObjectNames('function'); var hasF = fns.some(function(fn) { return Math.abs(api.getValue(fn + '(0)') - (-4)) < 0.15 && Math.abs(api.getValue(fn + '(2)')) < 0.15; }); var pts = api.getAllObjectNames('point'); var hasPos = pts.some(function(p) { return Math.abs(api.getXcoord(p) - 2) < 0.15 && Math.abs(api.getYcoord(p)) < 0.15; }); var hasNeg = pts.some(function(p) { return Math.abs(api.getXcoord(p) - (-2)) < 0.15 && Math.abs(api.getYcoord(p)) < 0.15; }); return hasF && hasPos && hasNeg; }
```

**Hint:**
> Escriu `f(x) = x^2 - 4` a la barra d'entrada. Les arrels són on f(x)=0, és a dir x²=4, x=±2. Marca'ls: `(2, 0)` i `(-2, 0)`, o usa `Intersecció(f, EixX)`.

---

### CHALLENGE 16 — Isosceles triangle + axis of symmetry

**Difficulty:** Mitjà  
**Chapters used:** 7 (polygon) + 5 (perpendicular bisector) + geometric property  
**Why harder than any single chapter:** Builds a specific triangle and verifies a non-trivial geometric property: the perpendicular bisector of the base passes through the apex.

**Title:** `Isòsceles i simetria`

**Objectiu:**
> Crea un triangle isòsceles amb base BC sobre l'eix X, simètrica respecte l'origen: B = (−3, 0) i C = (3, 0), i vèrtex A = (0, 5). Construeix la mediatriu de BC i comprova que passa per A.

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length === 0) return false; var pts = api.getAllObjectNames('point'); var hasA = pts.some(function(p) { return Math.abs(api.getXcoord(p)) < 0.15 && Math.abs(api.getYcoord(p)-5) < 0.15; }); var lines = api.getAllObjectNames('line'); var hasMed = lines.some(function(l) { var vertical = api.getValue('ArePerpendicular(' + l + ',y=0)') === 1; var onZero = api.getValue('IsOnPath((0,0),' + l + ')') === 1; return vertical && onZero; }); return hasA && polys.length >= 1 && hasMed; }
```

**Hint:**
> Crea B=(−3,0), C=(3,0) i A=(0,5). Escriu `Polígon(A,B,C)`. Després `Mediatriu(B,C)`. Veuràs que la mediatriu passa per A! Això és una propietat dels triangles isòsceles: l'eix de simetria és la mediatriu de la base.

---

### CHALLENGE 17 — Incenter (intersection of 3 angle bisectors)

**Difficulty:** Difícil  
**Chapters used:** 6 (bisector concept) × 3 + intersection  
**Why harder than any single chapter:** The student must construct three angle bisectors and discover they are concurrent — the mirror challenge to the circumcenter (Challenge 9).

**Title:** `L'incentre`

**Objectiu:**
> El triangle ABC amb A = (0, 0), B = (8, 0) i C = (3, 6) ja està construït. Construeix les bisectrius dels tres angles interiors del triangle. Marca el punt on es tallen (l'incentre).

**data-commands:**
```
A=(0,0)
B=(8,0)
C=(3,6)
t=Polygon(A,B,C)
```

**data-fixed:** `A,B,C,t`

**data-check:**
```
(api) => { var lines = api.getAllObjectNames('line'); if (lines.length < 2) return false; var pts = api.getAllObjectNames('point'); var hasIncenter = pts.some(function(p) { if (p==='A'||p==='B'||p==='C') return false; return Math.abs(api.getXcoord(p) - 3.45) < 0.25 && Math.abs(api.getYcoord(p) - 2.13) < 0.25; }); return lines.length >= 2 && hasIncenter; }
```

**Hint:**
> Construeix les bisectrius dels angles: `Bisectriu(B,A,C)`, `Bisectriu(A,B,C)` i `Bisectriu(A,C,B)`. Nota: `Bisectriu(P,Q,R)` crea la bisectriu de l'angle en Q. Les tres es tallen en un punt: marca'l amb `Intersecció`. Aquest punt és l'incentre, equidistant dels tres costats.

---

### CHALLENGE 18 — Circumscribed circle (full construction)

**Difficulty:** Difícil  
**Chapters used:** 5 (perpendicular bisector) + 3 (circle) + intersection  
**Why harder than any single chapter:** Multi-step: perpendicular bisectors → circumcenter → circle through vertices. This is the existing repte-12, refined with clearer instructions.

**Title:** `Cercle circumscrit`

**Objectiu:**
> El triangle ABC amb A = (0, 4), B = (−3, 0) i C = (3, 0) ja està construït. Construeix la circumferència circumscrita: la circumferència que passa pels tres vèrtexs del triangle. Has de trobar el centre (intersecció de mediatrius) i dibuixar la circumferència.

**data-commands:**
```
A=(0,4)
B=(-3,0)
C=(3,0)
t=Polygon(A,B,C)
```

**data-fixed:** `A,B,C,t`

**data-check:**
```
(api) => { var cs = api.getAllObjectNames('conic'); return cs.some(function(c) { return api.getValue('IsOnPath(A,' + c + ')') === 1 && api.getValue('IsOnPath(B,' + c + ')') === 1 && api.getValue('IsOnPath(C,' + c + ')') === 1; }); }
```

**Hint:**
> Hi ha dues maneres. La directa: `CercleCircumscrit(t)`. La geomètrica (més educativa): construeix `Mediatriu(A,B)` i `Mediatriu(B,C)`. Marca la seva intersecció: `O = Intersecció(mediatriu1, mediatriu2)`. Finalment, `Circumferència(O, Distància(O,A))`.

---

### CHALLENGE 19 — Chained transformations (reflection + translation)

**Difficulty:** Difícil  
**Chapters used:** 8 (reflection + translation chained)  
**Why harder than any single chapter:** Chapter 8 asks for a single transformation. Here the student must compose two, understanding that order matters and that each operates on the output of the previous.

**Title:** `Transformacions encadenades`

**Objectiu:**
> El triangle t amb vèrtexs A = (1, 1), B = (3, 1) i C = (2, 3) i l'eix de reflexió f (l'eix Y) ja estan construïts. Primer, reflexa el triangle respecte f. Després, trasllada la reflexió amb el vector v = (5, 0). El resultat final ha de ser un triangle amb vèrtexs propers a (4, 1), (2, 1) i (3, 3).

**data-commands:**
```
A=(1,1)
B=(3,1)
C=(2,3)
t=Polygon(A,B,C)
f=Line((0,0),(0,1))
v=Vector((0,0),(5,0))
```

**data-fixed:** `A,B,C,t,f,v`

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length < 3) return false; var pts = api.getAllObjectNames('point'); var target = [[4,1],[2,1],[3,3]]; var found = 0; for (var k = 0; k < target.length; k++) { for (var i = 0; i < pts.length; i++) { if (pts[i]==='A'||pts[i]==='B'||pts[i]==='C') continue; if (Math.abs(api.getXcoord(pts[i])-target[k][0]) < 0.3 && Math.abs(api.getYcoord(pts[i])-target[k][1]) < 0.3) { found++; break; } } } return found >= 3; }
```

**Hint:**
> Primer: `Reflexió(t, f)` per obtenir el triangle reflectit (vèrtexs a (-1,1), (-3,1), (-2,3)). Després: `Translació(reflexió, v)` per moure'l 5 unitats a la dreta. El resultat tindrà vèrtexs a (4,1), (2,1) i (3,3). Nota: la reflexió respecte l'eix Y canvia el signe de la coordenada x.

---

### CHALLENGE 20 — Square diagonals: midpoint and right angle

**Difficulty:** Difícil  
**Chapters used:** 7 (polygon) + 2 (segment/midpoint) + 4 (angle measurement) + 5 (perpendicularity)  
**Why harder than any single chapter:** Four-concept integration: build the square, draw diagonals, verify they bisect each other, and verify they form right angles.

**Title:** `Diagonals del quadrat`

**Objectiu:**
> Crea un quadrat amb PolígonRegular: vèrtexs base A = (0, 0) i B = (4, 0). Dibuixa les dues diagonals del quadrat. Marca el punt d'intersecció de les diagonals i mesura l'angle que formen. Ha de ser 90°.

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length === 0) return false; var segs = api.getAllObjectNames('segment'); if (segs.length < 6) return false; var angles = api.getAllObjectNames('angle'); var has90 = false; for (var i = 0; i < angles.length; i++) { var deg = api.getValue(angles[i]) * 180 / Math.PI; if (Math.abs(deg - 90) < 1) has90 = true; } var pts = api.getAllObjectNames('point'); var hasCenter = pts.some(function(p) { return Math.abs(api.getXcoord(p) - 2) < 0.2 && Math.abs(api.getYcoord(p) - 2) < 0.2; }); return has90 && hasCenter; }
```

**Hint:**
> Escriu `PolígonRegular((0,0),(4,0),4)`. Apareixeran 4 vèrtexs (A, B, C, D). Les diagonals són `Segment(A,C)` i `Segment(B,D)`. El punt d'intersecció: `Intersecció(diagonal1, diagonal2)`. Mesura l'angle: `Angle(A, intersecció, B)`.

---

### CHALLENGE 21 — Parabola and line: find intersections

**Difficulty:** Difícil  
**Chapters used:** 9 (functions ×2) + intersection  
**Why harder than any single chapter:** Chapter 9 defines one function and finds one intersection. Here: two functions (different types) and two intersection points — algebraic thinking required.

**Title:** `Paràbola i recta`

**Objectiu:**
> Defineix la funció f(x) = x² i la recta g(x) = x + 2. Marca els dos punts d'intersecció de les dues gràfiques.

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*  
**data-app:** `graphing`

**data-check:**
```
(api) => { var fns = api.getAllObjectNames('function'); if (fns.length < 2) return false; var pts = api.getAllObjectNames('point'); var hasP1 = pts.some(function(p) { return Math.abs(api.getXcoord(p) - 2) < 0.15 && Math.abs(api.getYcoord(p) - 4) < 0.15; }); var hasP2 = pts.some(function(p) { return Math.abs(api.getXcoord(p) - (-1)) < 0.15 && Math.abs(api.getYcoord(p) - 1) < 0.15; }); return hasP1 && hasP2; }
```

**Hint:**
> Escriu `f(x) = x^2` i `g(x) = x + 2` a la barra d'entrada. Per trobar les interseccions, escriu `Intersecció(f, g)`. Algebraicament: x² = x + 2 → x² − x − 2 = 0 → (x−2)(x+1) = 0 → x = 2 i x = −1. Els punts són (2, 4) i (−1, 1).

---

### CHALLENGE 22 — Notable points of equilateral triangle coincide

**Difficulty:** Difícil  
**Chapters used:** 5 (perpendicular bisector) + 6 (bisector) + 2 (midpoint/median) + 7 (polygon)  
**Why harder than any single chapter:** Integrates three different center constructions and verifies a beautiful geometric property: all notable centers coincide in an equilateral triangle.

**Title:** `Centres del triangle equilàter`

**Objectiu:**
> Crea un triangle equilàter amb `PolígonRegular`. Construeix el circumcentre (intersecció de mediatrius), l'incentre (intersecció de bisectrius) i el baricentre (intersecció de mitjanes). Verifica que els tres punts coincideixen.

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length === 0) return false; var segs = api.getAllObjectNames('segment'); var lens = segs.map(function(s){return api.getValue('Length('+s+')');}).filter(function(l){return l>0.5;}); if (lens.length < 3) return false; var isEquil = Math.abs(lens[0]-lens[1])<0.15 && Math.abs(lens[1]-lens[2])<0.15; if (!isEquil) return false; var pts = api.getAllObjectNames('point'); var centers = pts.filter(function(p) { for (var j=0; j<pts.length; j++) { if (pts[j]===p) continue; if (api.getValue('Distance('+p+','+pts[j]+')')<0.3) return false; } return true; }); if (centers.length < 2) return false; var x0=api.getXcoord(centers[0]), y0=api.getYcoord(centers[0]); return centers.every(function(c){ return Math.abs(api.getXcoord(c)-x0)<0.25 && Math.abs(api.getYcoord(c)-y0)<0.25; }); }
```

**Hint:**
> Crea el triangle: `PolígonRegular(A,B,3)`. Circumcentre: `Intersecció(Mediatriu(A,B), Mediatriu(B,C))`. Baricentre: marca els punts mitjos M1=`PuntMig(A,B)`, M2=`PuntMig(B,C)`, i `Intersecció(Segment(A,M2), Segment(B,M1))` (o usa `Intersecció(Segment(C,M1), Segment(A,M2))`). Incentre: `Intersecció(Bisectriu(B,A,C), Bisectriu(A,B,C))`. Tots tres haurien de ser el mateix punt!

---

### CHALLENGE 23 — Right triangle + circumscribed circle (Thales' theorem)

**Difficulty:** Difícil  
**Chapters used:** 3 (circle) + 5 (perpendicular bisector) + 2 (midpoint) + 7 (polygon)  
**Why harder than any single chapter:** Combines construction with theorem verification: the hypotenuse of a right triangle is a diameter of its circumscribed circle.

**Title:** `Teorema de Tales`

**Objectiu:**
> Crea el triangle rectangle ABC amb A = (−3, 0), B = (3, 0) i C = (0, 3). La hipotenusa és AB. Construeix la circumferència circumscrita i comprova que el centre de la circumferència és el punt mig de la hipotenusa AB.

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length === 0) return false; var cs = api.getAllObjectNames('conic'); var circOk = cs.some(function(c) { return api.getValue('IsOnPath(A,' + c + ')') === 1 && api.getValue('IsOnPath(B,' + c + ')') === 1 && api.getValue('IsOnPath(C,' + c + ')') === 1; }); if (!circOk) return false; var pts = api.getAllObjectNames('point'); var hasCenter = pts.some(function(p) { if (p==='A'||p==='B'||p==='C') return false; return Math.abs(api.getXcoord(p)) < 0.15 && Math.abs(api.getYcoord(p)) < 0.15; }); return hasCenter; }
```

**Hint:**
> Crea els punts i el polígon. La hipotenusa AB va de (−3,0) a (3,0), el punt mig és (0,0). Construeix la circumferència circumscrita: `CercleCircumscrit(t)` o calcula-la manualment. Observa que el centre cau a l'origen, que és el punt mig de AB! Marca'l amb `PuntMig(A,B)`. Verificació: CA=(−3,−3), CB=(3,−3), producte escalar = −9+9 = 0 ✓ (angle recte en C).

---

### CHALLENGE 24 — Sine and cosine intersection

**Difficulty:** Difícil  
**Chapters used:** 9 (functions — trigonometric extension)  
**Why harder than any single chapter:** Works with transcendental functions and multiple intersection points in a range — a genuine algebraic/graphical analysis challenge.

**Title:** `Sinus i cosinus`

**Objectiu:**
> Defineix les funcions f(x) = sin(x) i g(x) = cos(x). Marca almenys 2 punts d'intersecció de les dues gràfiques.

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*  
**data-app:** `graphing`

**data-check:**
```
(api) => { var fns = api.getAllObjectNames('function'); if (fns.length < 2) return false; var pts = api.getAllObjectNames('point'); var intCount = 0; for (var i = 0; i < pts.length; i++) { var x = api.getXcoord(pts[i]); var y = api.getYcoord(pts[i]); if (Math.abs(Math.sin(x) - Math.cos(x)) < 0.15 && Math.abs(y - Math.sin(x)) < 0.15) intCount++; } return intCount >= 2; }
```

**Hint:**
> Escriu `f(x) = sin(x)` i `g(x) = cos(x)`. Després `Intersecció(f, g)`. GeoGebra trobarà automàticament les interseccions visibles. sin(x)=cos(x) quan x = π/4 + nπ. Les primeres interseccions positives estan a x ≈ 0.785 i x ≈ 3.927.

---

### CHALLENGE 25 — Hexagon inscribed in circle

**Difficulty:** Difícil  
**Chapters used:** 7 (regular polygon) + 3 (circle) + geometric constraint  
**Why harder than any single chapter:** The student must build a regular hexagon that is inscribed in a pre-existing circle — requiring understanding of the relationship between polygon side and circumradius.

**Title:** `Hexàgon inscrit`

**Objectiu:**
> La circumferència c de radi 3 centrada a l'origen ja està construïda. Crea un hexàgon regular inscrit a la circumferència: els 6 vèrtexs del hexàgon han de caure exactament sobre la circumferència.

**data-commands:**
```
O=(0,0)
c=Circle(O,3)
```

**data-fixed:** `O,c`

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length === 0) return false; var pts = api.getAllObjectNames('point'); var onCircle = 0; for (var i = 0; i < pts.length; i++) { if (pts[i] === 'O') continue; if (api.getValue('IsOnPath(' + pts[i] + ',c)') === 1) onCircle++; } return onCircle >= 6; }
```

**Hint:**
> Per un hexàgon regular inscrit en un cercle de radi r, el costat del hexàgon és exactament r. Crea un punt sobre la circumferència, per exemple A = (3, 0). Escriu `PolígonRegular(A, (3cos(60°), 3sin(60°)), 6)`. O, més senzill: `A=(3,0)` i `PolígonRegular(A, Gira(A, 60°, O), 6)`. El truc és que el costat d'un hexàgon inscrit és igual al radi!

---

### CHALLENGE 26 — Medial triangle (1/4 area property)

**Difficulty:** Difícil  
**Chapters used:** 2 (midpoint) + 7 (polygon) + 4 (area measurement) + geometric property  
**Why harder than any single chapter:** Multi-step construction + verification of a classical theorem: the medial triangle has exactly 1/4 the area of the original.

**Title:** `Triangle medial`

**Objectiu:**
> El triangle ABC amb A = (0, 0), B = (8, 0) i C = (2, 6) ja està construït. Marca els punts mitjos dels tres costats. Uneix-los per formar el triangle medial. L'àrea del triangle medial ha de ser exactament 1/4 de l'àrea de l'original.

**data-commands:**
```
A=(0,0)
B=(8,0)
C=(2,6)
t=Polygon(A,B,C)
```

**data-fixed:** `A,B,C,t`

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length < 2) return false; var origArea = api.getValue('Area(t)'); var found = false; for (var i = 0; i < polys.length; i++) { if (polys[i] === 't') continue; var a = api.getValue('Area(' + polys[i] + ')'); if (Math.abs(a - origArea / 4) < 0.5) found = true; } return found; }
```

**Hint:**
> Calcula els punts mitjos: `M1 = PuntMig(A,B)`, `M2 = PuntMig(B,C)`, `M3 = PuntMig(A,C)`. Crea el triangle medial: `Polígon(M1, M2, M3)`. Mesura les àrees: `Àrea(t)` i `Àrea(medial)`. L'àrea del medial ha de ser exactament 1/4 de l'original (24 / 4 = 6).

---

### CHALLENGE 27 — Reflection across a non-axis line

**Difficulty:** Difícil  
**Chapters used:** 8 (reflection) + 4 (area) + non-standard axis  
**Why harder than any single chapter:** Chapter 8 uses the Y-axis as reflection line. Here the student reflects across line AB (a side of the triangle), creating a "kite/butterfly" shape — harder to visualize.

**Title:** `Reflexió obliqua`

**Objectiu:**
> El triangle ABC amb A = (0, 0), B = (6, 0) i C = (3, 4) i la recta f que passa per A i B ja estan construïts. Reflexa el triangle respecte la recta f. El resultat ha de ser un quadrilàter simètric ("papallona"). Comprova que l'àrea del triangle reflectit és igual a la del original.

**data-commands:**
```
A=(0,0)
B=(6,0)
C=(3,4)
t=Polygon(A,B,C)
f=Line(A,B)
```

**data-fixed:** `A,B,C,t,f`

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length < 2) return false; var origArea = api.getValue('Area(t)'); var found = false; for (var i = 0; i < polys.length; i++) { if (polys[i] === 't') continue; var a = api.getValue('Area(' + polys[i] + ')'); if (Math.abs(a - origArea) < 0.3) found = true; } var pts = api.getAllObjectNames('point'); var hasReflC = pts.some(function(p) { if (p==='A'||p==='B'||p==='C') return false; return Math.abs(api.getXcoord(p) - 3) < 0.2 && Math.abs(api.getYcoord(p) - (-4)) < 0.2; }); return found && hasReflC; }
```

**Hint:**
> Escriu `Reflexió(t, f)`. La recta f és l'eix X (passa per A i B). El vèrtex C=(3,4) es reflecteix a C'=(3,−4). El resultat és una "papallona" simètrica. Comprova: `Àrea(t)` i `Àrea(t')` han de ser iguals.

---

### CHALLENGE 28 — Orthocenter (intersection of altitudes)

**Difficulty:** Difícil  
**Chapters used:** 5 (perpendicular to a line through a point) × 2 + intersection  
**Why harder than any single chapter:** Altitudes are perpendiculars from a vertex to the opposite side — conceptually harder than the perpendicular bisector because the "base" is an oblique segment, not a simple horizontal one.

**Title:** `L'ortocentre`

**Objectiu:**
> El triangle ABC amb A = (0, 0), B = (8, 0) i C = (3, 6) ja està construït. Construeix dues altures del triangle (perpendiculars des d'un vèrtex al costat oposat) i marca el punt on es tallen (l'ortocentre).

**data-commands:**
```
A=(0,0)
B=(8,0)
C=(3,6)
t=Polygon(A,B,C)
```

**data-fixed:** `A,B,C,t`

**data-check:**
```
(api) => { var lines = api.getAllObjectNames('line'); var altitudes = 0; for (var i = 0; i < lines.length; i++) { var l = lines[i]; var perpAB = api.getValue('ArePerpendicular(' + l + ',Segment(A,B))') === 1 && api.getValue('IsOnPath(C,' + l + ')') === 1; var perpBC = api.getValue('ArePerpendicular(' + l + ',Segment(B,C))') === 1 && api.getValue('IsOnPath(A,' + l + ')') === 1; var perpAC = api.getValue('ArePerpendicular(' + l + ',Segment(A,C))') === 1 && api.getValue('IsOnPath(B,' + l + ')') === 1; if (perpAB || perpBC || perpAC) altitudes++; } var pts = api.getAllObjectNames('point'); var hasOrtho = pts.some(function(p) { if (p==='A'||p==='B'||p==='C') return false; return Math.abs(api.getXcoord(p) - 3) < 0.2 && Math.abs(api.getYcoord(p) - 2.5) < 0.2; }); return altitudes >= 2 && hasOrtho; }
```

**Hint:**
> Una altura és una perpendicular des d'un vèrtex al costat oposat. Exemples: `Perpendicular(C, Recta(A,B))` (des de C al costat AB, que és l'eix X). `Perpendicular(A, Recta(B,C))` (des de A al costat BC). Marca la intersecció: `Intersecció(altura1, altura2)`. Aquest punt és l'ortocentre.

---

### CHALLENGE 29 — Three chained transformations

**Difficulty:** Difícil  
**Chapters used:** 8 (translation + reflection + rotation — all three)  
**Why harder than any single chapter:** Composes three different transformations, requiring the student to track how the figure changes at each step and verify area preservation.

**Title:** `Tres transformacions`

**Objectiu:**
> El triangle t amb A = (1, 1), B = (3, 1), C = (2, 3) ja està construït. Aplica tres transformacions encadenades: 1) Trasllada amb vector (3, 0). 2) Reflexa el resultat respecte l'eix X. 3) Gira el resultat 90° en sentit antihorari respecte l'origen.

**data-commands:**
```
A=(1,1)
B=(3,1)
C=(2,3)
t=Polygon(A,B,C)
```

**data-fixed:** `A,B,C,t`

**data-check:**
```
(api) => { var polys = api.getAllObjectNames('polygon'); if (polys.length < 4) return false; var origArea = api.getValue('Area(t)'); var areaOK = polys.filter(function(p) { if (p==='t') return false; return Math.abs(api.getValue('Area('+p+')') - origArea) < 0.3; }).length >= 3; if (!areaOK) return false; var pts = api.getAllObjectNames('point'); var targets = [[1,4],[1,6],[3,5]]; return targets.every(function(tg) { return pts.some(function(p) { return Math.abs(api.getXcoord(p)-tg[0]) < 0.25 && Math.abs(api.getYcoord(p)-tg[1]) < 0.25; }); }); }
```

**Hint:**
> Pas 1: `t1 = Translació(t, Vector((0,0),(3,0)))`. Pas 2: `t2 = Reflexió(t1, EixX)` (o `Reflexió(t1, y=0)`). Pas 3: `t3 = Gira(t2, 90°, (0,0))`. Cada transformació manté l'àrea. Al final hauries de tenir 4 triangles, tots amb la mateixa àrea.

---

### CHALLENGE 30 — Dynamic polygon with slider

**Difficulty:** Difícil  
**Chapters used:** 10 (sliders + dynamic constructions) + 7 (regular polygons)  
**Why harder than any single chapter:** Uses a slider as a parameter to create a dynamic construction — the highest conceptual level in the course. The polygon changes shape in real-time when the slider moves.

**Title:** `Polígon dinàmic`

**Objectiu:**
> Crea un lliscador `n` que va de 3 a 8 (nombres enters). Dibuixa un polígon regular de `n` costats centrat aproximadament a l'origen. Quan moguis el lliscador, el polígon ha de canviar dinàmicament (de triangle a octàgon).

**data-commands:** *(empty)*  
**data-fixed:** *(empty)*

**data-check:**
```
(api) => { var hasSl = false; var nums = api.getAllObjectNames('numeric'); for (var i = 0; i < nums.length; i++) { var v = api.getValue(nums[i]); var min = api.getValue('Min(' + nums[i] + ')'); var max = api.getValue('Max(' + nums[i] + ')'); if (min <= 3.5 && max >= 7.5) hasSl = true; } var polys = api.getAllObjectNames('polygon'); return hasSl && polys.length >= 1; }
```

**Hint:**
> Escriu `n = Lliscador(3, 8, 1)` per crear un lliscador d'enters de 3 a 8. Després crea dos punts base, per exemple A = (2, 0) i B = Gira(A, 360°/n, (0,0)). Finalment: `PolígonRegular(A, B, n)`. Quan moguis el lliscador, el polígon canvia!

---

## Implementation checklist

When implementing the final 10 selected challenges:

1. **Renumber** the selected challenges as repte-1 through repte-10.
2. **Create each `repte-N.html`** file using the exact HTML template from the existing repte files (copy `repte-7.html` as template).
3. **Update `REPTES_DATA`** in `curs/capitols.js` — replace the entire array with the 10 new entries.
4. **Ensure `data-check` is single-line** — collapse all whitespace in the validator function to one line. All internal strings must use single quotes (the attribute uses double quotes).
5. **Difficulty distribution**: Aim for approximately 3 fàcil + 4 mitjà + 3 difícil, but follow the project owner's selection.
6. **Navigation links**: Each repte's prev/next links must point to the correct adjacent repte files. The first repte's "prev" goes to `capitol-1.html`; the last repte's "next" goes to `index.html`.
7. **Test validators**: Each validator must return `true` when the student builds the correct construction and `false` for an empty canvas.
8. **Catalan language**: All user-facing text must be in Catalan. GeoGebra commands should use Catalan names when available (e.g., `Circumferència`, `Polígon`, `Mediatriu`, `Reflexió`, `Translació`, `Bisectriu`, `PuntMig`, `Àrea`, `Distància`, `Perpendicular`, `Gira`). Note: both Catalan and English command names work in GeoGebra with `language: 'ca'`.
