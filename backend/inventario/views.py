from django.db.models import Sum, Count, Q, F
from django.db.models.functions import TruncDate
from collections import defaultdict
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import csv
import io

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.exceptions import AuthenticationFailed

from .models import (
    Negocio, Usuario, Suscripcion, Producto, Venta, DetalleVenta,
    Compra, DetalleCompra, Proveedor, Alerta, Recomendacion
)
from .serializers import (
    ProductoSerializer, VentaSerializer, VentaCreacionSerializer,
    CompraSerializer, CompraCreacionSerializer, ProveedorSerializer,
    AlertaSerializer, RecomendacionSerializer, RegistroSerializer
)
from .alerts import generar_alertas_y_recomendaciones
from .predictions import predecir_producto


def _obtener_usuario(request):
    """Obtiene el usuario desde el header Authorization o desde query param 'token'"""
    token_str = request.query_params.get('token', '')
    if not token_str:
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token_str = auth_header[7:]
    if token_str:
        try:
            token = AccessToken(token_str)
            return Usuario.objects.get(id_usuario=token['user_id'])
        except Exception:
            pass
    return None


# ─── PAGINACION ───────────────────────────────────────────────
class Paginacion(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'


# ─── AUTENTICACION ────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    correo = request.data.get('email', '')
    password = request.data.get('password', '')
    try:
        user = Usuario.objects.get(correo=correo)
    except Usuario.DoesNotExist:
        return Response({'detail': 'Credenciales inválidas'}, status=401)

    if not user.check_password(password):
        return Response({'detail': 'Credenciales inválidas'}, status=401)

    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id_usuario': user.id_usuario,
            'nombre': user.nombre,
            'correo': user.correo,
            'rol': user.rol,
            'negocio_id': user.negocio_id,
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegistroSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    data = serializer.validated_data
    if Usuario.objects.filter(correo=data['email']).exists():
        return Response({'email': ['Este correo ya está registrado']}, status=400)

    negocio = Negocio.objects.create(
        nombre=data['negocio'],
        tipo_negocio=data['tipo_negocio'],
    )
    user = Usuario.objects.create_user(
        correo=data['email'],
        nombre=data['nombre'],
        password=data['password'],
        negocio=negocio,
        rol='admin',
    )
    Suscripcion.objects.create(
        negocio=negocio,
        tipo_plan='basico',
        fecha_inicio=timezone.now(),
        fecha_fin=timezone.now() + timedelta(days=30),
        estado='activa',
        monto=Decimal('300.00'),
    )

    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id_usuario': user.id_usuario,
            'nombre': user.nombre,
            'correo': user.correo,
            'rol': user.rol,
            'negocio_id': user.negocio_id,
        }
    }, status=201)


# ─── DASHBOARD ────────────────────────────────────────────────
@api_view(['GET'])
def dashboard_view(request):
    negocio_id = request.user.negocio_id
    ahora = timezone.now()
    inicio_mes = ahora.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_productos = Producto.objects.filter(negocio_id=negocio_id, is_active=True).count()
    stock_bajo = Producto.objects.filter(negocio_id=negocio_id, is_active=True, stock__lte=F('stock_minimo')).count()

    ventas_mes = Venta.objects.filter(negocio_id=negocio_id, fecha__gte=inicio_mes)
    ingresos_mes = float(ventas_mes.aggregate(s=Sum('total'))['s'] or 0)
    total_ventas_mes = ventas_mes.count()

    compras_mes = Compra.objects.filter(negocio_id=negocio_id, fecha__gte=inicio_mes)
    costos_mes = float(compras_mes.aggregate(s=Sum('total'))['s'] or 0)

    alertas_pendientes = Alerta.objects.filter(negocio_id=negocio_id, leida=False).count()

    margen_mes = ingresos_mes - costos_mes

    # Ventas recientes
    ventas_recientes = Venta.objects.filter(negocio_id=negocio_id)[:5]
    ventas_data = []
    for v in ventas_recientes:
        count = v.detalles.count()
        if count == 0:
            productos = 'Sin productos'
        else:
            nombres = [d.producto.nombre for d in v.detalles.all()[:3]]
            productos = ', '.join(nombres)
            if count > 3:
                productos += f' y {count - 3} más'
        ventas_data.append({
            'id': v.id_venta,
            'fecha': v.fecha,
            'total': float(v.total),
            'productos': productos,
        })

    # Top productos
    top = (
        DetalleVenta.objects
        .filter(venta__negocio_id=negocio_id)
        .values('producto__nombre')
        .annotate(total_vendido=Sum('cantidad'))
        .order_by('-total_vendido')[:5]
    )

    return Response({
        'total_productos': total_productos,
        'stock_bajo': stock_bajo,
        'ingresos_mes': ingresos_mes,
        'total_ventas_mes': total_ventas_mes,
        'costos_mes': costos_mes,
        'margen_mes': margen_mes,
        'alertas_pendientes': alertas_pendientes,
        'ventas_recientes': ventas_data,
        'top_productos': list(top),
        'user': {
            'nombre': request.user.nombre,
            'correo': request.user.correo,
        },
    })


