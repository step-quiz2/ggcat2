// ════════════════════════════════════════════════════════
// curs/capitols.js — Dades dels capítols i helpers de UI (GeoCat)
//
// Adaptat de PyCat: canviat _LS_KEY, dades capítols/reptes,
// logo, renderSimuladors injecta applets GeoGebra inline.
//
// Funcions exportades al window global:
//   injectCursLogo()           — pobla .logo-icon
//   renderSidebar(currentNum)  — omple #sidebar-nav (amb ✓ de progrés)
//   renderReptesSidebar(num)   — sidebar pels reptes (amb ✓ de progrés)
//   renderSimuladors()         — converteix .geogebra → applets inline
//   initSidebarToggle()        — hamburger mòbil
//   initGlossariCurs()         — glossari modal
//
// Dependència: glossari-data.js (ha de carregar-se ABANS)
// ════════════════════════════════════════════════════════


// ── Logo ─────────────────────────────────────────────────
function injectCursLogo() {
  document.querySelectorAll('.logo-icon').forEach(function(el) {
    if (!el.innerHTML.trim()) {
      // Compàs geomètric com a logo de GeoCat
      el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align:middle"><circle cx="50" cy="22" r="10" fill="#2563eb"/><line x1="50" y1="32" x2="30" y2="82" stroke="#2563eb" stroke-width="6" stroke-linecap="round"/><line x1="50" y1="32" x2="70" y2="82" stroke="#2563eb" stroke-width="6" stroke-linecap="round"/><line x1="26" y1="72" x2="74" y2="72" stroke="#93c5fd" stroke-width="4" stroke-linecap="round"/></svg>';
    }
  });
}


// ── Dades dels capítols ──────────────────────────────────
// goalId: identificador del widget d'exercici del capítol (null si no en té).

var CAPITOLS_DATA = [
  { num: 1,  titol: 'Benvingut a GeoGebra',          arxiu: 'capitol-1.html',  goalId: 'cap-1-ex' },
  { num: 2,  titol: 'Rectes i segments',              arxiu: 'capitol-2.html',  goalId: 'cap-2-ex' },
  { num: 3,  titol: 'Circumferències',                arxiu: 'capitol-3.html',  goalId: 'cap-3-ex' },
  { num: 4,  titol: 'Mesures',                        arxiu: 'capitol-4.html',  goalId: 'cap-4-ex' },
  { num: 5,  titol: 'Construccions clàssiques I',     arxiu: 'capitol-5.html',  goalId: 'cap-5-ex' },
  { num: 6,  titol: 'Construccions clàssiques II',    arxiu: 'capitol-6.html',  goalId: 'cap-6-ex' },
  { num: 7,  titol: 'Polígons',                       arxiu: 'capitol-7.html',  goalId: 'cap-7-ex' },
  { num: 8,  titol: 'Transformacions',                arxiu: 'capitol-8.html',  goalId: 'cap-8-ex' },
  { num: 9,  titol: 'Funcions i gràfiques',           arxiu: 'capitol-9.html',  goalId: 'cap-9-ex' },
  { num: 10, titol: 'Lliscadors i constr. dinàmiques',arxiu: 'capitol-10.html', goalId: 'cap-10-ex' },
];

var REPTES_DATA = [
  { num: 1,  titol: 'Triangle des de zero',          arxiu: 'repte-1.html',  goalId: 'repte-1',  dificultat: 'facil' },
  { num: 2,  titol: 'Segment de longitud exacta',    arxiu: 'repte-2.html',  goalId: 'repte-2',  dificultat: 'facil' },
  { num: 3,  titol: 'Circumferències concèntriques', arxiu: 'repte-3.html',  goalId: 'repte-3',  dificultat: 'facil' },
  { num: 4,  titol: 'Triangle amb mesures',          arxiu: 'repte-4.html',  goalId: 'repte-4',  dificultat: 'facil' },
  { num: 5,  titol: 'Quadrat a l\'origen',           arxiu: 'repte-5.html',  goalId: 'repte-5',  dificultat: 'facil' },
  { num: 6,  titol: 'Mediatriu i intersecció',       arxiu: 'repte-6.html',  goalId: 'repte-6',  dificultat: 'mitja' },
  { num: 7,  titol: 'Equilàter comprovat',           arxiu: 'repte-7.html',  goalId: 'repte-7',  dificultat: 'mitja' },
  { num: 8,  titol: 'Perpendicular i peu',           arxiu: 'repte-8.html',  goalId: 'repte-8',  dificultat: 'mitja' },
  { num: 9,  titol: 'El circumcentre',               arxiu: 'repte-9.html',  goalId: 'repte-9',  dificultat: 'mitja' },
  { num: 10, titol: 'El rombus',                     arxiu: 'repte-10.html', goalId: 'repte-10', dificultat: 'mitja' },
];


