<?php
// backend/api/medios_pago.php
header("Content-Type: application/json");
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../utils/validators.php';

$id_usuario = verificarSesionActiva();
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT mp.*, tmp.nombre AS tipo_nombre FROM medios_pago mp 
                               LEFT JOIN tipos_medios_pago tmp ON mp.id_tipo_medio = tmp.id_tipo_medio
                               WHERE mp.id_usuario = :id_usuario ORDER BY mp.nombre ASC");
        $stmt->execute(['id_usuario' => $id_usuario]);
        $medios = $stmt->fetchAll();

        // Obtener los tipos disponibles para los comboboxes de los formularios
        $stmtTipos = $pdo->prepare("SELECT * FROM tipos_medios_pago WHERE id_usuario = :id_usuario OR id_usuario IS NULL");
        $stmtTipos->execute(['id_usuario' => $id_usuario]);

        responderJSON(200, "ok", "Datos de medios cargados.", [
            "medios" => $medios,
            "tipos" => $stmtTipos->fetchAll()
        ]);
    } catch (Exception $e) {
        responderJSON(500, "error", "Error al cargar medios de pago.");
    }
} elseif ($metodo === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!verificarCampos($input, ['nombre', 'id_tipo_medio'])) {
        responderJSON(400, "error", "Campos incompletos.");
    }
    try {
        $stmt = $pdo->prepare("INSERT INTO medios_pago (id_tipo_medio, id_usuario, nombre) VALUES (:id_tipo_medio, :id_usuario, :nombre)");
        $stmt->execute([
            'id_tipo_medio' => $input['id_tipo_medio'],
            'id_usuario' => $id_usuario,
            'nombre' => trim($input['nombre'])
        ]);
        responderJSON(201, "ok", "Medio de pago agregado.");
    } catch (Exception $e) {
        responderJSON(500, "error", "Error al guardar el medio de pago.");
    }
} elseif ($metodo === 'DELETE') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!isset($input['id_medio'])) responderJSON(400, "error", "ID requerido.");
    try {
        $stmt = $pdo->prepare("DELETE FROM medios_pago WHERE id_medio = :id_medio AND id_usuario = :id_usuario");
        $stmt->execute(['id_medio' => $input['id_medio'], 'id_usuario' => $id_usuario]);
        responderJSON(200, "ok", "Medio de pago eliminado.");
    } catch (Exception $e) {
        responderJSON(500, "error", "Error al borrar medio de pago.");
    }
}
