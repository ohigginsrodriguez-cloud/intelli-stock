# Guía de Exposición — InteliStock

## Cómo presentar el proyecto (explicado para quien no sabe nada)

---

## Antes de empezar: vocabulario básico

| Término | Significa | Explicación sencilla |
|---------|-----------|---------------------|
| **PYME** | Pequeña y Mediana Empresa | Negocios como una tienda de abarrotes, una ferretería, un restaurantito. No son grandes cadenas como Walmart. |
| **Stock** | Inventario / Existencia | La cantidad de productos que tienes guardados. Ej: "tengo stock de 50 coca-colas" = tengo 50 botellas. |
| **Stock crítico** | Inventario peligrosamente bajo | Cuando te quedan pocos productos y si no pides más, te vas a quedar sin nada para vender. |
| **Sobreinventario** | Demasiado producto guardado | Compraste tantas cosas que tienes dinero atorado en producto que no se vende. Como tener 1000 cajas de un cereal que nadie compra. |
| **Rotura de stock** | Quedarse sin inventario | Cuando un cliente quiere comprar algo pero ya no tienes. Perdiste la venta. |
| **Merma** | Producto que se echa a perder | Fruta podrida, leche caducada, pan duro. Dinero perdido. |
| **Dashboard** | Tablero de control | Una pantalla principal donde ves todo de un vistazo: ventas hoy, productos bajos, etc. Como el tablero de un carro. |
| **KPI** | Indicador clave de rendimiento | Un número que te dice qué tan bien va el negocio. Ej: "ventas de hoy", "ganancias del mes". |
| **Backend** | La parte invisible | El cerebro del sistema. Procesa datos, guarda en BD, hace cálculos. No lo ves pero funciona. |
| **Frontend** | La parte visible | La pantalla, los botones, lo que el usuario ve y toca. |
| **API** | Conexión entre frontend y backend | Un "mensajero" que lleva la información de la pantalla al cerebro y viceversa. |
| **TAM** | Total Addressable Market | El total de clientes posibles en todo el mercado. Ej: "hay 4.1 millones de PYMEs en México". |
| **SAM** | Serviceable Available Market | Los clientes que SÍ pueden pagar/usar tu producto. No todos pueden. |
| **SOM** | Serviceable Obtainable Market | Los clientes que REALMENTE puedes conseguir el primer año. |
| **ML** | Machine Learning | Una forma fancy de decir "la computadora aprende sola". InteliStock NO usa ML, usa matemáticas simples. |
| **ORM** | Object-Relational Mapping | Un traductor automático: escribes Python y él lo convierte a SQL para la base de datos. |
| **JWT** | JSON Web Token | Como un gafete digital. Cuando inicias sesión, el sistema te da un gafete que expira en 12 horas. |
| **CSV** | Valores separados por coma | Un archivo que se abre en Excel con datos en columnas. |
| **PDF** | Documento portátil | Un archivo que se ve igual en cualquier computadora. Ideal para imprimir. |
| **Promedio móvil simple** | La forma más básica de predecir | Si vendiste 10, 12, 8 los últimos 3 días, el promedio es 10. Así adivinas que mañana venderás ~10. Sin fórmulas locas. |

---

## Slide por slide: qué decir

---

### Slide 1 — Portada

**Qué dice la slide:**
InteliStock — Sistema Inteligente de Gestión de Inventarios para PYMEs
INNOVATEC 2026 | ITSVA

**Qué decir (guión):**
> "Buenos días/tardes. Somos el equipo InteliStock y hoy les presentamos nuestro proyecto: un sistema inteligente de gestión de inventarios para PYMEs.
>
> Pero antes de entrar en materia… ¿alguno de ustedes ha trabajado en una tienda, un restaurante o un negocio familiar? ¿Se han preguntado cómo saben cuánto comprar, cuándo pedir más producto, o qué hacer con lo que no se vende?
>
> De eso trata InteliStock."

---

### Slide 2 — Índice

**Qué dice la slide:**
Lista de 8 secciones: Problemática, Solución, Propuesta de Valor, etc.

**Qué decir (guión):**
> "Vamos a recorrer 8 puntos. Primero entenderemos el problema, luego veremos nuestra solución, cómo funciona, por qué es diferente, a quién va dirigido, y qué impacto tiene.
>
> Los invito a seguirnos en este recorrido."

---

### Slide 3 — Problemática

**Qué dice la slide:**
Tres tipos de problemas: económicos, operativos y sociales.

