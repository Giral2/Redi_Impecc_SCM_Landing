# Redi_Impecc_SCM_Landing

Rediseño de la página de inicio de Salud en Casa Médicos S.A.S., una IPS de atención médica domiciliaria en Cali. Es un sitio estático (HTML, CSS y JavaScript sin dependencias).

## Qué incluye

- Inicio con compromisos de calidad y acceso rápido a los trámites en línea (cotización, historia clínica, teleconsulta, servicio al cliente, incidentes, trabaja con nosotros).
- Programas de atención: domiciliaria, cuidados paliativos, paciente crónico, paciente agudo y clínica de heridas.
- Nosotros (misión, visión y política de calidad), asociación de usuarios con sus documentos y sección corporativa.
- Formulario de contacto que arma el mensaje y lo abre en WhatsApp o en el correo.
- Diseño adaptable a móvil, con barra fija de acciones y navegación por teclado.

## Ver la página en local

Hace falta Node.js.

```bash
node .claude/serve.js
```

Luego abre <http://localhost:4173>.

## Calidad: linter y pruebas

```bash
npm ci          # instala las herramientas (una vez)
npm run lint    # revisa el HTML y el CSS
npm test        # pruebas en un navegador real (Playwright)
```

La primera vez, `npx playwright install chromium` descarga el navegador de pruebas. Todo esto también corre solo en cada Pull Request (CI).

## Estructura

```
index.html          contenido de la página
assets/styles.css   estilos
assets/script.js    menú, pestañas, formulario y animaciones
assets/favicon.svg  icono
.claude/serve.js    servidor de vista previa
```

## Pendiente antes de publicar

- Cambiar las fotos de banco (Unsplash) por fotos reales del equipo.
- Reemplazar el logo provisional por el original y añadir el logo de Supersalud.
- Migrar los PDF y los documentos de corporativo, que siguen enlazando al sitio anterior.
- Confirmar con la empresa el horario, los teléfonos y los textos nuevos.
