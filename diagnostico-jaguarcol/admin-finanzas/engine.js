/* ═══════════════════════════════════════════════════════════════
   Diagnóstico de entrada · motor de flujo, puntaje y ruta
   Bootcamp IA en Acción — JaguarCol
   ICONE Dx. — © 2026 Ing. Jorge Hugo Pérez Gaona
   ═══════════════════════════════════════════════════════════════ */

'use strict';

const S = {
  nombre:'', email:'', subarea:'', antiguedad:'', equipo:'',
  /* bloque de contexto: no puntúa, pero es lo que permite matizar */
  tareas:[], frenos:[], modulos:[], abiertas:{},
  datos:false, autorizaTs:null,
  answers:new Array(QS.length).fill(null),
  idx:0, result:null, reco:null
};

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

  const nomBad = v('nombre').length < 3;
  setErr('f-nombre', nomBad);
  if(nomBad) ok = false;

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
  S.nombre = v('nombre');
  S.email  = v('email').toLowerCase();
  S.autorizaTs = new Date().toISOString();
  show('s-context');
}

/* ───────────── Paso 2 · contexto ───────────── */
function renderChips(){
  chipBox('chips-tareas',  CTX.tareas,  'tareas');
  chipBox('chips-frenos',  CTX.frenos,  'frenos');
}

/* Un solo constructor para los tres grupos de chips: tareas y frenos en
   el contexto, módulos en el cierre. Guardan índices, no textos: si
   mañana se reescribe una opción, los registros viejos siguen siendo
   legibles contra el CTX de su versión. */
function chipBox(id, items, key){
  const box = $(id);
  if(!box) return;
  box.innerHTML = items.map((t, i) =>
    '<button type="button" class="chip" data-g="' + key + '" data-i="' + i + '" ' +
      'onclick="togChip(\'' + key + '\',' + i + ')">' + esc(t) + '</button>'
  ).join('');
}

function togChip(key, i){
  const arr = S[key], k = arr.indexOf(i);
  if(k < 0) arr.push(i); else arr.splice(k, 1);
  const el = document.querySelector('.chip[data-g="' + key + '"][data-i="' + i + '"]');
  if(el) el.classList.toggle('on', k < 0);
  if(key === 'tareas' && arr.length) setErr('f-tareas', false);
}

const TOGGLES = { datos:'t-datos' };

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
    '<p>Su nombre, su correo, el área y subárea en que trabaja, su antigüedad, ' +
      'las respuestas al cuestionario, el resultado calculado y lo que escriba en ' +
      'las preguntas abiertas. No solicitamos datos sensibles ni datos de menores de edad.</p>' +

    '<h4>Para qué los usamos</h4>' +
    '<ul>' +
      '<li>Calcular y entregarle su informe individual de punto de partida.</li>' +
      '<li>Ajustar los contenidos, los ejemplos y el ritmo del ' + esc(CLIENTE.programa) +
        ' a la realidad de su área.</li>' +
      '<li>Producir estadísticas agregadas por área, en las que usted no es identificable.</li>' +
    '</ul>' +

    '<h4>Para qué NO los usamos</h4>' +
    '<p>Estas respuestas <b>no son una evaluación de desempeño</b> y no se usan para ' +
      'calificar, promover, sancionar ni desvincular a nadie. Su jefe no recibe su ' +
      'resultado individual: recibe el consolidado del área. Este diagnóstico solo ' +
      'sirve para saber desde dónde arranca la formación, y responder con honestidad ' +
      'es lo único que lo hace útil.</p>' +
    '<p>No vendemos, arrendamos ni cedemos sus datos a terceros.</p>' +

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
      'indicando su nombre, el área en que trabaja y la solicitud concreta. Las consultas se ' +
      'atienden en un plazo máximo de diez (10) días hábiles y los reclamos en ' +
      'quince (15) días hábiles, prorrogables conforme a la ley.</p>' +

    '<h4>Conservación</h4>' +
    '<p>Los datos se conservan mientras sean necesarios para la finalidad ' +
      'informada, o hasta que usted solicite su supresión.</p>' +

    '<h4>Carácter de la autorización</h4>' +
    '<p>La autorización de tratamiento es <b>obligatoria</b> para generar el ' +
      'diagnóstico, porque sin datos no hay informe que entregar. No hay ' +
      'autorizaciones comerciales ni de contacto: este diagnóstico no genera ' +
      'ninguna oferta dirigida a usted.</p>' +

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
     autorización registrada, se devuelve al paso 1. Sin esto la
     persona respondería las 30 preguntas y solo fallaría al guardar. */
  if(!S.datos || !S.autorizaTs){
    show('s-welcome');
    $('err-legal').classList.add('on');
    $('f-legal').scrollIntoView({block:'center', behavior:'smooth'});
    return;
  }

  const v = k => $('i-' + k).value;
  let ok = true;
  [['subarea','f-subarea'], ['antiguedad','f-antiguedad']].forEach(([k, f]) => {
    const bad = !v(k);
    setErr(f, bad);
    if(bad) ok = false;
  });
  const tBad = S.tareas.length === 0;
  setErr('f-tareas', tBad);
  if(tBad) ok = false;

  if(!ok){
    const first = document.querySelector('#s-context .field.err');
    if(first) first.scrollIntoView({block:'center', behavior:'smooth'});
    return;
  }
  S.subarea    = v('subarea');
  S.antiguedad = v('antiguedad');
  S.equipo     = v('equipo');
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

