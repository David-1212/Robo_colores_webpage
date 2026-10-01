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
   * Va pegado al borde izquierdo (zona libre en todos los juegos) y se
   * desvanece solo tras unos segundos de inactividad para no estorbar; al
   * mover el raton o tocar la pantalla vuelve a aparecer. */
  function injectExit() {
    var doc = global.document;
    if (doc.getElementById('papirolas-exit')) return;

    var style = doc.createElement('style');
    style.textContent =
      '#papirolas-exit{position:fixed;top:70px;left:10px;' +
      'z-index:9998;display:inline-flex;align-items:center;justify-content:center;' +
      'width:36px;height:36px;padding:0;border-radius:50%;' +
      'border:1px solid rgba(0,229,255,.45);background:rgba(6,10,24,.7);' +
      'color:#d8f6ff;cursor:pointer;backdrop-filter:blur(6px);' +
      'box-shadow:0 4px 16px rgba(0,0,0,.45);opacity:.5;' +
      'transition:opacity .25s ease,transform .15s ease}' +
      '#papirolas-exit:hover,#papirolas-exit:focus-visible{opacity:1;transform:scale(1.1)}' +
      '#papirolas-exit:active{transform:scale(.94)}' +
      '#papirolas-exit.is-idle{opacity:0}';

    var btn = doc.createElement('button');
    btn.id = 'papirolas-exit';
    btn.type = 'button';
    btn.title = 'Regresar al men\u00fa';
    btn.setAttribute('aria-label', 'Regresar al men\u00fa');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
      'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M15 5 L8 12 L15 19"/></svg>';
    btn.addEventListener('click', function () { global.papirolasGoMenu(); });

    doc.head.appendChild(style);
    doc.body.appendChild(btn);

    var idle = null;
    var wake = function () {
      btn.classList.remove('is-idle');
      if (idle) clearTimeout(idle);
      idle = setTimeout(function () { btn.classList.add('is-idle'); }, 3000);
    };
    ['pointermove', 'pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
      global.addEventListener(ev, wake, { passive: true });
    });
    wake();
  }

  if (IN_FRAME) {
    /* El boton de pantalla completa del juego queda sin efecto dentro del
     * hub (el fullscreen lo controla el menu), asi que se oculta. */
    global.addEventListener('DOMContentLoaded', function () {
      var own = global.document.getElementById('fs-btn');
      if (own) own.style.display = 'none';
    });
  }

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', injectExit);
  } else {
    injectExit();
  }
})(window);