// ── Sistema de progrés ───────────────────────────────────
// Guarda a localStorage un objecte { goalId: true, ... }

var _LS_KEY = 'geocat_progress';

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(_LS_KEY) || '{}');
  } catch(_) { return {}; }
}

function saveGoalCompleted(goalId) {
  if (!goalId) return;
  var p = getProgress();
  if (p[goalId]) return;  // ja guardat
  p[goalId] = true;
  try { localStorage.setItem(_LS_KEY, JSON.stringify(p)); } catch(_) {}
}

function isGoalCompleted(goalId) {
  if (!goalId) return false;
  return !!getProgress()[goalId];
}


// ── Sidebar: capítols ────────────────────────────────────

function renderSidebar(currentNum) {
  var nav = document.getElementById('sidebar-nav');
  if (!nav) return;
  var progress = getProgress();

  var html = '<div class="sidebar-section-title">Capítols</div>';
  html += '<ul class="sidebar-list">';
  for (var i = 0; i < CAPITOLS_DATA.length; i++) {
    var c = CAPITOLS_DATA[i];
    var isActive = c.num === currentNum;
    var check = (c.goalId && progress[c.goalId])
      ? '<span class="sidebar-check" aria-label="completat">✓</span>' : '';
    html += '<li class="sidebar-item' + (isActive ? ' active' : '') + '">' +
      '<a href="' + c.arxiu + '">' +
        check + c.num + '. ' + c.titol +
      '</a></li>';
  }
  html += '</ul>';
  nav.innerHTML = html;
}

// ── Sidebar: reptes ──────────────────────────────────────

function renderReptesSidebar(currentNum) {
  var nav = document.getElementById('sidebar-nav');
  if (!nav) return;
  var progress = getProgress();

  var difLabels = { facil: 'Fàcil', mitja: 'Mitjà', dificil: 'Difícil' };

  var html = '<div class="sidebar-section-title">Reptes</div>';
  html += '<ul class="sidebar-list">';
  for (var i = 0; i < REPTES_DATA.length; i++) {
    var r = REPTES_DATA[i];
    var isActive = r.num === currentNum;
    var check = (r.goalId && progress[r.goalId])
      ? '<span class="sidebar-check" aria-label="completat">✓</span>' : '';
    html += '<li class="sidebar-item' + (isActive ? ' active' : '') + '">' +
      '<a href="' + r.arxiu + '">' +
        check + 'Repte ' + r.num + ': ' + r.titol +
      '</a></li>';
  }
  html += '</ul>';
  nav.innerHTML = html;
}





//
// PATRÓ: deployggb.js es carrega síncronament al <head> de cada
// pàgina HTML, així GGBApplet existeix quan renderSimuladors()
// s'executa. Sense càrrega dinàmica, sense cues, sense IntersectionObserver.

var _ggbWidgetCount = 0;


