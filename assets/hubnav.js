/* hubnav.js - Puente de navegacion con el menu (hub).
 *
 * El menu carga los juegos dentro de un iframe a pantalla completa para que el
 * modo pantalla completa NO se apague al cambiar de juego (los navegadores
 * apagan el fullscreen en cualquier navegacion de pagina).
 *
 * Cuando un juego corre dentro del hub, sus botones de "volver al menu" no
 * navegan: avisan al menu mediante postMessage para que solo se关闭 el iframe.
 * Si el juego se abre directamente (fuera del hub), se comporta como siempre.
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
})(window);
