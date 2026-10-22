/* Red Conecta · app base (MVP)
   Vistas: inicio, explorar, entrar, registro, publicar, mis publicaciones, matches, panel gestor.
   Toda la lógica de negocio vive en Supabase (RLS + funciones); esta app solo lee, escribe y muestra. */
(() => {
  const { supabaseUrl, supabaseKey } = window.RC_CONFIG;
  const sb = window.supabase.createClient(supabaseUrl, supabaseKey);
  const app = document.getElementById("app");
  const nav = document.getElementById("nav");
  const who = document.getElementById("who");

  const REGIONES = ["Amazonas","Antioquia","Arauca","Atlántico","Bogotá D.C.","Bolívar","Boyacá","Caldas","Caquetá","Casanare","Cauca","Cesar","Chocó","Córdoba","Cundinamarca","Guainía","Guaviare","Huila","La Guajira","Magdalena","Meta","Nariño","Norte de Santander","Putumayo","Quindío","Risaralda","San Andrés y Providencia","Santander","Sucre","Tolima","Valle del Cauca","Vaupés","Vichada"];
  const TYPES = { product:"Producto", service:"Servicio", capacity:"Capacidad instalada", job:"Vacante o proyecto", capital:"Capital", mentoring:"Mentoría", alliance:"Alianza" };
  const STATUS = { proposed:["Propuesto","purple"], review:["En revisión del gestor",""], mutual:["Interés mutuo","ok"], meeting:["Cita agendada","ok"], negotiating:["En negociación","ok"], closed_won:["Negocio cerrado","ok"], closed_lost:["No se concretó","bad"], dismissed:["Descartado","bad"] };
  const SIGNALS = { semantic:["Semántica",30], taxonomy:["Taxonomía",20], capacity:["Capacidad",15], territory:["Territorio",10], trust:["Confianza",15], behavior:["Comportamiento",10] };

  const state = { user:null, actor:null, manager:null, ecosystems:[], tags:[] };

  // ---------- utilidades ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const fmtCop = (n) => n == null ? "" : new Intl.NumberFormat("es-CO", { style:"currency", currency:"COP", maximumFractionDigits:0 }).format(n);
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric" }) : "";
  const fmtDateTime = (d) => d ? new Date(d).toLocaleString("es-CO", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }) : "";
  let toastTimer;
  function toast(msg, err) {
    const t = document.getElementById("toast");
    t.textContent = msg; t.classList.toggle("err", !!err); t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 4200);
  }
  function fail(e) { console.error(e); toast(e?.message || "Algo falló", true); }
  const go = (h) => { location.hash = h; };
  const eco = (id) => state.ecosystems.find((e) => e.id === id);
  const ecoBySlug = (s) => state.ecosystems.find((e) => e.slug === s);

  // ---------- sesión ----------
  async function loadSession() {
    const { data: { session } } = await sb.auth.getSession();
    state.user = session?.user || null;
    state.actor = null; state.manager = null;
    if (state.user) {
      const [{ data: mem }, { data: mgr }] = await Promise.all([
        sb.from("rc_actor_members").select("actor_id, rc_actors(*)").eq("user_id", state.user.id).limit(1),
        sb.from("rc_managers").select("*").eq("user_id", state.user.id).maybeSingle(),
      ]);
      state.actor = mem?.[0]?.rc_actors || null;
      state.manager = mgr || null;
    }
    renderChrome();
  }
  function renderChrome() {
    nav.querySelectorAll("[data-auth]").forEach((a) => (a.hidden = !state.user));
    nav.querySelectorAll("[data-manager]").forEach((a) => (a.hidden = !state.manager));
    nav.querySelectorAll("a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === location.hash));
    if (!state.user) {
      who.innerHTML = `<a class="btn sm primary" href="#/entrar">Entrar</a>`;
    } else {
      const name = state.actor ? (state.actor.display_name || state.actor.legal_name) : state.user.email;
      who.innerHTML = `<span>${esc(name)}</span>${state.manager ? '<span class="pill purple">gestor</span>' : ""}<button class="btn sm ghost" id="logout">Salir</button>`;
      document.getElementById("logout").onclick = async () => { await sb.auth.signOut(); await loadSession(); go("#/"); };
    }
  }
  async function loadCatalogs() {
    const [{ data: e }, { data: t }] = await Promise.all([
      sb.from("rc_ecosystems").select("*").eq("is_active", true).order("sort_order"),
      sb.from("rc_taxonomies").select("*").order("label"),
    ]);
    state.ecosystems = e || []; state.tags = t || [];
  }
  function requireAuth() {
    if (!state.user) { go("#/entrar"); return false; }
    return true;
  }
  function requireActor() {
    if (!requireAuth()) return false;
    if (!state.actor) { toast("Primero completa el registro de tu empresa o perfil"); go("#/registro"); return false; }
    return true;
  }

  // ---------- vistas ----------
  async function viewHome() {
    const { data: s } = await sb.rpc("rc_network_stats");
    const st = s || {};
    const ecoCards = (st.ecosystems || []).map((e) => `
      <a class="card" href="#/explorar?eco=${e.slug}">
        <h4>${esc(e.name)}</h4>
        <p>${esc(ecoBySlug(e.slug)?.description || "")}</p>
        <div class="meta"><span>${e.listings} publicaciones</span><span>${e.matches} matches</span></div>
      </a>`).join("");
    app.innerHTML = `
      <div class="hero">
        <div class="eyebrow">Fundación Managers × ICONEialabs</div>
        <h1>Una sola puerta a muchos ecosistemas</h1>
        <p class="lead">Publica lo que ofreces o lo que necesitas. La red te propone contrapartes con puntaje y explicación, y un gestor acompaña el cierre.</p>
        <div class="row" style="gap:10px;grid-template-columns:repeat(auto-fit,minmax(160px,max-content))">
          <a class="btn primary" href="${state.user ? "#/publicar" : "#/entrar"}">Publicar una necesidad u oferta</a>
          <a class="btn" href="#/explorar">Explorar la red</a>
        </div>
      </div>
      <div class="grid g4">
        <div class="kpi"><b>${st.actors ?? 0}</b><span>actores en la red</span></div>
        <div class="kpi"><b>${st.demands ?? 0} / ${st.offers ?? 0}</b><span>demandas / ofertas activas</span></div>
        <div class="kpi"><b>${st.matches ?? 0}</b><span>matches propuestos</span></div>
        <div class="kpi"><b>${st.liquidity ?? 0} %</b><span>demandas con ≥ 3 matches fuertes</span></div>
      </div>
      <div class="section"><h2>Ecosistemas</h2><p class="muted">Elige uno para ver lo que hoy se ofrece y se busca.</p>
      <div class="grid g3">${ecoCards}</div></div>`;
  }

  async function viewExplore(params) {
    const ecoSlug = params.get("eco") || "";
    const side = params.get("side") || "";
    const q = params.get("q") || "";
    let query = sb.from("rc_listing_cards").select("*").order("is_anchor", { ascending:false }).order("created_at", { ascending:false }).limit(60);
    if (ecoSlug) query = query.eq("ecosystem_slug", ecoSlug);
    if (side) query = query.eq("side", side);
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    const { data: rows, error } = await query;
    if (error) return fail(error);
    const opts = state.ecosystems.map((e) => `<option value="${e.slug}" ${e.slug === ecoSlug ? "selected" : ""}>${esc(e.name)}</option>`).join("");
    app.innerHTML = `
      <h2>Explorar la red</h2>
      <p class="muted">${rows.length} publicaciones activas${ecoSlug ? " en " + esc(ecoBySlug(ecoSlug)?.name || ecoSlug) : ""}.</p>
      <form class="toolbar" id="f">
        <div class="field"><label>Ecosistema</label><select name="eco"><option value="">Todos</option>${opts}</select></div>
        <div class="field"><label>Lado</label><select name="side"><option value="">Ofertas y demandas</option><option value="demand" ${side === "demand" ? "selected" : ""}>Solo demandas (lo que buscan)</option><option value="offer" ${side === "offer" ? "selected" : ""}>Solo ofertas</option></select></div>
        <div class="field" style="flex:2 1 220px"><label>Buscar</label><input name="q" value="${esc(q)}" placeholder="empaques, café, software…"></div>
        <button class="btn">Filtrar</button>
      </form>
      <div class="grid g3">${rows.map(cardListing).join("") || '<div class="empty">Nada por aquí todavía. Sé el primero en publicar.</div>'}</div>`;
    document.getElementById("f").onsubmit = (ev) => {
      ev.preventDefault();
      const fd = new FormData(ev.target); const p = new URLSearchParams();
      for (const [k, v] of fd) if (v) p.set(k, v);
      go("#/explorar?" + p.toString());
    };
  }
  function cardListing(l) {
    return `<div class="card">
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
        <span class="pill ${l.side}">${l.side === "offer" ? "Oferta" : "Demanda"}</span>
        <span class="pill">${esc(TYPES[l.type] || l.type)}</span>
        ${l.is_anchor ? `<span class="pill anchor">${l.side === "demand" ? "Demanda ancla" : "Oferta ancla"}</span>` : ""}
      </div>
      <h4>${esc(l.title)}</h4>
      <p>${esc(l.description).slice(0, 220)}${l.description.length > 220 ? "…" : ""}</p>
      <div class="meta">
        <span>${esc(l.actor_name)}${l.actor_verified ? " ✓" : ""}</span>
        <span>${esc(l.ecosystem_name)}</span>
        ${l.region ? `<span>${esc(l.region)}</span>` : ""}
        ${l.quantity ? `<span>${l.quantity} ${esc(l.unit || "")}</span>` : ""}
        ${l.price_min || l.price_max ? `<span>${fmtCop(l.price_min)}${l.price_max ? " – " + fmtCop(l.price_max) : ""}</span>` : ""}
      </div>
      ${(l.tags || []).length ? `<div class="chips" style="margin-top:8px">${l.tags.map((t) => `<span class="chip static">${esc(t)}</span>`).join("")}</div>` : ""}
    </div>`;
  }

  function viewLogin() {
    app.innerHTML = `
      <div class="auth">
        <h2>Entrar a Red Conecta</h2>
        <p class="muted">Con tu correo y una contraseña. Si es tu primera vez, crea la cuenta y luego registra tu empresa o perfil.</p>
        <form id="f">
          <div class="field"><label>Correo</label><input name="email" type="email" required autocomplete="email"></div>
          <div class="field"><label>Contraseña</label><input name="password" type="password" required minlength="6" autocomplete="current-password"></div>
          <div class="actions">
            <button class="btn primary" data-act="in">Entrar</button>
            <button class="btn" data-act="up">Crear cuenta</button>
            <button class="btn ghost" data-act="magic">Enviarme un enlace</button>
          </div>
        </form>
      </div>`;
    const f = document.getElementById("f");
    f.querySelectorAll("button").forEach((b) => b.addEventListener("click", async (ev) => {
      ev.preventDefault();
      const act = b.dataset.act; const email = f.email.value.trim(); const password = f.password.value;
      if (!email) return toast("Escribe tu correo", true);
      try {
        if (act === "in") {
          const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) throw error;
          await loadSession(); go(state.actor ? "#/matches" : "#/registro");
        } else if (act === "up") {
          if (password.length < 6) return toast("La contraseña necesita 6 caracteres o más", true);
          const { data, error } = await sb.auth.signUp({ email, password }); if (error) throw error;
          if (data.session) { await loadSession(); go("#/registro"); }
          else toast("Cuenta creada. Revisa tu correo para confirmarla y vuelve a entrar.");
        } else {
          const { error } = await sb.auth.signInWithOtp({ email, options:{ emailRedirectTo: location.href.split("#")[0] } }); if (error) throw error;
          toast("Te enviamos un enlace de acceso al correo.");
        }
      } catch (e) { fail(e); }
    }));
  }

  function viewRegister() {
    if (!requireAuth()) return;
    const a = state.actor || {};
    const ecoChecks = state.ecosystems.map((e) => `<label class="check"><input type="checkbox" name="eco" value="${e.id}"> ${esc(e.name)}</label>`).join("");
    app.innerHTML = `
      <h2>${state.actor ? "Tu perfil en la red" : "Registra tu empresa o perfil"}</h2>
      <p class="muted">Una sola identidad para todos los ecosistemas. Lo que marques aquí define dónde te propone la red.</p>
      <form id="f">
        <div class="row">
          <div class="field"><label>Tipo</label><select name="kind" required>
            <option value="company" ${a.kind === "company" ? "selected" : ""}>Empresa</option>
            <option value="person" ${a.kind === "person" ? "selected" : ""}>Persona (consultor, mentor, talento)</option>
            <option value="entity" ${a.kind === "entity" ? "selected" : ""}>Entidad (fondo, gremio, institución)</option></select></div>
          <div class="field"><label>Razón social o nombre completo</label><input name="legal_name" required value="${esc(a.legal_name)}"></div>
          <div class="field"><label>Nombre corto (como te verán)</label><input name="display_name" value="${esc(a.display_name)}"></div>
          <div class="field"><label>NIT o documento</label><input name="nit" value="${esc(a.nit)}"></div>
          <div class="field"><label>Departamento</label><select name="region">${REGIONES.map((r) => `<option ${a.region === r ? "selected" : ""}>${r}</option>`).join("")}</select></div>
          <div class="field"><label>Ciudad</label><input name="city" value="${esc(a.city)}"></div>
          <div class="field"><label>Tamaño</label><select name="size"><option value="">—</option>${["micro","small","medium","large"].map((s) => `<option value="${s}" ${a.size === s ? "selected" : ""}>${{ micro:"Micro", small:"Pequeña", medium:"Mediana", large:"Grande" }[s]}</option>`).join("")}</select></div>
          <div class="field"><label>CIIU principal (4 dígitos)</label><input name="ciiu_main" maxlength="4" value="${esc(a.ciiu_main)}" placeholder="1061"></div>
          <div class="field"><label>Correo de contacto</label><input name="contact_email" type="email" value="${esc(a.contact_email || state.user.email)}"></div>
          <div class="field"><label>WhatsApp</label><input name="contact_phone" value="${esc(a.contact_phone)}" placeholder="315 000 00 00"></div>
        </div>
        <div class="field"><label>¿Qué hace tu empresa y qué busca en la red?</label><textarea name="description" required>${esc(a.description)}</textarea></div>
        <div class="field"><label>Ecosistemas donde quieres participar</label><div class="row" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${ecoChecks}</div></div>
        <div class="actions"><button class="btn primary">${state.actor ? "Guardar cambios" : "Crear mi perfil"}</button></div>
      </form>`;
    if (state.actor) {
      sb.from("rc_actor_ecosystems").select("ecosystem_id").eq("actor_id", state.actor.id).then(({ data }) => {
        (data || []).forEach((r) => { const c = app.querySelector(`input[name=eco][value="${r.ecosystem_id}"]`); if (c) c.checked = true; });
      });
    }
    document.getElementById("f").onsubmit = async (ev) => {
      ev.preventDefault();
      const fd = new FormData(ev.target);
      const row = {};
      for (const k of ["kind","legal_name","display_name","nit","region","city","size","ciiu_main","contact_email","contact_phone","description"]) row[k] = fd.get(k) || null;
      const ecos = fd.getAll("eco");
      try {
        let actorId = state.actor?.id;
        if (actorId) { const { error } = await sb.from("rc_actors").update(row).eq("id", actorId); if (error) throw error; }
        else { row.created_by = state.user.id; const { data, error } = await sb.from("rc_actors").insert(row).select().single(); if (error) throw error; actorId = data.id; }
        await sb.from("rc_actor_ecosystems").delete().eq("actor_id", actorId);
        if (ecos.length) { const { error } = await sb.from("rc_actor_ecosystems").insert(ecos.map((e) => ({ actor_id: actorId, ecosystem_id: e }))); if (error) throw error; }
        await loadSession(); toast("Perfil guardado"); go("#/publicar");
      } catch (e) { fail(e); }
    };
  }

  function viewPublish() {
    if (!requireActor()) return;
    const a = state.actor;
    const tagChips = state.tags.filter((t) => t.kind === "tag").map((t) => `<span class="chip" data-tag="${esc(t.code)}">${esc(t.label)}</span>`).join("");
    app.innerHTML = `
      <h2>Publicar en la red</h2>
      <p class="muted">Describe con tus palabras. El motor clasifica y en segundos te muestra con quién te cruza.</p>
      <form id="f">
        <div class="row">
          <div class="field"><label>¿Qué publicas?</label><select name="side"><option value="demand">Una necesidad (demanda)</option><option value="offer">Una oferta</option></select></div>
          <div class="field"><label>Ecosistema</label><select name="ecosystem_id" id="eco">${state.ecosystems.map((e) => `<option value="${e.id}">${esc(e.name)}</option>`).join("")}</select></div>
          <div class="field"><label>Tipo</label><select name="type" id="type"></select></div>
        </div>
        <div class="field"><label>Título (una frase)</label><input name="title" required maxlength="120" placeholder="Empaques compostables para café de 250 g"></div>
        <div class="field"><label>Descripción (qué, cuánto, cuándo, condiciones)</label><textarea name="description" required></textarea></div>
        <div class="field"><label>Etiquetas</label><div class="chips" id="tags">${tagChips}</div></div>
        <div class="row">
          <div class="field"><label>CIIU de la actividad</label><input name="ciiu" maxlength="4" value="${esc(a.ciiu_main)}"></div>
          <div class="field"><label>Departamento</label><select name="region">${REGIONES.map((r) => `<option ${a.region === r ? "selected" : ""}>${r}</option>`).join("")}</select></div>
          <div class="field"><label>Cantidad</label><input name="quantity" type="number" step="any" min="0"></div>
          <div class="field"><label>Unidad</label><input name="unit" placeholder="unidades/mes, toneladas, horas"></div>
          <div class="field"><label>Precio mínimo (COP)</label><input name="price_min" type="number" step="1" min="0"></div>
          <div class="field"><label>Precio máximo (COP)</label><input name="price_max" type="number" step="1" min="0"></div>
          <div class="field"><label>Vigente hasta</label><input name="valid_until" type="date"></div>
        </div>
        <div class="field"><label class="check"><input type="checkbox" name="is_anonymous"> Publicar de forma anónima hasta que haya interés mutuo</label></div>
        <div class="actions"><button class="btn primary">Publicar y ver matches</button></div>
      </form>`;
    const ecoSel = document.getElementById("eco"), typeSel = document.getElementById("type");
    const fillTypes = () => { const e = eco(ecoSel.value); typeSel.innerHTML = (e?.listing_types || Object.keys(TYPES)).map((t) => `<option value="${t}">${TYPES[t]}</option>`).join(""); };
    ecoSel.onchange = fillTypes; fillTypes();
    const chosen = new Set();
    document.getElementById("tags").addEventListener("click", (ev) => {
      const c = ev.target.closest(".chip"); if (!c) return;
      const t = c.dataset.tag; chosen.has(t) ? chosen.delete(t) : chosen.add(t); c.classList.toggle("on", chosen.has(t));
    });
    document.getElementById("f").onsubmit = async (ev) => {
      ev.preventDefault();
      const fd = new FormData(ev.target);
      const num = (k) => (fd.get(k) ? Number(fd.get(k)) : null);
      const row = {
        actor_id: a.id, ecosystem_id: fd.get("ecosystem_id"), side: fd.get("side"), type: fd.get("type"),
        title: fd.get("title"), description: fd.get("description"), ciiu: fd.get("ciiu") || null, tags: [...chosen],
        region: fd.get("region"), quantity: num("quantity"), unit: fd.get("unit") || null,
        price_min: num("price_min"), price_max: num("price_max"), valid_until: fd.get("valid_until") || null,
        is_anonymous: !!fd.get("is_anonymous"), status: "active",
      };
      try {
        const { data, error } = await sb.from("rc_listings").insert(row).select().single(); if (error) throw error;
        await sb.from("rc_actor_ecosystems").upsert({ actor_id: a.id, ecosystem_id: row.ecosystem_id }, { onConflict: "actor_id,ecosystem_id", ignoreDuplicates: true });
        toast("Publicado. Buscando contrapartes…"); go("#/matches?listing=" + data.id);
      } catch (e) { fail(e); }
    };
  }

  async function viewMine() {
    if (!requireActor()) return;
    const { data: rows, error } = await sb.from("rc_listings").select("*, rc_ecosystems(name)").eq("actor_id", state.actor.id).order("created_at", { ascending:false });
    if (error) return fail(error);
    const ids = rows.map((r) => r.id);
    const { data: ms } = ids.length ? await sb.from("rc_matches").select("id, demand_id, offer_id, status").or(`demand_id.in.(${ids.join(",")}),offer_id.in.(${ids.join(",")})`) : { data: [] };
    const count = (id) => (ms || []).filter((m) => (m.demand_id === id || m.offer_id === id) && m.status !== "dismissed").length;
    app.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
        <div><h2>Mis publicaciones</h2><p class="muted">${esc(state.actor.display_name || state.actor.legal_name)} · <a href="#/registro">editar perfil</a></p></div>
        <a class="btn primary" href="#/publicar">Nueva publicación</a>
      </div>
      <div class="table"><table><thead><tr><th>Publicación</th><th>Ecosistema</th><th>Lado</th><th>Matches</th><th>Estado</th><th>Vigencia</th><th></th></tr></thead><tbody>
      ${rows.map((r) => `<tr>
        <td><a href="#/matches?listing=${r.id}"><b>${esc(r.title)}</b></a>${r.is_anonymous ? ' <span class="pill">anónima</span>' : ""}</td>
        <td>${esc(r.rc_ecosystems?.name)}</td>
        <td><span class="pill ${r.side}">${r.side === "offer" ? "Oferta" : "Demanda"}</span></td>
        <td class="mono">${count(r.id)}</td>
        <td>${r.status === "active" ? '<span class="pill ok">activa</span>' : `<span class="pill">${esc(r.status)}</span>`}</td>
        <td class="small">${fmtDate(r.valid_until) || "—"}</td>
        <td><button class="btn sm" data-toggle="${r.id}" data-st="${r.status}">${r.status === "active" ? "Pausar" : "Activar"}</button></td>
      </tr>`).join("") || '<tr><td colspan="7" class="muted">Aún no has publicado nada.</td></tr>'}
      </tbody></table></div>`;
    app.querySelectorAll("[data-toggle]").forEach((b) => b.onclick = async () => {
      const st = b.dataset.st === "active" ? "paused" : "active";
      const { error } = await sb.from("rc_listings").update({ status: st }).eq("id", b.dataset.toggle);
      if (error) return fail(error); toast(st === "active" ? "Publicación activada: recalculando matches" : "Publicación pausada"); viewMine();
    });
  }

  async function viewMatches(params) {
    if (!requireActor()) return;
    const listingId = params.get("listing");
    let q = sb.from("rc_matches")
      .select("*, demand:rc_listings!rc_matches_demand_id_fkey(id,title,side,actor_id,is_anonymous,region,type, actor:rc_actors(id,display_name,legal_name,contact_email,contact_phone,region,verified_at)), offer:rc_listings!rc_matches_offer_id_fkey(id,title,side,actor_id,is_anonymous,region,type, actor:rc_actors(id,display_name,legal_name,contact_email,contact_phone,region,verified_at)), rc_ecosystems(name), rc_meetings(id,starts_at,mode,link), rc_deals(id,kind,value_cop,closed_at)")
      .not("status", "in", "(dismissed,review)").order("score", { ascending:false });
    if (listingId) q = q.or(`demand_id.eq.${listingId},offer_id.eq.${listingId}`);
    const { data: rows, error } = await q;
    if (error) return fail(error);
    const mine = rows.filter((m) => [m.demand?.actor_id, m.offer?.actor_id].includes(state.actor.id));
    app.innerHTML = `
      <h2>Tus matches</h2>
      <p class="muted">${mine.length} contrapartes propuestas${listingId ? " para esta publicación" : ""}. Cada una viene con su explicación. Acepta las que te interesen: cuando el otro lado también acepte, verás el contacto.</p>
      ${listingId ? '<p><a href="#/matches">Ver todos mis matches</a></p>' : ""}
      <div class="grid" id="list">${mine.map(renderMatch).join("") || '<div class="empty">Todavía no hay contrapartes con puntaje suficiente. Cuando entren ofertas o demandas afines, aparecerán aquí y te avisaremos.</div>'}</div>`;
    bindMatchActions(() => viewMatches(params));
  }
  function renderMatch(m) {
    const iAmDemand = m.demand?.actor_id === state.actor?.id;
    const mineL = iAmDemand ? m.demand : m.offer;
    const other = iAmDemand ? m.offer : m.demand;
    const revealed = ["mutual","meeting","negotiating","closed_won","closed_lost"].includes(m.status);
    const otherName = other?.actor ? (other.actor.display_name || other.actor.legal_name) : "Actor anónimo";
    const myAccept = iAmDemand ? m.accepted_by_demand : m.accepted_by_offer;
    const [stLabel, stClass] = STATUS[m.status] || [m.status, ""];
    const bars = Object.entries(SIGNALS).map(([k, [label, max]]) => {
      const v = Number(m.score_breakdown?.[k] ?? 0);
      return `<div class="bar">${label} ${v.toFixed(0)}/${max}<i><b style="width:${Math.min(100, (v / max) * 100)}%"></b></i></div>`;
    }).join("");
    const contact = revealed && other?.actor ? `<div class="contact"><b>Contacto de ${esc(otherName)}:</b> ${esc(other.actor.contact_email || "")} ${other.actor.contact_phone ? "· WhatsApp " + esc(other.actor.contact_phone) : ""}</div>` : "";
    const meetings = (m.rc_meetings || []).map((x) => `<div class="timeline">Cita ${fmtDateTime(x.starts_at)} · ${esc(x.mode)}${x.link ? " · " + esc(x.link) : ""}</div>`).join("");
    const deals = (m.rc_deals || []).map((d) => `<div class="timeline">Negocio: ${esc(d.kind)} · ${fmtCop(d.value_cop)} · ${fmtDate(d.closed_at)}</div>`).join("");
    let acts = "";
    if (m.status === "proposed") {
      acts = myAccept
        ? `<span class="pill ok">Aceptaste · esperando al otro lado</span> <button class="btn sm danger" data-act="dismiss" data-id="${m.id}">Descartar</button>`
        : `<button class="btn sm primary" data-act="accept" data-id="${m.id}">Me interesa</button> <button class="btn sm" data-act="dismiss" data-id="${m.id}">No me sirve</button>`;
    } else if (m.status === "mutual") {
      acts = `<button class="btn sm primary" data-act="meet" data-id="${m.id}">Agendar cita</button> <button class="btn sm" data-act="advance" data-st="negotiating" data-id="${m.id}">Ya estamos negociando</button>`;
    } else if (["meeting","negotiating"].includes(m.status)) {
      acts = `<button class="btn sm primary" data-act="won" data-id="${m.id}">Cerramos negocio</button> <button class="btn sm" data-act="advance" data-st="negotiating" data-id="${m.id}">En negociación</button> <button class="btn sm danger" data-act="advance" data-st="closed_lost" data-id="${m.id}">No se concretó</button>`;
    }
    return `<div class="match" id="m-${m.id}">
      <div class="score"><b>${Number(m.score).toFixed(0)}</b><span>de 100</span></div>
      <div class="body">
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:4px">
          <span class="pill ${stClass}">${stLabel}</span><span class="pill">${esc(m.rc_ecosystems?.name || "")}</span>
          <span class="small muted">para tu ${mineL?.side === "demand" ? "demanda" : "oferta"} «${esc(mineL?.title || "")}»</span>
        </div>
        <div class="title">${esc(other?.title || "Publicación anónima")} <span class="muted small">· ${esc(otherName)}${other?.actor?.verified_at ? " ✓" : ""}${other?.region ? " · " + esc(other.region) : ""}</span></div>
        <div class="expl">${esc(iAmDemand ? m.explanation : (m.explanation_offer || m.explanation))}</div>
        <details><summary>Ver por qué este puntaje</summary><div class="bars">${bars}</div></details>
        ${contact}${meetings}${deals}
        <div class="acts">${acts}</div>
        <div id="form-${m.id}"></div>
      </div>
    </div>`;
  }
  function bindMatchActions(refresh) {
    app.querySelectorAll("[data-act]").forEach((b) => b.onclick = async () => {
      const id = b.dataset.id, act = b.dataset.act;
      try {
        if (act === "accept" || act === "dismiss") {
          const { data, error } = await sb.rpc("rc_respond_match", { p_match: id, p_accept: act === "accept" }); if (error) throw error;
          toast(data?.status === "mutual" ? "¡Interés mutuo! Ya puedes ver el contacto y agendar." : act === "accept" ? "Listo. Avisamos al otro lado." : "Descartado.");
          refresh();
        } else if (act === "advance") {
          const { error } = await sb.rpc("rc_advance_match", { p_match: id, p_status: b.dataset.st }); if (error) throw error;
          toast("Estado actualizado"); refresh();
        } else if (act === "meet") {
          const box = document.getElementById("form-" + id);
          box.innerHTML = `<form class="row" style="margin-top:10px;align-items:end"><div class="field"><label>Fecha y hora</label><input name="starts_at" type="datetime-local" required></div><div class="field"><label>Modalidad</label><select name="mode"><option value="virtual">Virtual</option><option value="presencial">Presencial</option></select></div><div class="field"><label>Enlace o lugar</label><input name="link" placeholder="Meet, dirección…"></div><div class="field"><button class="btn primary">Guardar cita</button></div></form>`;
          box.querySelector("form").onsubmit = async (ev) => {
            ev.preventDefault(); const fd = new FormData(ev.target);
            const { error } = await sb.from("rc_meetings").insert({ match_id: id, starts_at: new Date(fd.get("starts_at")).toISOString(), mode: fd.get("mode"), link: fd.get("link") || null }); if (error) return fail(error);
            const { error: e2 } = await sb.rpc("rc_advance_match", { p_match: id, p_status: "meeting" }); if (e2) return fail(e2);
            toast("Cita agendada"); refresh();
          };
        } else if (act === "won") {
          const box = document.getElementById("form-" + id);
          box.innerHTML = `<form class="row" style="margin-top:10px;align-items:end"><div class="field"><label>Tipo de negocio</label><select name="kind"><option value="sale">Venta</option><option value="contract">Contrato</option><option value="hire">Contratación</option><option value="investment">Inversión</option><option value="productivity">Mejora de productividad</option><option value="alliance">Alianza</option></select></div><div class="field"><label>Valor (COP)</label><input name="value_cop" type="number" min="0" step="1"></div><div class="field"><label>Fecha</label><input name="closed_at" type="date" value="${new Date().toISOString().slice(0, 10)}"></div><div class="field"><button class="btn primary">Registrar negocio</button></div></form>`;
          box.querySelector("form").onsubmit = async (ev) => {
            ev.preventDefault(); const fd = new FormData(ev.target);
            const { error } = await sb.from("rc_deals").insert({ match_id: id, kind: fd.get("kind"), value_cop: fd.get("value_cop") ? Number(fd.get("value_cop")) : null, closed_at: fd.get("closed_at"), reported_by: state.user.id }); if (error) return fail(error);
            const { error: e2 } = await sb.rpc("rc_advance_match", { p_match: id, p_status: "closed_won" }); if (e2) return fail(e2);
            toast("Negocio registrado. ¡Felicitaciones!"); refresh();
          };
        } else if (act === "mgr") {
          const { error } = await sb.rpc("rc_manager_decide", { p_match: id, p_approve: b.dataset.ok === "1" }); if (error) throw error;
          toast(b.dataset.ok === "1" ? "Match aprobado y propuesto a las partes" : "Match descartado"); refresh();
        }
      } catch (e) { fail(e); }
    });
  }

  async function viewPanel() {
    if (!requireAuth()) return;
    if (!state.manager) { app.innerHTML = '<div class="empty">Este panel es para gestores de la red.</div>'; return; }
    const [{ data: s }, { data: review }, { data: pipeline }] = await Promise.all([
      sb.rpc("rc_network_stats"),
      sb.from("rc_matches").select("*, demand:rc_listings!rc_matches_demand_id_fkey(title, actor:rc_actors(display_name,legal_name)), offer:rc_listings!rc_matches_offer_id_fkey(title, actor:rc_actors(display_name,legal_name)), rc_ecosystems(name)").eq("status", "review").order("score", { ascending:false }),
      sb.from("rc_matches").select("status").neq("status", "dismissed"),
    ]);
    const st = s || {};
    const counts = {}; (pipeline || []).forEach((m) => (counts[m.status] = (counts[m.status] || 0) + 1));
    app.innerHTML = `
      <h2>Panel del gestor</h2>
      <p class="muted">${esc(state.manager.full_name || state.user.email)}${state.manager.is_admin ? " · administrador" : ""}</p>
      <div class="grid g4">
        <div class="kpi"><b>${st.liquidity ?? 0} %</b><span>liquidez: demandas con ≥ 3 matches ≥ 70</span></div>
        <div class="kpi"><b>${st.mutual ?? 0}</b><span>matches con interés mutuo o más</span></div>
        <div class="kpi"><b>${st.closed_won ?? 0}</b><span>negocios cerrados</span></div>
        <div class="kpi"><b>${review?.length ?? 0}</b><span>matches esperando tu decisión</span></div>
      </div>
      <div class="section"><h3>Pipeline</h3><div class="chips">${Object.entries(STATUS).filter(([k]) => k !== "dismissed").map(([k, [l]]) => `<span class="chip static">${l}: <b>${counts[k] || 0}</b></span>`).join("")}</div></div>
      <div class="section"><h3>Por ecosistema</h3><div class="table"><table><thead><tr><th>Ecosistema</th><th>Publicaciones activas</th><th>Matches</th></tr></thead><tbody>
        ${(st.ecosystems || []).map((e) => `<tr><td>${esc(e.name)}</td><td class="mono">${e.listings}</td><td class="mono">${e.matches}</td></tr>`).join("")}</tbody></table></div></div>
      <div class="section"><h3>Matches en revisión (puntaje 50 a 69)</h3>
        <p class="muted">El motor no los propone solo. Tú decides si vale la pena presentarlos.</p>
        <div class="grid">${(review || []).map((m) => `<div class="match">
          <div class="score"><b>${Number(m.score).toFixed(0)}</b><span>de 100</span></div>
          <div class="body">
            <div class="title">${esc(m.demand?.title)} <span class="muted small">(${esc(m.demand?.actor?.display_name || m.demand?.actor?.legal_name)})</span></div>
            <div class="small muted">↔ ${esc(m.offer?.title)} (${esc(m.offer?.actor?.display_name || m.offer?.actor?.legal_name)}) · ${esc(m.rc_ecosystems?.name)}</div>
            <div class="expl">${esc(m.explanation)}</div>
            <div class="acts"><button class="btn sm primary" data-act="mgr" data-ok="1" data-id="${m.id}">Aprobar y proponer</button> <button class="btn sm danger" data-act="mgr" data-ok="0" data-id="${m.id}">Descartar</button></div>
          </div></div>`).join("") || '<div class="empty">Nada en revisión.</div>'}</div></div>`;
    bindMatchActions(viewPanel);
  }

  // ---------- router ----------
  const routes = { "": viewHome, "/": viewHome, "/explorar": viewExplore, "/entrar": viewLogin, "/registro": viewRegister, "/publicar": viewPublish, "/mis-publicaciones": viewMine, "/matches": viewMatches, "/panel": viewPanel };
  async function route() {
    const h = location.hash.replace(/^#/, "");
    const [path, qs] = h.split("?");
    const fn = routes[path] || viewHome;
    renderChrome();
    app.innerHTML = '<p class="muted">Cargando…</p>';
    try { await fn(new URLSearchParams(qs || "")); } catch (e) { fail(e); }
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  sb.auth.onAuthStateChange((_evt, session) => { if ((session?.user?.id || null) !== (state.user?.id || null)) loadSession().then(route); });

  (async () => {
    await loadCatalogs();
    await loadSession();
    await route();
    if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
  })();
})();
