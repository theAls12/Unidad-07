// Empaquetador: convierte src/ en un único HTML autocontenido (docs/index.html).
// Uso: node build.mjs        (no necesita instalar nada, solo Node 18+)
//
// Qué hace:
//  1. Genera src/js/01-assets.gen.js con los modelos y texturas de src/assets/ en base64
//     (ver ASSETS). Así src/index.html también funciona abriéndolo desde disco.
//  2. Lee src/index.html.
//  3. Sustituye cada <link rel="stylesheet" href="..."> local por un <style> con su CSS,
//     y mete fuentes e imágenes (url(...) del CSS y <img src> del HTML) como data-URI.
//  4. Une los scripts del bloque <!-- build:scripts --> en un solo <script>, envuelto como
//     estaba en el juego original (ver WRAP), y mete las librerías de vendor/.
//  5. Escribe docs/index.html: es a la vez la web de GitHub Pages y el archivo para jugar offline.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'docs', 'index.html');
// Cómo se envuelve el código unido:
//   'iife'   → (()=>{ 'use strict'; … })();   (nada queda global)
//   'script' → 'use strict'; …                 (un único <script> en modo estricto)
//   'plain'  → …                               (un único <script> normal)
const WRAP = 'plain';

// Recursos que el juego lee de las constantes HAND_GLB y ASSET (en este orden).
// Para cambiar un modelo o una textura, sustituye el archivo y vuelve a ejecutar el build.
const ASSETS = {
  header: [
    '/* Hand meshes: WebXR Input Profiles generic-hand, (c) 2019 Amazon, MIT License */',
    '/* Third-party assets: Gas Mask and Swat characters (Mixamo, supplied by the user); locomotion clips from Soldier.glb (Mixamo, three.js examples); brick, hardwood, checkerboard floor, grass, lens dirt textures (three.js examples). */'
  ],
  HAND_GLB: { left: 'models/hand_left.glb', right: 'models/hand_right.glb' },
  ASSET: {
    char_sol2: 'models/char_sol2.glb', anims: 'models/anims.glb', char_gas: 'models/char_gas.glb',
    brick_d: 'textures/brick_d.webp', brick_b: 'textures/brick_b.webp', brick_r: 'textures/brick_r.webp',
    wood_d: 'textures/wood_d.webp', wood_b: 'textures/wood_b.webp', wood_r: 'textures/wood_r.webp',
    checker_d: 'textures/checker_d.webp', checker_n: 'textures/checker_n.webp',
    grass_d: 'textures/grass_d.webp', lensdirt: 'textures/lensdirt.webp'
  }
};

const MIME = { '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.gif': 'image/gif', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.glb': 'model/gltf-binary' };

const isLocal = (p) => !/^(https?:|data:|\/\/)/.test(p);
const b64 = (file) => readFileSync(file).toString('base64');
const dataUri = (file) => {
  const mime = MIME[extname(file).toLowerCase()];
  if (!mime) throw new Error(`Tipo de archivo sin MIME conocido: ${file}`);
  return `data:${mime};base64,${b64(file)}`;
};

// 1. Recursos embebidos
if (ASSETS) {
  const obj = (map) => Object.entries(map).map(([k, f]) => `${k}:'${b64(join(SRC, 'assets', f))}'`);
  const gen = [
    '// ARCHIVO GENERADO por build.mjs a partir de src/assets/ — no lo edites a mano.',
    ASSETS.header[0],
    `const HAND_GLB={${obj(ASSETS.HAND_GLB).join(',')}};`,
    ASSETS.header[1],
    'const ASSET={',
    obj(ASSETS.ASSET).join(',\n') + ',',
    '};'
  ].join('\n');
  writeFileSync(join(SRC, 'js', '01-assets.gen.js'), gen + '\n');
}

function inlineCss(cssPath) {
  const css = readFileSync(cssPath, 'utf8');
  return css.replace(/url\((['"]?)([^'")]+)\1\)/g, (m, q, url) =>
    isLocal(url) ? `url(${dataUri(join(dirname(cssPath), url))})` : m);
}

let html = readFileSync(join(SRC, 'index.html'), 'utf8');

// CSS
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (m, href) =>
  isLocal(href) ? `<style>\n${inlineCss(join(SRC, href)).trim()}\n</style>` : m);

// Imágenes del HTML
html = html.replace(/<img([^>]*?) src="([^"]+)"/g, (m, attrs, src) =>
  isLocal(src) ? `<img${attrs} src="${dataUri(join(SRC, src))}"` : m);

// JS: el bloque marcado se une en un único script
html = html.replace(/<!-- build:scripts[^>]*-->([\s\S]*?)<!-- \/build:scripts -->/, (m, block) => {
  const files = [...block.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  if (!files.length) throw new Error('El bloque build:scripts está vacío');
  const body = files.map((f) => {
    // quita solo el 'use strict' de cabecera de cada archivo (justo tras su comentario inicial)
    const code = readFileSync(join(SRC, f), 'utf8').replace(/^(\/\*[^\n]*\*\/\n)?'use strict';\n/, '$1');
    return `// ---- ${f} ----\n${code.trim()}`;
  }).join('\n\n').replace(/<\/script/gi, '<\\/script');
  if (WRAP === 'iife') return `<script>\n(()=>{\n'use strict';\n${body}\n})();\n</script>`;
  if (WRAP === 'script') return `<script>\n'use strict';\n${body}\n</script>`;
  return `<script>\n${body}\n</script>`;
});

// Cualquier otro <script src> local suelto (las librerías de vendor/)
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) =>
  isLocal(src) ? `<script>\n${readFileSync(join(SRC, src), 'utf8').replace(/<\/script/gi, '<\\/script')}\n</script>` : m);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
console.log(`OK → ${OUT} (${(html.length / 1024).toFixed(0)} KB)`);
