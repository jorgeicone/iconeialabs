# -*- coding: utf-8 -*-
"""Genera las 21 imágenes del diagnóstico JaguarCol con Nano Banana.

Llama la API de Google directamente en vez de pasar por el CLI: son 21
peticiones simples y así no dependemos de que la extensión del CLI
instale bien ni de que haya sesión interactiva.

    export GEMINI_API_KEY=...
    python3 generar_imagenes.py            # genera lo que falte
    python3 generar_imagenes.py --dry-run  # valida sin gastar cuota
    python3 generar_imagenes.py --solo admin-finanzas/d1

Es idempotente: no regenera lo que ya existe, salvo con --forzar. Así, si
una imagen sale mal, se borra ese archivo y se vuelve a correr.
"""
import base64, io, json, os, sys, time
import requests
from PIL import Image
from prompts_img import AREAS, prompt

MODELO   = os.environ.get('NB_MODELO', 'gemini-2.5-flash-image')
API      = 'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent' % MODELO
DEST     = '/home/user/iconeialabs/diagnostico-jaguarcol'
CLAVES   = ['hero', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6']
ANCHO    = 1400          # el hero del Mapa es 1400x764; las de dimensión se reescalan igual
CALIDAD  = 82            # JPEG: por debajo de 85 el peso baja mucho y no se nota
REINTENTOS = 3

def pedir(texto, clave):
    """Una imagen. Devuelve bytes PNG/JPEG crudos del modelo."""
    cuerpo = {
        'contents': [{'parts': [{'text': texto}]}],
        'generationConfig': {
            'responseModalities': ['IMAGE'],
            'imageConfig': {'aspectRatio': '16:9'},
        },
    }
    ultimo = None
    for intento in range(1, REINTENTOS + 1):
        try:
            r = requests.post(API, headers={'x-goog-api-key': clave,
                                            'Content-Type': 'application/json'},
                              json=cuerpo, timeout=180)
            if r.status_code == 200:
                partes = r.json()['candidates'][0]['content']['parts']
                for p in partes:
                    dato = p.get('inlineData') or p.get('inline_data')
                    if dato:
                        return base64.b64decode(dato['data'])
                raise RuntimeError('la respuesta no trajo imagen: %s' % json.dumps(partes)[:300])
            # 429 y 5xx se reintentan; 400/403 no tienen arreglo reintentando
            if r.status_code in (400, 403):
                raise RuntimeError('HTTP %d — %s' % (r.status_code, r.text[:300]))
            ultimo = 'HTTP %d — %s' % (r.status_code, r.text[:200])
        except requests.RequestException as e:
            ultimo = 'red: %s' % e
        if intento < REINTENTOS:
            espera = 4 * intento
            print('      reintento %d/%d en %ds (%s)' % (intento, REINTENTOS, espera, ultimo))
            time.sleep(espera)
    raise RuntimeError(ultimo or 'falló sin motivo reportado')

def guardar(crudo, destino):
    """Recorta a 16:9 exacto, reescala y guarda JPEG optimizado."""
    im = Image.open(io.BytesIO(crudo)).convert('RGB')
    objetivo = 16 / 9
    w, h = im.size
    if abs(w / h - objetivo) > 0.01:                      # recorte centrado
        if w / h > objetivo:
            nw = int(h * objetivo); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else:
            nh = int(w / objetivo); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    if im.width != ANCHO:
        im = im.resize((ANCHO, round(ANCHO / objetivo)), Image.LANCZOS)
    im.save(destino, 'JPEG', quality=CALIDAD, optimize=True, progressive=True)
    return im.size, os.path.getsize(destino)

def main():
    seco    = '--dry-run' in sys.argv
    forzar  = '--forzar' in sys.argv
    solo    = None
    if '--solo' in sys.argv:
        solo = sys.argv[sys.argv.index('--solo') + 1]

    clave = os.environ.get('GEMINI_API_KEY', '').strip()
    if not clave and not seco:
        sys.exit('Falta GEMINI_API_KEY. Ponla en las variables del entorno de la sesión\n'
                 'o expórtala aquí, y vuelve a correr. Con --dry-run se valida sin clave.')

    tareas = [(a, k) for a in AREAS for k in CLAVES]
    if solo:
        tareas = [(a, k) for a, k in tareas if '%s/%s' % (a, k) == solo]
        if not tareas:
            sys.exit('No existe %s' % solo)

    hechas = saltadas = fallidas = 0
    for area, k in tareas:
        destino = os.path.join(DEST, area, 'img', '%s.jpg' % k)
        etiqueta = '%s/%s' % (area, k)
        if os.path.exists(destino) and not forzar and not seco:
            print('  ·  %-28s ya existe, se salta' % etiqueta); saltadas += 1; continue
        texto = prompt(area, k)
        if seco:
            print('  ·  %-28s %d caracteres de prompt → %s' % (etiqueta, len(texto), destino))
            hechas += 1; continue
        print('  →  %-28s generando…' % etiqueta)
        try:
            tam, peso = guardar(pedir(texto, clave), destino)
            print('  ✓  %-28s %dx%d · %.0f KB' % (etiqueta, tam[0], tam[1], peso / 1024))
            hechas += 1
        except Exception as e:
            print('  ✗  %-28s %s' % (etiqueta, e)); fallidas += 1

    print('\n%s: %d %s · %d saltadas · %d fallidas'
          % ('Simulación' if seco else 'Resultado', hechas,
             'validadas' if seco else 'generadas', saltadas, fallidas))
    return 1 if fallidas else 0

if __name__ == '__main__':
    sys.exit(main())
