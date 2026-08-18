/* ═══════════════════════════════════════════════════════════════
   Mapa de Capacidades · Universidad EAN
   Motor ICONE Dx. — © 2026 Ing. Jorge Hugo Pérez Gaona
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ───────────── Protección de datos personales ─────────────
   Ley 1581 de 2012, Decreto 1074 de 2015 y Sentencia C-748 de 2011.

   El RESPONSABLE del tratamiento es quien decide sobre los datos y
   quien debe atender las consultas y reclamos del titular. Cambiar
   este bloque cambia a quién le llegan las solicitudes de habeas data.

   La versión de la política se guarda con cada autorización: si el
   texto cambia, las autorizaciones anteriores siguen probando qué
   fue exactamente lo que el titular aceptó. Al modificar el aviso,
   suba POLITICA_VERSION. */
const POLITICA_VERSION = '2.1-2026-08';

/* RESPONSABLE: decide la finalidad del tratamiento. Es EAN, porque los
   leads son suyos y es la marca que ve el titular al entregar sus datos.
   ENCARGADO: trata los datos por cuenta del responsable. Es ICONE, que
   opera la plataforma y la base de datos.

   PENDIENTE DE EAN: el NIT y el correo oficial de habeas data. Mientras
   EAN no los entregue, el canal habilitado es el del encargado, que es
   válido pero provisional. Al recibirlos, reemplazar `correo` y subir
   POLITICA_VERSION. */
const RESPONSABLE = {
  nombre:    'Universidad EAN · EAN Educación Continua',
  domicilio: 'Bogotá D.C., Colombia',
  correo:    'jorgehugoperez@iconeialabs.com',
  sitio:     'https://universidadean.edu.co'
};

const ENCARGADO = {
  nombre: 'ICONE ialabs — Ing. Jorge Hugo Pérez Gaona',
  correo: 'jorgehugoperez@iconeialabs.com',
  sitio:  'https://iconeialabs.com'
};

/* ───────────── Supabase ───────────── */
const SB_URL = 'https://nvgkhdrrxqdgxktfkioa.supabase.co';
const SB_KEY = 'sb_publishable_d1RrtE7S-9a8e8mGKRRjxQ_4HU_nkDl';
const TABLE  = 'ean_diagnosticos';
let sb = null;
function getSB(){
  if(!sb && window.supabase) sb = window.supabase.createClient(SB_URL, SB_KEY);
  return sb;
}

/* ───────────── Dimensiones ─────────────
   Se pregunta por CAPACIDAD ORGANIZACIONAL (la necesidad),
   no por cluster de portafolio (la oferta). Los clusters
   aparecen solo en la recomendación. */
const DIMS = [
  {id:1, name:'Capacidad Digital y Datos',         short:'Digital',   ico:'◧', color:'var(--d1)', hex:'#0EA5E9', img:'img/d1.jpg'},
  {id:2, name:'Adopción de Inteligencia Artificial',short:'IA',       ico:'◆', color:'var(--d2)', hex:'#7B2FFF', img:'img/d2.jpg'},
  {id:3, name:'Gestión Comercial y Mercado',       short:'Comercial', ico:'◈', color:'var(--d3)', hex:'#F59E0B', img:'img/d3.jpg'},
  {id:4, name:'Gestión Financiera y de Proyectos', short:'Finanzas',  ico:'◉', color:'var(--d4)', hex:'#10B981', img:'img/d4.jpg'},
  {id:5, name:'Liderazgo y Talento',               short:'Talento',   ico:'◐', color:'var(--d5)', hex:'#EC4899', img:'img/d5.jpg'},
  {id:6, name:'Cultura de Aprendizaje e Innovación',short:'Cultura',  ico:'◍', color:'var(--d6)', hex:'#FF8C00', img:'img/d6.jpg'}
];

