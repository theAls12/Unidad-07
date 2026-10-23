# Unidad 07

Shooter en primera persona con estética de cámara corporal, en el navegador.
Tres zonas (Instituto San Telmo, Pinar de Montseny y Al-Qasr), tres modos (todos contra todos,
deathmatch por equipos y juego de armas), bots, rachas, perro, torreta y dron.

**Jugar online:** https://theals12.github.io/Unidad-07/
**Jugar offline:** descarga [`docs/index.html`](docs/index.html) (botón *Download raw file*) y ábrelo con doble clic.
Lleva todo dentro (three.js, modelos, texturas y tipografías): no necesita internet.

Los controles están en el propio juego, en **Ajustes**. Funciona con teclado y ratón, mando y táctil.

> **Multijugador:** las salas (*Crear sala* / *Unirse*) usan el sistema de salas de los artefactos
> de Claude, así que **solo funcionan abriendo el juego como artefacto en Claude**. Desde GitHub Pages
> o desde el archivo offline se juega en solitario contra bots.

## Cómo está organizado

```
src/                          ← el juego, partido en archivos (aquí es donde se edita)
  index.html                  ← la página: menú, HUD, paneles y lista de scripts
  css/
    fonts.css                 ← Barlow Condensed e IBM Plex Mono (locales, antes venían de Google Fonts)
    style.css                 ← menú, HUD y paneles
  js/                         ← se cargan en este orden
    01-assets.gen.js            GENERADO por el build a partir de src/assets/ (no se sube a git)
    02-meshopt-decoder.js       descompresor de las mallas (meshoptimizer, MIT)
    10-util.js                  matemáticas, ruido y aleatoriedad
    11-asset-loading.js         lectura de los recursos embebidos
    12-textures.js              texturas procedurales, PBR y sprites
    13-materials.js             materiales
    14-renderer.js              WebGL, postproceso, calidad
    15-level-geometry.js        cajas, paredes, luces y calcas
    16-collision-nav.js         colisiones, rayos y navegación de bots
    17-sky-weather.js           cielo y lluvia
    18-props.js                 mesas, cajas, barriles, coches, autobús…
    19-map-school.js            mapa: Instituto San Telmo
    20-map-forest.js            mapa: Pinar de Montseny
    21-map-desert.js            mapa: Al-Qasr
    22-maps.js                  lista de mapas, hora del día, carga de mapa
    23-weapons-data.js          armas, clases, trajes, modos (aquí se ajustan daños, cargadores…)
    24-dog-turret.js            perro y torreta
    25-fx.js                    partículas, trazadoras, impactos
    26-gun-models.js            modelos de armas y miras
    27-arms-hands.js            brazos y manos en primera persona
    28-characters.js            personajes Mixamo: animación, IK y ragdoll
    29-audio.js                 disparos, pasos, ambiente, radio
    30-state.js                 estado global de la partida
    31-input.js                 teclado, ratón, mando y táctil
    32-player.js                equipamiento, aparición, movimiento, cámara
    33-combat.js                disparos, daño y cuerpo a cuerpo
    34-bots.js                  inteligencia de los bots
    35-equipment-streaks.js     minas, granadas, habilidades, rachas y botín
    36-modes.js                 reglas de cada modo
    37-network.js               jugadores remotos y salas (solo dentro de Claude)
    38-hud.js                   marcador, minimapa, dron, burn-in de la cámara
    39-menu.js                  menú y pausa
    40-game-flow.js             iniciar y salir de partida, vista previa
    41-main.js                  bucle principal y arranque
  assets/
    models/                   ← personajes (Gas Mask y SWAT de Mixamo), animaciones y manos (.glb)
    textures/                 ← ladrillo, madera, suelo, hierba y suciedad de lente (.webp)
    fonts/                    ← .woff2
  vendor/                     ← three.js r128, GLTFLoader y SkeletonUtils (las mismas versiones que antes)
build.mjs                     ← empaquetador: junta src/ en un solo HTML
docs/index.html               ← resultado del build (lo que sirve GitHub Pages y el archivo offline)
```

## Editar y publicar

1. Ejecuta `node build.mjs` una vez (necesita [Node.js](https://nodejs.org) 18 o superior; no hay que instalar nada más).
   Esto genera `src/js/01-assets.gen.js`, que `src/index.html` necesita para cargar modelos y texturas.
2. Cambia lo que necesites en `src/`. Para probarlo, abre `src/index.html` en el navegador.
3. Vuelve a ejecutar `node build.mjs` y sube los cambios. GitHub Pages publica `docs/index.html` en un par de minutos.

Para cambiar un modelo o una textura, sustituye el archivo en `src/assets/` con el mismo nombre y haz el build.

## Notas

- El código venía **minificado** (todo en una línea). Se ha formateado con Prettier para poder leerlo
  y repartirlo; los nombres de las variables internas siguen siendo cortos (`e`, `t`, `o`…) porque así
  venían, pero los de las funciones y datos principales se conservan.
- Los modelos de personaje son de Mixamo y el repo es público: el juego puede usarlos, pero conviene
  no redistribuirlos sueltos fuera del juego.
