$ErrorActionPreference = 'Stop'
$Base = 'https://ese-digitals-platform.legaldept-nrc.workers.dev'
$Api = "$Base/api/opportunities"
$Pass = 0
$Fail = 0

function Assert-True([bool]$Condition, [string]$Message) {
  if ($Condition) {
    Write-Host "PASS  $Message"
    $script:Pass++
  } else {
    Write-Host "FAIL  $Message"
    $script:Fail++
  }
}

function Read-ErrorResponse([object]$Response) {
  $body = ''
  if ($null -ne $Response) {
    try {
      $stream = $Response.GetResponseStream()
      if ($null -ne $stream) {
        $reader = New-Object System.IO.StreamReader($stream)
        try { $body = $reader.ReadToEnd() } finally { $reader.Dispose() }
      }
    } catch {
      $body = ''
    }
  }
  return $body
}

function Get-Checked([string]$Url) {
  try {
    $response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -MaximumRedirection 5
    return [pscustomobject]@{
      StatusCode = [int]$response.StatusCode
      Content = [string]$response.Content
      Headers = $response.Headers
    }
  } catch {
    $response = $_.Exception.Response
    $status = 0
    $headers = @{}
    $content = ''
    if ($null -ne $response) {
      try { $status = [int]$response.StatusCode } catch {}
      try { $headers = $response.Headers } catch {}
      $content = Read-ErrorResponse $response
    }
    return [pscustomobject]@{
      StatusCode = $status
      Content = $content
      Headers = $headers
    }
  }
}

function Invoke-ApiOnce([hashtable]$Body = $null, [hashtable]$Headers = @{}, [string]$Method = 'POST', [string]$RawBody = $null, [string]$ContentType = 'application/json') {
  $json = if ($null -ne $Body) { $Body | ConvertTo-Json -Depth 8 -Compress } else { $null }
  $request = @{
    Uri = $Api
    Method = $Method
    Headers = $Headers
    UseBasicParsing = $true
  }

  if ($null -ne $RawBody) {
    $request.ContentType = $ContentType
    $request.Body = $RawBody
  } elseif (($Method -ne 'GET') -and ($null -ne $json)) {
    $request.ContentType = 'application/json'
    $request.Body = $json
  }

  try {
    $response = Invoke-WebRequest @request
    return [pscustomobject]@{
      StatusCode = [int]$response.StatusCode
      Content = [string]$response.Content
      Headers = $response.Headers
    }
  } catch {
    $response = $_.Exception.Response
    $status = 0
    $headers = @{}
    $content = ''
    if ($null -ne $response) {
      try { $status = [int]$response.StatusCode } catch {}
      try { $headers = $response.Headers } catch {}
      $content = Read-ErrorResponse $response
    }
    return [pscustomobject]@{
      StatusCode = $status
      Content = $content
      Headers = $headers
    }
  }
}

function Invoke-Api([hashtable]$Body = $null, [hashtable]$Headers = @{}, [string]$Method = 'POST', [string]$RawBody = $null, [string]$ContentType = 'application/json') {
  $response = Invoke-ApiOnce -Body $Body -Headers $Headers -Method $Method -RawBody $RawBody -ContentType $ContentType
  if ($response.StatusCode -eq 429) {
    Write-Host 'INFO  Production rate limit encountered; waiting 61 seconds before retry.'
    Start-Sleep -Seconds 61
    $response = Invoke-ApiOnce -Body $Body -Headers $Headers -Method $Method -RawBody $RawBody -ContentType $ContentType
  }
  return $response
}

function Get-JsonBody([object]$Response) {
  if ($null -eq $Response -or [string]::IsNullOrWhiteSpace([string]$Response.Content)) { return $null }
  try { return ([string]$Response.Content | ConvertFrom-Json) } catch { return $null }
}

Write-Host '============================================================='
Write-Host 'ESE DIGITALS — G9 VERIFICATION WAVE'
Write-Host 'G9.5 closure | G9.10 | G9.11 | G9.12 | G9.13 | G9.14 | G9.16'
Write-Host '============================================================='
Write-Host "Base: $Base"
Write-Host ''

# G9.10 / G9.11 — public routes, links, metadata
$routes = @('/', '/engine/', '/project/', '/thinking/', '/thinking/article/')
foreach ($route in $routes) {
  $r = Get-Checked ($Base + $route)
  Assert-True ($r.StatusCode -eq 200) "GET $route returns 200"
  Assert-True ($r.Content -match '<title>[^<]+</title>') "$route has a title"
  Assert-True ($r.Content -match 'rel="canonical"') "$route has a canonical link"
}