**Qué decir (guión):**
> "Imaginen que tienen una tienda de abarrotes. No saben cuánto tienen de cada producto. Compran de más y se les caduca la mercancía — eso es merma, dinero perdido. O compran de menos y cuando llega un cliente a comprar arroz, ya no hay — eso es rotura de stock, otra venta perdida.
>
> **Económicamente**, las PYMEs pierden mucho dinero por no tener control de su inventario. Tienen capital inmovilizado: compraron producto que nadie quiere y no tienen efectivo para lo que sí se vende.
>
> **Operativamente**, muchos negocios todavía usan libretas o Excel. Pasan horas contando productos a mano. No tienen manera de saber qué productos se venden rápido y cuáles están acumulando polvo.
>
> **Socialmente**, en México hay 4.1 millones de PYMEs. Son el motor de la economía: generan más de la mitad del PIB y casi el 70% del empleo. Pero el 60% de ellas no tiene un control sistematizado de su inventario. Toman decisiones al tanteo.
>
> Según datos del INEGI y la Secretaría de Economía, este es un problema real y enorme."

---

### Slide 4 — Nuestra Solución

**Qué dice la slide:**
Lista de 8 módulos/funcionalidades de InteliStock.

**Qué decir (guión):**
> "InteliStock es una plataforma digital — como un programa que instalas en tu computadora — que resuelve todo esto. Y lo hace con 8 funcionalidades clave:
>
> **1. Dashboard con KPIs:** Apenas abres el sistema, ves en una sola pantalla las ventas de hoy, las del mes, cuánto has ganado, qué productos están por terminarse. Todo de un vistazo.
>
> **2. Módulo de productos:** Aquí ves todos tus productos, cuánto tienes de cada uno, a qué precio los vendes, y el sistema te avisa automáticamente si algo está por acabarse.
>
> **3. Módulo de ventas:** Cada vez que vendes algo, lo registras y el sistema solito descuenta del inventario. Ya no tienes que andar contando.
>
> **4. Módulo de compras:** Cuando le compras a tus proveedores, lo registras y el sistema aumenta el inventario solo. Además llevas control de quién te vende.
>
> **5. Alertas inteligentes (7 reglas):** Esta es la magia. El sistema revisa automáticamente tu inventario y te avisa si algo anda mal. De esto hablamos más a detalle en un momento.
>
> **6. Recomendaciones:** No solo te alerta de problemas, también te sugiere qué hacer: 'pide más de este producto', 'ponlo en promoción', 'mejor ya no lo compres'.
>
> **7. Reportes:** Puedes sacar reportes en Excel (CSV) o en PDF para imprimir. Por ejemplo, las ventas de la semana, los productos más vendidos, etc.
>
> **8. Predicciones:** El sistema adivina cuánto vas a vender los próximos días usando promedios simples. Así sabes cuándo y cuánto pedir."

---

### Slide 5 — Propuesta de Valor

**Qué dice la slide:**
No solo registra, interpreta. 5 beneficios clave.

**Qué decir (guión):**
> "¿Qué hace diferente a InteliStock? Hay muchos programas para llevar inventarios, pero la mayoría solo registran: tú escribes cuánto tienes y ya.
>
> InteliStock hace más: **interpreta los datos por ti**. No te da números nada más, te dice: 'Oye, este producto se está vendiendo muy poco, mejor ponlo en oferta'. O 'Este otro se está acabando, pide más ya'.
>
> Es como tener un empleado que todo el día está revisando tu inventario y te avisa de problemas antes de que ocurran.
>
> Y lo mejor: no necesitas saber de tecnología. La interfaz es en español, sencilla. No necesitas machine learning ni inteligencia artificial complicada — todo está programado con matemáticas básicas. Y es gratuito (autogestionado), no como los ERPs que cuestan miles de pesos al mes.
>
> En resumen: **eliminamos las conjeturas**. Ya no adivinas cuándo pedir, el sistema te lo dice."

---

### Slide 6 — Operación y Funcionamiento

**Qué dice la slide:**
6 pasos: registro → procesamiento → alertas → notificación → visualización → decisión.