function renderSimuladors() {
  var divs = document.querySelectorAll('.geogebra');
  if (divs.length === 0) return;

  // ── Llegim data-attributes de cada div ──

  var entries = [];
  divs.forEach(function(div) {
    var id = 'ggb-w' + (_ggbWidgetCount++);
    var commandsRaw = div.getAttribute('data-commands') || '';
    var fixedRaw    = div.getAttribute('data-fixed')    || '';
    var commands = commandsRaw
      ? commandsRaw.split('\n').map(function(s) { return s.trim(); }).filter(Boolean)
      : [];
    var fixed = fixedRaw
      ? fixedRaw.split(',').map(function(s) { return s.trim(); }).filter(Boolean)
      : [];

    // data-check is no longer used. Validators are looked up by goalId.
    var validatorFn = null;
    var goalIdForLookup = div.getAttribute('data-goal-id') || '';
    if (goalIdForLookup && typeof VALIDATORS !== 'undefined' && VALIDATORS[goalIdForLookup]) {
      (function(fn) {
        validatorFn = function(api, GV) { return fn(api, GV); };
      })(VALIDATORS[goalIdForLookup]);
    }

    entries.push({
      div: div, id: id, commands: commands, fixed: fixed,
      readonly:  div.getAttribute('data-readonly') === 'true',
      goalId:    div.getAttribute('data-goal-id') || '',
      app:       div.getAttribute('data-app') || '',
      tools:     div.getAttribute('data-tools') || '',
      height:    div.getAttribute('data-height') || '420',
      validator: validatorFn
    });
  });

  // ── Construïm wrappers al DOM ──

  entries.forEach(function(cfg) {
    var wrapper = document.createElement('div');
    wrapper.className = 'geogebra-wrap';

    var ggbDiv = document.createElement('div');
    ggbDiv.id = cfg.id;
    ggbDiv.style.width = '100%';
    ggbDiv.style.height = cfg.height + 'px';
    ggbDiv.style.border = '1px solid var(--border, #d0d0d0)';
    ggbDiv.style.borderRadius = '8px';
    ggbDiv.style.overflow = 'hidden';
    ggbDiv.style.background = '#f8f8f8';
    wrapper.appendChild(ggbDiv);

    if (!cfg.readonly) {
      var tb = document.createElement('div');
      tb.className = 'ggb-toolbar';
      tb.innerHTML =
        '<span class="ggb-badge">carregant…</span>' +
        (cfg.validator
          ? '<button class="ggb-btn ggb-btn-check" type="button">✓ Comprova</button>'
          : '') +
        '<button class="ggb-btn ggb-btn-reset" type="button">↺ Reinicia</button>';
      wrapper.appendChild(tb);

      if (cfg.validator) {
        (function(cfg, wrapper, tb) {
          tb.querySelector('.ggb-btn-check').addEventListener('click', function() {
            var api = wrapper._ggbApi;
            if (!api) return;
            var badge = tb.querySelector('.ggb-badge');
            badge.textContent = '…'; badge.className = 'ggb-badge';
            var prev = window.ggbApplet;
            window.ggbApplet = api;
            var GVref = (typeof GV !== 'undefined') ? GV : {};
            setTimeout(function() {
              var ok = false;
              var validatorFn = cfg.validator;
              try { ok = !!validatorFn(api, GVref); } catch(e) { console.warn('[GeoCat] validator error:', e); }
              window.ggbApplet = prev;
              badge.textContent = ok ? '✓ Correcte' : '✗ Incorrecte';
              badge.className   = 'ggb-badge ' + (ok ? 'ggb-ok' : 'ggb-ko');
              if (cfg.goalId) {
                var fb = wrapper.querySelector('.simulador-feedback');
                if (ok) {
                  if (fb) { fb.className = 'simulador-feedback fb-ok'; fb.textContent = '✓ Correcte! Construcció validada.'; }
                  saveGoalCompleted(cfg.goalId);
                  _refreshSidebar();
                } else {
                  if (fb) { fb.className = 'simulador-feedback fb-ko'; fb.textContent = '✗ Encara no és correcte. Revisa la construcció.'; }
                }
              }
            }, 100);
          });
        })(cfg, wrapper, tb);
      }

      (function(cfg, wrapper, tb) {
        tb.querySelector('.ggb-btn-reset').addEventListener('click', function() {
          var api = wrapper._ggbApi;
          if (!api) return;
          try { api.reset(); } catch(e) {}
          cfg.commands.forEach(function(cmd) { if (cmd) try { api.evalCommand(cmd); } catch(e) {} });
          cfg.fixed.forEach(function(lbl) {
            if (lbl) try { api.setFixed(lbl, true, true); api.setColor(lbl, 60, 100, 220); } catch(e) {}
          });
          var badge = tb.querySelector('.ggb-badge');
          if (badge) { badge.textContent = 'llest'; badge.className = 'ggb-badge ggb-ready'; }
        });
      })(cfg, wrapper, tb);
    }

    if (cfg.goalId) {
      var fb = document.createElement('div');
      fb.className = 'simulador-feedback';
      fb.setAttribute('data-goal-id', cfg.goalId);
      if (isGoalCompleted(cfg.goalId)) {
        fb.className = 'simulador-feedback fb-ok';
        fb.textContent = '✓ Completat anteriorment.';
      }
      wrapper.appendChild(fb);
    }

    wrapper._ggbId  = cfg.id;
    wrapper._ggbCfg = cfg;
    cfg.div.replaceWith(wrapper);
  });

  // ══════════════════════════════════════════════════════════
  // INJECCIÓ
  //
  // deployggb.js ja està carregat al <head> (síncron).
  // GGBApplet EXISTEIX aquí, garantit.
  // ══════════════════════════════════════════════════════════

  var H;

  entries.forEach(function(cfg) {
    H = Math.round((parseInt(cfg.height, 10) || 420) * 1.1);

    var wrapper = document.getElementById(cfg.id).parentElement;
    // Llegim l'amplada real del contenidor en el moment d'injectar,
    // així el canvas ocupa tota l'amplada disponible (no 640px fix).
    var W = document.getElementById(cfg.id).offsetWidth || 640;

    var ggbParams = {
      appName:             cfg.app || 'classic',
      width:               W,
      height:              H,
      showToolBar:         !cfg.readonly,
      showAlgebraInput:    false,
      showMenuBar:         false,
      enableRightClick:    !cfg.readonly,
      enableLabelDrags:    !cfg.readonly,
      enableShiftDragZoom: true,
      showKeyboardOnFocus: false,
      language:            'ca',
      id:                  cfg.id,
      appletOnLoad: function(api) {
        console.log('[GeoCat] ✓ Applet ' + cfg.id + ' carregat OK');
        wrapper._ggbApi = api;

        // Només Vista Gràfica (amaga la columna d'àlgebra de l'esquerra)
        api.setPerspective('G');

        // Eixos i graella sempre visibles
        api.evalCommand('ShowAxes(true)');
        api.evalCommand('ShowGrid(true)');

        // Comandes inicials
        cfg.commands.forEach(function(cmd) {
          if (cmd) try { api.evalCommand(cmd); } catch(e) {
            console.warn('[GeoCat] evalCommand error:', cmd, e);
          }
        });

        // Objectes fixos
        cfg.fixed.forEach(function(lbl) {
          if (lbl) try {
            api.setFixed(lbl, true, true);
            api.setColor(lbl, 60, 100, 220);
          } catch(e) {}
        });

        // Badge
        var badge = wrapper.querySelector('.ggb-badge');
        if (badge) { badge.textContent = 'llest'; badge.className = 'ggb-badge ggb-ready'; }

        // ── Reset de la validació quan l'usuari modifica la construcció ──
        // Si el badge és ggb-ok o ggb-ko i l'usuari canvia qualsevol objecte,
        // tornem a l'estat "llest" per evitar mostrar un "Correcte" obsolet.
        if (cfg.validator) {
          var _listenerName = cfg.id.replace(/-/g, '_') + '_onChange';
          (function(_wrapper, _badge, _goalId) {
            window[_listenerName] = function() {
              var b = _wrapper.querySelector('.ggb-badge');
              if (b && (b.classList.contains('ggb-ok') || b.classList.contains('ggb-ko'))) {
                b.textContent = 'llest';
                b.className = 'ggb-badge ggb-ready';
                var fb = _wrapper.querySelector('.simulador-feedback');
                if (fb) { fb.className = 'simulador-feedback'; fb.textContent = ''; }
              }
            };
          })(wrapper, badge, cfg.goalId);
          api.registerUpdateListener(_listenerName);
          try { api.registerRemoveListener(_listenerName); } catch(e) {}
        }
      }
    };

    // Toolbar personalitzada: només si l'autor ha posat data-tools="...".
    // Format: IDs numèrics separats per espais, amb ',' '|' '||' per agrupar.
    // Veure https://geogebra.github.io/docs/reference/en/Toolbar/ per la llista.
    if (cfg.tools && cfg.tools.trim()) {
      ggbParams.customToolBar = cfg.tools.trim();
    }

    new GGBApplet(ggbParams, true).inject(cfg.id);
  });
}



