<?php
// backend/utils/validators.php
require_once __DIR__ . '/../../config/session.php';

function verificarCampos($datos, $camposRequeridos) {
    foreach ($camposRequeridos as $campo) {
        if (!isset($datos[$campo]) || trim((string)$datos[$campo]) === '') {
            return false;
        }
    }
    return true;
}

function validarEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function responderJSON($codigo, $status, $mensaje, $extra = []) {
    http_response_code($codigo);
    echo json_encode(array_merge(["status" => $status, "mensaje" => $mensaje], $extra));
    exit;
}

function verificarSesionActiva() {
    if (!isset($_SESSION['id_usuario'])) {
        responderJSON(401, "error", "Sesión no activa o expirada.");
    }
    return $_SESSION['id_usuario'];
}
