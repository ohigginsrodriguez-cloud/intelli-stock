from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from decimal import Decimal


class UsuarioManager(BaseUserManager):
    def create_user(self, correo, nombre, password=None, **extra_fields):
        if not correo:
            raise ValueError('El correo es obligatorio')
        correo = self.normalize_email(correo)
        user = self.model(correo=correo, nombre=nombre, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, correo, nombre, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('rol', 'admin')
        return self.create_user(correo, nombre, password, **extra_fields)


class Negocio(models.Model):
    id_negocio = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    tipo_negocio = models.CharField(max_length=50)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'negocio'
        ordering = ['-fecha_registro']

    def __str__(self):
        return self.nombre


class Usuario(AbstractUser):
    id_usuario = models.AutoField(primary_key=True)
    negocio = models.ForeignKey(Negocio, on_delete=models.CASCADE, related_name='usuarios')
    rol = models.CharField(max_length=20, choices=[
        ('admin', 'Administrador'),
        ('empleado', 'Empleado'),
    ], default='empleado')
    telefono = models.CharField(max_length=20, blank=True)

    username = None
    correo = models.EmailField(unique=True)
    USERNAME_FIELD = 'correo'
    REQUIRED_FIELDS = ['nombre', 'rol']

    first_name = None
    last_name = None
    nombre = models.CharField(max_length=255)

    class Meta:
        db_table = 'usuario'
        ordering = ['nombre']

    objects = UsuarioManager()

    def __str__(self):
        return f'{self.nombre} ({self.correo})'


class Suscripcion(models.Model):
    id_suscripcion = models.AutoField(primary_key=True)
    negocio = models.ForeignKey(Negocio, on_delete=models.CASCADE, related_name='suscripciones')
    tipo_plan = models.CharField(max_length=20, choices=[
        ('basico', 'Básico'),
        ('intermedio', 'Intermedio'),
        ('premium', 'Premium'),
    ])
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    estado = models.CharField(max_length=20, choices=[
        ('activa', 'Activa'),
        ('expirada', 'Expirada'),
        ('cancelada', 'Cancelada'),
    ], default='activa')
    monto = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'suscripcion'
        ordering = ['-fecha_inicio']

    def __str__(self):
        return f'{self.negocio.nombre} - {self.get_tipo_plan_display()}'


class Proveedor(models.Model):
    id_proveedor = models.AutoField(primary_key=True)
    negocio = models.ForeignKey(Negocio, on_delete=models.CASCADE, related_name='proveedores')
    nombre = models.CharField(max_length=255)
    contacto = models.CharField(max_length=255, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    direccion = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'proveedor'
        ordering = ['nombre']
        unique_together = [['negocio', 'nombre']]

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    id_producto = models.AutoField(primary_key=True)
    negocio = models.ForeignKey(Negocio, on_delete=models.CASCADE, related_name='productos')
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True)
    codigo_barras = models.CharField(max_length=100, blank=True)
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2)
    costo = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=5)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'producto'
        ordering = ['nombre']
        unique_together = [['negocio', 'nombre']]

    def __str__(self):
        return self.nombre

    @property
    def margen_ganancia(self):
        if self.costo > 0:
            return float(((self.precio_venta - self.costo) / self.costo) * 100)
        return 0

    @property
    def stock_bajo(self):
        return self.stock <= self.stock_minimo


class Venta(models.Model):
    id_venta = models.AutoField(primary_key=True)
    negocio = models.ForeignKey(Negocio, on_delete=models.CASCADE, related_name='ventas')
    fecha = models.DateTimeField()
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    notas = models.TextField(blank=True)

    class Meta:
        db_table = 'venta'
        ordering = ['-fecha']

    def __str__(self):
        return f'Venta #{self.id_venta}'


class DetalleVenta(models.Model):
    id_detalle = models.AutoField(primary_key=True)
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name='detalles_venta')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'detalle_venta'

    def __str__(self):
        return f'{self.producto.nombre} x{self.cantidad}'

    @property
    def subtotal(self):
        return float(self.cantidad) * float(self.precio_unitario)


class Compra(models.Model):
    id_compra = models.AutoField(primary_key=True)
    negocio = models.ForeignKey(Negocio, on_delete=models.CASCADE, related_name='compras')
    proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT, related_name='compras')
    fecha = models.DateTimeField()
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    notas = models.TextField(blank=True)

    class Meta:
        db_table = 'compra'
        ordering = ['-fecha']

    def __str__(self):
        return f'Compra #{self.id_compra} - {self.proveedor.nombre}'


class DetalleCompra(models.Model):
    id_detalle_compra = models.AutoField(primary_key=True)
    compra = models.ForeignKey(Compra, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name='detalles_compra')
    cantidad = models.IntegerField()
    costo_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'detalle_compra'

    def __str__(self):
        return f'{self.producto.nombre} x{self.cantidad}'

    @property
    def subtotal(self):
        return float(self.cantidad) * float(self.costo_unitario)


class Alerta(models.Model):
    TIPOS = [
        ('stock_critico', 'Stock Crítico'),
        ('sin_movimiento', 'Sin Movimiento'),
        ('baja_ventas', 'Baja de Ventas'),
        ('sobreinventario', 'Sobreinventario'),
    ]

    id_alerta = models.AutoField(primary_key=True)
    negocio = models.ForeignKey(Negocio, on_delete=models.CASCADE, related_name='alertas')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='alertas', null=True, blank=True)
    tipo = models.CharField(max_length=50, choices=TIPOS)
    mensaje = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    leida = models.BooleanField(default=False)

    class Meta:
        db_table = 'alerta'
        ordering = ['-fecha']

    def __str__(self):
        return f'[{self.get_tipo_display()}] {self.mensaje[:50]}'


class Recomendacion(models.Model):
    TIPOS = [
        ('reabastecer', 'Reabastecer'),
        ('promocion', 'Promoción'),
        ('descuento', 'Descuento'),
        ('descontinuar', 'Descontinuar'),
    ]

    id_recomendacion = models.AutoField(primary_key=True)
    negocio = models.ForeignKey(Negocio, on_delete=models.CASCADE, related_name='recomendaciones')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='recomendaciones')
    tipo = models.CharField(max_length=50, choices=TIPOS)
    mensaje = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    aplicada = models.BooleanField(default=False)

    class Meta:
        db_table = 'recomendacion'
        ordering = ['-fecha']

    def __str__(self):
        return f'[{self.get_tipo_display()}] {self.mensaje[:50]}'
