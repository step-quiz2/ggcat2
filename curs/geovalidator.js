// ════════════════════════════════════════════════════════
// geovalidator.js — Llibreria d'assertions geomètriques
//
// Objecte global: GV
// Tots els helpers accedeixen a window.ggbApplet, que és
// injectat per georunner.js quan l'applet està llest.
//
// Principis de validació robusta (secció 7.3 de l'arquitectura):
//   1. Mai comprovar labels específics que l'alumne potser no ha usat.
//   2. Usar getAllObjectNames(type) i iterar per propietat.
//   3. Usar tolerància eps per a totes les comparacions numèriques.
//   4. Validar només l'estat final, mai els passos de construcció.
//   5. Evitar validators trivials (p.ex. "existeix alguna recta?").
// ════════════════════════════════════════════════════════

const GV = {

  // ── Tolerància per a comparacions de punt flotant ─────
  eps: 0.001,

  // ── Existència i tipus ────────────────────────────────

  /**
   * Retorna true si l'objecte 'label' existeix a la construcció.
   */
  pointExists: function(label) {
    return ggbApplet.isDefined(label) &&
           ggbApplet.getObjectType(label) === 'point';
  },

  /**
   * Retorna true si l'objecte 'label' existeix i és del tipus 'type'.
   * Tipus vàlids: 'point', 'line', 'segment', 'ray', 'circle',
   *              'conic', 'polygon', 'function', 'vector', 'angle', etc.
   */
  objectOfType: function(label, type) {
    return ggbApplet.isDefined(label) &&
           ggbApplet.getObjectType(label) === type;
  },

  // ── Coordenades i distàncies ──────────────────────────

  /**
   * Retorna true si el punt 'label' té les coordenades (x, y) ± eps.
   */
  coordsEqual: function(label, x, y) {
    return Math.abs(ggbApplet.getXcoord(label) - x) < GV.eps &&
           Math.abs(ggbApplet.getYcoord(label) - y) < GV.eps;
  },

  /**
   * Retorna true si la distància entre els punts labelA i labelB
   * és igual a 'expected' ± eps.
   */
  distanceEqual: function(labelA, labelB, expected) {
    var d = ggbApplet.getValue('Distance(' + labelA + ',' + labelB + ')');
    return Math.abs(d - expected) < GV.eps;
  },

  /**
   * Retorna true si tots els costats del polígon definit per
   * la llista de labels de punts (en ordre) són iguals ± eps.
   * Exemple: GV.allSidesEqual('A','B','C')  → triangle equilàter
   */
  allSidesEqual: function() {
    var points = Array.prototype.slice.call(arguments);
    if (points.length < 2) return false;
    var dists = [];
    for (var i = 0; i < points.length; i++) {
      var a = points[i];
      var b = points[(i + 1) % points.length];
      dists.push(ggbApplet.getValue('Distance(' + a + ',' + b + ')'));
    }
    return dists.every(function(d) { return Math.abs(d - dists[0]) < GV.eps; });
  },

  /**
   * Retorna true si exactament 'count' costats del polígon definit
   * pels 'points' (en ordre) tenen almenys un altre costat d'igual
   * longitud ± eps.
   * Exemple per isòsceles: GV.exactSidesEqual(['A','B','C'], 2)
   *   → els dos costats iguals compten, el tercer no.
   */
  exactSidesEqual: function(points, count) {
    if (points.length < 2) return false;
    var dists = [];
    for (var i = 0; i < points.length; i++) {
      var a = points[i];
      var b = points[(i + 1) % points.length];
      dists.push(ggbApplet.getValue('Distance(' + a + ',' + b + ')'));
    }
    // Per cada costat, mirem si algun altre costat té la mateixa longitud
    var equalCount = 0;
    for (var i = 0; i < dists.length; i++) {
      for (var j = 0; j < dists.length; j++) {
        if (j === i) continue;
        if (Math.abs(dists[i] - dists[j]) < GV.eps) {
          equalCount++;
          break;   // aquest costat ja compta, passem al següent
        }
      }
    }
    return equalCount === count;
  },

  // ── Relacions entre objectes ──────────────────────────

  /**
   * Retorna true si el punt pointLabel és sobre el camí/objecte pathLabel.
   * Funciona per a rectes, segments, circumferències, etc.
   */
  isOnPath: function(pointLabel, pathLabel) {
    return ggbApplet.getValue('IsOnPath(' + pointLabel + ',' + pathLabel + ')') === 1;
  },

  /**
   * Retorna true si les rectes/segments l1 i l2 són perpendiculars.
   */
  arePerpendicular: function(l1, l2) {
    return ggbApplet.getValue('ArePerpendicular(' + l1 + ',' + l2 + ')') === 1;
  },

  /**
   * Retorna true si les rectes/segments l1 i l2 són paral·leles.
   */
  areParallel: function(l1, l2) {
    return ggbApplet.getValue('AreParallel(' + l1 + ',' + l2 + ')') === 1;
  },

  /**
   * Retorna true si l'angle ABC (en graus) és igual a expectedDeg ± 0.5°.
   * Nota: GeoGebra retorna l'angle en radians des de getValue.
   */
  angleEqual: function(a, b, c, expectedDeg) {
    var rad = ggbApplet.getValue('Angle(' + a + ',' + b + ',' + c + ')');
    return Math.abs(rad * 180 / Math.PI - expectedDeg) < 0.5;
  },

  // ── Helpers d'iteració per a validators robustos ─────

  /**
   * Retorna true si algun objecte del tipus 'type' satisfà el predicat fn.
   * fn rep el label de l'objecte i ha de retornar boolean.
   * Exemple:
   *   GV.anyOfType('line', l => GV.arePerpendicular(l, 'f'))
   */
  anyOfType: function(type, fn) {
    var names = ggbApplet.getAllObjectNames(type);
    for (var i = 0; i < names.length; i++) {
      try { if (fn(names[i])) return true; } catch(_) {}
    }
    return false;
  },

  /**
   * Retorna tots els objectes del tipus 'type' que satisfan el predicat fn.
   */
  filterOfType: function(type, fn) {
    var names = ggbApplet.getAllObjectNames(type);
    var result = [];
    for (var i = 0; i < names.length; i++) {
      try { if (fn(names[i])) result.push(names[i]); } catch(_) {}
    }
    return result;
  },

  /**
   * Crea un punt temporal sobre l'objecte pathLabel a la posició t (0..1),
   * executa la funció fn(tempLabel) i després l'elimina.
   * Útil per comprovar propietats de punts sobre objectes.
   * Retorna el resultat de fn.
   */
  withPointOnPath: function(pathLabel, t, fn) {
    var tempLabel = null;
    try {
      var cmd = 'TempPt_GV=Point(' + pathLabel + ', ' + t + ')';
      tempLabel = ggbApplet.evalCommandGetLabels(cmd);
      if (!tempLabel) return false;
      return fn(tempLabel);
    } catch(e) {
      return false;
    } finally {
      if (tempLabel) {
        try { ggbApplet.deleteObject(tempLabel); } catch(_) {}
      }
    }
  },

  /**
   * Retorna true si la circumferència 'circLabel' passa pels tres punts.
   * Tolerància: distància al centre = radi ± eps.
   */
  circlePassesThroughPoints: function(circLabel, p1, p2, p3) {
    if (!ggbApplet.isDefined(circLabel)) return false;
    // El centre és accessible via ggbApplet.getValue('x(Center(c))')
    var cx = ggbApplet.getValue('x(Center(' + circLabel + '))');
    var cy = ggbApplet.getValue('y(Center(' + circLabel + '))');
    var r  = ggbApplet.getValue('Radius(' + circLabel + ')');
    var pts = [p1, p2, p3];
    return pts.every(function(p) {
      var px = ggbApplet.getXcoord(p);
      var py = ggbApplet.getYcoord(p);
      var d  = Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
      return Math.abs(d - r) < GV.eps * 10;   // ±0.01 per circumferència
    });
  },

};
