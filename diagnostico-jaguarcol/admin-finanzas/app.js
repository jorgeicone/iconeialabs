/* ═══════════════════════════════════════════════════════════════
   Diagnóstico de entrada · Bootcamp IA en Acción
   ADMINISTRATIVO Y FINANZAS — JaguarCol
   Motor ICONE Dx. — © 2026 Ing. Jorge Hugo Pérez Gaona
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ───────────── Protección de datos personales ─────────────
   Ley 1581 de 2012, Decreto 1074 de 2015 y Sentencia C-748 de 2011.

   Aquí responden colaboradores de una empresa cliente sobre su propio
   trabajo, con texto libre donde pueden nombrar problemas del área. Es
   dato personal en contexto laboral: merece el mismo cuidado que un
   lead, o más.

   PENDIENTE ANTES DE SALIR A PRODUCCIÓN: confirmar con JaguarCol quién
   figura como responsable —ellos como empleador, o la Universidad EAN
   como titular del programa— y con qué NIT y correo oficial. Mientras
   tanto el canal habilitado es el del encargado: válido, provisional.
   Al cambiar el aviso, suba POLITICA_VERSION. */
const POLITICA_VERSION = '1.0-2026-08';

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

const CLIENTE = { nombre: 'JaguarCol', programa: 'Bootcamp IA en Acción' };

/* ───────────── Supabase ─────────────
   Tabla propia: los datos de los colaboradores no se mezclan con los
   leads B2B del Mapa de Capacidades ni con las evaluaciones de curso.
   anon solo puede INSERT; la lectura está atada al usuario admin. */
const SB_URL = 'https://nvgkhdrrxqdgxktfkioa.supabase.co';
const SB_KEY = 'sb_publishable_d1RrtE7S-9a8e8mGKRRjxQ_4HU_nkDl';
const TABLE  = 'jaguarcol_diagnosticos';
let sb = null;
function getSB(){
  if(!sb && window.supabase) sb = window.supabase.createClient(SB_URL, SB_KEY);
  return sb;
}

/* ───────────── Área ───────────── */
const AREA = {
  "id": "admin-finanzas",
  "nombre": "Administrativo y Finanzas",
  "tag": "ADMINISTRATIVO Y FINANZAS",
  "subareas": [
    "Compras",
    "Contabilidad",
    "Contraloría",
    "SIG",
    "Tesorería",
    "Recursos Humanos",
    "Cartera",
    "Otra"
  ],
  "participantes": 51
};

/* ───────────── Dimensiones ─────────────
   Los seis ejes son los cinco módulos del bootcamp: el módulo 1 se parte
   en dos porque mezcla fundamentos con manejo de información, y son
   brechas distintas. Así el radar no dice quién sabe más: dice a qué
   módulo darle más aire en esta área. */
const DIMS = [
 {
  "id": 1,
  "name": "Fundamentos y Uso de IA",
  "short": "Fundamentos",
  "ico": "◧",
  "color": "var(--d1)",
  "hex": "#0EA5E9",
  "img": "img/d1.jpg",
  "mod": 1
 },
 {
  "id": 2,
  "name": "Información y Verificación",
  "short": "Información",
  "ico": "◆",
  "color": "var(--d2)",
  "hex": "#7B2FFF",
  "img": "img/d2.jpg",
  "mod": 1
 },
 {
  "id": 3,
  "name": "Prompts y Documentos",
  "short": "Prompts",
  "ico": "◈",
  "color": "var(--d3)",
  "hex": "#F59E0B",
  "img": "img/d3.jpg",
  "mod": 2
 },
 {
  "id": 4,
  "name": "Automatización del Trabajo",
  "short": "Automatización",
  "ico": "◉",
  "color": "var(--d4)",
  "hex": "#10B981",
  "img": "img/d4.jpg",
  "mod": 3
 },
 {
  "id": 5,
  "name": "Asistentes y Agentes",
  "short": "Asistentes",
  "ico": "◐",
  "color": "var(--d5)",
  "hex": "#EC4899",
  "img": "img/d5.jpg",
  "mod": 4
 },
 {
  "id": 6,
  "name": "Datos y Uso Responsable",
  "short": "Responsabilidad",
  "ico": "◍",
  "color": "var(--d6)",
  "hex": "#FF8C00",
  "img": "img/d6.jpg",
  "mod": 5
 }
];

