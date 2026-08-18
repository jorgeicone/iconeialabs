/* ═══════════════════════════════════════════════════════════════
   Mapa de Capacidades · motor de flujo, puntaje y recomendación
   ICONE Dx. — © 2026 Ing. Jorge Hugo Pérez Gaona
   ═══════════════════════════════════════════════════════════════ */

'use strict';

const S = {
  empresa:'', contacto:'', cargo:'', email:'', telefono:'',
  sector:'', tamano:'', aFormar:'', horizonte:'',
  perfiles:[], silver:false, inter:false,
  datos:false, autorizaContacto:false, autorizaTs:null,
  answers:new Array(QS.length).fill(null),
  idx:0, result:null, reco:null
};

const PERFILES = [
  {k:P.OPER,  t:'Personal operativo'},
  {k:P.MEDIO, t:'Mandos medios / técnicos'},
  {k:P.GER,   t:'Gerencia media'},
  {k:P.C,     t:'Alta dirección (C-level)'}
];

const $ = id => document.getElementById(id);
const ESCMAP = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ESCMAP[c]);

/* El lavado sigue a la sección: portada en bienvenida, contexto e
   informe; la imagen de la dimensión mientras se responde; nada en el
   panel, que es una tabla y no necesita atmósfera. */
let washActual = null, washTimer = null;
function wash(src){
  const el = $('bg-img');
  if(!el || src === washActual) return;
  washActual = src;
  /* Cancelar el fundido pendiente: si no, el temporizador del cambio
     anterior se dispara después y repinta la imagen vieja encima de la
     nueva. Pasaba al saltar de dimensión rápido y al entrar al informe. */
  clearTimeout(washTimer);
  if(!src){ el.classList.remove('on'); return; }
  const pintar = () => { el.src = src; el.classList.add('on'); };
  if(el.classList.contains('on') && el.getAttribute('src')){
    el.classList.remove('on');
    washTimer = setTimeout(pintar, 260);
  } else pintar();
}

function show(id){
  document.querySelectorAll('.sect').forEach(s => s.classList.remove('on'));
  $(id).classList.add('on');
  if(id === 's-admin') wash(null);
  /* cuestionario e informe fijan su propio fondo desde quien los
     renderiza: la dimensión activa y la de mayor brecha */
  else if(id !== 's-questions' && id !== 's-results') wash('img/hero.jpg');
  window.scrollTo({top:0});
}

/* ───────────── Paso 1 · datos de la empresa ───────────── */
function setErr(fid, on){ $(fid).classList.toggle('err', on); }

function toStep2(){
  const v = k => $('i-' + k).value.trim();
  let ok = true;
  [['empresa','f-empresa'], ['contacto','f-contacto'], ['cargo','f-cargo']].forEach(([k, f]) => {
    const bad = v(k).length < 2;
    setErr(f, bad);
    if(bad) ok = false;
  });
  const mailBad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'));
  setErr('f-email', mailBad);
  if(mailBad) ok = false;

  /* La autorización es previa a la recolección: sin ella no se
     guarda nada ni se avanza. */
  $('err-legal').classList.toggle('on', !S.datos);
  if(!S.datos) ok = false;

  if(!ok){
    const first = document.querySelector('#s-welcome .field.err') ||
                  (!S.datos ? $('f-legal') : null);
    if(first) first.scrollIntoView({block:'center', behavior:'smooth'});
    return;
  }
  S.empresa  = v('empresa');
  S.contacto = v('contacto');
  S.cargo    = v('cargo');
  S.email    = v('email').toLowerCase();
  S.telefono = v('tel');
  S.autorizaTs = new Date().toISOString();
  show('s-context');
}

/* ───────────── Paso 2 · contexto ───────────── */
function renderChips(){
  const box = $('chips-perfiles');
  if(!box) return;
  box.innerHTML = PERFILES.map(p =>
    '<button class="chip" data-k="' + p.k + '" onclick="togPerfil(\'' + p.k + '\')">' + p.t + '</button>'
  ).join('');
}

function togPerfil(k){
  const i = S.perfiles.indexOf(k);
  if(i < 0) S.perfiles.push(k); else S.perfiles.splice(i, 1);
  document.querySelector('.chip[data-k="' + k + '"]').classList.toggle('on', i < 0);
  if(S.perfiles.length) setErr('f-perfiles', false);
}

const TOGGLES = {
  silver:'t-silver', inter:'t-inter',
  datos:'t-datos',   autorizaContacto:'t-contacto'
};

function tog(which){
  S[which] = !S[which];
  const el = $(TOGGLES[which]);
  el.classList.toggle('on', S[which]);
  el.setAttribute('aria-pressed', S[which] ? 'true' : 'false');
  if(which === 'datos' && S.datos) $('err-legal').classList.remove('on');
}

