/* El Salón Canino · demo */
(() => {
  const WA = '34639960112';
  // Horario por día de la semana (0 = domingo). Minutos desde las 00:00.
  const HORARIO = {
    0: [], 1: [[570, 1110]], 2: [[570, 1110]], 3: [],
    4: [[570, 1110]], 5: [[570, 1110]], 6: [[540, 780]]
  };
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* --- nav --- */
  const nav = $('.nav'), burger = $('.nav__burger'), menu = $('#menu');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); menu.classList.toggle('is-open', open);
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => {
    burger.setAttribute('aria-expanded', 'false'); menu.classList.remove('is-open');
  }));

  /* --- abierto / cerrado ahora (hora de España) --- */
  const ahora = () => {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    const dia = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(g('weekday'));
    return { dia, min: (+g('hour') % 24) * 60 + +g('minute') };
  };
  const hhmm = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  const nombres = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const pintarEstado = () => {
    const { dia, min } = ahora();
    const el = $('[data-estado]'); if (!el) return;
    const tramo = HORARIO[dia].find(([a, b]) => min >= a && min < b);
    let txt;
    if (tramo) { txt = `Abierto ahora · hasta las ${hhmm(tramo[1])}`; el.className = 'estado is-open'; }
    else {
      el.className = 'estado is-closed';
      const hoyLuego = HORARIO[dia].find(([a]) => a > min);
      if (hoyLuego) txt = `Cerrado · abre hoy a las ${hhmm(hoyLuego[0])}`;
      else {
        for (let i = 1; i <= 7; i++) {
          const d = (dia + i) % 7;
          if (HORARIO[d].length) { txt = `Cerrado · abre ${i === 1 ? 'mañana' : 'el ' + nombres[d]} a las ${hhmm(HORARIO[d][0][0])}`; break; }
        }
      }
    }
    $('.estado__txt', el).textContent = txt;
    $$('.horario tr').forEach(tr => tr.classList.toggle('hoy', +tr.dataset.dia === dia));
  };
  pintarEstado(); setInterval(pintarEstado, 60000);

  /* --- revelado al hacer scroll --- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });
  } else $$('.reveal').forEach(el => el.classList.add('is-in'));

  /* --- visor de galería --- */
  const visor = $('.visor'), vImg = $('img', visor);
  const cerrar = () => { visor.hidden = true; document.body.style.overflow = ''; };
  $$('.gal').forEach(b => b.addEventListener('click', () => {
    vImg.src = b.dataset.src; vImg.alt = $('img', b).alt; visor.hidden = false; document.body.style.overflow = 'hidden';
  }));
  visor.addEventListener('click', e => { if (e.target !== vImg) cerrar(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !visor.hidden) cerrar(); });

  /* --- formulario → WhatsApp --- */
  const form = $('#form-cita'), err = $('.form__err', form);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const nombre = (fd.get('nombre') || '').trim(), mascota = (fd.get('mascota') || '').trim();
    if (!nombre || !mascota) { err.hidden = false; (nombre ? form.mascota : form.nombre).focus(); return; }
    err.hidden = true;
    const especie = fd.get('especie');
    const servicios = fd.getAll('servicio'), dias = fd.getAll('dia');
    const lineas = [
      `¡Hola! Soy ${nombre} y quería pedir cita para ${mascota} 🐾`,
      ``,
      `• ${especie === 'gato' ? 'Gato' : 'Perro'}${fd.get('raza') ? ' · ' + fd.get('raza').trim() : ''}${especie === 'perro' ? ' · ' + fd.get('tamano') : ''}`,
      `• Servicio: ${servicios.length ? servicios.join(', ') : 'que me aconsejéis'}`,
      `• Días que me vienen bien: ${dias.length ? dias.join(', ') : 'cualquiera'}`
    ];
    const nota = (fd.get('nota') || '').trim();
    if (nota) lineas.push(`• Nota: ${nota}`);
    if (fd.get('lista')) lineas.push(``, `Si se libera un hueco antes, avisadme, por favor.`);
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lineas.join('\n'))}`, '_blank', 'noopener');
  });

  /* --- selector de color (solo demo) --- */
  const html = document.documentElement;
  const marcar = () => $$('[data-set-tema]').forEach(b => b.setAttribute('aria-pressed', b.dataset.setTema === html.dataset.tema));
  $$('[data-set-tema]').forEach(b => b.addEventListener('click', () => {
    html.dataset.tema = b.dataset.setTema; marcar();
    try { localStorage.setItem('esc-tema', b.dataset.setTema); } catch (e) {}
  }));
  marcar();

  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
