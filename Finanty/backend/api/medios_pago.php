<?php
// backend/api/medios_pago.php
header("Content-Type: application/json");
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../utils/validators.php';

$id_usuario = verificarSesionActiva();
$metodo = $_SERVER['REQUEST_METHOD'];

function mediosPredeterminadosPorTipo() {
    return [
        'Billetera virtual' => ['Mercado Pago', 'Naranja X', 'Cuenta DNI'],
        'Crédito' => ['Banco BBVA', 'Banco Santander', 'Banco Provincia']
    ];
}

function asegurarMediosPredeterminados(PDO $pdo, int $id_usuario) {
    $defaults = mediosPredeterminadosPorTipo();
    $stmt = $pdo->prepare("INSERT INTO medios_pago (id_tipo_medio, id_usuario, nombre)
        SELECT t.id_tipo_medio, :usuario, :nombre FROM tipos_medios_pago t
        WHERE t.nombre = :tipo AND (t.id_usuario = :usuario_tipo OR t.id_usuario IS NULL)
        AND NOT EXISTS (SELECT 1 FROM medios_pago mp WHERE mp.id_usuario = :usuario_existente AND mp.id_tipo_medio = t.id_tipo_medio AND LOWER(mp.nombre) = LOWER(:nombre_existente))");
    foreach ($defaults as $tipo => $nombres) {
        foreach ($nombres as $nombre) {
            $stmt->execute(['usuario' => $id_usuario, 'nombre' => $nombre, 'tipo' => $tipo, 'usuario_tipo' => $id_usuario, 'usuario_existente' => $id_usuario, 'nombre_existente' => $nombre]);
        }
    }
}

function esMedioPredeterminado(array $medio) {
    $defaults = mediosPredeterminadosPorTipo();
    return in_array($medio['nombre'], $defaults[$medio['tipo_nombre'] ?? ''] ?? [], true);
}

if ($metodo === 'GET') {
    try {
        asegurarMediosPredeterminados($pdo, (int)$id_usuario);
        $stmt = $pdo->prepare("SELECT mp.*, tmp.nombre AS tipo_nombre FROM medios_pago mp 
                               LEFT JOIN tipos_medios_pago tmp ON mp.id_tipo_medio = tmp.id_tipo_medio
                               WHERE mp.id_usuario = :id_usuario ORDER BY mp.nombre ASC");
        $stmt->execute(['id_usuario' => $id_usuario]);
        $medios = $stmt->fetchAll();
        foreach ($medios as &$medio) $medio['predeterminado'] = esMedioPredeterminado($medio);
        unset($medio);

        // Obtener los tipos disponibles para los comboboxes de los formularios
        $stmtTipos = $pdo->prepare("SELECT *, (id_usuario IS NULL) AS predeterminado FROM tipos_medios_pago WHERE id_usuario = :id_usuario OR id_usuario IS NULL ORDER BY id_usuario IS NOT NULL, nombre ASC");
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
    if (($input['accion'] ?? '') === 'crear_tipo') {
        if (!verificarCampos($input, ['nombre']) || mb_strlen(trim($input['nombre'])) > 50 || trim($input['nombre']) === '') {
            responderJSON(400, "error", "Ingresá un nombre de hasta 50 caracteres para el tipo.");
        }
        try {
            $nombre = trim($input['nombre']);
            $stmt = $pdo->prepare("SELECT id_tipo_medio FROM tipos_medios_pago WHERE (id_usuario = :usuario OR id_usuario IS NULL) AND LOWER(nombre) = LOWER(:nombre)");
            $stmt->execute(['usuario' => $id_usuario, 'nombre' => $nombre]);
            if ($stmt->fetch()) responderJSON(409, "error", "Ya existe un tipo con ese nombre.");
            $stmt = $pdo->prepare("INSERT INTO tipos_medios_pago (id_usuario, nombre) VALUES (:usuario, :nombre)");
            $stmt->execute(['usuario' => $id_usuario, 'nombre' => $nombre]);
            responderJSON(201, "ok", "Tipo de medio de pago creado.");
        } catch (Exception $e) { responderJSON(500, "error", "No se pudo crear el tipo de medio de pago."); }
    }
    if (!verificarCampos($input, ['nombre', 'id_tipo_medio'])) {
        responderJSON(400, "error", "Campos incompletos.");
    }
    if (mb_strlen(trim($input['nombre'])) > 50 || !ctype_digit((string)$input['id_tipo_medio'])) {
        responderJSON(400, "error", "Revisá el nombre y el tipo de medio de pago.");
    }
    try {
        $stmtTipo = $pdo->prepare("SELECT id_tipo_medio FROM tipos_medios_pago WHERE id_tipo_medio = :tipo AND (id_usuario = :id_usuario OR id_usuario IS NULL)");
        $stmtTipo->execute(['tipo' => $input['id_tipo_medio'], 'id_usuario' => $id_usuario]);
        if (!$stmtTipo->fetch()) responderJSON(400, "error", "El tipo de medio de pago no es válido.");
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
    if (($input['accion'] ?? '') === 'eliminar_tipo') {
        if (!isset($input['id_tipo_medio']) || !ctype_digit((string)$input['id_tipo_medio'])) responderJSON(400, "error", "Seleccioná un tipo válido.");
        try {
            $id_tipo = (int)$input['id_tipo_medio'];
            $stmt = $pdo->prepare("SELECT id_tipo_medio FROM tipos_medios_pago WHERE id_tipo_medio = :tipo AND id_usuario = :usuario");
            $stmt->execute(['tipo' => $id_tipo, 'usuario' => $id_usuario]);
            if (!$stmt->fetch()) responderJSON(403, "error", "Solo podés eliminar tipos personalizados de tu cuenta.");
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM movimientos m INNER JOIN medios_pago mp ON mp.id_medio = m.id_medio WHERE mp.id_tipo_medio = :tipo AND mp.id_usuario = :usuario");
            $stmt->execute(['tipo' => $id_tipo, 'usuario' => $id_usuario]);
            if ((int)$stmt->fetchColumn() > 0) responderJSON(409, "error", "No se puede eliminar: hay movimientos que usan este tipo.");
            $stmt = $pdo->prepare("DELETE FROM tipos_medios_pago WHERE id_tipo_medio = :tipo AND id_usuario = :usuario");
            $stmt->execute(['tipo' => $id_tipo, 'usuario' => $id_usuario]);
            responderJSON(200, "ok", "Tipo de medio de pago eliminado.");
        } catch (Exception $e) { responderJSON(500, "error", "No se pudo eliminar el tipo."); }
    }
    if (!isset($input['id_medio'])) responderJSON(400, "error", "ID requerido.");
    try {
        $stmt = $pdo->prepare("SELECT mp.nombre, tmp.nombre AS tipo_nombre FROM medios_pago mp LEFT JOIN tipos_medios_pago tmp ON tmp.id_tipo_medio = mp.id_tipo_medio WHERE mp.id_medio = :id AND mp.id_usuario = :usuario");
        $stmt->execute(['id' => $input['id_medio'], 'usuario' => $id_usuario]);
        $medio = $stmt->fetch();
        if ($medio && esMedioPredeterminado($medio)) responderJSON(403, "error", "Los medios de pago incluidos no se pueden eliminar.");
        $stmt = $pdo->prepare("DELETE FROM medios_pago WHERE id_medio = :id_medio AND id_usuario = :id_usuario");
        $stmt->execute(['id_medio' => $input['id_medio'], 'id_usuario' => $id_usuario]);
        responderJSON(200, "ok", "Medio de pago eliminado.");
    } catch (Exception $e) {
        responderJSON(500, "error", "Error al borrar medio de pago.");
    }
} else { responderJSON(405, "error", "Método no permitido."); }