/* ───────────── Aviso de privacidad ─────────────
   Contiene los elementos que la Ley 1581 de 2012 y el Decreto 1074
   de 2015 exigen que se informen ANTES de recolectar el dato:
   responsable identificado, finalidad, derechos del titular y canal
   para ejercerlos. */
function avisoHTML(){
  return '' +
    '<h4>Responsable del tratamiento</h4>' +
    '<p><b>' + esc(RESPONSABLE.nombre) + '</b> · ' + esc(RESPONSABLE.domicilio) + '<br>' +
      'Sitio: <a href="' + esc(RESPONSABLE.sitio) + '" target="_blank" rel="noopener">' + esc(RESPONSABLE.sitio) + '</a><br>' +
      'Es quien decide sobre el uso de sus datos y ante quien usted ejerce sus derechos.</p>' +

    '<h4>Encargado del tratamiento</h4>' +
    '<p>' + esc(ENCARGADO.nombre) + ' — <a href="' + esc(ENCARGADO.sitio) + '" target="_blank" rel="noopener">' + esc(ENCARGADO.sitio) + '</a><br>' +
      'Opera la plataforma y la base de datos por cuenta del responsable, y atiende ' +
      'el canal de solicitudes en su nombre. No usa sus datos para fines propios.</p>' +

    '<h4>Qué datos recogemos</h4>' +
    '<p>Nombre de la empresa, nombre y cargo de quien responde, correo corporativo, ' +
      'teléfono si decide darlo, y las respuestas al cuestionario junto con el ' +
      'resultado calculado. No solicitamos datos sensibles ni datos de menores de edad.</p>' +

    '<h4>Para qué los usamos</h4>' +
    '<ul>' +
      '<li>Calcular y generar su informe de diagnóstico.</li>' +
      '<li>Entregarle la ruta formativa recomendada.</li>' +
      '<li>Si lo autoriza aparte, que un asesor de EAN Educación Continua lo contacte.</li>' +
      '<li>Producir estadísticas agregadas y anónimas sobre necesidades de formación ' +
        'en el mercado. En esas estadísticas su empresa no es identificable.</li>' +
    '</ul>' +
    '<p>No vendemos, arrendamos ni cedemos sus datos a terceros distintos de EAN ' +
      'Educación Continua para las finalidades aquí descritas.</p>' +

    '<h4>Sus derechos como titular</h4>' +
    '<p>Conforme al artículo 8 de la Ley 1581 de 2012, usted puede en cualquier momento:</p>' +
    '<ul>' +
      '<li>Conocer, actualizar y rectificar sus datos.</li>' +
      '<li>Solicitar prueba de esta autorización.</li>' +
      '<li>Ser informado sobre el uso que se ha dado a sus datos.</li>' +
      '<li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>' +
      '<li>Revocar la autorización y solicitar la supresión de sus datos, ' +
        'cuando no exista un deber legal o contractual de conservarlos.</li>' +
      '<li>Acceder de forma gratuita a sus datos personales.</li>' +
    '</ul>' +

    '<h4>Cómo ejercerlos</h4>' +
    '<p>Escriba al canal habilitado, <a href="mailto:' + esc(RESPONSABLE.correo) + '">' + esc(RESPONSABLE.correo) + '</a>, ' +
      'indicando su nombre, la empresa y la solicitud concreta. Las consultas se ' +
      'atienden en un plazo máximo de diez (10) días hábiles y los reclamos en ' +
      'quince (15) días hábiles, prorrogables conforme a la ley.</p>' +

    '<h4>Conservación</h4>' +
    '<p>Los datos se conservan mientras sean necesarios para la finalidad ' +
      'informada, o hasta que usted solicite su supresión.</p>' +

    '<h4>Carácter de las autorizaciones</h4>' +
    '<p>La autorización de tratamiento es <b>obligatoria</b> para generar el ' +
      'diagnóstico. La autorización de contacto comercial es <b>facultativa</b>: ' +
      'puede completar y recibir su diagnóstico sin concederla.</p>' +

    '<p style="margin-top:1rem;color:var(--text-muted)">Versión del aviso: ' +
      esc(POLITICA_VERSION) + '</p>';
}

function togAviso(){
  const box = $('aviso-full'), btn = $('btn-aviso');
  const abierto = !box.hidden;
  if(abierto){
    box.hidden = true;
    btn.textContent = 'Leer el aviso de privacidad completo ▾';
    btn.setAttribute('aria-expanded', 'false');
  }else{
    if(!box.innerHTML) box.innerHTML = avisoHTML();
    box.hidden = false;
    btn.textContent = 'Ocultar el aviso de privacidad ▴';
    btn.setAttribute('aria-expanded', 'true');
  }
}

