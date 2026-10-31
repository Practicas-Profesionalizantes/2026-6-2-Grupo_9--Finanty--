<?php
// backend/auth/login.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header("Content-Type: application/json");
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../utils/validators.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJSON(405, "error", "Método no permitido.");
}

$input = json_decode(file_get_contents("php://input"), true);

if (!verificarCampos($input, ['email', 'password'])) {
    responderJSON(400, "error", "Email y contraseña requeridos.");
}

$email = trim($input['email']);
$password = $input['password'];

try {
    $stmt = $pdo->prepare("SELECT id_usuario, nombre, password_hash, tema_preferido FROM usuarios WHERE email = :email");
    $stmt->execute(['email' => $email]);
    $usuario = $stmt->fetch();

    if (!$usuario || !password_verify($password, $usuario['password_hash'])) {
        responderJSON(401, "error", "Credenciales incorrectas.");
    }

    session_regenerate_id(true);
    $_SESSION['id_usuario'] = $usuario['id_usuario'];
    $_SESSION['nombre'] = $usuario['nombre'];
    $_SESSION['tema'] = $usuario['tema_preferido'];

    responderJSON(200, "ok", "Inicio de sesión exitoso.", [
        "usuario" => [
            "nombre" => $usuario['nombre'],
            "tema" => $usuario['tema_preferido']
        ]
    ]);
} catch (Exception $e) {
    responderJSON(500, "error", "Error interno al procesar el ingreso.");
}