/* ───────────── Motor de ruta ─────────────
   El Mapa de Capacidades recomendaba programas de un portafolio de 79.
   Aquí el catálogo es uno solo —los cinco módulos del bootcamp— y todos
   se van a dictar. Así que la ruta no elige QUÉ ver, sino EN QUÉ ORDEN
   poner la atención y con qué caso propio llegar a cada módulo. */
function recommend(res){
  const sorted = res.dims.slice().sort((a, b) => a.pct - b.pct);
  const grupos = [sorted.slice(0, 2), sorted.slice(2, 4), sorted.slice(4)];

  const meta = [
    {n:1, t:'Por aquí empiece',   sub:'Las dos brechas que más pesan hoy',        color:'#D6453B'},
    {n:2, t:'Dónde consolidar',   sub:'Ya hay base; lo que falta es método',      color:'#D98A22'},
    {n:3, t:'Dónde profundizar',  sub:'Su terreno firme: úselo para jalonar',     color:'#2F6E5C'}
  ];

  const fases = meta.map((m, i) => ({
    n:m.n, t:m.t, sub:m.sub, color:m.color,
    items: grupos[i].map(d => ({
      dim:    d,
      mod:    MODULOS.filter(x => x.n === d.mod)[0],
      accion: ACCIONES[d.id]
    }))
  }));

  /* Módulos que la brecha vuelve prioritarios, sin repetir: el módulo 1
     cubre dos dimensiones y podría entrar dos veces. */
  const prioritarios = [];
  grupos[0].forEach(d => { if(prioritarios.indexOf(d.mod) < 0) prioritarios.push(d.mod); });

  return {fases:fases, prioritarios:prioritarios};
}

/* ───────────── Resultados ───────────── */
function finish(){
  /* El contexto del final va DESPUÉS de las 30 preguntas y no antes:
     quien acaba de revisar su forma de trabajar responde mucho mejor
     qué espera del bootcamp que quien apenas está entrando. */
  show('s-cierre');
  renderCierre();
}

function renderCierre(){
  chipBox('chips-modulos', CTX.modulos, 'modulos');
  $('cierre-abiertas').innerHTML = CTX.abiertas.map(a =>
    '<div class="field">' +
      '<label for="i-' + a.id + '">' + esc(a.q) + ' <span class="opt">(opcional)</span></label>' +
      '<textarea id="i-' + a.id + '" rows="3" placeholder="' + esc(a.ph) + '"></textarea>' +
    '</div>'
  ).join('');
}