function startDx(){
  /* Segunda barrera: si por cualquier vía se llegó hasta aquí sin
     autorización registrada, se devuelve al paso 1. Sin esto el
     usuario respondería las 30 preguntas y solo fallaría al guardar,
     donde lo detiene la constraint de la base de datos. */
  if(!S.datos || !S.autorizaTs){
    show('s-welcome');
    $('err-legal').classList.add('on');
    $('f-legal').scrollIntoView({block:'center', behavior:'smooth'});
    return;
  }

  const v = k => $('i-' + k).value;
  let ok = true;
  [['sector','f-sector'], ['tamano','f-tamano'], ['aformar','f-aformar'], ['horizonte','f-horizonte']]
    .forEach(([k, f]) => {
      const bad = !v(k);
      setErr(f, bad);
      if(bad) ok = false;
    });
  const pBad = S.perfiles.length === 0;
  setErr('f-perfiles', pBad);
  if(pBad) ok = false;

  if(!ok){
    const first = document.querySelector('#s-context .field.err');
    if(first) first.scrollIntoView({block:'center', behavior:'smooth'});
    return;
  }
  S.sector    = v('sector');
  S.tamano    = v('tamano');
  S.aFormar   = v('aformar');
  S.horizonte = v('horizonte');
  S.idx = 0;
  show('s-questions');
  renderQ();
}

/* ───────────── Preguntas ───────────── */
const LETTERS = ['A', 'B', 'C', 'D'];

function renderQ(){
  const i = S.idx, q = QS[i], dim = DIMS[q.d - 1];
  const pct = Math.round((i / QS.length) * 100);

  wash(dim.img);
  $('prog-bar').style.setProperty('--dim', dim.color);
  $('prog-dim').textContent   = dim.name;
  $('prog-count').textContent = (i + 1) + ' / ' + QS.length;
  $('prog-fill').style.width  = pct + '%';

  const opts = q.o.map((o, oi) =>
    '<button class="opt-btn' + (S.answers[i] === oi ? ' on' : '') + '" onclick="answer(' + oi + ')">' +
      '<span class="opt-k">' + LETTERS[oi] + '</span>' +
      '<span class="opt-t">' + esc(o) + '</span>' +
    '</button>'
  ).join('');

  $('q-root').innerHTML =
    '<div style="--dim:' + dim.color + '">' +
      '<div class="q-band">' +
        '<img src="' + dim.img + '" alt="" loading="lazy" decoding="async">' +
        '<div class="q-band-txt"><span>' +
          '<small>Dimensión ' + dim.id + ' de 6</small>' + esc(dim.name) +
        '</span></div>' +
      '</div>' +
      '<div class="q-text">' + esc(q.q) + '</div>' +
      '<div class="opts">' + opts + '</div>' +
      '<div class="q-nav">' +
        '<button class="btn btn-ghost" onclick="prevQ()"' + (i === 0 ? ' style="visibility:hidden"' : '') + '>← Anterior</button>' +
        '<span class="q-hint">' + (S.answers[i] === null ? 'Elija la opción más parecida a su realidad' : 'Respondida') + '</span>' +
      '</div>' +
    '</div>';
}

function answer(oi){
  S.answers[S.idx] = oi;
  document.querySelectorAll('.opt-btn').forEach((b, k) => b.classList.toggle('on', k === oi));
  setTimeout(function(){
    if(S.idx < QS.length - 1){ S.idx++; renderQ(); }
    else finish();
  }, 260);
}

function prevQ(){ if(S.idx > 0){ S.idx--; renderQ(); } }

/* ───────────── Puntaje ───────────── */
function compute(){
  const per = DIMS.map(d => {
    const idxs = QS.map((q, i) => q.d === d.id ? i : -1).filter(i => i >= 0);
    const raw  = idxs.reduce((a, i) => a + (S.answers[i] || 0), 0);
    const max  = idxs.length * 3;
    return Object.assign({}, d, {raw:raw, max:max, pct:Math.round((raw / max) * 100)});
  });
  const raw   = per.reduce((a, d) => a + d.raw, 0);
  const max   = per.reduce((a, d) => a + d.max, 0);
  const total = Math.round((raw / max) * 100);
  return {total:total, level:levelOf(total), dims:per};
}

/* Banda de lectura: 0 crítica · 1 baja · 2 media · 3 alta */
function band(pct){ return pct < 34 ? 0 : pct < 56 ? 1 : pct < 78 ? 2 : 3; }

/* ───────────── Motor de recomendación ───────────── */
function eligible(p){
  if(!p.f) return true;
  if(p.f === 'silver') return S.silver;
  if(p.f === 'inter')  return S.inter || SECTOR_F[S.sector] === 'inter';
  return SECTOR_F[S.sector] === p.f;
}
function perfilOK(p){ return p.p.some(x => S.perfiles.indexOf(x) >= 0); }