/* Lectura de cada dimensión según la banda alcanzada */
const DIM_READ = {
 "1": [
  "La IA todavía no entra en su día de trabajo. Es el punto de partida del bootcamp, y donde el módulo 1 rinde más rápido.",
  "Ha probado herramientas de forma suelta, sin saber cuál sirve para qué. Lo que falta es criterio de selección, no curiosidad.",
  "Usa IA con regularidad y distingue entre herramientas. El paso siguiente es elegir a propósito y no por costumbre.",
  "Maneja las herramientas con criterio. En el módulo 1 su papel es ayudar a que el resto del área arranque."
 ],
 "2": [
  "Busca y resume a mano. Es justo donde primero se gana tiempo: entender un documento largo en minutos, no en una tarde.",
  "Le pregunta a la IA, pero acepta lo que le entrega sin contrastar. Ahí está el riesgo más caro de todo el bootcamp.",
  "Busca con IA y verifica cuando algo le suena raro. Falta convertir la verificación en rutina y no en corazonada.",
  "Busca con fuentes y contrasta siempre. Puede pasar a organizar la información del área, no solo a consumirla."
 ],
 "3": [
  "Le pide a la IA como si fuera un buscador, o no le pide nada. El módulo 2 le cambia el rendimiento de inmediato.",
  "Escribe instrucciones cortas y se conforma con lo que salga. Con estructura, el mismo esfuerzo rinde el doble.",
  "Sabe dar contexto e iterar hasta que sirve. Falta guardar lo que funciona para no empezar de cero cada vez.",
  "Escribe instrucciones estructuradas y reutilizables. Puede liderar la biblioteca de prompts del área."
 ],
 "4": [
  "Lo repetitivo se hace a mano y nadie ha medido cuánto cuesta. Es la dimensión con más tiempo por recuperar.",
  "Reconoce que hay tareas que se repiten, pero no las ha listado ni medido. Sin eso no hay nada que automatizar.",
  "Tiene identificado lo que se repite y ya optimizó algo. El paso siguiente es el flujo que corre sin usted.",
  "Ya rediseña procesos y automatiza. En el módulo 3 su caso sirve de ejemplo para el resto del área."
 ],
 "5": [
  "Chatbot, asistente y agente son lo mismo para usted. El módulo 4 abre la puerta a delegar, no solo a consultar.",
  "Sabe que los asistentes existen, pero no ha creado ninguno. El conocimiento del área sigue disperso.",
  "Ha probado asistentes y usa plantillas. Falta cargarles el conocimiento real del área para que sirvan de verdad.",
  "Ya opera con asistentes propios. El paso siguiente son agentes que ejecuten, no solo que respondan."
 ],
 "6": [
  "No hay claridad sobre qué información puede salir del área. Es el riesgo que puede frenar todo lo demás.",
  "Intuye que hay información delicada, pero no tiene el límite claro ni conoce la política. Riesgo de fuga.",
  "Cuida los datos y revisa lo que firma. Falta método para detectar los errores de la IA antes de que salgan.",
  "Trabaja con criterio de riesgo y verificación humana. Puede ayudar a fijar las reglas del área."
 ]
};

/* ───────────── Banco de preguntas · 6 × 5 = 30 ─────────────
   Escala conductual 0–3. Cada opción describe una conducta observable
   —qué hace hoy— y no un grado de acuerdo. */
