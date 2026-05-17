from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
from .models import DetalleVenta


def predecir_producto(producto):
    """
    Predice la demanda de un producto usando promedio móvil simple.
    No necesita scikit-learn ni servicios externos.
    """
    ahora = timezone.now()

    # Obtener ventas de los últimos 90 días
    desde = ahora - timedelta(days=90)
    ventas = (
        DetalleVenta.objects
        .filter(producto=producto, venta__fecha__gte=desde)
        .values('venta__fecha__date')
        .annotate(cantidad=Sum('cantidad'))
        .order_by('venta__fecha__date')
    )

    if not ventas:
        return None

    # Preparar datos diarios
    ventas_por_dia = {str(v['venta__fecha__date']): v['cantidad'] for v in ventas}
    fechas = []
    cantidades = []
    for i in range(90):
        dia = (desde + timedelta(days=i)).date()
        fechas.append(str(dia))
        cantidades.append(ventas_por_dia.get(str(dia), 0))

    # Promedio móvil de 7 días
    media_movil = []
    for i in range(len(cantidades)):
        inicio = max(0, i - 6)
        segmento = cantidades[inicio:i + 1]
        media_movil.append(round(sum(segmento) / len(segmento), 1))

    # Proyección 30 días: usar promedio de últimos 30 días
    ultimos_30 = cantidades[-30:] if len(cantidades) >= 30 else cantidades
    promedio_diario = sum(ultimos_30) / len(ultimos_30) if ultimos_30 else 0
    proyeccion_mensual = round(promedio_diario * 30, 0)

    # Tendencia: comparar últimos 15 días vs 15 días anteriores
    if len(cantidades) >= 30:
        reciente = sum(cantidades[-15:])
        anterior = sum(cantidades[-30:-15])
        if reciente > anterior * 1.1:
            tendencia = 'creciente'
        elif reciente < anterior * 0.9:
            tendencia = 'decreciente'
        else:
            tendencia = 'estable'
    else:
        tendencia = 'estable'

    # Predicciones diarias para los próximos 30 días
    predicciones = []
    for i in range(30):
        dia = (ahora + timedelta(days=i)).date()
        predicciones.append({
            'fecha': str(dia),
            'prediccion': round(promedio_diario, 1),
            'intervalo_inferior': round(max(0, promedio_diario * 0.5), 1),
            'intervalo_superior': round(promedio_diario * 1.5, 1),
        })

    # Cálculos de reorden
    punto_reorden = round(producto.stock_minimo + proyeccion_mensual * 0.5, 0)
    cantidad_sugerida = max(0, round(proyeccion_mensual - producto.stock, 0))
    dias_hasta_agotar = round(producto.stock / promedio_diario, 0) if promedio_diario > 0 else 999

    if producto.stock == 0:
        riesgo = 'alto'
    elif dias_hasta_agotar < producto.stock_minimo:
        riesgo = 'alto'
    elif dias_hasta_agotar < producto.stock_minimo * 2:
        riesgo = 'medio'
    else:
        riesgo = 'bajo'

    return {
        'producto': {
            'id': producto.id_producto,
            'nombre': producto.nombre,
            'stock': producto.stock,
            'stock_minimo': producto.stock_minimo,
        },
        'prediccion': {
            'tendencia': tendencia,
            'variabilidad': 'media',
            'confianza': 70,
            'predicciones': predicciones,
        },
        'reorden': {
            'prediccion_mensual': float(proyeccion_mensual),
            'punto_reorden': float(punto_reorden),
            'cantidad_sugerida': float(cantidad_sugerida),
            'dias_hasta_agotar': int(dias_hasta_agotar),
            'riesgo_desabasto': riesgo,
        },
    }