**Qué decir (guión):**
> "¿Cómo funciona InteliStock paso a paso?
>
> **Paso 1 — Registro:** Alguien en el negocio registra una venta o una compra. Es tan simple como llenar un formulario.
>
> **Paso 2 — Procesamiento:** El backend, que está hecho en Django (un framework de Python), recibe esos datos y los guarda en PostgreSQL (la base de datos). Pero no solo los guarda: también actualiza el stock automáticamente.
>
> **Paso 3 — Motor de alertas:** Cada vez que hay un cambio, el motor de alertas revisa 7 reglas. Por ejemplo: '¿este producto ya tiene menos stock del mínimo?' Si sí, genera una alerta.
>
> **Paso 4 — Generación:** Las alertas y recomendaciones aparecen automáticamente en el sistema. El usuario no tiene que hacer nada.
>
> **Paso 5 — Visualización:** El frontend, hecho en Next.js (una tecnología moderna de JavaScript), muestra todo bonito en pantalla: el dashboard, las alertas, los reportes.
>
> **Paso 6 — Decisión:** El dueño del negocio ve las alertas y decide: 'voy a pedir más arroz', 'voy a poner las galletas en promoción'.
>
> El sistema funciona 24/7, sin parar. Cada venta, cada compra, actualiza todo automáticamente."

---

### Slide 7 — Diferenciador y Comparativa de Costos

**Qué dice la slide:**
Tabla comparativa entre soluciones tradicionales e InteliStock.

**Qué decir (guión):**
> "Compramos con lo que hay en el mercado.
>
> Los ERPs tradicionales como SAP, Oracle o incluso sistemas mexicanos como Aspel, están diseñados para grandes empresas. Cuestan entre 800 y 3,000 pesos por usuario al mes. La instalación tarda días o semanas. Necesitas capacitación.
>
> InteliStock es diferente:
> - Cuesta $0 porque es autogestionado — tú lo pones en tu propia computadora.
> - Las alertas y predicciones vienen incluidas, no son un extra.
> - La interfaz es en español y sencilla.
> - La instalación son minutos: solo ejecutas un script (`run.sh`) y todo funciona.
>
> Para una PYME mexicana típica, la diferencia es enorme. No pueden pagar miles de pesos al mes en software. InteliStock les da el mismo poder tecnológico sin el costo."

---

### Slide 8 — Segmento de Mercado

**Qué dice la slide:**
4.1 millones de PYMEs, 52% del PIB, sectores clave.

**Qué decir (guión):**
> "¿A quién va dirigido? A las PYMEs mexicanas. Y no son pocas.
>
> En México hay 4.1 millones de PYMEs, según la Secretaría de Economía. Generan el 52% del Producto Interno Bruto y el 68% de los empleos. Son la columna vertebral de la economía.
>
> Hablamos de tiendas de abarrotes, ferreterías, refaccionarías, restaurantes, papelerías. Negocios de 1 a 50 empleados que venden entre 200 mil y 10 millones de pesos al año.
>
> Y lo más importante: cada vez más negocios quieren digitalizarse. La Industria 4.0 no es solo para grandes corporaciones. Las PYMEs también necesitan tecnología para competir."

---

### Slide 9 — Mercado Objetivo

**Qué dice la slide:**
TAM = 4.1M, SAM = 1.23M, SOM = 9,225 unidades.

**Qué decir (guión):**
> "Aquí usamos tres siglas importantes para calcular el mercado.
>
> **TAM — Total Addressable Market:** Es el pastel completo. Todas las PYMEs de México: 4.1 millones. Si todas compraran InteliStock, ese sería el mercado total.
>
> **SAM — Serviceable Available Market:** No todas las PYMEs pueden comprar tecnología. Algunas no tienen computadora, otras no les interesa. Estimamos que el 30% sí tiene capacidad de adoptar tecnología. Eso nos da 1.23 millones de negocios.
>
> **SOM — Serviceable Obtainable Market:** Este es el mercado REAL que podemos alcanzar el primer año. Calculamos captar el 5% del SAM, y de esos, que el 15% realmente compre. Esto nos da aproximadamente 9,225 unidades en el primer año.
>
> ¿Por qué estas cifras? Porque somos un proyecto estudiantil, no tenemos presupuesto de marketing. Empezamos poco a poco, en escuelas, incubadoras, ferias tecnológicas. Pero el potencial es enorme."

---

### Slide 10 — Impacto

**Qué dice la slide:**
Económico, operativo y educativo.

**Qué decir (guión):**
> "El impacto de InteliStock se ve en tres áreas:
>
> **Económico:** Al reducir la merma (producto caducado) entre un 20 y 40%, el negocio ahorra dinero directo. Al evitar roturas de stock, no pierde ventas. Y al tener mejor control del inventario, el flujo de efectivo mejora porque no compras cosas que no se venden.
>
> **Operativo:** El dueño ya no pasa horas contando productos. Ya no adivina cuándo pedir. El sistema le avisa. Las decisiones las toma con datos, no con el presentimiento. Puede dedicar su tiempo a lo que realmente importa: atender clientes, mejorar el negocio.
>
> **Educativo:** InteliStock es un proyecto de estudiantes para estudiantes. Usa tecnologías modernas: Django, Next.js, PostgreSQL. Los que participamos aprendemos desarrollo web full-stack, bases de datos, inteligencia de negocios. Y como es código abierto, cualquiera puede aprender de él.
>
> Al final, la frase que resume todo: **'El inventario es el corazón del negocio, la tecnología la herramienta y los jóvenes la fuerza de cambio.'** "