// ── Listener de resultats (MANTINGUT per compatibilitat amb
//    pàgines que encara puguin usar iframes) ──────────────────

window.addEventListener('message', function(e) {
  var sameOrigin = e.origin === window.location.origin
                || e.origin === 'null'
                || e.origin === '';
  if (!sameOrigin || !e.data) return;

  if (e.data.type === 'geocat-result') {
    var goalId  = e.data.goalId;
    var success = e.data.success;
    var fb = goalId
      ? document.querySelector('.simulador-feedback[data-goal-id="' + CSS.escape(goalId) + '"]')
      : null;

    if (success) {
      if (fb) { fb.className = 'simulador-feedback fb-ok'; fb.textContent = '✓ Correcte! Construcció validada.'; }
      saveGoalCompleted(goalId);
      _refreshSidebar();
    } else {
      if (fb) { fb.className = 'simulador-feedback fb-ko'; fb.textContent = '✗ Encara no és correcte. Revisa la construcció.'; }
    }
  }
});

// ── Sidebar toggle (hamburger mòbil) ─────────────────────

function initSidebarToggle() {
  var toggle  = document.getElementById('sidebar-toggle');
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebar-overlay');
  if (!toggle || !sidebar) return;

  var open = function() {
    sidebar.classList.add('open');
    if (overlay) overlay.classList.add('visible');
    toggle.setAttribute('aria-expanded', 'true');
  };
  var close = function() {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', function() {
    sidebar.classList.contains('open') ? close() : open();
  });

  if (overlay) overlay.addEventListener('click', close);
}


