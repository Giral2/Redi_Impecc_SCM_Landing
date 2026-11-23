// Chequeos básicos del sitio estático: sin dependencias, solo Node.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const errores = [];

// 1. El JavaScript debe tener sintaxis válida.
try {
  execFileSync(process.execPath, ['--check', 'assets/script.js'], { stdio: 'pipe' });
} catch (e) {
  errores.push(`assets/script.js tiene un error de sintaxis:\n${e.stderr}`);
}

// Páginas del sitio (los .html de la raíz) y los ids que tiene cada una.
const paginas = readdirSync('.').filter((f) => f.endsWith('.html'));
const htmls = Object.fromEntries(paginas.map((p) => [p, readFileSync(p, 'utf8')]));
const idsDe = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const ids = Object.fromEntries(paginas.map((p) => [p, idsDe(htmls[p])]));

let archivos = 0;
let enlaces = 0;

for (const pagina of paginas) {
  const html = htmls[pagina];

  // 2. Los archivos locales que enlaza la página deben existir.
  const locales = new Set([...html.matchAll(/(?:href|src)="(assets\/[^"#?]+)"/g)].map((m) => m[1]));
  for (const ruta of locales) {
    if (!existsSync(ruta)) errores.push(`${pagina}: falta el archivo enlazado ${ruta}`);
  }
  archivos += locales.size;

  // 3. Cada enlace interno debe llevar a algo que exista:
  //    "#id"           -> un id de esta misma página
  //    "otra.html"     -> una página del sitio
  //    "otra.html#id"  -> una página del sitio que tenga ese id
  const internos = new Set(
    [...html.matchAll(/href="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((h) => h.startsWith('#') || /^[\w-]+\.html(#.*)?$/.test(h))
  );
  for (const h of internos) {
    const [destino, id] = h.startsWith('#') ? [pagina, h.slice(1)] : h.split('#');
    if (!paginas.includes(destino)) {
      errores.push(`${pagina}: el enlace ${h} apunta a una página que no existe`);
    } else if (id && !ids[destino].has(id)) {
      errores.push(`${pagina}: el enlace ${h} no apunta a ningún id de ${destino}`);
    }
  }
  enlaces += internos.size;
}

if (errores.length) {
  console.error(errores.join('\n'));
  process.exit(1);
}
console.log(
  `OK: JS válido; ${paginas.length} páginas, ${archivos} archivos locales y ${enlaces} enlaces internos revisados.`
);
