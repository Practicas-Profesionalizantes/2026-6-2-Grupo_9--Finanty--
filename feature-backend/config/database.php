<?php
// config/database.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class Database {
    private $host = "localhost";
    private $db_name = "finanty_db";
    private $username = "root";
    private $password = "";
    private $charset = "utf8mb4";
    private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $exception) {
            error_log("Error de conexión: " . $exception->getMessage());
            http_response_code(500);
            echo json_encode(["status" => "error", "mensaje" => "Error de conexión a la base de datos."]);
            exit;
        }
        return $this->conn;
    }
}

$database = new Database();
$pdo = $database->getConnection();
