<?php
// backend/auth/register.php
header("Content-Type: application/json");
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../utils/validators.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJSON(405, "error", "Método no permitido.");
}

$input = json_decode(file_get_contents("php://input"), true);

if (!verificarCampos($input, ['nombre', 'email', 'password'])) {
    responderJSON(400, "error", "Todos los campos son obligatorios.");
}

$nombre = trim($input['nombre']);
$email = trim($input['email']);
$password = $input['password'];

if (!validarEmail($email)) {
    responderJSON(400, "error", "El formato del correo electrónico es inválido.");
}
if (mb_strlen($nombre) > 100 || strlen($password) < 8) {
    responderJSON(400, "error", "Usá un nombre de hasta 100 caracteres y una contraseña de al menos 8.");
}

try {
    // Verificar duplicados (RF01.2)
    $stmtCheck = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE email = :email");
    $stmtCheck->execute(['email' => $email]);
    if ($stmtCheck->fetch()) {
        responderJSON(400, "error", "El correo electrónico ya se encuentra registrado.");
    }

    // Encriptación (RF01.3)
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    $pdo->beginTransaction();
    $stmtInsert = $pdo->prepare("INSERT INTO usuarios (nombre, email, password_hash) VALUES (:nombre, :email, :password_hash)");
    $stmtInsert->execute([
        'nombre' => $nombre,
        'email' => $email,
        'password_hash' => $password_hash
    ]);

    $id_usuario = (int)$pdo->lastInsertId();
    $stmtCategorias = $pdo->prepare("INSERT INTO categorias (id_usuario, nombre, tipo) VALUES (:id_usuario, :nombre, :tipo)");
    foreach ([['Sueldo', 'ingreso'], ['Ventas', 'ingreso'], ['Otros ingresos', 'ingreso'], ['Alimentación', 'gasto'], ['Transporte', 'gasto'], ['Servicios', 'gasto'], ['Otros gastos', 'gasto']] as [$categoria, $tipo]) {
        $stmtCategorias->execute(['id_usuario' => $id_usuario, 'nombre' => $categoria, 'tipo' => $tipo]);
    }
    $pdo->commit();

    responderJSON(201, "ok", "Usuario registrado exitosamente.");
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    responderJSON(500, "error", "Error interno al procesar el registro.");
}