function recommend(res){
  const used = new Set();
  const pool = CATALOG.filter(p => eligible(p) && perfilOK(p));

  /* Selección alternada: toma un programa por dimensión en cada
     pasada, en vez de agotar una dimensión antes de pasar a la
     siguiente. Sin esto, una fase que debe atacar las dos brechas
     mayores puede llenarse entera con programas de una sola. */
  function pick(dimIds, levels, n){
    const out = [];
    for(const lv of levels){
      let added = true;
      while(added && out.length < n){
        added = false;
        for(const id of dimIds){
          if(out.length >= n) break;
          const p = pool.filter(x => x.d === id && x.lv === lv && !used.has(x.n))[0];
          if(p){ used.add(p.n); out.push(p); added = true; }
        }
      }
      if(out.length >= n) break;
    }
    return out;
  }

  const sorted = res.dims.slice().sort((a, b) => a.pct - b.pct);
  const low  = sorted.slice(0, 2).map(d => d.id);
  const mid  = sorted.slice(2, 4).map(d => d.id);
  const high = sorted.slice(4).map(d => d.id);

  /* La profundidad depende del nivel global: una organización
     emergente arranca por fundamentos; una consolidada no
     necesita cursos de entrada. */
  const lvA = res.total < 50 ? [1, 2] : res.total < 75 ? [2, 1] : [2, 3];
  const lvB = res.total < 50 ? [2, 1] : res.total < 75 ? [2, 3] : [3, 2];
  const lvC = res.total < 50 ? [2, 3] : [3, 2];

  const f1 = pick(low, lvA, 4);
  const f2 = pick(mid.concat(low), lvB, 4);
  const f3 = pick(high.concat(mid), lvC, 3);

  /* Programas activados por contexto que no entraron por brecha:
     se agregan aparte para que el portafolio no se pierda. */
  const extras = [];

  /* Rota entre clusters en vez de cortar los primeros del arreglo.
     El filtro «inter» habilita comercio exterior Y Escuela de idiomas;
     tomando los dos primeros salían siempre dos de comercio exterior
     y los idiomas no aparecían nunca. */
  function addExtras(flag, n){
    n = n || 2;
    const porCluster = {};
    CATALOG.filter(p => p.f === flag && perfilOK(p) && !used.has(p.n))
      .forEach(p => { (porCluster[p.cl] = porCluster[p.cl] || []).push(p); });
    const clusters = Object.keys(porCluster);
    let puestos = 0, added = true;
    while(added && puestos < n){
      added = false;
      for(const cl of clusters){
        if(puestos >= n) break;
        const p = porCluster[cl].shift();
        if(p){ used.add(p.n); extras.push(p); puestos++; added = true; }
      }
    }
  }
  const sf = SECTOR_F[S.sector];

  if(S.silver) addExtras('silver');

  /* El sector «Logística y comercio exterior» habilita idiomas por sí
     solo, sin que haga falta marcar la casilla. Si solo miráramos la
     casilla, esas empresas nunca verían la Escuela de idiomas. */
  if(S.inter || sf === 'inter') addExtras('inter', 3);

  /* Los programas sectoriales son el mayor diferenciador frente al
     cliente: si el sector los habilita, deben aparecer sí o sí y no
     depender de que la selección por brecha alcance a llegar a ellos. */
  if(sf && sf !== 'inter') addExtras(sf);

  return {
    fases:[
      {n:1, t:'Cierre de brechas críticas',        sub:'0 a 3 meses',   color:'#EF4444', progs:f1},
      {n:2, t:'Consolidación de capacidades',      sub:'3 a 6 meses',   color:'#F59E0B', progs:f2},
      {n:3, t:'Profundización y alta dirección',   sub:'6 a 12 meses',  color:'#3FBF95', progs:f3}
    ],
    extras:extras
  };
}

/* ───────────── Resultados ───────────── */
function finish(){
  S.result = compute();
  S.reco   = recommend(S.result);
  renderResults();
  show('s-results');
  /* El fondo del informe es la dimensión con mayor brecha: así el
     fondo dice algo en vez de repetir la portada. */
  const mayorBrecha = S.result.dims.slice().sort((a, b) => a.pct - b.pct)[0];
  wash(mayorBrecha.img);
  saveResult();
}

function perfilLabel(k){
  const f = PERFILES.filter(p => p.k === k)[0];
  return f ? f.t : k;
}

function progItem(p){
  const hex = CLUSTER_HEX[p.cl] || '#3FBF95';
  const lvT = ['', 'Entrada', 'Intermedio', 'Avanzado'][p.lv];
  return '<div class="prog-item" style="--pc:' + hex + '">' +
      '<div class="prog-dot"></div>' +
      '<div class="prog-body">' +
        '<div class="prog-name">' + esc(p.n) + '</div>' +
        '<div class="prog-tags">' +
          '<span class="tag cl">' + esc(p.cl) + '</span>' +
          '<span class="tag">' + lvT + '</span>' +
          '<span class="tag">' + p.p.map(perfilLabel).join(' · ') + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';
}


