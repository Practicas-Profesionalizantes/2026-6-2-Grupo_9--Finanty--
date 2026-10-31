# Prototipo de Configuración — Finanty

## Objetivo

Pantalla frontend para demostrar cómo una persona configura la apariencia de Finanty y administra categorías, tipos generales de medios de pago y medios específicos. Conserva la identidad visual verde, clara y dorada de los prototipos de inicio de sesión y registro de movimientos.

## Secciones

- **Apariencia:** temas claro, oscuro y automático. El tema automático sigue `prefers-color-scheme`; si la preferencia del dispositivo no está disponible, usa claro.
- **Categorías:** listas separadas de ingresos y gastos. Las categorías predeterminadas están identificadas y protegidas; las personalizadas pueden agregarse y eliminarse.
- **Tipos y medios de pago:** cada tipo se expande para mostrar sus medios específicos. Los grupos y medios predeterminados están identificados y protegidos; se pueden agregar tipos y medios personalizados.

## Interacciones y validaciones

- Los cambios de tema se aplican de inmediato y la selección se conserva en `localStorage` del navegador.
- Los formularios de alta se abren en un diálogo accesible, con cierre por Escape, botón de cierre y acción Cancelar.
- No se aceptan nombres vacíos. Se rechazan duplicados sin distinguir mayúsculas ni acentos dentro del mismo grupo; los medios se comparan dentro del tipo elegido.
- Las categorías personalizadas se pueden borrar tras confirmación. Los tipos personalizados no se pueden borrar mientras tengan medios asociados. Los medios personalizados solicitan confirmación antes del borrado.
- La demostración no contiene movimientos ni consulta relaciones reales. Los mensajes de confirmación advierten que un movimiento asociado puede impedir el borrado en la aplicación conectada.
- Las listas personalizadas se conservan localmente en el navegador. Si el almacenamiento está bloqueado, los cambios continúan en memoria durante la visita y la pantalla lo informa.
- Las opciones de Inicio, Movimientos y Gráficos son accesos visuales: no abren páginas adicionales.

## Datos de ejemplo y supuestos

El DER define las entidades y sus relaciones, pero no incluye registros de categorías o medios predeterminados. Por eso se usan las listas ilustrativas solicitadas: Sueldo, Trabajos, Ventas y Otros ingresos; Alimentación, Transporte, Vivienda, Salud, Educación, Entretenimiento y Otros gastos; y los ejemplos de billeteras, tarjetas y efectivo.

El esquema limita los nombres de categoría y tipo a 80 caracteres y el nombre de medio específico a 100; se respetan esos límites en los formularios. El documento separado «Definición del Alcance del Sistema - Finanty» no estaba disponible en el espacio de trabajo al crear este prototipo; se tomó como base el alcance resumido en el pedido y el DER existente.

## Limitaciones y uso

Abrí `configuracion.html` directamente en un navegador moderno. La pantalla no usa PHP, MySQL, servicios externos ni integraciones bancarias. Los datos personalizados y el tema solo se guardan en el almacenamiento local de este navegador de demostración; no se modifican cuentas ni movimientos reales.
