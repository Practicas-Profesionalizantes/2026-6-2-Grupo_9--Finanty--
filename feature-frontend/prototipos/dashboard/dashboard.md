# Dashboard de Finanty

## Objetivo y contenido

Pantalla principal frontend para resumir los ingresos, los gastos y los movimientos recientes de Finanty. Mantiene la identidad verde, clara y dorada de los prototipos anteriores y no agrega presupuestos, saldos bancarios, inversiones ni integraciones externas.

Incluye navegación superior, bienvenida, acceso directo para registrar un movimiento, aviso visible de datos ficticios, totales del período, gráfico comparativo, distribución de gastos por categoría y seis movimientos recientes con fecha, descripción, categoría, tipo, importe, medio específico y su tipo general.

## Datos y gráficos

El conjunto de datos está definido una sola vez en `dashboard.js`. Contiene nueve movimientos ficticios de octubre de 2026: dos ingresos por **$735.000,00 ARS** en total y siete gastos por **$319.000,00 ARS** en total.

- **Ingresos vs. gastos:** barras comparables con valores formateados en pesos argentinos; la escala usa el total mayor del período.
- **Gastos por categoría:** suma los movimientos de gasto por categoría y muestra importe y porcentaje del total. Las sumas coinciden con la tarjeta de gastos.
- **Movimientos recientes:** ordena los registros por fecha y hora y presenta los seis más nuevos.

Los importes y movimientos son ejemplos de interfaz. No pertenecen a una cuenta real ni se consultan desde MySQL.

## Navegación y tema

El enlace **Registrar** y el botón principal abren el prototipo disponible en `../registro-movimientos/registro-movimientos.html`. **Configuración** abre `../configuracion/configuracion.html`. Las vistas de consulta **Movimientos** y **Gráficos** todavía no están disponibles; sus accesos muestran un aviso de integración pendiente.

El Dashboard lee la misma clave y los valores usados por Configuración: `finanty.configuration.theme.v1` con `light`, `dark` o `auto`. En modo automático consulta `prefers-color-scheme`. Si no encuentra una preferencia compartida, muestra el tema claro. No modifica ni borra la preferencia.

## Limitaciones y uso

Abrí `dashboard.html` directamente en un navegador moderno. Los estilos, el JavaScript y los enlaces a los otros prototipos son locales; no se requieren dependencias externas. Esta pantalla no implementa autenticación, consultas, guardado de movimientos ni conexión con PHP o MySQL.

El documento separado «Definición del Alcance del Sistema - Finanty» no estaba disponible en el espacio de trabajo. Se usó el alcance detallado en el pedido, el DER y los prototipos existentes como referencia.
