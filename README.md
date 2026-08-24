# ROBO·COLORES

Duelo de memoria con colores secundarios para dos jugadores, construido con **HTML5 + CSS3 + JavaScript** y renderizado 3D con **Three.js**.

En la fábrica de colores de *Pixelópolis*, el malvado *Dr. Gris* dejó apagados a los cinco robots. Dos jugadores compiten repitiendo de memoria secuencias de colores: cada acierto restaura una parte del robot y quien complete la secuencia primero lo devuelve a la vida.

---

## Características

- Duelo simultáneo de memoria para **2 jugadores** en el mismo teclado.
- **5 robots avatares** modelados en 3D que se colorean por partes al acertar: `VOLT`, `NOVA`, `TURBO`, `PIXEL` y `LUNA`.
- Los robots avanzan **uno después de otro**; los triunfos de cada uno se acumulan entre rondas.
- **4 niveles de dificultad**: secuencias de 4 a 7 colores.
- Efectos visuales: partículas, confeti, destellos, animaciones de baile y modo triste.
- Efectos de sonido generados con **Web Audio API** (una nota musical por color).
- Interfaz responsive con soporte táctil.

## Cómo jugar

1. Elige la dificultad (longitud de la secuencia) y presiona **JUGAR**.
2. Observa la secuencia de colores que muestra la máquina arcoíris.
3. Tras la cuenta regresiva, ambos jugadores repiten la secuencia al mismo tiempo.
4. Gana quien complete primero la secuencia completa.
5. Un color equivocado significa derrota inmediata.

### Controles

| Jugador | Acción | Teclas |
|---|---|---|
| Jugador 1 | Seleccionar color | `1` `2` `3` `4` `5` `6` `7` |
| Jugador 2 | Seleccionar color | `A` `S` `D` `F` `G` `H` `J` |

También es posible jugar tocando los botones en pantalla (ideal para tablet).

### Colores del juego

Verde · Naranja · Violeta · Cian · Magenta · Lima · Turquesa

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
├── index.html    # Estructura de la interfaz (HUD, menú, resultados)
├── styles.css    # Estilos organizados por secciones + responsive
└── game.js       # Lógica completa: escena 3D, robots, estados, audio
```

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