/* ───────────── Radar de madurez ─────────────
   Hexágono porque son seis dimensiones. Se dibuja en SVG plano, sin
   librería: son 6 vértices y cuatro anillos, no justifica una
   dependencia. El eje 0 apunta arriba y se avanza en sentido horario. */
function radarSVG(dims){
  const W = 460, H = 380, cx = W / 2, cy = 186, R = 118;
  const paso = (Math.PI * 2) / dims.length;
  const punto = (i, f) => {
    const a = -Math.PI / 2 + i * paso;
    return [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f];
  };

  /* anillos de referencia al 25, 50, 75 y 100 por ciento */
  const anillos = [0.25, 0.5, 0.75, 1].map(f => {
    const pts = dims.map((_, i) => punto(i, f).map(n => n.toFixed(1)).join(',')).join(' ');
    return '<polygon points="' + pts + '" fill="none" stroke="var(--line)" ' +
           'stroke-width="' + (f === 1 ? 1.5 : 1) + '"/>';
  }).join('');

  const ejes = dims.map((_, i) => {
    const [x, y] = punto(i, 1);
    return '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) +
           '" stroke="var(--line)" stroke-width="1"/>';
  }).join('');

  const area = dims.map((d, i) => punto(i, Math.max(d.pct, 2) / 100).map(n => n.toFixed(1)).join(',')).join(' ');

  const vertices = dims.map((d, i) => {
    const [x, y] = punto(i, Math.max(d.pct, 2) / 100);
    return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.5" ' +
           'fill="' + d.hex + '" stroke="#fff" stroke-width="2"/>';
  }).join('');

  const etiquetas = dims.map((d, i) => {
    const [x, y] = punto(i, 1);
    const dx = x - cx, dy = y - cy;
    const lx = cx + dx * 1.24, ly = cy + dy * 1.24;
    const anchor = Math.abs(dx) < 6 ? 'middle' : (dx > 0 ? 'start' : 'end');
    const baseY = dy > 6 ? 12 : (dy < -6 ? -4 : 4);
    return '<text x="' + lx.toFixed(1) + '" y="' + (ly + baseY).toFixed(1) + '" text-anchor="' + anchor + '" ' +
             'font-size="11.5" font-weight="700" fill="var(--text-2)">' + esc(d.short) + '</text>' +
           '<text x="' + lx.toFixed(1) + '" y="' + (ly + baseY + 14).toFixed(1) + '" text-anchor="' + anchor + '" ' +
             'font-size="12" font-weight="800" fill="' + d.hex + '">' + d.pct + '%</text>';
  }).join('');

  return '<div class="radar">' +
    '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
         'aria-label="Radar de madurez por dimensión: ' +
         esc(dims.map(d => d.short + ' ' + d.pct + '%').join(', ')) + '">' +
      anillos + ejes +
      '<polygon points="' + area + '" fill="rgba(47,110,92,.16)" stroke="#2F6E5C" stroke-width="2.5" stroke-linejoin="round"/>' +
      vertices + etiquetas +
    '</svg>' +
  '</div>';
}

