@echo off
setlocal

echo ================================================
echo ESE DIGITALS G9.6 - VERIFIED OPPORTUNITY INGESTION
echo ================================================
echo.
echo This is an admin-controlled seed loader.
echo It writes only the checked-in, evidence-backed opportunities.
echo It is NOT exposed through the public Worker.
echo.

npx wrangler d1 execute ese-digitals-opportunities --remote --file=scripts\g9.6_verified_seed.sql
if errorlevel 1 (
  echo.
  echo VERIFIED SEED INGESTION FAILED.
  exit /b 1
)

echo.
echo Verifying ingestion counts...
npx wrangler d1 execute ese-digitals-opportunities --remote --command="SELECT (SELECT COUNT(*) FROM jobs) AS jobs, (SELECT COUNT(*) FROM job_sources) AS sources, (SELECT COUNT(*) FROM job_evidence) AS evidence;"
if errorlevel 1 exit /b 1

echo.
echo Verified seed ingestion completed.
endlocal
