from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count
from .models import Producto, DetalleVenta, Alerta, Recomendacion


def generar_alertas_y_recomendaciones(negocio_id):
    productos = Producto.objects.filter(negocio_id=negocio_id, is_active=True)
    ahora = timezone.now()
    contador = 0

    for producto in productos:
        # 1. Stock crítico
        if producto.stock <= producto.stock_minimo:
            Alerta.objects.get_or_create(
                negocio_id=negocio_id, producto=producto,
                tipo='stock_critico',
                defaults={
                    'mensaje': f'El producto "{producto.nombre}" tiene stock crítico: {producto.stock} unidades (mínimo: {producto.stock_minimo}).',
                    'fecha': ahora,
                }
            )
            contador += 1

        # 2. Sobreinventario
        ultimos_30_dias = ahora - timedelta(days=30)
        ventas_30 = DetalleVenta.objects.filter(
            producto=producto, venta__fecha__gte=ultimos_30_dias
        ).aggregate(total=Sum('cantidad'))['total'] or 0

        if ventas_30 > 0 and producto.stock > ventas_30 * 3:
            Alerta.objects.get_or_create(
                negocio_id=negocio_id, producto=producto,
                tipo='sobreinventario',
                defaults={
                    'mensaje': f'Sobreinventario de "{producto.nombre}": {producto.stock} uds, pero solo se venden ~{ventas_30} al mes.',
                    'fecha': ahora,
                }
            )
            contador += 1

        # 3. Sin movimiento
        ventas_siempre = DetalleVenta.objects.filter(producto=producto).count()
        if ventas_siempre == 0:
            Alerta.objects.get_or_create(
                negocio_id=negocio_id, producto=producto,
                tipo='sin_movimiento',
                defaults={
                    'mensaje': f'El producto "{producto.nombre}" nunca ha tenido ventas.',
                    'fecha': ahora,
                }
            )
            contador += 1

        # 4. Baja de ventas
        mes_pasado = ahora - timedelta(days=60)
        mes_actual = ahora - timedelta(days=30)
        ventas_previas = DetalleVenta.objects.filter(
            producto=producto, venta__fecha__gte=mes_pasado, venta__fecha__lt=mes_actual
        ).aggregate(total=Sum('cantidad'))['total'] or 0
        ventas_recientes = DetalleVenta.objects.filter(
            producto=producto, venta__fecha__gte=mes_actual
        ).aggregate(total=Sum('cantidad'))['total'] or 0

        if ventas_previas > 0 and ventas_recientes < ventas_previas * 0.7:
            Alerta.objects.get_or_create(
                negocio_id=negocio_id, producto=producto,
                tipo='baja_ventas',
                defaults={
                    'mensaje': f'Las ventas de "{producto.nombre}" bajaron {int((1 - ventas_recientes/ventas_previas)*100)}% respecto al mes anterior.',
                    'fecha': ahora,
                }
            )
            contador += 1

        # 5. Recomendación: Reabastecer
        if producto.stock <= producto.stock_minimo and ventas_30 > 0:
            Recomendacion.objects.get_or_create(
                negocio_id=negocio_id, producto=producto,
                tipo='reabastecer',
                defaults={
                    'mensaje': f'Compra sugerida de "{producto.nombre}": vende ~{ventas_30}/mes y solo tienes {producto.stock} uds.',
                    'fecha': ahora,
                }
            )
            contador += 1

        # 6. Recomendación: Promoción/Descuento
        if ventas_siempre > 0 and ventas_30 == 0:
            Recomendacion.objects.get_or_create(
                negocio_id=negocio_id, producto=producto,
                tipo='promocion',
                defaults={
                    'mensaje': f'Ofrece promoción de "{producto.nombre}": no ha vendido en 30 días pero tiene stock de {producto.stock} uds.',
                    'fecha': ahora,
                }
            )
            contador += 1

        # 7. Recomendación: Descontinuar
        if ventas_siempre == 0 and producto.stock == 0:
            Recomendacion.objects.get_or_create(
                negocio_id=negocio_id, producto=producto,
                tipo='descontinuar',
                defaults={
                    'mensaje': f'Considera descontinuar "{producto.nombre}": sin stock y sin ventas registradas.',
                    'fecha': ahora,
                }
            )
            contador += 1

    return f'Se generaron {contador} alertas y recomendaciones nuevas.'
