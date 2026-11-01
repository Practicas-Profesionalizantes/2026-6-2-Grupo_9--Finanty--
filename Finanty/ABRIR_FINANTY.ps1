$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$databaseName = if ($env:FINANTY_DB_NAME) { $env:FINANTY_DB_NAME } else { 'finanty_db' }
$dbHost = if ($env:FINANTY_DB_HOST) { $env:FINANTY_DB_HOST } else { '127.0.0.1' }
$dbPort = if ($env:FINANTY_DB_PORT) { [int]$env:FINANTY_DB_PORT } else { 3306 }
$dbUser = if ($env:FINANTY_DB_USER) { $env:FINANTY_DB_USER } else { 'root' }
$port = if ($env:FINANTY_APP_PORT) { [int]$env:FINANTY_APP_PORT } else { 8085 }

if ($databaseName -notmatch '^[A-Za-z0-9_]+$') { throw 'El nombre FINANTY_DB_NAME solo puede contener letras, números y guion bajo.' }

$xamppCandidates = @()
if ($env:FINANTY_XAMPP) { $xamppCandidates += $env:FINANTY_XAMPP }
$xamppCandidates += @('C:\xampp', 'D:\xampp', 'C:\tools\xampp', (Join-Path $env:ProgramFiles 'xampp'))
$xamppRoot = $xamppCandidates | Where-Object { Test-Path (Join-Path $_ 'php\php.exe') } | Select-Object -First 1
$php = if ($env:FINANTY_PHP -and (Test-Path $env:FINANTY_PHP)) { $env:FINANTY_PHP } elseif ($xamppRoot) { Join-Path $xamppRoot 'php\php.exe' } else { (Get-Command php.exe -ErrorAction SilentlyContinue).Source }
if (-not $php) {
    Write-Host 'No encontré PHP. Instalá XAMPP o indicá dónde está con FINANTY_XAMPP.' -ForegroundColor Red
    if ($xamppRoot) { Start-Process (Join-Path $xamppRoot 'xampp-control.exe') }
    Read-Host 'Presioná Enter para cerrar'
    exit 1
}

function Test-Port([string]$hostName, [int]$portNumber) {
    $client = [System.Net.Sockets.TcpClient]::new()
    try { $client.Connect($hostName, $portNumber); return $true } catch { return $false } finally { $client.Dispose() }
}

if (-not (Test-Port $dbHost $dbPort)) {
    $control = if ($xamppRoot) { Join-Path $xamppRoot 'xampp-control.exe' } else { $null }
    if ($control -and (Test-Path $control)) {
        Write-Host 'MySQL está apagado. Abrí XAMPP; iniciá MySQL y volvé a esta ventana.' -ForegroundColor Yellow
        Start-Process $control
    } else {
        Write-Host "MySQL no responde en ${dbHost}:$dbPort. Iniciá MySQL en el servidor instalado en esta computadora." -ForegroundColor Red
    }
    Read-Host 'Cuando MySQL esté iniciado, presioná Enter para volver a comprobarlo'
    if (-not (Test-Port $dbHost $dbPort)) { throw "MySQL sigue sin responder en ${dbHost}:$dbPort." }
}

$mysql = $null
if ($xamppRoot -and (Test-Path (Join-Path $xamppRoot 'mysql\bin\mysql.exe'))) { $mysql = Join-Path $xamppRoot 'mysql\bin\mysql.exe' }
if (-not $mysql) { $mysql = (Get-Command mysql.exe -ErrorAction SilentlyContinue).Source }
if ($mysql) {
    if ($env:FINANTY_DB_PASSWORD) { $env:MYSQL_PWD = $env:FINANTY_DB_PASSWORD }
    function Invoke-FinantyMysql([string]$arguments, [string]$inputText = '') {
        $info = [System.Diagnostics.ProcessStartInfo]::new()
        $info.FileName = $mysql
        $info.Arguments = $arguments
        $info.UseShellExecute = $false
        $info.RedirectStandardInput = $true
        $info.RedirectStandardOutput = $true
        $info.RedirectStandardError = $true
        $info.CreateNoWindow = $true
        $process = [System.Diagnostics.Process]::new()
        $process.StartInfo = $info
        [void]$process.Start()
        if ($inputText) { $process.StandardInput.Write($inputText) }
        $process.StandardInput.Close()
        $stdout = $process.StandardOutput.ReadToEnd()
        $stderr = $process.StandardError.ReadToEnd()
        $process.WaitForExit()
        if ($process.ExitCode -ne 0) { throw "MySQL no aceptó la configuración. Revisá usuario/contraseña. $stderr" }
        return $stdout.Trim()
    }
    $query = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$databaseName'"
    $tableCount = Invoke-FinantyMysql "--host=`"$dbHost`" --port=$dbPort --user=`"$dbUser`" --batch --skip-column-names --execute=`"$query`""
    if ([int]$tableCount -eq 0) {
        Write-Host "Preparando la base $databaseName con el esquema incluido..." -ForegroundColor Cyan
        [void](Invoke-FinantyMysql "--host=`"$dbHost`" --port=$dbPort --user=`"$dbUser`" --execute=`"CREATE DATABASE IF NOT EXISTS ``$databaseName`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`"")
        $sqlFile = Join-Path $root 'database\finanty_db.sql'
        $sql = [System.IO.File]::ReadAllText($sqlFile, [System.Text.Encoding]::UTF8)
        [void](Invoke-FinantyMysql "--host=`"$dbHost`" --port=$dbPort --user=`"$dbUser`" --database=`"$databaseName`"" $sql)
        Write-Host 'La estructura de datos quedó lista.' -ForegroundColor Green
    } else {
        Write-Host "Base $databaseName encontrada; no se modificaron sus datos." -ForegroundColor Green
    }
} else {
    Write-Host 'No encontré el cliente mysql.exe para preparar la base automáticamente.' -ForegroundColor Yellow
    Write-Host 'Si esta es la primera ejecución en esta computadora, importá database/finanty_db.sql desde phpMyAdmin.'
}

$chosenPort = $port
while (Test-Port '127.0.0.1' $chosenPort) {
    try {
        $existing = Invoke-WebRequest -Uri "http://127.0.0.1:$chosenPort/" -TimeoutSec 2
        if ($existing.Content -match 'Finanty|frontend/views/login') { Start-Process "http://127.0.0.1:$chosenPort/"; exit 0 }
    } catch { }
    $chosenPort++
    if ($chosenPort -gt ($port + 20)) { throw 'No encontré un puerto libre para abrir Finanty.' }
}

$sessionFolder = Join-Path $root 'data\sessions'
if (-not (Test-Path $sessionFolder)) { New-Item -ItemType Directory -Path $sessionFolder -Force | Out-Null }
$stdoutLog = Join-Path $root 'data\php-server.log'
$stderrLog = Join-Path $root 'data\php-server-error.log'
$arguments = "-S 127.0.0.1:$chosenPort -t `"$root`""
Start-Process -FilePath $php -ArgumentList $arguments -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog
$ready = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try { $response = Invoke-WebRequest -Uri "http://127.0.0.1:$chosenPort/" -TimeoutSec 2; if ($response.StatusCode -eq 200) { $ready = $true; break } } catch { Start-Sleep -Milliseconds 500 }
}
if (-not $ready) { throw 'PHP no respondió. Revisá los archivos data/php-server-error.log y la instalación de PHP.' }
Start-Process "http://127.0.0.1:$chosenPort/"
Write-Host "Finanty está abierto en http://127.0.0.1:$chosenPort/" -ForegroundColor Green
