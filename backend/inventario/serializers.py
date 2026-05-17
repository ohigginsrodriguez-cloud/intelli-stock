from rest_framework import serializers
from .models import Negocio, Usuario, Suscripcion, Producto, Venta, DetalleVenta
from .models import Compra, DetalleCompra, Proveedor, Alerta, Recomendacion


class RegistroSerializer(serializers.Serializer):
    nombre = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    negocio = serializers.CharField()
    tipo_negocio = serializers.CharField()


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id_usuario', 'nombre', 'correo', 'rol', 'telefono', 'negocio_id']
        read_only_fields = ['id_usuario']


class NegocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Negocio
        fields = '__all__'


class SuscripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suscripcion
        fields = '__all__'


class ProductoSerializer(serializers.ModelSerializer):
    margen_ganancia = serializers.ReadOnlyField()
    stock_bajo = serializers.ReadOnlyField()

    class Meta:
        model = Producto
        fields = [
            'id', 'id_producto', 'nombre', 'descripcion', 'codigo_barras',
            'precio_venta', 'costo', 'stock', 'stock_minimo',
            'margen_ganancia', 'stock_bajo', 'is_active', 'negocio_id'
        ]
        read_only_fields = ['id']

    id = serializers.IntegerField(source='id_producto', read_only=True)


class DetalleVentaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = DetalleVenta
        fields = ['id_detalle', 'producto', 'producto_nombre', 'cantidad', 'precio_unitario', 'subtotal']


class VentaSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True, read_only=True)
    productos = serializers.SerializerMethodField()

    class Meta:
        model = Venta
        fields = ['id', 'id_venta', 'fecha', 'total', 'notas', 'detalles', 'productos', 'negocio_id']
        read_only_fields = ['id', 'total']

    id = serializers.IntegerField(source='id_venta', read_only=True)

    def get_productos(self, obj):
        count = obj.detalles.count()
        if count == 0:
            return 'Sin productos'
        nombres = [d.producto.nombre for d in obj.detalles.all()[:3]]
        texto = ', '.join(nombres)
        if count > 3:
            texto += f' y {count - 3} más'
        return texto


class VentaCreacionSerializer(serializers.Serializer):
    fecha = serializers.DateTimeField()
    notas = serializers.CharField(required=False, default='')
    detalles = serializers.ListField(child=serializers.DictField())


class DetalleCompraSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = DetalleCompra
        fields = ['id_detalle_compra', 'producto', 'producto_nombre', 'cantidad', 'costo_unitario', 'subtotal']


class CompraSerializer(serializers.ModelSerializer):
    detalles = DetalleCompraSerializer(many=True, read_only=True)
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    productos = serializers.SerializerMethodField()

    class Meta:
        model = Compra
        fields = [
            'id', 'id_compra', 'fecha', 'total', 'notas',
            'proveedor', 'proveedor_nombre', 'detalles', 'productos', 'negocio_id'
        ]
        read_only_fields = ['id', 'total']

    id = serializers.IntegerField(source='id_compra', read_only=True)

    def get_productos(self, obj):
        count = obj.detalles.count()
        if count == 0:
            return 'Sin productos'
        nombres = [d.producto.nombre for d in obj.detalles.all()[:3]]
        texto = ', '.join(nombres)
        if count > 3:
            texto += f' y {count - 3} más'
        return texto


class CompraCreacionSerializer(serializers.Serializer):
    proveedor = serializers.IntegerField()
    fecha = serializers.DateTimeField()
    notas = serializers.CharField(required=False, default='')
    detalles = serializers.ListField(child=serializers.DictField())


class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = '__all__'

    id = serializers.IntegerField(source='id_proveedor', read_only=True)


class AlertaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True, allow_null=True)

    class Meta:
        model = Alerta
        fields = ['id', 'id_alerta', 'tipo', 'mensaje', 'fecha', 'leida', 'producto', 'producto_nombre']
        read_only_fields = ['id']

    id = serializers.IntegerField(source='id_alerta', read_only=True)


class RecomendacionSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = Recomendacion
        fields = ['id', 'id_recomendacion', 'tipo', 'mensaje', 'fecha', 'aplicada', 'producto', 'producto_nombre']
        read_only_fields = ['id']

    id = serializers.IntegerField(source='id_recomendacion', read_only=True)
