@echo off
setlocal
set "FINANTY_ROOT=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%FINANTY_ROOT%ABRIR_FINANTY.ps1"
if errorlevel 1 (
  echo.
  echo Finanty no pudo iniciarse. Lee el mensaje anterior y revisa XAMPP/MySQL.
  pause
)
endlocal