function renderResults(){
  const res = S.result, lv = res.level, reco = S.reco;
  const CIRC = 2 * Math.PI * 76;
  const dash = (res.total / 100) * CIRC;
  const gaps = res.dims.slice().sort((a, b) => a.pct - b.pct).slice(0, 3);

  const dimsHtml = res.dims.map(d =>
    '<div class="dim">' +
      '<div class="dim-img"><img src="' + d.img + '" alt="" loading="lazy" decoding="async"></div>' +
      '<div class="dim-top">' +
        '<div class="dim-ico" style="background:' + d.hex + '18;color:' + d.hex + '">' + d.ico + '</div>' +
        '<div class="dim-name">' + esc(d.name) + '</div>' +
        '<div class="dim-pct" style="color:' + d.hex + '">' + d.pct + '%</div>' +
      '</div>' +
      '<div class="dim-track"><div class="dim-fill" style="width:' + d.pct + '%;background:' + d.hex + '"></div></div>' +
      '<div class="dim-read">' + esc(DIM_READ[d.id][band(d.pct)]) + '</div>' +
    '</div>'
  ).join('');

  const gapsHtml = gaps.map((d, i) =>
    '<div class="gap-card" style="--gc:' + d.hex + '">' +
      '<div class="gap-rank">Brecha ' + (i + 1) + ' · ' + d.pct + '%</div>' +
      '<div class="gap-name">' + esc(d.name) + '</div>' +
      '<div class="gap-why">' + esc(DIM_READ[d.id][band(d.pct)]) + '</div>' +
    '</div>'
  ).join('');

  const fasesHtml = reco.fases.filter(f => f.progs.length).map(f =>
    '<div class="phase">' +
      '<div class="phase-h" style="--ph:' + f.color + '">' +
        '<div class="phase-n">' + f.n + '</div>' +
        '<div class="phase-t">' + esc(f.t) + '<small>' + esc(f.sub) + '</small></div>' +
      '</div>' +
      '<div class="prog-list">' + f.progs.map(progItem).join('') + '</div>' +
    '</div>'
  ).join('');

  const extrasHtml = reco.extras.length
    ? '<div class="phase">' +
        '<div class="phase-h" style="--ph:#0E2E3D">' +
          '<div class="phase-n">+</div>' +
          '<div class="phase-t">Programas por su contexto particular<small>Activados por las condiciones que marcó</small></div>' +
        '</div>' +
        '<div class="prog-list">' + reco.extras.map(progItem).join('') + '</div>' +
      '</div>'
    : '';

  const ctx = [
    ['Contacto', S.contacto + ' · ' + S.cargo],
    ['Correo', S.email],
    ['Sector', S.sector],
    ['Tamaño', S.tamano],
    ['Colaboradores a formar', S.aFormar],
    ['Perfiles', S.perfiles.map(perfilLabel).join(' · ')],
    ['Horizonte', S.horizonte]
  ].map(kv =>
    '<div style="display:flex;gap:1rem;justify-content:space-between;border-bottom:1px solid var(--line);padding-bottom:.5rem">' +
      '<span style="color:var(--text-muted);font-weight:600">' + kv[0] + '</span>' +
      '<span style="text-align:right;font-weight:600">' + esc(kv[1]) + '</span>' +
    '</div>'
  ).join('');

  $('res-root').innerHTML =
    '<div class="print-brand">' +
      '<img src="img/ean-logo.png" alt="EAN Universidad · Educación Continua">' +
      '<div class="print-brand-txt">Mapa de Capacidades' +
        '<small>' + esc(S.empresa) + ' · ' + new Date().toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'}) + '</small>' +
      '</div>' +
    '</div>' +
    '<div id="save-note" class="save-note wait">⏳ Guardando el diagnóstico…</div>' +

    '<div class="score-card">' +
      '<div class="score-emp">' + esc(S.empresa) + '</div>' +
      '<div class="score-ring">' +
        '<svg width="170" height="170">' +
          '<circle cx="85" cy="85" r="76" fill="none" stroke="rgba(255,255,255,.13)" stroke-width="11"/>' +
          '<circle cx="85" cy="85" r="76" fill="none" stroke="' + lv.hex + '" stroke-width="11" ' +
                  'stroke-linecap="round" stroke-dasharray="' + dash + ' ' + CIRC + '"/>' +
        '</svg>' +
        '<div class="score-val"><div class="score-num">' + res.total + '</div>' +
        '<div class="score-of">Porcentaje de Madurez</div></div>' +
      '</div>' +
      '<div class="score-lv">' + lv.label + '</div>' +
      '<div class="score-rng">' + lv.range + '</div>' +
      '<div class="score-desc">' + lv.desc + '</div>' +
    '</div>' +

    '<div class="sec-h">Perfil de madurez</div>' +
    radarSVG(res.dims) +

    '<div class="sec-h">Resultado por dimensión</div>' +
    '<div class="dims">' + dimsHtml + '</div>' +

    '<div class="sec-h">Las tres brechas que más pesan</div>' +
    '<div class="dims">' + gapsHtml + '</div>' +

    '<div class="sec-h">Ruta de Fortalecimiento</div>' +
    '<div class="dims">' + fasesHtml + extrasHtml + '</div>' +

    '<div class="sec-h">Contexto declarado</div>' +
    '<div class="card" style="margin-bottom:2rem"><div style="display:grid;gap:.55rem;font-size:.88rem">' + ctx + '</div></div>' +

    '<div class="cta">' +
      '<h3>Convirtamos esto en un plan</h3>' +
      '<p>Un asesor de EAN puede estructurar esta Ruta de Fortalecimiento como programa ' +
         'cerrado para su organización, con fechas, modalidad y cotización.</p>' +
      '<button class="btn btn-primary" onclick="window.print()">Descargar informe (PDF)</button>' +
    '</div>' +

    '<div style="text-align:center;margin-top:1.75rem">' +
      '<button class="btn btn-ghost" onclick="location.reload()">Realizar otro diagnóstico</button>' +
    '</div>';
}

