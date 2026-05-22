// ════════════════════════════════════════════════════════════════
// debug-tester.js — Test automàtic del botó "Comprova"
//
// S'activa quan es carrega curs/index.html?debug=1
//
// Per a cada capítol i repte amb exercici validable:
//   1. Carrega la pàgina en un iframe invisible.
//   2. Espera que l'applet GeoGebra estigui llest.
//   3. SIMULA UNA SOLUCIÓ CORRECTA → clica "Comprova" → espera "✓ Correcte".
//   4. Reinicia i SIMULA UNA SOLUCIÓ INCORRECTA → clica "Comprova" → espera "✗ Incorrecte".
//   5. Un test passa només si les dues simulacions donen el resultat esperat.
//
// És "end-to-end": no fa servir mocks, sinó la pipeline real
// (validator + GeoGebra API + actualització de l'UI).
// ════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ── Només actiu si ?debug=1 i NO som dins d'un iframe ─────
  if (location.search.indexOf('debug=1') === -1) return;
  if (window.parent !== window) return;


  // ══════════════════════════════════════════════════════════
  // 1. SOLUCIONS DE TEST per a cada goalId
  //
  // Per a cada exercici definim:
  //   correct:  comandes GeoGebra que el validador ha d'acceptar  → s'espera ✓
  //   wrong:    comandes GeoGebra que el validador NO ha d'acceptar → s'espera ✗
  //
  // Les comandes són les MATEIXES que escriuria un alumne a la
  // barra d'entrada de GeoGebra (sintaxi anglesa, que funciona
  // independentment de l'idioma de l'applet).
  // ══════════════════════════════════════════════════════════

  var TEST_SOLUTIONS = {

    // ── Capítols ───────────────────────────────────────────

    'cap-1-ex': {
      label: 'Cap 1 — Crear punt P=(3,2)',
      correct: ['P=(3,2)'],
      wrong:   ['P=(0,0)']
    },
    'cap-2-ex': {
      // Inicial: A=(-3,0), B=(3,0), s=Segment(A,B) [fixats]
      label: 'Cap 2 — Punt mig de AB',
      correct: ['M=Midpoint(A,B)'],            // → punt a (0,0) ✓
      wrong:   ['N=(1,1)']                     // → punt fora origen ✗
    },
    'cap-3-ex': {
      label: 'Cap 3 — Circumferència centre (0,0) radi 3',
      correct: ['c=Circle((0,0),3)'],
      wrong:   ['c=Circle((0,0),2)']           // radi incorrecte
    },
    'cap-4-ex': {
      // Inicial: A=(0,0), B=(4,0), C=(2,3), p=Polygon(A,B,C) [fixats]
      // Validador busca un angle ≈ 56.31°.
      // Triangle isòsceles: Angle a A = Angle a B = 56.31°, Angle a C = 67.38°.
      label: 'Cap 4 — Angle ≈ 56.31°',
      correct: ['alfa=Angle(B,A,C)'],          // angle a A = 56.31°
      wrong:   ['alfa=Angle(A,C,B)']           // angle a C = 67.38° (incorrecte)
    },
    'cap-5-ex': {
      // Inicial: A=(-3,0), B=(3,0), s=Segment(A,B) [fixats]
      label: 'Cap 5 — Mediatriu de AB',
      correct: ['m=PerpendicularBisector(A,B)'],
      wrong:   ['m=Line(A,B)']                 // recta AB no perpendicular a si mateixa
    },
    'cap-6-ex': {
      // Inicial: f=Line((0,0),(3,1)), P=(0,3) [fixats]
      label: 'Cap 6 — Paral·lela a f per P',
      correct: ['g=Parallel(f,P)'],
      wrong:   ['g=Perpendicular(P,f)']        // perpendicular, no paral·lela
    },
    'cap-7-ex': {
      label: 'Cap 7 — Hexàgon regular (6 costats)',
      correct: ['Polygon((0,0),(1,0),6)'],     // hexàgon regular
      wrong:   ['Polygon((0,0),(3,0),3)']      // triangle = 3 costats, no 6
    },
    'cap-8-ex': {
      // Inicial: A=(1,1), B=(4,1), C=(2,4), t=Polygon(A,B,C), f=Line((0,-5),(0,5)) [fixats]
      // f és l'eix Y; reflectir triangle ABC respecte f.
      label: 'Cap 8 — Reflexió sobre eix Y',
      correct: ['t2=Reflect(t,f)'],            // imatge: (-1,1), (-4,1), (-2,4) ✓
      wrong:   ['t2=Rotate(t,180°,(0,0))']     // rotació, no reflexió → vèrtexs equivocats
    },
    'cap-9-ex': {
      // App graphing. Validador vol f(x)=2x+1 i un punt a (-0.5, 0).
      label: 'Cap 9 — f(x)=2x+1 i tall amb eix X',
      correct: ['f(x)=2x+1', 'P=(-0.5,0)'],
      wrong:   ['f(x)=2x+1', 'P=(0,1)']        // punt al Y-intercept, no al X-intercept
    },
    'cap-10-ex': {
      label: 'Cap 10 — Lliscador + cercle dinàmic',
      correct: ['a=Slider(1,5)', 'c=Circle((0,0),a)'],
      wrong:   ['c=Circle((0,0),3)']           // sense lliscador
    },


    // ── Reptes ─────────────────────────────────────────────

    'repte-1': {
      label: 'Repte 1 — Triangle des de zero',
      correct: ['A=(-2,-1)', 'B=(4,-1)', 'C=(1,4)', 't=Polygon(A,B,C)'],
      wrong:   ['A=(-2,-1)', 'B=(4,-1)', 'C=(1,4)']   // punts sense polígon (cap segment)
    },
    'repte-2': {
      label: 'Repte 2 — Segment longitud 5 sobre eix Y',
      correct: ['A=(0,-2.5)', 'B=(0,2.5)', 's=Segment(A,B)'],
      wrong:   ['A=(0,0)', 'B=(0,3)', 's=Segment(A,B)']   // longitud 3, no 5
    },
    'repte-3': {
      label: 'Repte 3 — Circumferències concèntriques r=2 i r=4',
      correct: ['c=Circle((0,0),2)', 'd=Circle((0,0),4)'],
      wrong:   ['c=Circle((0,0),2)']                       // només una circumferència
    },
    'repte-4': {
      label: 'Repte 4 — Triangle amb àrea i angle',
      correct: [
        'A=(0,0)', 'B=(6,0)', 'C=(3,4)',
        't=Polygon(A,B,C)',
        'ar=Area(t)',                          // ≈ 12
        'al=Angle(A,B,C)'                      // angle a B ≈ 53.13°
      ],
      wrong: [
        'A=(0,0)', 'B=(6,0)', 'C=(3,4)',
        't=Polygon(A,B,C)'                     // sense àrea ni angle
      ]
    },
    'repte-5': {
      label: 'Repte 5 — Quadrat a l\'origen, costat 3',
      correct: ['Polygon((0,0),(3,0),4)'],      // quadrat regular de costat 3
      wrong:   ['Polygon((0,0),(2,0),4)']       // quadrat de costat 2 (incorrecte)
    },
    'repte-6': {
      // Inicial: A=(-4,-1), B=(4,3), s=Segment(A,B) [fixats]
      // Punt mig de AB = (0, 1) → ja és a l'eix Y.
      label: 'Repte 6 — Mediatriu i intersecció',
      correct: ['m=PerpendicularBisector(A,B)', 'M=Midpoint(A,B)'],
      wrong:   ['m=Line(A,B)']                  // recta AB, no mediatriu
    },
    'repte-7': {
      label: 'Repte 7 — Triangle equilàter',
      correct: ['Polygon((0,0),(4,0),3)'],      // triangle regular = equilàter
      wrong:   ['Polygon((0,0),(3,0),(1,2))']   // triangle escalè
    },
    'repte-8': {
      // Inicial: f=Line((0,0),(4,1)), P=(3,4) [fixats]
      label: 'Repte 8 — Perpendicular i peu',
      correct: ['g=Perpendicular(P,f)', 'F=Intersect(g,f)'],
      wrong:   ['F=(0,0)']                      // cap perpendicular, peu equivocat
    },
    'repte-9': {
      // Inicial: A=(0,0), B=(6,0), C=(2,5), t=Polygon(A,B,C) [fixats]
      label: 'Repte 9 — Circumcentre',
      correct: [
        'm1=PerpendicularBisector(A,B)',
        'm2=PerpendicularBisector(B,C)',
        'D=Intersect(m1,m2)'                    // circumcentre = (3, 1.7)
      ],
      wrong: ['D=(2,2)']                         // punt qualsevol, no equidistant
    },
    'repte-10': {
      // Rombus: costats iguals, sense angle de 90°.
      // El wrong és un quadrat (90°): com el validador només detecta
      // angles 90° si l'alumne en MESURA un, cal mesurar-lo també.
      label: 'Repte 10 — Rombus a l\'origen',
      correct: [
        'A=(0,0)', 'B=(3,0)', 'C=(4.5,2.598)', 'D=(1.5,2.598)',
        'r=Polygon(A,B,C,D)'                    // rombus amb angle 60°/120°
      ],
      wrong: [
        'A=(0,0)', 'B=(3,0)', 'C=(3,3)', 'D=(0,3)',
        'sq=Polygon(A,B,C,D)',                  // quadrat (costats iguals però angle 90°)
        'alfa=Angle(D,A,B)'                     // mesura explícitament l'angle de 90°
      ]
    }
  };


  // ══════════════════════════════════════════════════════════
  // 2. UTILITATS asíncrones
  // ══════════════════════════════════════════════════════════

  function delay(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
  }

  /**
   * Polling: espera que predicate() retorni un valor truthy.
   * Resol amb aquest valor, o rebutja per timeout.
   */
  function waitFor(predicate, timeoutMs, pollMs) {
    timeoutMs = timeoutMs || 30000;
    pollMs    = pollMs    || 100;
    return new Promise(function(resolve, reject) {
      var start = Date.now();
      (function check() {
        var v;
        try { v = predicate(); } catch (_) { v = null; }
        if (v) { resolve(v); return; }
        if (Date.now() - start > timeoutMs) {
          reject(new Error('Timeout (' + timeoutMs + 'ms)'));
          return;
        }
        setTimeout(check, pollMs);
      })();
    });
  }


  // ══════════════════════════════════════════════════════════
  // 3. EXECUCIÓ d'un escenari (correct o wrong) sobre un wrapper
  //
  // Reinicia → injecta comandes → clica "✓ Comprova" → llegeix
  // el badge resultant.
  // ══════════════════════════════════════════════════════════

  function runScenario(wrapper, commands) {
    var api = wrapper._ggbApi;

    // 1. Reset: clica el botó Reinicia (això esborra l'estat i
    //    re-aplica les comandes inicials i els objectes fixats).
    var resetBtn = wrapper.querySelector('.ggb-btn-reset');
    if (resetBtn) resetBtn.click();

    return delay(200).then(function() {
      // 2. Injecta cada comanda
      (commands || []).forEach(function(cmd) {
        if (!cmd) return;
        try { api.evalCommand(cmd); }
        catch (e) { console.warn('[debug-tester] evalCommand error:', cmd, e); }
      });
      return delay(200);
    }).then(function() {
      // 3. Clica el botó Comprova
      var checkBtn = wrapper.querySelector('.ggb-btn-check');
      if (!checkBtn) throw new Error('Botó "Comprova" no trobat');
      checkBtn.click();
      // El handler de Comprova té un setTimeout de 100ms; esperem 350ms
      return delay(350);
    }).then(function() {
      // 4. Llegeix el badge
      var badge = wrapper.querySelector('.ggb-badge');
      return {
        text: badge ? badge.textContent.trim() : '',
        ok:   !!(badge && badge.classList.contains('ggb-ok')),
        ko:   !!(badge && badge.classList.contains('ggb-ko'))
      };
    });
  }


  // ══════════════════════════════════════════════════════════
  // 4. TEST COMPLET d'una pàgina (capitol-N.html o repte-N.html)
  //
  // Crea un iframe invisible, espera que carregui i que el seu
  // applet GeoGebra estigui llest, executa l'escenari correcte
  // i l'incorrecte, i retorna el veredicte.
  // ══════════════════════════════════════════════════════════

  function runTestForFile(arxiu, goalId) {
    var testData = TEST_SOLUTIONS[goalId];

    if (!testData) {
      return Promise.resolve({
        goalId: goalId, arxiu: arxiu, label: goalId,
        passed: false,
        error: 'Sense dades de test definides per a "' + goalId + '"'
      });
    }

    // Crea iframe invisible (offscreen però amb mida real perquè
    // GeoGebra calculi correctament les dimensions del canvas).
    var iframe = document.createElement('iframe');
    iframe.src = arxiu;
    iframe.style.cssText =
      'position:fixed; left:-10000px; top:0; ' +
      'width:900px; height:700px; border:0; visibility:hidden;';
    document.body.appendChild(iframe);

    function cleanup() {
      try { iframe.remove(); } catch (_) {}
    }

    // 1) Espera que el document de l'iframe estigui complete
    return waitFor(function() {
      return iframe.contentDocument &&
             iframe.contentDocument.readyState === 'complete';
    }, 25000).then(function() {

      // 2) Espera que el wrapper amb el nostre goalId tingui _ggbApi
      //    i el badge en estat "llest"
      return waitFor(function() {
        var doc = iframe.contentDocument;
        if (!doc) return null;
        var wrappers = doc.querySelectorAll('.geogebra-wrap');
        for (var i = 0; i < wrappers.length; i++) {
          var w = wrappers[i];
          if (w._ggbCfg && w._ggbCfg.goalId === goalId && w._ggbApi) {
            var badge = w.querySelector('.ggb-badge');
            if (badge && badge.classList.contains('ggb-ready')) return w;
          }
        }
        return null;
      }, 45000);   // GeoGebra pot tardar bastant a carregar el CDN

    }).then(function(wrapper) {
      // 3) Executa escenari CORRECTE
      return runScenario(wrapper, testData.correct)
        .then(function(correctResult) {
          // 4) Executa escenari INCORRECTE
          return runScenario(wrapper, testData.wrong)
            .then(function(wrongResult) {
              var correctPassed = correctResult.ok === true;
              var wrongPassed   = wrongResult.ko === true;
              return {
                goalId: goalId,
                arxiu: arxiu,
                label: testData.label,
                correctResult: correctResult,
                wrongResult: wrongResult,
                correctPassed: correctPassed,
                wrongPassed: wrongPassed,
                passed: correctPassed && wrongPassed
              };
            });
        });
    }).then(function(result) {
      cleanup();
      return result;
    }, function(err) {
      cleanup();
      return {
        goalId: goalId, arxiu: arxiu,
        label: (testData && testData.label) || goalId,
        passed: false,
        error: (err && err.message) || String(err)
      };
    });
  }


  // ══════════════════════════════════════════════════════════
  // 5. INTERFÍCIE D'USUARI
  // ══════════════════════════════════════════════════════════

  // Estils del panell de debug
  var DEBUG_CSS = [
    '.debug-panel {',
    '  font-family: var(--mono);',
    '  max-width: 880px; margin: 0 auto; padding: 16px;',
    '}',
    '.debug-panel h2 {',
    '  font-size: 1.1rem; margin-bottom: 6px;',
    '  border-bottom: 1px solid var(--border); padding-bottom: 6px;',
    '}',
    '.debug-intro {',
    '  font-size: 0.78rem; color: var(--muted);',
    '  line-height: 1.5; margin-bottom: 14px;',
    '}',
    '.debug-actions {',
    '  display: flex; flex-wrap: wrap; gap: 8px;',
    '  margin-bottom: 14px;',
    '}',
    '.debug-btn {',
    '  font-family: var(--mono); font-size: 0.78rem; font-weight: 700;',
    '  padding: 0.45rem 0.8rem; border-radius: 6px; cursor: pointer;',
    '  background: transparent; color: var(--text);',
    '  border: 1px solid var(--border); transition: all 0.1s;',
    '}',
    '.debug-btn:hover:not(:disabled) {',
    '  border-color: var(--accent); color: var(--accent);',
    '}',
    '.debug-btn:disabled { opacity: 0.4; cursor: not-allowed; }',
    '.debug-btn-primary {',
    '  background: var(--accent); color: #fff; border-color: var(--accent);',
    '}',
    '.debug-btn-primary:hover:not(:disabled) {',
    '  filter: brightness(1.15); color: #fff;',
    '}',
    '.debug-individual { margin-bottom: 14px; }',
    '.debug-individual details {',
    '  border: 1px solid var(--border); border-radius: 6px;',
    '  padding: 6px 10px; margin-bottom: 6px;',
    '}',
    '.debug-individual summary {',
    '  cursor: pointer; font-size: 0.82rem; font-weight: 700;',
    '  padding: 4px 0;',
    '}',
    '.dbg-grid {',
    '  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));',
    '  gap: 6px; padding: 8px 0 4px;',
    '}',
    '.dbg-grid .debug-btn { font-size: 0.72rem; padding: 0.35rem 0.5rem; }',
    '.debug-results {',
    '  margin-top: 14px;',
    '  border: 1px solid var(--border); border-radius: 8px;',
    '  background: var(--surface);',
    '}',
    '.dbg-summary {',
    '  padding: 10px 14px; font-size: 0.82rem; font-weight: 700;',
    '  border-bottom: 1px solid var(--border);',
    '}',
    '.dbg-summary.dbg-summary-pass { background: #dcfce7; color: #14532d; }',
    '.dbg-summary.dbg-summary-fail { background: #fee2e2; color: #7f1d1d; }',
    '.dbg-summary.dbg-summary-running { background: #fef3c7; color: #78350f; }',
    '.dbg-result {',
    '  padding: 8px 14px; border-bottom: 1px solid var(--border);',
    '  font-size: 0.76rem; display: grid;',
    '  grid-template-columns: 26px 1fr;',
    '  align-items: start; gap: 4px 10px;',
    '}',
    '.dbg-result:last-child { border-bottom: none; }',
    '.dbg-row-status { font-size: 1rem; line-height: 1; padding-top: 1px; }',
    '.dbg-row-status.s-pass { color: #16a34a; }',
    '.dbg-row-status.s-fail { color: #dc2626; }',
    '.dbg-row-status.s-running { color: #d97706; }',
    '.dbg-row-label { font-weight: 700; }',
    '.dbg-row-detail {',
    '  grid-column: 2; font-size: 0.7rem; color: var(--muted);',
    '  line-height: 1.5; margin-top: 2px;',
    '}',
    '.dbg-row-detail .ok  { color: #16a34a; font-weight: 700; }',
    '.dbg-row-detail .ko  { color: #dc2626; font-weight: 700; }',
    '.dbg-row-detail code {',
    '  font-size: 0.68rem; background: #f3f4f6;',
    '  padding: 1px 4px; border-radius: 3px;',
    '}'
  ].join('\n');

  function injectStyles() {
    var s = document.createElement('style');
    s.textContent = DEBUG_CSS;
    document.head.appendChild(s);
  }

  // Estat global d'execució
  var state = {
    running: false,
    rows: {}    // goalId → DOM row
  };

  function setButtonsEnabled(enabled) {
    document.querySelectorAll('.debug-btn').forEach(function(b) {
      b.disabled = !enabled;
    });
  }

  /**
   * Crea (o reutilitza) una fila de resultats en estat "running".
   */
  function ensureRow(goalId, arxiu, label) {
    if (state.rows[goalId]) return state.rows[goalId];

    var resultsEl = document.getElementById('dbg-results');
    var row = document.createElement('div');
    row.className = 'dbg-result';
    row.innerHTML =
      '<span class="dbg-row-status s-running" data-status>⏳</span>' +
      '<span class="dbg-row-label" data-label>' +
        escapeHTML(label) + ' <code>' + escapeHTML(goalId) + '</code></span>' +
      '<span class="dbg-row-detail" data-detail>' +
        'Carregant <code>' + escapeHTML(arxiu) + '</code>…' +
      '</span>';
    resultsEl.appendChild(row);
    state.rows[goalId] = row;
    return row;
  }

  /**
   * Actualitza una fila amb el resultat final.
   */
  function updateRow(row, result) {
    var statusEl = row.querySelector('[data-status]');
    var detailEl = row.querySelector('[data-detail]');

    if (result.error) {
      statusEl.textContent = '!';
      statusEl.className = 'dbg-row-status s-fail';
      detailEl.innerHTML = '<span class="ko">Error:</span> ' + escapeHTML(result.error);
      return;
    }

    var passed = result.passed;
    statusEl.textContent = passed ? '✓' : '✗';
    statusEl.className = 'dbg-row-status ' + (passed ? 's-pass' : 's-fail');

    var corr = result.correctResult || {};
    var wrng = result.wrongResult || {};

    detailEl.innerHTML =
      'Sol·lució correcta → badge: <code>' + escapeHTML(corr.text || '?') + '</code> ' +
        '<span class="' + (result.correctPassed ? 'ok' : 'ko') + '">' +
        (result.correctPassed ? '✓' : '✗ s\'esperava ✓ Correcte') + '</span><br>' +
      'Sol·lució incorrecta → badge: <code>' + escapeHTML(wrng.text || '?') + '</code> ' +
        '<span class="' + (result.wrongPassed ? 'ok' : 'ko') + '">' +
        (result.wrongPassed ? '✓' : '✗ s\'esperava ✗ Incorrecte') + '</span>';
  }

  /**
   * Actualitza el resum superior segons quants tests han passat.
   */
  function updateSummary(state2) {
    var sum = document.getElementById('dbg-summary');
    if (!sum) return;
    if (state2.running) {
      sum.className = 'dbg-summary dbg-summary-running';
      sum.textContent = '⏳ Test en curs… (' + state2.done + '/' + state2.total + ')';
      return;
    }
    if (state2.fail === 0) {
      sum.className = 'dbg-summary dbg-summary-pass';
      sum.textContent = '✓ Tots passen (' + state2.pass + '/' + state2.total + ')';
    } else {
      sum.className = 'dbg-summary dbg-summary-fail';
      sum.textContent = '✗ ' + state2.fail + ' fallades / ' + state2.total +
                        ' tests (' + state2.pass + ' OK)';
    }
  }

  function escapeHTML(s) {
    s = String(s);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * Executa una llista de tests seqüencialment.
   * tasks: array de { arxiu, goalId, label }
   */
  function runTestList(tasks) {
    if (state.running) return;
    state.running = true;
    setButtonsEnabled(false);

    var st = { total: tasks.length, done: 0, pass: 0, fail: 0, running: true };

    // Reset àrea de resultats
    var resultsEl = document.getElementById('dbg-results');
    resultsEl.innerHTML = '<div class="dbg-summary dbg-summary-running" id="dbg-summary">⏳ Inicialitzant…</div>';
    state.rows = {};

    // Crea les files en estat "running" abans de començar
    tasks.forEach(function(t) { ensureRow(t.goalId, t.arxiu, t.label); });
    updateSummary(st);

    // Cadena de Promises seqüencial
    var p = Promise.resolve();
    tasks.forEach(function(t) {
      p = p.then(function() {
        var row = state.rows[t.goalId];
        var detailEl = row.querySelector('[data-detail]');
        detailEl.innerHTML = 'Carregant l\'applet GeoGebra de <code>' +
                             escapeHTML(t.arxiu) + '</code>…';
        return runTestForFile(t.arxiu, t.goalId).then(function(result) {
          updateRow(row, result);
          st.done++;
          if (result.passed) st.pass++; else st.fail++;
          updateSummary(st);
        });
      });
    });

    p.then(function() {
      st.running = false;
      updateSummary(st);
      state.running = false;
      setButtonsEnabled(true);
    });
  }

  /**
   * Construeix la llista de tasks a partir de CAPITOLS_DATA / REPTES_DATA.
   */
  function tasksForAllCapitols() {
    return CAPITOLS_DATA
      .filter(function(c) { return c.goalId && TEST_SOLUTIONS[c.goalId]; })
      .map(function(c) {
        return { arxiu: c.arxiu, goalId: c.goalId,
                 label: 'Cap ' + c.num + ' — ' + c.titol };
      });
  }
  function tasksForAllReptes() {
    return REPTES_DATA
      .filter(function(r) { return r.goalId && TEST_SOLUTIONS[r.goalId]; })
      .map(function(r) {
        return { arxiu: r.arxiu, goalId: r.goalId,
                 label: 'Repte ' + r.num + ' — ' + r.titol };
      });
  }


  // ══════════════════════════════════════════════════════════
  // 6. RENDER del panell
  // ══════════════════════════════════════════════════════════

  function renderDebugPanel() {
    injectStyles();

    // Substitueix el hero i la llista normal del curs
    var hero = document.querySelector('.curs-index-hero');
    if (hero) {
      hero.innerHTML =
        '<h1>🧪 Mode Debug</h1>' +
        '<p>Test automàtic de tots els exercicis amb botó <strong>✓ Comprova</strong>.</p>';
    }

    var listEl = document.getElementById('capitols-list');
    if (listEl) listEl.innerHTML = '';

    // Avís si servim per file://: Chrome no permet accedir al
    // contingut d'iframes file:// → els tests no funcionaran.
    var fileProtocolWarning = '';
    if (location.protocol === 'file:') {
      fileProtocolWarning =
        '<div style="background:#fef3c7;border:1px solid #f59e0b;' +
        'border-radius:6px;padding:10px 14px;margin-bottom:14px;' +
        'font-size:0.78rem;color:#78350f;">' +
        '⚠ <strong>Atenció:</strong> estàs servint la pàgina amb el protocol ' +
        '<code>file://</code>. Alguns navegadors (Chrome) bloquegen l\'accés ' +
        'entre iframes file:// i els tests poden fallar amb error de seguretat. ' +
        'Si això passa, serveix el projecte amb un servidor HTTP local, per exemple:<br>' +
        '<code>python3 -m http.server</code> i obre ' +
        '<code>http://localhost:8000/curs/index.html?debug=1</code>' +
        '</div>';
    }

    // Panell
    var panel = document.createElement('div');
    panel.className = 'debug-panel';

    var capButtons = CAPITOLS_DATA
      .filter(function(c) { return c.goalId && TEST_SOLUTIONS[c.goalId]; })
      .map(function(c) {
        return '<button class="debug-btn" data-test-arxiu="' +
               escapeHTML(c.arxiu) + '" data-test-goal="' +
               escapeHTML(c.goalId) + '" data-test-label="Cap ' + c.num +
               ' — ' + escapeHTML(c.titol) +
               '">Cap ' + c.num + ' (' + escapeHTML(c.arxiu) + ')</button>';
      }).join('');

    var repButtons = REPTES_DATA
      .filter(function(r) { return r.goalId && TEST_SOLUTIONS[r.goalId]; })
      .map(function(r) {
        return '<button class="debug-btn" data-test-arxiu="' +
               escapeHTML(r.arxiu) + '" data-test-goal="' +
               escapeHTML(r.goalId) + '" data-test-label="Repte ' + r.num +
               ' — ' + escapeHTML(r.titol) +
               '">Repte ' + r.num + ' (' + escapeHTML(r.arxiu) + ')</button>';
      }).join('');

    panel.innerHTML =
      '<h2>🧪 Mode Debug — Validació automàtica del botó "Comprova"</h2>' +
      '<p class="debug-intro">' +
        'Per a cada exercici amb botó <strong>✓ Comprova</strong>, el sistema simula:<br>' +
        '&nbsp;&nbsp;1) una <strong>solució correcta</strong> → s\'espera el badge "<strong>✓ Correcte</strong>"<br>' +
        '&nbsp;&nbsp;2) una <strong>solució incorrecta</strong> → s\'espera el badge "<strong>✗ Incorrecte</strong>"<br>' +
        'Un test passa només si les dues simulacions donen el resultat esperat. ' +
        'Cada test carrega la pàgina en un iframe ocult i pot trigar uns 5–15 segons.' +
      '</p>' +

      fileProtocolWarning +

      '<div class="debug-actions">' +
        '<button class="debug-btn debug-btn-primary" id="dbg-all">' +
          '▶ Tots (capítols + reptes)</button>' +
        '<button class="debug-btn" id="dbg-all-cap">▶ Tots els capítols</button>' +
        '<button class="debug-btn" id="dbg-all-rep">▶ Tots els reptes</button>' +
      '</div>' +

      '<div class="debug-individual">' +
        '<details>' +
          '<summary>Test d\'un sol capítol</summary>' +
          '<div class="dbg-grid">' + capButtons + '</div>' +
        '</details>' +
        '<details>' +
          '<summary>Test d\'un sol repte</summary>' +
          '<div class="dbg-grid">' + repButtons + '</div>' +
        '</details>' +
      '</div>' +

      '<div class="debug-results" id="dbg-results"></div>';

    // Insereix el panell després del hero
    (listEl ? listEl.parentNode : document.body).insertBefore(panel,
      listEl || null);

    // ── Handlers ────────────────────────────────────────────

    document.getElementById('dbg-all').addEventListener('click', function() {
      runTestList(tasksForAllCapitols().concat(tasksForAllReptes()));
    });
    document.getElementById('dbg-all-cap').addEventListener('click', function() {
      runTestList(tasksForAllCapitols());
    });
    document.getElementById('dbg-all-rep').addEventListener('click', function() {
      runTestList(tasksForAllReptes());
    });

    panel.querySelectorAll('[data-test-arxiu]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var arxiu = btn.getAttribute('data-test-arxiu');
        var goal  = btn.getAttribute('data-test-goal');
        var label = btn.getAttribute('data-test-label');
        runTestList([{ arxiu: arxiu, goalId: goal, label: label }]);
      });
    });
  }


  // ── Inicialització ────────────────────────────────────────

  function init() {
    // Esperem que CAPITOLS_DATA i REPTES_DATA estiguin disponibles
    // (definits a capitols.js, carregat abans).
    if (typeof CAPITOLS_DATA === 'undefined' || typeof REPTES_DATA === 'undefined') {
      // Reintentem en uns ms
      setTimeout(init, 50);
      return;
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderDebugPanel);
    } else {
      renderDebugPanel();
    }
  }

  init();

})();