---

### Slide 11 — Gracias

**Qué decir (guión):**
> "Muchas gracias por su atención. Estamos abiertos a sus preguntas.
>
> Si quieren conocer más del proyecto, el código está disponible y con gusto lo compartimos.
>
> ¿Alguna pregunta?"

---

### Slide 12 — Referencias

**Qué dice la slide:**
INEGI, Secretaría de Economía, Django, Next.js, PostgreSQL.

**Qué decir (guión):**
> "Nuestras fuentes principales son datos del INEGI y la Secretaría de Economía. La parte técnica está documentada en la documentación oficial de Django, Next.js y PostgreSQL.
>
> Si quieren profundizar en algún tema, con gusto les compartimos las referencias completas."

---

## Las 7 reglas de alertas (explicadas en detalle)

Esta es una de las partes más importantes del proyecto. Hay que saber explicarlas bien.

### ¿Qué son?

Son **7 condiciones automáticas** que el sistema revisa constantemente. Cuando una se cumple, el sistema genera una alerta (aviso) o una recomendación (sugerencia).

---

### Regla 1 — Stock Crítico (Alerta)

**Condición:** `stock <= stock_minimo`
- **Traducción:** Lo que tienes es igual o menos que el mínimo que deberías tener.
- **Ejemplo:** Un producto tiene stock mínimo de 10. Tú tienes 2. ¡Alerta!
- **Qué hace el sistema:** Crea una alerta de tipo `stock_critico`.
- **Qué debe hacer el dueño:** Pedir más producto a su proveedor URGENTE.

---

### Regla 2 — Sobreinventario (Alerta)

**Condición:** `stock > ventas_mensuales * 3`
- **Traducción:** Tienes tanto producto que aunque no vendas nada en 3 meses, todavía te sobra.
- **Ejemplo:** Vendes 10 bolsas de arroz al mes pero tienes 50. Para 5 meses de venta.
- **Qué hace el sistema:** Crea una alerta de tipo `sobreinventario`.
- **Qué debe hacer el dueño:** Poner el producto en promoción, hacer combos, o dejar de comprarlo tantito.

---

### Regla 3 — Sin Movimiento (Alerta)

**Condición:** El producto tiene 0 ventas en toda su historia.
- **Traducción:** Nunca, jamás, en toda la vida del negocio se ha vendido una sola unidad de este producto.
- **Ejemplo:** Compraste un lote de galletas de matcha importadas y nadie las ha comprado en 6 meses.
- **Qué hace el sistema:** Crea una alerta de tipo `sin_movimiento`.
- **Qué debe hacer el dueño:** Considerar seriamente si vale la pena tener ese producto. Tal vez regalarlo, donarlo o rematarlo.

---

### Regla 4 — Baja de Ventas (Alerta)

**Condición:** Las ventas del mes pasado son >30% menores que las del mes anterior.
- **Traducción:** El producto se está vendiendo mucho menos que antes.
- **Ejemplo:** En enero vendiste 100 refrescos, en febrero vendiste 60. Caída del 40%.
- **Qué hace el sistema:** Crea una alerta de tipo `baja_ventas`.
- **Qué debe hacer el dueño:** Investigar por qué. ¿Subió el precio? ¿Llegó competencia? ¿Cambió la temporada?

---

### Regla 5 — Reabastecer (Recomendación)

**Condición:** Stock bajo + el producto SÍ se vende.
- **Traducción:** Se está acabando pero la gente lo compra, así que vale la pena pedir más.
- **Ejemplo:** Quedan 5 coca-colas y se venden 20 a la semana.
- **Qué hace el sistema:** Crea una recomendación de tipo `reabastecer`.
- **Qué debe hacer el dueño:** Pedir más a su proveedor.

---

### Regla 6 — Promoción (Recomendación)

**Condición:** Stock > 0 pero 0 ventas en los últimos 30 días.
- **Traducción:** Tienes producto guardado que nadie ha comprado en un mes.
- **Ejemplo:** Tienes 30 bolsas de un cereal que nadie ha comprado en 30 días.
- **Qué hace el sistema:** Crea una recomendación de tipo `promocion`.
- **Qué debe hacer el dueño:** Ponerlo en oferta, hacer un descuento, crear un combo para sacarlo.