// Refresca la sidebar actual
function _refreshSidebar() {
  var path = window.location.pathname;
  var capMatch = path.match(/capitol-(\d+)\.html/);
  var repMatch = path.match(/repte-(\d+)\.html/);
  if (capMatch) renderSidebar(parseInt(capMatch[1], 10));
  else if (repMatch) renderReptesSidebar(parseInt(repMatch[1], 10));
}


// ── Glossari — injectat dinàmicament a capítols i reptes ──

function initGlossariCurs() {
  var header = document.querySelector('.curs-header');
  if (!header) return;

  var btn = document.createElement('button');
  btn.className = 'glossari-curs-btn';
  btn.id = 'btn-glossari-curs';
  btn.textContent = '📐 Glossari';
  btn.type = 'button';
  var actions = header.querySelector('.curs-header-actions');
  (actions || header).appendChild(btn);

  var overlay = document.createElement('div');
  overlay.className = 'glossari-overlay';
  overlay.id = 'glossari-overlay';
  overlay.innerHTML = (typeof GLOSSARI_HTML !== 'undefined')
    ? GLOSSARI_HTML
    : '<div class="glossari-modal"><p>Glossari no disponible.</p></div>';
  document.body.appendChild(overlay);

  btn.addEventListener('click', function() { overlay.classList.toggle('is-open'); });
  overlay.querySelector('#glossari-close').addEventListener('click', function() {
    overlay.classList.remove('is-open');
  });
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.classList.remove('is-open');
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') overlay.classList.remove('is-open');
  });
}

// Auto-init
initGlossariCurs();


// ── Exporta ──────────────────────────────────────────────
window.injectCursLogo       = injectCursLogo;
window.renderSidebar        = renderSidebar;
window.renderReptesSidebar  = renderReptesSidebar;
window.renderSimuladors     = renderSimuladors;
window.initSidebarToggle    = initSidebarToggle;
window.initGlossariCurs     = initGlossariCurs;
window.getProgress          = getProgress;
window.saveGoalCompleted    = saveGoalCompleted;
window.isGoalCompleted      = isGoalCompleted;
window.CAPITOLS_DATA        = CAPITOLS_DATA;
window.REPTES_DATA          = REPTES_DATA;
