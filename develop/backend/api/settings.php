<?php
// backend/api/settings.php
header("Content-Type: application/json");
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../utils/validators.php';

$id_usuario = verificarSesionActiva();
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!isset($input['tema']) || !in_array($input['tema'], ['claro', 'oscuro', 'automatico'])) {
        responderJSON(400, "error", "Tema inválido.");
    }
    try {
        $stmt = $pdo->prepare("UPDATE usuarios SET tema_preferido = :tema WHERE id_usuario = :id_usuario");
        $stmt->execute(['tema' => $input['tema'], 'id_usuario' => $id_usuario]);
        $_SESSION['tema'] = $input['tema'];
        responderJSON(200, "ok", "Preferencia de tema guardada en base de datos.");
    } catch (Exception $e) {
        responderJSON(500, "error", "Error al actualizar preferencias.");
    }
} else {
    responderJSON(200, "ok", "Configuración actual.", ["tema" => $_SESSION['tema'] ?? 'automatico']);
}
