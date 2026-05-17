from django.contrib import admin
from .models import Negocio, Usuario, Suscripcion, Producto, Venta, DetalleVenta
from .models import Compra, DetalleCompra, Proveedor, Alerta, Recomendacion

admin.site.register(Negocio)
admin.site.register(Usuario)
admin.site.register(Suscripcion)
admin.site.register(Producto)
admin.site.register(Venta)
admin.site.register(DetalleVenta)
admin.site.register(Compra)
admin.site.register(DetalleCompra)
admin.site.register(Proveedor)
admin.site.register(Alerta)
admin.site.register(Recomendacion)
