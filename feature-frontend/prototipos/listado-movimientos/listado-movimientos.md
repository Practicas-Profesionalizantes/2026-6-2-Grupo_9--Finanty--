# Listado de movimientos de Finanty

## Objetivo

Prototipo frontend para consultar ingresos y gastos mediante filtros combinables. Mantiene la navegación, paleta, tipografía del sistema y preferencia de tema compartida de los prototipos existentes. Los registros son ficticios y no representan datos de una cuenta.

## Listado y filtros

La tabla de escritorio y las tarjetas adaptables muestran fecha y hora, comercio o descripción, categoría, tipo de medio de pago, medio específico, tipo de movimiento, importe en ARS y acciones. El listado comienza ordenado del más reciente al más antiguo; el selector permite invertir el orden.

Los filtros incluyen búsqueda por descripción, tipo (ingreso/gasto), fechas desde/hasta, categoría, tipo de medio y medio específico. La búsqueda ignora mayúsculas y tildes. Los criterios seleccionados se aplican juntos al pulsar **Aplicar filtros**. Los límites de fecha se incluyen. Una fecha inicial posterior a la final muestra validación y no actualiza la consulta. El selector de medio específico depende del tipo y reinicia cualquier selección que deje de ser compatible. **Limpiar filtros** vuelve a mostrar todos los movimientos. El contador acompaña cada resultado y la lista explica cuando no hay coincidencias.

## Datos y acciones

`listado-movimientos.js` mantiene un único arreglo de 21 movimientos ficticios con fechas variadas, ingresos y gastos, las categorías de Configuración y los tres grupos de medios previstos en Registro. La búsqueda, el orden y todas las acciones operan sobre ese conjunto local.

- **Consultar:** abre un diálogo con los campos completos.
- **Modificar:** abre un formulario validado; actualizar tipo de movimiento o tipo de pago ajusta las opciones compatibles.
- **Eliminar:** solicita confirmación antes de quitar el ejemplo de la lista.

Los cambios de edición y eliminación duran solo durante la visita a esta página. No se escriben en `localStorage`, PHP ni MySQL.

## Archivos y uso

Abrí `listado-movimientos.html` en un navegador moderno. El HTML enlaza `listado-movimientos.css` y `listado-movimientos.js`, y los accesos a Dashboard, Registro y Configuración usan rutas locales del proyecto. La preferencia `finanty.configuration.theme.v1` se lee para respetar el tema compartido; esta pantalla no la modifica. La sección Gráficos muestra un aviso de integración pendiente. `listado-movimientos.png` es una captura renderizada en Chrome a 1440 px de ancho y revisada visualmente.

## Limitaciones y decisiones

No se encontró en el espacio de trabajo un archivo separado llamado **Definición del Alcance del Sistema - Finanty**. Se consultaron el pedido, el DER y las pantallas existentes, en particular las categorías y los tipos/medios de Configuración y Registro. Este prototipo no implementa autenticación, persistencia, acceso a usuarios, consulta real, exportación ni conexión con bancos, billeteras, PHP o MySQL.
