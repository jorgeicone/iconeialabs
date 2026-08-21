# Diagnóstico de entrada · Bootcamp IA en Acción · JaguarCol

Tres diagnósticos, uno por área, que se responden **antes** de la primera sesión
del bootcamp. Miden desde dónde arranca cada persona frente a lo que se le va a
enseñar, y devuelven un informe individual con radar, brechas y ruta.

| Área | Carpeta | Participantes |
|---|---|---|
| Administrativo y Finanzas | `admin-finanzas/` | 51 |
| Marketing · Desarrollo · Comercial | `marketing-comercial/` | 52 |
| Supply Chain | `supply-chain/` | 24 |

Cada carpeta es autónoma: `index.html`, `app.js` (datos), `engine.js` (lógica) e
`img/`. Sin build, igual que el Mapa de Capacidades, del que hereda la
arquitectura y el sistema visual.

## La decisión de diseño

**Los seis ejes del radar son los cinco módulos del bootcamp.** El módulo 1 se
parte en dos —fundamentos por un lado, manejo y verificación de información por
otro— porque son brechas distintas y conviene poder verlas separadas.

Por eso el radar no dice quién sabe más: dice **a qué módulo darle más aire en
cada área**. Un eje hundido en Supply Chain y alto en Comercial es una
instrucción de cómo repartir las 20 horas, no una calificación.

Las tres áreas comparten el mismo esqueleto de dimensiones —si cambiaran, no se
podrían comparar— pero las preguntas están redactadas en el vocabulario de cada
una: conciliaciones y cartera en Finanzas, briefs y cotizaciones en Comercial,
incoterms y agotados en Supply Chain.

## El instrumento

- **30 preguntas puntuadas**, 5 por dimensión, escala conductual 0–3. Cada
  opción describe una conducta observable —qué hace hoy— y no un grado de
  acuerdo.
- **5 preguntas de contexto que no puntúan**: qué consume tiempo, qué frena,
  dónde pedir más detalle, y dos abiertas.
- Las abiertas van **después** de las 30, no antes: quien acaba de revisar cómo
  trabaja responde mucho mejor qué espera del bootcamp.
- Cuatro niveles: Punto Cero, Explorador, Aplicado, Multiplicador.

## Datos

Tabla propia `jaguarcol_diagnosticos`, separada de los leads B2B del Mapa de
Capacidades y de las evaluaciones de curso. `anon` solo puede **INSERT**; la
lectura está atada al usuario administrador y no al rol `authenticated`, porque
en ese mismo proyecto de Supabase hay estudiantes autenticados.

Panel por área: la misma URL con `#admin`, con el correo y contraseña de
Supabase de Jorge. Trae el promedio por módulo, el conteo de tareas y frenos,
los módulos más pedidos, las respuestas abiertas completas y exportación a CSV
para cruzar las tres áreas en una sola hoja.

## Habeas data

El aviso dice de forma explícita que **esto no es una evaluación de desempeño**
y que el jefe recibe el consolidado del área, no el resultado individual. Sin
esa promesa nadie responde con honestidad, y un diagnóstico deshonesto no sirve
para nada.

Las páginas van con `noindex`: es un instrumento interno, no una pieza pública.

**Pendiente antes de repartir los enlaces:** confirmar con JaguarCol quién
figura como responsable del tratamiento —ellos como empleador, o la Universidad
EAN como titular del programa— y con qué NIT y correo oficial. Hoy el canal
habilitado es el del encargado: válido, pero provisional. Al cambiar el aviso,
subir `POLITICA_VERSION` en `app.js`.

## Otros pendientes

- Las imágenes (`img/d1..d6.jpg`, `hero.jpg`) son las del Mapa de Capacidades.
  Sirven porque son fotografía corporativa genérica, pero no ilustran estas
  dimensiones en particular.
- El logo del encabezado es el de la Universidad EAN. Si JaguarCol quiere su
  marca en la pieza, hay que pedir el archivo original.

## Dos permisos, no uno (lección aprendida en producción)

En Supabase, que una política RLS exista **no** basta. Son dos capas:

- El **GRANT** dice si el rol puede tocar la tabla.
- La **política RLS** dice qué filas puede tocar.

La tabla nació con las políticas correctas pero sin `GRANT INSERT ... TO anon`,
así que PostgREST rechazaba cada respuesta y la persona perdía las 35 preguntas
que acababa de contestar. Y la verificación inicial no lo detectó porque se
insertó por la conexión administrativa, que tiene privilegios que el navegador
no tiene: se probó por un camino que no era el camino.

Para verificar de verdad, hay que hacerse pasar por el rol:

```sql
set local role anon;
insert into public.jaguarcol_diagnosticos (...) values (...);  -- sin RETURNING
```

Sin `RETURNING`: esa cláusula exige permiso de lectura, y `anon` no lo tiene a
propósito. El navegador tampoco lo usa — supabase-js manda `return=minimal`
cuando no se encadena `.select()`.

## La respuesta no se pierde aunque falle el envío

Desde la versión 1.1 del registro, la fila se guarda en el navegador **antes**
de intentar enviarla, y solo se borra de ahí cuando el servidor confirma. Si el
envío falla, queda pendiente, aparece un botón para reintentar y se reenvía
sola al volver a abrir la página. Tope de 20 pendientes para no llenar el
almacenamiento del navegador.
