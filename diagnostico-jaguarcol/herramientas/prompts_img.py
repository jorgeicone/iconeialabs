# -*- coding: utf-8 -*-
"""Los 21 prompts de imagen del diagnóstico JaguarCol.

Reglas de composición que NO son decorativas:
 · La franja de pregunta (.q-band) pone un degradado oscuro sobre el TERCIO
   IZQUIERDO con el nombre de la dimensión encima. Ese lado tiene que quedar
   tranquilo: nada de caras ni detalle fino ahí.
 · Las mismas imágenes se recortan como miniatura en .dim-img, así que el
   sujeto debe leerse aun al 25% del tamaño.
 · Sin texto, sin logos, sin marcas de agua: cualquier letra inventada
   delata que la imagen es generada.
"""

ESTILO = (
    "fotografía editorial corporativa, luz natural de ventanal, profundidad de campo corta, "
    "estilo documental sin poses forzadas, paleta neutra y cálida con verdes suaves, "
    "profesionales latinoamericanos de edades y géneros diversos, ambiente de empresa real "
    "colombiana, encuadre horizontal con el peso visual a la derecha y espacio tranquilo a la "
    "izquierda, sin texto, sin letras, sin logotipos, sin marcas de agua"
)

AREAS = {
 "admin-finanzas": {
  "hero": "equipo administrativo reunido alrededor de una mesa de juntas luminosa, carpetas de archivo y portátiles abiertos, conversación de trabajo distendida",
  "d1": "mujer de contabilidad de unos treinta y cinco años en su escritorio, abriendo por primera vez una herramienta nueva en el portátil, expresión de curiosidad atenta",
  "d2": "escritorio con carpetas de archivo abiertas junto a una pantalla, una persona cotejando cifras con el dedo sobre el papel y la vista en el monitor",
  "d3": "hombre redactando un documento formal en el computador de oficina, teclado y taza en primer plano desenfocado",
  "d4": "pantalla grande con una hoja de cálculo densa de filas y columnas, pilas ordenadas de facturas y sellos junto al teclado",
  "d5": "estantería de archivadores con carpetas etiquetadas por colores al fondo, una persona de pie consultando una tableta en primer plano",
  "d6": "carpeta cerrada de documentos reservados sobre el escritorio con las manos apoyadas encima en gesto de resguardo, archivador metálico con cerradura al fondo",
 },
 "marketing-comercial": {
  "hero": "equipo de mercadeo y diseño alrededor de una mesa amplia con piezas gráficas impresas, muestras de color y portátiles abiertos",
  "d1": "diseñador joven frente a un portátil con una herramienta nueva recién abierta, tableta gráfica y lápiz sobre la mesa",
  "d2": "dos personas de pie analizando un tablero con gráficas de mercado y participación, señalando una curva",
  "d3": "ejecutiva comercial redactando una propuesta en el portátil, cuaderno con notas manuscritas al lado",
  "d4": "mesa de trabajo con una misma pieza gráfica impresa en varios formatos y tamaños, diseñador ordenándolas en fila",
  "d5": "pared de trabajo con tablero de campaña, muestras de marca, paleta de color y fichas de producto ordenadas",
  "d6": "dos personas revisando juntas una pieza en la pantalla antes de publicarla, gesto de revisión cuidadosa señalando un dato",
 },
 "supply-chain": {
  "hero": "profesional de logística con tableta en el borde de una bodega luminosa y ordenada, estanterías altas desenfocadas al fondo",
  "d1": "analista de planeación frente a un portátil en una oficina con ventanal hacia la bodega, primer acercamiento a una herramienta nueva",
  "d2": "escritorio con documentos de importación y un manifiesto de carga, una persona revisándolos contra la pantalla",
  "d3": "coordinador de servicio escribiendo un correo en el computador, auricular de diadema puesto, ambiente de oficina logística",
  "d4": "tablero digital de seguimiento de pedidos y tiempos de tránsito en una pantalla grande, bodega desenfocada al fondo",
  "d5": "centro de control logístico con varias pantallas de seguimiento encendidas, una persona de pie supervisándolas",
  "d6": "mesa con documentos de aduana y un sello sobre el papel, manos revisando con cuidado hoja por hoja",
 },
}

def prompt(area, clave):
    return "%s, %s" % (AREAS[area][clave], ESTILO)

if __name__ == '__main__':
    import sys
    n = 0
    for area in AREAS:
        for clave in ['hero', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6']:
            n += 1
            print('%02d  %s/%s.jpg' % (n, area, clave))
            if '-v' in sys.argv:
                print('    ' + prompt(area, clave) + '\n')
    print('\nTotal: %d imágenes · 16:9 · destino img/ de cada área' % n)
