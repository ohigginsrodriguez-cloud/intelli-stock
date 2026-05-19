# Modelo de Base de Datos - InteliStock

## Normalización (1FN, 2FN, 3FN)

### 1FN - Primera Forma Normal
Cada tabla tiene una clave primaria única y todos los atributos son atómicos (no repetitivos ni compuestos).

| Tabla | PK | Atributos atómicos |
|-------|----|--------------------|
| `negocio` | `id_negocio` | nombre, tipo_negocio, fecha_registro, is_active |
| `usuario` | `id_usuario` | nombre, correo, contraseña, rol, telefono, negocio_id |
| `suscripcion` | `id_suscripcion` | tipo_plan, fecha_inicio, fecha_fin, estado, monto, negocio_id |
| `proveedor` | `id_proveedor` | nombre, contacto, telefono, email, direccion, is_active, negocio_id |
| `producto` | `id_producto` | nombre, descripcion, codigo_barras, precio_venta, costo, stock, stock_minimo, is_active, negocio_id |
| `venta` | `id_venta` | fecha, total, notas, negocio_id |
| `detalle_venta` | `id_detalle` | cantidad, precio_unitario, venta_id, producto_id |
| `compra` | `id_compra` | fecha, total, notas, negocio_id, proveedor_id |
| `detalle_compra` | `id_detalle_compra` | cantidad, costo_unitario, compra_id, producto_id |
| `alerta` | `id_alerta` | tipo, mensaje, fecha, leida, negocio_id, producto_id |
| `recomendacion` | `id_recomendacion` | tipo, mensaje, fecha, aplicada, negocio_id, producto_id |

### 2FN - Segunda Forma Normal
Está en 1FN y cada atributo no clave depende completamente de toda la clave primaria (no hay dependencias parciales).

- Todas las tablas tienen PK simple (una sola columna), por lo que no puede haber dependencias parciales. ✓
- Las tablas detalle (`detalle_venta`, `detalle_compra`) tienen PK propia, no compuesta. ✓

### 3FN - Tercera Forma Normal
Está en 2FN y ningún atributo no clave depende transitivamente de la clave primaria.

- `negocio`: `id_negocio` → `nombre`, `tipo_negocio`, `fecha_registro`, `is_active`. Sin transitividades. ✓
- `usuario`: `id_usuario` → `nombre`, `correo`, `contraseña`, `rol`, `telefono`, `negocio_id`. `negocio_id` es FK a `negocio`, no hay dependencia transitiva. ✓
- `suscripcion`: `id_suscripcion` → `tipo_plan`, `fecha_inicio`, `fecha_fin`, `estado`, `monto`, `negocio_id`. ✓
- `proveedor`: `id_proveedor` → `nombre`, `contacto`, `telefono`, `email`, `direccion`, `is_active`, `negocio_id`. ✓
- `producto`: `id_producto` → `nombre`, `descripcion`, `codigo_barras`, `precio_venta`, `costo`, `stock`, `stock_minimo`, `is_active`, `negocio_id`. ✓
- `venta`: `id_venta` → `fecha`, `total`, `notas`, `negocio_id`. ✓
- `detalle_venta`: `id_detalle` → `cantidad`, `precio_unitario`, `venta_id`, `producto_id`. ✓
- `compra`: `id_compra` → `fecha`, `total`, `notas`, `negocio_id`, `proveedor_id`. ✓
- `detalle_compra`: `id_detalle_compra` → `cantidad`, `costo_unitario`, `compra_id`, `producto_id`. ✓
- `alerta`: `id_alerta` → `tipo`, `mensaje`, `fecha`, `leida`, `negocio_id`, `producto_id`. ✓
- `recomendacion`: `id_recomendacion` → `tipo`, `mensaje`, `fecha`, `aplicada`, `negocio_id`, `producto_id`. ✓

**Conclusión: La base de datos cumple con 1FN, 2FN y 3FN.** ✓

## Diagrama de Relaciones

```
negocio (id_negocio PK)
  │
  ├── usuario (id_usuario PK, negocio_id FK → negocio)
  ├── suscripcion (id_suscripcion PK, negocio_id FK → negocio)
  ├── proveedor (id_proveedor PK, negocio_id FK → negocio)
  ├── producto (id_producto PK, negocio_id FK → negocio)
  ├── venta (id_venta PK, negocio_id FK → negocio)
  ├── compra (id_compra PK, negocio_id FK → negocio, proveedor_id FK → proveedor)
  ├── alerta (id_alerta PK, negocio_id FK → negocio, producto_id FK → producto)
  └── recomendacion (id_recomendacion PK, negocio_id FK → negocio, producto_id FK → producto)

venta ─── detalle_venta (id_detalle PK, venta_id FK → venta, producto_id FK → producto)
compra ─── detalle_compra (id_detalle_compra PK, compra_id FK → compra, producto_id FK → producto)
```

## Diccionario de Tablas

| Tabla | Descripción |
|-------|-------------|
| `negocio` | Negocios registrados en la plataforma |
| `usuario` | Usuarios con login por correo electrónico |
| `suscripcion` | Planes de suscripción (básico/intermedio/premium) |
| `proveedor` | Proveedores asociados a cada negocio |
| `producto` | Catálogo de productos con precio, costo y stock |
| `venta` | Cabeceras de ventas realizadas |
| `detalle_venta` | Productos vendidos en cada venta |
| `compra` | Cabeceras de compras a proveedores |
| `detalle_compra` | Productos comprados en cada compra |
| `alerta` | Alertas automáticas (stock crítico, sobreinventario, etc.) |
| `recomendacion` | Recomendaciones inteligentes para el negocio |