function verInforme(){
  CTX.abiertas.forEach(a => {
    const el = $('i-' + a.id);
    if(el && el.value.trim()) S.abiertas[a.id] = el.value.trim();
  });
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

function rutaItem(it){
  const d = it.dim, m = it.mod;
  return '<div class="prog-item" style="--pc:' + d.hex + '">' +
      '<div class="prog-dot"></div>' +
      '<div class="prog-body">' +
        '<div class="prog-name">' + esc(d.name) + ' · ' + d.pct + '%</div>' +
        '<div class="prog-tags">' +
          '<span class="tag cl">Módulo ' + m.n + '</span>' +
          '<span class="tag">' + m.h + ' horas</span>' +
          '<span class="tag">' + esc(m.t) + '</span>' +
        '</div>' +
        '<div class="prog-acc"><b>Con qué llegar:</b> ' + esc(it.accion) + '</div>' +
      '</div>' +
    '</div>';
}

/* Traduce los índices guardados a texto legible del CTX vigente */
function ctxTexto(key, lista){
  return S[key].map(i => lista[i]).filter(Boolean);
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

  const fasesHtml = reco.fases.map(f =>
    '<div class="phase">' +
      '<div class="phase-h" style="--ph:' + f.color + '">' +
        '<div class="phase-n">' + f.n + '</div>' +
        '<div class="phase-t">' + esc(f.t) + '<small>' + esc(f.sub) + '</small></div>' +
      '</div>' +
      '<div class="prog-list">' + f.items.map(rutaItem).join('') + '</div>' +
    '</div>'
  ).join('');

  const tareas  = ctxTexto('tareas',  CTX.tareas);
  const frenos  = ctxTexto('frenos',  CTX.frenos);
  const modulos = ctxTexto('modulos', CTX.modulos);

  const fila = (k, v) =>
    '<div style="display:flex;gap:1rem;justify-content:space-between;border-bottom:1px solid var(--line);padding-bottom:.5rem">' +
      '<span style="color:var(--text-muted);font-weight:600;flex:0 0 auto">' + k + '</span>' +
      '<span style="text-align:right;font-weight:600">' + esc(v) + '</span>' +
    '</div>';

  const ctxHtml = [
    fila('Área',      AREA.nombre),
    fila('Subárea',   S.subarea),
    fila('Antigüedad', S.antiguedad),
    S.equipo ? fila('Personas a cargo', S.equipo) : '',
    tareas.length  ? fila('Lo que más tiempo consume', tareas.join(' · ')) : '',
    frenos.length  ? fila('Lo que hoy frena',          frenos.join(' · ')) : '',
    modulos.length ? fila('Dónde pidió detenerse',     modulos.join(' · ')) : ''
  ].join('');

  const abiertasHtml = CTX.abiertas
    .filter(a => S.abiertas[a.id])
    .map(a =>
      '<div style="border-left:3px solid var(--ean-green);padding-left:.9rem;margin-top:1rem">' +
        '<div style="font-size:.78rem;font-weight:700;color:var(--text-muted);margin-bottom:.2rem">' + esc(a.q) + '</div>' +
        '<div style="font-size:.9rem">' + esc(S.abiertas[a.id]) + '</div>' +
      '</div>'
    ).join('');

  const hoy = new Date().toLocaleDateString('es-CO', {day:'numeric', month:'long', year:'numeric'});

  $('res-root').innerHTML =
    '<div class="print-brand">' +
      '<img src="img/ean-logo.png" alt="EAN Universidad · Educación Continua">' +
      '<div class="print-brand-txt">' + esc(CLIENTE.programa) +
        '<small>' + esc(CLIENTE.nombre) + ' · ' + esc(AREA.nombre) + ' · ' + hoy + '</small>' +
      '</div>' +
    '</div>' +
    '<div id="save-note" class="save-note wait">⏳ Guardando su diagnóstico…</div>' +

    '<div class="score-card">' +
      '<div class="score-emp">' + esc(S.nombre) + ' · ' + esc(S.subarea) + '</div>' +
      '<div class="score-ring">' +
        '<svg width="170" height="170">' +
          '<circle cx="85" cy="85" r="76" fill="none" stroke="rgba(255,255,255,.13)" stroke-width="11"/>' +
          '<circle cx="85" cy="85" r="76" fill="none" stroke="' + lv.hex + '" stroke-width="11" ' +
                  'stroke-linecap="round" stroke-dasharray="' + dash + ' ' + CIRC + '"/>' +
        '</svg>' +
        '<div class="score-val"><div class="score-num">' + res.total + '</div>' +
        '<div class="score-of">Punto de partida</div></div>' +
      '</div>' +
      '<div class="score-lv">' + lv.label + '</div>' +
      '<div class="score-rng">' + lv.range + '</div>' +
      '<div class="score-desc">' + lv.desc + '</div>' +
    '</div>' +

    '<div class="sec-h">Su perfil frente a los módulos</div>' +
    radarSVG(res.dims) +
    '<p class="note-radar">Cada eje es un módulo del bootcamp. Lo que aparece hundido no es una ' +
      'mala nota: es donde estas 20 horas le van a rendir más.</p>' +

    '<div class="sec-h">Resultado por dimensión</div>' +
    '<div class="dims">' + dimsHtml + '</div>' +

    '<div class="sec-h">Las tres brechas que más pesan</div>' +
    '<div class="dims">' + gapsHtml + '</div>' +

    '<div class="sec-h">Su ruta dentro del bootcamp</div>' +
    '<div class="dims">' + fasesHtml + '</div>' +

    '<div class="sec-h">Lo que declaró</div>' +
    '<div class="card" style="margin-bottom:2rem">' +
      '<div style="display:grid;gap:.55rem;font-size:.88rem">' + ctxHtml + '</div>' +
      abiertasHtml +
    '</div>' +

    '<div class="cta">' +
      '<h3>Nos vemos en el bootcamp</h3>' +
      '<p>Sus respuestas ya llegaron al equipo docente. Con ellas y las de sus compañeros ' +
         'ajustamos los ejemplos, el ritmo y los casos de ' + esc(AREA.nombre) + '. ' +
         'Guarde este informe: al cerrar el programa vamos a comparar.</p>' +
      '<button class="btn btn-primary" onclick="window.print()">Descargar mi informe (PDF)</button>' +
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
  const d = S.result.dims;
  const row = {
    area:AREA.nombre, subarea:S.subarea,
    nombre:S.nombre, email:S.email,
    antiguedad:S.antiguedad, equipo_a_cargo:S.equipo || null,
    autoriza_datos:S.datos,
    autoriza_ts:S.autorizaTs,
    politica_version:POLITICA_VERSION,
    total:S.result.total, nivel_key:S.result.level.key, nivel:S.result.level.label,
    d1:d[0].pct, d2:d[1].pct, d3:d[2].pct, d4:d[3].pct, d5:d[4].pct, d6:d[5].pct,
    respuestas:S.answers,
    contexto:{
      tareas:  ctxTexto('tareas',  CTX.tareas),
      frenos:  ctxTexto('frenos',  CTX.frenos),
      modulos: ctxTexto('modulos', CTX.modulos),
      abiertas:S.abiertas
    },
    ruta:{
      prioritarios:S.reco.prioritarios,
      fases:S.reco.fases.map(f => ({fase:f.n, dims:f.items.map(x => x.dim.short)}))
    },
    meta:{v:'1.0', area_id:AREA.id}
  };
  try{
    const r = await c.from(TABLE).insert(row);
    if(r.error) throw r.error;
    note.className = 'save-note ok';
    note.innerHTML = '✓ Diagnóstico registrado. El equipo docente ya lo tiene.';
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
  const r = await c.from(TABLE).select('*').eq('area', AREA.nombre)
                   .order('created_at', {ascending:false}).limit(1000);

  if(r.error){ renderLogin('Esta cuenta no tiene permiso de lectura.'); return; }
  const data = r.data || [];
  window.__dx = data;

  if(!data.length){
    $('adm-root').innerHTML =
      '<div class="card" style="text-align:center;padding:3rem">' +
        '<div style="font-size:2.5rem;opacity:.35;margin-bottom:.75rem">◍</div>' +
        '<div style="font-weight:700">Aún no hay diagnósticos de ' + esc(AREA.nombre) + '</div>' +
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
        '<div class="dim-ico" style="background:' + x.d.hex + '18;color:' + x.d.hex + '">M' + x.d.mod + '</div>' +
        '<div class="dim-name">' + esc(x.d.name) + '</div>' +
        '<div class="dim-pct" style="color:' + x.d.hex + '">' + x.v + '%</div>' +
      '</div>' +
      '<div class="dim-track"><div class="dim-fill" style="width:' + x.v + '%;background:' + x.d.hex + '"></div></div>' +
    '</div>'
  ).join('');

  /* Conteo de lo que marcaron en el bloque de contexto. Es lo que dice
     con qué ejemplos llegar a la sesión, más que el puntaje mismo. */
  function conteo(campo){
    const m = {};
    data.forEach(row => ((row.contexto || {})[campo] || []).forEach(t => { m[t] = (m[t] || 0) + 1; }));
    return Object.keys(m).map(t => ({t:t, n:m[t]})).sort((a, b) => b.n - a.n);
  }
  const lista = (arr, max) => arr.slice(0, max || 6).map(x =>
    '<div style="display:flex;gap:.75rem;align-items:center;margin-bottom:.45rem">' +
      '<div style="flex:1;font-size:.86rem">' + esc(x.t) + '</div>' +
      '<div style="flex:0 0 90px;height:7px;border-radius:4px;background:var(--surface-2);overflow:hidden">' +
        '<div style="height:100%;width:' + Math.round(x.n / data.length * 100) + '%;background:var(--ean-green-d)"></div></div>' +
      '<b style="flex:0 0 34px;text-align:right;font-size:.82rem">' + x.n + '</b>' +
    '</div>'
  ).join('') || '<div style="color:var(--text-muted);font-size:.86rem">Sin datos todavía.</div>';

  const tareas = conteo('tareas'), frenos = conteo('frenos'), modulos = conteo('modulos');

  /* El texto libre es lo único que no se puede promediar: va completo. */
  const voces = data.map(row => {
    const ab = ((row.contexto || {}).abiertas) || {};
    const trozos = CTX.abiertas.filter(a => ab[a.id]).map(a =>
      '<div style="margin-top:.5rem"><div style="font-size:.72rem;font-weight:700;color:var(--text-muted)">' +
        esc(a.q) + '</div><div style="font-size:.88rem">' + esc(ab[a.id]) + '</div></div>');
    if(!trozos.length) return '';
    return '<div style="border-left:3px solid var(--ean-green);padding:.2rem 0 .2rem .9rem;margin-bottom:1.1rem">' +
      '<div style="font-weight:700;font-size:.85rem">' + esc(row.nombre) + ' · ' + esc(row.subarea || '') + '</div>' +
      trozos.join('') + '</div>';
  }).filter(Boolean).join('') ||
    '<div style="color:var(--text-muted);font-size:.86rem">Nadie ha escrito todavía en las preguntas abiertas.</div>';

  const filas = data.map(row => {
    const peor = [1, 2, 3, 4, 5, 6]
      .map(i => ({d:DIMS[i - 1], v:row['d' + i] || 0}))
      .sort((a, b) => a.v - b.v)[0];
    const lv = LEVELS.filter(l => l.key === row.nivel_key)[0] || LEVELS[0];
    return '<tr>' +
      '<td><b>' + esc(row.nombre) + '</b><br><span style="color:var(--text-muted);font-size:.78rem">' + esc(row.email) + '</span></td>' +
      '<td style="font-size:.82rem">' + esc(row.subarea || '') + '</td>' +
      '<td style="font-size:.8rem">' + esc(row.antiguedad || '') + '</td>' +
      '<td><b style="color:' + lv.hex + '">' + row.total + '</b></td>' +
      '<td><span class="pill" style="background:' + lv.hex + '18;color:' + lv.hex + '">' + esc(lv.label) + '</span></td>' +
      '<td style="font-size:.8rem">' + esc(peor.d.short) + ' · ' + peor.v + '%</td>' +
      '<td style="font-size:.78rem;color:var(--text-muted)">' + new Date(row.created_at).toLocaleDateString('es-CO') + '</td>' +
    '</tr>';
  }).join('');

  const cobertura = Math.round(data.length / AREA.participantes * 100);
  const nivelMasComun = (function(){
    const m = {};
    data.forEach(x => { m[x.nivel] = (m[x.nivel] || 0) + 1; });
    return Object.keys(m).sort((a, b) => m[b] - m[a])[0] || '—';
  })();

  $('adm-root').innerHTML =
    '<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap">' +
      '<div><div class="card-t">Panel · ' + esc(AREA.nombre) + '</div>' +
        '<div class="card-h" style="margin:0">Diagnósticos recibidos</div></div>' +
      '<div style="flex:1"></div>' +
      '<button class="btn btn-ghost" onclick="exportCSV()">Descargar CSV</button>' +
      '<button class="btn btn-ghost" onclick="admOut()">Cerrar sesión</button>' +
    '</div>' +

    '<div class="stats" style="grid-template-columns:repeat(4,1fr)">' +
      '<div class="stat"><div class="stat-n">' + data.length + '</div>' +
        '<div class="stat-l">de ' + AREA.participantes + ' · ' + cobertura + '%</div></div>' +
      '<div class="stat"><div class="stat-n">' + avg('total') + '</div><div class="stat-l">Puntaje medio</div></div>' +
      '<div class="stat"><div class="stat-n">' + esc(dimAvg[0].d.short) + '</div><div class="stat-l">Brecha del área</div></div>' +
      '<div class="stat"><div class="stat-n" style="font-size:1.25rem">' + esc(nivelMasComun) + '</div><div class="stat-l">Nivel más común</div></div>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-t">Dónde poner las horas</div>' +
      '<div class="card-h">Promedio por módulo</div>' +
      '<div class="card-d">Promedio de las ' + data.length + ' respuestas de esta área, de menor a mayor. ' +
        'Lo primero de la lista es a lo que hay que darle más aire en la sesión.</div>' +
      '<div class="dims">' + barras + '</div>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-t">Contexto del área</div>' +
      '<div class="card-h">Qué pesa, qué frena y qué piden</div>' +
      '<div class="fgrid two" style="margin-top:1rem">' +
        '<div><div class="card-t" style="margin-bottom:.6rem">Lo que más tiempo consume</div>' + lista(tareas) + '</div>' +
        '<div><div class="card-t" style="margin-bottom:.6rem">Lo que hoy los frena</div>' + lista(frenos) + '</div>' +
      '</div>' +
      '<div style="margin-top:1.2rem"><div class="card-t" style="margin-bottom:.6rem">Dónde piden detenerse</div>' +
        lista(modulos, 5) + '</div>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-t">En sus palabras</div>' +
      '<div class="card-h">Respuestas abiertas</div>' +
      '<div class="card-d">Lo único que no se puede promediar. Aquí están los casos con los que ' +
        'conviene llegar a la sesión.</div>' +
      '<div style="margin-top:1rem">' + voces + '</div>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-t">Detalle</div>' +
      '<div class="card-h">Registros</div>' +
      '<div class="card-d">Datos personales de colaboradores: úselos para preparar la formación, ' +
        'no para evaluar desempeño. Esa no fue la finalidad que se les informó.</div>' +
      '<div class="adm-scroll"><table class="adm-tbl">' +
        '<thead><tr><th>Persona</th><th>Subárea</th><th>Antigüedad</th>' +
        '<th>Puntaje</th><th>Nivel</th><th>Brecha mayor</th><th>Fecha</th></tr></thead>' +
        '<tbody>' + filas + '</tbody>' +
      '</table></div>' +
    '</div>';
}

/* CSV para cruzar las tres áreas en una sola hoja */
function exportCSV(){
  const data = window.__dx || [];
  const cab = ['fecha','area','subarea','nombre','email','antiguedad','total','nivel']
    .concat(DIMS.map(d => d.short))
    .concat(['tareas','frenos','modulos_pedidos']);
  const filas = data.map(r => {
    const ctx = r.contexto || {};
    return [new Date(r.created_at).toISOString().slice(0, 10), r.area, r.subarea, r.nombre,
            r.email, r.antiguedad, r.total, r.nivel,
            r.d1, r.d2, r.d3, r.d4, r.d5, r.d6,
            (ctx.tareas || []).join(' | '), (ctx.frenos || []).join(' | '),
            (ctx.modulos || []).join(' | ')];
  });
  const csv = [cab].concat(filas)
    .map(f => f.map(c => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], {type:'text/csv;charset=utf-8'}));
  a.download = 'diagnostico-' + AREA.id + '.csv';
  a.click();
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
