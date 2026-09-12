@echo off
setlocal

echo =============================================================
echo ESE DIGITALS G9.6 - ADVERSARIAL / PRODUCTION SMOKE TESTS
echo =============================================================
echo.

echo [1] Nigeria + remote Operations query
curl -sS -X POST "https://ese-digitals-platform.legaldept-nrc.workers.dev/api/opportunities" -H "Content-Type: application/json" --data "{\"role\":\"Operations\",\"country\":\"Nigeria\",\"skills\":[\"operations\",\"project management\"],\"remote\":\"REMOTE\",\"worldwide\":false,\"limit\":20}"
echo.
echo.

echo [2] Nigeria + on-site Workplace Operations query
curl -sS -X POST "https://ese-digitals-platform.legaldept-nrc.workers.dev/api/opportunities" -H "Content-Type: application/json" --data "{\"role\":\"Workplace Operations\",\"country\":\"Nigeria\",\"skills\":[\"facilities\",\"logistics\"],\"remote\":\"ON-SITE\",\"worldwide\":false,\"limit\":20}"
echo.
echo.

echo [3] Ghana boundary test - Nigeria-only records must not appear
curl -sS -X POST "https://ese-digitals-platform.legaldept-nrc.workers.dev/api/opportunities" -H "Content-Type: application/json" --data "{\"role\":\"Operations\",\"country\":\"Ghana\",\"skills\":[\"operations\"],\"remote\":\"REMOTE\",\"worldwide\":false,\"limit\":20}"
echo.
echo.

echo [4] Explicit worldwide permission boundary
curl -sS -X POST "https://ese-digitals-platform.legaldept-nrc.workers.dev/api/opportunities" -H "Content-Type: application/json" --data "{\"role\":\"Operations\",\"country\":\"\",\"skills\":[\"operations\"],\"remote\":\"REMOTE\",\"worldwide\":true,\"allowWorldwide\":true,\"limit\":20}"
echo.
echo.

echo [5] Database integrity counts
npx wrangler d1 execute ese-digitals-opportunities --remote --command="SELECT (SELECT COUNT(*) FROM jobs) AS jobs_count, (SELECT COUNT(*) FROM job_sources) AS source_count, (SELECT COUNT(*) FROM job_evidence) AS evidence_count;"
echo.
echo.

echo [6] Eligibility / verification / freshness distribution
npx wrangler d1 execute ese-digitals-opportunities --remote --command="SELECT eligibility_status, verification_status, freshness_status, COUNT(*) AS n FROM jobs GROUP BY eligibility_status, verification_status, freshness_status ORDER BY n DESC;"
echo.
echo.
echo G9.6 smoke tests completed. Review responses for expected boundaries and real source URLs.
endlocal