$homePage = Get-Checked ($Base + '/')
$enginePage = Get-Checked ($Base + '/engine/')
$projectPage = Get-Checked ($Base + '/project/')
$thinkingPage = Get-Checked ($Base + '/thinking/')
$articlePage = Get-Checked ($Base + '/thinking/article/')

Assert-True ($homePage.Content -match '/engine/' -and $homePage.Content -match '/project/' -and $homePage.Content -match '/thinking/' -and $homePage.Content -match '/thinking/article/') 'Home exposes core internal CTA/navigation links'
Assert-True ($enginePage.Content -match '/project/' -and $enginePage.Content -match '/engine/') 'Engine exposes project/next-action links'
Assert-True ($projectPage.Content -match '/engine/' -and $projectPage.Content -match '/thinking/') 'Project exposes Engine and Thinking CTAs'
Assert-True ($thinkingPage.Content -match '/thinking/article/' -and $thinkingPage.Content -match '/engine/') 'Thinking exposes flagship article and Engine links'
Assert-True ($articlePage.Content -match '/engine/' -and $articlePage.Content -match '/project/') 'Article exposes Engine and Project CTAs'
Assert-True ($articlePage.Content -match 'og:title' -and $articlePage.Content -match 'og:description') 'Article has social metadata'

$robots = Get-Checked ($Base + '/robots.txt')
$sitemap = Get-Checked ($Base + '/sitemap.xml')
Assert-True ($robots.StatusCode -eq 200 -and $robots.Content -match 'Sitemap:') 'robots.txt is live and points to sitemap'
Assert-True ($sitemap.StatusCode -eq 200 -and $sitemap.Content -match '/engine/' -and $sitemap.Content -match '/thinking/article/') 'sitemap.xml lists indexable public routes'

# G9.12 — security headers and asset boundary
$rootHeaders = $homePage.Headers
Assert-True ([bool]$rootHeaders['Content-Security-Policy']) 'Content-Security-Policy is present'
Assert-True ([bool]$rootHeaders['Strict-Transport-Security']) 'Strict-Transport-Security is present'
Assert-True ($rootHeaders['X-Content-Type-Options'] -match 'nosniff') 'X-Content-Type-Options is nosniff'
Assert-True ($rootHeaders['X-Frame-Options'] -match 'DENY') 'X-Frame-Options is DENY'
Assert-True ([bool]$rootHeaders['Referrer-Policy']) 'Referrer-Policy is present'
Assert-True ([bool]$rootHeaders['Permissions-Policy']) 'Permissions-Policy is present'

$privatePaths = @(
  '/worker.js', '/wrangler.jsonc', '/.assetsignore', '/.gitattributes',
  '/src/opportunity/d1Engine.js', '/src/opportunity/d1Repository.js',
  '/scripts/g9.6_verified_seed.sql', '/migrations/0001_phase4_opportunity_core.sql',
  '/docs/G9.6_D1_FREE_FIRST_IMPLEMENTATION.md'
)
foreach ($path in $privatePaths) {
  $r = Get-Checked ($Base + $path)
  Assert-True ($r.StatusCode -eq 404) "Public asset boundary blocks $path (HTTP $($r.StatusCode))"
}

# G9.16 — API contract and adversarial boundaries
$r = Invoke-Api -Method 'GET'
$status = $r.StatusCode
if ($status -eq 0) {
  # PowerShell 5.1 can hide non-2xx status from the exception object; curl provides a direct status proof.
  $curlStatus = & curl.exe -sS -o NUL -w "%{http_code}" $Api
  $status = [int]$curlStatus
}
Assert-True ($status -eq 405) "GET /api/opportunities rejected (HTTP $status)"

$r = Invoke-Api -Method 'POST' -RawBody 'hello' -ContentType 'text/plain'
Assert-True ($r.StatusCode -eq 415) "Non-JSON content rejected (HTTP $($r.StatusCode))"

$r = Invoke-Api -Method 'POST' -RawBody '{bad-json' -ContentType 'application/json'
Assert-True ($r.StatusCode -eq 400) "Invalid JSON rejected (HTTP $($r.StatusCode))"

$r = Invoke-Api -Body @{}
Assert-True ($r.StatusCode -eq 400) "Empty search intent rejected (HTTP $($r.StatusCode))"

