@echo off
setlocal

echo ================================================
echo ESE DIGITALS G9.6 - D1 BOOTSTRAP
echo ================================================
echo.

echo [1/2] Creating remote D1 database and Worker binding...
npx wrangler d1 create ese-digitals-opportunities --binding OPPORTUNITY_DB --use-remote --update-config
if errorlevel 1 (
  echo.
  echo D1 creation/configuration failed.
  exit /b 1
)

echo.
echo [2/2] Applying remote D1 migrations...
npx wrangler d1 migrations apply ese-digitals-opportunities --remote
if errorlevel 1 (
  echo.
  echo D1 migration failed.
  exit /b 1
)

echo.
echo D1 bootstrap completed.
echo Next verification command:
echo npx wrangler d1 execute ese-digitals-opportunities --remote --command="SELECT name FROM sqlite_master WHERE type IN ('table','view') ORDER BY name;"
endlocal