const QS = [
 {
  "d": 1,
  "q": "¿Con qué frecuencia usas hoy una herramienta de IA (ChatGPT, Copilot, Gemini, Claude, Perplexity) para algo de tu trabajo?",
  "o": [
   "Nunca la he abierto para temas del trabajo",
   "La he probado una o dos veces, por curiosidad",
   "La uso de vez en cuando, cuando me acuerdo",
   "La uso casi todos los días"
  ]
 },
 {
  "d": 1,
  "q": "Si un compañero te pregunta qué es y qué NO puede hacer una IA como ChatGPT, ¿qué tan claro se lo explicarías?",
  "o": [
   "No sabría por dónde empezar",
   "Tengo una idea vaga de lo que hace",
   "Le explicaría lo básico sin problema",
   "Le explicaría qué hace bien, en qué falla y por qué falla"
  ]
 },
 {
  "d": 1,
  "q": "Entre ChatGPT, Copilot, Gemini, Claude y Perplexity, ¿sabes cuál te sirve para cada tipo de tarea?",
  "o": [
   "No conozco las diferencias",
   "Solo conozco una y es la que uso",
   "Conozco dos o tres, pero elijo por costumbre",
   "Elijo a propósito según lo que necesito hacer"
  ]
 },
 {
  "d": 1,
  "q": "¿Tienes identificadas tareas concretas de tu cargo donde la IA te ahorraría tiempo?",
  "o": [
   "No lo había pensado",
   "Intuyo que sí, pero no sabría cuáles",
   "Tengo una o dos en mente",
   "Tengo una lista clara y ya empecé por alguna"
  ]
 },
 {
  "d": 1,
  "q": "De lo que sabes hoy de IA, ¿cuánto lo aprendiste aplicándolo a tu propio trabajo y no solo viendo videos o noticias?",
  "o": [
   "Solo he visto y oído cosas por ahí",
   "He probado algo suelto, sin relación con mi cargo",
   "Probé alguna tarea real de mi puesto una vez",
   "Lo que sé lo aprendí resolviendo tareas de mi puesto"
  ]
 },
 {
  "d": 2,
  "q": "Cuando necesitas entender una norma, un concepto tributario o un procedimiento del SIG, ¿cómo lo resuelves hoy?",
  "o": [
   "Le pregunto a un compañero o busco en Google y leo lo que salga",
   "Busco en Google y de vez en cuando le pregunto a una IA",
   "Le pregunto a la IA para orientarme y después confirmo",
   "Uso IA con búsqueda de fuentes y contrasto contra el documento oficial"
  ]
 },
 {
  "d": 2,
  "q": "¿Usas IA para resumir documentos largos: contratos, pliegos, estados financieros, informes de auditoría, políticas?",
  "o": [
   "Nunca, los leo completos o los hojeo",
   "Lo he intentado una vez",
   "Lo hago a veces, cuando el documento es muy largo",
   "Es parte de cómo abordo cualquier documento largo"
  ]
 },
 {
  "d": 2,
  "q": "Cuando una IA te entrega un dato —una cifra, el artículo de una norma, una fecha— ¿qué haces antes de usarlo?",
  "o": [
   "Lo uso tal como viene",
   "Le doy una leída rápida por encima",
   "Lo verifico cuando algo me suena raro",
   "Siempre lo contrasto con la fuente antes de que salga de mis manos"
  ]
 },
 {
  "d": 2,
  "q": "La información que necesitas para trabajar —saldos, proveedores, indicadores, novedades de personal— hoy está…",
  "o": [
   "Dispersa: cada quien la tiene en su carpeta o su correo",
   "En archivos que yo mismo armo a mano cada vez",
   "Organizada, pero la consolido manualmente",
   "Organizada y la consolido con ayuda de herramientas"
  ]
 },
 {
  "d": 2,
  "q": "¿Usas IA para preparar resúmenes ejecutivos o presentaciones de cifras para tu jefe o para un comité?",
  "o": [
   "Nunca, los armo yo desde cero",
   "Lo probé alguna vez",
   "A veces, para tener un primer borrador",
   "Sí, y ya tengo una forma definida de pedirlo"
  ]
 },
 {
  "d": 3,
  "q": "Cuando le pides algo a una IA, ¿cuánto detalle le das?",
  "o": [
   "No la uso",
   "Le escribo la pregunta corta, como si fuera Google",
   "Le agrego contexto cuando la primera respuesta no me sirve",
   "Le doy rol, contexto, objetivo, restricciones y formato desde el inicio"
  ]
 },
 {
  "d": 3,
  "q": "Si la respuesta que te da no sirve, ¿qué haces?",
  "o": [
   "No la uso",
   "Me rindo y termino haciéndolo a mano",
   "Vuelvo a preguntar, a ver si sale mejor",
   "Corrijo la instrucción por partes hasta que queda como la necesito"
  ]
 },
 {
  "d": 3,
  "q": "¿Tienes instrucciones guardadas que reutilizas en vez de escribirlas de nuevo cada vez?",
  "o": [
   "No, cada vez escribo desde cero",
   "He copiado alguna que me pasó un compañero",
   "Guardo algunas sueltas en notas o en un chat",
   "Tengo mi propio set de instrucciones para las tareas del cargo"
  ]
 },
 {
  "d": 3,
  "q": "¿Usas IA para redactar los textos de tu cargo: correos a proveedores, actas de comité, memorandos, cartas de cobro, respuestas a requerimientos?",
  "o": [
   "Nunca, todo lo escribo yo",
   "Lo probé una vez",
   "A veces, para arrancar el borrador",
   "Sí, es mi punto de partida habitual y luego lo ajusto"
  ]
 },
 {
  "d": 3,
  "q": "¿Usas IA para construir tablas, cronogramas, matrices de comparación de proveedores o el contenido de una presentación?",
  "o": [
   "Nunca, eso lo armo a mano en Excel o PowerPoint",
   "Lo intenté alguna vez",
   "A veces, cuando la estructura es sencilla",
   "Sí, con frecuencia; me ahorra la parte de armar la estructura"
  ]
 },
 {
  "d": 4,
  "q": "¿Tienes claras cuáles tareas tuyas se repiten igual cada mes (cierre, conciliación, informe de cartera, nómina)?",
  "o": [
   "Nunca me he puesto a listarlas",
   "Las tengo en la cabeza, no escritas",
   "Las tengo listadas en alguna parte",
   "Listadas, y sé cuánto tiempo me consume cada una"
  ]
 },
 {
  "d": 4,
  "q": "¿Sabes cuántas horas al mes te consume tu tarea más repetitiva?",
  "o": [
   "Ni idea, nunca lo he pensado",
   "Sé que es mucho, pero no lo he medido",
   "Tengo un estimado aproximado",
   "Lo tengo medido y podría decirte el número"
  ]
 },
 {
  "d": 4,
  "q": "¿Alguna vez has rediseñado un proceso tuyo para que tome menos pasos?",
  "o": [
   "No, lo hago como me lo enseñaron",
   "He pensado que se podría, pero no lo he hecho",
   "Sí, le he quitado pasos a alguna tarea",
   "Sí, y lo dejé documentado para que otro lo pueda hacer igual"
  ]
 },
 {
  "d": 4,
  "q": "¿Usas IA para armar los informes que entregas cada mes?",
  "o": [
   "No, los armo completamente a mano",
   "Lo probé una vez",
   "Para algunas partes: el texto, las conclusiones",
   "Sí, tengo una forma ya montada de producirlos"
  ]
 },
 {
  "d": 4,
  "q": "¿Conoces o has usado herramientas No-Code de automatización (Power Automate, Zapier, Make, n8n) para conectar dos cosas que hoy haces a mano?",
  "o": [
   "No sé qué son",
   "He oído nombrarlas",
   "He visto una demostración o probé algo",
   "He armado al menos un flujo que hoy funciona"
  ]
 },
 {
  "d": 5,
  "q": "¿Podrías explicar la diferencia entre un chatbot, un asistente personalizado, una automatización y un agente de IA?",
  "o": [
   "No, para mí es todo lo mismo",
   "Sé que no son lo mismo, pero no sabría explicarlo",
   "Podría explicar dos de los cuatro",
   "Sí, y sé cuál conviene según el caso"
  ]
 },
 {
  "d": 5,
  "q": "¿Has creado alguna vez un asistente con instrucciones propias (un GPT personalizado, un proyecto en Claude, un agente en Copilot)?",
  "o": [
   "No sabía que se podía",
   "Sé que se puede, pero no lo he hecho",
   "Lo intenté una vez",
   "Sí, tengo al menos uno que uso"
  ]
 },
 {
  "d": 5,
  "q": "El conocimiento de tu área —políticas, procedimientos, formatos, respuestas frecuentes— hoy está…",
  "o": [
   "En la cabeza de cada quien",
   "En archivos que cada uno guarda por su lado",
   "Documentado en una carpeta compartida",
   "Documentado, ordenado y listo para alimentar un asistente"
  ]
 },
 {
  "d": 5,
  "q": "¿Usas plantillas para lo que se repite (órdenes de compra, actas, cartas de cobro, respuestas a proveedores)?",
  "o": [
   "Cada vez lo escribo desde cero",
   "Copio y pego del último que hice",
   "Tengo plantillas fijas que lleno a mano",
   "Tengo plantillas y la IA me las llena con los datos del caso"
  ]
 },
 {
  "d": 5,
  "q": "¿Se te ocurren tareas de tu área que un agente de IA podría hacer de principio a fin (revisar facturas, cruzar saldos, hacer seguimiento a cartera)?",
  "o": [
   "No me imagino cómo sería",
   "Suena posible, pero no sabría cuál",
   "Tengo una idea concreta en mente",
   "Tengo varias y sé por cuál empezaría"
  ]
 },
 {
  "d": 6,
  "q": "¿Tienes claro qué información de tu área NO debería salir hacia una herramienta externa (nómina, cédulas, estados financieros sin publicar, precios de proveedores)?",
  "o": [
   "No me lo había planteado",
   "Sé que hay cosas delicadas, pero no tengo claro el límite",
   "Tengo una idea razonable de qué no se puede",
   "Lo tengo claro y actúo en consecuencia"
  ]
 },
 {
  "d": 6,
  "q": "¿Sabes si la compañía tiene una política sobre el uso de herramientas de IA?",
  "o": [
   "No sé si existe",
   "He oído que hay algo, pero no sé qué dice",
   "Sé que existe, pero no la he leído",
   "La conozco y la aplico"
  ]
 },
 {
  "d": 6,
  "q": "Cuando un texto hecho con ayuda de IA sale con tu nombre, ¿cuánto lo revisas?",
  "o": [
   "No he estado en esa situación",
   "Le doy una leída rápida y lo mando",
   "Lo reviso, sobre todo las cifras",
   "Lo reviso completo: respondo yo por lo que firmo"
  ]
 },
 {
  "d": 6,
  "q": "¿Sabes reconocer cuándo una IA se inventó un dato?",
  "o": [
   "No sabría distinguirlo",
   "Solo si es algo muy evidente",
   "Sospecho cuando algo no me cuadra",
   "Sé en qué suele fallar y verifico justo esos puntos"
  ]
 },
 {
  "d": 6,
  "q": "Cuando manejas datos personales de terceros —empleados, candidatos, proveedores— ¿qué cuidado tienes al usar una herramienta de IA?",
  "o": [
   "No lo había pensado",
   "Lo pienso, pero no sé bien qué debería hacer",
   "Evito pegar lo más obvio, como cédulas o salarios",
   "Los quito o los reemplazo por regla, siempre"
  ]
 }
];

