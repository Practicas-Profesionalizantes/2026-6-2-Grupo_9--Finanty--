<?php
// backend/api/categorias.php
header("Content-Type: application/json");
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../utils/validators.php';

$id_usuario = verificarSesionActiva();
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT * FROM categorias WHERE id_usuario = :id_usuario ORDER BY nombre ASC");
        $stmt->execute(['id_usuario' => $id_usuario]);
        responderJSON(200, "ok", "Categorías obtenidas.", ["categorias" => $stmt->fetchAll()]);
    } catch (Exception $e) {
        responderJSON(500, "error", "Error al consultar categorías.");
    }
} elseif ($metodo === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!verificarCampos($input, ['nombre', 'tipo'])) {
        responderJSON(400, "error", "Nombre y tipo requeridos.");
    }
    try {
        $stmt = $pdo->prepare("INSERT INTO categorias (id_usuario, nombre, tipo) VALUES (:id_usuario, :nombre, :tipo)");
        $stmt->execute(['id_usuario' => $id_usuario, 'nombre' => trim($input['nombre']), 'tipo' => $input['tipo']]);
        responderJSON(201, "ok", "Categoría personalizada creada.");
    } catch (Exception $e) {
        responderJSON(500, "error", "Error al crear categoría.");
    }
} elseif ($metodo === 'DELETE') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!isset($input['id_categoria'])) responderJSON(400, "error", "ID requerido.");
    try {
        $stmt = $pdo->prepare("DELETE FROM categorias WHERE id_categoria = :id_categoria AND id_usuario = :id_usuario");
        $stmt->execute(['id_categoria' => $input['id_categoria'], 'id_usuario' => $id_usuario]);
        responderJSON(200, "ok", "Categoría eliminada.");
    } catch (Exception $e) {
        responderJSON(500, "error", "Error al borrar categoría.");
    }
}
