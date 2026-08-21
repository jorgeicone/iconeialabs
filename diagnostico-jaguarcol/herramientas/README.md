# Generar las imágenes del diagnóstico

Las 21 imágenes —portada más seis de dimensión por cada una de las tres
áreas— se generan con **Nano Banana** (`gemini-2.5-flash-image`) llamando la
API de Google directamente.

## Por qué no se usa el CLI de Gemini

El CLI y su extensión `nanobanana` funcionan, pero son 21 peticiones simples:
depender de que la extensión instale bien y de que haya sesión interactiva
añade una pieza que se puede romper sin darnos nada. En una sesión en la nube
la instalación de la extensión se quedó colgada. Dos llamadas HTTP resuelven
lo mismo.

## Uso

```sh
export GEMINI_API_KEY=...            # no vive en el repo ni en el entorno
python3 generar_imagenes.py --dry-run   # valida las 21 sin gastar cuota
python3 generar_imagenes.py             # genera lo que falte
```

Es **idempotente**: no regenera lo que ya existe. Si una imagen sale mal,
bórrala y vuelve a correr, o regenera solo esa:

```sh
python3 generar_imagenes.py --solo supply-chain/d4
python3 generar_imagenes.py --forzar     # rehace todo
```

Requiere `Pillow` y `requests`.

## Qué hace con lo que devuelve el modelo

Recorta al centro para dejar 16:9 exacto, reescala a 1400 px de ancho —el
mismo del `hero.jpg` del Mapa de Capacidades— y guarda JPEG progresivo con
calidad 82. Una fotografía real queda alrededor de 140 KB, en línea con las
imágenes que ya usa el sitio.

## La regla de composición

Está en `prompts_img.py` y no es decorativa: la franja de pregunta pone un
degradado oscuro sobre el **tercio izquierdo** con el nombre de la dimensión
encima. Ese lado debe quedar tranquilo — sin caras ni detalle fino— o el texto
cae sobre la cara de alguien. Las mismas imágenes se recortan como miniatura
en el informe, así que el sujeto tiene que leerse al 25% del tamaño.

Y nada de texto ni logos dentro de la imagen: cualquier letra inventada delata
que es generada.
