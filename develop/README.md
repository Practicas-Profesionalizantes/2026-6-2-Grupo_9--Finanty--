# Finanty

Aplicación de finanzas personales en PHP, MySQL/MariaDB, HTML, CSS y JavaScript. La interfaz usa la paleta verde y dorada de los prototipos incluidos en el otro ZIP.

## Puesta en marcha local

1. Instalar PHP con PDO MySQL y MySQL o MariaDB (por ejemplo, mediante XAMPP).
2. Crear una base de datos llamada `finanty_db` y luego importar `database/finanty_db.sql` dentro de ella. El archivo crea las tablas e incluye los medios de pago iniciales.
3. Si tu servidor usa otras credenciales, ajustar `config/database.php`.
4. Colocar la carpeta `finanty` dentro de la carpeta pública del servidor y abrir `http://localhost/finanty/`.
5. Crear una cuenta desde **Registrate aquí**. El alta inicializa categorías y medios de pago para esa cuenta.

No abrir las páginas HTML con `file://`: PHP y las sesiones deben servirse desde el mismo servidor web.
