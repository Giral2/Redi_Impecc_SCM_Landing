// Salud en Casa Médicos · interacciones de la página
(() => {
  const WHATSAPP = '573159565622';
  const CORREO = 'info@saludencasamedicos.com';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* Encabezado: sombra al bajar y altura real para el menú móvil */
  const header = $('.header');
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Menú móvil */
  const toggle = $('.menu-toggle');
  const nav = $('#menu');
  const setMenu = (open) => {
    if (open) {
      const libre = window.innerHeight - header.getBoundingClientRect().bottom;
      document.documentElement.style.setProperty('--nav-h', `${libre}px`);
    }
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    $('.visually-hidden', toggle).textContent = open ? 'Cerrar menú' : 'Abrir menú';
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  /* Pestañas accesibles (servicios y nosotros) */
  const initTabs = (list) => {
    const tabs = $$('[role="tab"]', list);
    const vertical = list.getAttribute('aria-orientation') === 'vertical';
    const select = (tab, focus = true) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };
    list.addEventListener('click', (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) select(tab, false);
    });
    list.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const prev = ['ArrowLeft', vertical && 'ArrowUp'];
      const next = ['ArrowRight', vertical && 'ArrowDown'];
      let target;
      if (next.includes(e.key)) target = tabs[(i + 1) % tabs.length];
      else if (prev.includes(e.key)) target = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') target = tabs[0];
      else if (e.key === 'End') target = tabs[tabs.length - 1];
      if (target) {
        e.preventDefault();
        select(target);
      }
    });
  };
  $$('[role="tablist"]').forEach(initTabs);

  /* "Solicitar este servicio" deja el servicio elegido en el formulario */
  const servicio = $('#f-servicio');
  $$('[data-servicio]').forEach((link) => {
    link.addEventListener('click', () => {
      const opcion = [...servicio.options].find((o) => o.text === link.dataset.servicio);
      if (opcion) servicio.value = opcion.value;
    });
  });

  /* Enlace activo del menú según la sección visible */
  const links = $$('.nav__link');
  const sections = links.map((l) => $(l.getAttribute('href'))).filter(Boolean);
  const spy = () => {
    const linea = header.offsetHeight + 140;
    let actual = null;
    sections.forEach((s) => {
      if (s.getBoundingClientRect().top <= linea) actual = s;
    });
    links.forEach((l) => {
      const on = Boolean(actual) && l.getAttribute('href') === `#${actual.id}`;
      l.classList.toggle('is-active', on);
      if (on) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  /* Aparición suave al hacer scroll */
  const revealTargets = $$(
    '.section__head, .task, .services, .care-card, .step, .feature__media, .feature__copy, ' +
      '.about__copy, .about__side, .users__intro, .accordion, .doc-card, .contact__info, .form, .pillars'
  );
  const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (motionOk && 'IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            reveal.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    revealTargets.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.tagName === el.tagName);
      const index = el.matches('.task, .care-card, .step, .doc-card') ? siblings.indexOf(el) : 0;
      el.style.setProperty('--delay', `${Math.min(index, 5) * 70}ms`);
      el.setAttribute('data-reveal', '');
      reveal.observe(el);
    });
  }

  /* Formulario: valida y abre WhatsApp o el correo con el mensaje listo */
  const form = $('#form-contacto');
  const status = $('.form__status', form);
  const reglas = {
    nombre: (v) => v.trim().length >= 3,
    telefono: (v) => v.replace(/\D/g, '').length >= 10,
    mensaje: (v) => v.trim().length >= 10,
    datos: (_, el) => el.checked,
  };

  const validar = (campo) => {
    const ok = reglas[campo.name](campo.value, campo);
    const error = $(`#e-${campo.name}`);
    campo.setAttribute('aria-invalid', String(!ok));
    if (ok) campo.removeAttribute('aria-describedby');
    else campo.setAttribute('aria-describedby', error.id);
    error.hidden = ok;
    return ok;
  };

  Object.keys(reglas).forEach((name) => {
    const campo = form.elements[name];
    campo.addEventListener('blur', () => {
      if (campo.value || campo.getAttribute('aria-invalid')) validar(campo);
    });
    campo.addEventListener('input', () => {
      if (campo.getAttribute('aria-invalid') === 'true') validar(campo);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = '';
    const campos = Object.keys(reglas).map((name) => form.elements[name]);
    const invalidos = campos.filter((c) => !validar(c));
    if (invalidos.length) {
      invalidos[0].focus();
      return;
    }

    const d = Object.fromEntries(new FormData(form));
    const texto = [
      'Hola, quiero solicitar un servicio de Salud en Casa Médicos.',
      '',
      `Nombre: ${d.nombre.trim()}`,
      `Celular: ${d.telefono.trim()}`,
      `Para quién: ${d.quien}`,
      `Servicio: ${d.servicio}`,
      '',
      d.mensaje.trim(),
    ].join('\n');

    const canal = e.submitter?.dataset.canal || 'whatsapp';
    if (canal === 'correo') {
      const asunto = `Solicitud de servicio: ${d.servicio}`;
      window.location.href = `mailto:${CORREO}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(texto)}`;
      status.textContent = 'Abrimos tu aplicación de correo con el mensaje listo. Solo falta enviarlo.';
    } else {
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
      status.textContent = 'Abrimos WhatsApp con el mensaje listo. Solo falta enviarlo.';
    }
  });

  /* Año del pie */
  $('#anio').textContent = new Date().getFullYear();
})();
