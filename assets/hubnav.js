/* hubnav.js - Puente de navegacion con el menu (hub).
 *
 * El menu carga los juegos dentro de un iframe a pantalla completa para que el
 * modo pantalla completa NO se apague al cambiar de juego (los navegadores
 * apagan el fullscreen en cualquier navegacion de pagina).
 *
 * Cuando un juego corre dentro del hub, sus botones de "volver al menu" no
 * navegan: avisan al menu mediante postMessage para que solo se cierre el
 * iframe. Si el juego se abre directamente (fuera del hub), se comporta como
 * siempre, y se inyecta un boton fijo de salida al menu.
 */
(function (global) {
  'use strict';

  var IN_FRAME = !!(global.parent && global.parent !== global);

  global.PAPIROLAS_IN_FRAME = IN_FRAME;

  /* Dentro del hub el fullscreen ya lo controla el menu. Se anula la
   * peticion de fullscreen del propio juego para que no se vuelva a meter
   * solo y pelee con el boton "SALIR DE PANTALLA COMPLETA" del hub. */
  if (IN_FRAME) {
    try {
      var noop = function () { return Promise.resolve(); };
      global.document.documentElement.requestFullscreen = noop;
      global.document.documentElement.webkitRequestFullscreen = noop;
    } catch (e) { }
  }

  global.papirolasGoMenu = function () {
    if (IN_FRAME) {
      try {
        global.parent.postMessage({ type: 'papirolas:menu' }, '*');
      } catch (e) { /* sin padre accesible: no hay nada que hacer */ }
      return;
    }
    global.location.href = 'menu.html';
  };

  /* Boton fijo de "salir al menu", siempre visible durante la partida.
   * Solo se inyecta fuera del hub: dentro, la barra del menu ya lo muestra
   * por encima del juego y dos botones serian redundantes. */
  function injectExit() {
    var doc = global.document;
    if (doc.getElementById('papirolas-exit')) return;

    var style = doc.createElement('style');
    style.textContent =
      '#papirolas-exit{position:fixed;top:74px;left:50%;transform:translateX(-50%);' +
      'z-index:9998;display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 18px;' +
      'border-radius:999px;border:1px solid rgba(0,229,255,.45);background:rgba(6,10,24,.74);' +
      'color:#d8f6ff;font-family:inherit;font-size:12px;font-weight:800;letter-spacing:.14em;' +
      'cursor:pointer;backdrop-filter:blur(6px);box-shadow:0 6px 22px rgba(0,0,0,.5);' +
      'opacity:.88;transition:opacity .2s ease,transform .15s ease}' +
      '#papirolas-exit:hover{opacity:1;transform:translateX(-50%) scale(1.05)}' +
      '#papirolas-exit:active{transform:translateX(-50%) scale(.97)}';

    var btn = doc.createElement('button');
    btn.id = 'papirolas-exit';
    btn.type = 'button';
    btn.textContent = '\u2190 SALIR AL MEN\u00da';
    btn.setAttribute('aria-label', 'Salir al men\u00fa');
    btn.addEventListener('click', function () { global.papirolasGoMenu(); });

    doc.head.appendChild(style);
    doc.body.appendChild(btn);
  }

  if (IN_FRAME) {
    /* El boton de pantalla completa del juego queda sin efecto dentro del
     * hub (el fullscreen lo controla el menu), asi que se oculta. */
    global.addEventListener('DOMContentLoaded', function () {
      var own = global.document.getElementById('fs-btn');
      if (own) own.style.display = 'none';
    });
  } else if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', injectExit);
  } else {
    injectExit();
  }
})(window);