/* Lectura de cada dimensión según el nivel alcanzado */
const DIM_READ = {
  1:['La operación depende de procesos manuales y archivos sueltos. No hay base de datos confiable para decidir.',
     'Hay herramientas digitales, pero aisladas. La información existe y no se aprovecha.',
     'Hay sistemas y métricas funcionando. El siguiente salto es integración y analítica avanzada.',
     'Ecosistema digital maduro. El foco pasa a especialización técnica y arquitectura.'],
  2:['La IA no ha entrado a la organización. Es la brecha con mayor costo de oportunidad hoy.',
     'Hay uso individual y desordenado de IA, sin lineamiento ni gobierno. Riesgo de fuga de información.',
     'Hay usos definidos y algo de formación. Falta escalarlo a procesos y a la alta dirección.',
     'La IA es capacidad instalada. El siguiente paso es agentes en producción y ventaja competitiva.'],
  3:['La venta depende de relaciones personales, no de un proceso. El crecimiento no es predecible.',
     'Hay metas y actividad comercial, pero sin proceso ni marketing que los sostenga.',
     'El proceso comercial funciona. La oportunidad está en canales digitales y nuevos mercados.',
     'Operación comercial madura. El foco es expansión, internacionalización y valor del cliente.'],
  4:['El control financiero es reactivo. Se decide sin información oportuna y los proyectos se desbordan.',
     'Hay información financiera, pero llega tarde y no alimenta decisiones ni gestión de proyectos.',
     'Hay presupuesto, seguimiento y metodología. Falta profundidad en riesgo, inversión y certificación.',
     'Gestión financiera y de proyectos consolidada. Foco en especialización y certificación del equipo.'],
  5:['El liderazgo es improvisado y la organización depende críticamente de pocas personas.',
     'Hay líderes con voluntad pero sin herramientas. La rotación y la comunicación cuestan dinero.',
     'Hay formación y procesos de talento. Falta consolidar sucesión y liderazgo de alta dirección.',
     'Liderazgo y talento son una fortaleza. El foco pasa a alta dirección y desarrollo ejecutivo.'],
  6:['No hay estructura de formación. Lo que se aprende no se aplica ni se conserva.',
     'Se invierte en formación de manera reactiva, sin plan ni medición de impacto.',
     'Hay plan de formación. El siguiente paso es medir transferencia al puesto y gestionar innovación.',
     'Organización que aprende. El foco es innovación gestionada y conocimiento como activo.']
};

/* ───────────── Banco de preguntas · 6 × 5 = 30 ─────────────
   Escala conductual 0–3. Cada opción describe una conducta
   observable, no un grado de acuerdo. */
