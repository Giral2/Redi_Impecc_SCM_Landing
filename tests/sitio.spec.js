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

test('la página carga sin errores y sin scroll horizontal', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.reload();
  await expect(page).toHaveTitle(/Salud en Casa/);
  const desborde = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(desborde).toBe(false);
  expect(errores).toEqual([]);
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
