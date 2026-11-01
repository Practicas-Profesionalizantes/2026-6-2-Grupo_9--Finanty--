<?php
// backend/api/movimientos.php
header("Content-Type: application/json");
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../utils/validators.php';

$id_usuario = verificarSesionActiva();
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        // Carga consolidada y listado con filtros (RF02.2, RF05.1, RF05.2, RF05.3)
        try {
            $filtro_cat = isset($_GET['cat']) && $_GET['cat'] !== '' ? intval($_GET['cat']) : null;
            $filtro_medio = isset($_GET['medio']) && $_GET['medio'] !== '' ? intval($_GET['medio']) : null;
            $desde = isset($_GET['desde']) && $_GET['desde'] !== '' ? $_GET['desde'] : null;
            $hasta = isset($_GET['hasta']) && $_GET['hasta'] !== '' ? $_GET['hasta'] : null;
            
            $sql = "SELECT m.*, c.nombre AS categoria_nombre, c.tipo AS categoria_tipo, mp.nombre AS medio_nombre 
                    FROM movimientos m
                    LEFT JOIN categorias c ON m.id_categoria = c.id_categoria
                    LEFT JOIN medios_pago mp ON m.id_medio = mp.id_medio
                    WHERE m.id_usuario = :id_usuario";
            
            $params = ['id_usuario' => $id_usuario];
            if ($filtro_cat) { $sql .= " AND m.id_categoria = :cat"; $params['cat'] = $filtro_cat; }
            if ($filtro_medio) { $sql .= " AND m.id_medio = :medio"; $params['medio'] = $filtro_medio; }
            if ($desde && preg_match('/^\\d{4}-\\d{2}-\\d{2}$/', $desde)) { $sql .= " AND m.fecha >= :desde"; $params['desde'] = $desde . ' 00:00:00'; }
            if ($hasta && preg_match('/^\\d{4}-\\d{2}-\\d{2}$/', $hasta)) { $sql .= " AND m.fecha < DATE_ADD(:hasta, INTERVAL 1 DAY)"; $params['hasta'] = $hasta; }
            $sql .= " ORDER BY m.fecha DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $movimientos = $stmt->fetchAll();

            // Calcular totales agregados en tiempo real para el Dashboard (RF05.1)
            $total_ingresos = 0;
            $total_gastos = 0;
            foreach ($movimientos as $m) {
                if ($m['tipo'] === 'ingreso') $total_ingresos += $m['monto'];
                else if ($m['tipo'] === 'gasto') $total_gastos += $m['monto'];
            }

            responderJSON(200, "ok", "Datos obtenidos.", [
                "movimientos" => $movimientos,
                "resumen" => [
                    "ingresos" => $total_ingresos,
                    "gastos" => $total_gastos,
                    "balance" => $total_ingresos - $total_gastos
                ]
            ]);
        } catch (Exception $e) {
            responderJSON(500, "error", "Error al recuperar movimientos.");
        }
        break;

    case 'POST':
        // Registrar movimiento (RF02.1)
        $input = json_decode(file_get_contents("php://input"), true);
        if (!verificarCampos($input, ['tipo', 'monto', 'id_categoria', 'id_medio', 'fecha'])) {
            responderJSON(400, "error", "Faltan campos obligatorios.");
        }
        if (!in_array($input['tipo'], ['ingreso', 'gasto'], true) || !is_numeric($input['monto']) || (float)$input['monto'] <= 0) {
            responderJSON(400, "error", "El tipo debe ser ingreso o gasto y el monto debe ser mayor que cero.");
        }
        try {
            $stmtValida = $pdo->prepare("SELECT (SELECT COUNT(*) FROM categorias WHERE id_categoria = :categoria AND id_usuario = :usuario_categoria AND tipo = :tipo) AS categoria_ok, (SELECT COUNT(*) FROM medios_pago WHERE id_medio = :medio AND id_usuario = :usuario_medio) AS medio_ok");
            $stmtValida->execute(['categoria' => $input['id_categoria'], 'usuario_categoria' => $id_usuario, 'tipo' => $input['tipo'], 'medio' => $input['id_medio'], 'usuario_medio' => $id_usuario]);
            $validacion = $stmtValida->fetch();
            if (!$validacion['categoria_ok'] || !$validacion['medio_ok']) responderJSON(400, "error", "Elegí una categoría y un medio de pago de tu cuenta.");
            $stmt = $pdo->prepare("INSERT INTO movimientos (id_usuario, id_categoria, id_medio, tipo, monto, comercio, fecha) 
                                   VALUES (:id_usuario, :id_categoria, :id_medio, :tipo, :monto, :comercio, :fecha)");
            $stmt->execute([
                'id_usuario' => $id_usuario,
                'id_categoria' => $input['id_categoria'],
                'id_medio' => $input['id_medio'],
                'tipo' => $input['tipo'],
                'monto' => $input['monto'],
                'comercio' => $input['comercio'] ?? '',
                'fecha' => $input['fecha']
            ]);
            responderJSON(201, "ok", "Movimiento registrado.");
        } catch (Exception $e) {
            responderJSON(500, "error", "Error al guardar movimiento.");
        }
        break;

    case 'PUT':
        // Editar movimiento (RF02.3)
        $input = json_decode(file_get_contents("php://input"), true);
        if (!verificarCampos($input, ['id_movimiento', 'tipo', 'monto', 'id_categoria', 'id_medio', 'fecha'])) {
            responderJSON(400, "error", "Campos incompletos para actualizar.");
        }
        if (!in_array($input['tipo'], ['ingreso', 'gasto'], true) || !is_numeric($input['monto']) || (float)$input['monto'] <= 0) {
            responderJSON(400, "error", "El tipo debe ser ingreso o gasto y el monto debe ser mayor que cero.");
        }
        try {
            $stmtValida = $pdo->prepare("SELECT (SELECT COUNT(*) FROM categorias WHERE id_categoria = :categoria AND id_usuario = :usuario_categoria AND tipo = :tipo) AS categoria_ok, (SELECT COUNT(*) FROM medios_pago WHERE id_medio = :medio AND id_usuario = :usuario_medio) AS medio_ok");
            $stmtValida->execute(['categoria' => $input['id_categoria'], 'usuario_categoria' => $id_usuario, 'tipo' => $input['tipo'], 'medio' => $input['id_medio'], 'usuario_medio' => $id_usuario]);
            $validacion = $stmtValida->fetch();
            if (!$validacion['categoria_ok'] || !$validacion['medio_ok']) responderJSON(400, "error", "Elegí una categoría y un medio de pago de tu cuenta.");
            $stmt = $pdo->prepare("UPDATE movimientos SET id_categoria = :id_categoria, id_medio = :id_medio, tipo = :tipo, monto = :monto, comercio = :comercio, fecha = :fecha 
                                   WHERE id_movimiento = :id_movimiento AND id_usuario = :id_usuario");
            $stmt->execute([
                'id_categoria' => $input['id_categoria'],
                'id_medio' => $input['id_medio'],
                'tipo' => $input['tipo'],
                'monto' => $input['monto'],
                'comercio' => $input['comercio'] ?? '',
                'fecha' => $input['fecha'],
                'id_movimiento' => $input['id_movimiento'],
                'id_usuario' => $id_usuario
            ]);
            responderJSON(200, "ok", "Movimiento actualizado.");
        } catch (Exception $e) {
            responderJSON(500, "error", "Error al modificar movimiento.");
        }
        break;

    case 'DELETE':
        // Eliminar movimiento (RF02.3)
        $input = json_decode(file_get_contents("php://input"), true);
        if (!isset($input['id_movimiento'])) {
            responderJSON(400, "error", "ID de movimiento requerido.");
        }
        try {
            $stmt = $pdo->prepare("DELETE FROM movimientos WHERE id_movimiento = :id_movimiento AND id_usuario = :id_usuario");
            $stmt->execute(['id_movimiento' => $input['id_movimiento'], 'id_usuario' => $id_usuario]);
            responderJSON(200, "ok", "Movimiento eliminado.");
        } catch (Exception $e) {
            responderJSON(500, "error", "Error al eliminar movimiento.");
        }
        break;

    default:
        responderJSON(405, "error", "Método no soportado.");
        break;
}