const QS = [
  /* ══ D1 · Capacidad Digital y Datos ══ */
  {d:1, q:'¿Cómo gestionan hoy la información y los procesos de la operación?', o:[
    'En papel, Excel suelto y WhatsApp. Cada área maneja sus propios archivos.',
    'Tenemos algunas herramientas digitales, pero no conversan entre sí.',
    'Tenemos sistemas centrales (ERP, CRM) usados por la mayoría de las áreas.',
    'Ecosistema integrado: los sistemas se comunican y hay una sola fuente de verdad.']},
  {d:1, q:'¿Sobre qué base toma decisiones el equipo directivo?', o:[
    'Experiencia e intuición. No hay reportes formales.',
    'Reportes de ventas o producción que se arman manualmente cada cierto tiempo.',
    'Indicadores definidos por área y tableros que se revisan en comité.',
    'Tableros en tiempo real, con modelación de escenarios para decidir.']},
  {d:1, q:'¿Qué nivel de competencia en herramientas de datos tiene el equipo?', o:[
    'Apenas lo básico de Excel.',
    'Hay usuarios avanzados de Excel, pero nadie con herramientas de análisis.',
    'Algunas personas manejan Power BI, SQL o Python de forma autodidacta.',
    'Tenemos perfiles formados en analítica y el conocimiento está documentado.']},
  {d:1, q:'¿Qué tan automatizados están los procesos repetitivos?', o:[
    'Todo es manual y depende de que alguien lo recuerde.',
    'Automatizamos correos o alertas puntuales.',
    'Varios flujos críticos corren solos: facturación, aprobaciones, reportes.',
    'Los procesos núcleo son automáticos; el equipo atiende excepciones y mejora.']},
  {d:1, q:'¿Cómo gestionan la tecnología y los desarrollos propios?', o:[
    'Sin criterio técnico propio. Dependemos por completo de proveedores.',
    'Hay un responsable de sistemas dedicado al soporte y la operación diaria.',
    'Podemos especificar y supervisar desarrollos con metodologías ágiles.',
    'Hay arquitectura definida, roles de producto y ciclos de entrega gestionados.']},

  /* ══ D2 · Adopción de IA ══ */
  {d:2, q:'¿Cómo se usa la Inteligencia Artificial en la organización?', o:[
    'No se usa IA.',
    'Algunas personas la usan por iniciativa propia, sin ningún lineamiento.',
    'Hay usos definidos en áreas concretas, con lineamientos básicos.',
    'La IA está integrada en procesos clave y medimos su impacto.']},
  {d:2, q:'¿Qué formación en IA ha recibido el equipo?', o:[
    'Ninguna.',
    'Una charla o taller introductorio.',
    'Un grupo recibió formación aplicada a su función.',
    'Hay plan de formación en IA por perfil, con niveles y seguimiento.']},
  {d:2, q:'¿Existe política o gobierno para el uso de IA?', o:[
    'No hay nada. Cada quien usa lo que quiere, incluso con información sensible.',
    'Se ha conversado el tema, pero no hay nada escrito.',
    'Hay lineamientos de uso aceptable y de manejo de información.',
    'Hay política formal, herramientas aprobadas y responsables de cumplimiento.']},
  {d:2, q:'¿Qué postura tiene la alta dirección frente a la IA?', o:[
    'No ha tomado postura.',
    'Hay interés declarado, pero sin presupuesto ni responsable asignado.',
    'Hay un responsable y presupuesto para pilotos.',
    'La IA es parte de la estrategia corporativa, con metas y seguimiento.']},
  {d:2, q:'¿Han trabajado con agentes de IA o automatización inteligente?', o:[
    'No sabemos qué es un agente de IA.',
    'Conocemos el concepto, pero no lo hemos aplicado.',
    'Hemos probado asistentes o agentes en tareas específicas.',
    'Tenemos agentes en producción conectados a nuestros sistemas.']},

  /* ══ D3 · Gestión Comercial y Mercado ══ */
  {d:3, q:'¿Cómo funciona hoy el proceso comercial?', o:[
    'Vendemos por relaciones y referidos. No hay plan comercial.',
    'Hay metas de venta, pero no un proceso comercial documentado.',
    'Tenemos embudo, etapas definidas y seguimiento en CRM.',
    'La estrategia comercial se gestiona con datos, pronósticos y experimentación.']},
  {d:3, q:'¿Cómo manejan el marketing y la presencia digital?', o:[
    'No hacemos marketing digital.',
    'Publicamos en redes de forma esporádica, sin estrategia.',
    'Hay plan de contenidos y campañas pagas con métricas.',
    'Estrategia omnicanal integrada al proceso comercial, con atribución medida.']},
  {d:3, q:'¿Venden a través de canales digitales?', o:[
    'No vendemos por canales digitales.',
    'Recibimos pedidos por WhatsApp o redes, de forma artesanal.',
    'Tenemos tienda en línea o presencia en marketplace operando.',
    'Vendemos en varios canales digitales integrados con inventario y logística.']},
  {d:3, q:'¿Cuál es su situación frente a nuevos mercados?', o:[
    'Operamos solo en el mercado local y no hay planes de expansión.',
    'Nos interesa expandirnos, pero no sabemos por dónde empezar.',
    'Hemos hecho operaciones puntuales fuera de nuestro mercado base.',
    'Tenemos operación internacional o exportadora sostenida.']},
  {d:3, q:'¿Cómo gestionan la experiencia y la fidelización del cliente?', o:[
    'No medimos la satisfacción del cliente.',
    'Atendemos reclamos cuando llegan, sin registro sistemático.',
    'Medimos satisfacción y tenemos protocolos de servicio.',
    'Gestionamos el ciclo completo del cliente con métricas de retención y valor.']},

  /* ══ D4 · Gestión Financiera y de Proyectos ══ */
  {d:4, q:'¿Cómo es el control financiero de la organización?', o:[
    'Básico. El contador arma todo al cierre y ahí nos enteramos.',
    'Tenemos estados financieros, pero se revisan tarde y poco.',
    'Hay presupuesto anual, seguimiento mensual e indicadores financieros.',
    'Gestionamos rentabilidad por línea, escenarios y decisiones de inversión.']},
  {d:4, q:'¿Cómo manejan el flujo de caja y el capital de trabajo?', o:[
    'No proyectamos el flujo. Reaccionamos a los apuros de liquidez.',
    'Proyectamos a pocas semanas, de forma manual.',
    'Tenemos flujo proyectado a varios meses y política de cartera.',
    'Tesorería con política formal, coberturas y optimización del capital de trabajo.']},
  {d:4, q:'¿Cómo gestionan los proyectos internos?', o:[
    'De manera informal, sin metodología.',
    'Hay cronogramas, pero se incumplen con frecuencia.',
    'Usamos metodología con alcance, tiempo y costo controlados.',
    'Hay estándar corporativo de proyectos y personal certificado.']},
  {d:4, q:'¿Cómo gestionan los riesgos y el cumplimiento normativo?', o:[
    'No hay identificación formal de riesgos.',
    'Conocemos los riesgos principales, pero no están documentados.',
    'Hay matriz de riesgos con responsables y controles definidos.',
    'La gestión de riesgos está integrada a la estrategia y se audita.']},
  {d:4, q:'¿Con qué criterio evalúan inversiones y financiación?', o:[
    'No tenemos criterios formales de evaluación.',
    'Decide la gerencia o la propiedad, por criterio propio.',
    'Evaluamos proyectos con indicadores financieros (VPN, TIR, payback).',
    'Gestionamos la estructura de capital y evaluamos alternativas de inversión.']},

  /* ══ D5 · Liderazgo y Talento ══ */
  {d:5, q:'¿Cómo llegaron a su rol los jefes y mandos medios?', o:[
    'Por antigüedad o conocimiento técnico, sin formación en liderazgo.',
    'Hay buena voluntad, pero el liderazgo depende del estilo de cada persona.',
    'Los líderes recibieron formación y hay criterios comunes de gestión.',
    'Tenemos modelo de liderazgo propio, con desarrollo y evaluación continua.']},
  {d:5, q:'¿Cómo evalúan el desempeño de los colaboradores?', o:[
    'No hay evaluación estructurada.',
    'Conversaciones informales una vez al año.',
    'Proceso formal de evaluación con objetivos definidos.',
    'La evaluación alimenta planes de desarrollo individuales y decisiones de talento.']},
  {d:5, q:'¿Qué tan expuesta está la organización a la salida de personas clave?', o:[
    'Dependemos críticamente de una o dos personas.',
    'Sabemos que es un riesgo, pero no lo hemos abordado.',
    'Hay segundos al mando identificados en las áreas clave.',
    'Hay plan de sucesión con desarrollo activo de los sucesores.']},
  {d:5, q:'¿Cómo es la comunicación interna y el manejo de conversaciones difíciles?', o:[
    'La comunicación falla y genera reprocesos frecuentes.',
    'Comunicamos lo operativo, pero cuesta la conversación difícil.',
    'Hemos trabajado comunicación, presentación en público y manejo de conflicto.',
    'Comunicación e influencia son parte del perfil exigido a cada líder.']},
  {d:5, q:'¿Cómo están en atracción y retención de talento?', o:[
    'Nos cuesta conseguir y retener gente. La rotación es alta.',
    'Conseguimos gente, pero se va antes de consolidarse.',
    'Hay propuesta de valor al empleado y la rotación está bajo control.',
    'Somos referentes como empleador en nuestro sector.']},

  /* ══ D6 · Cultura de Aprendizaje e Innovación ══ */
  {d:6, q:'¿Cómo manejan el presupuesto de formación?', o:[
    'No hay presupuesto. Se aprueba caso a caso, si alcanza.',
    'Hay algo de presupuesto, pero sin plan: se compra lo que aparece.',
    'Hay plan anual de formación con presupuesto asignado.',
    'El plan se construye desde brechas medidas y se evalúa su retorno.']},
  {d:6, q:'¿Cómo deciden qué formación necesita su gente?', o:[
    'Por solicitud individual o por lo que ofrezca el proveedor de turno.',
    'La gerencia decide según lo que percibe.',
    'Se levantan necesidades por área una vez al año.',
    'Se cruzan brechas de desempeño, estrategia y evaluación para definir el plan.']},
  {d:6, q:'¿Qué pasa después de que alguien se capacita?', o:[
    'No se ve que comparta ni aplique lo aprendido.',
    'Se aplica algo, pero depende de la voluntad de cada persona.',
    'Pedimos un plan de aplicación después de cada formación.',
    'Medimos el impacto de la formación en indicadores del negocio.']},
  {d:6, q:'¿Cómo gestionan la innovación?', o:[
    'No hay espacios ni recursos para innovar.',
    'Surgen ideas, pero se pierden por falta de un proceso que las recoja.',
    'Hay mecanismos para captar y probar ideas.',
    'La innovación se gestiona con portafolio, recursos y métricas.']},
  {d:6, q:'¿Dónde vive el conocimiento de la organización?', o:[
    'En la cabeza de las personas. Si se van, se va con ellas.',
    'Hay algunos documentos, desactualizados y dispersos.',
    'Los procesos clave están documentados y accesibles.',
    'Hay gestión del conocimiento activa, con onboarding y capacitación interna.']}
];

