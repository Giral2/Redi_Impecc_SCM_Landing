// Chequeos básicos del sitio estático: sin dependencias, solo Node.
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const errores = [];
const html = readFileSync('index.html', 'utf8');

// 1. El JavaScript debe tener sintaxis válida.
try {
  execFileSync(process.execPath, ['--check', 'assets/script.js'], { stdio: 'pipe' });
} catch (e) {
  errores.push(`assets/script.js tiene un error de sintaxis:\n${e.stderr}`);
}

// 2. Los archivos locales que enlaza index.html deben existir.
const locales = [...html.matchAll(/(?:href|src)="(assets\/[^"#?]+)"/g)].map((m) => m[1]);
for (const ruta of new Set(locales)) {
  if (!existsSync(ruta)) errores.push(`Falta el archivo enlazado: ${ruta}`);
}

// 3. Cada enlace interno (#algo) debe apuntar a un id que exista.
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const anclas = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
for (const ancla of new Set(anclas)) {
  if (!ids.has(ancla)) errores.push(`El enlace #${ancla} no apunta a ningún id`);
}

if (errores.length) {
  console.error(errores.join('\n'));
  process.exit(1);
}
console.log(`OK: JS válido, ${new Set(locales).size} archivos locales y ${new Set(anclas).size} anclas internas revisados.`);
