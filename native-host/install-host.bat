@echo off
:: ============================================================
:: ZentyRecon — Windows Native Messaging Host Registry Installer
:: Registers com.ctar.zentyquetry.host for Chrome, Edge, and Brave
:: ============================================================

set SCRIPT_DIR=%~dp0
set MANIFEST_PATH=%SCRIPT_DIR%com.ctar.zentyquetry.host.json

echo 🛡️ Registering ZentyRecon Native Messaging Host...
echo Manifest Path: %MANIFEST_PATH%

:: 1. Google Chrome
REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.ctar.zentyquetry.host" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f
if %ERRORLEVEL% EQU 0 (
    echo [✓] Google Chrome registered successfully!
)

:: 2. Microsoft Edge
REG ADD "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.ctar.zentyquetry.host" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f
if %ERRORLEVEL% EQU 0 (
    echo [✓] Microsoft Edge registered successfully!
)

:: 3. Brave Browser
REG ADD "HKCU\Software\BraveSoftware\Brave-Browser\NativeMessagingHosts\com.ctar.zentyquetry.host" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f
if %ERRORLEVEL% EQU 0 (
    echo [✓] Brave Browser registered successfully!
)

echo.
echo 🎉 Registration complete! ZentyRecon can now communicate directly with ZentyQuetry Desktop.
pause