/* ───────────── Bloque de contexto · no puntúa ─────────────
   Es lo que convierte el informe en algo accionable: qué se repite,
   qué frena y qué espera cada quien. */
const CTX = {
 "tareas": [
  "Conciliaciones bancarias y cruces de saldos",
  "Cierre contable mensual",
  "Elaboración y seguimiento de órdenes de compra",
  "Cotizaciones y comparativos de proveedores",
  "Gestión de cartera y cartas de cobro",
  "Liquidación de nómina y novedades",
  "Selección: filtrar hojas de vida y programar entrevistas",
  "Actas de comité, memorandos y comunicaciones internas",
  "Informes e indicadores para la gerencia",
  "Documentación de procedimientos y hallazgos del SIG",
  "Respuestas a requerimientos de auditoría o entes externos",
  "Digitación y archivo de soportes"
 ],
 "frenos": [
  "No sé por dónde empezar",
  "No tengo tiempo de ponerme a aprender algo nuevo",
  "No tengo una herramienta habilitada o pagada",
  "Me da miedo equivocarme o entregar algo mal",
  "Manejo información confidencial y prefiero no arriesgar",
  "Siento que a mi trabajo no le aplica",
  "Nadie en mi área lo está usando",
  "Lo intenté y los resultados no me sirvieron"
 ],
 "modulos": [
  "Fundamentos, búsqueda inteligente y verificación",
  "Prompts, correos, actas y documentos",
  "Tareas repetitivas y automatización",
  "Asistentes personalizados y agentes de IA",
  "Proyecto aplicado, ética y protección de datos"
 ],
 "abiertas": [
  {
   "id": "x4",
   "q": "Si pudieras quitarte una sola tarea de encima con ayuda de IA, ¿cuál sería?",
   "ph": "Sé lo más concreto posible: qué tarea, cada cuánto la haces y cuánto tiempo te toma."
  },
  {
   "id": "x5",
   "q": "¿Qué necesitas llevarte de este bootcamp para que haya valido la pena?",
   "ph": "Puede ser una habilidad, una herramienta lista, o un problema puntual resuelto."
  }
 ]
};