/* ───────────── Niveles ───────────── */
const LEVELS = {
  emergente:{
    key:'emergente', label:'Organización Emergente', range:'0 – 49 puntos', color:'var(--lv-1)', hex:'#EF4444',
    desc:'Su organización opera con capacidades base por construir. Esto no es una mala noticia: significa que las primeras intervenciones formativas tendrán el mayor retorno visible. La ruta debe priorizar fundamentos y resultados rápidos que generen tracción interna.'
  },
  desarrollo:{
    key:'desarrollo', label:'Organización en Desarrollo', range:'50 – 74 puntos', color:'var(--lv-2)', hex:'#F59E0B',
    desc:'Su organización ya tiene prácticas instaladas, pero conviven con vacíos que frenan el crecimiento. La formación aquí no es de introducción: debe cerrar brechas específicas y profesionalizar lo que hoy funciona por esfuerzo individual.'
  },
  consolidada:{
    key:'consolidada', label:'Organización Consolidada', range:'75 – 100 puntos', color:'var(--lv-3)', hex:'#3FBF95',
    desc:'Su organización tiene capacidades maduras en la mayoría de las dimensiones. La formación debe orientarse a especialización, certificación y alta dirección: profundidad antes que cobertura.'
  }
};
function levelOf(score){
  return score >= 75 ? LEVELS.consolidada : score >= 50 ? LEVELS.desarrollo : LEVELS.emergente;
}

