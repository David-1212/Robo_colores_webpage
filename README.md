# ROBO·COLORES

Duelo de memoria con colores secundarios para dos jugadores, construido con **HTML5 + CSS3 + JavaScript** y renderizado 3D con **Three.js**.

En la fábrica de colores de *Pixelópolis*, el malvado *Dr. Gris* dejó apagados a los cinco robots. Dos jugadores compiten repitiendo de memoria secuencias de colores: cada acierto restaura una parte del robot y quien complete la secuencia primero lo devuelve a la vida.

---

## Características

- Duelo simultáneo de memoria para **2 jugadores** en el mismo teclado.
- **5 robots avatares** modelados en 3D que se colorean por partes al acertar: `VOLT`, `NOVA`, `TURBO`, `PIXEL` y `LUNA`.
- Los robots avanzan **uno después de otro**; los triunfos de cada uno se acumulan entre rondas.
- **Dificultad progresiva por robot**: VOLT inicia con secuencias de 3 colores y cada robot siguiente suma uno, hasta LUNA con 7. La velocidad de demostración también aumenta con la dificultad.
- Efectos visuales: partículas, confeti, destellos, animaciones de baile y modo triste.
- Efectos de sonido generados con **Web Audio API** (una nota musical por color).
- Interfaz responsive con soporte táctil.

## Cómo jugar

1. Presiona **JUGAR**; el primer robot (VOLT) muestra secuencias de 3 colores.
2. Observa la secuencia de colores que muestra la máquina arcoíris.
3. Tras la cuenta regresiva, ambos jugadores repiten la secuencia al mismo tiempo.
4. Gana quien complete primero la secuencia completa.
5. Un color equivocado significa derrota inmediata.
6. Al terminar, pasa al siguiente robot con una secuencia más larga y rápida.

### Controles

| Jugador | Acción | Teclas |
|---|---|---|
| Jugador 1 | Seleccionar color | `1` `2` `3` `4` `5` `6` `7` |
| Jugador 2 | Seleccionar color | `A` `S` `D` `F` `G` `H` `J` |

También es posible jugar tocando los botones en pantalla (ideal para tablet).

### Colores del juego

Verde · Naranja · Violeta · Cian · Magenta · Amarillo · Azul

### Dificultad por robot

| Robot | Colores | Velocidad de la secuencia |
|---|---|---|
| VOLT | 3 | Muy lenta (1.7 s por color) |
| NOVA | 4 | Lenta |
| TURBO | 5 | Media |
| PIXEL | 6 | Rápida |
| LUNA | 7 | Muy rápida (1 s por color) |

## Requisitos

- Navegador moderno (Chrome, Edge, Firefox o Safari).
- Conexión a internet en la primera carga (Three.js r128 y la fuente *Baloo 2* se cargan desde CDN).

## Puesta en marcha

No requiere instalación ni compilación. Opciones:

**Opción 1 — Abrir directamente**

Abrir `index.html` en el navegador.

**Opción 2 — Servidor local (recomendado)**

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

Luego visitar `http://localhost:8000`.

## Estructura del proyecto

```
juego_papirolas/
├── index.html        # Redirige a menu.html (punto de entrada)
├── menu.html         # Menú principal del hub con los 4 juegos
├── robotcolores.html # ROBO·COLORES (duelo de memoria en 3D)
├── game.js           # Lógica de ROBO·COLORES: escena 3D, robots, audio
├── styles.css        # Estilos de ROBO·COLORES
├── secuenciador.html # Secuenciador 3D de 9 cubos
├── snake.html        # Serpiente 3D con mezcla de colores
├── pacman.html       # Pac-Man clásico con mezcla cromática
└── assets/video/     # (opcional) Videos de introducción
    ├── volt.mp4      # Video explicativo antes de cada ronda
    ├── nova.mp4
    ├── turbo.mp4
    ├── pixel.mp4
    └── luna.mp4
```

### Menú principal

- `index.html` redirige al **`menu.html`**, que es el único menú de toda la colección.
- El menú muestra una tarjeta por juego (**ROBO·COLORES**, **SECUENCIADOR 3D**, **SERPIENTE 3D** y **PACMAN**) sobre un **fondo 3D animado de Three.js** (figuras de colores flotando en órbita).
- Los menús internos que traían los juegos del git fueron eliminados.
- Antes de empezar cada juego se muestra una **ventana de reglas** (como en ROBO·COLORES); se inicia con el botón **JUGAR**.
- Todos los juegos tienen un control (botón de casita en el HUD y/o un botón "VOLVER AL MENÚ") que regresa al `menu.html`.

### Videos de introducción (opcional)

- Antes de cada ronda de ROBO·COLORES se intenta reproducir el video del robot (`volt.mp4`, `nova.mp4`, …). Si el archivo no existe, la ronda continúa directamente.
- Si el navegador bloquea el audio automático, aparece un botón **TOCA PARA VER EL VIDEO**.
- Nota: los videos solo funcionan sirviendo el juego con un servidor local (`python -m http.server`); abriendo los archivos directo desde disco, el juego funciona pero omite los videos.

### Arquitectura de `game.js`

| Módulo | Responsabilidad |
|---|---|
| Constantes (`PALETTE`, `ROSTER`, teclas) | Datos de colores, robots y controles |
| Audio | Notas y efectos sintetizados con Web Audio API |
| Escena | Cámara, luces, escenario, estrellas y anillos |
| Clase `Robot` | Modelo 3D, coloreo por zonas, baile y animaciones |
| Builders | Una función constructora por robot |
| Máquina de estados | `menu → show → input → over` |
| Flujo de juego | Generación de secuencia, demostración, turnos y resultados |

## Tecnologías

- [Three.js r128](https://threejs.org/) — renderizado 3D y materiales físicos.
- [Web Audio API](https://developer.mozilla.org/es/docs/Web/API/Web_Audio_API) — síntesis de sonidos.
- Google Fonts — tipografía *Baloo 2*.

## Licencia

Proyecto educativo de uso libre.
