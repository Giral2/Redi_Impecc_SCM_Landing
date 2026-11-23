# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

Landing page estática en español (es-CO) de Salud en Casa Médicos S.A.S., una IPS de atención médica domiciliaria en Cali. Es un rediseño del sitio Joomla anterior (saludencasamedicos.com). No hay build, ni gestor de paquetes, ni tests, ni linter: son tres archivos que el navegador carga tal cual.

## Comandos

```bash
node .claude/serve.js        # vista previa en http://localhost:4173 (PORT=xxxx para cambiar el puerto)
```

`.claude/launch.json` define la configuración `sitio` para abrir ese servidor desde el panel del navegador de la app. `serve.js` solo sirve archivos de la raíz del repo, sin caché.

## Arquitectura

Todo el contenido está en `index.html` (una sola página con anclas: `#inicio`, `#tramites`, `#servicios`, `#como-funciona`, `#paliativos`, `#nosotros`, `#usuarios`, `#corporativo`, `#contacto`). `assets/styles.css` y `assets/script.js` se enlazan desde ahí.

Acoplamientos que hay que respetar al editar, porque cambiar un lado sin el otro rompe cosas en silencio:

- **Iconos:** son un sprite SVG inline al inicio del `body` (`<symbol id="i-...">`), usado con `<use href="#i-...">`. Un icono nuevo se añade como `<symbol>` allí. El sprite se oculta con tamaño cero; el atributo `hidden` no funciona en `<svg>`.
- **Pestañas:** `script.js` activa cualquier `[role="tablist"]` y enlaza cada `role="tab"` con su panel por `aria-controls`. Sirve igual para los servicios (vertical, con flechas arriba/abajo) y para misión/visión/calidad. Agregar una pestaña exige tab y panel con ids que coincidan.
- **Servicio en el formulario:** los enlaces con `data-servicio="X"` preseleccionan en `#f-servicio` la opción cuyo texto sea exactamente `X`. Si se renombra un servicio, hay que cambiarlo en las dos partes.
- **Menú activo:** `script.js` resalta el enlace de `.nav__link` cuyo `href` apunta a la última sección que pasó por debajo del encabezado. Un enlace nuevo del menú debe apuntar a un `id` de sección existente.
- **Animación al hacer scroll:** `script.js` pone `data-reveal` por JavaScript a una lista de selectores. El CSS solo oculta esos elementos bajo `.js` y `prefers-reduced-motion: no-preference`. Un bloque nuevo que deba animarse tiene que añadirse a esa lista.
- **Menú móvil:** el panel se ancla al encabezado (`position: absolute; top: 100%`) con su alto en `--nav-h`, calculado en JS al abrir. No usar `position: fixed` allí: el encabezado tiene `backdrop-filter` y eso hace que `fixed` se mida contra él en lugar de la ventana.
- **Formulario de contacto:** no tiene backend. Valida en el navegador y abre `wa.me/573159565622` o un `mailto:` con el mensaje armado. El número y el correo son constantes al inicio de `script.js` y también están escritos en `index.html`.

## CSS

Los colores, tipografías, radios y sombras son variables en `:root` (sección 1 de `styles.css`); las secciones están numeradas en el comentario de cabecera. Puntos de corte: 1100, 960 y 640 px. Bajo 640 px aparece una barra fija inferior (`.mobile-bar`) y se oculta el botón flotante de WhatsApp, así que al mostrar contenido nuevo al final de la página hay que contar con el `padding-bottom` del `body`.

## Contenido y datos

- Los enlaces a trámites (Google Forms, Microsoft Forms, JotForm, portal de teleconsulta) y a PDF/imágenes de políticas **apuntan al sitio viejo o a servicios externos**; no están migrados. Los de la sección Corporativo usan dominios `saludencasamedicos.co` y `.com` mezclados.
- Fotos de banco (Unsplash) cargadas por URL y logo provisional dibujado en SVG (en el encabezado, el pie y `assets/favicon.svg`). Son marcadores hasta tener material real.
- El sitio viejo trae horarios y teléfonos contradictorios entre páginas; esta versión usa los de su página de inicio (lunes a viernes 8:00–5:00, sábados 8:00–1:00, celular 315 956 5622).
- Los textos de "Cómo empezar" y de los cuatro compromisos del inicio son redacción propia, pendiente de validar con la empresa; el resto viene del sitio original.

## Flujo de git

Trabajar en ramas y abrir Pull Request; no subir directo a `main` ni fusionar sin aprobación. Commits y títulos de PR en español, cortos, empezando con verbo en infinitivo. En Windows este repo necesita `core.longpaths=true` (la ruta de la carpeta es muy larga y un `git pull --rebase` falla sin eso).