# ─── PRODUCTOS ────────────────────────────────────────────────
class ProductoViewSet(viewsets.ModelViewSet):
    serializer_class = ProductoSerializer
    pagination_class = Paginacion
    search_fields = ['nombre', 'codigo_barras', 'descripcion']

    def get_queryset(self):
        return Producto.objects.filter(negocio_id=self.request.user.negocio_id)

    def perform_create(self, serializer):
        serializer.save(negocio_id=self.request.user.negocio_id)

    def perform_update(self, serializer):
        serializer.save(negocio_id=self.request.user.negocio_id)


# ─── VENTAS ───────────────────────────────────────────────────
class VentaViewSet(viewsets.ModelViewSet):
    serializer_class = VentaSerializer
    pagination_class = Paginacion
    search_fields = ['id_venta', 'notas', 'fecha']
    ordering = ['-fecha', '-id_venta']

    def get_queryset(self):
        return Venta.objects.filter(negocio_id=self.request.user.negocio_id).prefetch_related('detalles__producto')

    def create(self, request, *args, **kwargs):
        serializer = VentaCreacionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        negocio_id = request.user.negocio_id
        venta = Venta.objects.create(
            negocio_id=negocio_id,
            fecha=data['fecha'],
            notas=data.get('notas', ''),
            total=Decimal('0.00'),
        )

        total = Decimal('0.00')
        for det in data['detalles']:
            producto = Producto.objects.get(id_producto=det['producto'], negocio_id=negocio_id)
            detalle = DetalleVenta.objects.create(
                venta=venta,
                producto=producto,
                cantidad=det['cantidad'],
                precio_unitario=det['precio_unitario'],
            )
            producto.stock -= det['cantidad']
            producto.save()
            total += Decimal(str(det['cantidad'])) * Decimal(str(det['precio_unitario']))

        venta.total = total
        venta.save()
        return Response(VentaSerializer(venta).data, status=201)


# ─── COMPRAS ──────────────────────────────────────────────────
class CompraViewSet(viewsets.ModelViewSet):
    serializer_class = CompraSerializer
    pagination_class = Paginacion
    search_fields = ['id_compra', 'notas', 'fecha']
    ordering = ['-fecha', '-id_compra']

    def get_queryset(self):
        return Compra.objects.filter(negocio_id=self.request.user.negocio_id).prefetch_related('detalles__producto')

    def create(self, request, *args, **kwargs):
        serializer = CompraCreacionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        negocio_id = request.user.negocio_id
        compra = Compra.objects.create(
            negocio_id=negocio_id,
            proveedor_id=data['proveedor'],
            fecha=data['fecha'],
            notas=data.get('notas', ''),
            total=Decimal('0.00'),
        )

        total = Decimal('0.00')
        for det in data['detalles']:
            producto = Producto.objects.get(id_producto=det['producto'], negocio_id=negocio_id)
            DetalleCompra.objects.create(
                compra=compra,
                producto=producto,
                cantidad=det['cantidad'],
                costo_unitario=det['costo_unitario'],
            )
            producto.stock += det['cantidad']
            producto.save()
            total += Decimal(str(det['cantidad'])) * Decimal(str(det['costo_unitario']))

        compra.total = total
        compra.save()
        return Response(CompraSerializer(compra).data, status=201)


