// ════════════════════════════════════════════════════════
// validators.js — Validator functions for each repte
//
// Each entry in VALIDATORS maps a goalId string to a
// function(api, GV) → boolean.
//
// api  = live GeoGebra applet (window.ggbApplet)
// GV   = GeoValidator utility object (from geovalidator.js)
//
// Rules for writing validators (from architecture §7.3):
//   1. Never check specific labels the student may not have used.
//   2. Use getAllObjectNames(type) and iterate by property.
//   3. Use GV helpers and GV.eps for all numeric comparisons.
//   4. Validate only the final state, never construction steps.
//   5. Avoid trivial validators (e.g. "does any line exist?").
// ════════════════════════════════════════════════════════

const VALIDATORS = {

  // ── Repte 1 — Triangle des de zero ───────────────────
  // Student must place A=(-2,-1), B=(4,-1), C=(1,4) and
  // connect them with at least 3 segments.
  'repte-1': function(api, GV) {
    var pts  = api.getAllObjectNames('point')   || [];
    var segs = api.getAllObjectNames('segment') || [];
    var hasA = pts.some(function(p) { return GV.coordsEqual(p, -2, -1); });
    var hasB = pts.some(function(p) { return GV.coordsEqual(p,  4, -1); });
    var hasC = pts.some(function(p) { return GV.coordsEqual(p,  1,  4); });
    return hasA && hasB && hasC && segs.length >= 3;
  },

  // ── Repte 2 — Segment de longitud exacta ─────────────
  // Student must create a segment of length 5 whose midpoint
  // lies on the Y-axis (x-coordinate = 0).
  'repte-2': function(api, GV) {
    var n = api.getObjectNumber ? api.getObjectNumber() : 0;
    for (var i = 0; i < n; i++) {
      var nm = api.getObjectName(i);
      if (!nm) continue;
      try {
        var len = api.getValue('Length(' + nm + ')');
        var mx  = api.getValue('x(Midpoint(' + nm + '))');
        if (isFinite(len) && isFinite(mx) &&
            Math.abs(len - 5) < GV.eps * 10 &&
            Math.abs(mx)      < GV.eps * 10) {
          return true;
        }
      } catch(e) {}
    }
    return false;
  },

  // ── Repte 3 — Circumferències concèntriques ───────────
  // Student must create two circles centred at (0,0) with
  // radii 2 and 4 respectively.
  'repte-3': function(api, GV) {
    var found2 = false, found4 = false;
    var n = api.getObjectNumber ? api.getObjectNumber() : 0;
    for (var i = 0; i < n; i++) {
      var nm = api.getObjectName(i);
      if (!nm) continue;
      try {
        var cx = api.getValue('x(Center(' + nm + '))');
        var cy = api.getValue('y(Center(' + nm + '))');
        var r  = api.getValue('Radius('   + nm + ')');
        if (!isFinite(cx) || !isFinite(cy) || !isFinite(r) || r <= 0) continue;
        if (Math.abs(cx) > GV.eps * 20 || Math.abs(cy) > GV.eps * 20) continue;
        if (Math.abs(r - 2) < GV.eps * 10) found2 = true;
        if (Math.abs(r - 4) < GV.eps * 10) found4 = true;
      } catch(e) {}
    }
    return found2 && found4;
  },

  // ── Repte 4 — Triangle amb mesures ───────────────────
  // Student must place A=(0,0), B=(6,0), C=(3,4), connect them
  // with segments, display the area (≈12) as a visible object,
  // and measure at least one angle (≈53.13°).
  'repte-4': function(api, GV) {
    var pts  = api.getAllObjectNames('point')   || [];
    var segs = api.getAllObjectNames('segment') || [];
    var hasA = pts.some(function(p) { return GV.coordsEqual(p, 0, 0); });
    var hasB = pts.some(function(p) { return GV.coordsEqual(p, 6, 0); });
    var hasC = pts.some(function(p) { return GV.coordsEqual(p, 3, 4); });
    if (!hasA || !hasB || !hasC || segs.length < 3) return false;

    // Area must appear as a numeric object with value ≈ 12
    var hasArea = false;
    var n = api.getObjectNumber ? api.getObjectNumber() : 0;
    for (var i = 0; i < n; i++) {
      var nm = api.getObjectName(i);
      if (!nm) continue;
      try {
        var v = api.getValue(nm);
        if (isFinite(v) && Math.abs(v - 12) < 0.3) { hasArea = true; break; }
      } catch(e) {}
    }

    // At least one angle ≈ 53.13°
    var hasAngle = GV.anyOfType('angle', function(a) {
      var deg = api.getValue(a) * 180 / Math.PI;
      return Math.abs(deg - 53.13) < 1.0;
    });

    return hasArea && hasAngle;
  },

  // ── Repte 5 — Quadrat a l'origen ─────────────────────
  // Student must build a square whose one vertex is at (0,0),
  // another at (3,0), and that has ≥ 4 sides all of length 3.
  'repte-5': function(api, GV) {
    var tol  = 0.15;
    var pts  = api.getAllObjectNames('point')   || [];
    var segs = api.getAllObjectNames('segment') || [];
    var hasOrigin = pts.some(function(p) {
      return Math.abs(api.getXcoord(p)) < tol && Math.abs(api.getYcoord(p)) < tol;
    });
    var has30 = pts.some(function(p) {
      return Math.abs(api.getXcoord(p) - 3) < tol && Math.abs(api.getYcoord(p)) < tol;
    });
    var sides3 = 0;
    segs.forEach(function(s) {
      try {
        var len = api.getValue('Length(' + s + ')');
        if (isFinite(len) && Math.abs(len - 3) < tol) sides3++;
      } catch(e) {}
    });
    return hasOrigin && has30 && sides3 >= 4;
  },

  // ── Repte 6 — Mediatriu i intersecció ────────────────
  // Student must construct the perpendicular bisector of AB
  // (a line through the midpoint of AB that is perpendicular to AB)
  // and mark the point where it crosses the Y-axis (x ≈ 0).
  'repte-6': function(api, GV) {
    var tol = 0.15;
    // Check that at least one line is the perpendicular bisector of AB:
    // it must pass through Midpoint(A,B) AND be perpendicular to segment AB.
    var lines = api.getAllObjectNames('line') || [];
    var hasMedb = lines.some(function(l) {
      try {
        var onMid = api.getValue('IsOnPath(Midpoint(A,B),' + l + ')') === 1;
        var perp  = api.getValue('ArePerpendicular(s,' + l + ')') === 1;
        return onMid && perp;
      } catch(e) { return false; }
    });
    if (!hasMedb) return false;
    // Check that there is a point (other than A or B) at x ≈ 0 (on the Y-axis).
    var pts = api.getAllObjectNames('point') || [];
    var hasYint = pts.some(function(p) {
      if (p === 'A' || p === 'B') return false;
      return Math.abs(api.getXcoord(p)) < tol;
    });
    return hasYint;
  },

  // ── Repte 7 — Equilàter comprovat ────────────────────
  // Student must create a regular polygon (equilateral triangle)
  // with all sides equal and at least one angle of 60°.
  'repte-7': function(api, GV) {
    var polys = api.getAllObjectNames('polygon') || [];
    if (polys.length < 1) return false;

    var segs = api.getAllObjectNames('segment') || [];
    var lens = segs.map(function(s) {
      try { return api.getValue('Length(' + s + ')'); } catch(e) { return NaN; }
    }).filter(function(l) { return isFinite(l) && l > 0.1; });
    if (lens.length < 3) return false;

    var maxL = Math.max.apply(null, lens);
    var minL = Math.min.apply(null, lens);
    if (Math.abs(maxL - minL) > 0.15) return false;  // sides not all equal

    return GV.anyOfType('angle', function(a) {
      var deg = api.getValue(a) * 180 / Math.PI;
      return Math.abs(deg - 60) < 1.5;
    });
  },

  // ── Repte 8 — Perpendicular i peu ────────────────────
  // Student must drop a perpendicular from point P to line f,
  // and mark the foot of the perpendicular at (64/17, 16/17).
  'repte-8': function(api, GV) {
    var footX = 64 / 17;
    var footY = 16 / 17;
    var tol   = 0.2;
    var hasPerp = GV.anyOfType('line', function(l) { return l !== 'f'; });
    if (!hasPerp) return false;
    var pts    = api.getAllObjectNames('point') || [];
    var hasFoot = pts.some(function(p) {
      if (p === 'P') return false;
      return Math.abs(api.getXcoord(p) - footX) < tol &&
             Math.abs(api.getYcoord(p) - footY) < tol;
    });
    return hasFoot;
  },

  // ── Repte 9 — El circumcentre ────────────────────────
  // Student must find the circumcentre of triangle A(0,0) B(6,0) C(2,5):
  // a point equidistant from all three vertices.
  'repte-9': function(api, GV) {
    var pts = api.getAllObjectNames('point') || [];
    return pts.some(function(p) {
      if (p === 'A' || p === 'B' || p === 'C') return false;
      var x  = api.getXcoord(p), y = api.getYcoord(p);
      var dA = Math.sqrt(x * x + y * y);
      var dB = Math.sqrt((x - 6) * (x - 6) + y * y);
      var dC = Math.sqrt((x - 2) * (x - 2) + (y - 5) * (y - 5));
      return Math.abs(dA - dB) < 0.2 && Math.abs(dB - dC) < 0.2;
    });
  },

  // ── Repte 10 — El rombus ─────────────────────────────
  // Student must build a rhombus (≥4 equal sides, no right angles)
  // with one vertex at the origin.
  'repte-10': function(api, GV) {
    var tol = 0.15;

    // 1. At least one point at origin
    var pts = api.getAllObjectNames('point') || [];
    var hasOrigin = pts.some(function(p) {
      return Math.abs(api.getXcoord(p)) < tol &&
             Math.abs(api.getYcoord(p)) < tol;
    });
    if (!hasOrigin) return false;

    // 2. At least 4 segments, all of equal length
    var segs = api.getAllObjectNames('segment') || [];
    var lens = [];
    segs.forEach(function(s) {
      try {
        var l = api.getValue('Length(' + s + ')');
        if (isFinite(l) && l > 0.1) lens.push(l);
      } catch(e) {}
    });
    if (lens.length < 4) return false;
    lens.sort(function(a, b) { return a - b; });
    // All four shortest sides must be equal (rhombus condition)
    var equalSides = false;
    for (var k = 0; k <= lens.length - 4; k++) {
      if (Math.abs(lens[k] - lens[k + 3]) < tol) { equalSides = true; break; }
    }
    if (!equalSides) return false;

    // 3. No 90° angles (rhombus ≠ square)
    var n = api.getObjectNumber ? api.getObjectNumber() : 0;
    for (var m = 0; m < n; m++) {
      var nm = api.getObjectName(m);
      if (!nm) continue;
      var tp = '';
      try { tp = (api.getObjectType(nm) || '').toLowerCase(); } catch(e) {}
      if (!tp.includes('angle')) continue;
      try {
        var v   = api.getValue(nm);
        var deg = (v > Math.PI) ? v : v * 180 / Math.PI;
        if (Math.abs(deg - 90) < 1.5) return false;
      } catch(e) {}
    }
    return true;
  },

  // ════════════════════════════════════════════════════
  // Validators dels exercicis dels capítols (cap-N-ex).
  // Migrats des dels atributs data-check inline dels HTML.
  // ════════════════════════════════════════════════════

  // ── Capítol 1 — Crear el punt (3, 2) ──────────────────
  'cap-1-ex': function(api, GV) {
    var pts = api.getAllObjectNames('point');
    return pts.some(function(l) {
      return Math.abs(api.getXcoord(l) - 3) < 0.15 &&
             Math.abs(api.getYcoord(l) - 2) < 0.15;
    });
  },

  // ── Capítol 2 — Punt mig de A(-3,0)–B(3,0) → ha d'estar a (0,0) ──
  'cap-2-ex': function(api, GV) {
    var pts = api.getAllObjectNames('point');
    return pts.some(function(l) {
      return Math.abs(api.getXcoord(l))     < 0.15 &&
             Math.abs(api.getYcoord(l))     < 0.15 &&
             l !== 'A' && l !== 'B';
    });
  },

  // ── Capítol 3 — Circumferència centre origen, radi 3 ──
  'cap-3-ex': function(api, GV) {
    var conics = api.getAllObjectNames('conic');
    return conics.some(function(c) {
      var cx = api.getValue('x(Center(' + c + '))');
      var cy = api.getValue('y(Center(' + c + '))');
      var r  = api.getValue('Radius(' + c + ')');
      return isFinite(cx) && isFinite(cy) && isFinite(r) &&
             Math.abs(cx) < 0.15 && Math.abs(cy) < 0.15 &&
             Math.abs(r - 3) < 0.15;
    });
  },

  // ── Capítol 4 — Angle ≈ 56.31° (vèrtex B amb A=(0,0),B=(4,0),C=(2,3)) ──
  'cap-4-ex': function(api, GV) {
    var angles = api.getAllObjectNames('angle');
    return angles.some(function(a) {
      try {
        var v   = api.getValue(a);
        var deg = (v > Math.PI) ? v : v * 180 / Math.PI;
        return Math.abs(deg - 56.31) < 1.5;
      } catch (e) { return false; }
    });
  },

  // ── Capítol 5 — Mediatriu del segment AB ──────────────
  'cap-5-ex': function(api, GV) {
    var lines = api.getAllObjectNames('line');
    return lines.some(function(l) {
      try {
        var onMid = api.getValue('IsOnPath(Midpoint(A,B),' + l + ')') === 1;
        var perp  = api.getValue('ArePerpendicular(Segment(A,B),' + l + ')') === 1;
        return onMid && perp;
      } catch (e) { return false; }
    });
  },

  // ── Capítol 6 — Paral·lela a f que passa per P ────────
  'cap-6-ex': function(api, GV) {
    var lines = api.getAllObjectNames('line');
    return lines.some(function(l) {
      if (l === 'f') return false;
      try {
        var onP = api.getValue('IsOnPath(P,' + l + ')') === 1;
        var par = api.getValue('AreParallel(f,' + l + ')') === 1;
        return onP && par;
      } catch (e) { return false; }
    });
  },

  // ── Capítol 7 — Polígon regular de 6 costats iguals ───
  'cap-7-ex': function(api, GV) {
    var polys = api.getAllObjectNames('polygon');
    if (polys.length === 0) return false;
    var segs = api.getAllObjectNames('segment') || [];
    var lens = [];
    for (var i = 0; i < segs.length; i++) {
      try {
        var l = api.getValue('Length(' + segs[i] + ')');
        if (isFinite(l) && l > 0.1) lens.push(l);
      } catch (e) {}
    }
    if (lens.length < 6) return false;
    lens.sort(function(a, b) { return a - b; });
    for (var k = 0; k <= lens.length - 6; k++) {
      if (Math.abs(lens[k] - lens[k + 5]) < 0.15) return true;
    }
    return false;
  },

  // ── Capítol 8 — Reflexió: triangle imatge amb vèrtexs propers a (-1,1),(-4,1),(-2,4) ──
  'cap-8-ex': function(api, GV) {
    var polys = api.getAllObjectNames('polygon');
    if (polys.length < 2) return false;
    var pts = api.getAllObjectNames('point');
    var targets = [[-1, 1], [-4, 1], [-2, 4]];
    return targets.every(function(tg) {
      return pts.some(function(p) {
        return Math.abs(api.getXcoord(p) - tg[0]) < 0.2 &&
               Math.abs(api.getYcoord(p) - tg[1]) < 0.2;
      });
    });
  },

  // ── Capítol 9 — Funció f(x)=2x+1 + intersecció amb eix X a (-0.5, 0) ──
  'cap-9-ex': function(api, GV) {
    var fns = api.getAllObjectNames('function');
    var hasF = fns.some(function(fn) {
      try {
        var slope     = api.getValue(fn + "'(0)");
        var intercept = api.getValue(fn + '(0)');
        return Math.abs(slope - 2) < 0.15 && Math.abs(intercept - 1) < 0.15;
      } catch (e) { return false; }
    });
    if (!hasF) return false;
    var pts = api.getAllObjectNames('point');
    return pts.some(function(p) {
      return Math.abs(api.getXcoord(p) + 0.5) < 0.15 &&
             Math.abs(api.getYcoord(p))       < 0.15;
    });
  },

  // ── Capítol 10 — Almenys un lliscador + un polígon o cònica ──
  'cap-10-ex': function(api, GV) {
    var nums = api.getAllObjectNames('numeric');
    var hasSlider = nums.some(function(n) {
      try { return api.isMoveable(n); } catch (e) { return false; }
    });
    var polys  = api.getAllObjectNames('polygon');
    var conics = api.getAllObjectNames('conic');
    return hasSlider && (polys.length > 0 || conics.length > 0);
  },

};
// ── End of VALIDATORS map ─────────────────────────────
