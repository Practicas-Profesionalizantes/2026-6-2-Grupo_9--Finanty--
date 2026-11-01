<?php
// Keep PHP sessions inside this project so the standalone launcher can run
// without relying on XAMPP's global temporary directory permissions.
$sessionPath = __DIR__ . '/../data/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0775, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}
if (session_status() === PHP_SESSION_NONE) {
    // The login endpoint and the API live in different folders. An explicit
    // cookie path ensures the browser sends the same session to both.
    session_name('FINANTYSESSID');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}
