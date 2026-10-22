/* Red Conecta · ilustraciones vectoriales por ecosistema (paleta ICONEialabs).
   Idea común: lo que se ofrece (cian) y lo que se necesita (naranja) se encuentran en un punto (morado). */
window.RC_ART = (() => {
  const C = "#00d4ff", V = "#7b2fff", O = "#ff8c00", N3 = "#101f40", LN = "#1c2d55", FG = "#e6ecf7", BG = "#060f26";
  const ACCENT = { hero: V, productoras: C, productividad: O, emprendimiento: V, talento: C, financiacion: O, conocimiento: V, turismo: C, rural: O, vacio: C };

  const shell = (id, inner) => `<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0e1f46"/><stop offset="1" stop-color="${BG}"/></linearGradient>
<radialGradient id="gl-${id}" cx=".82" cy=".18" r=".75"><stop offset="0" stop-color="${ACCENT[id]}" stop-opacity=".30"/><stop offset="1" stop-color="${ACCENT[id]}" stop-opacity="0"/></radialGradient>
<pattern id="dt-${id}" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="${LN}"/></pattern>
<linearGradient id="mt-${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C}"/><stop offset="1" stop-color="${O}"/></linearGradient>
</defs>
<rect width="320" height="180" fill="url(#bg-${id})"/><rect width="320" height="180" fill="url(#dt-${id})" opacity=".7"/><rect width="320" height="180" fill="url(#gl-${id})"/>
${inner}</svg>`;

  const node = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${N3}" stroke="${c}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${Math.max(2, r / 3)}" fill="${c}"/>`;
  const curve = (x1, y1, x2, y2, c) => `<path d="M${x1} ${y1} C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}" fill="none" stroke="${c}" stroke-width="1.6" stroke-dasharray="4 4" opacity=".8"/>`;

  const scenes = {
    hero() {
      const L = [[44, 48], [34, 98], [66, 142], [96, 80]], R = [[276, 44], [288, 94], [254, 140], [224, 84]];
      return L.map((p) => curve(p[0], p[1], 160, 90, C)).join("") + R.map((p) => curve(160, 90, p[0], p[1], O)).join("")
        + `<path d="M96 80 C128 80 128 90 160 90 C192 90 192 84 224 84" fill="none" stroke="url(#mt-hero)" stroke-width="3.2" stroke-linecap="round"/>`
        + L.map((p) => node(p[0], p[1], 9, C)).join("") + R.map((p) => node(p[0], p[1], 9, O)).join("")
        + `<circle class="pulse" cx="160" cy="90" r="22" fill="none" stroke="${V}" stroke-width="2"/><circle cx="160" cy="90" r="15" fill="${V}"/>`
        + `<path d="M153 90 l5 5 l9 -10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    },
    productoras() {
      return `<g fill="${N3}" stroke="${C}" stroke-width="2" stroke-linejoin="round"><rect x="34" y="104" width="38" height="30" rx="3"/><rect x="76" y="104" width="38" height="30" rx="3"/><rect x="55" y="72" width="38" height="30" rx="3"/></g>`
        + `<path d="M34 118h38M76 118h38M55 86h38" stroke="${C}" opacity=".5"/>`
        + `<path d="M20 146H300" stroke="${LN}" stroke-width="2" stroke-dasharray="6 6"/>`
        + `<rect x="128" y="92" width="62" height="42" rx="3" fill="${N3}" stroke="${V}" stroke-width="2"/>`
        + `<path d="M190 104h20l14 16v14h-34z" fill="${N3}" stroke="${V}" stroke-width="2" stroke-linejoin="round"/>`
        + `<circle cx="146" cy="138" r="8" fill="${BG}" stroke="${FG}" stroke-width="2"/><circle cx="206" cy="138" r="8" fill="${BG}" stroke="${FG}" stroke-width="2"/>`
        + `<rect x="250" y="84" width="46" height="50" fill="${N3}" stroke="${O}" stroke-width="2"/><path d="M246 84h54l-6-14h-42z" fill="${O}" opacity=".9"/><rect x="266" y="108" width="14" height="26" fill="${O}" opacity=".35"/>`
        + `<path d="M93 72C140 30 230 30 273 66" fill="none" stroke="${C}" stroke-width="1.8" stroke-dasharray="4 4"/><circle cx="273" cy="66" r="4" fill="${C}"/>`;
    },
    productividad() {
      return `<circle cx="52" cy="50" r="18" fill="none" stroke="${C}" stroke-width="6" stroke-dasharray="6 4"/><circle cx="52" cy="50" r="7" fill="${N3}" stroke="${C}" stroke-width="2"/>`
        + `<circle cx="284" cy="46" r="12" fill="none" stroke="${V}" stroke-width="5" stroke-dasharray="5 4"/><circle cx="284" cy="46" r="5" fill="${N3}" stroke="${V}" stroke-width="2"/>`
        + `<path d="M84 132A76 76 0 0 1 236 132" fill="none" stroke="${LN}" stroke-width="14" stroke-linecap="round"/>`
        + `<path d="M84 132A76 76 0 0 1 213.7 78.3" fill="none" stroke="${C}" stroke-width="14" stroke-linecap="round"/>`
        + `<path d="M160 132L201 91" stroke="${O}" stroke-width="4" stroke-linecap="round"/><circle cx="160" cy="132" r="9" fill="${O}"/><circle cx="160" cy="132" r="3.5" fill="${BG}"/>`
        + `<path d="M104 156h112" stroke="${LN}" stroke-width="2"/>`;
    },
    emprendimiento() {
      return `<g fill="${N3}" stroke="${C}" stroke-width="2" stroke-linejoin="round"><rect x="48" y="118" width="34" height="32" rx="3"/><rect x="88" y="98" width="34" height="52" rx="3"/><rect x="128" y="76" width="34" height="74" rx="3"/><rect x="168" y="54" width="34" height="96" rx="3"/></g>`
        + `<path d="M60 108C100 80 140 60 176 44" fill="none" stroke="${V}" stroke-width="2" stroke-dasharray="4 4"/>`
        + `<polygon points="185,22 189,33 201,35 192,43 195,55 185,49 175,55 178,43 169,35 181,33" fill="${O}"/>`
        + `<circle cx="256" cy="74" r="20" fill="${N3}" stroke="${V}" stroke-width="2"/><rect x="247" y="94" width="18" height="9" rx="2" fill="${N3}" stroke="${V}" stroke-width="2"/>`
        + `<path d="M256 40v-8M280 50l6-6M286 74h8M226 50l-6-6M226 74h-8" stroke="${O}" stroke-width="2" stroke-linecap="round"/>`
        + `<path d="M250 76l6 6 8-10" fill="none" stroke="${V}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    },
    talento() {
      return `<path d="M60 136H260" stroke="${LN}" stroke-width="2"/>`
        + `<circle cx="108" cy="74" r="13" fill="${N3}" stroke="${C}" stroke-width="2"/><path d="M82 136C82 108 94 98 108 98C122 98 134 108 134 136z" fill="${N3}" stroke="${C}" stroke-width="2" stroke-linejoin="round"/>`
        + `<circle cx="212" cy="74" r="13" fill="${N3}" stroke="${O}" stroke-width="2"/><path d="M186 136C186 108 198 98 212 98C226 98 238 108 238 136z" fill="${N3}" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>`
        + `<path d="M122 70C140 54 180 54 198 70" fill="none" stroke="${V}" stroke-width="2" stroke-dasharray="4 4"/>`
        + `<circle cx="160" cy="108" r="18" fill="${V}"/><path d="M151 108l7 7 12-14" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    },
    financiacion() {
      const coins = [0, 1, 2, 3].map((i) => `<ellipse cx="70" cy="${138 - i * 12}" rx="30" ry="9" fill="${N3}" stroke="${C}" stroke-width="2"/>`).join("");
      return coins + `<ellipse cx="70" cy="102" rx="14" ry="4" fill="none" stroke="${C}" opacity=".6"/>`
        + `<path d="M130 150H290M130 150V46" stroke="${LN}" stroke-width="2" fill="none"/>`
        + `<polygon points="138,136 172,116 202,124 244,84 284,56 284,150 138,150" fill="${O}" opacity=".10"/>`
        + `<polyline points="138,136 172,116 202,124 244,84 284,56" fill="none" stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`
        + [[138, 136], [172, 116], [202, 124], [244, 84]].map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${N3}" stroke="${O}" stroke-width="2"/>`).join("")
        + `<circle cx="284" cy="56" r="9" fill="${O}" opacity=".3"/><circle cx="284" cy="56" r="5" fill="${O}"/>`;
    },
    conocimiento() {
      return `<path d="M104 40C104 66 160 60 160 86M160 28V86M216 40C216 66 160 60 160 86" fill="none" stroke="${LN}" stroke-width="2" stroke-dasharray="4 4"/>`
        + node(104, 40, 8, C) + node(160, 28, 8, V) + node(216, 40, 8, O)
        + `<path d="M160 142L88 128V76L160 90z" fill="${N3}" stroke="${C}" stroke-width="2" stroke-linejoin="round"/>`
        + `<path d="M160 142L232 128V76L160 90z" fill="${N3}" stroke="${V}" stroke-width="2" stroke-linejoin="round"/>`
        + `<path d="M100 92l48 9M100 106l48 9" stroke="${C}" opacity=".5" stroke-width="2"/><path d="M172 101l48-9M172 115l48-9" stroke="${V}" opacity=".6" stroke-width="2"/>`;
    },
    turismo() {
      return `<circle cx="60" cy="48" r="16" fill="${O}" opacity=".9"/><circle cx="60" cy="48" r="24" fill="none" stroke="${O}" opacity=".35"/>`
        + `<polygon points="70,140 130,66 190,140" fill="${N3}" stroke="${C}" stroke-width="2" stroke-linejoin="round"/>`
        + `<path d="M130 66l-12 16 8-4 6 6 6-6 8 4z" fill="${FG}" opacity=".85"/>`
        + `<polygon points="140,140 210,84 290,140" fill="${N3}" stroke="${V}" stroke-width="2" stroke-linejoin="round"/>`
        + `<path d="M210 84c-10-14-16-20-16-28a16 16 0 1 1 32 0c0 8-6 14-16 28z" fill="${O}"/><circle cx="210" cy="56" r="5" fill="${BG}"/>`
        + `<path d="M24 158C90 140 150 166 300 148" fill="none" stroke="${C}" stroke-width="2" stroke-dasharray="5 5"/>`;
    },
    rural() {
      const leaf = (x, y, rot) => `<ellipse cx="${x}" cy="${y}" rx="20" ry="8" transform="rotate(${rot} ${x} ${y})" fill="${N3}" stroke="${C}" stroke-width="2"/>`;
      return `<circle cx="262" cy="40" r="14" fill="${O}" opacity=".25" stroke="${O}"/>`
        + `<path d="M0 150C60 120 120 140 180 126C240 112 290 130 320 120L320 180H0z" fill="${N3}" stroke="${LN}" stroke-width="2"/>`
        + `<path d="M70 150C84 118 120 96 176 70C200 58 224 52 250 50" fill="none" stroke="${C}" stroke-width="3" stroke-linecap="round"/>`
        + leaf(108, 116, -40) + leaf(140, 92, -30) + leaf(200, 66, -20)
        + `<path d="M150 90v20M160 84v34M172 78v28" stroke="${C}" stroke-width="1.6"/>`
        + `<circle cx="150" cy="112" r="7" fill="${O}"/><circle cx="160" cy="120" r="7" fill="${O}"/><circle cx="172" cy="108" r="7" fill="${O}"/>`;
    },
    vacio() {
      return `<path d="M150 84L86 50M150 84L236 56M150 84L84 130M150 84L250 120" stroke="${LN}" stroke-width="2" stroke-dasharray="4 4"/>`
        + node(86, 50, 8, V) + node(236, 56, 8, O) + node(84, 130, 8, O) + node(250, 120, 8, C)
        + `<circle cx="150" cy="84" r="30" fill="${N3}" stroke="${C}" stroke-width="5"/><path d="M172 106L200 134" stroke="${C}" stroke-width="7" stroke-linecap="round"/>`
        + `<circle cx="140" cy="76" r="3" fill="${V}"/><circle cx="158" cy="92" r="3" fill="${O}"/><circle cx="160" cy="72" r="3" fill="${C}"/>`;
    },
  };

  // Fotografías de Adobe Stock (licencia gratuita), tratadas en modo claro. Ids en el banco de escenas.
  const PHOTOS = {
    hero: "Socios cerrando un acuerdo con un apretón de manos",
    productoras: "Dos operarias revisan un despacho en la bodega",
    productividad: "Ingeniera con tableta revisando la producción en planta",
    emprendimiento: "Emprendedora presenta resultados a su equipo",
    talento: "Entrevista de trabajo: una candidata entrega su hoja de vida",
    financiacion: "Equipo revisando cifras y proyecciones",
    conocimiento: "Taller de formación con participantes de varias edades",
    turismo: "Recepción de hotel atendiendo a huéspedes",
    rural: "Caficultora recogiendo café maduro en su finca",
  };

  const cache = {};
  const svg = (slug) => {
    const id = scenes[slug] ? slug : "hero";
    return (cache[id] ||= shell(id, scenes[id]()));
  };
  return {
    svg,
    // size: "sm" (640 px, tarjetas) o "lg" (1280 px, portada y cabeceras)
    photo(slug, size = "lg") {
      if (!PHOTOS[slug]) return svg(slug);
      const src = `img/${slug}${size === "sm" ? "-sm" : ""}.webp`;
      return `<img src="${src}" alt="${PHOTOS[slug]}" loading="${size === "sm" ? "lazy" : "eager"}" decoding="async" width="${size === "sm" ? 640 : 1280}" height="${size === "sm" ? 360 : 720}">`;
    },
  };
})();
