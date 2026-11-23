const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Evita abrir WhatsApp de verdad: guardamos la dirección a la que iría.
  await page.addInitScript(() => {
    window.__abierto = null;
    window.open = (url) => {
      window.__abierto = url;
      return null;
    };
  });
  await page.goto('/');
});

const PAGINAS = ['/', '/usuarios.html', '/corporativo.html'];
const hayDesborde = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

for (const ruta of PAGINAS) {
  test(`${ruta} carga sin errores, sin scroll horizontal y con el año en el pie`, async ({ page }) => {
    const errores = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await page.goto(ruta);
    await expect(page).toHaveTitle(/Salud en Casa/);
    await expect(page.locator('#anio')).toHaveText(/^\d{4}$/);
    expect(await hayDesborde(page)).toBe(false);
    expect(errores).toEqual([]);
  });
}

test.describe('páginas internas', () => {
  test('el menú lleva a Usuarios y a Corporativo, y se puede volver al inicio', async ({ page }) => {
    await page.locator('.nav__link', { hasText: 'Usuarios' }).click();
    await expect(page).toHaveURL(/\/usuarios\.html$/);
    await expect(page.locator('h1')).toHaveText('Asociación de usuarios');
    await expect(page.locator('.nav__link[aria-current="page"]')).toHaveText('Usuarios');

    await page.locator('.nav__link', { hasText: 'Corporativo' }).click();
    await expect(page).toHaveURL(/\/corporativo\.html$/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.doc-card')).toHaveCount(8);
    await expect(page.locator('.nav__link[aria-current="page"]')).toHaveText('Corporativo');

    await page.locator('.crumb').click();
    await expect(page).toHaveURL(/\/(index\.html)?$/);
    await expect(page.locator('#servicios')).toBeAttached();
  });

  test('el inicio ya no trae esas secciones', async ({ page }) => {
    await expect(page.locator('#usuarios, #corporativo')).toHaveCount(0);
  });

  test('desde una página interna, el menú vuelve a la sección del inicio', async ({ page }) => {
    await page.goto('/usuarios.html');
    await page.locator('.nav__link', { hasText: 'Servicios' }).click();
    await expect(page).toHaveURL(/\/index\.html#servicios$/);
  });

  test('desde una página interna, "Solicitar un servicio" lleva al formulario del inicio', async ({ page }) => {
    await page.goto('/corporativo.html');
    await page.locator('.header__cta').click();
    await expect(page).toHaveURL(/\/index\.html#contacto$/);
    await expect(page.locator('#form-contacto')).toBeVisible();
  });

  test.describe('en el celular', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    for (const ruta of ['/usuarios.html', '/corporativo.html']) {
      test(`${ruta} no se desborda y su menú funciona`, async ({ page }) => {
        await page.goto(ruta);
        expect(await hayDesborde(page)).toBe(false);
        await page.locator('.menu-toggle').click();
        await expect(page.locator('#menu')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.locator('#menu')).toBeHidden();
      });
    }
  });
});

test.describe('formulario de contacto', () => {
  test('muestra errores si se envía vacío', async ({ page }) => {
    await page.locator('[data-canal="whatsapp"]').click();
    for (const campo of ['nombre', 'telefono', 'mensaje', 'datos']) {
      await expect(page.locator(`#e-${campo}`)).toBeVisible();
    }
    expect(await page.evaluate(() => window.__abierto)).toBeNull();
  });

  test('abre WhatsApp con el mensaje armado', async ({ page }) => {
    await page.fill('#f-nombre', 'Ana Pérez');
    await page.fill('#f-telefono', '300 123 4567');
    await page.fill('#f-mensaje', 'Necesito curaciones en casa');
    await page.check('#f-datos');
    await page.locator('[data-canal="whatsapp"]').click();

    const url = await page.evaluate(() => window.__abierto);
    expect(url).toContain('https://wa.me/573159565622?text=');
    const texto = decodeURIComponent(url.split('text=')[1]);
    expect(texto).toContain('Nombre: Ana Pérez');
    expect(texto).toContain('Necesito curaciones en casa');
  });
});

test('"Solicitar este servicio" preselecciona el servicio en el formulario', async ({ page }) => {
  await page.locator('#tab-cronico').click();
  await page.locator('[data-servicio="Paciente crónico"]').click();
  await expect(page.locator('#f-servicio')).toHaveValue(/Paciente cr/);
  const elegido = await page.locator('#f-servicio option:checked').innerText();
  expect(elegido).toBe('Paciente crónico');
});

test('las pestañas de servicios cambian con las flechas del teclado', async ({ page }) => {
  await page.locator('#tab-domiciliaria').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#tab-paliativos')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#panel-paliativos')).toBeVisible();
  await expect(page.locator('#panel-domiciliaria')).toBeHidden();
});

test.describe('menú móvil', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('se abre, se cierra con Escape y con un enlace', async ({ page }) => {
    const boton = page.locator('.menu-toggle');
    await expect(page.locator('#menu')).toBeHidden();

    await boton.click();
    await expect(boton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#menu')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(boton).toHaveAttribute('aria-expanded', 'false');

    await boton.click();
    await page.locator('#menu a').first().click();
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
  });
});