/* ───────────── Módulos del bootcamp ───────────── */
const MODULOS = [
 {
  "n": 1,
  "t": "IA Generativa para la Productividad Organizacional",
  "h": 4,
  "dims": [
   1,
   2
  ],
  "e": "Criterio para elegir herramienta, búsqueda con verificación de fuentes y resúmenes ejecutivos de los documentos del área."
 },
 {
  "n": 2,
  "t": "Ingeniería de Prompts, Comunicación y Gestión Documental",
  "h": 4,
  "dims": [
   3
  ],
  "e": "Prompts reutilizables del cargo, y correos, actas y documentos producidos con método en vez de a pulso."
 },
 {
  "n": 3,
  "t": "Productividad, Optimización y Automatización de Tareas",
  "h": 4,
  "dims": [
   4
  ],
  "e": "El mapa de sus tareas repetitivas, con tiempos medidos, y un primer flujo No-Code funcionando."
 },
 {
  "n": 4,
  "t": "Asistentes Personalizados y Agentes de IA",
  "h": 4,
  "dims": [
   5
  ],
  "e": "Un asistente propio, cargado con el conocimiento del área y probado sobre casos reales."
 },
 {
  "n": 5,
  "t": "Proyecto Aplicado, Ética y Protección de Datos",
  "h": 4,
  "dims": [
   6
  ],
  "e": "Un caso real del puesto resuelto de punta a punta, con reglas claras de qué información no sale del área."
 }
];

