@echo off
setlocal

echo ================================================================
echo ESE DIGITALS G9.6 - LOAD VERIFIED OPPORTUNITY SEED
 echo ================================================================
echo.
echo This is a controlled/admin ingestion action.
echo It writes only the verified seed in scripts\g9.6_verified_seed.sql.
echo.

npx wrangler d1 execute ese-digitals-opportunities --remote --file=scripts\g9.6_verified_seed.sql
if errorlevel 1 (
  echo.
  echo VERIFIED SEED LOAD FAILED.
  exit /b 1
)

echo.
echo Verified seed loaded successfully.
echo.
echo Next checks:
echo npx wrangler d1 execute ese-digitals-opportunities --remote --command="SELECT COUNT(*) AS jobs_count FROM jobs;"
echo npx wrangler d1 execute ese-digitals-opportunities --remote --command="SELECT COUNT(*) AS evidence_count FROM job_evidence;"
echo npx wrangler d1 execute ese-digitals-opportunities --remote --command="SELECT COUNT(*) AS source_count FROM job_sources;"
endlocal
