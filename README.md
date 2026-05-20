# GeoCat

Aprendre GeoGebra en català — curs interactiu al navegador.

## Què és

GeoCat és un curs de geometria interactiva amb GeoGebra, pensat per a estudiants d'ESO i Batxillerat. Inclou capítols guiats i reptes amb validació automàtica. Tot funciona directament al navegador, sense instal·lació ni comptes. Per a la pràctica lliure, l'alumne pot fer servir directament la seva instal·lació preferida de GeoGebra (web, escriptori o mòbil).

## Com obrir-lo

Obre `index.html` al navegador. Des d'allà pots accedir a:
- **Capítols** (`curs/capitol-1.html` ... `capitol-10.html`) — Lliçons guiades amb widgets interactius i un exercici final validat ✓/✗.
- **Reptes** (`curs/repte-1.html` ... `repte-10.html`) — Exercicis amb validació automàtica ✓/✗.

Cal connexió a internet per carregar GeoGebra des del CDN (`geogebra.org`).

## Estructura

```
index.html              Landing page
style.css               Estils compartits (topbar, botons, temes)
curs/
  index.html            Índex del curs (llista de capítols i reptes)
  capitol-N.html        10 capítols del curs
  repte-N.html          10 reptes (de 30 previstos)
  curs.css              Estils del curs
  capitols.js           Dades, sidebar, injecció de widgets, progrés, glossari
  geovalidator.js       Llibreria d'assertions geomètriques (objecte GV)
  validators.js         Mapa goalId → funció validadora per a cada exercici
  glossari-data.js      Contingut HTML del glossari de comandes
REPTES_SPECIFICATION.md Especificació dels 30 reptes candidats
TODO.md                 Tasques pendents
test-validators.js      Test harness Node per als validators (opcional)
```

## Estat del projecte

- 10 capítols: ✅ complets (amb exercici validat al final)
- 10 reptes (fàcils + mitjans): ✅ complets
- 20 reptes (mitjans + difícils): ⬜ pendents (especificats a `REPTES_SPECIFICATION.md`)

## Progrés de l'alumne

Es guarda localment al navegador (`localStorage`, clau `geocat_progress`). Cap dada s'envia a cap servidor.
