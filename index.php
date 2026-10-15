<?php
// index.php
require_once 'conexion.php';

// Traemos los usuarios de tu tabla real
$consulta = $pdo->query("SELECT id_usuario, nombre, email, tema_preferido, fecha_registro FROM usuarios");
$usuarios = $consulta->fetchAll();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Finanty - Panel de Usuarios</title>
    <style>
        body { font-family: sans-serif; background-color: #f4f7f6; margin: 40px; }
        table { width: 100%; border-collapse: collapse; background: #fff; }
        th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #34495e; color: white; }
        .no-data { text-align: center; color: #7f8c8d; font-style: italic; padding: 20px; }
    </style>
</head>
<body>

    <h1>📋 Usuarios en finanty_db</h1>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Tema</th>
                <th>Registro</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($usuarios)): ?>
                <tr>
                    <td colspan="5" class="no-data">No hay usuarios. ¡Agrega uno desde phpMyAdmin para probar!</td>
                </tr>
            <?php else: ?>
                <?php foreach ($usuarios as $u): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($u['id_usuario']); ?></td>
                        <td><?php echo htmlspecialchars($u['nombre']); ?></td>
                        <td><?php echo htmlspecialchars($u['email']); ?></td>
                        <td><?php echo htmlspecialchars($u['tema_preferido']); ?></td>
                        <td><?php echo htmlspecialchars($u['fecha_registro']); ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>

</body>
</html>