$oversized = ('A' * 21000)
$r = Invoke-Api -Method 'POST' -RawBody ('{"role":"' + $oversized + '"}') -ContentType 'application/json'
Assert-True ($r.StatusCode -eq 400) "Oversized request rejected (HTTP $($r.StatusCode))"

$r = Invoke-Api -Body @{ role = 'Operations'; country = 'Nigeria'; skills = @('operations'); remote = 'REMOTE'; worldwide = $false; limit = 20 } -Headers @{ Origin = 'https://evil.example' }
Assert-True ($r.StatusCode -eq 403) "Unapproved browser origin rejected (HTTP $($r.StatusCode))"

$core = Invoke-Api -Body @{ role = 'Operations'; country = 'Nigeria'; skills = @('operations'); remote = 'REMOTE'; worldwide = $false; allowWorldwide = $false; limit = 20 }
$coreBody = Get-JsonBody $core
Assert-True ($core.StatusCode -eq 200 -and $coreBody.ok -eq $true) 'Nigeria remote Operations query succeeds'
Assert-True (($coreBody.results | Measure-Object).Count -ge 1) 'Nigeria remote Operations query returns at least one result'
Assert-True (($coreBody.results | Where-Object { $_.eligibilityStatus -notin @('CONFIRMED','ELIGIBLE') }).Count -eq 0) 'Returned results have eligible status only'
Assert-True (($coreBody.results | Where-Object { $_.verificationStatus -notin @('VERIFIED','CONFIRMED') }).Count -eq 0) 'Returned results have verified/confirmed status only'
Assert-True (($coreBody.results | Where-Object { $_.freshnessStatus -notin @('CURRENT','FRESH') }).Count -eq 0) 'Returned results have current/fresh status only'
Assert-True (($coreBody.results | Where-Object { $_.applicationUrl -notmatch '^https://' }).Count -eq 0) 'Returned application URLs are HTTPS'

$forbiddenKeys = @('job_id','source_id','source_type','source_name','eligibility_reason','work_authorization','timezone','match_keywords')
$leaks = @()
foreach ($item in $coreBody.results) {
  foreach ($key in $forbiddenKeys) {
    if ($item.PSObject.Properties.Name -contains $key) { $leaks += $key }
  }
}
Assert-True ($leaks.Count -eq 0) 'Public result objects do not expose internal control-plane fields'
Assert-True ($coreBody.safety.privateDataExposed -eq $false -and $coreBody.safety.credentialsExposed -eq $false -and $coreBody.safety.applicationAutomation -eq $false) 'Safety flags remain fail-closed'

$ghana = Invoke-Api -Body @{ role = 'Operations'; country = 'Ghana'; skills = @('operations'); remote = 'REMOTE'; worldwide = $false; limit = 20 }
$ghanaBody = Get-JsonBody $ghana
Assert-True (($ghana.StatusCode -eq 200) -and (($ghanaBody.results | Measure-Object).Count -eq 0)) 'Ghana boundary returns no Nigeria-only eligible results'

$onsite = Invoke-Api -Body @{ role = 'Workplace Operations'; country = 'Nigeria'; skills = @('facilities','logistics'); remote = 'ON-SITE'; worldwide = $false; limit = 20 }
$onsiteBody = Get-JsonBody $onsite
Assert-True (($onsite.StatusCode -eq 200) -and (($onsiteBody.results | Where-Object { $_.remoteType -ne 'ON-SITE' }).Count -eq 0)) 'On-site boundary does not return remote results'

$world = Invoke-Api -Body @{ role = 'Operations'; country = ''; skills = @('operations'); remote = 'REMOTE'; worldwide = $true; allowWorldwide = $true; limit = 20 }
$worldBody = Get-JsonBody $world
Assert-True ($world.StatusCode -eq 200 -and $worldBody.ok -eq $true) 'Explicit worldwide query succeeds only with explicit permission'

$implicitWorld = Invoke-Api -Body @{ role = 'Operations'; country = ''; skills = @('operations'); worldwide = $true; allowWorldwide = $false; limit = 20 }
$implicitBody = Get-JsonBody $implicitWorld
Assert-True ($implicitWorld.StatusCode -eq 400 -and $null -ne $implicitBody -and $implicitBody.error -eq 'WORLDWIDE_PERMISSION_REQUIRED') 'Implicit worldwide expansion is rejected'

Write-Host ''
Write-Host "TOTAL PASS: $Pass"
Write-Host "TOTAL FAIL: $Fail"
if ($Fail -gt 0) { exit 1 }
Write-Host 'G9 verification wave completed successfully.'
exit 0
