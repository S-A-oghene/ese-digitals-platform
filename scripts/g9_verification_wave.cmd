@echo off
setlocal
cd /d "%~dp0.."

echo =============================================================
echo ESE DIGITALS — G9 VERIFICATION WAVE
echo =============================================================
echo.
echo This runs the production verification suite for:
echo G9.5 closure ^| G9.10 ^| G9.11 ^| G9.12 ^| G9.13 ^| G9.14 ^| G9.16

echo.
echo [0] Wrangler dry-run build validation
call npx wrangler deploy --dry-run
if errorlevel 1 (
  echo FAIL  Wrangler dry-run failed.
  exit /b 1
)

echo.
echo [1] Production + API verification
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0g9_verification_wave.ps1"
set "RC=%ERRORLEVEL%"

echo.
if not "%RC%"=="0" (
  echo VERIFICATION WAVE RESULT: FAIL
  exit /b %RC%
)

echo VERIFICATION WAVE RESULT: PASS
endlocal
exit /b 0