/* ───────────── Guardado ───────────── */
async function saveResult(){
  const note = $('save-note');
  const c = getSB();
  if(!c){
    note.className = 'save-note warn';
    note.innerHTML = '⚠ No se pudo conectar con el servidor. Su informe está en pantalla, pero no quedó registrado.';
    return;
  }
  const row = {
    empresa:S.empresa, contacto:S.contacto, cargo:S.cargo,
    email:S.email, telefono:S.telefono || null,
    sector:S.sector, tamano:S.tamano, a_formar:S.aFormar,
    perfiles:S.perfiles, silver:S.silver, internacional:S.inter,
    horizonte:S.horizonte,
    autoriza_datos:S.datos,
    autoriza_ts:S.autorizaTs,
    politica_version:POLITICA_VERSION,
    autoriza_contacto:S.autorizaContacto,
    total:S.result.total, nivel_key:S.result.level.key, nivel:S.result.level.label,
    d1:S.result.dims[0].pct, d2:S.result.dims[1].pct, d3:S.result.dims[2].pct,
    d4:S.result.dims[3].pct, d5:S.result.dims[4].pct, d6:S.result.dims[5].pct,
    respuestas:S.answers,
    recomendaciones:{
      fases:S.reco.fases.map(f => ({fase:f.n, programas:f.progs.map(p => p.n)})),
      extras:S.reco.extras.map(p => p.n)
    },
    meta:{v:'1.0'}
  };
  try{
    const r = await c.from(TABLE).insert(row);
    if(r.error) throw r.error;
    note.className = 'save-note ok';
    note.innerHTML = '✓ Diagnóstico registrado. Un asesor de EAN Educación Continua podrá dar seguimiento.';
  }catch(e){
    console.error('[dx] guardado', e);
    note.className = 'save-note warn';
    note.innerHTML = '⚠ El informe no quedó registrado en el servidor. Descárguelo antes de cerrar la página.';
  }
}

/* ───────────── Panel de administración ───────────── */
function goAdmin(){
  if(location.hash !== '#admin') history.replaceState(null, '', '#admin');
  show('s-admin');
  renderLogin();
}

function renderLogin(msg){
  $('adm-root').innerHTML =
    '<div class="adm-login"><div class="card">' +
      '<div class="card-t">Acceso restringido</div>' +
      '<div class="card-h">Panel de diagnósticos</div>' +
      '<div class="card-d">Solo la cuenta administradora puede consultar los registros.</div>' +
      '<div class="fgrid">' +
        '<div class="field"><label for="a-mail">Correo</label><input id="a-mail" type="email" autocomplete="username"></div>' +
        '<div class="field"><label for="a-pass">Contraseña</label><input id="a-pass" type="password" autocomplete="current-password"></div>' +
      '</div>' +
      (msg ? '<div class="save-note warn" style="margin:1rem 0 0">⚠ ' + esc(msg) + '</div>' : '') +
      '<div class="btn-row" style="margin-top:1.25rem">' +
        '<button class="btn btn-ghost" onclick="show(\'s-welcome\')">← Salir</button>' +
        '<button class="btn btn-primary" style="flex:1" onclick="admLogin()">Entrar</button>' +
      '</div>' +
    '</div></div>';
  $('a-pass').addEventListener('keydown', e => { if(e.key === 'Enter') admLogin(); });
}

async function admLogin(){
  const c = getSB();
  if(!c){ renderLogin('No hay conexión con el servidor.'); return; }
  const email = $('a-mail').value.trim();
  const password = $('a-pass').value;
  if(!email || !password){ renderLogin('Complete correo y contraseña.'); return; }
  const r = await c.auth.signInWithPassword({email:email, password:password});
  if(r.error){ renderLogin('Credenciales incorrectas.'); return; }
  loadAdmin();
}