/* Qué hace esta persona, en concreto, si la dimensión sale baja */
const ACCIONES = {
 "1": "Tome una tarea del cierre mensual y resuélvala con IA de punta a punta, para ver con las manos dónde ayuda y dónde estorba.",
 "2": "Tome el último concepto tributario o procedimiento del SIG que le costó entender y resúmalo con fuentes contrastadas.",
 "3": "Escriba el prompt de la carta de cobro y el del acta de comité, y guárdelos para no volver a redactarlos desde cero.",
 "4": "Cronometre una semana la conciliación o el informe de cartera, y rediséñelo para que tome la mitad de los pasos.",
 "5": "Monte un asistente con las políticas de compras y las respuestas frecuentes a proveedores ya cargadas.",
 "6": "Escriba en una hoja qué datos de nómina y qué estados financieros no salen del área, y déjela pegada al puesto."
};

/* ───────────── Niveles ───────────── */
const LEVELS = [
 {
  "key": "cero",
  "label": "Punto Cero",
  "range": "0 – 24 puntos",
  "hex": "#D6453B",
  "desc": "La IA todavía no hace parte de su día. Eso no es una mala noticia: es exactamente el punto de partida para el que se diseñó este bootcamp. No se necesita nada previo, y va a salir con al menos una tarea de su puesto resuelta de otra manera.",
  "min": 0
 },
 {
  "key": "explorador",
  "label": "Explorador",
  "range": "25 – 49 puntos",
  "hex": "#D98A22",
  "desc": "Ya probó, pero de forma suelta: cuando se acuerda o cuando alguien le muestra algo. Lo que falta es método, no curiosidad. Su salto grande está en convertir esos intentos en una rutina, con instrucciones que se reutilicen.",
  "min": 25
 },
 {
  "key": "aplicado",
  "label": "Aplicado",
  "range": "50 – 74 puntos",
  "hex": "#3E8A73",
  "desc": "Ya usa IA en tareas reales del cargo y sabe pedirle las cosas. Lo que sigue no es aprender más herramientas: es dejar de hacer una por una las cosas que se repiten. Ahí entran los asistentes propios y los flujos que corren solos.",
  "min": 50
 },
 {
  "key": "multiplicador",
  "label": "Multiplicador",
  "range": "75 – 100 puntos",
  "hex": "#285359",
  "desc": "Trabaja con método y la IA ya le devuelve tiempo. Su papel en el bootcamp es doble: profundizar en agentes y automatización, y ayudar a que el área entera se mueva. Es de las personas que hacen que esto no se quede en el curso.",
  "min": 75
 }
];
function levelOf(score){
  for(let i = LEVELS.length - 1; i >= 0; i--) if(score >= LEVELS[i].min) return LEVELS[i];
  return LEVELS[0];
}