# ─── PROVEEDORES ──────────────────────────────────────────────
class ProveedorViewSet(viewsets.ModelViewSet):
    serializer_class = ProveedorSerializer
    pagination_class = Paginacion
    search_fields = ['nombre', 'telefono', 'email', 'contacto']

    def get_queryset(self):
        return Proveedor.objects.filter(negocio_id=self.request.user.negocio_id)

    def perform_create(self, serializer):
        serializer.save(negocio_id=self.request.user.negocio_id)

    def perform_update(self, serializer):
        serializer.save(negocio_id=self.request.user.negocio_id)


# ─── ALERTAS ──────────────────────────────────────────────────
class AlertaViewSet(viewsets.ModelViewSet):
    serializer_class = AlertaSerializer
    pagination_class = Paginacion

    def get_queryset(self):
        qs = Alerta.objects.filter(negocio_id=self.request.user.negocio_id)
        if self.request.query_params.get('ordering') == '-fecha':
            qs = qs.order_by('-fecha')
        return qs

    @action(detail=True, methods=['post'])
    def marcar_leida(self, request, pk=None):
        alerta = self.get_object()
        alerta.leida = True
        alerta.save()
        return Response({'status': 'ok'})

    @action(detail=False, methods=['post'])
    def marcar_todas_leidas(self, request):
        Alerta.objects.filter(negocio_id=request.user.negocio_id, leida=False).update(leida=True)
        return Response({'status': 'ok'})


class RecomendacionViewSet(viewsets.ModelViewSet):
    serializer_class = RecomendacionSerializer
    pagination_class = Paginacion

    def get_queryset(self):
        qs = Recomendacion.objects.filter(negocio_id=self.request.user.negocio_id)
        if self.request.query_params.get('ordering') == '-fecha':
            qs = qs.order_by('-fecha')
        return qs

    @action(detail=True, methods=['post'])
    def marcar_aplicada(self, request, pk=None):
        rec = self.get_object()
        rec.aplicada = True
        rec.save()
        return Response({'status': 'ok'})


@api_view(['POST'])
def generate_alerts(request):
    negocio_id = request.user.negocio_id
    resultado = generar_alertas_y_recomendaciones(negocio_id)
    return Response({'mensaje': resultado})


@api_view(['GET'])
def pending_count(request):
    negocio_id = request.user.negocio_id
    alertas = Alerta.objects.filter(negocio_id=negocio_id, leida=False).count()
    recomendaciones = Recomendacion.objects.filter(negocio_id=negocio_id, aplicada=False).count()
    return Response({
        'alertas_pendientes': alertas,
        'recomendaciones_pendientes': recomendaciones,
    })


