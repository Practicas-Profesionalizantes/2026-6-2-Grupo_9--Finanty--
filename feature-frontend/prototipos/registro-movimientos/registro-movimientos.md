# Prototipo de registro de movimientos — Finanty

## Objetivo

Pantalla frontend adaptable para demostrar cómo una persona registra manualmente un ingreso o un gasto. Mantiene la identidad visual del prototipo de inicio de sesión: verde oscuro, verde medio, fondo claro y acentos dorados.

## Campos

- Tipo de movimiento: ingreso o gasto.
- Importe en pesos argentinos, mayor que cero y con hasta dos decimales.
- Fecha y hora, precargadas con la fecha y hora local al abrir la pantalla y editables.
- Categoría, seleccionada según el tipo de movimiento.
- Tipo de medio de pago y medio específico relacionado.
- Comercio o descripción opcional, hasta 150 caracteres (límite documentado en el DER).

## Selectores ilustrativos

Las categorías se basan en los ejemplos del pedido porque el esquema del proyecto define el tipo de categoría, pero todavía no contiene un catálogo precargado:

- **Gastos:** Alimentación, Transporte, Vivienda, Salud, Educación, Entretenimiento y Otros gastos.
- **Ingresos:** Sueldo, Trabajos, Ventas y Otros ingresos.

Al cambiar entre ingreso y gasto, se reemplaza la lista de categorías y se borra la selección anterior. El texto de ayuda indica que la administración futura de categorías corresponde a Configuración.

Los tipos de medio y opciones son los ejemplos solicitados:

- **Billeteras virtuales:** Mercado Pago, Naranja X y Cuenta DNI.
- **Tarjetas:** Banco BBVA, Banco Santander y Banco Provincia.
- **Efectivo:** Efectivo.

Al cambiar el tipo de medio, el selector específico se limpia y muestra únicamente opciones de ese grupo.

## Validaciones e interacciones

- Tipo, importe, fecha, hora, categoría, tipo de medio y medio específico son obligatorios; la descripción es opcional.
- El importe admite coma o punto decimal, hasta dos posiciones, y rechaza valores vacíos, no numéricos, negativos o iguales a cero.
- Se verifica que la categoría corresponda al tipo y que el medio seleccionado pertenezca al tipo de pago elegido.
- Los errores se muestran junto al campo y el foco pasa al primer campo inválido.
- **Guardar movimiento** muestra una confirmación y un resumen locales; no envía ni persiste información.
- **Cancelar** limpia la carga y vuelve a precargar fecha y hora locales.
- Panel y Configuración son accesos visuales de demostración; no abren otras páginas.

## Suposiciones y alcance

El DER documenta `MOVIMIENTO.fecha` como fecha y hora, `monto` como `DECIMAL(12,2)`, `comercio` como opcional de hasta 150 caracteres, y una categoría ligada a un tipo ingreso/gasto. No define nombres predeterminados de categorías ni medios; por eso se usan los ejemplos del pedido como datos ilustrativos. El prototipo no incluye PHP, MySQL, servicios de pago, cuentas bancarias ni almacenamiento local.

## Archivos y uso

Abrí `registro-movimientos.html` directamente en un navegador moderno. El CSS y JavaScript se cargan desde archivos locales en la misma carpeta; no se necesitan dependencias externas.