/* ───────────── Catálogo EAN Educación Continua 2026 ─────────────
   n = nombre  ·  cl = cluster  ·  d = dimensión que lo activa
   lv = 1 entrada · 2 intermedio · 3 avanzado
   p  = perfiles  ·  f = filtro especial */
const P = {OPER:'operativo', MEDIO:'medios', GER:'gerencia', C:'clevel'};

const CATALOG = [
  /* ── Studia (IA) → D2 ── */
  {n:'Bootcamp de IA Generativa: ChatGPT, Prompts Estratégicos y GPTs', cl:'Studia (IA)', d:2, lv:1, p:[P.OPER,P.MEDIO]},
  {n:'Curso Herramientas de IA para la Productividad Profesional', cl:'Studia (IA)', d:2, lv:1, p:[P.OPER,P.MEDIO]},
  {n:'Curso en Prompt Engineering y Comunicación Efectiva con IA', cl:'Studia (IA)', d:2, lv:1, p:[P.OPER,P.MEDIO]},
  {n:'Curso Profundización en Excel integrando IA', cl:'Studia (IA)', d:1, lv:1, p:[P.OPER,P.MEDIO]},
  {n:'Diplomado Profundización en Excel integrando IA', cl:'Studia (IA)', d:1, lv:2, p:[P.OPER,P.MEDIO]},
  {n:'Curso IA Aplicada a Negocios: Automatización y Estrategia', cl:'Studia (IA)', d:2, lv:2, p:[P.MEDIO,P.GER]},
  {n:'Curso Fundamentos para la Creación de Agentes IA', cl:'Studia (IA)', d:2, lv:2, p:[P.MEDIO]},
  {n:'Curso Diseño y Configuración de Agentes de IA', cl:'Studia (IA)', d:2, lv:2, p:[P.MEDIO]},
  {n:'Curso IA-Leader: Liderazgo con IA', cl:'Studia (IA)', d:2, lv:2, p:[P.GER,P.C]},
  {n:'Curso IA para Abogados', cl:'Studia (IA)', d:2, lv:2, p:[P.MEDIO,P.GER], f:'legal'},
  {n:'Ruta IA en Salud (Gestión Estratégica / Decisiones Clínicas)', cl:'Studia (IA)', d:2, lv:2, p:[P.MEDIO,P.GER], f:'salud'},
  {n:'Curso Automatización Inteligente con Agéntica IA', cl:'Studia (IA)', d:2, lv:3, p:[P.MEDIO,P.GER]},
  {n:'Curso Arquitecturas Avanzadas de IA Agéntica', cl:'Studia (IA)', d:2, lv:3, p:[P.MEDIO]},
  {n:'Diplomado Ciencia de Datos IA', cl:'Studia (IA)', d:1, lv:3, p:[P.MEDIO]},
  {n:'Diplomado Inteligencia Artificial para la Alta Dirección', cl:'Studia (IA)', d:2, lv:3, p:[P.GER,P.C]},

  /* ── IA y Tecnología → D1 ── */
  {n:'Curso SQL para análisis de datos', cl:'IA y Tecnología', d:1, lv:1, p:[P.OPER,P.MEDIO]},
  {n:'Curso en Python', cl:'IA y Tecnología', d:1, lv:2, p:[P.OPER,P.MEDIO]},
  {n:'Diplomado Inteligencia de Negocios con Power BI: De los Datos a las Decisiones', cl:'IA y Tecnología', d:1, lv:2, p:[P.MEDIO,P.GER]},
  {n:'Curso de Scrum Master', cl:'IA y Tecnología', d:1, lv:2, p:[P.MEDIO]},
  {n:'Curso Product Owner', cl:'IA y Tecnología', d:1, lv:2, p:[P.MEDIO,P.GER]},
  {n:'Diplomado en Arquitectura de Software', cl:'IA y Tecnología', d:1, lv:3, p:[P.MEDIO]},

  /* ── Negocios y marketing → D3 ── */
  {n:'Curso Social Selling Pro – Tu Tienda en Redes', cl:'Negocios y marketing', d:3, lv:1, p:[P.OPER,P.MEDIO]},
  {n:'Curso Storytelling: técnica de persuasión académica y profesional', cl:'Negocios y marketing', d:3, lv:1, p:[P.OPER,P.MEDIO]},
  {n:'Curso Conquistador digital: cómo facturar en Amazon desde Colombia', cl:'Negocios y marketing', d:3, lv:2, p:[P.MEDIO,P.GER]},
  {n:'Curso Las Franquicias: un Modelo de Negocio Empresarial Exitoso', cl:'Negocios y marketing', d:3, lv:2, p:[P.GER,P.C]},
  {n:'Diplomado Influencia y creadores de contenido', cl:'Negocios y marketing', d:3, lv:2, p:[P.OPER,P.MEDIO]},
  {n:'Diplomado Especializado en E-Commerce y Marketing Digital', cl:'Negocios y marketing', d:3, lv:2, p:[P.MEDIO,P.GER]},
  {n:'Diplomado en Comunicación y Marketing Político', cl:'Negocios y marketing', d:3, lv:2, p:[P.MEDIO,P.GER], f:'publico'},
  {n:'Diplomado Gerencia comercial estratégica', cl:'Negocios y marketing', d:3, lv:3, p:[P.GER,P.C]},
  {n:'Diplomado Avanzado en Marketing Estratégico y Transformación Digital', cl:'Negocios y marketing', d:3, lv:3, p:[P.GER,P.C]},
  {n:'Diplomado en Importaciones, Exportaciones y Logística Internacional', cl:'Negocios y marketing', d:3, lv:2, p:[P.MEDIO,P.GER], f:'inter'},
  {n:'Diplomado en Gestión de Riesgos y Seguridad en la Cadena de Suministros', cl:'Negocios y marketing', d:4, lv:3, p:[P.MEDIO,P.GER], f:'inter'},
  {n:'Diplomado Internacional en Administración Marítima y Gestión Portuaria', cl:'Negocios y marketing', d:3, lv:3, p:[P.MEDIO,P.GER], f:'inter'},

  /* ── Emprendimiento → D3 ── */
  {n:'Curso E-Commerce Express: Dropshipping y Última Milla', cl:'Emprendimiento', d:3, lv:1, p:[P.OPER,P.MEDIO]},
  {n:'Curso Sublimación Digital: Personalización para Emprendimientos', cl:'Emprendimiento', d:3, lv:1, p:[P.OPER]},
  {n:'Curso Corte Láser para Diseño y Prototipado Rápido', cl:'Emprendimiento', d:6, lv:1, p:[P.OPER]},
  {n:'Diplomado Culture Lab', cl:'Emprendimiento', d:6, lv:2, p:[P.MEDIO,P.GER]},
  {n:'Diplomado Eventpro 360', cl:'Emprendimiento', d:3, lv:2, p:[P.OPER,P.MEDIO]},
  {n:'Curso Especializado de Formación en Consultoría Empresarial', cl:'Emprendimiento', d:6, lv:3, p:[P.GER,P.C]},

  /* ── Finanzas y organizaciones → D4 ── */
  {n:'Diplomado en Finanzas Empresariales para No Financieros', cl:'Finanzas y organizaciones', d:4, lv:1, p:[P.MEDIO,P.GER]},
  {n:'Curso Administración de Capital de Trabajo', cl:'Finanzas y organizaciones', d:4, lv:1, p:[P.MEDIO,P.GER]},
  {n:'Curso Gestión de Tesorería', cl:'Finanzas y organizaciones', d:4, lv:2, p:[P.MEDIO,P.GER]},
  {n:'Curso Legislación Financiera y Tributaria', cl:'Finanzas y organizaciones', d:4, lv:2, p:[P.MEDIO,P.GER]},
  {n:'Curso Estandarización en Gerencia de Proyectos', cl:'Finanzas y organizaciones', d:4, lv:1, p:[P.MEDIO]},
  {n:'Curso Preparación Certificación CAPM® - PMP®', cl:'Finanzas y organizaciones', d:4, lv:3, p:[P.MEDIO,P.GER]},
  {n:'Diplomado en Gerencia Estratégica de Proyectos', cl:'Finanzas y organizaciones', d:4, lv:2, p:[P.MEDIO,P.GER]},
  {n:'Diplomado Gestión de Riesgos Financieros (Sarl-Sarc-Sarm) y No Financieros (Sarlaft-Saro)', cl:'Finanzas y organizaciones', d:4, lv:3, p:[P.MEDIO,P.GER]},
  {n:'Curso Especializado en Valoración de Empresas y Startups', cl:'Finanzas y organizaciones', d:4, lv:3, p:[P.GER,P.C]},
  {n:'Diplomado Trading e Inversiones con Certificación BMC', cl:'Finanzas y organizaciones', d:4, lv:3, p:[P.MEDIO,P.GER]},
  {n:'Curso Credencial: Analista Junior de Fondos de Inversión', cl:'Finanzas y organizaciones', d:4, lv:3, p:[P.MEDIO]},
  {n:'Diplomado Especializado en Contratación Estatal', cl:'Finanzas y organizaciones', d:4, lv:2, p:[P.MEDIO,P.GER], f:'publico'},
  {n:'Diplomado en Gestión de Organizaciones del Sector Aeronáutico', cl:'Finanzas y organizaciones', d:4, lv:3, p:[P.GER,P.C], f:'aero'},
  {n:'Diplomado Programa de Grado en Innovación Organizacional', cl:'Finanzas y organizaciones', d:6, lv:3, p:[P.GER,P.C]},

  /* ── Liderazgo → D5 ── */
  {n:'Curso Agile-Leader', cl:'Liderazgo', d:5, lv:1, p:[P.MEDIO]},
  {n:'Curso Leading Change', cl:'Liderazgo', d:5, lv:2, p:[P.MEDIO,P.GER]},
  {n:'Curso High Performance Leader', cl:'Liderazgo', d:5, lv:2, p:[P.MEDIO,P.GER]},
  {n:'Curso Neuro-Leader', cl:'Liderazgo', d:5, lv:2, p:[P.MEDIO,P.GER]},
  {n:'Curso Data-Leader: Liderazgo con Analítica de Datos', cl:'Liderazgo', d:1, lv:2, p:[P.GER,P.C]},

  /* ── Habilidades humanas → D5 ── */
  {n:'Curso en Imagen Profesional Estratégica', cl:'Habilidades humanas', d:5, lv:1, p:[P.OPER,P.MEDIO]},
  {n:'Curso Redacción y Ortografía: Técnicas y Habilidades de Expresión Escrita', cl:'Habilidades humanas', d:5, lv:1, p:[P.OPER,P.MEDIO]},
  {n:'Taller Comunica de Alto Impacto', cl:'Habilidades humanas', d:5, lv:1, p:[P.MEDIO,P.GER]},
  {n:'Diplomado Actuación: de Shakespeare a la actualidad', cl:'Habilidades humanas', d:5, lv:1, p:[P.OPER,P.MEDIO]},
  {n:'Diplomado en Desarrollo del Potencial Humano con PNL', cl:'Habilidades humanas', d:5, lv:2, p:[P.MEDIO,P.GER]},
  {n:'Curso Gestión y Evaluación del Talento Humano', cl:'Habilidades humanas', d:6, lv:2, p:[P.MEDIO,P.GER]},
  {n:'Diplomado de Mujeres Líderes en la Era de la Inteligencia Artificial', cl:'Habilidades humanas', d:5, lv:2, p:[P.MEDIO,P.GER,P.C]},

  /* ── C-level profundo → D5 ── */
  {n:'Curso Pensamiento Estratégico y Gerencia Global', cl:'C-level profundo', d:5, lv:3, p:[P.C]},
  {n:'Diplomado Especializado en Coaching y Liderazgo Ejecutivo', cl:'C-level profundo', d:5, lv:3, p:[P.GER,P.C]},
  {n:'Gestión Ejecutiva de la Industria Farmacéutica', cl:'C-level profundo', d:5, lv:3, p:[P.C], f:'salud'},

  /* ── Economía silver → filtro demográfico ── */
  {n:'Curso Tecnología Fácil para la Vida: Autonomía Digital para Adultos Mayores', cl:'Economía silver', d:1, lv:1, p:[P.OPER], f:'silver'},
  {n:'Curso Finanzas Personales y Banca Digital para una Vida Activa', cl:'Economía silver', d:4, lv:1, p:[P.OPER], f:'silver'},
  {n:'Diplomado Economía Plateada 50+', cl:'Economía silver', d:6, lv:2, p:[P.MEDIO,P.GER], f:'silver'},
  {n:'Proyecto de Vida 50+', cl:'Economía silver', d:6, lv:1, p:[P.OPER,P.MEDIO], f:'silver'},
  {n:'Consultor Experto 50+', cl:'Economía silver', d:6, lv:2, p:[P.GER,P.C], f:'silver'},
  {n:'Emprendedor 50+', cl:'Economía silver', d:6, lv:2, p:[P.OPER,P.MEDIO], f:'silver'},

  /* ── Escuela de idiomas → filtro internacional ── */
  {n:'Curso Inglés Profesional para Ejecutivos y Emprendedores', cl:'Escuela de idiomas', d:3, lv:1, p:[P.MEDIO,P.GER,P.C], f:'inter'},
  {n:'Curso Chino para los Negocios Internacionales (Nivel 1)', cl:'Escuela de idiomas', d:3, lv:1, p:[P.MEDIO,P.GER], f:'inter'},
  {n:'Curso Portugués Cultural y Empresarial', cl:'Escuela de idiomas', d:3, lv:1, p:[P.MEDIO,P.GER], f:'inter'},
  {n:'Curso Francés: Élémentaire (A1–A2)', cl:'Escuela de idiomas', d:3, lv:1, p:[P.MEDIO,P.GER], f:'inter'},
  {n:'Curso Italiano Nivel Básico', cl:'Escuela de idiomas', d:3, lv:1, p:[P.MEDIO,P.GER], f:'inter'}
];

/* Sectores que activan programas con filtro sectorial */
const SECTOR_F = {
  'Salud':'salud',
  'Sector público':'publico',
  'Financiero y asegurador':'legal',
  'Logística y comercio exterior':'inter'
};

/* Color por cluster, para las etiquetas del informe */
const CLUSTER_HEX = {
  'Studia (IA)':'#7B2FFF', 'IA y Tecnología':'#0EA5E9',
  'Negocios y marketing':'#F59E0B', 'Emprendimiento':'#F97316',
  'Finanzas y organizaciones':'#10B981', 'Liderazgo':'#EC4899',
  'Habilidades humanas':'#DB2777', 'C-level profundo':'#0E2E3D',
  'Economía silver':'#8B5CF6', 'Escuela de idiomas':'#14B8A6'
};