# ─── REPORTES ─────────────────────────────────────────────────
@api_view(['GET'])
def reporte_ventas(request):
    negocio_id = request.user.negocio_id
    start = request.query_params.get('start', (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
    end = request.query_params.get('end', timezone.now().strftime('%Y-%m-%d'))

    ventas = Venta.objects.filter(
        negocio_id=negocio_id, fecha__date__gte=start, fecha__date__lte=end
    )
    total_ventas = ventas.count()
    total_ingresos = float(ventas.aggregate(s=Sum('total'))['s'] or 0)
    promedio = total_ingresos / total_ventas if total_ventas > 0 else 0

    ventas_por_dia = (
        ventas.annotate(dia=TruncDate('fecha'))
        .values('dia')
        .annotate(total=Sum('total'), cantidad=Count('id_venta'))
        .order_by('dia')
    )

    detalles = DetalleVenta.objects.filter(venta__in=ventas).select_related('producto')
    top_agg = defaultdict(lambda: {'cantidad': 0, 'total': 0.0})
    for d in detalles:
        top_agg[d.producto.nombre]['cantidad'] += d.cantidad
        top_agg[d.producto.nombre]['total'] += float(d.cantidad * d.precio_unitario)
    top = sorted(top_agg.items(), key=lambda x: x[1]['total'], reverse=True)[:10]

    return Response({
        'resumen': {
            'total_ventas': total_ventas,
            'total_ingresos': total_ingresos,
            'promedio_por_venta': round(promedio, 2),
        },
        'ventas_por_dia': [
            {'dia': str(v['dia']), 'total': float(v['total']), 'cantidad': v['cantidad']}
            for v in ventas_por_dia
        ],
        'productos_mas_vendidos': [
            {'producto': nombre, 'cantidad': datos['cantidad'], 'total': datos['total']}
            for nombre, datos in top
        ],
    })


@api_view(['GET'])
def reporte_inventario(request):
    negocio_id = request.user.negocio_id
    productos = Producto.objects.filter(negocio_id=negocio_id, is_active=True)

    total = productos.count()
    valor = sum(float(p.costo) * p.stock for p in productos)
    stock_bajo = productos.filter(stock__lte=F('stock_minimo'), stock__gt=0).count()
    sin_stock = productos.filter(stock=0).count()
    normal = total - stock_bajo - sin_stock

    return Response({
        'resumen': {
            'total_productos': total,
            'valor_inventario': round(valor, 2),
            'stock_bajo': stock_bajo,
            'sin_stock': sin_stock,
        },
        'categorias_stock': [
            {'categoria': 'Stock Normal', 'cantidad': normal, 'color': 'success'},
            {'categoria': 'Stock Bajo', 'cantidad': stock_bajo, 'color': 'warning'},
            {'categoria': 'Sin Stock', 'cantidad': sin_stock, 'color': 'danger'},
        ],
        'productos': [
            {
                'id': p.id_producto, 'nombre': p.nombre,
                'stock': p.stock, 'stock_minimo': p.stock_minimo,
                'precio_venta': float(p.precio_venta), 'costo': float(p.costo),
                'valor': float(p.costo) * p.stock,
            }
            for p in productos
        ],
    })


@api_view(['GET'])
def reporte_margenes(request):
    negocio_id = request.user.negocio_id
    start = request.query_params.get('start', (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
    end = request.query_params.get('end', timezone.now().strftime('%Y-%m-%d'))

    ventas = Venta.objects.filter(
        negocio_id=negocio_id, fecha__date__gte=start, fecha__date__lte=end
    )
    ingresos = float(ventas.aggregate(s=Sum('total'))['s'] or 0)

    detalles_venta = DetalleVenta.objects.filter(venta__in=ventas).select_related('producto')
    detalle_agg = defaultdict(lambda: {'cantidad': 0, 'ingresos': 0.0, 'costo': 0.0})
    for d in detalles_venta:
        nom = d.producto.nombre
        detalle_agg[nom]['cantidad'] += d.cantidad
        detalle_agg[nom]['ingresos'] += float(d.cantidad) * float(d.precio_unitario)
        detalle_agg[nom]['costo'] = float(d.producto.costo)

    detalle_data = []
    costos_totales = 0
    for nombre, datos in sorted(detalle_agg.items(), key=lambda x: x[1]['ingresos'], reverse=True):
        cant = datos['cantidad']
        costo_total = datos['costo'] * cant
        ing = datos['ingresos']
        ganancia = ing - costo_total
        margen = round((ganancia / ing) * 100, 1) if ing > 0 else 0
        costos_totales += costo_total
        detalle_data.append({
            'producto': nombre,
            'cantidad_vendida': cant,
            'ingresos': round(ing, 2),
            'costo_total': round(costo_total, 2),
            'ganancia': round(ganancia, 2),
            'margen': margen,
        })

    ganancia_total = ingresos - costos_totales
    margen_general = round((ganancia_total / ingresos) * 100, 1) if ingresos > 0 else 0

    return Response({
        'resumen': {
            'ingresos_totales': round(ingresos, 2),
            'costos_totales': round(costos_totales, 2),
            'ganancia_total': round(ganancia_total, 2),
            'margen_general': margen_general,
        },
        'detalle': detalle_data,
    })


def _exportar_csv(nombre_archivo, filas, cabeceras):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(cabeceras)
    for fila in filas:
        writer.writerow(fila)
    output.seek(0)
    return output


@api_view(['GET'])
@permission_classes([AllowAny])
def export_csv(request, tipo):
    user = _obtener_usuario(request)
    if not user:
        return Response({'error': 'No autorizado'}, status=401)
    negocio_id = user.negocio_id
    start = request.query_params.get('start', (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
    end = request.query_params.get('end', timezone.now().strftime('%Y-%m-%d'))

    if tipo == 'ventas':
        ventas = Venta.objects.filter(
            negocio_id=negocio_id, fecha__date__gte=start, fecha__date__lte=end
        )
        filas = [[v.id_venta, v.fecha.strftime('%Y-%m-%d'), float(v.total)] for v in ventas]
        csv_file = _exportar_csv('ventas.csv', filas, ['ID', 'Fecha', 'Total'])
    elif tipo == 'inventario':
        productos = Producto.objects.filter(negocio_id=negocio_id, is_active=True)
        filas = [[p.id_producto, p.nombre, p.stock, p.stock_minimo, float(p.precio_venta), float(p.costo)] for p in productos]
        csv_file = _exportar_csv('inventario.csv', filas, ['ID', 'Producto', 'Stock', 'Stock Min', 'Precio', 'Costo'])
    elif tipo == 'margenes':
        ventas_periodo = Venta.objects.filter(
            negocio_id=negocio_id, fecha__date__gte=start, fecha__date__lte=end
        )
        detalles = DetalleVenta.objects.filter(venta__in=ventas_periodo).select_related('producto')
        agg_manual = defaultdict(lambda: {'cant': 0, 'ing': 0.0})
        for d in detalles:
            agg_manual[d.producto.nombre]['cant'] += d.cantidad
            agg_manual[d.producto.nombre]['ing'] += float(d.cantidad) * float(d.precio_unitario)
        filas = [[nombre, d['cant'], round(d['ing'], 2)] for nombre, d in agg_manual.items()]
        csv_file = _exportar_csv('margenes.csv', filas, ['Producto', 'Vendidos', 'Ingresos'])
    else:
        return Response({'error': 'Tipo no válido'}, status=400)

    from django.http import HttpResponse
    response = HttpResponse(csv_file.getvalue(), content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{tipo}.csv"'
    return response


@api_view(['GET'])
@permission_classes([AllowAny])
def export_pdf(request, tipo):
    user = _obtener_usuario(request)
    if not user:
        return Response({'error': 'No autorizado'}, status=401)
    from django.http import HttpResponse
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib import colors

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    elements.append(Paragraph(f'InteliStock - Reporte de {tipo}', styles['Title']))
    elements.append(Spacer(1, 0.25 * inch))

    negocio_id = user.negocio_id
    start = request.query_params.get('start', (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
    end = request.query_params.get('end', timezone.now().strftime('%Y-%m-%d'))

    if tipo == 'ventas':
        ventas = Venta.objects.filter(negocio_id=negocio_id, fecha__date__gte=start, fecha__date__lte=end)
        data = [['ID', 'Fecha', 'Total']]
        for v in ventas:
            data.append([str(v.id_venta), v.fecha.strftime('%d/%m/%Y'), f'${float(v.total):,.2f}'])

    elif tipo == 'inventario':
        productos = Producto.objects.filter(negocio_id=negocio_id, is_active=True)
        data = [['Producto', 'Stock', 'Stock Min', 'Precio', 'Costo']]
        for p in productos:
            data.append([p.nombre, str(p.stock), str(p.stock_minimo), f'${float(p.precio_venta):,.2f}', f'${float(p.costo):,.2f}'])
    else:
        return Response({'error': 'Tipo no válido'}, status=400)

    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.Color(37 / 255, 99 / 255, 235 / 255)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    elements.append(table)
    doc.build(elements)

    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{tipo}.pdf"'
    return response


# ─── PREDICCIONES ─────────────────────────────────────────────
@api_view(['GET'])
def prediccion_view(request, producto_id):
    try:
        producto = Producto.objects.get(id_producto=producto_id, negocio_id=request.user.negocio_id)
    except Producto.DoesNotExist:
        return Response({'error': 'Producto no encontrado'}, status=404)

    resultado = predecir_producto(producto)
    if resultado:
        return Response(resultado)
    return Response({'error': 'No hay datos suficientes para predecir'}, status=400)
