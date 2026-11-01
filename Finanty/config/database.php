<?php
// config/database.php
require_once __DIR__ . '/session.php';

class Database {
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    private $charset = "utf8mb4";
    private $conn;

    public function __construct() {
        // Si existen variables de entorno, se usan.
        // Si no, se toman los valores de InfinityFree indicados abajo.
        $this->host = getenv('FINANTY_DB_HOST') ?: 'sql112.infinityfree.com';
        $this->port = getenv('FINANTY_DB_PORT') ?: '3306';
        $this->db_name = getenv('FINANTY_DB_NAME') ?: 'if0_43329575_finanty_db';
        $this->username = getenv('FINANTY_DB_USER') ?: 'if0_43329575';
        $this->password = getenv('FINANTY_DB_PASSWORD') ?: 'ESCRIBI_TU_CONTRASENA_DEL_PANEL';
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host
                 . ";port=" . $this->port
                 . ";dbname=" . $this->db_name
                 . ";charset=" . $this->charset;

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            $this->conn = new PDO(
                $dsn,
                $this->username,
                $this->password,
                $options
            );

        } catch (PDOException $exception) {
            error_log("Error de conexión con MySQL: " . $exception->getMessage());

            http_response_code(500);

            $message = 'No se pudo conectar con la base de datos. Revisá los datos de conexión del hosting.';

            if (strpos($exception->getMessage(), 'Unknown database') !== false) {
                $message = 'No se encontró la base de datos indicada en la configuración.';
            }

            echo json_encode(
                ["status" => "error", "mensaje" => $message],
                JSON_UNESCAPED_UNICODE
            );
            exit;
        }

        return $this->conn;
    }
}

$database = new Database();
$pdo = $database->getConnection();