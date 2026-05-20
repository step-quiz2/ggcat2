// ════════════════════════════════════════════════════════
// curs/glossari-data.js — Contingut HTML del glossari GeoCat
//
// ESCALAR: afegeix seccions aquí quan es cobreixin nous
// conceptes als capítols.
// ════════════════════════════════════════════════════════

var GLOSSARI_HTML = `
    <div class="glossari-modal" id="glossari-modal">
      <div class="glossari-header">
        <span class="glossari-title">📐 Glossari GeoGebra</span>
        <button class="glossari-close" id="glossari-close" aria-label="Tanca" type="button">✕</button>
      </div>
      <div class="glossari-body">

        <div class="glossari-section">
          <h3>Punts i coordenades</h3>
          <p class="glossari-hint">Els punts s'escriuen amb majúscula. Les coordenades van entre parèntesis.</p>
          <div class="glossari-grid">
            <code>A=(3,2)</code><span>Crea el punt A a les coordenades (3, 2)</span>
            <code>Punt(3,2)</code><span>Crea un punt anònim a (3, 2)</span>
            <code>PuntMig(A,B)</code><span>Punt mig del segment AB</span>
            <code>Punt(s,0.5)</code><span>Punt a la meitat del camí <code>s</code></span>
          </div>
        </div>

        <div class="glossari-section">
          <h3>Rectes i segments</h3>
          <div class="glossari-grid">
            <code>Segment(A,B)</code><span>Segment entre els punts A i B</span>
            <code>Recta(A,B)</code><span>Recta que passa pels punts A i B</span>
            <code>Raig(A,B)</code><span>Raig des d'A cap a B</span>
            <code>Perpendicular(A,f)</code><span>Recta perpendicular a <code>f</code> passant per A</span>
            <code>Paral·lela(f,A)</code><span>Recta paral·lela a <code>f</code> passant per A</span>
            <code>Mediatriu(A,B)</code><span>Mediatriu del segment AB</span>
          </div>
        </div>

        <div class="glossari-section">
          <h3>Circumferències</h3>
          <div class="glossari-grid">
            <code>Cercle(A,r)</code><span>Circumferència de centre A i radi <code>r</code></span>
            <code>Cercle(A,B)</code><span>Circumferència de centre A passant per B</span>
            <code>Cercle(A,B,C)</code><span>Circumferència pels tres punts A, B, C</span>
            <code>CercleInscrit(p)</code><span>Cercle inscrit en el polígon <code>p</code></span>
            <code>CercleCircumscrit(p)</code><span>Cercle circumscrit al polígon <code>p</code></span>
          </div>
        </div>

        <div class="glossari-section">
          <h3>Polígons</h3>
          <div class="glossari-grid">
            <code>Polígon(A,B,C)</code><span>Triangle amb vèrtexs A, B, C</span>
            <code>Polígon(A,B,C,D)</code><span>Quadrilàter ABCD</span>
            <code>PolígonRegular(A,B,n)</code><span>Polígon regular de <code>n</code> costats sobre AB</span>
          </div>
        </div>

        <div class="glossari-section">
          <h3>Mesures</h3>
          <div class="glossari-grid">
            <code>Distància(A,B)</code><span>Distància entre els punts A i B</span>
            <code>Longitud(s)</code><span>Longitud del segment o arc <code>s</code></span>
            <code>Angle(A,B,C)</code><span>Angle format per BA i BC (vèrtex a B)</span>
            <code>Àrea(p)</code><span>Àrea del polígon o figura <code>p</code></span>
            <code>Perímetre(p)</code><span>Perímetre del polígon <code>p</code></span>
          </div>
        </div>

        <div class="glossari-section">
          <h3>Construccions clàssiques</h3>
          <div class="glossari-grid">
            <code>Mediatriu(A,B)</code><span>Mediatriu d'un segment (perpendicular pel punt mig)</span>
            <code>Bisectriu(f,g)</code><span>Bisectriu de l'angle entre les rectes <code>f</code> i <code>g</code></span>
            <code>Perpendicular(A,f)</code><span>Perpendicular a <code>f</code> per A</span>
            <code>Paral·lela(f,A)</code><span>Paral·lela a <code>f</code> per A</span>
          </div>
        </div>

        <div class="glossari-section">
          <h3>Transformacions</h3>
          <div class="glossari-grid">
            <code>Translació(obj,v)</code><span>Translació de <code>obj</code> pel vector <code>v</code></span>
            <code>Rotació(obj,A,α)</code><span>Rotació de <code>obj</code> al voltant d'A un angle <code>α</code></span>
            <code>Reflexió(obj,f)</code><span>Reflexió de <code>obj</code> respecte la recta <code>f</code></span>
            <code>Homotècia(obj,A,k)</code><span>Homotècia de centre A i raó <code>k</code></span>
          </div>
        </div>

        <div class="glossari-section">
          <h3>Funcions i gràfiques</h3>
          <p class="glossari-hint">Les funcions es defineixen amb la sintaxi <code>f(x) = expressió</code></p>
          <div class="glossari-grid">
            <code>f(x)=x^2-3</code><span>Defineix la funció quadràtica f</span>
            <code>f(x)=2x+1</code><span>Defineix la funció lineal f</span>
            <code>Intersecció(f,g)</code><span>Punts d'intersecció de dues corbes</span>
            <code>Intersecció(f,eixX)</code><span>Zeros de la funció f</span>
            <code>Arrel(f,a,b)</code><span>Zero de f en l'interval [a,b]</span>
          </div>
        </div>

        <div class="glossari-section">
          <h3>Lliscadors i dinàmica</h3>
          <div class="glossari-grid">
            <code>Lliscador(min,max,pas)</code><span>Crea un lliscador amb rang i pas</span>
            <code>Lloc(B,A)</code><span>Lloc geomètric de B quan A es mou</span>
            <code>Seqüència(exp,var,i,f)</code><span>Seqüència d'objectes</span>
          </div>
        </div>

        <div class="glossari-section">
          <h3>Termes geomètrics</h3>
          <div class="glossari-grid">
            <code>punt</code><span>Element sense dimensions, posició en el pla</span>
            <code>recta</code><span>Línia infinita que passa per dos punts</span>
            <code>segment</code><span>Part d'una recta limitada per dos punts</span>
            <code>circumferència</code><span>Corba tancada de punts equidistants d'un centre</span>
            <code>radi</code><span>Distància del centre a qualsevol punt de la circumferència</span>
            <code>diàmetre</code><span>Corda que passa pel centre; val 2r</span>
            <code>mediatriu</code><span>Perpendicular al punt mig d'un segment</span>
            <code>bisectriu</code><span>Semirecta que divideix un angle en dues parts iguals</span>
            <code>polígon</code><span>Figura plana tancada formada per segments</span>
            <code>triangle</code><span>Polígon de tres costats</span>
            <code>quadrilàter</code><span>Polígon de quatre costats</span>
            <code>translació</code><span>Desplaçament d'un objecte sense canviar orientació</span>
            <code>rotació</code><span>Gir d'un objecte al voltant d'un centre</span>
            <code>reflexió</code><span>Simetria d'un objecte respecte un eix</span>
            <code>lloc geomètric</code><span>Conjunt de punts que compleixen una condició</span>
          </div>
        </div>

        <div class="glossari-section glossari-rules">
          <h3>Recorda</h3>
          <div class="glossari-rule">① Els punts s'escriuen amb <strong>majúscula</strong>: <code>A</code>, <code>B</code>, <code>P</code></div>
          <div class="glossari-rule">② Les rectes i funcions s'escriuen amb <strong>minúscula</strong>: <code>f</code>, <code>g</code>, <code>r</code></div>
          <div class="glossari-rule">③ Per crear un objecte, escriu la comanda al camp d'entrada i prem <code>Enter</code></div>
          <div class="glossari-rule">④ Pots fer clic dret sobre qualsevol objecte per veure les seves propietats</div>
          <div class="glossari-rule">⑤ Usa el botó <strong>Reinicia</strong> per tornar a l'estat inicial de l'exercici</div>
        </div>

      </div>
    </div>`;
