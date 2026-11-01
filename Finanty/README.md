# Finanty · carpeta para presentar

Aplicación local de finanzas personales con registro e inicio de sesión, resumen estadístico, movimientos, categorías, medios de pago y tema claro/oscuro.

## Inicio rápido en cualquier PC con XAMPP

1. Copiá o extraé toda esta carpeta en la computadora (por ejemplo, en el Escritorio).
2. Hacé doble clic en `ABRIR_FINANTY.bat`.
3. Si MySQL está apagado, se abrirá XAMPP: iniciá MySQL y volvé a la ventana de Finanty; presioná Enter cuando lo indique.
4. En la primera ejecución de esa PC, el acceso busca `mysql.exe` y prepara automáticamente `finanty_db` con el esquema incluido. Si la base ya tiene tablas, no la modifica.
5. El navegador abre la aplicación en una dirección `http://127.0.0.1:puerto/`. No abras los HTML con doble clic ni uses Go Live: esas opciones no ejecutan PHP.

El lanzador busca XAMPP en ubicaciones comunes y también acepta `FINANTY_XAMPP` o `FINANTY_PHP` si está instalado en otra carpeta. MySQL usa por defecto usuario `root` sin contraseña, como viene configurado XAMPP en muchas instalaciones. Si la PC del colegio tiene otra configuración, definí `FINANTY_DB_HOST`, `FINANTY_DB_PORT`, `FINANTY_DB_USER`, `FINANTY_DB_PASSWORD` y, si hace falta, `FINANTY_XAMPP` antes de iniciar.

## Cuentas y datos entre computadoras

La base de datos se guarda localmente en cada computadora; no se sincroniza por copiar la carpeta. La primera vez en la PC del colegio, creá una cuenta nueva desde el registro. Para llevar también movimientos existentes, hay que exportar la base de datos de una computadora e importarla en la otra. Las sesiones del navegador tampoco se trasladan: en cada computadora hay que iniciar sesión.

## Funciones

- Crear cuenta, iniciar sesión y cerrar sesión.
- Ver ingresos, gastos, balance, gráficos circulares y actividad reciente.
- Agregar, filtrar por fechas, categoría y medio de pago, editar y eliminar movimientos.
- Crear y eliminar categorías, tipos de medios de pago personalizados y medios de pago específicos.
- Incluye Mercado Pago, Naranja X, Cuenta DNI y tarjetas BBVA, Santander y Provincia.
- Guardar la preferencia de tema por cuenta.

Los gráficos se dibujan con SVG integrado en la página y no requieren descargar una librería desde internet.

## Si no conecta

- Asegurate de que MySQL esté iniciado en XAMPP.
- En el primer uso, verificá que se haya importado `database/finanty_db.sql` en la base `finanty_db`. Si el cliente `mysql.exe` no está disponible, importá ese archivo desde phpMyAdmin.
- Si aparece que venció la sesión, iniciá sesión otra vez en esa PC. Las sesiones son propias de cada navegador y computadora.
- Si el navegador no se abre, revisá `data/php-server-error.log` para ver el mensaje del servidor PHP.