---

### Regla 7 — Descontinuar (Recomendación)

**Condición:** Stock en 0 Y nunca se ha vendido.
- **Traducción:** No tienes producto y nunca se vendió. ¿Para qué lo tienes?
- **Ejemplo:** Dado de alta un producto "chicles de wasabi" que nunca compraste ni vendiste.
- **Qué hace el sistema:** Crea una recomendación de tipo `descontinuar`.
- **Qué debe hacer el dueño:** Dar de baja ese producto del catálogo. Ya no perder tiempo con él.

---

## Preguntas frecuentes que pueden hacer en la exposición

### ¿Por qué Django y no otro lenguaje?

Porque Django es rápido para desarrollar, viene con muchas cosas incluidas (ORM, admin, autenticación), y usa Python que es fácil de aprender. Además, el REST Framework hace que crear APIs sea muy sencillo.

### ¿Por qué PostgreSQL y no MySQL?

Porque PostgreSQL tiene mejor soporte para cosas avanzadas como JSON, consultas complejas, y maneja mejor la concurrencia (varias personas usando el sistema al mismo tiempo).

### ¿Por qué Next.js y no React solo?

Porque Next.js ya trae enrutamiento, renderizado del lado del servidor (las páginas cargan más rápido), y mejor SEO (aparece mejor en Google). Es como React pero con superpoderes.

### ¿Por qué no usan Machine Learning?

Porque no lo necesitamos. El promedio móvil simple es sorprendentemente efectivo para inventarios de PYMEs, y es más fácil de entender y mantener. Si usáramos ML, el sistema sería más caro, más complicado, y más difícil de explicar.

### ¿Está listo para usarse en un negocio real?

El sistema funciona, tiene datos de ejemplo, y todas las funcionalidades están implementadas. Pero es un proyecto estudiantil — necesitaría pruebas en campo y ajustes para producción real.

### ¿Cómo se actualiza?

Como es código abierto, cualquiera puede modificarlo y mejorarlo. Las actualizaciones se hacen con `git pull` y reiniciando los servicios.

---

## Tips para presentar

1. **No leas las diapositivas.** Las slides son tu apoyo, no tu guión. La gente puede leer, tú tienes que explicar.

2. **Habla claro y pausado.** Esto no es una carrera. Entre más despacio hablas, más inteligente suenas.

3. **Usa ejemplos cotidianos.** En lugar de "stock crítico", di "imagina que tienes una tienda y te quedan 2 coca-colas".

4. **Se honesto.** Si algo no está listo o tiene limitaciones, dilo. La sinceridad da más credibilidad que querer aparentar perfección.

5. **Entusiasmo.** Si tú no muestras emoción por tu proyecto, ¿por qué la audiencia la tendría?

6. **Prepara respuestas.** Las preguntas más comunes ya están arriba. Practícalas.

7. **Tiempo:** Esta presentación completa, bien explicada, debe durar entre 8 y 12 minutos. No más de 15.

---

## Abreviaturas técnicas rápidas (para que no te agarren en curva)

| Sigla | Significa | Como explicarlo |
|-------|-----------|-----------------|
| **API** | Application Programming Interface | Un mensajero entre programas |
| **BD** | Base de Datos | Donde se guarda toda la información |
| **CSV** | Comma Separated Values | Archivo que se abre en Excel |
| **DDL** | Data Definition Language | Instrucciones para crear tablas (CREATE TABLE) |
| **DRF** | Django REST Framework | Herramienta para hacer APIs en Django |
| **FK** | Foreign Key | Una flecha que conecta una tabla con otra |
| **JWT** | JSON Web Token | Gafete digital que dura 12 horas |
| **KPI** | Key Performance Indicator | Un número que mide qué tan bien va algo |
| **ML** | Machine Learning | Computadora que aprende sola (no usamos) |
| **ORM** | Object-Relational Mapping | Traductor de Python a SQL |
| **PK** | Primary Key | El número único de cada registro (como el ID) |
| **PYME** | Pequeña y Mediana Empresa | Negocio pequeño/mediano |
| **SaaS** | Software as a Service | Programa que pagas por mes y usas en internet |
| **SQL** | Structured Query Language | Lenguaje para hablar con bases de datos |
| **TAM** | Total Addressable Market | Todas las personas que podrían comprar tu producto |
| **SAM** | Serviceable Available Market | Las que SÍ pueden comprar tu producto |
| **SOM** | Serviceable Obtainable Market | Las que REALMENTE comprarán el primer año |