async function loadAdmin(){
  const c = getSB();
  $('adm-root').innerHTML = '<div class="card">Cargando registros…</div>';
  const r = await c.from(TABLE).select('*').order('created_at', {ascending:false}).limit(500);

  if(r.error){ renderLogin('Esta cuenta no tiene permiso de lectura.'); return; }
  const data = r.data || [];

  if(!data.length){
    $('adm-root').innerHTML =
      '<div class="card" style="text-align:center;padding:3rem">' +
        '<div style="font-size:2.5rem;opacity:.35;margin-bottom:.75rem">◍</div>' +
        '<div style="font-weight:700">Aún no hay diagnósticos registrados</div>' +
        '<div class="btn-row" style="justify-content:center;margin-top:1.5rem">' +
          '<button class="btn btn-ghost" onclick="admOut()">Cerrar sesión</button>' +
        '</div>' +
      '</div>';
    return;
  }

  const avg = k => Math.round(data.reduce((a, x) => a + (x[k] || 0), 0) / data.length);
  const dimAvg = [1, 2, 3, 4, 5, 6]
    .map(i => ({d:DIMS[i - 1], v:avg('d' + i)}))
    .sort((a, b) => a.v - b.v);

  const barras = dimAvg.map(x =>
    '<div>' +
      '<div class="dim-top" style="margin-bottom:.4rem">' +
        '<div class="dim-name">' + esc(x.d.name) + '</div>' +
        '<div class="dim-pct" style="color:' + x.d.hex + '">' + x.v + '%</div>' +
      '</div>' +
      '<div class="dim-track"><div class="dim-fill" style="width:' + x.v + '%;background:' + x.d.hex + '"></div></div>' +
    '</div>'
  ).join('');

  const filas = data.map(row => {
    const peor = [1, 2, 3, 4, 5, 6]
      .map(i => ({d:DIMS[i - 1], v:row['d' + i] || 0}))
      .sort((a, b) => a.v - b.v)[0];
    const lv = LEVELS[row.nivel_key] || LEVELS.emergente;
    return '<tr>' +
      '<td><b>' + esc(row.empresa) + '</b><br><span style="color:var(--text-muted);font-size:.78rem">' + esc(row.tamano || '') + '</span></td>' +
      '<td>' + esc(row.contacto) + '<br><span style="color:var(--text-muted);font-size:.78rem">' + esc(row.email) + '</span></td>' +
      '<td style="font-size:.8rem">' + esc(row.sector || '') + '</td>' +
      '<td><b style="color:' + lv.hex + '">' + row.total + '</b></td>' +
      '<td><span class="pill" style="background:' + lv.hex + '18;color:' + lv.hex + '">' + esc(lv.label.replace('Organización ', '')) + '</span></td>' +
      '<td style="font-size:.8rem">' + esc(peor.d.short) + ' · ' + peor.v + '%</td>' +
      '<td>' + (row.autoriza_contacto
        ? '<span class="pill" style="background:#3FBF9518;color:#2E9E7A">Sí puede llamar</span>'
        : '<span class="pill" style="background:#EF444418;color:#DC2626">No autorizó</span>') + '</td>' +
      '<td style="font-size:.78rem;color:var(--text-muted)">' + new Date(row.created_at).toLocaleDateString('es-CO') + '</td>' +
    '</tr>';
  }).join('');

  $('adm-root').innerHTML =
    '<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap">' +
      '<div><div class="card-t">Panel</div><div class="card-h" style="margin:0">Diagnósticos recibidos</div></div>' +
      '<div style="flex:1"></div>' +
      '<button class="btn btn-ghost" onclick="admOut()">Cerrar sesión</button>' +
    '</div>' +

    '<div class="stats" style="grid-template-columns:repeat(4,1fr)">' +
      '<div class="stat"><div class="stat-n">' + data.length + '</div><div class="stat-l">Empresas</div></div>' +
      '<div class="stat"><div class="stat-n">' + avg('total') + '</div><div class="stat-l">Puntaje medio</div></div>' +
      '<div class="stat"><div class="stat-n">' + dimAvg[0].d.short + '</div><div class="stat-l">Brecha más común</div></div>' +
      '<div class="stat"><div class="stat-n">' + data.filter(x => x.autoriza_contacto).length + '</div><div class="stat-l">Contactables</div></div>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-t">Demanda agregada</div>' +
      '<div class="card-h">Dónde está la brecha del mercado</div>' +
      '<div class="card-d">Promedio por dimensión de todas las empresas diagnosticadas. Lo más bajo es lo que más se debe empujar comercialmente.</div>' +
      '<div class="dims">' + barras + '</div>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-t">Detalle</div>' +
      '<div class="card-h">Registros</div>' +
      '<div class="card-d">Solo puede contactarse comercialmente a quien lo autorizó de forma ' +
        'expresa. Llamar a quien marcó «No autorizó» infringe la Ley 1581 de 2012.</div>' +
      '<div class="adm-scroll"><table class="adm-tbl">' +
        '<thead><tr><th>Empresa</th><th>Contacto</th><th>Sector</th>' +
        '<th>Score</th><th>Nivel</th><th>Brecha mayor</th><th>Contacto comercial</th><th>Fecha</th></tr></thead>' +
        '<tbody>' + filas + '</tbody>' +
      '</table></div>' +
    '</div>';
}

/* Aviso accesible desde el pie en cualquier momento, no solo al
   registrarse: el titular debe poder consultarlo siempre. */
function verAviso(){
  show('s-welcome');
  const box = $('aviso-full');
  if(box.hidden) togAviso();
  setTimeout(function(){ $('f-legal').scrollIntoView({block:'center', behavior:'smooth'}); }, 60);
}

async function admOut(){
  const c = getSB();
  if(c) await c.auth.signOut();
  history.replaceState(null, '', location.pathname);
  show('s-welcome');
}

/* ───────────── init ───────────── */
function initLegal(){
  const n = $('resp-nombre'), d = $('resp-dom'), e = $('enc-nombre');
  if(n) n.textContent = RESPONSABLE.nombre;
  if(d) d.textContent = RESPONSABLE.domicilio;
  if(e) e.textContent = ENCARGADO.nombre;
}

function salirAdmin(){
  history.replaceState(null, '', location.pathname);
  show('s-welcome');
}

/* El panel tiene URL propia (#admin) para poder guardarlo en marcadores.
   No es un control de acceso: el enlace solo abre el formulario de
   ingreso, y los datos siguen protegidos por RLS del lado del servidor. */
function init(){
  renderChips();
  initLegal();
  wash('img/hero.jpg');
  if(location.hash === '#admin') goAdmin();
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
