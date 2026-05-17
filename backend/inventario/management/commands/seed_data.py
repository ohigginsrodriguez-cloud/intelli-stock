from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from inventario.models import Negocio, Usuario, Suscripcion, Producto, Venta, DetalleVenta
from inventario.models import Compra, DetalleCompra, Proveedor, Alerta, Recomendacion


class Command(BaseCommand):
    help = 'Carga datos de ejemplo en la base de datos'

    def handle(self, *args, **options):
        self.stdout.write('Cargando datos de ejemplo...')

        # Crear negocio
        negocio, _ = Negocio.objects.get_or_create(
            nombre='Tienda Ejemplo',
            defaults={'tipo_negocio': 'abarrotes'}
        )

        # Crear usuario admin
        if not Usuario.objects.filter(correo='admin@intellistock.com').exists():
            Usuario.objects.create_superuser(
                correo='admin@intellistock.com',
                nombre='Admin IntelliStock',
                password='admin123',
                negocio=negocio,
                rol='admin',
            )
            self.stdout.write('  Usuario admin creado: admin@intellistock.com / admin123')

        # Crear suscripción
        ahora = timezone.now()
        Suscripcion.objects.get_or_create(
            negocio=negocio,
            tipo_plan='premium',
            defaults={
                'fecha_inicio': ahora - timedelta(days=30),
                'fecha_fin': ahora + timedelta(days=335),
                'estado': 'activa',
                'monto': Decimal('1500.00'),
            }
        )

        # Crear proveedores
        proveedores_data = [
            ('Distribuidora ABC', 'Carlos López', '555-0101', 'carlos@distribuidoraabc.com'),
            ('Alimentos del Valle', 'María García', '555-0102', 'maria@alimentosdelvalle.com'),
            ('Proveedora Industrial', 'Roberto Méndez', '555-0103', 'roberto@proveedoraindustrial.com'),
            ('Comercializadora del Sur', 'Ana Torres', '555-0104', 'ana@comercializadoradelsur.com'),
            ('Mayorista Express', 'José Hernández', '555-0105', 'jose@mayoristaexpress.com'),
        ]
        proveedores = []
        for nombre, contacto, telefono, email in proveedores_data:
            prov, _ = Proveedor.objects.update_or_create(
                negocio=negocio, nombre=nombre,
                defaults={'contacto': contacto, 'telefono': telefono, 'email': email},
            )
            proveedores.append(prov)

        self.stdout.write(f'  {len(proveedores)} proveedores creados')

        # Crear productos
        productos_data = [
            ('Arroz 1kg', 22.50, 18.00, 50, 10),
            ('Frijol 1kg', 28.00, 22.00, 40, 8),
            ('Aceite Vegetal 1L', 35.00, 28.00, 30, 6),
            ('Azúcar 1kg', 25.00, 20.00, 45, 10),
            ('Leche 1L', 21.00, 16.50, 60, 12),
            ('Coca-Cola 2L', 28.00, 22.00, 35, 8),
            ('Pan Blanco Bimbo', 45.00, 35.00, 20, 5),
            ('Huevo 12pz', 38.00, 30.00, 25, 5),
            ('Jabón Zote', 18.00, 13.50, 30, 8),
            ('Cloro 1L', 16.00, 11.00, 25, 6),
            ('Galletas Marías', 15.00, 11.00, 40, 10),
            ('Sopa de pasta', 12.00, 8.50, 50, 10),
            ('Atún en lata', 22.00, 16.00, 35, 8),
            ('Mayonesa 500g', 32.00, 25.00, 20, 5),
            ('Detergente 1kg', 48.00, 38.00, 15, 4),
        ]
        productos = []
        for nombre, precio, costo, stock, stock_min in productos_data:
            prod, _ = Producto.objects.get_or_create(
                negocio=negocio, nombre=nombre,
                defaults={
                    'precio_venta': Decimal(str(precio)),
                    'costo': Decimal(str(costo)),
                    'stock': stock,
                    'stock_minimo': stock_min,
                }
            )
            productos.append(prod)

        self.stdout.write(f'  {len(productos)} productos creados')

        # Crear ventas y compras históricas (60 días hacia atrás)
        import random
        ventas_count = 0
        compras_count = 0
        for dia in range(60, 0, -1):
            fecha = ahora - timedelta(days=dia)
            random.seed(dia)

            # Cada ~8 días, crear compras de re-stock
            if dia % 8 == 0:
                prods_a_comprar = random.sample(productos, random.randint(2, 5))
                compra = Compra.objects.create(
                    negocio=negocio,
                    proveedor=random.choice(proveedores),
                    fecha=fecha + timedelta(hours=random.randint(6, 10), minutes=random.randint(0, 59)),
                    total=Decimal('0.00'),
                )
                compra_total = Decimal('0.00')
                for prod in prods_a_comprar:
                    cant_compra = random.randint(10, 30)
                    DetalleCompra.objects.create(
                        compra=compra,
                        producto=prod,
                        cantidad=cant_compra,
                        costo_unitario=prod.costo,
                    )
                    prod.stock += cant_compra
                    prod.save()
                    compra_total += Decimal(str(cant_compra)) * prod.costo
                compra.total = compra_total
                compra.save()
                compras_count += 1

            # 1-3 ventas por día
            ventas_del_dia = random.randint(1, 3)
            for _ in range(ventas_del_dia):
                num_productos = random.randint(1, 4)
                prods_en_venta = random.sample(productos, min(num_productos, len(productos)))
                venta = Venta.objects.create(
                    negocio=negocio,
                    fecha=fecha + timedelta(hours=random.randint(8, 20), minutes=random.randint(0, 59)),
                    total=Decimal('0.00'),
                )
                total = Decimal('0.00')
                for prod in prods_en_venta:
                    cant = random.randint(1, 5)
                    precio = prod.precio_venta
                    DetalleVenta.objects.create(
                        venta=venta,
                        producto=prod,
                        cantidad=cant,
                        precio_unitario=precio,
                    )
                    prod.stock = max(0, prod.stock - cant)
                    prod.save()
                    total += Decimal(str(cant)) * precio
                venta.total = total
                venta.save()
                ventas_count += 1

        self.stdout.write(f'  {ventas_count} ventas históricas creadas')
        self.stdout.write(f'  {compras_count} compras históricas creadas')

        # Generar alertas y recomendaciones
        from inventario.alerts import generar_alertas_y_recomendaciones
        resultado = generar_alertas_y_recomendaciones(negocio.id_negocio)
        self.stdout.write(f'  {resultado}')

        self.stdout.write(self.style.SUCCESS('¡Datos de ejemplo cargados exitosamente!'))
